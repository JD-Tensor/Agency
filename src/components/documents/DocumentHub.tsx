import React from 'react';
import { 
  FileSearch, 
  FileText, 
  UserCheck, 
  ShieldCheck, 
  Receipt, 
  CreditCard, 
  LogOut, 
  ArrowRight,
  Calculator,
  Layers
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { DocumentType } from '../../types/documents';

export const DocumentHub: React.FC = () => {
  const { openEditorForNew, currentUser } = useAgency();

  const canCreateDocs = currentUser?.accessLevel === 'admin' || currentUser?.accessLevel === 'project_lead';

  if (!canCreateDocs) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white border border-parchment-300 rounded-2xl p-8 text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-serif font-bold text-base">
          !
        </div>
        <h3 className="font-serif text-xl font-semibold text-ink-950">Document Creation Restricted</h3>
        <p className="text-xs text-ink-600 leading-relaxed">
          Only Agency Administrators and Project Leads have authority to initiate new legal, commercial, and client-facing documents. You can inspect existing project documents in the Archive.
        </p>
      </div>
    );
  }

  const generators: {
    type: DocumentType;
    name: string;
    tagline: string;
    description: string;
    features: string[];
    icon: React.FC<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      type: 'discovery',
      name: 'Discovery Call & Intake Brief',
      tagline: 'Initial Client Requirements & Scoping',
      description: 'Capture client business model, pain points, core metrics, technical stack, budget ranges, and immediate action items with clear ownership.',
      features: ['Client background & attendees', 'Core goals & pain points analysis', 'Feature requirements checklist', 'Action items & ownership matrix'],
      icon: FileSearch,
      accentColor: 'text-sky-600'
    },
    {
      type: 'proposal',
      name: 'Client Proposal & Scope of Work (SOW)',
      tagline: 'High-Conversion Commercial Proposal',
      description: 'Pitch your agency services with executive problem/solution breakdown, phased milestone deliverable tables, total investment, and dual sign-off blocks.',
      features: ['Executive summary & problem statement', 'Phased sprint milestones with deliverables', 'Fixed & milestone pricing breakdown', 'Acceptance signature block & IP terms'],
      icon: FileText,
      accentColor: 'text-clay-600'
    },
    {
      type: 'quotation',
      name: 'Commercial Quotation & Estimate',
      tagline: 'Itemized Pricing, Scope Options & Validity',
      description: 'Generate accurate price estimates and commercial quotes with scope breakdown, optional add-on packages, tax adjustments, and client acceptance sign-off.',
      features: ['Itemized deliverable & unit rate calculations', 'Optional scope add-ons & SLA packages', 'Configurable discounts & tax calculations', 'Quotation validity period & dual sign-off'],
      icon: Calculator,
      accentColor: 'text-violet-600'
    },
    {
      type: 'rate_chart',
      name: 'Service Rate Chart & Complexity Matrix',
      tagline: 'Multi-Tiered Pricing: Simple, Medium, Complex',
      description: 'Define transparent rate cards itemizing services across 3 complexity scales with scope explanations, inclusion deliverables, limitations, timelines, and fixed prices.',
      features: ['3-tier complexity scales (Simple, Medium, Complex)', 'Deliverables & scope exclusions per scale', 'Turnaround timelines & fixed pricing benchmarks', 'Senior Managing Partner sign-off block'],
      icon: Layers,
      accentColor: 'text-amber-700'
    },
    {
      type: 'onboarding',
      name: 'Client Onboarding Pack & Playbook',
      tagline: 'Frictionless Kickoff & Team Alignment',
      description: 'Welcome new clients with communication channels (Slack/syncs), working hours SLAs, agency team roster, and credential/asset handover checklists.',
      features: ['Personalized welcome orientation', 'Communication SLAs & meeting cadence', 'Assigned agency team roster', 'Credentials & access checklist'],
      icon: UserCheck,
      accentColor: 'text-indigo-600'
    },
    {
      type: 'nda',
      name: 'Non-Disclosure Agreement (NDA)',
      tagline: 'Mutual or Unilateral Confidentiality Protection',
      description: 'Standardized legal confidentiality agreement protecting technical architecture, trade secrets, business metrics, source code, and client confidential data.',
      features: ['Mutual or one-way agreement modes', 'Trade secret & IP protection scope', 'Duration & non-solicitation clauses', 'Dual legal signature execution'],
      icon: ShieldCheck,
      accentColor: 'text-amber-600'
    },
    {
      type: 'invoice',
      name: 'Commercial Invoice',
      tagline: 'Clean Itemized Billing & Wire Instructions',
      description: 'Issue professional invoices with itemized services, automated quantity and tax calculations, discount lines, payment due dates, and full wire coordinates.',
      features: ['Dynamic line item calculations', 'Tax & discount adjustments', 'PO number & payment terms', 'Bank wire, ACH, and routing coordinates'],
      icon: Receipt,
      accentColor: 'text-emerald-600'
    },
    {
      type: 'receipt',
      name: 'Payment Receipt',
      tagline: 'Official Payment Acknowledgment & Settlement',
      description: 'Provide clients with immediate confirmation upon funds receipt, referencing original invoices, transaction IDs, payment methods, and remaining balances.',
      features: ['Original invoice cross-reference', 'Transaction ID & payment method', 'Official payment verification seal', 'Authorized agency signature stamp'],
      icon: CreditCard,
      accentColor: 'text-teal-600'
    },
    {
      type: 'offboarding',
      name: 'Project Offboarding & Handover',
      tagline: 'Deliverables Audit, Warranty & Sign-off',
      description: 'Formally close projects with an audit of delivered assets, GitHub repository transfer, hosting accounts, post-launch recommendations, and testimonial prompts.',
      features: ['Completed deliverables audit', 'Code repo & credentials transfer log', 'Warranty & bug-fix period terms', 'Formal client sign-off & feedback link'],
      icon: LogOut,
      accentColor: 'text-purple-600'
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b border-parchment-200 pb-4">
        <h2 className="font-serif text-2xl text-ink-950 font-normal">
          Document Generator Suite
        </h2>
        <p className="text-xs text-ink-500 font-light mt-1">
          Each template is engineered according to enterprise business standards with ready-to-print A4 styling and live PDF generation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {generators.map((gen) => {
          const Icon = gen.icon;
          return (
            <div
              key={gen.type}
              className="bg-white border border-parchment-200 rounded-xl p-5 hover:border-clay-300 hover:shadow-sm transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-parchment-100">
                      <Icon className={`w-5 h-5 ${gen.accentColor}`} />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-semibold text-ink-950 leading-tight">
                        {gen.name}
                      </h3>
                      <div className="text-[11px] text-ink-500 font-medium">
                        {gen.tagline}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-ink-700 leading-relaxed mb-4">
                  {gen.description}
                </p>

                <div className="space-y-1.5 border-t border-parchment-100 pt-3">
                  <div className="text-[10px] uppercase font-semibold text-ink-400 tracking-wider mb-1">
                    Key Features
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {gen.features.map((feat, idx) => (
                      <div key={idx} className="text-[11px] text-ink-600 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-clay-600"></span>
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-parchment-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-ink-400">PDF Ready</span>
                <button
                  onClick={() => openEditorForNew(gen.type)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-white bg-clay-600 hover:bg-clay-700 px-3.5 py-1.5 rounded-lg transition shadow-xs"
                >
                  <span>Create Document</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
