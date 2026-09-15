export interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  routingOrSwift: string;
  iban?: string;
  notes?: string;
}

export interface AuthorizedSigner {
  name: string;
  title: string;
  email: string;
  signatureText?: string;
  signatureImage?: string;
}

export interface StoredSignature {
  id: string;
  name: string;
  title: string;
  email?: string;
  partnerId?: 'usr-subhadip' | 'usr-shayan' | string;
  signatureImage: string; // Data URL or SVG string
  signatureText?: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface AgencyProfile {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  cityStateZip: string;
  country: string;
  taxId: string; // e.g. VAT, GST, EIN
  logoUrl?: string;
  defaultCurrency: string;
  currencySymbol: string;
  bankDetails: BankDetails;
  primarySigner: AuthorizedSigner;
  signatureStore?: StoredSignature[];
}

