// Partnership Firm Types & Schema

export type CoreRole = 
  | 'partner' 
  | 'admin' 
  | 'manager' 
  | 'developer' 
  | 'designer' 
  | 'auditor';

export type AppRole = CoreRole | string;

export interface RolePermissionMatrix {
  manage_firm_equity: boolean;
  manage_roles: boolean;
  manage_contracts: boolean;
  manage_invoices: boolean;
  manage_payments: boolean;
  manage_expenses: boolean;
  manage_ip: boolean;
  manage_assets: boolean;
  manage_debts: boolean;
  manage_taxes: boolean;
  manage_team: boolean;
  manage_clients: boolean;
  manage_tasks: boolean;
  create_documents: boolean;
}

export interface CustomRoleDefinition {
  id: string;
  name: string;
  description: string;
  level: number; // Partner: 100, Admin: 80, Manager: 60, Developer/Designer: 40, Auditor: 30, Custom: 10-50
  isSystem: boolean;
  permissions: RolePermissionMatrix;
  createdAt: string;
}

// 1. Client Contract Record
export type ContractType = 'msa' | 'sow' | 'retainer' | 'fixed_price' | 'nda';
export type ContractStatus = 'draft' | 'pending_signature' | 'active' | 'completed' | 'terminated';

export interface ClientContractRecord {
  id: string;
  contractNumber: string;
  title: string;
  clientId: string;
  clientName: string;
  type: ContractType;
  contractValue: number;
  currency: string;
  startDate: string;
  endDate: string;
  signedDate?: string;
  partnerInCharge: 'Subhadip Jana' | 'Shayan Das' | string;
  status: ContractStatus;
  attachedDocId?: string;
  termsSummary: string;
  ipOwnershipClause: string;
  createdAt: string;
  updatedAt: string;
}

// 2. Invoice Record
export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'void';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  contractId?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paidAmount: number;
  status: InvoiceStatus;
  paymentTerms: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 3. Payment Record
export type PaymentMethod = 'wire_transfer' | 'ach' | 'upi' | 'stripe' | 'bank_deposit' | 'cash';

export interface PaymentRecord {
  id: string;
  paymentNumber: string;
  invoiceId?: string;
  contractId?: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionRef: string;
  depositingBank: string;
  receiptDocId?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

// 4. Expense Record
export type ExpenseCategory = 
  | 'software_saas' 
  | 'cloud_hosting' 
  | 'hardware_equipment' 
  | 'office_rent_utilities' 
  | 'contractor_payout' 
  | 'legal_compliance' 
  | 'travel_marketing' 
  | 'taxes_fees' 
  | 'other';

export type PaidBySource = 'firm_account' | 'Subhadip Jana' | 'Shayan Das';
export type ReimbursementStatus = 'not_applicable' | 'pending_reimbursement' | 'reimbursed';

export interface ExpenseRecord {
  id: string;
  expenseNumber: string;
  title: string;
  category: ExpenseCategory;
  vendor: string;
  amount: number;
  currency: string;
  date: string;
  paidBy: PaidBySource;
  reimbursementStatus: ReimbursementStatus;
  taxDeductible: boolean;
  receiptAttachmentName?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

// 5. Capital Contribution Record
export type ContributionType = 
  | 'initial_capital' 
  | 'cash_infusion' 
  | 'equipment_hardware' 
  | 'ip_valuation' 
  | 'sweat_equity';

export interface CapitalContributionRecord {
  id: string;
  partnerName: 'Subhadip Jana' | 'Shayan Das';
  partnerId: string;
  amount: number;
  currency: string;
  date: string;
  contributionType: ContributionType;
  transactionRef: string;
  bankAccount: string;
  notes: string;
  createdAt: string;
}

// 6. Ownership & Equity Record
export interface PartnerEquityRecord {
  partnerId: string;
  partnerName: 'Subhadip Jana' | 'Shayan Das';
  designation: string;
  email: string;
  ownershipPercentage: number; // e.g. 50.0
  profitSharePercentage: number; // e.g. 50.0
  initialCapitalContribution: number;
  totalContributed: number;
  totalDrawings: number;
  netCapitalBalance: number;
  signatureImage?: string;
  lastUpdated: string;
}

export interface PartnerDrawingRecord {
  id: string;
  partnerName: 'Subhadip Jana' | 'Shayan Das';
  amount: number;
  date: string;
  purpose: string;
  transactionRef: string;
  approvedBy: string;
  createdAt: string;
}

// 7. IP / Code Ownership Record
export type IpOwnershipType = 
  | '100% Partnership Proprietary' 
  | 'Client Work-for-Hire Assigned' 
  | 'Dual-Licensed' 
  | 'Open Source';

export type IpLegalStatus = 'registered' | 'copyright_claimed' | 'assigned_to_client' | 'pending';

export interface IpOwnershipRecord {
  id: string;
  title: string;
  repositoryUrl?: string;
  commitHashOrVersion?: string;
  ownershipType: IpOwnershipType;
  clientAssignmentId?: string;
  clientName?: string;
  primaryAuthorPartner: string;
  registrationDate: string;
  legalStatus: IpLegalStatus;
  licenseTerms: string;
  summary: string;
  createdAt: string;
}

// 8. Asset Record
export type AssetCategory = 
  | 'computer_hardware' 
  | 'software_license' 
  | 'domain_digital' 
  | 'office_equipment' 
  | 'intellectual_property';

export type AssetCondition = 'active_excellent' | 'active_fair' | 'maintenance' | 'retired';

export interface AssetRecord {
  id: string;
  assetNumber: string;
  name: string;
  category: AssetCategory;
  purchaseDate: string;
  purchaseCost: number;
  currentBookValue: number;
  depreciationRatePercent: number;
  assignedTo: string;
  serialNumberOrKey?: string;
  condition: AssetCondition;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 9. Debt & Liability Record
export type DebtType = 
  | 'bank_loan' 
  | 'partner_loan_to_firm' 
  | 'vendor_payable' 
  | 'credit_line';

export type DebtStatus = 'active' | 'settled' | 'defaulted';

export interface DebtRecord {
  id: string;
  debtNumber: string;
  creditor: string;
  debtType: DebtType;
  principalAmount: number;
  currentBalance: number;
  interestRatePercent: number;
  repaymentTermMonths: number;
  monthlyPayment: number;
  startDate: string;
  maturityDate: string;
  status: DebtStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// 10. Tax Filing Record
export type TaxType = 
  | 'gst_vat_return' 
  | 'partnership_income_tax' 
  | 'tds_withholding' 
  | 'advance_tax_q1_q4' 
  | 'annual_audit';

export type TaxFilingStatus = 'draft' | 'pending_audit' | 'filed' | 'verified';

export interface TaxFilingRecord {
  id: string;
  filingNumber: string;
  taxType: TaxType;
  title: string;
  fiscalYear: string;
  periodOrQuarter: string;
  dueDate: string;
  filingDate?: string;
  ackNumberOrArn?: string;
  taxLiabilityAmount: number;
  taxPaidAmount: number;
  status: TaxFilingStatus;
  signedByPartner: 'Subhadip Jana' | 'Shayan Das' | string;
  auditorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

