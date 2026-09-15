import { AgencyProfile } from '../types/agency';
import {
  CustomRoleDefinition,
  ClientContractRecord,
  InvoiceRecord,
  PaymentRecord,
  ExpenseRecord,
  CapitalContributionRecord,
  PartnerEquityRecord,
  IpOwnershipRecord,
  AssetRecord,
  DebtRecord,
  TaxFilingRecord
} from '../types/partnership';
import { SavedDocument } from '../types/documents';
import { Freelancer } from '../types/freelancers';
import { ClientAccount } from '../types/client';
import { Task } from '../types/tasks';
import { requireSupabase } from './supabase';

type Row = Record<string, any>;

// Only send columns that exist in the table; UI objects carry extra fields.
const pick = (source: Row, columns: readonly string[]): Row => {
  const out: Row = {};
  for (const col of columns) {
    if (source[col] !== undefined) out[col] = source[col];
  }
  return out;
};

const fail = (context: string, error: { message: string }): never => {
  throw new Error(`${context}: ${error.message}`);
};

const selectAll = async <T>(table: string, orderBy: string, ascending = false): Promise<T[]> => {
  const { data, error } = await requireSupabase().from(table).select('*').order(orderBy, { ascending });
  if (error) fail(`Load ${table}`, error);
  return (data || []) as T[];
};

const insertRow = async (table: string, row: Row) => {
  const { error } = await requireSupabase().from(table).insert(row);
  if (error) fail(`Create ${table}`, error);
};

const upsertRow = async (table: string, row: Row) => {
  const { error } = await requireSupabase().from(table).upsert(row);
  if (error) fail(`Save ${table}`, error);
};

const updateRow = async (table: string, key: string, id: string, patch: Row) => {
  const { data, error } = await requireSupabase().from(table).update(patch).eq(key, id).select(key);
  if (error) fail(`Update ${table}`, error);
  if (!data || data.length === 0) {
    throw new Error(`Update ${table}: no row changed (record missing or not permitted)`);
  }
};

