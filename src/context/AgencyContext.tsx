import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AgencyProfile, StoredSignature } from '../types/agency';
import { SavedDocument, DocumentType, DocumentPayload } from '../types/documents';
import { Freelancer, AccessLevel, PaymentType } from '../types/freelancers';
import { Task, TaskStatus, TaskDeliverable } from '../types/tasks';
import { AuthUser, LoginCredentials } from '../types/auth';
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
import {
  sampleDiscoveryCall,
  sampleProposal,
  sampleQuotation,
  sampleRateChart,
  sampleOnboarding,
  sampleNda,
  sampleInvoice,
  sampleReceipt,
  sampleOffboarding,
  defaultAgencyProfile,
  defaultSignatureStore
} from '../services/sampleData';
import { ClientAccount } from '../types/client';
import * as api from '../services/api';
import { supabase, requireSupabase } from '../services/supabase';
import {
  CurrencyCode,
  formatMoney as formatMoneyUtil,
  convertAmount,
  normalizeCurrencyCode
} from '../services/currency';

export interface LoginResult {
  success: boolean;
  mustChangePassword?: boolean;
  freelancerId?: string;
  freelancerName?: string;
  error?: string;
}

export type AppView =
  | 'dashboard'
  | 'partnership_hub'
  | 'contracts_ledger'
  | 'financial_ledgers'
  | 'capital_equity'
  | 'ip_registry'
  | 'assets_debts'
  | 'tax_filings'
  | 'roles_matrix'
  | 'hub'
  | 'editor'
  | 'library'
  | 'clients'
  | 'freelancers'
  | 'tasks'
  | 'my_workspace'
  | 'client_portal'
  | 'settings';

interface AgencyContextType {
  agencyProfile: AgencyProfile;
  updateAgencyProfile: (profile: AgencyProfile) => void;
  storedSignatures: StoredSignature[];
  addStoredSignature: (sig: Omit<StoredSignature, 'id' | 'createdAt'>) => StoredSignature;
  updateStoredSignature: (id: string, sig: Partial<StoredSignature>) => void;
  deleteStoredSignature: (id: string) => void;
  setDefaultSignature: (id: string) => void;
  savedDocuments: SavedDocument[];
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  editingDocument: SavedDocument | null;
  activeDocType: DocumentType;
  openEditorForNew: (type: DocumentType) => void;
  openEditorForEdit: (doc: SavedDocument) => void;
  closeEditor: () => void;
  saveCurrentDoc: (doc: SavedDocument) => void;
  deleteDoc: (id: string) => void;
  clearAllDocs: () => void;
  cloneDoc: (id: string) => void;
  exportDataJson: () => void;
  importDataJson: (json: string) => Promise<boolean>;
  refreshDocs: () => void;

  // Auth (Supabase Auth)
  authLoading: boolean;
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  login: (creds: LoginCredentials) => Promise<LoginResult>;
  logout: () => void;
  completeFirstTimePasswordChange: (freelancerId: string, newPassword: string) => Promise<boolean>;
  updateAccountCredentials: (data: {
    email?: string;
    password?: string;
    username?: string;
    name?: string;
  }) => Promise<{ success: boolean; error?: string; notice?: string }>;

  // Clients
  clients: ClientAccount[];
  currentClient: ClientAccount | null;
  addNewClient: (data: {
    companyName: string;
    contactName: string;
    contactTitle: string;
    email: string;
    phone?: string;
    address?: string;
    projectTitle: string;
    projectDescription: string;
    budgetTotal: number;
    currency?: string;
    targetDeliveryDate: string;
    projectLeadId: string;
    assignedFreelancerIds: string[];
    communicationChannels?: {
      slackChannel?: string;
      meetingSchedule?: string;
      contactEmail?: string;
    };
    milestones?: {
      title: string;
      description: string;
      status: 'completed' | 'in_progress' | 'todo';
      dueDate: string;
    }[];
  }) => Promise<ClientAccount>;
  removeClientItem: (id: string) => Promise<void>;
  regenerateClientCredentials: (id: string) => Promise<{ newPassword: string; client: ClientAccount | null }>;
  sendDocumentToClient: (docId: string, clientId: string, notes?: string) => Promise<boolean>;
  unshareDocumentFromClient: (docId: string, clientId: string) => Promise<boolean>;

  // Team & Tasks
  freelancers: Freelancer[];
  tasks: Task[];
  addNewFreelancer: (data: {
    name: string;
    email: string;
    role: string;
    accessLevel: AccessLevel;
    paymentType: PaymentType;
    paymentAmount: number;
    currency?: string;
    skills: string[];
    notes?: string;
    roleLevel?: number;
  }) => Promise<Freelancer>;
  updateFreelancerItem: (freelancer: Freelancer) => Promise<void>;
  removeFreelancer: (id: string) => Promise<void>;
  regeneratePassword: (id: string) => Promise<{ newPassword: string; freelancer: Freelancer | null }>;

  allocateTask: (data: {
    title: string;
    description: string;
    freelancerId: string;
    projectName: string;
    clientName?: string;
    priority: Task['priority'];
    dueDate: string;
    estimatedHours?: number;
  }) => Promise<Task>;
  changeTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  submitDeliverable: (taskId: string, deliverable: TaskDeliverable) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;

  // 10 Partnership Ledgers
  contracts: ClientContractRecord[];
  addNewContract: (contract: Partial<ClientContractRecord>) => Promise<void>;
  updateContractItem: (id: string, contract: Partial<ClientContractRecord>) => Promise<void>;
  removeContractItem: (id: string) => Promise<void>;

  invoices: InvoiceRecord[];
  addNewInvoice: (invoice: Partial<InvoiceRecord>) => Promise<void>;
  updateInvoiceItem: (id: string, invoice: Partial<InvoiceRecord>) => Promise<void>;
  removeInvoiceItem: (id: string) => Promise<void>;

  payments: PaymentRecord[];
  addNewPayment: (payment: Partial<PaymentRecord>) => Promise<void>;
  removePaymentItem: (id: string) => Promise<void>;

  expenses: ExpenseRecord[];
  addNewExpense: (expense: Partial<ExpenseRecord>) => Promise<void>;
  removeExpenseItem: (id: string) => Promise<void>;

  capitalContributions: CapitalContributionRecord[];
  addNewCapitalContribution: (contrib: Partial<CapitalContributionRecord>) => Promise<void>;

  partnerEquity: PartnerEquityRecord[];
  updatePartnerEquityItem: (partnerId: string, data: Partial<PartnerEquityRecord>) => Promise<void>;

  ipRecords: IpOwnershipRecord[];
  addNewIpRecord: (record: Partial<IpOwnershipRecord>) => Promise<void>;
  updateIpRecordItem: (id: string, record: Partial<IpOwnershipRecord>) => Promise<void>;
  removeIpRecordItem: (id: string) => Promise<void>;

  assets: AssetRecord[];
  addNewAsset: (asset: Partial<AssetRecord>) => Promise<void>;
  updateAssetItem: (id: string, asset: Partial<AssetRecord>) => Promise<void>;
  removeAssetItem: (id: string) => Promise<void>;

  debts: DebtRecord[];
  addNewDebt: (debt: Partial<DebtRecord>) => Promise<void>;
  updateDebtItem: (id: string, debt: Partial<DebtRecord>) => Promise<void>;
  removeDebtItem: (id: string) => Promise<void>;

  taxFilings: TaxFilingRecord[];
  addNewTaxFiling: (filing: Partial<TaxFilingRecord>) => Promise<void>;
  updateTaxFilingItem: (id: string, filing: Partial<TaxFilingRecord>) => Promise<void>;
  removeTaxFilingItem: (id: string) => Promise<void>;

