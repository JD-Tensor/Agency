import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  KeyRound, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { Freelancer, AccessLevel } from '../../types/freelancers';
import { AddFreelancerModal } from './AddFreelancerModal';
import { CurrencyToggle } from '../common/CurrencyToggle';

export const FreelancerDirectory: React.FC = () => {
  const { 
    freelancers, 
    tasks, 
    removeFreelancer, 
    regeneratePassword,
    activeCurrency,
    setActiveCurrency,
    formatMoney
  } = useAgency();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [activePasswordSlip, setActivePasswordSlip] = useState<{ id: string; password: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = freelancers.filter((fl) => {
    const matchesSearch =
      fl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fl.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fl.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fl.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = selectedLevel === 'all' || fl.accessLevel === selectedLevel;
    const matchesPayment = selectedPaymentType === 'all' || fl.paymentType === selectedPaymentType;

    return matchesSearch && matchesLevel && matchesPayment;
  });

  const getAccessBadge = (level: AccessLevel) => {
    switch (level) {
      case 'admin':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">Admin</span>;
      case 'project_lead':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">Project Lead</span>;
      case 'contributor':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">Contributor</span>;
      case 'restricted':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded font-semibold uppercase">Restricted</span>;
    }
  };

  const handleResetPassword = (fl: Freelancer) => {
    const res = regeneratePassword(fl.id);
    if (res.newPassword) {
      setActivePasswordSlip({ id: fl.id, password: res.newPassword });
    }
  };

  const handleCopyCredentials = (fl: Freelancer) => {
    const pwd = activePasswordSlip && activePasswordSlip.id === fl.id 
      ? activePasswordSlip.password 
      : (fl.credentials.temporaryPassword || 'Set by user');

    const paymentInfo = fl.paymentType === 'fixed'
      ? `${formatMoney(fl.paymentAmount || 0, fl.currency)} Fixed Fee`
      : `${formatMoney(fl.paymentAmount || fl.hourlyRate || 0, fl.currency)}/hr Hourly`;

    const slip = `Credentials for ${fl.name}:
- Username: ${fl.credentials.username}
- Password: ${pwd}
- Compensation: ${paymentInfo}
- Role: ${fl.role} (${fl.accessLevel.toUpperCase()})
${fl.credentials.mustChangePassword ? '- Note: Must set permanent password on first login' : ''}`;

    navigator.clipboard.writeText(slip);
    setCopiedId(fl.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
        <div>
          <h2 className="font-serif text-2xl text-ink-950 font-normal">
            Freelancer & Team Directory
          </h2>
          <p className="text-xs text-ink-500 font-light mt-0.5">
            Manage agency talent, allocate roles, set hourly or fixed compensation, and issue credentials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CurrencyToggle 
            value={activeCurrency} 
            onChange={setActiveCurrency} 
            size="sm" 
            showRateNotice={true} 
          />
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add New Freelancer</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-parchment-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search freelancers by name, role, skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-parchment-200 rounded-lg focus:outline-none focus:border-clay-600 bg-parchment-50/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-500 font-medium">Access:</span>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="text-xs p-1.5 border border-parchment-200 rounded-lg bg-white text-ink-800"
          >
            <option value="all">All Access Levels</option>
            <option value="admin">Admin</option>
            <option value="project_lead">Project Lead</option>
            <option value="contributor">Contributor</option>
            <option value="restricted">Restricted</option>
          </select>

          <span className="text-xs text-ink-500 font-medium ml-2">Pay Model:</span>
          <select
            value={selectedPaymentType}
            onChange={(e) => setSelectedPaymentType(e.target.value)}
            className="text-xs p-1.5 border border-parchment-200 rounded-lg bg-white text-ink-800"
          >
            <option value="all">All Pay Models</option>
            <option value="hourly">Hourly Rate ($/hr)</option>
            <option value="fixed">Fixed Payment ($)</option>
          </select>
        </div>
      </div>

      {/* Freelancers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((fl) => {
          const flTasks = tasks.filter((t) => t.freelancerId === fl.id);
          const activeTasks = flTasks.filter((t) => t.status !== 'completed');
          const completedTasks = flTasks.filter((t) => t.status === 'completed');

          const isFixed = fl.paymentType === 'fixed';
          const payAmount = fl.paymentAmount || fl.hourlyRate || 0;

          return (
            <div
              key={fl.id}
              className="bg-white border border-parchment-200 rounded-xl p-5 hover:border-clay-300 hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-parchment-200 flex items-center justify-center font-serif font-bold text-ink-800 text-sm border border-parchment-300">
                      {fl.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-semibold text-ink-950 leading-tight">
                        {fl.name}
                      </h3>
                      <div className="text-[11px] text-ink-500 truncate w-40">
                        {fl.email}
                      </div>
                    </div>
                  </div>
                  <div>{getAccessBadge(fl.accessLevel)}</div>
                </div>

                {/* Role and Compensation Details */}
                <div className="bg-parchment-50 p-2.5 rounded-lg border border-parchment-200 mb-3 text-xs">
                  <div className="font-medium text-ink-800">{fl.role}</div>
                  <div className="text-[11px] text-ink-600 mt-1 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono">
                      {isFixed ? (
                        <span className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <span>{formatMoney(payAmount, fl.currency)} Fixed</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-ink-800 font-semibold bg-white px-1.5 py-0.5 rounded border border-parchment-200">
                          <Clock className="w-3 h-3 text-clay-600" />
                          <span>{formatMoney(payAmount, fl.currency)}/hr Hourly</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-ink-400">Joined: {fl.joinedDate}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="mb-3">
                  <div className="text-[10px] uppercase font-semibold text-ink-400 tracking-wider mb-1">
                    Skills & Specialties
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {fl.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] bg-parchment-100 text-ink-700 px-2 py-0.5 rounded border border-parchment-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Task Workload Summary */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs border-t border-parchment-100 pt-2.5">
                  <div className="bg-white border border-parchment-200 p-2 rounded flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <div>
                      <div className="font-bold text-ink-900 text-sm font-mono">{activeTasks.length}</div>
                      <div className="text-[10px] text-ink-500">Active Tasks</div>
                    </div>
                  </div>
                  <div className="bg-white border border-parchment-200 p-2 rounded flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <div>
                      <div className="font-bold text-ink-900 text-sm font-mono">{completedTasks.length}</div>
                      <div className="text-[10px] text-ink-500">Completed</div>
                    </div>
                  </div>
                </div>

                {/* Credentials & Password Status */}
                <div className="bg-parchment-50/70 border border-parchment-200 rounded p-2.5 mb-3 text-[11px] font-mono">
                  <div className="flex items-center justify-between text-ink-600 mb-1">
                    <span className="text-[10px] uppercase text-ink-400 font-sans font-semibold">Username</span>
                    <span className="text-ink-900 font-semibold">{fl.credentials.username}</span>
                  </div>

                  <div className="flex items-center justify-between text-ink-600">
                    <span className="text-[10px] uppercase text-ink-400 font-sans font-semibold">Status</span>
                    {fl.credentials.mustChangePassword ? (
                      <span className="flex items-center gap-1 text-amber-700 text-[10px] font-sans font-medium bg-amber-50 px-1.5 py-0.5 rounded">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Temp Pwd (Reset on 1st login)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-700 text-[10px] font-sans font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Permanent Password Active</span>
                      </span>
                    )}
                  </div>

                  {activePasswordSlip?.id === fl.id && (
                    <div className="mt-1.5 pt-1.5 border-t border-parchment-200 flex items-center justify-between">
                      <span className="text-[10px] text-clay-700 font-sans">New Temp Code:</span>
                      <span className="text-clay-800 font-bold bg-white px-1.5 rounded border border-clay-200">
                        {activePasswordSlip.password}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons (Strictly Professional: Copy Slip, Reset Temp Password, Remove) */}
              <div className="pt-3 border-t border-parchment-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyCredentials(fl)}
                    className="flex items-center gap-1 text-[11px] font-medium text-ink-700 hover:text-ink-950 bg-parchment-100 hover:bg-parchment-200 px-2.5 py-1 rounded transition"
                    title="Copy onboarding credentials to clipboard"
                  >
                    {copiedId === fl.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-ink-500" />}
                    <span>{copiedId === fl.id ? 'Copied' : 'Copy Slip'}</span>
                  </button>

                  <button
                    onClick={() => handleResetPassword(fl)}
                    title="Issue new temporary password (mandates password change on next login)"
                    className="flex items-center gap-1 text-[11px] text-ink-600 hover:text-clay-700 bg-white hover:bg-clay-50 px-2 py-1 rounded border border-parchment-200 transition"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Reset Temp Pwd</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remove freelancer ${fl.name}? Their assigned tasks will remain in history.`)) {
                      removeFreelancer(fl.id);
                    }
                  }}
                  title="Remove freelancer"
                  className="p-1.5 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AddFreelancerModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
};
