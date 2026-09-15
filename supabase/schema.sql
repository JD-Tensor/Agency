-- =============================================================================
-- JANA & DAS ENGINEERING PARTNERS - SUPABASE POSTGRESQL SCHEMA
-- Tables, Supabase Auth linkage, row level security, and ledger triggers.
--
-- Safe to re-run: every statement is idempotent. Run the whole file in the
-- Supabase SQL Editor, then run seed.sql.
-- =============================================================================

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
    "logoUrl" TEXT,
    "defaultCurrency" TEXT DEFAULT 'USD',
    "currencySymbol" TEXT DEFAULT '$',
    "bankDetails" JSONB DEFAULT '{}'::jsonb,
    "primarySigner" JSONB DEFAULT '{}'::jsonb,
    "signatureStore" JSONB DEFAULT '[]'::jsonb,
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
-- Passwords are never stored here. Each row links to a Supabase Auth account
-- through auth_user_id.
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    "avatarUrl" TEXT,
    role TEXT NOT NULL,
    "roleLevel" INTEGER NOT NULL DEFAULT 40,
    "accessLevel" TEXT NOT NULL DEFAULT 'contributor',
    status TEXT NOT NULL DEFAULT 'active',
    "paymentType" TEXT DEFAULT 'fixed',
    "paymentAmount" NUMERIC DEFAULT 0,
    "hourlyRate" NUMERIC DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    skills JSONB DEFAULT '[]'::jsonb,
    "joinedDate" TEXT,
    username TEXT UNIQUE NOT NULL,
    "mustChangePassword" BOOLEAN DEFAULT false,
    "generatedAt" TIMESTAMPTZ,
    "lastLoginAt" TIMESTAMPTZ,
    notes TEXT
);

-- 4. Clients
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactTitle" TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    "avatarUrl" TEXT,
    username TEXT UNIQUE NOT NULL,
    "mustChangePassword" BOOLEAN DEFAULT false,
    "generatedAt" TIMESTAMPTZ,
    "lastLoginAt" TIMESTAMPTZ,
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
    "assignedBy" TEXT,
    "projectName" TEXT,
    "clientName" TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'todo',
    "dueDate" TEXT,
    "estimatedHours" NUMERIC DEFAULT 0,
    "actualHours" NUMERIC,
    deliverables JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- =============================================================================
-- UPGRADE PATH FOR DATABASES CREATED WITH THE EARLIER SCHEMA
-- =============================================================================

ALTER TABLE public.agency_profile ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE public.agency_profile ADD COLUMN IF NOT EXISTS "signatureStore" JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "accessLevel" TEXT NOT NULL DEFAULT 'contributor';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "hourlyRate" NUMERIC DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "generatedAt" TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMPTZ;
-- Plaintext passwords must never live in application tables.
ALTER TABLE public.users DROP COLUMN IF EXISTS password;
ALTER TABLE public.users DROP COLUMN IF EXISTS "temporaryPassword";

ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "generatedAt" TIMESTAMPTZ;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMPTZ;
ALTER TABLE public.clients DROP COLUMN IF EXISTS password;
ALTER TABLE public.clients DROP COLUMN IF EXISTS "temporaryPassword";

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "assignedBy" TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "actualHours" NUMERIC;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS deliverables JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- =============================================================================
-- IDENTITY HELPERS
-- Resolve the signed-in Supabase Auth user to an app identity. SECURITY DEFINER
-- so policies can call them without recursive RLS evaluation.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.app_user_id() RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.users
  WHERE auth_user_id = auth.uid() AND status <> 'offboarded'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.app_role_level() RETURNS INTEGER
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((
    SELECT "roleLevel" FROM public.users
    WHERE auth_user_id = auth.uid() AND status <> 'offboarded'
    LIMIT 1
  ), 0)
$$;

CREATE OR REPLACE FUNCTION public.app_can_write_documents() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid() AND status <> 'offboarded'
      AND ("roleLevel" >= 60 OR "accessLevel" IN ('admin', 'project_lead'))
  )
$$;

