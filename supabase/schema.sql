-- =============================================================================
-- JANA & DAS ENGINEERING PARTNERS - SUPABASE POSTGRESQL SCHEMA
-- Complete relational schema for partnership firm operations and all 10 ledgers
-- =============================================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Agency / Firm Profile
CREATE TABLE IF NOT EXISTS public.agency_profile (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    email TEXT,
    phone TEXT,
    website TEXT,
    address TEXT,
    "cityStateZip" TEXT,
    country TEXT,
    "taxId" TEXT,
    "defaultCurrency" TEXT DEFAULT 'USD',
    "currencySymbol" TEXT DEFAULT '$',
    "bankDetails" JSONB DEFAULT '{}'::jsonb,
    "primarySigner" JSONB DEFAULT '{}'::jsonb,
    "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Custom Roles & RBAC Matrix
CREATE TABLE IF NOT EXISTS public.custom_roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    level INTEGER NOT NULL,
    "isSystem" BOOLEAN DEFAULT false,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Users / Partners / Team Members
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    "avatarUrl" TEXT,
    role TEXT NOT NULL,
    "roleLevel" INTEGER NOT NULL DEFAULT 40,
    status TEXT NOT NULL DEFAULT 'active',
    "paymentType" TEXT DEFAULT 'fixed',
    "paymentAmount" NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    skills JSONB DEFAULT '[]'::jsonb,
    "joinedDate" TEXT,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    "temporaryPassword" TEXT,
    "mustChangePassword" BOOLEAN DEFAULT false,
    notes TEXT
);

-- 4. Clients
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactTitle" TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    "avatarUrl" TEXT,
    username TEXT UNIQUE NOT NULL,
    password TEXT,
    "temporaryPassword" TEXT,
    "mustChangePassword" BOOLEAN DEFAULT false,
    orders JSONB DEFAULT '[]'::jsonb,
    "sharedDocumentIds" JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. LEDGER 1: Client Contracts
