import React, { useState } from 'react';
import { 
  FileText, 
  Receipt, 
  CreditCard, 
  TrendingDown, 
  Coins, 
  PieChart, 
  Lock, 
  Laptop, 
  AlertTriangle, 
  FileCheck2, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  Database
} from 'lucide-react';
import { useAgency, AppView } from '../../context/AgencyContext';
import { isSupabaseConfigured } from '../../services/supabase';
import { SupabaseMigrationModal } from './SupabaseMigrationModal';
import { CurrencyToggle } from '../common/CurrencyToggle';

export const PartnershipHub: React.FC = () => {
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const { 
    agencyProfile, 
    contracts, 
    invoices, 
    payments, 
    expenses, 
    capitalContributions, 
    partnerEquity, 
    ipRecords, 
    assets, 
    debts, 
    taxFilings, 
    setCurrentView, 
    currentUser, 
    switchTestUser,
    activeCurrency,
    setActiveCurrency,
    formatMoney
  } = useAgency();

  // Aggregate totals
  const totalContractBookings = contracts.reduce((acc, c) => acc + (c.status !== 'terminated' ? c.contractValue : 0), 0);
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.grandTotal, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netCashflow = totalCollected - totalExpenses;
  const totalFirmCapital = partnerEquity.reduce((acc, p) => acc + p.netCapitalBalance, 0);
  const totalBookAssets = assets.reduce((acc, a) => acc + a.currentBookValue, 0);
  const totalDebts = debts.reduce((acc, d) => acc + (d.status === 'active' ? d.currentBalance : 0), 0);
  const completedTaxFilings = taxFilings.filter(t => t.status === 'filed' || t.status === 'verified').length;

  const ledgerCards: {
    num: number;
    name: string;
    description: string;
    stat: string;
    subStat: string;
    view: AppView;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      num: 1,
      name: 'Client Contracts',
      description: 'Every client contract, SOW, Retainer, NDA & IP terms',
      stat: formatMoney(totalContractBookings),
      subStat: `${contracts.length} agreements (${contracts.filter(c => c.status === 'active').length} active)`,
      view: 'contracts_ledger',
      icon: FileText,
      accentColor: 'border-blue-500 text-blue-600 bg-blue-50'
    },
    {
      num: 2,
      name: 'Invoices Ledger',
      description: 'Every invoice issued, milestone items, GST & payment terms',
      stat: formatMoney(totalInvoiced),
      subStat: `${invoices.length} invoices generated`,
      view: 'financial_ledgers',
      icon: Receipt,
      accentColor: 'border-clay-500 text-clay-600 bg-clay-50'
    },
    {
      num: 3,
      name: 'Payments Collected',
      description: 'Every client payment received, wire UTRs, & bank deposits',
      stat: formatMoney(totalCollected),
      subStat: `${payments.length} verified remittances`,
      view: 'financial_ledgers',
      icon: CreditCard,
      accentColor: 'border-emerald-500 text-emerald-600 bg-emerald-50'
    },
    {
      num: 4,
      name: 'Operating Expenses',
      description: 'Every business expense, paid by source & tax deductibility',
      stat: formatMoney(totalExpenses),
      subStat: `${expenses.length} operating disbursements`,
      view: 'financial_ledgers',
      icon: TrendingDown,
      accentColor: 'border-rose-500 text-rose-600 bg-rose-50'
    },
    {
      num: 5,
      name: 'Capital Contributions',
      description: 'Partner capital deposits, hardware infusions, & bank ledger',
      stat: formatMoney(capitalContributions.reduce((s, c) => s + c.amount, 0)),
      subStat: `${capitalContributions.length} deed contributions`,
      view: 'capital_equity',
      icon: Coins,
      accentColor: 'border-amber-500 text-amber-600 bg-amber-50'
    },
    {
      num: 6,
      name: 'Ownership & Equity',
      description: 'Subhadip Jana & Shayan Das 50/50 capital & profit accounts',
      stat: formatMoney(totalFirmCapital),
      subStat: '50% Subhadip / 50% Shayan split',
      view: 'capital_equity',
      icon: PieChart,
      accentColor: 'border-purple-500 text-purple-600 bg-purple-50'
    },
    {
      num: 7,
      name: 'IP & Code Ownership',
      description: 'Proprietary source code repos vs client work-for-hire assignments',
      stat: `${ipRecords.length} Assets`,
      subStat: `${ipRecords.filter(r => r.ownershipType === '100% Partnership Proprietary').length} 100% firm proprietary`,
      view: 'ip_registry',
      icon: Lock,
      accentColor: 'border-indigo-500 text-indigo-600 bg-indigo-50'
    },
    {
      num: 8,
      name: 'Fixed Assets',
      description: 'Hardware, workstations, software licenses, book values & depreciation',
      stat: formatMoney(totalBookAssets),
      subStat: `${assets.length} equipment assets`,
      view: 'assets_debts',
      icon: Laptop,
      accentColor: 'border-cyan-500 text-cyan-600 bg-cyan-50'
    },
    {
      num: 9,
      name: 'Debts & Liabilities',
      description: 'Credit lines, commercial banking loans, EMIs & principal balances',
      stat: formatMoney(totalDebts),
      subStat: `${debts.filter(d => d.status === 'active').length} active debt facilities`,
      view: 'assets_debts',
      icon: AlertTriangle,
      accentColor: 'border-orange-500 text-orange-600 bg-orange-50'
    },
    {
      num: 10,
      name: 'Statutory Tax Filings',
      description: 'GST/VAT, Partnership ITR-5, Advance Tax & CA Auditor reviews',
      stat: `${completedTaxFilings}/${taxFilings.length} Filed`,
      subStat: 'Zero pending tax compliance',
      view: 'tax_filings',
      icon: FileCheck2,
      accentColor: 'border-emerald-600 text-emerald-700 bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Firm Header */}
      <div className="bg-white rounded-2xl border border-parchment-200 p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-clay-100 text-clay-800 border border-clay-200">
                Partnership Firm Governance
              </span>
              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${
                  isSupabaseConfigured()
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                    : 'bg-parchment-100 text-ink-700 border-parchment-300 hover:bg-parchment-200'
                }`}
                title="Inspect or configure Supabase cloud database"
              >
                <Database className={`w-3 h-3 ${isSupabaseConfigured() ? 'text-emerald-600' : 'text-ink-500'}`} />
                <span>{isSupabaseConfigured() ? 'Supabase Cloud Connected' : 'Database: Connect Supabase Cloud'}</span>
              </button>
              <span className="text-xs text-ink-500">
                Indian Partnership Act, 1932 Registered
              </span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-ink-950 tracking-tight">
              {agencyProfile.name}
            </h1>
            <p className="text-sm text-ink-600 mt-1 max-w-2xl">
              Founding Partners: <strong className="text-ink-900">Subhadip Jana</strong> (Senior Managing Partner) and <strong className="text-ink-900">Shayan Das</strong> (Senior Managing Partner).
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <div className="text-xs text-ink-400 font-mono">
                Tax ID: {agencyProfile.taxId} • Bank: HDFC Commercial Banking
              </div>
              <div className="flex items-center gap-2 border-l border-parchment-300 pl-3">
                <span className="text-xs font-medium text-ink-600">Ledger Currency:</span>
                <CurrencyToggle 
                  value={activeCurrency} 
                  onChange={setActiveCurrency} 
                  size="sm" 
                  showRateNotice={true} 
                />
              </div>
            </div>
          </div>

          {/* Quick RBAC Role Tester */}
          <div className="p-4 bg-parchment-50 rounded-xl border border-parchment-200/80 min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-600">
                Current Active Actor
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentUser?.roleLevel === 100 ? 'bg-clay-600 text-white' :
                currentUser?.roleLevel === 80 ? 'bg-blue-600 text-white' :
                currentUser?.roleLevel === 60 ? 'bg-amber-600 text-white' :
                'bg-slate-700 text-white'
              }`}>
                Level {currentUser?.roleLevel || 100} • {currentUser?.roleName || currentUser?.role || 'Member'}
              </span>
            </div>

            <div className="text-sm font-semibold text-ink-900">{currentUser?.name || 'Authorized User'}</div>
            <div className="text-xs text-ink-500">{currentUser?.email || ''}</div>

            <div className="mt-3 pt-2 border-t border-parchment-200 flex flex-wrap gap-1.5">
              <span className="text-[10px] text-ink-400 w-full mb-0.5">Switch Identity to verify RBAC hierarchy:</span>
              <button
                onClick={() => switchTestUser('usr-subhadip')}
                className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-clay-50 border border-parchment-200 text-ink-700 font-medium"
              >
                Subhadip (Partner)
              </button>
              <button
                onClick={() => switchTestUser('usr-shayan')}
                className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-clay-50 border border-parchment-200 text-ink-700 font-medium"
              >
                Shayan (Partner)
              </button>
              <button
                onClick={() => switchTestUser('usr-admin-1')}
                className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-blue-50 border border-parchment-200 text-ink-700 font-medium"
              >
                Rohan (Admin)
              </button>
              <button
                onClick={() => switchTestUser('usr-mgr-1')}
                className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-amber-50 border border-parchment-200 text-ink-700 font-medium"
              >
                Ananya (Manager)
              </button>
              <button
                onClick={() => switchTestUser('usr-auditor-1')}
                className="text-[10px] px-2 py-0.5 rounded bg-white hover:bg-emerald-50 border border-parchment-200 text-ink-700 font-medium"
              >
                Kavita (Auditor)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Partners Equity Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partnerEquity.map((p) => (
          <div key={p.partnerId} className="bg-white rounded-xl border border-parchment-200 p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-clay-600 to-clay-700 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">
                {p.partnerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-serif font-bold text-ink-950">{p.partnerName}</h3>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-1.5 py-0.2 rounded">
                    50% Equity
                  </span>
                </div>
                <div className="text-xs text-ink-500 font-medium">{p.designation}</div>
                <div className="text-xs text-ink-400 font-mono mt-1">
                  Net Capital: <span className="font-bold text-emerald-700">{formatMoney(p.netCapitalBalance)}</span> • Drawings: {formatMoney(p.totalDrawings)}
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('capital_equity')}
              className="p-2 text-ink-400 hover:text-clay-600 rounded-lg hover:bg-parchment-50 transition"
              title="Inspect Partner Equity"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Section: The 10 Partnership Ledgers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-ink-950">The 10 Partnership Ledgers</h2>
            <p className="text-xs text-ink-500">
              Complete, immutable operational registers stored in SQLite localdb, ready for Supabase migration.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('roles_matrix')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-clay-700 hover:text-clay-900 bg-clay-50 hover:bg-clay-100 px-3 py-1.5 rounded-lg border border-clay-200 transition"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Configure Roles & Permissions
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ledgerCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.num}
                onClick={() => setCurrentView(card.view)}
                className="bg-white rounded-xl border border-parchment-200 p-4 shadow-xs hover:shadow-md hover:border-clay-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-parchment-100 text-ink-500 font-mono">
                      #{card.num}
                    </span>
                    <div className={`p-1.5 rounded-lg ${card.accentColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-ink-950 group-hover:text-clay-700 transition-colors">
                    {card.name}
                  </h3>
                  <p className="text-[11px] text-ink-500 mt-1 line-clamp-2">
                    {card.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-parchment-100">
                  <div className="text-base font-bold font-serif text-ink-900">
                    {card.stat}
                  </div>
                  <div className="text-[10px] text-ink-400 mt-0.5 truncate flex items-center justify-between">
                    <span>{card.subStat}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-clay-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Financial Health Summary Banner */}
      <div className="bg-gradient-to-r from-clay-900 to-clay-950 text-white rounded-2xl p-6 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="text-xs uppercase font-semibold text-parchment-400 tracking-wider">
              Net Operating Surplus
            </div>
            <div className="text-2xl font-bold font-serif mt-1 text-emerald-400">
              {formatMoney(netCashflow)}
            </div>
            <div className="text-xs text-parchment-400 mt-1">
              Collected ({formatMoney(totalCollected)}) minus Expenses ({formatMoney(totalExpenses)})
            </div>
          </div>

          <div>
            <div className="text-xs uppercase font-semibold text-parchment-400 tracking-wider">
              Total Partner Capital
            </div>
            <div className="text-2xl font-bold font-serif mt-1 text-white">
              {formatMoney(totalFirmCapital)}
            </div>
            <div className="text-xs text-parchment-400 mt-1">
              50/50 Subhadip Jana & Shayan Das
            </div>
          </div>

          <div>
            <div className="text-xs uppercase font-semibold text-parchment-400 tracking-wider">
              Active Contract Bookings
            </div>
            <div className="text-2xl font-bold font-serif mt-1 text-white">
              {formatMoney(totalContractBookings)}
            </div>
            <div className="text-xs text-parchment-400 mt-1">
              Across enterprise statements of work
            </div>
          </div>

          <div>
            <div className="text-xs uppercase font-semibold text-parchment-400 tracking-wider">
              Compliance & Legal Status
            </div>
            <div className="text-2xl font-bold font-serif mt-1 text-white flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" /> 100% Clean
            </div>
            <div className="text-xs text-parchment-400 mt-1">
              All GST, ITR & TDS statutory filings audited
            </div>
          </div>
        </div>
      </div>

      <SupabaseMigrationModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
};