CREATE OR REPLACE FUNCTION public.app_client_id() RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.clients WHERE auth_user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.app_is_staff() RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.app_user_id() IS NOT NULL
$$;

-- =============================================================================
-- AUTH ACCOUNT LINKING
-- When a confirmed Supabase Auth account exists for an email, link it to the
-- matching team member or client row, and keep the stored email in sync.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_auth_user_change() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL OR NEW.email IS NULL THEN
    RETURN NEW;
  END IF;

  UPDATE public.users SET auth_user_id = NEW.id
  WHERE auth_user_id IS NULL AND lower(email) = lower(NEW.email);
  UPDATE public.clients SET auth_user_id = NEW.id
  WHERE auth_user_id IS NULL AND lower(email) = lower(NEW.email);

  UPDATE public.users SET email = NEW.email
  WHERE auth_user_id = NEW.id AND email IS DISTINCT FROM NEW.email;
  UPDATE public.clients SET email = NEW.email
  WHERE auth_user_id = NEW.id AND email IS DISTINCT FROM NEW.email;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_change ON auth.users;
CREATE TRIGGER on_auth_user_change
  AFTER INSERT OR UPDATE OF email, email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_change();

-- Browser sessions must not be able to point a row at a different auth account.
CREATE OR REPLACE FUNCTION public.guard_auth_link() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.auth_user_id IS NOT NULL)
     OR (TG_OP = 'UPDATE' AND NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id) THEN
    IF current_user IN ('anon', 'authenticated') THEN
      RAISE EXCEPTION 'auth_user_id can only be changed by the server';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_users_auth_link ON public.users;
CREATE TRIGGER guard_users_auth_link BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.guard_auth_link();

DROP TRIGGER IF EXISTS guard_clients_auth_link ON public.clients;
CREATE TRIGGER guard_clients_auth_link BEFORE INSERT OR UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.guard_auth_link();

-- =============================================================================
-- RPC FUNCTIONS CALLED BY THE APP
-- =============================================================================

-- Lets the login form accept a username. Returns the email only for accounts
-- that already have a linked login.
CREATE OR REPLACE FUNCTION public.resolve_login_email(identifier TEXT) RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT email FROM (
    SELECT email FROM public.users
    WHERE lower(username) = lower(identifier) AND auth_user_id IS NOT NULL
    UNION ALL
    SELECT email FROM public.clients
    WHERE lower(username) = lower(identifier) AND auth_user_id IS NOT NULL
  ) matches
  LIMIT 1
$$;

-- Called after the signed-in user has set a permanent password.
CREATE OR REPLACE FUNCTION public.complete_password_change() RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.users SET "mustChangePassword" = false, "lastLoginAt" = now()
  WHERE auth_user_id = auth.uid();
  UPDATE public.clients SET "mustChangePassword" = false, "lastLoginAt" = now()
  WHERE auth_user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.record_login() RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.users SET "lastLoginAt" = now() WHERE auth_user_id = auth.uid();
  UPDATE public.clients SET "lastLoginAt" = now() WHERE auth_user_id = auth.uid();
$$;

