import React, { useState } from 'react';
import { 
  Search, 
  KeyRound, 
  Trash2, 
  Copy, 
  Check, 
  Plus, 
  ShieldCheck, 
  ShieldAlert,
  Calendar,
  Files
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { ClientAccount } from '../../types/client';
import { AddClientModal } from './AddClientModal';
import { ManageClientDocumentsModal } from './ManageClientDocumentsModal';
import { CurrencyToggle } from '../common/CurrencyToggle';

export const ClientManagementDirectory: React.FC = () => {
  const { 
    clients, 
    removeClientItem, 
    regenerateClientCredentials,
    freelancers,
    activeCurrency,
    setActiveCurrency,
    formatMoney
  } = useAgency();

  const [searchQuery, setSearchQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [managingDocsClient, setManagingDocsClient] = useState<ClientAccount | null>(null);
  const [activePasswordSlip, setActivePasswordSlip] = useState<{ id: string; password: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = clients.filter((c) => {
    return (
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.orders.some((o) => o.title.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleResetPassword = async (c: ClientAccount) => {
    const res = await regenerateClientCredentials(c.id);
    if (res.newPassword) {
      setActivePasswordSlip({ id: c.id, password: res.newPassword });
    }
  };

  const handleCopyCredentials = (c: ClientAccount) => {
    const pwd = activePasswordSlip?.id === c.id 
      ? activePasswordSlip.password 
      : (c.credentials.temporaryPassword || 'Set by client');

    const slip = `Client Portal Access for ${c.companyName}:
- Contact: ${c.contactName} (${c.contactTitle})
- Portal URL: ${window.location.origin}
- Username: ${c.credentials.username}
- Temporary Password: ${pwd}
- Project: ${c.orders[0]?.title}
${c.credentials.mustChangePassword ? '- Note: Must set permanent password on first login' : ''}`;

    navigator.clipboard.writeText(slip);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
        <div>
          <h2 className="font-serif text-2xl text-ink-950 font-normal">
            Client Directory & Portal Access
          </h2>
          <p className="text-xs text-ink-500 font-light mt-0.5">
            Onboard client organizations, assign project leads, configure delivery milestones, and issue portal credentials
          </p>
        </div>
        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Setup New Client</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-parchment-200 rounded-xl p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, contact person, or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-parchment-200 rounded-lg focus:outline-none focus:border-clay-600 bg-parchment-50/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <CurrencyToggle 
            value={activeCurrency} 
            onChange={setActiveCurrency} 
            size="sm" 
            showRateNotice={true} 
          />
          <div className="text-xs text-ink-500 font-medium">
            Total Active Clients: <strong className="text-ink-900 font-mono">{clients.length}</strong>
          </div>
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((c) => {
          const primaryOrder = c.orders[0];
          const lead = freelancers.find((f) => f.id === primaryOrder?.projectLeadId);

          return (
            <div
              key={c.id}
              className="bg-white border border-parchment-200 rounded-2xl p-6 hover:border-clay-300 hover:shadow-xs transition flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-parchment-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-clay-700 to-ink-950 text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
                      {c.companyName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-semibold text-ink-950 leading-tight">
                        {c.companyName}
                      </h3>
                      <div className="text-xs text-ink-600 font-medium mt-0.5">
                        {c.contactName} • <span className="text-ink-400">{c.contactTitle}</span>
                      </div>
                      <div className="text-[11px] text-ink-400 font-mono">
                        {c.email}
                      </div>
                    </div>
                  </div>

                  <div>
                    {c.credentials.mustChangePassword ? (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Invited</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Portal Active</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Project Order Overview */}
                {primaryOrder && (
                  <div className="bg-parchment-50/80 border border-parchment-200 rounded-xl p-3.5 my-3 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-ink-950 truncate max-w-[260px]">
                        {primaryOrder.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-clay-700 bg-white px-1.5 py-0.5 rounded border border-parchment-300">
                        {primaryOrder.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-ink-600">
                        <span>Milestones Progress</span>
                        <span className="font-mono font-bold text-ink-900">{primaryOrder.progressPercentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-parchment-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-clay-600 rounded-full"
                          style={{ width: `${primaryOrder.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-parchment-200 text-[11px]">
                      <div className="flex items-center gap-1 text-ink-600">
                        <Calendar className="w-3 h-3 text-ink-400" />
                        <span>Target: <strong className="text-ink-800 font-mono">{primaryOrder.targetDeliveryDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1 text-ink-600 justify-end">
                        <span className="font-mono font-bold text-ink-900">
                          {formatMoney(primaryOrder.budgetTotal, primaryOrder.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-ink-500 flex items-center justify-between pt-1">
                      <span>Project Lead: <strong className="text-ink-800">{lead?.name || primaryOrder.projectLeadName}</strong></span>
                      <span className="text-ink-400">{primaryOrder.milestones.length} Milestones</span>
                    </div>
                  </div>
                )}

                {/* Portal Credentials Bar */}
                <div className="bg-white border border-parchment-200 rounded-lg p-2.5 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between text-ink-600">
                    <span className="text-ink-400 font-sans font-medium text-[10px] uppercase">Portal Username</span>
                    <span className="text-ink-950 font-semibold">{c.credentials.username}</span>
                  </div>
                  <div className="flex justify-between items-center text-ink-600">
                    <span className="text-ink-400 font-sans font-medium text-[10px] uppercase">Temporary Password</span>
                    <span className="text-clay-700 font-bold bg-parchment-50 px-1.5 py-0.5 rounded border border-parchment-200">
                      {activePasswordSlip?.id === c.id
                        ? activePasswordSlip.password
                        : (c.credentials.temporaryPassword || 'Set by client')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-parchment-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyCredentials(c)}
                    className="flex items-center gap-1 text-[11px] font-medium text-ink-700 hover:text-ink-950 bg-parchment-100 hover:bg-parchment-200 px-2.5 py-1 rounded transition"
                    title="Copy client portal login invitation"
                  >
                    {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-ink-500" />}
                    <span>{copiedId === c.id ? 'Copied' : 'Copy Invitation'}</span>
                  </button>

                  <button
                    onClick={() => setManagingDocsClient(c)}
                    className="flex items-center gap-1 text-[11px] font-medium text-clay-700 hover:text-clay-900 bg-clay-50 hover:bg-clay-100 px-2.5 py-1 rounded border border-clay-200 transition"
                    title="View and dispatch documents to this client"
                  >
                    <Files className="w-3.5 h-3.5" />
                    <span>Shared Papers ({c.sharedDocumentIds?.length || 0})</span>
                  </button>

                  <button
                    onClick={() => handleResetPassword(c)}
                    className="flex items-center gap-1 text-[11px] text-ink-600 hover:text-clay-700 bg-white hover:bg-clay-50 px-2 py-1 rounded border border-parchment-200 transition"
                    title="Issue new temporary password for client"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Reset Temp Pwd</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remove client account for ${c.companyName}?`)) {
                      removeClientItem(c.id);
                    }
                  }}
                  title="Remove client"
                  className="p-1.5 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AddClientModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <ManageClientDocumentsModal
        isOpen={Boolean(managingDocsClient)}
        client={managingDocsClient}
        onClose={() => setManagingDocsClient(null)}
      />
    </div>
  );
};
