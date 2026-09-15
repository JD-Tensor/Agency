import { AgencyProfile } from './agency';

export type DocumentType = 
  | 'discovery'
  | 'proposal'
  | 'quotation'
  | 'rate_chart'
  | 'onboarding'
  | 'nda'
  | 'invoice'
  | 'receipt'
  | 'offboarding';

export interface DocumentMeta {
  id: string;
  type: DocumentType;
  title: string;
  docNumber: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  status: 'draft' | 'issued' | 'approved' | 'paid' | 'completed';
}

// 1. Discovery Call Model
export interface DiscoveryCallData {
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientRole: string;
  callDate: string;
  attendees: string;
  projectTitle: string;
  businessOverview: string;
  primaryGoals: string[];
  painPoints: string[];
  targetAudience: string;
  desiredFeatures: string[];
  techStackPreference: string;
  budgetRange: string;
  targetLaunchDate: string;
  competitorsOrReferences: string;
  immediateNextSteps: { action: string; owner: string; dueDate: string }[];
  additionalNotes: string;
}

// 2. Proposal Model
export interface ProposalMilestone {
  title: string;
  duration: string;
  deliverables: string[];
  price?: number;
}

export interface ProposalPricingTier {
  name: string;
  price: number;
  highlighted?: boolean;
  features: string[];
}

export interface DocumentSignatorySelection {
  mode: 'single' | 'dual';
  signer1Id?: string;
  signer1Name?: string;
  signer1Title?: string;
  signer1Image?: string;
  signer2Id?: string;
  signer2Name?: string;
  signer2Title?: string;
  signer2Image?: string;
}

export interface ProposalData {
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientAddress: string;
  proposalNumber: string;
  issueDate: string;
  validUntil: string;
  projectTitle: string;
  executiveSummary: string;
  problemStatement: string;
  proposedSolution: string;
  milestones: ProposalMilestone[];
  pricingModel: 'milestone' | 'fixed' | 'tiers';
  pricingTiers?: ProposalPricingTier[];
  fixedTotal?: number;
  paymentSchedule: string;
  agencyAdvantages: string[];
  termsAndConditions: string;
  currency?: string;
  currencySymbol?: string;
  clientSignerName?: string;
  clientSignerTitle?: string;
  agencySigners?: DocumentSignatorySelection;
}

// 2b. Quotation Model
export interface QuotationItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit: string; // e.g. 'Milestone', 'Hours', 'Fixed Package', 'Sprint'
  unitPrice: number;
  taxable: boolean;
}

export interface QuotationAddonOption {
  id: string;
  title: string;
  description: string;
  price: number;
  selected: boolean;
}

export interface QuotationData {
  quotationNumber: string;
  issueDate: string;
  validUntil: string;
  currency: string;
  currencySymbol: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress: string;
  projectTitle: string;
  projectScopeOverview: string;
  lineItems: QuotationItem[];
  addonOptions: QuotationAddonOption[];
  discountPercent?: number;
  taxPercent?: number;
  paymentTerms: string;
  timelineEstimate: string;
  termsAndAssumptions: string[];
  clientSignerName?: string;
  clientSignerTitle?: string;
  acceptanceNotes?: string;
  agencySigners?: DocumentSignatorySelection;
}

// 3. Onboarding Document Model
export interface OnboardingChecklistItem {
  task: string;
  category: 'Credentials' | 'Assets' | 'Information' | 'Meeting';
  provided: boolean;
  notes?: string;
}

export interface OnboardingTeamMember {
  name: string;
  role: string;
  email: string;
  slackHandle?: string;
}

export interface OnboardingData {
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  projectTitle: string;
  startDate: string;
  targetCompletionDate: string;
  welcomeMessage: string;
  primaryCommunicationChannel: string;
  meetingCadence: string;
  workingHours: string;
  teamMembers: OnboardingTeamMember[];
  accessChecklist: OnboardingChecklistItem[];
  projectManagementTool: string;
  deliverableReviewProcess: string;
  firstWeekMilestones: string[];
}

