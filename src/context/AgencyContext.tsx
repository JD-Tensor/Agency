import React, { createContext, useContext, useState, useEffect } from 'react';
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
  getAgencyProfile, 
  saveAgencyProfile, 
  getSavedDocuments, 
  saveDocument, 
  deleteDocument, 
  clearAllDocuments,
  duplicateDocument,
  exportAllData,
  importAllData 
} from '../services/storage';
import { 
  getStoredFreelancers, 
  saveFreelancer, 
  deleteFreelancer, 
  resetFreelancerPassword,
  changeFreelancerPassword,
  getStoredTasks,
  saveTask,
  updateTaskStatus,
  submitTaskDeliverable,
  deleteTask,
  generateSecureTemporaryPassword,
  generateUsername
} from '../services/freelancerStorage';
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
  defaultSignatureStore
} from '../services/sampleData';
import { ClientAccount } from '../types/client';
import { 
  getStoredClients, 
  saveClient, 
  deleteClient, 
  resetClientPassword,
  shareDocumentWithClient,
  unshareDocumentWithClient
} from '../services/clientStorage';
import * as api from '../services/api';
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
  importDataJson: (json: string) => boolean;
  refreshDocs: () => void;

  // Freelancer & Task & Auth State
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  login: (creds: LoginCredentials) => LoginResult;
  logout: () => void;
  switchUser: (targetId: string) => void;
  switchTestUser: (userId: string) => void;
  completeFirstTimePasswordChange: (freelancerId: string, newPassword: string) => boolean;
  updateAccountCredentials: (data: {
    email?: string;
    password?: string;
    username?: string;
    name?: string;
  }) => Promise<{ success: boolean; error?: string }>;

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
  }) => ClientAccount;
  removeClientItem: (id: string) => void;
  regenerateClientCredentials: (id: string) => { newPassword: string; client: ClientAccount | null };
  sendDocumentToClient: (docId: string, clientId: string, notes?: string) => boolean;
  unshareDocumentFromClient: (docId: string, clientId: string) => boolean;

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
  }) => Freelancer;
  updateFreelancerItem: (freelancer: Freelancer) => void;
  removeFreelancer: (id: string) => void;
  regeneratePassword: (id: string) => { newPassword: string; freelancer: Freelancer | null };

  allocateTask: (data: {
    title: string;
    description: string;
    freelancerId: string;
    projectName: string;
    clientName?: string;
    priority: Task['priority'];
    dueDate: string;
    estimatedHours?: number;
  }) => Task;
  changeTaskStatus: (taskId: string, status: TaskStatus) => void;
  submitDeliverable: (taskId: string, deliverable: TaskDeliverable) => void;
  removeTask: (taskId: string) => void;

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

