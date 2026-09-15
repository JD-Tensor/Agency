import React, { useState } from 'react';
import { 
  GitBranch, 
  Plus, 
  Lock, 
  Unlock, 
  Code, 
  Search,
  UserCheck,
  Building
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { 
  IpOwnershipRecord, 
  IpOwnershipType 
} from '../../types/partnership';

export const IpRegistryView: React.FC = () => {
  const { ipRecords, addNewIpRecord, updateIpRecordItem, removeIpRecordItem, currentUser } = useAgency();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IpOwnershipRecord | null>(null);

  const [form, setForm] = useState<Partial<IpOwnershipRecord>>({
    title: '',
    repositoryUrl: 'https://github.com/janadas-eng/',
    commitHashOrVersion: 'v1.0.0',
    ownershipType: '100% Partnership Proprietary',
    clientAssignmentId: '',
    clientName: '',
    primaryAuthorPartner: 'Subhadip Jana',
    registrationDate: new Date().toISOString().split('T')[0],
    legalStatus: 'copyright_claimed',
    licenseTerms: 'All rights reserved. Proprietary software intellectual property of Jana & Das Engineering Partners.',
    summary: ''
  });

  const canManageIp = currentUser?.roleLevel !== undefined ? currentUser.roleLevel >= 60 : true;

  const filteredRecords = ipRecords.filter(r => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.summary && r.summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.clientName && r.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || r.ownershipType === filterType;
    return matchesSearch && matchesType;
  });

  const proprietaryCount = ipRecords.filter(r => r.ownershipType === '100% Partnership Proprietary').length;
  const clientAssignedCount = ipRecords.filter(r => r.ownershipType === 'Client Work-for-Hire Assigned').length;

  const handleOpenNew = () => {
    setForm({
      title: '',
      repositoryUrl: 'https://github.com/janadas-eng/',
      commitHashOrVersion: 'v1.0.0',
      ownershipType: '100% Partnership Proprietary',
      clientAssignmentId: '',
      clientName: '',
      primaryAuthorPartner: 'Subhadip Jana',
      registrationDate: new Date().toISOString().split('T')[0],
      legalStatus: 'copyright_claimed',
      licenseTerms: 'All rights reserved. Proprietary software intellectual property of Jana & Das Engineering Partners.',
      summary: 'High-performance microservice framework and shared libraries.'
    });
    setSelectedRecord(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRecord) {
      await updateIpRecordItem(selectedRecord.id, form);
    } else {
      await addNewIpRecord(form);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-ink-950">Intellectual Property & Code Ownership</h1>
            <span className="text-xs bg-clay-100 text-clay-800 font-semibold px-2 py-0.5 rounded-full">
              Ledger 7 of 10
            </span>
          </div>
          <p className="text-sm text-ink-500 mt-1">
            Official legal register distinguishing 100% Firm Proprietary Code from Client Work-for-Hire Assignments.
          </p>
        </div>

        {canManageIp && (
          <button
            onClick={handleOpenNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-clay-600 hover:bg-clay-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Register Code / IP Asset
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Firm Proprietary IP</span>
            <div className="p-2 rounded-lg bg-clay-50 text-clay-700">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-clay-800 mt-2">
            {proprietaryCount} Repositories
          </div>
          <div className="text-xs text-ink-500 mt-1">Solely owned by Jana & Das Engineering Partners</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Client Assigned Work</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Unlock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-blue-900 mt-2">
            {clientAssignedCount} Projects
          </div>
          <div className="text-xs text-ink-500 mt-1">Work-for-hire rights transferred under contract</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-parchment-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">IP Author Attribution</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-sm font-medium text-ink-800 mt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subhadip Jana:</span>
              <span className="font-semibold">{ipRecords.filter(r => r.primaryAuthorPartner === 'Subhadip Jana').length} assets</span>
            </div>
            <div className="flex justify-between">
              <span>Shayan Das:</span>
              <span className="font-semibold">{ipRecords.filter(r => r.primaryAuthorPartner === 'Shayan Das').length} assets</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3 rounded-xl border border-parchment-200 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            placeholder="Search IP titles, repositories, or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-medium text-ink-700 w-full sm:w-auto"
        >
          <option value="all">All Ownership Types</option>
          <option value="100% Partnership Proprietary">100% Firm Proprietary</option>
          <option value="Client Work-for-Hire Assigned">Client Work-for-Hire</option>
          <option value="Dual-Licensed">Dual-Licensed</option>
          <option value="Open Source">Open Source</option>
        </select>
      </div>

      {/* IP Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecords.length === 0 ? (
          <div className="col-span-2 py-10 text-center bg-white rounded-xl border border-parchment-200 text-ink-400 text-xs">
            No intellectual property records match your search.
          </div>
        ) : (
          filteredRecords.map((item) => {
            const isProprietary = item.ownershipType === '100% Partnership Proprietary';
            return (
              <div key={item.id} className="bg-white rounded-xl border border-parchment-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        isProprietary
                          ? 'bg-clay-100 text-clay-800 border border-clay-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {isProprietary ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {item.ownershipType}
                      </span>
                      <h2 className="text-base font-serif font-bold text-ink-950 mt-2">{item.title}</h2>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-parchment-100 text-ink-600">
                      {item.legalStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-ink-600 mt-2 line-clamp-2">{item.summary}</p>

                  <div className="mt-4 p-3 bg-parchment-50 rounded-lg space-y-1.5 text-xs text-ink-700 font-mono">
                    {item.repositoryUrl && (
                      <div className="flex items-center gap-2 truncate">
                        <GitBranch className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                        <span className="truncate text-clay-700">{item.repositoryUrl}</span>
                      </div>
                    )}
                    {item.commitHashOrVersion && (
                      <div className="flex items-center gap-2">
                        <Code className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                        <span className="text-ink-600">Tag / Hash: {item.commitHashOrVersion}</span>
                      </div>
                    )}
                    {item.clientName && (
                      <div className="flex items-center gap-2 text-ink-800 font-sans">
                        <Building className="w-3.5 h-3.5 text-ink-400 shrink-0" />
                        <span>Assigned to: {item.clientName}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-parchment-200 flex items-center justify-between text-xs">
                  <div className="text-ink-500">
                    Lead Partner: <span className="font-semibold text-ink-800">{item.primaryAuthorPartner}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canManageIp && (
                      <button
                        onClick={() => {
                          setSelectedRecord(item);
                          setForm(item);
                          setIsModalOpen(true);
                        }}
                        className="text-clay-600 hover:text-clay-800 font-semibold"
                      >
                        Edit Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* IP Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-parchment-200 max-w-lg w-full p-6">
            <h2 className="text-lg font-serif font-bold text-ink-950 mb-3">
              {selectedRecord ? 'Edit IP Ownership Record' : 'Register New Code & IP Asset'}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Asset Title / Codebase Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Telemetry Real-time Engine"
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Ownership Classification</label>
                  <select
                    value={form.ownershipType}
                    onChange={(e) => setForm({ ...form, ownershipType: e.target.value as IpOwnershipType })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  >
                    <option value="100% Partnership Proprietary">100% Firm Proprietary</option>
                    <option value="Client Work-for-Hire Assigned">Client Work-for-Hire Assigned</option>
                    <option value="Dual-Licensed">Dual-Licensed</option>
                    <option value="Open Source">Open Source (MIT / Apache)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Primary Author Partner</label>
                  <select
                    value={form.primaryAuthorPartner}
                    onChange={(e) => setForm({ ...form, primaryAuthorPartner: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                  >
                    <option value="Subhadip Jana">Subhadip Jana</option>
                    <option value="Shayan Das">Shayan Das</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Git Repository URL</label>
                  <input
                    type="text"
                    value={form.repositoryUrl || ''}
                    onChange={(e) => setForm({ ...form, repositoryUrl: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-ink-700">Commit Hash / Version</label>
                  <input
                    type="text"
                    value={form.commitHashOrVersion || ''}
                    onChange={(e) => setForm({ ...form, commitHashOrVersion: e.target.value })}
                    className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Client Assignment (if applicable)</label>
                <input
                  type="text"
                  placeholder="Client company name or contract SOW number"
                  value={form.clientName || ''}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">Summary & Architecture Scope</label>
                <textarea
                  rows={2}
                  value={form.summary || ''}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-ink-700">License Terms & Retention Notice</label>
                <textarea
                  rows={2}
                  value={form.licenseTerms || ''}
                  onChange={(e) => setForm({ ...form, licenseTerms: e.target.value })}
                  className="w-full px-3 py-1.5 bg-parchment-50 border border-parchment-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-parchment-200">
                {selectedRecord && canManageIp ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`Remove IP record ${selectedRecord.title}?`)) {
                        await removeIpRecordItem(selectedRecord.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                  >
                    Delete Record
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-ink-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-semibold rounded-lg"
                  >
                    Save IP Record
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