const deleteRow = async (table: string, key: string, id: string) => {
  const { error } = await requireSupabase().from(table).delete().eq(key, id);
  if (error) fail(`Delete ${table}`, error);
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const resolveLoginEmail = async (identifier: string): Promise<string | null> => {
  if (identifier.includes('@')) return identifier;
  const { data, error } = await requireSupabase().rpc('resolve_login_email', { identifier });
  if (error) fail('Resolve username', error);
  return (data as string | null) || null;
};

export const fetchStaffByAuthId = async (authUserId: string): Promise<Freelancer | null> => {
  const { data, error } = await requireSupabase()
    .from('users').select('*').eq('auth_user_id', authUserId).maybeSingle();
  if (error) fail('Load account', error);
  return data ? rowToFreelancer(data) : null;
};

export const fetchClientByAuthId = async (authUserId: string): Promise<ClientAccount | null> => {
  const { data, error } = await requireSupabase()
    .from('clients').select('*').eq('auth_user_id', authUserId).maybeSingle();
  if (error) fail('Load client account', error);
  return data ? rowToClient(data) : null;
};

export const completePasswordChangeApi = async () => {
  const { error } = await requireSupabase().rpc('complete_password_change');
  if (error) fail('Complete password change', error);
};

export const recordLoginApi = async () => {
  const { error } = await requireSupabase().rpc('record_login');
  if (error) fail('Record login', error);
};

export const updateOwnAccountApi = async (name: string, username: string) => {
  const { error } = await requireSupabase().rpc('update_own_account', { p_name: name, p_username: username });
  if (error) fail('Update account', error);
};

// Server-side login management (Edge Function holds the service role key).
const callAdminUsers = async (body: { action: 'provision' | 'delete'; kind: 'user' | 'client'; id: string }) => {
  const { data, error } = await requireSupabase().functions.invoke('admin-users', { body });
  if (error) {
    let message = error.message;
    try {
      const detail = await (error as any).context?.json?.();
      if (detail?.error) message = detail.error;
    } catch {
      // keep generic message
    }
    throw new Error(`Account service (admin-users Edge Function): ${message}`);
  }
  return data as { success: boolean; temporaryPassword?: string };
};

export const provisionLoginApi = async (kind: 'user' | 'client', id: string): Promise<string> => {
  const res = await callAdminUsers({ action: 'provision', kind, id });
  if (!res?.temporaryPassword) throw new Error('Account service did not return a temporary password');
  return res.temporaryPassword;
};

export const deleteAccountApi = async (kind: 'user' | 'client', id: string) => {
  await callAdminUsers({ action: 'delete', kind, id });
};

// ---------------------------------------------------------------------------
// 1. Agency profile
// ---------------------------------------------------------------------------

const PROFILE_COLUMNS = [
  'name', 'tagline', 'email', 'phone', 'website', 'address', 'cityStateZip', 'country', 'taxId',
  'logoUrl', 'defaultCurrency', 'currencySymbol', 'bankDetails', 'primarySigner', 'signatureStore'
] as const;

let profileRowId = 'firm-profile-1';

export const fetchAgencyProfileApi = async (): Promise<AgencyProfile | null> => {
  const { data, error } = await requireSupabase().from('agency_profile').select('*').limit(1).maybeSingle();
  if (error) fail('Load agency profile', error);
  if (!data) return null;
  profileRowId = data.id;
  const profile = pick(data, PROFILE_COLUMNS) as AgencyProfile;
  if (!profile.logoUrl) delete profile.logoUrl;
  return profile;
};

export const updateAgencyProfileApi = async (profile: AgencyProfile) => {
  await upsertRow('agency_profile', {
    ...pick(profile, PROFILE_COLUMNS),
    id: profileRowId,
    updatedAt: new Date().toISOString()
  });
};

// ---------------------------------------------------------------------------
// 2. Roles
// ---------------------------------------------------------------------------

const ROLE_COLUMNS = ['id', 'name', 'description', 'level', 'isSystem', 'permissions', 'createdAt'] as const;

export const fetchRolesApi = () => selectAll<CustomRoleDefinition>('custom_roles', 'level');

export const createRoleApi = async (role: Partial<CustomRoleDefinition>) => {
  const id = role.id || `role-${role.name?.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
  const record = { ...pick(role, ROLE_COLUMNS), id, isSystem: false, createdAt: new Date().toISOString() };
  const { data, error } = await requireSupabase().from('custom_roles').insert(record).select().single();
  if (error) fail('Create role', error);
  return data as CustomRoleDefinition;
};

export const updateRoleApi = (id: string, role: Partial<CustomRoleDefinition>) =>
  updateRow('custom_roles', 'id', id, pick(role, ROLE_COLUMNS));

// ---------------------------------------------------------------------------
// 3. Team members
// ---------------------------------------------------------------------------

const USER_COLUMNS = [
  'id', 'name', 'email', 'avatarUrl', 'role', 'roleLevel', 'accessLevel', 'status', 'paymentType',
  'paymentAmount', 'hourlyRate', 'currency', 'skills', 'joinedDate', 'username', 'mustChangePassword',
  'generatedAt', 'notes'
] as const;

const rowToFreelancer = (row: Row): Freelancer => ({
  id: row.id,
  name: row.name,
  email: row.email,
  avatarUrl: row.avatarUrl || undefined,
  role: row.role,
  roleLevel: row.roleLevel,
  accessLevel: row.accessLevel,
  paymentType: row.paymentType || 'fixed',
  paymentAmount: Number(row.paymentAmount) || 0,
  hourlyRate: Number(row.hourlyRate) || 0,
  currency: row.currency || 'USD',
  status: row.status,
  skills: Array.isArray(row.skills) ? row.skills : [],
  joinedDate: row.joinedDate || '',
  hasLogin: Boolean(row.auth_user_id),
  credentials: {
    username: row.username,
    mustChangePassword: Boolean(row.mustChangePassword),
    generatedAt: row.generatedAt || '',
    lastLoginAt: row.lastLoginAt || undefined
  },
  notes: row.notes || undefined
});

const freelancerToRow = (f: Freelancer): Row => pick({
  ...f,
  username: f.credentials?.username,
  mustChangePassword: f.credentials?.mustChangePassword,
  generatedAt: f.credentials?.generatedAt || undefined
}, USER_COLUMNS);

export const fetchUsersApi = async (): Promise<Freelancer[]> =>
  (await selectAll<Row>('users', 'roleLevel')).map(rowToFreelancer);

export const createUserApi = (user: Freelancer) => insertRow('users', freelancerToRow(user));

export const updateUserApi = (user: Freelancer) => {
  const { id, ...patch } = freelancerToRow(user);
  return updateRow('users', 'id', user.id, patch);
};

// ---------------------------------------------------------------------------
// 4. Clients
// ---------------------------------------------------------------------------

const CLIENT_COLUMNS = [
  'id', 'companyName', 'contactName', 'contactTitle', 'email', 'phone', 'address', 'avatarUrl',
  'username', 'mustChangePassword', 'generatedAt', 'orders', 'sharedDocumentIds', 'notes', 'createdAt'
] as const;

const rowToClient = (row: Row): ClientAccount => ({
  id: row.id,
  companyName: row.companyName,
  contactName: row.contactName,
  contactTitle: row.contactTitle || '',
  email: row.email,
  phone: row.phone || undefined,
  address: row.address || undefined,
  avatarUrl: row.avatarUrl || undefined,
  hasLogin: Boolean(row.auth_user_id),
  credentials: {
    username: row.username,
    mustChangePassword: Boolean(row.mustChangePassword),
    generatedAt: row.generatedAt || '',
    lastLoginAt: row.lastLoginAt || undefined
  },
  orders: Array.isArray(row.orders) ? row.orders : [],
  sharedDocumentIds: Array.isArray(row.sharedDocumentIds) ? row.sharedDocumentIds : [],
  notes: row.notes || undefined,
  createdAt: row.createdAt
});

const clientToRow = (c: ClientAccount): Row => pick({
  ...c,
  username: c.credentials?.username,
  mustChangePassword: c.credentials?.mustChangePassword,
  generatedAt: c.credentials?.generatedAt || undefined
}, CLIENT_COLUMNS);

export const fetchClientsApi = async (): Promise<ClientAccount[]> =>
  (await selectAll<Row>('clients', 'companyName', true)).map(rowToClient);

export const createClientApi = (client: ClientAccount) => insertRow('clients', clientToRow(client));

export const updateClientApi = (id: string, patch: Partial<ClientAccount>) =>
  updateRow('clients', 'id', id, pick(patch, CLIENT_COLUMNS));

// ---------------------------------------------------------------------------
// 5-14. Partnership ledgers
// ---------------------------------------------------------------------------

const CONTRACT_COLUMNS = [
  'id', 'contractNumber', 'title', 'clientId', 'clientName', 'type', 'contractValue', 'currency',
  'startDate', 'endDate', 'signedDate', 'partnerInCharge', 'status', 'attachedDocId', 'termsSummary',
  'ipOwnershipClause', 'createdAt', 'updatedAt'
] as const;

export const fetchContractsApi = () => selectAll<ClientContractRecord>('contracts', 'startDate');
export const createContractApi = (r: ClientContractRecord) => insertRow('contracts', pick(r, CONTRACT_COLUMNS));
export const updateContractApi = (id: string, r: Partial<ClientContractRecord>) =>
  updateRow('contracts', 'id', id, { ...pick(r, CONTRACT_COLUMNS), updatedAt: new Date().toISOString() });
export const deleteContractApi = (id: string) => deleteRow('contracts', 'id', id);

const INVOICE_COLUMNS = [
  'id', 'invoiceNumber', 'clientId', 'clientName', 'contractId', 'issueDate', 'dueDate', 'items',
  'subtotal', 'taxPercent', 'taxAmount', 'discountAmount', 'grandTotal', 'paidAmount', 'status',
  'paymentTerms', 'notes', 'createdAt', 'updatedAt'
] as const;

export const fetchInvoicesApi = () => selectAll<InvoiceRecord>('invoices', 'issueDate');
export const createInvoiceApi = (r: InvoiceRecord) => insertRow('invoices', pick(r, INVOICE_COLUMNS));
export const updateInvoiceApi = (id: string, r: Partial<InvoiceRecord>) =>
  updateRow('invoices', 'id', id, { ...pick(r, INVOICE_COLUMNS), updatedAt: new Date().toISOString() });
export const deleteInvoiceApi = (id: string) => deleteRow('invoices', 'id', id);

const PAYMENT_COLUMNS = [
  'id', 'paymentNumber', 'invoiceId', 'contractId', 'clientId', 'clientName', 'amount', 'currency',
  'paymentDate', 'paymentMethod', 'transactionRef', 'depositingBank', 'receiptDocId', 'notes',
  'recordedBy', 'createdAt'
] as const;

export const fetchPaymentsApi = () => selectAll<PaymentRecord>('payments', 'paymentDate');
export const createPaymentApi = (r: PaymentRecord) => insertRow('payments', pick(r, PAYMENT_COLUMNS));
export const deletePaymentApi = (id: string) => deleteRow('payments', 'id', id);

const EXPENSE_COLUMNS = [
  'id', 'expenseNumber', 'title', 'category', 'vendor', 'amount', 'currency', 'date', 'paidBy',
  'reimbursementStatus', 'taxDeductible', 'receiptAttachmentName', 'notes', 'recordedBy', 'createdAt'
] as const;

export const fetchExpensesApi = () => selectAll<ExpenseRecord>('expenses', 'date');
export const createExpenseApi = (r: ExpenseRecord) => insertRow('expenses', pick(r, EXPENSE_COLUMNS));
export const deleteExpenseApi = (id: string) => deleteRow('expenses', 'id', id);

const CAPITAL_COLUMNS = [
  'id', 'partnerName', 'partnerId', 'amount', 'currency', 'date', 'contributionType', 'transactionRef',
  'bankAccount', 'notes', 'createdAt'
] as const;

export const fetchCapitalContributionsApi = () => selectAll<CapitalContributionRecord>('capital_contributions', 'date');
export const createCapitalContributionApi = (r: CapitalContributionRecord) =>
  insertRow('capital_contributions', pick(r, CAPITAL_COLUMNS));

const EQUITY_COLUMNS = [
  'partnerName', 'designation', 'email', 'ownershipPercentage', 'profitSharePercentage',
  'initialCapitalContribution', 'totalContributed', 'totalDrawings', 'netCapitalBalance', 'signatureImage'
] as const;

export const fetchEquityApi = () => selectAll<PartnerEquityRecord>('partner_equity', 'ownershipPercentage');
export const updateEquityApi = (partnerId: string, r: Partial<PartnerEquityRecord>) =>
  updateRow('partner_equity', 'partnerId', partnerId, { ...pick(r, EQUITY_COLUMNS), lastUpdated: new Date().toISOString() });

const IP_COLUMNS = [
  'id', 'title', 'repositoryUrl', 'commitHashOrVersion', 'ownershipType', 'clientAssignmentId',
  'clientName', 'primaryAuthorPartner', 'registrationDate', 'legalStatus', 'licenseTerms', 'summary', 'createdAt'
] as const;

export const fetchIpRegistryApi = () => selectAll<IpOwnershipRecord>('ip_ownership', 'createdAt');
export const createIpRecordApi = (r: IpOwnershipRecord) => insertRow('ip_ownership', pick(r, IP_COLUMNS));
export const updateIpRecordApi = (id: string, r: Partial<IpOwnershipRecord>) =>
  updateRow('ip_ownership', 'id', id, pick(r, IP_COLUMNS));
export const deleteIpRecordApi = (id: string) => deleteRow('ip_ownership', 'id', id);

const ASSET_COLUMNS = [
  'id', 'assetNumber', 'name', 'category', 'purchaseDate', 'purchaseCost', 'currentBookValue',
  'depreciationRatePercent', 'assignedTo', 'serialNumberOrKey', 'condition', 'notes', 'createdAt', 'updatedAt'
] as const;

export const fetchAssetsApi = () => selectAll<AssetRecord>('assets', 'createdAt');
export const createAssetApi = (r: AssetRecord) => insertRow('assets', pick(r, ASSET_COLUMNS));
export const updateAssetApi = (id: string, r: Partial<AssetRecord>) =>
  updateRow('assets', 'id', id, { ...pick(r, ASSET_COLUMNS), updatedAt: new Date().toISOString() });
export const deleteAssetApi = (id: string) => deleteRow('assets', 'id', id);

const DEBT_COLUMNS = [
  'id', 'debtNumber', 'creditor', 'debtType', 'principalAmount', 'currentBalance', 'interestRatePercent',
  'repaymentTermMonths', 'monthlyPayment', 'startDate', 'maturityDate', 'status', 'notes', 'createdAt', 'updatedAt'
] as const;

export const fetchDebtsApi = () => selectAll<DebtRecord>('debts', 'createdAt');
export const createDebtApi = (r: DebtRecord) => insertRow('debts', pick(r, DEBT_COLUMNS));
export const updateDebtApi = (id: string, r: Partial<DebtRecord>) =>
  updateRow('debts', 'id', id, { ...pick(r, DEBT_COLUMNS), updatedAt: new Date().toISOString() });
export const deleteDebtApi = (id: string) => deleteRow('debts', 'id', id);

const TAX_COLUMNS = [
  'id', 'filingNumber', 'taxType', 'title', 'fiscalYear', 'periodOrQuarter', 'dueDate', 'filingDate',
  'ackNumberOrArn', 'taxLiabilityAmount', 'taxPaidAmount', 'status', 'signedByPartner', 'auditorNotes',
  'createdAt', 'updatedAt'
] as const;

export const fetchTaxFilingsApi = () => selectAll<TaxFilingRecord>('tax_filings', 'dueDate');
export const createTaxFilingApi = (r: TaxFilingRecord) => insertRow('tax_filings', pick(r, TAX_COLUMNS));
export const updateTaxFilingApi = (id: string, r: Partial<TaxFilingRecord>) =>
  updateRow('tax_filings', 'id', id, { ...pick(r, TAX_COLUMNS), updatedAt: new Date().toISOString() });
export const deleteTaxFilingApi = (id: string) => deleteRow('tax_filings', 'id', id);

// ---------------------------------------------------------------------------
// 15. Documents
// ---------------------------------------------------------------------------

const DOCUMENT_COLUMNS = [
  'id', 'type', 'title', 'docNumber', 'createdAt', 'updatedAt', 'clientName', 'clientId', 'status',
  'payload', 'agencySnapshot', 'sharedWithClient', 'sharedAt', 'clientNotes'
] as const;

export const fetchDocumentsApi = () => selectAll<SavedDocument>('documents', 'updatedAt');
export const saveDocumentApi = (doc: SavedDocument) => upsertRow('documents', pick(doc, DOCUMENT_COLUMNS));
export const deleteDocumentApi = (id: string) => deleteRow('documents', 'id', id);

export const deleteAllDocumentsApi = async () => {
  const { error } = await requireSupabase().from('documents').delete().not('id', 'is', null);
  if (error) fail('Delete documents', error);
};

// ---------------------------------------------------------------------------
// 16. Tasks
// ---------------------------------------------------------------------------

const TASK_COLUMNS = [
  'id', 'title', 'description', 'freelancerId', 'freelancerName', 'assignedBy', 'projectName', 'clientName',
  'priority', 'status', 'dueDate', 'estimatedHours', 'actualHours', 'deliverables', 'createdAt', 'updatedAt'
] as const;

export const fetchTasksApi = async (): Promise<Task[]> =>
  (await selectAll<Row>('tasks', 'createdAt')).map((row) => ({
    ...row,
    description: row.description || '',
    projectName: row.projectName || '',
    assignedBy: row.assignedBy || '',
    freelancerName: row.freelancerName || '',
    deliverables: Array.isArray(row.deliverables) ? row.deliverables : [],
    updatedAt: row.updatedAt || row.createdAt
  }) as Task);

export const createTaskApi = (task: Task) => insertRow('tasks', pick(task, TASK_COLUMNS));
export const updateTaskApi = (id: string, patch: Partial<Task>) =>
  updateRow('tasks', 'id', id, { ...pick(patch, TASK_COLUMNS), updatedAt: new Date().toISOString() });
export const deleteTaskApi = (id: string) => deleteRow('tasks', 'id', id);