-- Self-service profile edits. Role, level, and status stay admin-controlled.
CREATE OR REPLACE FUNCTION public.update_own_account(p_name TEXT, p_username TEXT) RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.users
  SET name = COALESCE(NULLIF(trim(p_name), ''), name),
      username = COALESCE(NULLIF(lower(trim(p_username)), ''), username)
  WHERE auth_user_id = auth.uid();
  UPDATE public.clients
  SET "contactName" = COALESCE(NULLIF(trim(p_name), ''), "contactName"),
      username = COALESCE(NULLIF(lower(trim(p_username)), ''), username)
  WHERE auth_user_id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.resolve_login_email(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.complete_password_change() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_login() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_own_account(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_login_email(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_password_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_login() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_own_account(TEXT, TEXT) TO authenticated;

-- =============================================================================
-- LEDGER SIDE EFFECTS
-- =============================================================================

-- Payments adjust the paid amount and status of their invoice.
CREATE OR REPLACE FUNCTION public.apply_payment_to_invoice() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  target_invoice TEXT;
  delta NUMERIC;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_invoice := NEW."invoiceId";
    delta := NEW.amount;
  ELSE
    target_invoice := OLD."invoiceId";
    delta := -OLD.amount;
  END IF;

  IF target_invoice IS NOT NULL THEN
    UPDATE public.invoices
    SET "paidAmount" = GREATEST(COALESCE("paidAmount", 0) + delta, 0),
        status = CASE
          WHEN COALESCE("paidAmount", 0) + delta >= "grandTotal" AND "grandTotal" > 0 THEN 'paid'
          WHEN COALESCE("paidAmount", 0) + delta > 0 THEN 'partially_paid'
          WHEN status IN ('paid', 'partially_paid') THEN 'sent'
          ELSE status
        END,
        "updatedAt" = now()
    WHERE id = target_invoice;
  END IF;

  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS payments_apply_to_invoice ON public.payments;
CREATE TRIGGER payments_apply_to_invoice AFTER INSERT OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.apply_payment_to_invoice();

-- Capital contributions roll up into the partner equity account.
CREATE OR REPLACE FUNCTION public.apply_capital_contribution() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.partner_equity
  SET "totalContributed" = "totalContributed" + NEW.amount,
      "netCapitalBalance" = "totalContributed" + NEW.amount - COALESCE("totalDrawings", 0),
      "lastUpdated" = now()
  WHERE "partnerId" = NEW."partnerId";
  RETURN NULL;
END $$;

DROP TRIGGER IF EXISTS capital_contributions_apply ON public.capital_contributions;
CREATE TRIGGER capital_contributions_apply AFTER INSERT ON public.capital_contributions
  FOR EACH ROW EXECUTE FUNCTION public.apply_capital_contribution();

-- =============================================================================
-- ROW LEVEL SECURITY
-- Only signed-in, linked accounts see data. Anonymous requests see nothing.
-- Write levels mirror the app's hierarchy:
--   partner 100, admin 80, manager 60, developer/designer 40, auditor 30
-- =============================================================================

DO $$
DECLARE
  tbl TEXT;
  pol RECORD;
  all_tables TEXT[] := ARRAY[
    'agency_profile', 'custom_roles', 'users', 'clients',
    'contracts', 'invoices', 'payments', 'expenses',
    'capital_contributions', 'partner_equity', 'partner_drawings',
    'ip_ownership', 'assets', 'debts', 'tax_filings',
    'documents', 'tasks'
  ];
BEGIN
  FOREACH tbl IN ARRAY all_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
    -- Remove every existing policy, including the old "allow everything" one.
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = tbl LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, tbl);
    END LOOP;
  END LOOP;
END $$;

-- Ledgers: readable by all active staff, writable from a minimum level.
DO $$
DECLARE
  entry RECORD;
BEGIN
  FOR entry IN SELECT * FROM (VALUES
    ('contracts', 60),
    ('invoices', 60),
    ('payments', 60),
    ('expenses', 60),
    ('ip_ownership', 60),
    ('assets', 60),
    ('debts', 60),
    ('tax_filings', 80),
    ('capital_contributions', 100),
    ('partner_equity', 100),
    ('partner_drawings', 100)
  ) AS t(tbl, min_level) LOOP
    EXECUTE format(
      'CREATE POLICY staff_read ON public.%I FOR SELECT TO authenticated USING (public.app_is_staff())',
      entry.tbl);
    EXECUTE format(
      'CREATE POLICY level_insert ON public.%I FOR INSERT TO authenticated WITH CHECK (public.app_role_level() >= %s)',
      entry.tbl, entry.min_level);
    EXECUTE format(
      'CREATE POLICY level_update ON public.%I FOR UPDATE TO authenticated USING (public.app_role_level() >= %s) WITH CHECK (public.app_role_level() >= %s)',
      entry.tbl, entry.min_level, entry.min_level);
    EXECUTE format(
      'CREATE POLICY level_delete ON public.%I FOR DELETE TO authenticated USING (public.app_role_level() >= %s)',
      entry.tbl, entry.min_level);
  END LOOP;
END $$;

-- Agency profile: every signed-in account reads it (documents need it).
CREATE POLICY profile_read ON public.agency_profile FOR SELECT TO authenticated
  USING (public.app_is_staff() OR public.app_client_id() IS NOT NULL);
CREATE POLICY profile_insert ON public.agency_profile FOR INSERT TO authenticated
  WITH CHECK (public.app_role_level() >= 80);
CREATE POLICY profile_update ON public.agency_profile FOR UPDATE TO authenticated
  USING (public.app_role_level() >= 80) WITH CHECK (public.app_role_level() >= 80);

-- Roles: managers and above create or edit roles strictly below their level.
CREATE POLICY roles_read ON public.custom_roles FOR SELECT TO authenticated
  USING (public.app_is_staff());
CREATE POLICY roles_insert ON public.custom_roles FOR INSERT TO authenticated
  WITH CHECK (public.app_role_level() >= 60 AND level < public.app_role_level());
CREATE POLICY roles_update ON public.custom_roles FOR UPDATE TO authenticated
  USING (public.app_role_level() >= 60 AND level < public.app_role_level())
  WITH CHECK (public.app_role_level() >= 60 AND level < public.app_role_level());

-- Team members: staff read the directory; managers and above manage people
-- strictly below their own level.
CREATE POLICY users_read ON public.users FOR SELECT TO authenticated
  USING (public.app_is_staff());
CREATE POLICY users_insert ON public.users FOR INSERT TO authenticated
  WITH CHECK (public.app_role_level() >= 60 AND "roleLevel" < public.app_role_level());
CREATE POLICY users_update ON public.users FOR UPDATE TO authenticated
  USING (public.app_role_level() >= 60 AND "roleLevel" < public.app_role_level())
  WITH CHECK (public.app_role_level() >= 60 AND "roleLevel" < public.app_role_level());
CREATE POLICY users_delete ON public.users FOR DELETE TO authenticated
  USING (public.app_role_level() >= 60 AND "roleLevel" < public.app_role_level());

-- Clients: staff read all, a client reads only their own account.
CREATE POLICY clients_read ON public.clients FOR SELECT TO authenticated
  USING (public.app_is_staff() OR id = public.app_client_id());
CREATE POLICY clients_insert ON public.clients FOR INSERT TO authenticated
  WITH CHECK (public.app_role_level() >= 60);
CREATE POLICY clients_update ON public.clients FOR UPDATE TO authenticated
  USING (public.app_role_level() >= 60) WITH CHECK (public.app_role_level() >= 60);
CREATE POLICY clients_delete ON public.clients FOR DELETE TO authenticated
  USING (public.app_role_level() >= 60);

-- Documents: staff read all, clients read documents shared with them.
CREATE POLICY documents_read ON public.documents FOR SELECT TO authenticated
  USING (
    public.app_is_staff()
    OR ("sharedWithClient" = true AND "clientId" = public.app_client_id())
  );
CREATE POLICY documents_insert ON public.documents FOR INSERT TO authenticated
  WITH CHECK (public.app_can_write_documents());
CREATE POLICY documents_update ON public.documents FOR UPDATE TO authenticated
  USING (public.app_can_write_documents()) WITH CHECK (public.app_can_write_documents());
CREATE POLICY documents_delete ON public.documents FOR DELETE TO authenticated
  USING (public.app_can_write_documents());

-- Tasks: leads manage all tasks; assignees update their own.
CREATE POLICY tasks_read ON public.tasks FOR SELECT TO authenticated
  USING (public.app_is_staff());
CREATE POLICY tasks_insert ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (public.app_can_write_documents());
CREATE POLICY tasks_update ON public.tasks FOR UPDATE TO authenticated
  USING (public.app_can_write_documents() OR "freelancerId" = public.app_user_id())
  WITH CHECK (public.app_can_write_documents() OR "freelancerId" = public.app_user_id());
CREATE POLICY tasks_delete ON public.tasks FOR DELETE TO authenticated
  USING (public.app_can_write_documents());
