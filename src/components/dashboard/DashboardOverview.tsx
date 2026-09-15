import React from 'react';
import { 
  FileText, 
  Receipt, 
  CreditCard, 
  ShieldCheck, 
  FileSearch, 
  UserCheck, 
  LogOut, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileCheck,
  Calculator,
  Layers
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { DocumentType } from '../../types/documents';
import { CurrencyToggle } from '../common/CurrencyToggle';

export const DashboardOverview: React.FC = () => {
  const { 
    savedDocuments, 
    agencyProfile, 
    openEditorForNew, 
    openEditorForEdit,
    setCurrentView,
    activeCurrency,
    setActiveCurrency,
    formatMoney,
    convertMoney
  } = useAgency();

  // Metrics calculations
  const totalDocs = savedDocuments.length;
  
  // Calculate total invoiced & total collected from saved docs automatically translated to activeCurrency
  let totalInvoiced = 0;
  let totalCollected = 0;

  savedDocuments.forEach((doc) => {
    if (doc.type === 'invoice') {
      const invData = doc.payload.data as any;
      const subtotal = (invData.lineItems || []).reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
      const discount = invData.discountPercent ? (subtotal * invData.discountPercent) / 100 : 0;
      const tax = invData.taxPercent ? ((subtotal - discount) * invData.taxPercent) / 100 : 0;
      const rawTotal = (subtotal - discount + tax);
      totalInvoiced += convertMoney(rawTotal, invData.currency || 'USD');
    }
    if (doc.type === 'receipt') {
      const rcptData = doc.payload.data as any;
      totalCollected += convertMoney(rcptData.amountPaid || 0, rcptData.currency || 'USD');
    }
  });

  const generatorCards: {
    type: DocumentType;
    title: string;
    desc: string;
    badge: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    {
      type: 'discovery',
      title: 'Discovery Call',
      desc: 'Capture prospect intake, pain points, core objectives, and immediate action items.',
      badge: 'Intake & Scoping',
      icon: FileSearch
    },
    {
      type: 'proposal',
      title: 'Proposal & SOW',
      desc: 'Craft comprehensive milestones, phased deliverables, pricing schedule, and legal terms.',
      badge: 'Sales & Conversion',
      icon: FileText
    },
    {
      type: 'quotation',
      title: 'Commercial Quotation',
      desc: 'Generate itemized price estimates, scope options, tax adjustments, and validity terms.',
      badge: 'Pricing & Estimates',
      icon: Calculator
    },
    {
      type: 'rate_chart',
      title: 'Service Rate Chart',
      desc: 'Structured 3-tier complexity matrices: Simple, Medium, and Complex service rates.',
      badge: 'Rate Card & Tiers',
      icon: Layers
    },
    {
      type: 'onboarding',
      title: 'Client Onboarding',
      desc: 'Welcome pack, Slack channels, meeting cadences, team roster, and credential checklist.',
      badge: 'Kickoff & Ops',
      icon: UserCheck
    },
    {
      type: 'nda',
      title: 'Mutual NDA',
      desc: 'Protect confidential IP, technical trade secrets, and proprietary methodologies.',
      badge: 'Legal & Protection',
      icon: ShieldCheck
    },
    {
      type: 'invoice',
      title: 'Commercial Invoice',
      desc: 'Itemized billing with tax calculations, discounts, payment terms, and wire instructions.',
      badge: 'Billing & Cashflow',
      icon: Receipt
    },
    {
      type: 'receipt',
      title: 'Payment Receipt',
      desc: 'Official payment acknowledgment, transaction reference, remaining balance confirmation.',
      badge: 'Settlement & Audit',
      icon: CreditCard
    },
    {
      type: 'offboarding',
      title: 'Project Handover',
      desc: 'Final deliverables audit, repository/credentials transfer, warranty terms, and sign-off.',
      badge: 'Closure & Warranty',
      icon: LogOut
    }
  ];

  const recentDocs = [...savedDocuments].slice(0, 6);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-medium">Paid</span>;
      case 'approved':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-2 py-0.5 rounded font-medium">Approved</span>;
      case 'issued':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded font-medium">Issued</span>;
      case 'completed':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] px-2 py-0.5 rounded font-medium">Completed</span>;
      default:
        return <span className="bg-parchment-200 text-ink-700 border border-parchment-300 text-[10px] px-2 py-0.5 rounded font-medium">Draft</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome & Agency Headline */}
      <div className="flex items-center justify-between pb-2 border-b border-parchment-200">
        <div>
          <h2 className="font-serif text-2xl text-ink-950 font-normal">
            Welcome back to {agencyProfile.name}
          </h2>
          <p className="text-xs text-ink-500 font-light mt-0.5">
            Business monitoring & document operations command center
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CurrencyToggle
            value={activeCurrency}
            onChange={setActiveCurrency}
            showRateNotice={true}
            size="sm"
          />
          <div className="text-right hidden sm:block border-l border-parchment-200 pl-4">
            <div className="text-xs text-ink-600 font-medium">
              Authorized Signer: <span className="text-ink-900">{agencyProfile.primarySigner.name}</span>
            </div>
            <div className="text-[11px] text-ink-400">
              {agencyProfile.primarySigner.title}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Monitoring Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-parchment-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 text-xs mb-2">
            <span>Total Documents</span>
            <FileCheck className="w-4 h-4 text-clay-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-ink-950">
            {totalDocs}
          </div>
          <div className="text-[11px] text-ink-500 mt-1 flex items-center gap-1">
            <span className="text-forest-700 font-medium">8 Active</span> templates configured
          </div>
        </div>

        <div className="bg-white border border-parchment-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 text-xs mb-2">
            <span>Total Invoiced</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-ink-950">
            {formatMoney(totalInvoiced)}
          </div>
          <div className="text-[11px] text-ink-500 mt-1">
            Invoiced across commercial contracts
          </div>
        </div>

        <div className="bg-white border border-parchment-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 text-xs mb-2">
            <span>Total Collected</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-forest-700">
            {formatMoney(totalCollected)}
          </div>
          <div className="text-[11px] text-ink-500 mt-1">
            Verified payments received
          </div>
        </div>

        <div className="bg-white border border-parchment-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 text-xs mb-2">
            <span>Outstanding Invoices</span>
            <Clock className="w-4 h-4 text-ink-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-clay-700">
            {formatMoney(Math.max(0, totalInvoiced - totalCollected))}
          </div>
          <div className="text-[11px] text-ink-500 mt-1">
            Pending reconciliation
          </div>
        </div>
      </div>

      {/* Document Generators Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif text-lg text-ink-950 font-normal">
              Document Generators
            </h3>
            <p className="text-xs text-ink-500 font-light">
              Create ready-to-sign, high-fidelity business documents with one click
            </p>
          </div>
          <button
            onClick={() => setCurrentView('hub')}
            className="text-xs text-clay-700 hover:text-clay-800 font-medium flex items-center gap-1"
          >
            <span>View all generators</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatorCards.map((card) => {
            const Icon = card.icon;
            return (
              <div 
                key={card.type}
                className="bg-white border border-parchment-200 rounded-xl p-4 hover:border-clay-300 hover:shadow-sm transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-parchment-100 group-hover:bg-clay-50 transition">
                      <Icon className="w-5 h-5 text-ink-700 group-hover:text-clay-600 transition-colors" />
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-ink-400 bg-parchment-50 px-2 py-0.5 rounded border border-parchment-200">
                      {card.badge}
                    </span>
                  </div>
                  <h4 className="font-serif text-base font-medium text-ink-900 mb-1">
                    {card.title}
                  </h4>
                  <p className="text-xs text-ink-600 line-clamp-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-parchment-100 flex items-center justify-between">
                  <button
                    onClick={() => openEditorForNew(card.type)}
                    className="text-xs font-medium text-clay-700 hover:text-clay-800 flex items-center gap-1 group-hover:underline"
                  >
                    <span>Create Document</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Documents Archive Quick View */}
      <div className="bg-white border border-parchment-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-parchment-200">
          <div>
            <h3 className="font-serif text-base text-ink-950 font-medium">
              Recent Agency Documents
            </h3>
            <p className="text-xs text-ink-500 font-light">
              Access your existing documents to edit, clone, or re-download
            </p>
          </div>
          <button
            onClick={() => setCurrentView('library')}
            className="text-xs text-clay-700 hover:text-clay-800 font-medium flex items-center gap-1"
          >
            <span>Open Full Archive</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentDocs.length === 0 ? (
          <div className="text-center py-8 text-ink-400 text-xs italic">
            No documents generated yet. Click &quot;New Document&quot; above to start.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-ink-400 uppercase text-[10px] font-semibold border-b border-parchment-200">
                <tr>
                  <th className="text-left pb-2 font-medium">Document</th>
                  <th className="text-left pb-2 font-medium">Client</th>
                  <th className="text-left pb-2 font-medium">Ref #</th>
                  <th className="text-left pb-2 font-medium">Status</th>
                  <th className="text-left pb-2 font-medium">Last Modified</th>
                  <th className="text-right pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-parchment-100">
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-parchment-50/70 transition">
                    <td className="py-2.5 font-medium text-ink-900">
                      {doc.title}
                    </td>
                    <td className="py-2.5 text-ink-700">
                      {doc.clientName}
                    </td>
                    <td className="py-2.5 font-mono text-ink-500 text-[11px]">
                      {doc.docNumber}
                    </td>
                    <td className="py-2.5">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-2.5 text-ink-500 text-[11px]">
                      {new Date(doc.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => openEditorForEdit(doc)}
                        className="text-clay-700 hover:text-clay-800 font-medium text-xs bg-clay-50 hover:bg-clay-100 px-2 py-1 rounded transition"
                      >
                        Edit & Re-download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

