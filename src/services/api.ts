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
import { supabase, isSupabaseConfigured } from './supabase';

// Helper to ensure Supabase client exists
function getClient() {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }
  return supabase;
}

// 1. Profile
export const fetchAgencyProfileApi = async (): Promise<AgencyProfile | null> => {
  const client = getClient();
  if (!client) return null;
  const { data, error } = await client.from('agency_profile').select('*').limit(1).maybeSingle();
  if (error) {
    console.error('Supabase fetchAgencyProfile error:', error.message);
    return null;
  }
  return data as AgencyProfile | null;
};

export const updateAgencyProfileApi = async (profile: AgencyProfile) => {
  const client = getClient();
  if (!client) return { success: false, error: 'Supabase not configured' };
  const { error } = await client.from('agency_profile').upsert(profile);
  if (error) throw new Error(error.message);
  return { success: true, updatedAt: new Date().toISOString() };
};

// 2. Roles
export const fetchRolesApi = async (): Promise<CustomRoleDefinition[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('custom_roles').select('*').order('level', { ascending: false });
  if (error) {
    console.error('Supabase fetchRoles error:', error.message);
    return [];
  }
  return (data || []) as CustomRoleDefinition[];
};

export const createRoleApi = async (role: Partial<CustomRoleDefinition>, _actorLevel: number) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = role.id || `role-${role.name?.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
  const newRecord = { ...role, id, isSystem: false, createdAt: new Date().toISOString() };
  const { data, error } = await client.from('custom_roles').insert(newRecord).select().single();
  if (error) throw new Error(error.message);
  return data as CustomRoleDefinition;
};

export const updateRoleApi = async (id: string, role: Partial<CustomRoleDefinition>, _actorLevel: number) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('custom_roles').update(role).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 3. Users / Team
export const fetchUsersApi = async (): Promise<Freelancer[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('users').select('*').order('roleLevel', { ascending: false });
  if (error) {
    console.error('Supabase fetchUsers error:', error.message);
    return [];
  }
  return (data || []) as unknown as Freelancer[];
};

export const createUserApi = async (user: any, _actorLevel: number) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = user.id || `usr-${Date.now().toString(36)}`;
  const { error } = await client.from('users').insert({ ...user, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const updateUserApi = async (id: string, user: any, _actorLevel: number) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { data, error } = await client.from('users').update(user).eq('id', id).select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    const { error: upsertErr } = await client.from('users').upsert({ ...user, id });
    if (upsertErr) throw new Error(upsertErr.message);
  }
  return { success: true, id };
};

export const deleteUserApi = async (id: string, _actorLevel: number) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('users').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 4. Clients
export const fetchClientsApi = async (): Promise<ClientAccount[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('clients').select('*').order('companyName', { ascending: true });
  if (error) {
    console.error('Supabase fetchClients error:', error.message);
    return [];
  }
  return (data || []) as unknown as ClientAccount[];
};

export const createClientApi = async (newClient: any) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = newClient.id || `client-${Date.now().toString(36)}`;
  const { error } = await client.from('clients').insert({ ...newClient, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const updateClientApi = async (id: string, updatedClient: any) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('clients').update(updatedClient).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const deleteClientApi = async (id: string) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('clients').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 5. Contracts
export const fetchContractsApi = async (): Promise<ClientContractRecord[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('contracts').select('*').order('startDate', { ascending: false });
  if (error) {
    console.error('Supabase fetchContracts error:', error.message);
    return [];
  }
  return (data || []) as ClientContractRecord[];
};

export const createContractApi = async (contract: Partial<ClientContractRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = contract.id || `ct-${Date.now().toString(36)}`;
  const { error } = await client.from('contracts').insert({ ...contract, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const updateContractApi = async (id: string, contract: Partial<ClientContractRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('contracts').update(contract).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const deleteContractApi = async (id: string) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('contracts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 6. Invoices
export const fetchInvoicesApi = async (): Promise<InvoiceRecord[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('invoices').select('*').order('issueDate', { ascending: false });
  if (error) {
    console.error('Supabase fetchInvoices error:', error.message);
    return [];
  }
  return (data || []) as InvoiceRecord[];
};

export const createInvoiceApi = async (invoice: Partial<InvoiceRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = invoice.id || `inv-${Date.now().toString(36)}`;
  const { error } = await client.from('invoices').insert({ ...invoice, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const updateInvoiceApi = async (id: string, invoice: Partial<InvoiceRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('invoices').update(invoice).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const deleteInvoiceApi = async (id: string) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('invoices').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 7. Payments
export const fetchPaymentsApi = async (): Promise<PaymentRecord[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('payments').select('*').order('paymentDate', { ascending: false });
  if (error) {
    console.error('Supabase fetchPayments error:', error.message);
    return [];
  }
  return (data || []) as PaymentRecord[];
};

export const createPaymentApi = async (payment: Partial<PaymentRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = payment.id || `pay-${Date.now().toString(36)}`;
  const { error } = await client.from('payments').insert({ ...payment, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const deletePaymentApi = async (id: string) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('payments').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 8. Expenses
export const fetchExpensesApi = async (): Promise<ExpenseRecord[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('expenses').select('*').order('date', { ascending: false });
  if (error) {
    console.error('Supabase fetchExpenses error:', error.message);
    return [];
  }
  return (data || []) as ExpenseRecord[];
};

export const createExpenseApi = async (expense: Partial<ExpenseRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = expense.id || `exp-${Date.now().toString(36)}`;
  const { error } = await client.from('expenses').insert({ ...expense, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const deleteExpenseApi = async (id: string) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('expenses').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 9. Capital Contributions
export const fetchCapitalContributionsApi = async (): Promise<CapitalContributionRecord[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('capital_contributions').select('*').order('date', { ascending: false });
  if (error) {
    console.error('Supabase fetchCapitalContributions error:', error.message);
    return [];
  }
  return (data || []) as CapitalContributionRecord[];
};

export const createCapitalContributionApi = async (contrib: Partial<CapitalContributionRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = contrib.id || `cap-${Date.now().toString(36)}`;
  const { error } = await client.from('capital_contributions').insert({ ...contrib, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 10. Partner Equity
export const fetchPartnerEquityApi = async (): Promise<PartnerEquityRecord[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('partner_equity').select('*').order('ownershipPercentage', { ascending: false });
  if (error) {
    console.error('Supabase fetchPartnerEquity error:', error.message);
    return [];
  }
  return (data || []) as PartnerEquityRecord[];
};

export const updatePartnerEquityApi = async (partnerId: string, equity: Partial<PartnerEquityRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { data, error } = await client.from('partner_equity').update(equity).eq('partnerId', partnerId).select();
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    const { error: upsertErr } = await client.from('partner_equity').upsert({ ...equity, partnerId });
    if (upsertErr) throw new Error(upsertErr.message);
  }
  return { success: true, partnerId };
};

// 11. IP / Code Ownership
export const fetchIpOwnershipApi = async (): Promise<IpOwnershipRecord[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('ip_ownership').select('*').order('createdAt', { ascending: false });
  if (error) {
    console.error('Supabase fetchIpOwnership error:', error.message);
    return [];
  }
  return (data || []) as IpOwnershipRecord[];
};

export const createIpRecordApi = async (record: Partial<IpOwnershipRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = record.id || `ip-${Date.now().toString(36)}`;
  const { error } = await client.from('ip_ownership').insert({ ...record, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const updateIpRecordApi = async (id: string, record: Partial<IpOwnershipRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('ip_ownership').update(record).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const deleteIpRecordApi = async (id: string) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('ip_ownership').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 12. Assets
export const fetchAssetsApi = async (): Promise<AssetRecord[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('assets').select('*').order('createdAt', { ascending: false });
  if (error) {
    console.error('Supabase fetchAssets error:', error.message);
    return [];
  }
  return (data || []) as AssetRecord[];
};

export const createAssetApi = async (asset: Partial<AssetRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = asset.id || `ast-${Date.now().toString(36)}`;
  const { error } = await client.from('assets').insert({ ...asset, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const updateAssetApi = async (id: string, asset: Partial<AssetRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('assets').update(asset).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const deleteAssetApi = async (id: string) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('assets').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 13. Debts
export const fetchDebtsApi = async (): Promise<DebtRecord[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('debts').select('*').order('createdAt', { ascending: false });
  if (error) {
    console.error('Supabase fetchDebts error:', error.message);
    return [];
  }
  return (data || []) as DebtRecord[];
};

export const createDebtApi = async (debt: Partial<DebtRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = debt.id || `dbt-${Date.now().toString(36)}`;
  const { error } = await client.from('debts').insert({ ...debt, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const updateDebtApi = async (id: string, debt: Partial<DebtRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('debts').update(debt).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const deleteDebtApi = async (id: string) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('debts').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 14. Tax Filings
export const fetchTaxFilingsApi = async (): Promise<TaxFilingRecord[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('tax_filings').select('*').order('dueDate', { ascending: false });
  if (error) {
    console.error('Supabase fetchTaxFilings error:', error.message);
    return [];
  }
  return (data || []) as TaxFilingRecord[];
};

export const createTaxFilingApi = async (filing: Partial<TaxFilingRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = filing.id || `tax-${Date.now().toString(36)}`;
  const { error } = await client.from('tax_filings').insert({ ...filing, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const updateTaxFilingApi = async (id: string, filing: Partial<TaxFilingRecord>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('tax_filings').update(filing).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const deleteTaxFilingApi = async (id: string) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('tax_filings').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 15. Documents
export const fetchDocumentsApi = async (): Promise<SavedDocument[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('documents').select('*').order('updatedAt', { ascending: false });
  if (error) {
    console.error('Supabase fetchDocuments error:', error.message);
    return [];
  }
  return (data || []) as SavedDocument[];
};

export const saveDocumentApi = async (doc: SavedDocument) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('documents').upsert(doc);
  if (error) throw new Error(error.message);
  return { success: true, id: doc.id };
};

export const deleteDocumentApi = async (id: string) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('documents').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// 16. Tasks
export const fetchTasksApi = async (): Promise<Task[]> => {
  const client = getClient();
  if (!client) return [];
  const { data, error } = await client.from('tasks').select('*').order('createdAt', { ascending: false });
  if (error) {
    console.error('Supabase fetchTasks error:', error.message);
    return [];
  }
  return (data || []) as Task[];
};

export const createTaskApi = async (task: Partial<Task>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const id = task.id || `tsk-${Date.now().toString(36)}`;
  const { error } = await client.from('tasks').insert({ ...task, id });
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const updateTaskApi = async (id: string, task: Partial<Task>) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('tasks').update(task).eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

export const deleteTaskApi = async (id: string) => {
  const client = getClient();
  if (!client) throw new Error('Supabase not configured');
  const { error } = await client.from('tasks').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true, id };
};

// Aliases for compatibility
export const fetchEquityApi = fetchPartnerEquityApi;
export const updateEquityApi = updatePartnerEquityApi;
export const fetchIpRegistryApi = fetchIpOwnershipApi;