CREATE TABLE IF NOT EXISTS public.contracts (
    id TEXT PRIMARY KEY,
    "contractNumber" TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    type TEXT NOT NULL,
    "contractValue" NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "signedDate" TEXT,
    "partnerInCharge" TEXT NOT NULL,
    status TEXT NOT NULL,
    "attachedDocId" TEXT,
    "termsSummary" TEXT,
    "ipOwnershipClause" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. LEDGER 2: Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    "invoiceNumber" TEXT UNIQUE NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "contractId" TEXT,
    "issueDate" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    "taxPercent" NUMERIC DEFAULT 0,
    "taxAmount" NUMERIC DEFAULT 0,
    "discountAmount" NUMERIC DEFAULT 0,
    "grandTotal" NUMERIC NOT NULL DEFAULT 0,
    "paidAmount" NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'draft',
    "paymentTerms" TEXT,
    notes TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 7. LEDGER 3: Client Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    "paymentNumber" TEXT UNIQUE NOT NULL,
    "invoiceId" TEXT,
    "contractId" TEXT,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    "paymentDate" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "transactionRef" TEXT,
    "depositingBank" TEXT,
    "receiptDocId" TEXT,
    notes TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. LEDGER 4: Operating Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    "expenseNumber" TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    vendor TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    date TEXT NOT NULL,
    "paidBy" TEXT NOT NULL,
    "reimbursementStatus" TEXT DEFAULT 'not_applicable',
    "taxDeductible" BOOLEAN DEFAULT true,
    "receiptAttachmentName" TEXT,
    notes TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 9. LEDGER 5: Partnership Capital Contributions
CREATE TABLE IF NOT EXISTS public.capital_contributions (
    id TEXT PRIMARY KEY,
    "partnerName" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    date TEXT NOT NULL,
    "contributionType" TEXT NOT NULL,
    "transactionRef" TEXT,
    "bankAccount" TEXT,
    notes TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 10. LEDGER 6: Partner Equity & Ownership Accounts
CREATE TABLE IF NOT EXISTS public.partner_equity (
    "partnerId" TEXT PRIMARY KEY,
    "partnerName" TEXT NOT NULL,
    designation TEXT NOT NULL,
    email TEXT NOT NULL,
    "ownershipPercentage" NUMERIC NOT NULL,
    "profitSharePercentage" NUMERIC NOT NULL,
    "initialCapitalContribution" NUMERIC NOT NULL,
    "totalContributed" NUMERIC NOT NULL,
    "totalDrawings" NUMERIC DEFAULT 0,
    "netCapitalBalance" NUMERIC NOT NULL,
    "signatureImage" TEXT,
    "lastUpdated" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 11. Partner Drawings
CREATE TABLE IF NOT EXISTS public.partner_drawings (
    id TEXT PRIMARY KEY,
    "partnerName" TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date TEXT NOT NULL,
    purpose TEXT,
    "transactionRef" TEXT,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 12. LEDGER 7: IP / Code Ownership Registry
CREATE TABLE IF NOT EXISTS public.ip_ownership (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    "repositoryUrl" TEXT,
    "commitHashOrVersion" TEXT,
    "ownershipType" TEXT NOT NULL,
    "clientAssignmentId" TEXT,
    "clientName" TEXT,
    "primaryAuthorPartner" TEXT NOT NULL,
    "registrationDate" TEXT NOT NULL,
    "legalStatus" TEXT NOT NULL,
    "licenseTerms" TEXT,
    summary TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 13. LEDGER 8: Fixed Assets
CREATE TABLE IF NOT EXISTS public.assets (
    id TEXT PRIMARY KEY,
    "assetNumber" TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    "purchaseDate" TEXT NOT NULL,
    "purchaseCost" NUMERIC NOT NULL,
    "currentBookValue" NUMERIC NOT NULL,
    "depreciationRatePercent" NUMERIC DEFAULT 15,
    "assignedTo" TEXT,
    "serialNumberOrKey" TEXT,
    condition TEXT DEFAULT 'active_excellent',
    notes TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 14. LEDGER 9: Debts & Liabilities
CREATE TABLE IF NOT EXISTS public.debts (
    id TEXT PRIMARY KEY,
    "debtNumber" TEXT UNIQUE NOT NULL,
    creditor TEXT NOT NULL,
    "debtType" TEXT NOT NULL,
    "principalAmount" NUMERIC NOT NULL,
    "currentBalance" NUMERIC NOT NULL,
    "interestRatePercent" NUMERIC DEFAULT 0,
    "repaymentTermMonths" INTEGER DEFAULT 12,
    "monthlyPayment" NUMERIC DEFAULT 0,
    "startDate" TEXT,
    "maturityDate" TEXT,
    status TEXT DEFAULT 'active',
    notes TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 15. LEDGER 10: Statutory Tax Filings
CREATE TABLE IF NOT EXISTS public.tax_filings (
    id TEXT PRIMARY KEY,
    "filingNumber" TEXT UNIQUE NOT NULL,
    "taxType" TEXT NOT NULL,
    title TEXT NOT NULL,
    "fiscalYear" TEXT NOT NULL,
    "periodOrQuarter" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "filingDate" TEXT,
    "ackNumberOrArn" TEXT,
    "taxLiabilityAmount" NUMERIC DEFAULT 0,
    "taxPaidAmount" NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'draft',
    "signedByPartner" TEXT NOT NULL,
    "auditorNotes" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 16. Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    "clientName" TEXT,
    "clientId" TEXT,
    status TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    "agencySnapshot" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "sharedWithClient" BOOLEAN DEFAULT false,
    "sharedAt" TIMESTAMPTZ,
    "clientNotes" TEXT
);

-- 17. Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    "freelancerId" TEXT NOT NULL,
    "freelancerName" TEXT,
    "projectName" TEXT,
    "clientName" TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    "dueDate" TEXT,
    "estimatedHours" NUMERIC DEFAULT 0,
    "deliverableUrl" TEXT,
    "deliverableNotes" TEXT,
    "submittedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Configure public access for the application client key
-- =============================================================================

DO $$ 
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'agency_profile', 'custom_roles', 'users', 'clients',
        'contracts', 'invoices', 'payments', 'expenses',
        'capital_contributions', 'partner_equity', 'partner_drawings',
        'ip_ownership', 'assets', 'debts', 'tax_filings',
        'documents', 'tasks'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Public access for all operations" ON public.%I;', tbl);
        EXECUTE format('CREATE POLICY "Public access for all operations" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
    END LOOP;
END $$;