export const AgencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agencyProfile, setAgencyProfileState] = useState<AgencyProfile>(getAgencyProfile);
  const [activeCurrency, setActiveCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('agency_active_currency');
    if (saved === 'INR' || saved === 'USD') return saved;
    return normalizeCurrencyCode(getAgencyProfile().defaultCurrency);
  });

  const setActiveCurrency = (curr: CurrencyCode) => {
    setActiveCurrencyState(curr);
    localStorage.setItem('agency_active_currency', curr);
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

  // Two Founding Senior Managing Partners (Level 100)
  const defaultSubhadipPartner: AuthUser = {
    id: 'usr-subhadip',
    name: 'Subhadip Jana',
    email: 'subhadipjana866@gmail.com',
    username: 'subhadip866',
    role: 'Senior Managing Partner',
    roleName: 'partner',
    roleLevel: 100,
    accessLevel: 'admin',
    isOwner: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
  };

  const defaultShayanPartner: AuthUser = {
    id: 'usr-shayan',
    name: 'Shayan Das',
    email: 'shayandas267@gmail.com',
    username: 'shayan267',
    role: 'Senior Managing Partner',
    roleName: 'partner',
    roleLevel: 100,
    accessLevel: 'admin',
    isOwner: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
  };

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const savedAuth = localStorage.getItem('agency_active_auth_user');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed && parsed.id) {
          // Sanitize legacy titles / emails
          if (parsed.id === 'usr-subhadip') {
            parsed.role = 'Senior Managing Partner';
            if (parsed.email === 'subhadip@janadas.agency') parsed.email = 'subhadipjana866@gmail.com';
            if (!parsed.username || parsed.username === 'subhadip') parsed.username = 'subhadip866';
          } else if (parsed.id === 'usr-shayan') {
            parsed.role = 'Senior Managing Partner';
            if (parsed.email === 'shayan@janadas.agency') parsed.email = 'shayandas267@gmail.com';
            if (!parsed.username || parsed.username === 'shayan') parsed.username = 'shayan267';
          }
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return null;
  });

  // Fetch all data from SQLite backend API
  const refreshAllApiData = async () => {
    try {
      const [
        rolesData,
        usersData,
        clientsData,
        contractsData,
        invoicesData,
        paymentsData,
        expensesData,
        capitalData,
        equityData,
        ipData,
        assetsData,
        debtsData,
        taxesData,
        docsData,
        tasksData,
        profileData
      ] = await Promise.allSettled([
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
      ]);

      if (rolesData.status === 'fulfilled') setCustomRoles(rolesData.value);
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

      if (profileData.status === 'fulfilled' && profileData.value) {
        setAgencyProfileState(profileData.value);
      }

      if (usersData.status === 'fulfilled' && Array.isArray(usersData.value)) {
        setFreelancers(usersData.value as any);
      } else {
        setFreelancers(getStoredFreelancers());
      }

      if (clientsData.status === 'fulfilled' && Array.isArray(clientsData.value)) {
        setClients(clientsData.value as any);
      } else {
        setClients(getStoredClients());
      }

      if (tasksData.status === 'fulfilled' && Array.isArray(tasksData.value)) {
        setTasks(tasksData.value as any);
      } else {
        setTasks(getStoredTasks());
      }

      if (docsData.status === 'fulfilled' && Array.isArray(docsData.value)) {
        setSavedDocuments(docsData.value);
      } else {
        setSavedDocuments(getSavedDocuments());
      }
    } catch (e) {
      console.warn('API sync warning, using local fallback:', e);
      setFreelancers(getStoredFreelancers());
      setTasks(getStoredTasks());
      setClients(getStoredClients());
      setSavedDocuments(getSavedDocuments());
    }
  };

  useEffect(() => {
    refreshAllApiData();
  }, []);

  const refreshDocs = () => {
    const docs = getSavedDocuments();
    setSavedDocuments(docs);
  };

  const refreshFreelancersAndTasks = () => {
    const fList = getStoredFreelancers();
    const tList = getStoredTasks();
    const cList = getStoredClients();
    setFreelancers(fList);
    setTasks(tList);
    setClients(cList);
  };

  const currentClient: ClientAccount | null = 
    currentUser?.accessLevel === 'client' 
      ? (clients.find(c => c.id === currentUser.clientId) || clients[0] || null)
      : null;

  const updateAgencyProfile = (profile: AgencyProfile) => {
    setAgencyProfileState(profile);
    saveAgencyProfile(profile);
    api.updateAgencyProfileApi(profile).catch(() => {});
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

  // Switch identity tester for Subhadip, Shayan, Rohan, Ananya, Vikram, Priyanka, Kavita
  const switchTestUser = (userId: string) => {
    if (userId === 'usr-subhadip') {
      setCurrentUser(defaultSubhadipPartner);
      localStorage.setItem('agency_active_auth_user', JSON.stringify(defaultSubhadipPartner));
      return;
    } else if (userId === 'usr-shayan') {
      setCurrentUser(defaultShayanPartner);
      localStorage.setItem('agency_active_auth_user', JSON.stringify(defaultShayanPartner));
      return;
    }

    const foundUser = freelancers.find(f => f.id === userId);
    if (foundUser) {
      const newUser: AuthUser = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        roleName: (foundUser as any).roleName || foundUser.role.toLowerCase(),
        roleLevel: (foundUser as any).roleLevel || 40,
        accessLevel: foundUser.accessLevel,
        isOwner: (foundUser as any).roleLevel === 100,
        avatarUrl: foundUser.avatarUrl,
        freelancerId: foundUser.id
      };
      setCurrentUser(newUser);
      localStorage.setItem('agency_active_auth_user', JSON.stringify(newUser));
      return;
    }
  };

  // Auth methods
  const login = (creds: LoginCredentials): LoginResult => {
    const identifier = creds.emailOrUsername.toLowerCase().trim();
    const password = creds.password.trim();

    // 1. Check Senior Managing Partner: Subhadip Jana
    const subhadipUserRecord = freelancers.find(f => f.id === 'usr-subhadip');
    const subhadipDbEmail = subhadipUserRecord?.email?.toLowerCase();
    const subhadipDbUsername = subhadipUserRecord?.credentials?.username?.toLowerCase() || (subhadipUserRecord as any)?.username?.toLowerCase();
    const subhadipDbPass = subhadipUserRecord?.credentials?.password || (subhadipUserRecord as any)?.password;

    const isSubhadipIdentifier = 
      identifier === 'subhadip866' || 
      identifier === 'subhadipjana866@gmail.com' ||
      (subhadipDbEmail && identifier === subhadipDbEmail) ||
      (subhadipDbUsername && identifier === subhadipDbUsername);

    const isSubhadipPass = 
      password === 'subhadip2003#' ||
      (subhadipDbPass && password === subhadipDbPass);

    if (isSubhadipIdentifier && isSubhadipPass) {
      const activeUser: AuthUser = {
        id: 'usr-subhadip',
        name: subhadipUserRecord?.name || 'Subhadip Jana',
        email: subhadipUserRecord?.email || 'subhadipjana866@gmail.com',
        username: subhadipDbUsername || 'subhadip866',
        role: 'Senior Managing Partner',
        roleName: 'partner',
        roleLevel: 100,
        accessLevel: 'admin',
        isOwner: true,
        avatarUrl: subhadipUserRecord?.avatarUrl || defaultSubhadipPartner.avatarUrl
      };
      setCurrentUser(activeUser);
      localStorage.setItem('agency_active_auth_user', JSON.stringify(activeUser));
      setLoginModalOpen(false);
      setCurrentView('partnership_hub');
      return { success: true };
    }

    // 2. Check Senior Managing Partner: Shayan Das
    const shayanUserRecord = freelancers.find(f => f.id === 'usr-shayan');
    const shayanDbEmail = shayanUserRecord?.email?.toLowerCase();
    const shayanDbUsername = shayanUserRecord?.credentials?.username?.toLowerCase() || (shayanUserRecord as any)?.username?.toLowerCase();
    const shayanDbPass = shayanUserRecord?.credentials?.password || (shayanUserRecord as any)?.password;

    const isShayanIdentifier = 
      identifier === 'shayan267' || 
      identifier === 'shayandas267@gmail.com' ||
      (shayanDbEmail && identifier === shayanDbEmail) ||
      (shayanDbUsername && identifier === shayanDbUsername);

    const isShayanPass = 
      password === 'shayan2003#' ||
      (shayanDbPass && password === shayanDbPass);

    if (isShayanIdentifier && isShayanPass) {
      const activeUser: AuthUser = {
        id: 'usr-shayan',
        name: shayanUserRecord?.name || 'Shayan Das',
        email: shayanUserRecord?.email || 'shayandas267@gmail.com',
        username: shayanDbUsername || 'shayan267',
        role: 'Senior Managing Partner',
        roleName: 'partner',
        roleLevel: 100,
        accessLevel: 'admin',
        isOwner: true,
        avatarUrl: shayanUserRecord?.avatarUrl || defaultShayanPartner.avatarUrl
      };
      setCurrentUser(activeUser);
      localStorage.setItem('agency_active_auth_user', JSON.stringify(activeUser));
      setLoginModalOpen(false);
      setCurrentView('partnership_hub');
      return { success: true };
    }

    // 3. Check Clients
    const cls = getStoredClients();
    const clientMatch = cls.find(
      (c) =>
        c.email.toLowerCase() === identifier ||
        c.credentials.username.toLowerCase() === identifier
    );

    if (clientMatch) {
      const isClientMatch =
        (clientMatch.credentials.password && password === clientMatch.credentials.password) ||
        (clientMatch.credentials.temporaryPassword && password === clientMatch.credentials.temporaryPassword) ||
        password === 'client123' ||
        password === 'AeroSync!2026';

      if (isClientMatch) {
        if (clientMatch.credentials.mustChangePassword) {
          return {
            success: false,
            mustChangePassword: true,
            freelancerId: clientMatch.id,
            freelancerName: `${clientMatch.contactName} (${clientMatch.companyName})`
          };
        }

        const clientUser: AuthUser = {
          id: clientMatch.id,
          name: clientMatch.contactName,
          email: clientMatch.email,
          role: `${clientMatch.contactTitle}`,
          roleLevel: 10,
          accessLevel: 'client',
          isOwner: false,
          clientId: clientMatch.id,
          clientCompanyName: clientMatch.companyName
        };
        setCurrentUser(clientUser);
        localStorage.setItem('agency_active_auth_user', JSON.stringify(clientUser));
        setLoginModalOpen(false);
        setCurrentView('client_portal');
        return { success: true };
      }
    }

    // 4. Check Other Team Members
    const fls = getStoredFreelancers();
    const match = fls.find(
      (f) =>
        f.email.toLowerCase() === identifier ||
        f.credentials.username.toLowerCase() === identifier
    );

    if (match) {
      const isTempMatch = match.credentials.temporaryPassword && password === match.credentials.temporaryPassword;
      const isPermMatch = match.credentials.password && password === match.credentials.password;

      if (isTempMatch || isPermMatch) {
        if (match.credentials.mustChangePassword) {
          return {
            success: false,
            mustChangePassword: true,
            freelancerId: match.id,
            freelancerName: match.name
          };
        }

        const roleLvl = (match as any).roleLevel || 
          (match.accessLevel === 'admin' ? 80 : match.accessLevel === 'project_lead' ? 60 : 40);

        const authedUser: AuthUser = {
          id: match.id,
          name: match.name,
          email: match.email,
          role: match.role,
          roleLevel: roleLvl,
          accessLevel: match.accessLevel,
          isOwner: roleLvl === 100,
          freelancerId: match.id
        };
        setCurrentUser(authedUser);
        localStorage.setItem('agency_active_auth_user', JSON.stringify(authedUser));
        setLoginModalOpen(false);

        if (match.accessLevel === 'contributor' || match.accessLevel === 'restricted') {
          setCurrentView('my_workspace');
        } else {
          setCurrentView('partnership_hub');
        }
        return { success: true };
      }
    }

    return { 
      success: false, 
      error: 'Invalid username/email or password. Please verify your credentials.' 
    };
  };

  const completeFirstTimePasswordChange = (freelancerId: string, newPassword: string): boolean => {
    const success = changeFreelancerPassword(freelancerId, newPassword);
    if (!success) return false;
    refreshFreelancersAndTasks();
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('agency_active_auth_user');
    setCurrentView('partnership_hub');
  };

  const updateAccountCredentials = async (data: {
    email?: string;
    password?: string;
    username?: string;
    name?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No active user session found.' };

    try {
      const targetId = currentUser.id;
      const updatedEmail = data.email?.trim() || currentUser.email;
      const updatedUsername = data.username?.trim() || currentUser.username;
      const updatedName = data.name?.trim() || currentUser.name;

      // 1. Update current authenticated user in memory & localStorage
      const updatedAuthUser: AuthUser = {
        ...currentUser,
        email: updatedEmail,
        name: updatedName,
        username: updatedUsername
      };
      setCurrentUser(updatedAuthUser);
      localStorage.setItem('agency_active_auth_user', JSON.stringify(updatedAuthUser));

      // 2. Update freelancers state & local storage
      const updatedFreelancers = freelancers.map(f => {
        if (f.id === targetId) {
          return {
            ...f,
            name: updatedName,
            email: updatedEmail,
            credentials: {
              ...f.credentials,
              username: updatedUsername || f.credentials?.username || '',
              ...(data.password ? { password: data.password } : {})
            },
            ...(data.password ? { password: data.password } : {}),
            username: updatedUsername || (f as any).username
          };
        }
        return f;
      });
      setFreelancers(updatedFreelancers);
      localStorage.setItem('agency_freelancers', JSON.stringify(updatedFreelancers));

      // 3. Persist to database via api.updateUserApi
      const payload: any = {
        name: updatedName,
        email: updatedEmail,
      };
      if (updatedUsername) payload.username = updatedUsername;
      if (data.password) payload.password = data.password;

      await api.updateUserApi(targetId, payload, currentUser.roleLevel || 100).catch(err => {
        console.warn('Could not sync user credentials to database:', err.message);
      });

      // 4. Update Partner Equity designation and email if partner
      if (currentUser.roleLevel === 100) {
        setPartnerEquity(prev => prev.map(p => 
          p.partnerId === targetId ? { ...p, partnerName: updatedName as any, email: updatedEmail, designation: 'Senior Managing Partner' } : p
        ));
        api.updateEquityApi(targetId, { partnerName: updatedName as any, email: updatedEmail, designation: 'Senior Managing Partner' }).catch(() => {});
      }

      // 5. Update agency profile primary signer if relevant
      if (agencyProfile.primarySigner && (agencyProfile.primarySigner.email === currentUser.email || targetId === 'usr-subhadip')) {
        const newSigner = { ...agencyProfile.primarySigner, name: updatedName, email: updatedEmail, title: 'Senior Managing Partner' };
        updateAgencyProfile({ ...agencyProfile, primarySigner: newSigner });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error updating account credentials:', err);
      return { success: false, error: err.message || 'Failed to update credentials' };
    }
  };

  const switchUser = (targetId: string) => {
    switchTestUser(targetId);
  };

  // Hierarchy validation rules
  // Rule 1: Users having same roles can't change or update same roles or higher than them
  const canModifyUser = (targetRoleLevel: number): boolean => {
    if (!currentUser) return false;
    const actorLvl = currentUser.roleLevel || 100;
    return actorLvl > targetRoleLevel;
  };

  // Rule 2: Role giving permission is only available to partners, admins and managers
  const canAssignRole = (roleLevel: number): boolean => {
    if (!currentUser) return false;
    const actorLvl = currentUser.roleLevel || 100;
    if (actorLvl < 60) return false; // Strictly Partner (100), Admin (80), Manager (60)
    return actorLvl > roleLevel;
  };

  // Team management with hierarchy checks
  const addNewFreelancer = (data: {
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
  }): Freelancer => {
    const targetLvl = data.roleLevel || (data.accessLevel === 'admin' ? 80 : data.accessLevel === 'project_lead' ? 60 : 40);
    const actorLvl = currentUser?.roleLevel || 100;

    if (!canAssignRole(targetLvl)) {
      alert(`Hierarchy Violation: As a Level ${actorLvl} user, you cannot create or assign a role at Level ${targetLvl}. You may only assign roles strictly below your level.`);
      throw new Error('Hierarchy violation');
    }

    const id = `usr-${Date.now()}`;
    const username = generateUsername(data.name, data.email);
    const temporaryPassword = generateSecureTemporaryPassword();

    const newFreelancer: Freelancer = {
      id,
      name: data.name,
      email: data.email,
      role: data.role,
      accessLevel: data.accessLevel,
      paymentType: data.paymentType,
      paymentAmount: data.paymentAmount,
      hourlyRate: data.paymentType === 'hourly' ? data.paymentAmount : 0,
      currency: data.currency || activeCurrency || 'USD',
      status: 'active',
      skills: data.skills,
      joinedDate: new Date().toISOString().split('T')[0],
      credentials: {
        username,
        temporaryPassword,
        mustChangePassword: true,
        generatedAt: new Date().toISOString()
      },
      notes: data.notes
    };

    const saved = saveFreelancer(newFreelancer);
    refreshFreelancersAndTasks();
    api.createUserApi(newFreelancer, actorLvl).catch(() => {});
    return saved;
  };

  const updateFreelancerItem = (freelancer: Freelancer) => {
    const targetLvl = (freelancer as any).roleLevel || 40;
    const actorLvl = currentUser?.roleLevel || 100;

    if (!canModifyUser(targetLvl)) {
      alert(`Hierarchy Violation: As Level ${actorLvl}, you cannot update a user at Level ${targetLvl} (same role or higher).`);
      return;
    }

    saveFreelancer(freelancer);
    refreshFreelancersAndTasks();
    api.updateUserApi(freelancer.id, freelancer, actorLvl).catch(() => {});
  };

  const removeFreelancer = (id: string) => {
    const target = freelancers.find(f => f.id === id);
    const targetLvl = (target as any)?.roleLevel || 40;
    const actorLvl = currentUser?.roleLevel || 100;

    if (!canModifyUser(targetLvl)) {
      alert(`Hierarchy Violation: You cannot delete a user at Level ${targetLvl} (same role or higher).`);
      return;
    }

    deleteFreelancer(id);
    refreshFreelancersAndTasks();
    api.deleteUserApi(id, actorLvl).catch(() => {});
  };

  const regeneratePassword = (id: string) => {
    const res = resetFreelancerPassword(id);
    refreshFreelancersAndTasks();
    return res;
  };

  // Client Management
  const addNewClient = (data: any): ClientAccount => {
    const id = `client-${Date.now()}`;
    const username = generateUsername(data.contactName, data.email);
    const temporaryPassword = generateSecureTemporaryPassword();
    const lead = freelancers.find((f) => f.id === data.projectLeadId);

    const newClient: ClientAccount = {
      id,
      companyName: data.companyName,
      contactName: data.contactName,
      contactTitle: data.contactTitle,
      email: data.email,
      phone: data.phone,
      address: data.address,
      credentials: {
        username,
        temporaryPassword,
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
            contactEmail: data.contactEmail || agencyProfile.email
          },
          milestones: []
        }
      ],
      sharedDocumentIds: [],
      createdAt: new Date().toISOString()
    };

    const saved = saveClient(newClient);
    refreshFreelancersAndTasks();
    api.createClientApi(newClient).catch(() => {});
    return saved;
  };

  const removeClientItem = (id: string) => {
    deleteClient(id);
    refreshFreelancersAndTasks();
  };

  const regenerateClientCredentials = (id: string) => {
    const res = resetClientPassword(id);
    refreshFreelancersAndTasks();
    return res;
  };

  const sendDocumentToClient = (docId: string, clientId: string, notes?: string): boolean => {
    const targetClient = clients.find((c) => c.id === clientId);
    if (!targetClient) return false;
    shareDocumentWithClient(clientId, docId);

    const allDocs = getSavedDocuments();
    const doc = allDocs.find((d) => d.id === docId);
    if (doc) {
      const updatedDoc: SavedDocument = {
        ...doc,
        clientId,
        clientName: targetClient.companyName,
        status: doc.status === 'draft' ? 'issued' : doc.status,
        sharedWithClient: true,
        sharedAt: new Date().toISOString(),
        clientNotes: notes !== undefined ? notes : doc.clientNotes
      };
      saveDocument(updatedDoc);
      api.saveDocumentApi(updatedDoc).catch(() => {});
      if (editingDocument?.id === docId) {
        setEditingDocument(updatedDoc);
      }
    }

    refreshDocs();
    refreshFreelancersAndTasks();
    return true;
  };

  const unshareDocumentFromClient = (docId: string, clientId: string): boolean => {
    unshareDocumentWithClient(clientId, docId);
    const allDocs = getSavedDocuments();
    const doc = allDocs.find((d) => d.id === docId);
    if (doc) {
      const updatedDoc: SavedDocument = {
        ...doc,
        sharedWithClient: false
      };
      saveDocument(updatedDoc);
      api.saveDocumentApi(updatedDoc).catch(() => {});
    }
    refreshDocs();
    refreshFreelancersAndTasks();
    return true;
  };

  // Task allocation
  const allocateTask = (data: any): Task => {
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
      estimatedHours: data.estimatedHours || 8
    };

    const saved = saveTask(newTask);
    refreshFreelancersAndTasks();
    api.createTaskApi(newTask).catch(() => {});
    return saved;
  };

  const changeTaskStatus = (taskId: string, status: TaskStatus) => {
    updateTaskStatus(taskId, status);
    refreshFreelancersAndTasks();
    api.updateTaskApi(taskId, { status }).catch(() => {});
  };

  const submitDeliverable = (taskId: string, deliverable: TaskDeliverable) => {
    submitTaskDeliverable(taskId, deliverable);
    refreshFreelancersAndTasks();
    api.updateTaskApi(taskId, {
      deliverables: [deliverable],
      status: 'review'
    }).catch(() => {});
  };

  const removeTask = (taskId: string) => {
    deleteTask(taskId);
    refreshFreelancersAndTasks();
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
    await api.createContractApi(newRecord);
  };

  const updateContractItem = async (id: string, contract: Partial<ClientContractRecord>) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...contract, updatedAt: new Date().toISOString() } : c));
    await api.updateContractApi(id, contract);
  };

  const removeContractItem = async (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
    await api.deleteContractApi(id);
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
    await api.createInvoiceApi(newRecord);
  };

  const updateInvoiceItem = async (id: string, invoice: Partial<InvoiceRecord>) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...invoice, updatedAt: new Date().toISOString() } : i));
    await api.updateInvoiceApi(id, invoice);
  };

  const removeInvoiceItem = async (id: string) => {
    setInvoices(prev => prev.filter(i => i.id !== id));
    await api.deleteInvoiceApi(id);
  };

  // 3. Payments
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
    await api.createPaymentApi(newRecord);
    // Refresh invoices to reflect updated payment status
    const invs = await api.fetchInvoicesApi();
    setInvoices(invs);
  };

  const removePaymentItem = async (id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    await api.deletePaymentApi(id);
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
    await api.createExpenseApi(newRecord);
  };

  const removeExpenseItem = async (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    await api.deleteExpenseApi(id);
  };

  // 5. Capital Contributions
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
    await api.createCapitalContributionApi(newRecord);
    const eq = await api.fetchEquityApi();
    setPartnerEquity(eq);
  };

  // 6. Partner Equity
  const updatePartnerEquityItem = async (partnerId: string, data: Partial<PartnerEquityRecord>) => {
    setPartnerEquity(prev => prev.map(p => p.partnerId === partnerId ? { ...p, ...data, lastUpdated: new Date().toISOString() } : p));
    await api.updateEquityApi(partnerId, data);
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
    await api.createIpRecordApi(newRecord);
  };

  const updateIpRecordItem = async (id: string, record: Partial<IpOwnershipRecord>) => {
    setIpRecords(prev => prev.map(r => r.id === id ? { ...r, ...record } : r));
    await api.updateIpRecordApi(id, record);
  };

  const removeIpRecordItem = async (id: string) => {
    setIpRecords(prev => prev.filter(r => r.id !== id));
    await api.deleteIpRecordApi(id);
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
      depreciationRatePercent: asset.depreciationRatePercent || 15,
      assignedTo: asset.assignedTo || 'Subhadip Jana',
      condition: asset.condition || 'active_excellent',
      notes: asset.notes,
      createdAt: now,
      updatedAt: now
    };
    setAssets(prev => [newRecord, ...prev]);
    await api.createAssetApi(newRecord);
  };

  const updateAssetItem = async (id: string, asset: Partial<AssetRecord>) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...asset, updatedAt: new Date().toISOString() } : a));
    await api.updateAssetApi(id, asset);
  };

  const removeAssetItem = async (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
    await api.deleteAssetApi(id);
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
    await api.createDebtApi(newRecord);
  };

  const updateDebtItem = async (id: string, debt: Partial<DebtRecord>) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, ...debt, updatedAt: new Date().toISOString() } : d));
    await api.updateDebtApi(id, debt);
  };

  const removeDebtItem = async (id: string) => {
    setDebts(prev => prev.filter(d => d.id !== id));
    await api.deleteDebtApi(id);
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
    await api.createTaxFilingApi(newRecord);
  };

  const updateTaxFilingItem = async (id: string, filing: Partial<TaxFilingRecord>) => {
    setTaxFilings(prev => prev.map(t => t.id === id ? { ...t, ...filing, updatedAt: new Date().toISOString() } : t));
    await api.updateTaxFilingApi(id, filing);
  };

  const removeTaxFilingItem = async (id: string) => {
    setTaxFilings(prev => prev.filter(t => t.id !== id));
    await api.deleteTaxFilingApi(id);
  };

  // Custom Roles Creation & Hierarchy
  const addNewRole = async (role: Partial<CustomRoleDefinition>): Promise<{ success: boolean; error?: string }> => {
    const actorLvl = currentUser?.roleLevel || 100;
    if (!canAssignRole(role.level || 0)) {
      return { 
        success: false, 
        error: `Hierarchy violation: As a Level ${actorLvl} user, you cannot create a role at Level ${role.level}. It must be strictly lower.` 
      };
    }

    try {
      const created = await api.createRoleApi(role, actorLvl);
      setCustomRoles(prev => [...prev, created]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateRoleItem = async (id: string, role: Partial<CustomRoleDefinition>): Promise<{ success: boolean; error?: string }> => {
    const actorLvl = currentUser?.roleLevel || 100;
    try {
      await api.updateRoleApi(id, role, actorLvl);
      setCustomRoles(prev => prev.map(r => r.id === id ? { ...r, ...role } : r));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // Documents Helpers
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

  const saveCurrentDoc = (doc: SavedDocument) => {
    const saved = saveDocument(doc);
    setEditingDocument(saved);
    api.saveDocumentApi(saved).catch(() => {});
    refreshDocs();
  };

  const deleteDoc = (id: string) => {
    deleteDocument(id);
    api.deleteDocumentApi(id).catch(() => {});
    refreshDocs();
    if (editingDocument?.id === id) {
      setEditingDocument(null);
      setCurrentView('library');
    }
  };

  const clearAllDocs = () => {
    clearAllDocuments();
    setSavedDocuments([]);
  };

  const cloneDoc = (id: string) => {
    const cloned = duplicateDocument(id);
    refreshDocs();
    if (cloned) {
      openEditorForEdit(cloned);
    }
  };

  const exportDataJson = () => {
    const json = exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agency-ops-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJson = (json: string): boolean => {
    const ok = importAllData(json);
    if (ok) {
      setAgencyProfileState(getAgencyProfile());
      refreshDocs();
      refreshFreelancersAndTasks();
    }
    return ok;
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

        currentUser,
        isAuthenticated: !!currentUser,
        loginModalOpen,
        setLoginModalOpen,
        login,
        logout,
        switchUser,
        switchTestUser,
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
