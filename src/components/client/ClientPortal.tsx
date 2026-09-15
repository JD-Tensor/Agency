import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Clock, 
  Files, 
  Receipt, 
  Users, 
  ExternalLink, 
  Eye, 
  MessageSquare, 
  Calendar, 
  Mail, 
  ShieldCheck, 
  CreditCard,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { SavedDocument } from '../../types/documents';
import { ClientDocumentModal } from './ClientDocumentModal';

export const ClientPortal: React.FC = () => {
  const { 
    currentClient, 
    agencyProfile, 
    savedDocuments, 
    freelancers 
  } = useAgency();

  const [activeTab, setActiveTab] = useState<'orders' | 'team' | 'documents' | 'financials'>('orders');
  const [inspectingDoc, setInspectingDoc] = useState<SavedDocument | null>(null);

  if (!currentClient) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white border border-parchment-200 rounded-2xl p-8 text-center space-y-3">
        <Building2 className="w-10 h-10 text-clay-600 mx-auto" />
        <h3 className="font-serif text-lg font-semibold text-ink-950">Client Profile Not Found</h3>
        <p className="text-xs text-ink-500">
          No client account is linked to your current session. Please contact the agency administrator.
        </p>
      </div>
    );
  }

  // Filter documents linked to this client
  const clientDocs = savedDocuments.filter((doc) => {
    const matchesId = currentClient.sharedDocumentIds?.includes(doc.id);
    const matchesClientId = doc.clientId === currentClient.id;
    const matchesName = 
      doc.clientName.toLowerCase().includes(currentClient.companyName.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(currentClient.contactName.toLowerCase());
    return matchesId || matchesClientId || matchesName;
  });

  // Filter invoices & receipts
  const clientInvoices = clientDocs.filter((d) => d.type === 'invoice');
  const clientReceipts = clientDocs.filter((d) => d.type === 'receipt');

  // Filter non-financial documents (Proposals, NDAs, Onboarding, Discovery, Offboarding)
  const generalDocs = clientDocs.filter((d) => d.type !== 'invoice' && d.type !== 'receipt');

  // Primary active order
  const primaryOrder = currentClient.orders[0];

  // Assigned team members lookup
  const projectLead = freelancers.find((f) => f.id === primaryOrder?.projectLeadId);
  const assignedTeam = freelancers.filter((f) => primaryOrder?.assignedFreelancerIds.includes(f.id));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-clay-900 to-ink-950 text-white rounded-2xl p-6 shadow-sm border border-clay-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-clay-300 text-xs font-medium uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-clay-400" />
              <span>{currentClient.companyName} Client Portal</span>
            </div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-white">
              Welcome, {currentClient.contactName}
            </h1>
            <p className="text-xs text-clay-200/90 font-light">
              Track project delivery milestones, inspect review deliverables, communicate with your project lead, and review shared papers.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-xs space-y-1 flex-shrink-0">
            <div className="text-[10px] text-clay-300 uppercase tracking-wider font-semibold">
              Managing Lead
            </div>
            <div className="font-semibold text-sm text-white">
              {projectLead?.name || primaryOrder?.projectLeadName || agencyProfile.primarySigner.name}
            </div>
            <div className="text-[11px] text-clay-200">
              {projectLead?.role || 'Staff Project Architect'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-parchment-200 rounded-xl p-1.5 shadow-xs flex items-center gap-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'orders'
              ? 'bg-clay-600 text-white shadow-xs'
              : 'text-ink-600 hover:text-ink-950 hover:bg-parchment-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Project Orders & Milestones</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'team'
              ? 'bg-clay-600 text-white shadow-xs'
              : 'text-ink-600 hover:text-ink-950 hover:bg-parchment-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Who's Managing Your Project</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'documents'
              ? 'bg-clay-600 text-white shadow-xs'
              : 'text-ink-600 hover:text-ink-950 hover:bg-parchment-100'
          }`}
        >
          <Files className="w-4 h-4" />
          <span>Shared Documents ({generalDocs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
            activeTab === 'financials'
              ? 'bg-clay-600 text-white shadow-xs'
              : 'text-ink-600 hover:text-ink-950 hover:bg-parchment-100'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices & Receipts ({clientInvoices.length + clientReceipts.length})</span>
        </button>
      </div>

      {/* TAB 1: Orders & Milestones */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {currentClient.orders.map((order) => {
            const completedCount = order.milestones.filter((m) => m.status === 'completed').length;
            const totalMilestones = order.milestones.length;

            return (
              <div key={order.id} className="bg-white border border-parchment-200 rounded-2xl p-6 shadow-xs space-y-6">
                {/* Order Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold text-clay-700 bg-clay-50 border border-clay-200 px-2 py-0.5 rounded">
                        Active Project
                      </span>
                      <span className="text-xs text-ink-400 font-mono">ID: {order.id}</span>
                    </div>
                    <h2 className="font-serif text-xl font-semibold text-ink-950">
                      {order.title}
                    </h2>
                    <p className="text-xs text-ink-600 mt-1 max-w-2xl leading-relaxed">
                      {order.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 bg-parchment-50 border border-parchment-200 rounded-xl p-3 text-xs">
                    <div>
                      <div className="text-[10px] text-ink-400 uppercase font-semibold">Delivery Target</div>
                      <div className="font-medium text-ink-900 font-mono mt-0.5">{order.targetDeliveryDate}</div>
                    </div>
                    <div className="border-l border-parchment-200 pl-4">
                      <div className="text-[10px] text-ink-400 uppercase font-semibold">Total Scope</div>
                      <div className="font-bold text-ink-900 font-mono mt-0.5">
                        ${order.budgetTotal.toLocaleString()} {order.currency}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Overall Progress Gauge */}
                <div className="bg-parchment-50/70 border border-parchment-200 rounded-xl p-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-ink-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-clay-600" />
                      <span>Sprint Execution Progress</span>
                    </span>
                    <span className="font-mono font-bold text-clay-700">
                      {order.progressPercentage}% Completed ({completedCount} of {totalMilestones} Milestones)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-parchment-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-clay-500 to-clay-600 rounded-full transition-all duration-500"
                      style={{ width: `${order.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Milestones Timeline */}
                <div>
                  <h3 className="font-serif text-base font-semibold text-ink-950 mb-3">
                    Project Milestones & Deliverables
                  </h3>
                  <div className="space-y-3">
                    {order.milestones.map((m, idx) => {
                      const isDone = m.status === 'completed';
                      const isInProg = m.status === 'in_progress';

                      return (
                        <div
                          key={m.id}
                          className={`border rounded-xl p-4 transition ${
                            isDone
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : isInProg
                              ? 'bg-white border-clay-300 shadow-xs'
                              : 'bg-parchment-50/40 border-parchment-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {isDone ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                ) : isInProg ? (
                                  <Clock className="w-5 h-5 text-clay-600 animate-pulse" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-parchment-300 flex items-center justify-center text-[10px] font-mono text-ink-400">
                                    {idx + 1}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-xs text-ink-900">
                                    {m.title}
                                  </h4>
                                  <span
                                    className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                      isDone
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : isInProg
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-parchment-200 text-ink-600'
                                    }`}
                                  >
                                    {m.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                                  {m.description}
                                </p>

                                {m.deliverableUrl && (
                                  <div className="mt-2.5">
                                    <a
                                      href={m.deliverableUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs font-medium text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-2.5 py-1 rounded-md transition"
                                    >
                                      <span>Inspect Submitted Deliverable</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <div className="text-[10px] text-ink-400 uppercase font-semibold">Target Date</div>
                              <div className="text-xs font-mono font-medium text-ink-800 mt-0.5">
                                {m.dueDate}
                              </div>
                              {m.completedAt && (
                                <div className="text-[10px] text-emerald-700 mt-0.5">
                                  Delivered: {m.completedAt}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Who's Managing Your Project */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Managing Lead Spotlight Card */}
          <div className="bg-white border border-parchment-200 rounded-2xl p-6 shadow-xs">
            <div className="text-[10px] uppercase font-bold tracking-wider text-clay-700 mb-2">
              Assigned Project Lead & Architect
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-parchment-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-clay-600 to-clay-800 text-white flex items-center justify-center font-serif font-bold text-xl shadow-xs">
                  {projectLead?.name ? projectLead.name.split(' ').map((n) => n[0]).join('') : 'MC'}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-ink-950">
                    {projectLead?.name || primaryOrder?.projectLeadName}
                  </h3>
                  <div className="text-xs text-clay-700 font-medium">
                    {projectLead?.role || 'Staff Frontend Architect & Project Lead'}
                  </div>
                  <div className="text-xs text-ink-500 mt-1">
                    Primary point of contact for sprint deliverables, technical reviews, and milestone sign-offs.
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${primaryOrder?.communicationChannels.contactEmail || projectLead?.email || agencyProfile.email}`}
                  className="flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-3.5 py-2 rounded-lg transition shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Lead</span>
                </a>
              </div>
            </div>

            {/* Direct Communication Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="bg-parchment-50 border border-parchment-200 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-ink-700 text-xs font-semibold mb-1">
                  <MessageSquare className="w-4 h-4 text-clay-600" />
                  <span>Slack Channel</span>
                </div>
                <div className="font-mono text-xs font-bold text-ink-950">
                  {primaryOrder?.communicationChannels.slackChannel || '#aerosync-agency-sync'}
                </div>
                <div className="text-[10px] text-ink-500 mt-0.5">Real-time daily sync & async queries</div>
              </div>

              <div className="bg-parchment-50 border border-parchment-200 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-ink-700 text-xs font-semibold mb-1">
                  <Calendar className="w-4 h-4 text-clay-600" />
                  <span>Sprint Sync Cadence</span>
                </div>
                <div className="text-xs font-medium text-ink-950">
                  {primaryOrder?.communicationChannels.meetingSchedule || 'Tuesdays 10:00 AM EST'}
                </div>
                <div className="text-[10px] text-ink-500 mt-0.5">Weekly milestone review with client stakeholders</div>
              </div>

              <div className="bg-parchment-50 border border-parchment-200 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-ink-700 text-xs font-semibold mb-1">
                  <Clock className="w-4 h-4 text-clay-600" />
                  <span>Working Hours & SLA</span>
                </div>
                <div className="text-xs font-medium text-ink-950">
                  09:00 - 18:00 EST (&lt; 2hr Response)
                </div>
                <div className="text-[10px] text-ink-500 mt-0.5">Prompt response across business hours</div>
              </div>
            </div>
          </div>

          {/* Assigned Specialists Roster (Internal hourly rates strictly hidden) */}
          <div className="bg-white border border-parchment-200 rounded-2xl p-6 shadow-xs">
            <h3 className="font-serif text-base font-semibold text-ink-950 mb-1">
              Dedicated Specialists Assigned to Your Account
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              Cross-functional talent working on your project deliverables under the direction of your Project Lead.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {assignedTeam.map((member) => (
                <div
                  key={member.id}
                  className="bg-parchment-50/70 border border-parchment-200 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-full bg-parchment-200 text-ink-800 flex items-center justify-center font-bold text-xs border border-parchment-300">
                        {member.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-ink-950">
                          {member.name}
                        </h4>
                        <div className="text-[11px] text-clay-700 font-medium">
                          {member.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.skills.slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[9px] bg-white text-ink-700 px-1.5 py-0.5 rounded border border-parchment-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-parchment-200/80 flex items-center justify-between text-[11px] text-ink-500">
                    <span>Status: Active</span>
                    <span className="text-forest-700 font-medium">Verified Talent</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Shared Documents Vault */}
      {activeTab === 'documents' && (
        <div className="bg-white border border-parchment-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
            <div>
              <h3 className="font-serif text-base font-semibold text-ink-950">
                Shared Documents & Legal Contracts
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                Inspect proposals, statements of work, NDAs, and onboarding guides issued to {currentClient.companyName}.
              </p>
            </div>
            <span className="text-xs bg-parchment-100 text-ink-600 px-2.5 py-1 rounded-lg border border-parchment-200 font-medium">
              {generalDocs.length} Shared Papers
            </span>
          </div>

          <div className="divide-y divide-parchment-100">
            {generalDocs.map((doc) => (
              <div
                key={doc.id}
                className="py-3.5 flex items-center justify-between hover:bg-parchment-50/50 px-2 rounded-lg transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-parchment-100 flex items-center justify-center text-clay-700 border border-parchment-200">
                    <Files className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-xs text-ink-950">
                      {doc.title}
                    </h4>
                    <div className="text-[11px] text-ink-500 flex items-center gap-2 mt-0.5">
                      <span className="font-mono">{doc.docNumber}</span>
                      <span>•</span>
                      <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {doc.clientNotes && (
                      <div className="text-[10px] text-clay-700 bg-clay-50/80 px-2 py-0.5 rounded border border-clay-200 mt-1 italic max-w-md truncate">
                        Agency Memo: &quot;{doc.clientNotes}&quot;
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="uppercase text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {doc.status}
                  </span>

                  <button
                    onClick={() => setInspectingDoc(doc)}
                    className="flex items-center gap-1.5 text-xs font-medium text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Invoices & Receipts */}
      {activeTab === 'financials' && (
        <div className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-parchment-200 rounded-xl p-4 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-ink-400">Total Project Commitment</div>
              <div className="font-serif text-2xl font-semibold text-ink-950 mt-1 font-mono">
                ${primaryOrder?.budgetTotal.toLocaleString() || '24,500'}
              </div>
              <div className="text-[11px] text-ink-500 mt-0.5">Fixed commercial engagement</div>
            </div>

            <div className="bg-white border border-parchment-200 rounded-xl p-4 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Total Funds Settled</div>
              <div className="font-serif text-2xl font-semibold text-emerald-700 mt-1 font-mono">
                $12,000
              </div>
              <div className="text-[11px] text-emerald-800 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phase 1 & 2 Kickoff Paid</span>
              </div>
            </div>

            <div className="bg-white border border-parchment-200 rounded-xl p-4 shadow-xs">
              <div className="text-[10px] uppercase font-bold text-amber-700">Remaining Milestone Balance</div>
              <div className="font-serif text-2xl font-semibold text-amber-800 mt-1 font-mono">
                $12,500
              </div>
              <div className="text-[11px] text-ink-500 mt-0.5">Due upon Phase 3 & UAT sign-off</div>
            </div>
          </div>

          {/* Invoices List */}
          <div className="bg-white border border-parchment-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-semibold text-ink-950 pb-2 border-b border-parchment-200">
              Commercial Invoices
            </h3>
            <div className="divide-y divide-parchment-100">
              {clientInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="py-3 flex items-center justify-between hover:bg-parchment-50/50 px-2 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-xs text-ink-950">{inv.title}</div>
                      <div className="text-[11px] text-ink-500 font-mono mt-0.5">
                        {inv.docNumber} • Issued: {new Date(inv.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {inv.status}
                    </span>
                    <button
                      onClick={() => setInspectingDoc(inv)}
                      className="flex items-center gap-1.5 text-xs font-medium text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-3 py-1.5 rounded-lg transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Invoice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Receipts List */}
          <div className="bg-white border border-parchment-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-serif text-base font-semibold text-ink-950 pb-2 border-b border-parchment-200">
              Official Payment Receipts & Settlements
            </h3>
            <div className="divide-y divide-parchment-100">
              {clientReceipts.map((rcpt) => (
                <div
                  key={rcpt.id}
                  className="py-3 flex items-center justify-between hover:bg-parchment-50/50 px-2 rounded-lg transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-xs text-ink-950">{rcpt.title}</div>
                      <div className="text-[11px] text-ink-500 font-mono mt-0.5">
                        {rcpt.docNumber} • Settlement: {new Date(rcpt.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      Settled
                    </span>
                    <button
                      onClick={() => setInspectingDoc(rcpt)}
                      className="flex items-center gap-1.5 text-xs font-medium text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-3 py-1.5 rounded-lg transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wire Instructions Reminder for Pending Milestones */}
          <div className="bg-parchment-50 border border-parchment-200 rounded-xl p-4 text-xs space-y-2">
            <div className="font-semibold text-ink-900">
              Agency Wire & Bank Payment Coordinates
            </div>
            <p className="text-ink-600 leading-relaxed text-[11px]">
              For milestone payments, please remit funds referencing your Invoice number ({clientInvoices[0]?.docNumber || 'INV-2026-0189'}) to:
            </p>
            <div className="bg-white border border-parchment-300 rounded-lg p-3 font-mono text-[11px] text-ink-800 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><strong>Beneficiary:</strong> {agencyProfile.bankDetails.accountHolder}</div>
              <div><strong>Bank:</strong> {agencyProfile.bankDetails.bankName}</div>
              <div><strong>Account #:</strong> {agencyProfile.bankDetails.accountNumber}</div>
              <div><strong>Routing / Swift:</strong> {agencyProfile.bankDetails.routingOrSwift}</div>
            </div>
          </div>
        </div>
      )}

      {/* Document Inspector Modal (for viewing and printing shared documents) */}
      <ClientDocumentModal
        document={inspectingDoc}
        agencyProfile={agencyProfile}
        onClose={() => setInspectingDoc(null)}
      />
    </div>
  );
};