  // Custom Roles & RBAC Hierarchy
  customRoles: CustomRoleDefinition[];
  addNewRole: (role: Partial<CustomRoleDefinition>) => Promise<{ success: boolean; error?: string }>;
  updateRoleItem: (id: string, role: Partial<CustomRoleDefinition>) => Promise<{ success: boolean; error?: string }>;
  canModifyUser: (targetRoleLevel: number) => boolean;
  canAssignRole: (roleLevel: number) => boolean;

  // Active Global Currency Translation
  activeCurrency: CurrencyCode;
  setActiveCurrency: (currency: CurrencyCode) => void;
  formatMoney: (amount: number, fromCurrency?: string) => string;
  convertMoney: (amount: number, fromCurrency?: string) => number;
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

const CURRENCY_PREF_KEY = 'agency_active_currency';

const generateUsername = (name: string, email: string): string => {
  if (email && email.includes('@')) {
    return email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
  }
  return name.toLowerCase().trim().replace(/\s+/g, '.').replace(/[^a-z0-9._-]/g, '');
};

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

const reportError = (action: string, err: unknown) => {
  console.error(`${action} failed:`, err);
  alert(`${action} failed.\n\n${errorMessage(err)}`);
};

export const AgencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agencyProfile, setAgencyProfileState] = useState<AgencyProfile>(defaultAgencyProfile);
  const [activeCurrency, setActiveCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_PREF_KEY);
      if (saved === 'INR' || saved === 'USD') return saved;
    } catch {
      // display preference only
    }
    return normalizeCurrencyCode(defaultAgencyProfile.defaultCurrency);
  });

  const setActiveCurrency = (curr: CurrencyCode) => {
    setActiveCurrencyState(curr);
    try {
      localStorage.setItem(CURRENCY_PREF_KEY, curr);
    } catch {
      // display preference only
    }
    const newSymbol = curr === 'INR' ? '₹' : '$';
    setAgencyProfileState(prev => ({
      ...prev,
      defaultCurrency: curr,
      currencySymbol: newSymbol
    }));
  };

  const formatMoney = (amount: number, fromCurrency?: string): string => {
    return formatMoneyUtil(amount, activeCurrency, fromCurrency);
  };

  const convertMoney = (amount: number, fromCurrency?: string): number => {
    return convertAmount(amount, fromCurrency || 'USD', activeCurrency);
  };

  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('partnership_hub');
  const [editingDocument, setEditingDocument] = useState<SavedDocument | null>(null);
  const [activeDocType, setActiveDocType] = useState<DocumentType>('proposal');

  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  // 10 Partnership Ledgers State
  const [contracts, setContracts] = useState<ClientContractRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [capitalContributions, setCapitalContributions] = useState<CapitalContributionRecord[]>([]);
  const [partnerEquity, setPartnerEquity] = useState<PartnerEquityRecord[]>([]);
  const [ipRecords, setIpRecords] = useState<IpOwnershipRecord[]>([]);
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [debts, setDebts] = useState<DebtRecord[]>([]);
  const [taxFilings, setTaxFilings] = useState<TaxFilingRecord[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRoleDefinition[]>([]);

  // Session state. The Supabase Auth session is the only source of identity.
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  // Signed in with a temporary password; app access waits for a new password.
  const pendingPasswordChange = useRef<boolean>(false);

  const clearAllState = () => {
    setCurrentUser(null);
    setAgencyProfileState(defaultAgencyProfile);
    setSavedDocuments([]);
    setEditingDocument(null);
    setFreelancers([]);
    setTasks([]);
    setClients([]);
    setContracts([]);
    setInvoices([]);
    setPayments([]);
    setExpenses([]);
    setCapitalContributions([]);
    setPartnerEquity([]);
    setIpRecords([]);
    setAssets([]);
    setDebts([]);
    setTaxFilings([]);
    setCustomRoles([]);
  };

  // Build the app identity for a Supabase Auth user from the linked row.
  const resolveAuthUser = async (authUserId: string): Promise<{
    user: AuthUser | null;
    mustChangePassword: boolean;
    rowId?: string;
    displayName?: string;
  }> => {
    const staff = await api.fetchStaffByAuthId(authUserId);
    if (staff) {
      if (staff.status === 'offboarded') return { user: null, mustChangePassword: false };
      const level = staff.roleLevel ?? 40;
      return {
        mustChangePassword: Boolean(staff.credentials.mustChangePassword),
        rowId: staff.id,
        displayName: staff.name,
        user: {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          username: staff.credentials.username,
          role: staff.role,
          roleLevel: level,
          roleName: level === 100 ? 'partner' : undefined,
          accessLevel: staff.accessLevel,
          isOwner: level === 100,
          avatarUrl: staff.avatarUrl,
          freelancerId: staff.id
        }
      };
    }

    const client = await api.fetchClientByAuthId(authUserId);
    if (client) {
      return {
        mustChangePassword: Boolean(client.credentials.mustChangePassword),
        rowId: client.id,
        displayName: `${client.contactName} (${client.companyName})`,
        user: {
          id: client.id,
          name: client.contactName,
          email: client.email,
          username: client.credentials.username,
          role: client.contactTitle,
          roleLevel: 10,
          accessLevel: 'client',
          isOwner: false,
          clientId: client.id,
          clientCompanyName: client.companyName
        }
      };
    }

    return { user: null, mustChangePassword: false };
  };

  const landingViewFor = (user: AuthUser): AppView => {
    if (user.accessLevel === 'client') return 'client_portal';
    if (user.accessLevel === 'contributor' || user.accessLevel === 'restricted') return 'my_workspace';
    return 'partnership_hub';
  };

  // Fetch all data from Supabase. RLS decides what this account may see.
  const refreshAllApiData = async () => {
    if (!supabase) return;
    const results = await Promise.allSettled([
      api.fetchRolesApi(),
      api.fetchUsersApi(),
      api.fetchClientsApi(),
      api.fetchContractsApi(),
      api.fetchInvoicesApi(),
      api.fetchPaymentsApi(),
      api.fetchExpensesApi(),
      api.fetchCapitalContributionsApi(),
      api.fetchEquityApi(),
      api.fetchIpRegistryApi(),
      api.fetchAssetsApi(),
      api.fetchDebtsApi(),
      api.fetchTaxFilingsApi(),
      api.fetchDocumentsApi(),
      api.fetchTasksApi(),
      api.fetchAgencyProfileApi()
    ] as const);

    const [
      rolesData, usersData, clientsData, contractsData, invoicesData, paymentsData, expensesData,
      capitalData, equityData, ipData, assetsData, debtsData, taxesData, docsData, tasksData, profileData
    ] = results;

    if (rolesData.status === 'fulfilled') setCustomRoles(rolesData.value);
    if (usersData.status === 'fulfilled') {
      // Keep temporary passwords issued during this session visible to the admin.
      setFreelancers(prev => usersData.value.map(f => {
        const temp = prev.find(p => p.id === f.id)?.credentials.temporaryPassword;
        return temp && f.credentials.mustChangePassword
          ? { ...f, credentials: { ...f.credentials, temporaryPassword: temp } }
          : f;
      }));
    }
    if (clientsData.status === 'fulfilled') {
      setClients(prev => clientsData.value.map(c => {
        const temp = prev.find(p => p.id === c.id)?.credentials.temporaryPassword;
        return temp && c.credentials.mustChangePassword
          ? { ...c, credentials: { ...c.credentials, temporaryPassword: temp } }
          : c;
      }));
    }
    if (contractsData.status === 'fulfilled') setContracts(contractsData.value);
    if (invoicesData.status === 'fulfilled') setInvoices(invoicesData.value);
    if (paymentsData.status === 'fulfilled') setPayments(paymentsData.value);
    if (expensesData.status === 'fulfilled') setExpenses(expensesData.value);
    if (capitalData.status === 'fulfilled') setCapitalContributions(capitalData.value);
    if (equityData.status === 'fulfilled') setPartnerEquity(equityData.value);
    if (ipData.status === 'fulfilled') setIpRecords(ipData.value);
    if (assetsData.status === 'fulfilled') setAssets(assetsData.value);
    if (debtsData.status === 'fulfilled') setDebts(debtsData.value);
    if (taxesData.status === 'fulfilled') setTaxFilings(taxesData.value);
    if (docsData.status === 'fulfilled') setSavedDocuments(docsData.value);
    if (tasksData.status === 'fulfilled') setTasks(tasksData.value);
    if (profileData.status === 'fulfilled' && profileData.value) {
      const profile = profileData.value;
      setAgencyProfileState(profile);
      try {
        if (!localStorage.getItem(CURRENCY_PREF_KEY)) {
          setActiveCurrencyState(normalizeCurrencyCode(profile.defaultCurrency));
        }
      } catch {
        // display preference only
      }
    }

    results.forEach(r => {
      if (r.status === 'rejected') console.error('Supabase load error:', r.reason);
    });
  };

  // Runs a write against Supabase. On failure, tell the user and reload the
  // server state so optimistic UI changes are rolled back.
  const runWrite = async (action: string, op: () => Promise<unknown>) => {
    try {
      await op();
    } catch (err) {
      reportError(action, err);
      await refreshAllApiData();
    }
  };

  // Restore an existing Supabase session on load.
  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (!session) return;
        const resolved = await resolveAuthUser(session.user.id);
        if (!resolved.user || resolved.mustChangePassword) {
          // Unlinked account, or a temporary-password session that never
          // finished the password change: require a fresh sign in.
          await supabase.auth.signOut();
          return;
        }
        if (!cancelled) {
          setCurrentUser(resolved.user);
          setCurrentView(landingViewFor(resolved.user));
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    })();

    // Do not call Supabase inside this callback (supabase-js deadlocks).
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        pendingPasswordChange.current = false;
        clearAllState();
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (currentUser?.id) {
      refreshAllApiData();
    }
  }, [currentUser?.id]);

  const refreshDocs = () => {
    api.fetchDocumentsApi()
      .then(setSavedDocuments)
      .catch(err => console.error('Reload documents failed:', err));
  };

  const currentClient: ClientAccount | null =
    currentUser?.accessLevel === 'client'
      ? (clients.find(c => c.id === currentUser.clientId) || null)
      : null;

  const updateAgencyProfile = (profile: AgencyProfile) => {
    setAgencyProfileState(profile);
    runWrite('Saving agency profile', () => api.updateAgencyProfileApi(profile));
  };

  const storedSignatures: StoredSignature[] = agencyProfile.signatureStore && agencyProfile.signatureStore.length > 0
    ? agencyProfile.signatureStore
    : defaultSignatureStore;

  const addStoredSignature = (sig: Omit<StoredSignature, 'id' | 'createdAt'>): StoredSignature => {
    const newSig: StoredSignature = {
      ...sig,
      id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    const currentList = agencyProfile.signatureStore && agencyProfile.signatureStore.length > 0
      ? agencyProfile.signatureStore
      : defaultSignatureStore;

    let updatedList: StoredSignature[];
    if (newSig.isDefault) {
      updatedList = currentList.map(s => ({ ...s, isDefault: false }));
      updatedList.push(newSig);
    } else {
      const hasDefault = currentList.some(s => s.isDefault);
      updatedList = [...currentList, newSig];
      if (!hasDefault && updatedList.length > 0) {
        updatedList[0].isDefault = true;
      }
    }

    const defaultSig = updatedList.find(s => s.isDefault) || updatedList[0];
    const updatedProfile: AgencyProfile = {
      ...agencyProfile,
      signatureStore: updatedList,
      primarySigner: defaultSig ? {
        name: defaultSig.name,
        title: defaultSig.title,
        email: defaultSig.email || agencyProfile.primarySigner.email,
        signatureText: defaultSig.signatureText || defaultSig.name,
        signatureImage: defaultSig.signatureImage
      } : agencyProfile.primarySigner
    };

    updateAgencyProfile(updatedProfile);
    return newSig;
  };

  const updateStoredSignature = (id: string, partial: Partial<StoredSignature>) => {
    const currentList = agencyProfile.signatureStore && agencyProfile.signatureStore.length > 0
      ? agencyProfile.signatureStore
      : defaultSignatureStore;
    const updatedList = currentList.map(s => {
      if (s.id === id) {
        return { ...s, ...partial };
      }
      if (partial.isDefault) {
        return { ...s, isDefault: false };
      }
      return s;
    });

    const activeSig = updatedList.find(s => s.id === id);
    let newPrimary = agencyProfile.primarySigner;
    if (activeSig && (partial.isDefault || activeSig.isDefault)) {
      newPrimary = {
        name: activeSig.name,
        title: activeSig.title,
        email: activeSig.email || agencyProfile.primarySigner.email,
        signatureText: activeSig.signatureText || activeSig.name,
        signatureImage: activeSig.signatureImage
      };
    }

    const updatedProfile: AgencyProfile = {
      ...agencyProfile,
      signatureStore: updatedList,
      primarySigner: newPrimary
    };

    updateAgencyProfile(updatedProfile);
  };

  const deleteStoredSignature = (id: string) => {
    const currentList = agencyProfile.signatureStore && agencyProfile.signatureStore.length > 0
      ? agencyProfile.signatureStore
      : defaultSignatureStore;
    if (currentList.length <= 1) {
      alert('Cannot delete the last remaining signature from store.');
      return;
    }
    const filteredList = currentList.filter(s => s.id !== id);
    const targetPrimary = filteredList.find(s => s.isDefault) || filteredList[0];
    const updatedList = filteredList.map(s => ({
      ...s,
      isDefault: s.id === targetPrimary.id
    }));

    const newPrimary = {
      name: targetPrimary.name,
      title: targetPrimary.title,
      email: targetPrimary.email || agencyProfile.primarySigner.email,
      signatureText: targetPrimary.signatureText || targetPrimary.name,
      signatureImage: targetPrimary.signatureImage
    };

    const updatedProfile: AgencyProfile = {
      ...agencyProfile,
      signatureStore: updatedList,
      primarySigner: newPrimary
    };

    updateAgencyProfile(updatedProfile);
  };

  const setDefaultSignature = (id: string) => {
    const currentList = agencyProfile.signatureStore && agencyProfile.signatureStore.length > 0
      ? agencyProfile.signatureStore
      : defaultSignatureStore;
    const updatedList = currentList.map(s => ({
      ...s,
      isDefault: s.id === id
    }));

    const targetSig = updatedList.find(s => s.id === id);
    if (!targetSig) return;

    const updatedProfile: AgencyProfile = {
      ...agencyProfile,
      signatureStore: updatedList,
      primarySigner: {
        name: targetSig.name,
        title: targetSig.title,
        email: targetSig.email || agencyProfile.primarySigner.email,
        signatureText: targetSig.signatureText || targetSig.name,
        signatureImage: targetSig.signatureImage
      }
    };

    updateAgencyProfile(updatedProfile);
  };

  // Auth methods
  const login = async (creds: LoginCredentials): Promise<LoginResult> => {
    const invalid: LoginResult = {
      success: false,
      error: 'Invalid username/email or password. Please verify your credentials.'
    };

    try {
      const client = requireSupabase();
      const identifier = creds.emailOrUsername.trim();
      const email = await api.resolveLoginEmail(identifier);
      if (!email) return invalid;

      const { data, error } = await client.auth.signInWithPassword({ email, password: creds.password });
      if (error || !data.user) return invalid;

      const resolved = await resolveAuthUser(data.user.id);
      if (!resolved.user) {
        await client.auth.signOut();
        return {
          success: false,
          error: 'This login is not linked to an active team member or client account.'
        };
      }

      if (resolved.mustChangePassword) {
        pendingPasswordChange.current = true;
        setCurrentUser(null);
        return {
          success: false,
          mustChangePassword: true,
          freelancerId: resolved.rowId,
          freelancerName: resolved.displayName
        };
      }

      pendingPasswordChange.current = false;
      api.recordLoginApi().catch(err => console.error('Record login failed:', err));
      setCurrentUser(resolved.user);
      setLoginModalOpen(false);
      setCurrentView(landingViewFor(resolved.user));
      return { success: true };
    } catch (err) {
      return { success: false, error: errorMessage(err) };
    }
  };

  const completeFirstTimePasswordChange = async (_freelancerId: string, newPassword: string): Promise<boolean> => {
    try {
      const client = requireSupabase();
      if (!pendingPasswordChange.current) return false;

      const { data, error } = await client.auth.updateUser({ password: newPassword });
      if (error || !data.user) throw error || new Error('No active session');
      await api.completePasswordChangeApi();

      const resolved = await resolveAuthUser(data.user.id);
      if (!resolved.user) return false;

      pendingPasswordChange.current = false;
      setCurrentUser(resolved.user);
      setLoginModalOpen(false);
      setCurrentView(landingViewFor(resolved.user));
      return true;
    } catch (err) {
      console.error('Password change failed:', err);
      return false;
    }
  };

  const logout = () => {
    pendingPasswordChange.current = false;
    clearAllState();
    setCurrentView('partnership_hub');
    supabase?.auth.signOut().catch(err => console.error('Sign out failed:', err));
  };

  const updateAccountCredentials = async (data: {
    email?: string;
    password?: string;
    username?: string;
    name?: string;
  }): Promise<{ success: boolean; error?: string; notice?: string }> => {
    if (!currentUser) return { success: false, error: 'No active user session found.' };

    try {
      const client = requireSupabase();
      const updatedName = data.name?.trim() || currentUser.name;
      const updatedUsername = data.username?.trim().toLowerCase() || currentUser.username || '';
      const requestedEmail = data.email?.trim();
      const emailChanged = Boolean(requestedEmail && requestedEmail.toLowerCase() !== currentUser.email.toLowerCase());

      if (data.password) {
        const { error } = await client.auth.updateUser({ password: data.password });
        if (error) throw error;
      }

      if (updatedName !== currentUser.name || updatedUsername !== (currentUser.username || '')) {
        await api.updateOwnAccountApi(updatedName, updatedUsername);
      }

      // Supabase sends a confirmation link; the stored email updates after it is confirmed.
      if (emailChanged && requestedEmail) {
        const { error } = await client.auth.updateUser({ email: requestedEmail });
        if (error) throw error;
      }

      setCurrentUser({ ...currentUser, name: updatedName, username: updatedUsername });

      if (currentUser.roleLevel === 100 && updatedName !== currentUser.name) {
        await api.updateEquityApi(currentUser.id, { partnerName: updatedName as PartnerEquityRecord['partnerName'] });
        if (agencyProfile.primarySigner?.email?.toLowerCase() === currentUser.email.toLowerCase()) {
          updateAgencyProfile({ ...agencyProfile, primarySigner: { ...agencyProfile.primarySigner, name: updatedName } });
        }
      }

      await refreshAllApiData();
      return {
        success: true,
        notice: emailChanged
          ? `Saved. Confirm the new email address through the link sent to ${requestedEmail}; the old email keeps working until then.`
          : undefined
      };
    } catch (err) {
      console.error('Error updating account credentials:', err);
      return { success: false, error: errorMessage(err) || 'Failed to update credentials' };
    }
  };

  // Hierarchy validation rules (also enforced by Supabase RLS policies)
  // Rule 1: Users having same roles can't change or update same roles or higher than them
  const canModifyUser = (targetRoleLevel: number): boolean => {
    if (!currentUser) return false;
    const actorLvl = currentUser.roleLevel ?? 0;
    return actorLvl > targetRoleLevel;
  };

  // Rule 2: Role giving permission is only available to partners, admins and managers
  const canAssignRole = (roleLevel: number): boolean => {
    if (!currentUser) return false;
    const actorLvl = currentUser.roleLevel ?? 0;
    if (actorLvl < 60) return false; // Strictly Partner (100), Admin (80), Manager (60)
    return actorLvl > roleLevel;
  };

  // Team management with hierarchy checks
  const addNewFreelancer = async (data: {
    name: string;
    email: string;
    role: string;
    accessLevel: AccessLevel;
    paymentType: PaymentType;
    paymentAmount: number;
    currency?: string;
    skills: string[];
    notes?: string;
    roleLevel?: number;
  }): Promise<Freelancer> => {
    const targetLvl = data.roleLevel || (data.accessLevel === 'admin' ? 80 : data.accessLevel === 'project_lead' ? 60 : 40);
    const actorLvl = currentUser?.roleLevel ?? 0;

    if (!canAssignRole(targetLvl)) {
      throw new Error(`Hierarchy Violation: As a Level ${actorLvl} user, you cannot create or assign a role at Level ${targetLvl}. You may only assign roles strictly below your level.`);
    }

    const newFreelancer: Freelancer = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email.trim().toLowerCase(),
      role: data.role,
      roleLevel: targetLvl,
      accessLevel: data.accessLevel,
      paymentType: data.paymentType,
      paymentAmount: data.paymentAmount,
      hourlyRate: data.paymentType === 'hourly' ? data.paymentAmount : 0,
      currency: data.currency || activeCurrency || 'USD',
      status: 'active',
      skills: data.skills,
      joinedDate: new Date().toISOString().split('T')[0],
      credentials: {
        username: generateUsername(data.name, data.email),
        mustChangePassword: true,
        generatedAt: new Date().toISOString()
      },
      notes: data.notes
    };

    await api.createUserApi(newFreelancer);
    let temporaryPassword: string;
    try {
      temporaryPassword = await api.provisionLoginApi('user', newFreelancer.id);
    } catch (err) {
      await refreshAllApiData();
      throw new Error(`${newFreelancer.name} was saved, but their login could not be created. Use "Reset Temp Pwd" after fixing this.\n\n${errorMessage(err)}`);
    }

    const created: Freelancer = {
      ...newFreelancer,
      hasLogin: true,
      credentials: { ...newFreelancer.credentials, temporaryPassword }
    };
    setFreelancers(prev => [created, ...prev.filter(f => f.id !== created.id)]);
    return created;
  };

  const updateFreelancerItem = async (freelancer: Freelancer) => {
    const targetLvl = freelancer.roleLevel ?? 40;
    const actorLvl = currentUser?.roleLevel ?? 0;

    if (!canModifyUser(targetLvl)) {
      alert(`Hierarchy Violation: As Level ${actorLvl}, you cannot update a user at Level ${targetLvl} (same role or higher).`);
      return;
    }

    setFreelancers(prev => prev.map(f => f.id === freelancer.id ? freelancer : f));
    await runWrite('Updating team member', () => api.updateUserApi(freelancer));
  };

  const removeFreelancer = async (id: string) => {
    const target = freelancers.find(f => f.id === id);
    const targetLvl = target?.roleLevel ?? 40;

    if (!canModifyUser(targetLvl)) {
      alert(`Hierarchy Violation: You cannot delete a user at Level ${targetLvl} (same role or higher).`);
      return;
    }

    await runWrite('Removing team member', async () => {
      await api.deleteAccountApi('user', id);
      setFreelancers(prev => prev.filter(f => f.id !== id));
    });
  };

  const regeneratePassword = async (id: string) => {
    try {
      const newPassword = await api.provisionLoginApi('user', id);
      const existing = freelancers.find(f => f.id === id);
      const updated: Freelancer | null = existing ? {
        ...existing,
        hasLogin: true,
        credentials: { ...existing.credentials, temporaryPassword: newPassword, mustChangePassword: true, generatedAt: new Date().toISOString() }
      } : null;
      if (updated) setFreelancers(prev => prev.map(f => f.id === id ? updated : f));
      return { newPassword, freelancer: updated };
    } catch (err) {
      reportError('Issuing temporary password', err);
      return { newPassword: '', freelancer: null };
    }
  };

  // Client Management
  const addNewClient = async (data: Parameters<AgencyContextType['addNewClient']>[0]): Promise<ClientAccount> => {
    const id = `client-${Date.now()}`;
    const lead = freelancers.find((f) => f.id === data.projectLeadId);

    const newClient: ClientAccount = {
      id,
      companyName: data.companyName,
      contactName: data.contactName,
      contactTitle: data.contactTitle,
      email: data.email.trim().toLowerCase(),
      phone: data.phone,
      address: data.address,
      credentials: {
        username: generateUsername(data.contactName, data.email),
        mustChangePassword: true,
        generatedAt: new Date().toISOString()
      },
      orders: [
        {
          id: `order-${Date.now()}`,
          title: data.projectTitle,
          description: data.projectDescription,
          status: 'in_progress',
          progressPercentage: 20,
          startDate: new Date().toISOString().split('T')[0],
          targetDeliveryDate: data.targetDeliveryDate,
          budgetTotal: data.budgetTotal,
          currency: data.currency || agencyProfile.defaultCurrency || 'USD',
          projectLeadId: data.projectLeadId,
          projectLeadName: lead?.name || 'Project Lead',
          assignedFreelancerIds: data.assignedFreelancerIds,
          communicationChannels: {
            slackChannel: `#${data.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}-sync`,
            meetingSchedule: 'Weekly Sprint Sync — Thursdays 10:00 AM EST',
            contactEmail: data.communicationChannels?.contactEmail || agencyProfile.email
          },
          milestones: []
        }
      ],
      sharedDocumentIds: [],
      createdAt: new Date().toISOString()
    };

    await api.createClientApi(newClient);
    let temporaryPassword: string;
    try {
      temporaryPassword = await api.provisionLoginApi('client', id);
    } catch (err) {
      await refreshAllApiData();
      throw new Error(`${newClient.companyName} was saved, but the portal login could not be created. Use "Reset Temp Pwd" after fixing this.\n\n${errorMessage(err)}`);
    }

    const created: ClientAccount = {
      ...newClient,
      hasLogin: true,
      credentials: { ...newClient.credentials, temporaryPassword }
    };
    setClients(prev => [created, ...prev.filter(c => c.id !== id)]);
    return created;
  };

  const removeClientItem = async (id: string) => {
    await runWrite('Removing client', async () => {
      await api.deleteAccountApi('client', id);
      setClients(prev => prev.filter(c => c.id !== id));
    });
  };

  const regenerateClientCredentials = async (id: string) => {
    try {
      const newPassword = await api.provisionLoginApi('client', id);
      const existing = clients.find(c => c.id === id);
      const updated: ClientAccount | null = existing ? {
        ...existing,
        hasLogin: true,
        credentials: { ...existing.credentials, temporaryPassword: newPassword, mustChangePassword: true, generatedAt: new Date().toISOString() }
      } : null;
      if (updated) setClients(prev => prev.map(c => c.id === id ? updated : c));
      return { newPassword, client: updated };
    } catch (err) {
      reportError('Issuing client temporary password', err);
      return { newPassword: '', client: null };
    }
  };

  const sendDocumentToClient = async (docId: string, clientId: string, notes?: string): Promise<boolean> => {
    const targetClient = clients.find((c) => c.id === clientId);
    const doc = savedDocuments.find((d) => d.id === docId);
    if (!targetClient || !doc) return false;

    const sharedDocumentIds = Array.from(new Set([...(targetClient.sharedDocumentIds || []), docId]));
    const updatedDoc: SavedDocument = {
      ...doc,
      clientId,
      clientName: targetClient.companyName,
      status: doc.status === 'draft' ? 'issued' : doc.status,
      sharedWithClient: true,
      sharedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientNotes: notes !== undefined ? notes : doc.clientNotes
    };

    try {
      await api.saveDocumentApi(updatedDoc);
      await api.updateClientApi(clientId, { sharedDocumentIds });
    } catch (err) {
      reportError('Sharing document', err);
      await refreshAllApiData();
      return false;
    }

    setSavedDocuments(prev => prev.map(d => d.id === docId ? updatedDoc : d));
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, sharedDocumentIds } : c));
    if (editingDocument?.id === docId) {
      setEditingDocument(updatedDoc);
    }
    return true;
  };

  const unshareDocumentFromClient = async (docId: string, clientId: string): Promise<boolean> => {
    const targetClient = clients.find((c) => c.id === clientId);
    const doc = savedDocuments.find((d) => d.id === docId);
    const sharedDocumentIds = (targetClient?.sharedDocumentIds || []).filter(id => id !== docId);

    try {
      if (targetClient) await api.updateClientApi(clientId, { sharedDocumentIds });
      if (doc) await api.saveDocumentApi({ ...doc, sharedWithClient: false, updatedAt: new Date().toISOString() });
    } catch (err) {
      reportError('Unsharing document', err);
      await refreshAllApiData();
      return false;
    }

    setClients(prev => prev.map(c => c.id === clientId ? { ...c, sharedDocumentIds } : c));
    setSavedDocuments(prev => prev.map(d => d.id === docId ? { ...d, sharedWithClient: false } : d));
    return true;
  };

  // Task allocation
  const allocateTask = async (data: Parameters<AgencyContextType['allocateTask']>[0]): Promise<Task> => {
    const fl = freelancers.find((f) => f.id === data.freelancerId);
    const now = new Date().toISOString();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: data.title,
      description: data.description,
      freelancerId: data.freelancerId,
      freelancerName: fl?.name || 'Assigned Freelancer',
      assignedBy: currentUser?.name || 'Partner',
      projectName: data.projectName,
      clientName: data.clientName,
      status: 'todo',
      priority: data.priority,
      dueDate: data.dueDate,
      createdAt: now,
      updatedAt: now,
      estimatedHours: data.estimatedHours || 8,
      deliverables: []
    };

    setTasks(prev => [newTask, ...prev]);
    await runWrite('Allocating task', () => api.createTaskApi(newTask));
    return newTask;
  };

  const changeTaskStatus = async (taskId: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t));
    await runWrite('Updating task status', () => api.updateTaskApi(taskId, { status }));
  };

  const submitDeliverable = async (taskId: string, deliverable: TaskDeliverable) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const deliverables = [deliverable, ...(task.deliverables || [])];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, deliverables, status: 'review', updatedAt: new Date().toISOString() } : t));
    await runWrite('Submitting deliverable', () => api.updateTaskApi(taskId, { deliverables, status: 'review' }));
  };

  const removeTask = async (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    await runWrite('Removing task', () => api.deleteTaskApi(taskId));
  };

  // 10 LEDGERS CRUD IMPLEMENTATIONS
  // 1. Contracts
  const addNewContract = async (contract: Partial<ClientContractRecord>) => {
    const id = `ct-${Date.now()}`;
    const now = new Date().toISOString();
    const newRecord: ClientContractRecord = {
      id,
      contractNumber: contract.contractNumber || `CT-${Date.now()}`,
      title: contract.title || 'Untitled Contract',
      clientId: contract.clientId || '',
      clientName: contract.clientName || '',
      type: contract.type || 'sow',
      contractValue: contract.contractValue || 0,
      currency: contract.currency || 'USD',
      startDate: contract.startDate || now.split('T')[0],
      endDate: contract.endDate || now.split('T')[0],
      signedDate: contract.signedDate,
      partnerInCharge: contract.partnerInCharge || 'Subhadip Jana',
      status: contract.status || 'draft',
      termsSummary: contract.termsSummary || '',
      ipOwnershipClause: contract.ipOwnershipClause || '',
      createdAt: now,
      updatedAt: now
    };
    setContracts(prev => [newRecord, ...prev]);
    await runWrite('Creating contract', () => api.createContractApi(newRecord));
  };

  const updateContractItem = async (id: string, contract: Partial<ClientContractRecord>) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...contract, updatedAt: new Date().toISOString() } : c));
    await runWrite('Updating contract', () => api.updateContractApi(id, contract));
  };

  const removeContractItem = async (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
    await runWrite('Deleting contract', () => api.deleteContractApi(id));
  };

  // 2. Invoices
  const addNewInvoice = async (invoice: Partial<InvoiceRecord>) => {
    const id = `inv-${Date.now()}`;
    const now = new Date().toISOString();
    const newRecord: InvoiceRecord = {
      id,
      invoiceNumber: invoice.invoiceNumber || `INV-${Date.now()}`,
      clientId: invoice.clientId || '',
      clientName: invoice.clientName || '',
      issueDate: invoice.issueDate || now.split('T')[0],
      dueDate: invoice.dueDate || now.split('T')[0],
      items: invoice.items || [],
      subtotal: invoice.subtotal || 0,
      taxPercent: invoice.taxPercent || 0,
      taxAmount: invoice.taxAmount || 0,
      discountAmount: invoice.discountAmount || 0,
      grandTotal: invoice.grandTotal || 0,
      paidAmount: invoice.paidAmount || 0,
      status: invoice.status || 'draft',
      paymentTerms: invoice.paymentTerms || '',
      notes: invoice.notes,
      createdAt: now,
      updatedAt: now
    };
    setInvoices(prev => [newRecord, ...prev]);
    await runWrite('Creating invoice', () => api.createInvoiceApi(newRecord));
  };

  const updateInvoiceItem = async (id: string, invoice: Partial<InvoiceRecord>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...invoice, updatedAt: new Date().toISOString() } : i));
    await runWrite('Updating invoice', () => api.updateInvoiceApi(id, invoice));
  };

  const removeInvoiceItem = async (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    await runWrite('Deleting invoice', () => api.deleteInvoiceApi(id));
  };

  // 3. Payments (a database trigger updates the linked invoice)
  const addNewPayment = async (payment: Partial<PaymentRecord>) => {
    const id = `pay-${Date.now()}`;
    const now = new Date().toISOString();
    const newRecord: PaymentRecord = {
      id,
      paymentNumber: payment.paymentNumber || `PAY-${Date.now()}`,
      invoiceId: payment.invoiceId,
      clientId: payment.clientId || '',
      clientName: payment.clientName || '',
      amount: payment.amount || 0,
      currency: payment.currency || 'USD',
      paymentDate: payment.paymentDate || now.split('T')[0],
      paymentMethod: payment.paymentMethod || 'wire_transfer',
      transactionRef: payment.transactionRef || '',
      depositingBank: payment.depositingBank || '',
      notes: payment.notes,
      recordedBy: currentUser?.name || 'Partner',
      createdAt: now
    };
    setPayments(prev => [newRecord, ...prev]);
    await runWrite('Recording payment', async () => {
      await api.createPaymentApi(newRecord);
      setInvoices(await api.fetchInvoicesApi());
    });
  };

  const removePaymentItem = async (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    await runWrite('Deleting payment', async () => {
      await api.deletePaymentApi(id);
      setInvoices(await api.fetchInvoicesApi());
    });
  };

  // 4. Expenses
  const addNewExpense = async (expense: Partial<ExpenseRecord>) => {
    const id = `exp-${Date.now()}`;
    const now = new Date().toISOString();
    const newRecord: ExpenseRecord = {
      id,
      expenseNumber: expense.expenseNumber || `EXP-${Date.now()}`,
      title: expense.title || 'Untitled Expense',
      category: expense.category || 'other',
      vendor: expense.vendor || '',
      amount: expense.amount || 0,
      currency: expense.currency || 'USD',
      date: expense.date || now.split('T')[0],
      paidBy: expense.paidBy || 'firm_account',
      reimbursementStatus: expense.reimbursementStatus || 'not_applicable',
      taxDeductible: expense.taxDeductible ?? true,
      notes: expense.notes,
      recordedBy: currentUser?.name || 'Partner',
      createdAt: now
    };
    setExpenses(prev => [newRecord, ...prev]);
    await runWrite('Recording expense', () => api.createExpenseApi(newRecord));
  };

  const removeExpenseItem = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await runWrite('Deleting expense', () => api.deleteExpenseApi(id));
  };

  // 5. Capital Contributions (a database trigger updates partner equity)
  const addNewCapitalContribution = async (contrib: Partial<CapitalContributionRecord>) => {
    const id = `cap-${Date.now()}`;
    const now = new Date().toISOString();
    const newRecord: CapitalContributionRecord = {
      id,
      partnerName: contrib.partnerName || 'Subhadip Jana',
      partnerId: contrib.partnerId || 'usr-subhadip',
      amount: contrib.amount || 0,
      currency: contrib.currency || 'USD',
      date: contrib.date || now.split('T')[0],
      contributionType: contrib.contributionType || 'cash_infusion',
      transactionRef: contrib.transactionRef || '',
      bankAccount: contrib.bankAccount || '',
      notes: contrib.notes || '',
      createdAt: now
    };
    setCapitalContributions(prev => [newRecord, ...prev]);
    await runWrite('Recording capital contribution', async () => {
      await api.createCapitalContributionApi(newRecord);
      setPartnerEquity(await api.fetchEquityApi());
    });
  };

  // 6. Partner Equity
  const updatePartnerEquityItem = async (partnerId: string, data: Partial<PartnerEquityRecord>) => {
    setPartnerEquity(prev => prev.map(p => p.partnerId === partnerId ? { ...p, ...data, lastUpdated: new Date().toISOString() } : p));
    await runWrite('Updating partner equity', () => api.updateEquityApi(partnerId, data));
  };

  // 7. IP Registry
  const addNewIpRecord = async (record: Partial<IpOwnershipRecord>) => {
    const id = `ip-${Date.now()}`;
    const now = new Date().toISOString();
    const newRecord: IpOwnershipRecord = {
      id,
      title: record.title || 'Untitled IP Asset',
      repositoryUrl: record.repositoryUrl,
      commitHashOrVersion: record.commitHashOrVersion,
      ownershipType: record.ownershipType || '100% Partnership Proprietary',
      clientAssignmentId: record.clientAssignmentId,
      clientName: record.clientName,
      primaryAuthorPartner: record.primaryAuthorPartner || 'Subhadip Jana',
      registrationDate: record.registrationDate || now.split('T')[0],
      legalStatus: record.legalStatus || 'copyright_claimed',
      licenseTerms: record.licenseTerms || '',
      summary: record.summary || '',
      createdAt: now
    };
    setIpRecords(prev => [newRecord, ...prev]);
    await runWrite('Registering IP record', () => api.createIpRecordApi(newRecord));
  };

  const updateIpRecordItem = async (id: string, record: Partial<IpOwnershipRecord>) => {
    setIpRecords(prev => prev.map(r => r.id === id ? { ...r, ...record } : r));
    await runWrite('Updating IP record', () => api.updateIpRecordApi(id, record));
  };

  const removeIpRecordItem = async (id: string) => {
    setIpRecords(prev => prev.filter(r => r.id !== id));
    await runWrite('Deleting IP record', () => api.deleteIpRecordApi(id));
  };

  // 8. Assets
  const addNewAsset = async (asset: Partial<AssetRecord>) => {
    const id = `ast-${Date.now()}`;
    const now = new Date().toISOString();
    const newRecord: AssetRecord = {
      id,
      assetNumber: asset.assetNumber || `AST-${Date.now()}`,
      name: asset.name || 'Untitled Asset',
      category: asset.category || 'computer_hardware',
      purchaseDate: asset.purchaseDate || now.split('T')[0],
      purchaseCost: asset.purchaseCost || 0,
      currentBookValue: asset.currentBookValue || asset.purchaseCost || 0,
      depreciationRatePercent: asset.depreciationRatePercent ?? 15,
      assignedTo: asset.assignedTo || 'Subhadip Jana',
      condition: asset.condition || 'active_excellent',
      notes: asset.notes,
      createdAt: now,
      updatedAt: now
    };
    setAssets(prev => [newRecord, ...prev]);
    await runWrite('Registering asset', () => api.createAssetApi(newRecord));
  };

  const updateAssetItem = async (id: string, asset: Partial<AssetRecord>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...asset, updatedAt: new Date().toISOString() } : a));
    await runWrite('Updating asset', () => api.updateAssetApi(id, asset));
  };

  const removeAssetItem = async (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    await runWrite('Deleting asset', () => api.deleteAssetApi(id));
  };

  // 9. Debts
  const addNewDebt = async (debt: Partial<DebtRecord>) => {
    const id = `dbt-${Date.now()}`;
    const now = new Date().toISOString();
    const newRecord: DebtRecord = {
      id,
      debtNumber: debt.debtNumber || `DBT-${Date.now()}`,
      creditor: debt.creditor || '',
      debtType: debt.debtType || 'bank_loan',
      principalAmount: debt.principalAmount || 0,
      currentBalance: debt.currentBalance || debt.principalAmount || 0,
      interestRatePercent: debt.interestRatePercent || 0,
      repaymentTermMonths: debt.repaymentTermMonths || 12,
      monthlyPayment: debt.monthlyPayment || 0,
      startDate: debt.startDate || now.split('T')[0],
      maturityDate: debt.maturityDate || '',
      status: debt.status || 'active',
      notes: debt.notes,
      createdAt: now,
      updatedAt: now
    };
    setDebts(prev => [newRecord, ...prev]);
    await runWrite('Recording debt', () => api.createDebtApi(newRecord));
  };

  const updateDebtItem = async (id: string, debt: Partial<DebtRecord>) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...debt, updatedAt: new Date().toISOString() } : d));
    await runWrite('Updating debt', () => api.updateDebtApi(id, debt));
  };

  const removeDebtItem = async (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    await runWrite('Deleting debt', () => api.deleteDebtApi(id));
  };

  // 10. Tax Filings
  const addNewTaxFiling = async (filing: Partial<TaxFilingRecord>) => {
    const id = `tax-${Date.now()}`;
    const now = new Date().toISOString();
    const newRecord: TaxFilingRecord = {
      id,
      filingNumber: filing.filingNumber || `TAX-${Date.now()}`,
      taxType: filing.taxType || 'gst_vat_return',
      title: filing.title || '',
      fiscalYear: filing.fiscalYear || 'FY 2025-26',
      periodOrQuarter: filing.periodOrQuarter || 'Q1',
      dueDate: filing.dueDate || now.split('T')[0],
      filingDate: filing.filingDate,
      ackNumberOrArn: filing.ackNumberOrArn,
      taxLiabilityAmount: filing.taxLiabilityAmount || 0,
      taxPaidAmount: filing.taxPaidAmount || 0,
      status: filing.status || 'draft',
      signedByPartner: filing.signedByPartner || 'Subhadip Jana',
      auditorNotes: filing.auditorNotes,
      createdAt: now,
      updatedAt: now
    };
    setTaxFilings(prev => [newRecord, ...prev]);
    await runWrite('Recording tax filing', () => api.createTaxFilingApi(newRecord));
  };

  const updateTaxFilingItem = async (id: string, filing: Partial<TaxFilingRecord>) => {
    setTaxFilings(prev => prev.map(t => t.id === id ? { ...t, ...filing, updatedAt: new Date().toISOString() } : t));
    await runWrite('Updating tax filing', () => api.updateTaxFilingApi(id, filing));
  };

  const removeTaxFilingItem = async (id: string) => {
    setTaxFilings(prev => prev.filter(t => t.id !== id));
    await runWrite('Deleting tax filing', () => api.deleteTaxFilingApi(id));
  };

  // Custom Roles Creation & Hierarchy
  const addNewRole = async (role: Partial<CustomRoleDefinition>): Promise<{ success: boolean; error?: string }> => {
    const actorLvl = currentUser?.roleLevel ?? 0;
    if (!canAssignRole(role.level || 0)) {
      return {
        success: false,
        error: `Hierarchy violation: As a Level ${actorLvl} user, you cannot create a role at Level ${role.level}. It must be strictly lower.`
      };
    }

    try {
      const created = await api.createRoleApi(role);
      setCustomRoles(prev => [...prev, created]);
      return { success: true };
    } catch (err) {
      return { success: false, error: errorMessage(err) };
    }
  };

  const updateRoleItem = async (id: string, role: Partial<CustomRoleDefinition>): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.updateRoleApi(id, role);
      setCustomRoles(prev => prev.map(r => r.id === id ? { ...r, ...role } : r));
      return { success: true };
    } catch (err) {
      return { success: false, error: errorMessage(err) };
    }
  };

  // Documents Helpers
  const createInitialPayloadForType = (type: DocumentType, docNumber?: string): DocumentPayload => {
    const prefixMap: Record<DocumentType, string> = {
      discovery: 'DISC',
      proposal: 'PROP',
      quotation: 'QT',
      rate_chart: 'RC',
      onboarding: 'ONB',
      nda: 'NDA',
      invoice: 'INV',
      receipt: 'RCT',
      offboarding: 'OFF'
    };
    const code = docNumber || `${prefixMap[type]}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    switch (type) {
      case 'discovery':
        return { type: 'discovery', data: { ...sampleDiscoveryCall, callDate: new Date().toISOString().split('T')[0] } };
      case 'proposal':
        return { 
          type: 'proposal', 
          data: { 
            ...sampleProposal, 
            proposalNumber: code,
            issueDate: new Date().toISOString().split('T')[0] 
          } 
        };
      case 'quotation':
        return { 
          type: 'quotation', 
          data: { 
            ...sampleQuotation, 
            quotationNumber: code,
            issueDate: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
            currencySymbol: agencyProfile.currencySymbol || '$'
          } 
        };
      case 'rate_chart':
        return {
          type: 'rate_chart',
          data: {
            ...sampleRateChart,
            rateChartNumber: code,
            effectiveDate: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().split('T')[0],
            currencySymbol: agencyProfile.currencySymbol || '$'
          }
        };
      case 'onboarding':
        return { type: 'onboarding', data: { ...sampleOnboarding, startDate: new Date().toISOString().split('T')[0] } };
      case 'nda':
        return { 
          type: 'nda', 
          data: { 
            ...sampleNda, 
            agreementDate: new Date().toISOString().split('T')[0],
            receivingPartyName: agencyProfile.name,
            receivingPartyAddress: `${agencyProfile.address}, ${agencyProfile.cityStateZip}`,
            receivingPartyRepresentative: `${agencyProfile.primarySigner.name}, ${agencyProfile.primarySigner.title}`
          } 
        };
      case 'invoice':
        return { 
          type: 'invoice', 
          data: { 
            ...sampleInvoice, 
            invoiceNumber: code,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString().split('T')[0],
            currencySymbol: agencyProfile.currencySymbol || '$',
            paymentInstructions: agencyProfile.bankDetails.notes || 'Please remit payment to bank details on file.'
          } 
        };
      case 'receipt':
        return { 
          type: 'receipt', 
          data: { 
            ...sampleReceipt, 
            receiptNumber: code,
            paymentDate: new Date().toISOString().split('T')[0],
            currencySymbol: agencyProfile.currencySymbol || '$'
          } 
        };
      case 'offboarding':
        return { 
          type: 'offboarding', 
          data: { 
            ...sampleOffboarding, 
            projectCompletedDate: new Date().toISOString().split('T')[0] 
          } 
        };
    }
  };

  const openEditorForNew = (type: DocumentType) => {
    setActiveDocType(type);
    const now = new Date().toISOString();
    const prefixMap: Record<DocumentType, string> = {
      discovery: 'DISC',
      proposal: 'PROP',
      quotation: 'QT',
      rate_chart: 'RC',
      onboarding: 'ONB',
      nda: 'NDA',
      invoice: 'INV',
      receipt: 'RCT',
      offboarding: 'OFF'
    };
    const code = `${prefixMap[type]}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newDoc: SavedDocument = {
      id: `doc-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Document`,
      docNumber: code,
      createdAt: now,
      updatedAt: now,
      clientName: 'New Client',
      status: 'draft',
      payload: createInitialPayloadForType(type, code),
      agencySnapshot: agencyProfile
    };

    setEditingDocument(newDoc);
    setCurrentView('editor');
  };

  const openEditorForEdit = (doc: SavedDocument) => {
    setActiveDocType(doc.type);
    setEditingDocument(doc);
    setCurrentView('editor');
  };

  const closeEditor = () => {
    setEditingDocument(null);
    setCurrentView('library');
  };

  const upsertDocumentInState = (doc: SavedDocument) => {
    setSavedDocuments(prev => [doc, ...prev.filter(d => d.id !== doc.id)]);
  };

  const saveCurrentDoc = (doc: SavedDocument) => {
    const saved: SavedDocument = { ...doc, updatedAt: new Date().toISOString() };
    setEditingDocument(saved);
    upsertDocumentInState(saved);
    runWrite('Saving document', () => api.saveDocumentApi(saved));
  };

  const deleteDoc = (id: string) => {
    setSavedDocuments(prev => prev.filter(d => d.id !== id));
    runWrite('Deleting document', () => api.deleteDocumentApi(id));
    if (editingDocument?.id === id) {
      setEditingDocument(null);
      setCurrentView('library');
    }
  };

  const clearAllDocs = () => {
    setSavedDocuments([]);
    runWrite('Clearing documents', () => api.deleteAllDocumentsApi());
  };

  const cloneDoc = (id: string) => {
    const doc = savedDocuments.find(d => d.id === id);
    if (!doc) return;

    const now = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const cloned: SavedDocument = {
      ...doc,
      id: `doc-${Date.now()}-${randomSuffix}`,
      title: `${doc.title} (Copy)`,
      docNumber: `${doc.docNumber}-COPY`,
      createdAt: now,
      updatedAt: now,
      status: 'draft',
      sharedWithClient: false,
      sharedAt: undefined
    };

    upsertDocumentInState(cloned);
    runWrite('Duplicating document', () => api.saveDocumentApi(cloned));
    openEditorForEdit(cloned);
  };

  const exportDataJson = () => {
    const json = JSON.stringify({
      agencyProfile,
      documents: savedDocuments,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agency-ops-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restores a backup file into Supabase.
  const importDataJson = async (json: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(json);
      if (parsed.agencyProfile) {
        await api.updateAgencyProfileApi(parsed.agencyProfile);
      }
      if (Array.isArray(parsed.documents)) {
        for (const doc of parsed.documents as SavedDocument[]) {
          await api.saveDocumentApi(doc);
        }
      }
      await refreshAllApiData();
      return true;
    } catch (err) {
      console.error('Failed to import data', err);
      return false;
    }
  };

  return (
    <AgencyContext.Provider
      value={{
        agencyProfile,
        updateAgencyProfile,
        storedSignatures,
        addStoredSignature,
        updateStoredSignature,
        deleteStoredSignature,
        setDefaultSignature,
        savedDocuments,
        currentView,
        setCurrentView,
        editingDocument,
        activeDocType,
        openEditorForNew,
        openEditorForEdit,
        closeEditor,
        saveCurrentDoc,
        deleteDoc,
        clearAllDocs,
        cloneDoc,
        exportDataJson,
        importDataJson,
        refreshDocs,

        authLoading,
        currentUser,
        isAuthenticated: !!currentUser,
        loginModalOpen,
        setLoginModalOpen,
        login,
        logout,
        completeFirstTimePasswordChange,
        updateAccountCredentials,

        clients,
        currentClient,
        addNewClient,
        removeClientItem,
        regenerateClientCredentials,
        sendDocumentToClient,
        unshareDocumentFromClient,

        freelancers,
        tasks,
        addNewFreelancer,
        updateFreelancerItem,
        removeFreelancer,
        regeneratePassword,

        allocateTask,
        changeTaskStatus,
        submitDeliverable,
        removeTask,

        // 10 Ledgers
        contracts,
        addNewContract,
        updateContractItem,
        removeContractItem,

        invoices,
        addNewInvoice,
        updateInvoiceItem,
        removeInvoiceItem,

        payments,
        addNewPayment,
        removePaymentItem,

        expenses,
        addNewExpense,
        removeExpenseItem,

        capitalContributions,
        addNewCapitalContribution,

        partnerEquity,
        updatePartnerEquityItem,

        ipRecords,
        addNewIpRecord,
        updateIpRecordItem,
        removeIpRecordItem,

        assets,
        addNewAsset,
        updateAssetItem,
        removeAssetItem,

        debts,
        addNewDebt,
        updateDebtItem,
        removeDebtItem,

        taxFilings,
        addNewTaxFiling,
        updateTaxFilingItem,
        removeTaxFilingItem,

        // Custom Roles & RBAC
        customRoles,
        addNewRole,
        updateRoleItem,
        canModifyUser,
        canAssignRole,

        // Active Global Currency Translation
        activeCurrency,
        setActiveCurrency,
        formatMoney,
        convertMoney
      }}
    >
      {children}
    </AgencyContext.Provider>
  );
};

export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
};