// 4. NDA Model
export interface NdaData {
  agreementDate: string;
  agreementType: 'mutual' | 'one-way';
  disclosingPartyName: string;
  disclosingPartyAddress: string;
  disclosingPartyRepresentative: string;
  receivingPartyName: string;
  receivingPartyAddress: string;
  receivingPartyRepresentative: string;
  purpose: string;
  confidentialInfoScope: string;
  durationYears: number;
  governingLawState: string;
  governingCountry: string;
  remediesClause: string;
  nonSolicitationClause: boolean;
  additionalClauses?: string;
  agencySigners?: DocumentSignatorySelection;
}

// 5. Invoice Model
export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  poNumber?: string;
  currency: string;
  currencySymbol: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientAddress: string;
  clientTaxId?: string;
  lineItems: InvoiceLineItem[];
  discountPercent?: number;
  taxPercent?: number;
  notes: string;
  paymentInstructions: string;
  agencySigners?: DocumentSignatorySelection;
}

// 6. Receipt Model
export interface ReceiptData {
  receiptNumber: string;
  originalInvoiceNumber: string;
  paymentDate: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  amountPaid: number;
  currency: string;
  currencySymbol: string;
  paymentMethod: 'Credit Card' | 'Wire Transfer' | 'Stripe' | 'PayPal' | 'Bank Transfer' | 'Cash' | string;
  transactionReference: string;
  balanceRemaining: number;
  receivedForDescription: string;
  thankYouMessage: string;
  agencySigners?: DocumentSignatorySelection;
}

// 7. Offboarding Document Model
export interface HandoverAsset {
  item: string;
  locationOrUrl: string;
  accessTransferred: boolean;
  notes?: string;
}

export interface OffboardingData {
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  projectTitle: string;
  projectCompletedDate: string;
  executiveSummary: string;
  deliverablesDelivered: string[];
  assetsAndCredentialsHandover: HandoverAsset[];
  warrantyAndSupportPeriod: string;
  hostingAndMaintenanceNotes: string;
  postLaunchRecommendations: string[];
  testimonialRequestUrl?: string;
  formalSignoffStatement: string;
  clientApproverName?: string;
  clientSignDate?: string;
  agencySigners?: DocumentSignatorySelection;
}

// 8. Rate Chart Model
export interface RateScaleDefinition {
  scaleName: 'Simple' | 'Medium' | 'Complex' | string;
  price: number;
  timeline?: string;
  description: string;
  features: string[]; // what it includes / deliverables
  limitations: string[]; // limitations / out of scope
}

export interface RateChartServiceItem {
  id: string;
  serviceName: string;
  category?: string;
  description?: string;
  simple: RateScaleDefinition;
  medium: RateScaleDefinition;
  complex: RateScaleDefinition;
}

export interface RateChartData {
  chartTitle: string;
  rateChartNumber: string;
  effectiveDate: string;
  validUntil: string;
  preparedFor: string;
  clientCompany?: string;
  clientName?: string;
  currency: string;
  currencySymbol: string;
  introductoryNotes: string;
  services: RateChartServiceItem[];
  commercialTerms: string[];
  additionalNotes?: string;
  authorizedSignerTitle?: string;
  authorizedSignerName?: string;
  agencySigners?: DocumentSignatorySelection;
}

export type DocumentPayload = 
  | { type: 'discovery'; data: DiscoveryCallData }
  | { type: 'proposal'; data: ProposalData }
  | { type: 'quotation'; data: QuotationData }
  | { type: 'rate_chart'; data: RateChartData }
  | { type: 'onboarding'; data: OnboardingData }
  | { type: 'nda'; data: NdaData }
  | { type: 'invoice'; data: InvoiceData }
  | { type: 'receipt'; data: ReceiptData }
  | { type: 'offboarding'; data: OffboardingData };

export interface SavedDocument {
  id: string;
  type: DocumentType;
  title: string;
  docNumber: string;
  createdAt: string;
  updatedAt: string;
  clientName: string;
  clientId?: string;
  status: 'draft' | 'issued' | 'approved' | 'paid' | 'completed';
  payload: DocumentPayload;
  agencySnapshot: AgencyProfile;
  sharedWithClient?: boolean;
  sharedAt?: string;
  clientNotes?: string;
}

