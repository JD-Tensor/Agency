import React, { useState } from 'react';
import { X, Building2, KeyRound, Copy, Check, ShieldAlert, UserCheck } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { ClientAccount } from '../../types/client';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { CurrencyCode, convertAmount } from '../../services/currency';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose }) => {
  const { addNewClient, freelancers, agencyProfile, activeCurrency, formatMoney } = useAgency();

  // Company and contact state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('VP of Product / Tech Lead');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Initial project/order state
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(activeCurrency);
  const [budgetTotal, setBudgetTotal] = useState<number>(() => activeCurrency === 'INR' ? 1500000 : 18500);
  const [targetDeliveryDate, setTargetDeliveryDate] = useState<string>(
    new Date(Date.now() + 45 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [projectLeadId, setProjectLeadId] = useState<string>(
    freelancers.find((f) => f.accessLevel === 'project_lead')?.id || freelancers[0]?.id || ''
  );
  const [selectedFreelancerIds, setSelectedFreelancerIds] = useState<string[]>([]);

  const [createdClient, setCreatedClient] = useState<ClientAccount | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newClient = await addNewClient({
        companyName,
        contactName,
        contactTitle,
        email,
        phone,
        address,
        projectTitle: projectTitle || `${companyName} Project Engagement`,
        projectDescription: projectDescription || 'Core development and design sprint deliverables.',
        budgetTotal,
        currency,
        targetDeliveryDate,
        projectLeadId: projectLeadId || freelancers[0]?.id || '',
        assignedFreelancerIds: selectedFreelancerIds.length > 0 ? selectedFreelancerIds : [projectLeadId],
        communicationChannels: {
          slackChannel: `#${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}-sync`,
          meetingSchedule: 'Weekly Sprint Sync — Thursdays 10:00 AM EST',
          contactEmail: email
        }
      });

      setCreatedClient(newClient);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyInvitation = () => {
    if (!createdClient) return;
    const slip = `Welcome to the ${agencyProfile.name} Client Portal!
Here are your private credentials to track your project, review milestones, and access shared papers:
- Client Portal URL: ${window.location.origin}
- Username: ${createdClient.credentials.username}
- Email: ${createdClient.email}
- Temporary Password: ${createdClient.credentials.temporaryPassword}
- Company: ${createdClient.companyName}
- Project: ${createdClient.orders[0]?.title}

Security Notice: On your first sign-in, you will establish your private permanent password.`;

    navigator.clipboard.writeText(slip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetFormAndClose = () => {
    setCompanyName('');
    setContactName('');
    setEmail('');
    setProjectTitle('');
    setProjectDescription('');
    setCreatedClient(null);
    onClose();
  };

  const toggleFreelancer = (id: string) => {
    if (selectedFreelancerIds.includes(id)) {
      setSelectedFreelancerIds(selectedFreelancerIds.filter((fId) => fId !== id));
    } else {
      setSelectedFreelancerIds([...selectedFreelancerIds, id]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white border border-parchment-300 rounded-2xl p-6 shadow-xl relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        <button
          onClick={resetFormAndClose}
          className="absolute right-4 top-4 p-1.5 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-parchment-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {!createdClient ? (
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-clay-600 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink-950">
                  Onboard & Setup Client Account
                </h3>
                <p className="text-[11px] text-ink-500">
                  Create client profile, configure active project order, and generate secure portal credentials
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Section 1: Client Company & Primary Stakeholder */}
              <div className="p-3.5 bg-parchment-50 border border-parchment-200 rounded-xl space-y-3">
                <div className="text-[11px] uppercase font-bold tracking-wider text-ink-700">
                  1. Company & Primary Stakeholder
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none bg-white"
                      placeholder="e.g. Acme Corp"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1">Primary Contact Name</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none bg-white"
                      placeholder="e.g. Sarah Jenkins"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1">Contact Title / Role</label>
                    <input
                      type="text"
                      value={contactTitle}
                      onChange={(e) => setContactTitle(e.target.value)}
                      className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none bg-white"
                      placeholder="e.g. Head of Engineering"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1">Client Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none bg-white"
                      placeholder="sarah@acme.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1">Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none bg-white"
                      placeholder="+1 (555) 019-2831"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1">HQ Address (Optional)</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none bg-white"
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Active Project & Delivery Setup */}
              <div className="p-3.5 bg-parchment-50 border border-parchment-200 rounded-xl space-y-3">
                <div className="text-[11px] uppercase font-bold tracking-wider text-ink-700">
                  2. Active Project Scope & Management
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1">Project Title</label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none bg-white"
                      placeholder="e.g. NextGen Web Platform Overhaul"
                      required
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-ink-700">
                        Project Budget ({currency === 'INR' ? '₹' : '$'})
                      </label>
                      <CurrencyToggle
                        value={currency}
                        onChange={(newCurr) => {
                          const converted = convertAmount(budgetTotal, currency, newCurr);
                          setCurrency(newCurr);
                          setBudgetTotal(converted);
                        }}
                        size="sm"
                      />
                    </div>
                    <input
                      type="number"
                      value={budgetTotal}
                      onChange={(e) => setBudgetTotal(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none bg-white font-mono"
                      min={0}
                      step={currency === 'INR' ? 10000 : 500}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Scope & Objectives Overview</label>
                  <textarea
                    rows={2}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none bg-white"
                    placeholder="Brief description of project requirements, deliverables, and architecture..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1">Assigned Project Lead</label>
                    <select
                      value={projectLeadId}
                      onChange={(e) => setProjectLeadId(e.target.value)}
                      className="w-full text-xs p-2 border border-parchment-300 rounded bg-white text-ink-800"
                    >
                      {freelancers.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name} ({f.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-700 mb-1">Target Delivery Date</label>
                    <input
                      type="date"
                      value={targetDeliveryDate}
                      onChange={(e) => setTargetDeliveryDate(e.target.value)}
                      className="w-full text-xs p-2 border border-parchment-300 rounded bg-white"
                      required
                    />
                  </div>
                </div>

                {/* Assigned Specialists Selection */}
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">
                    Assign Agency Specialists (Visible in Client Team Roster)
                  </label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {freelancers.map((fl) => {
                      const isSelected = selectedFreelancerIds.includes(fl.id) || fl.id === projectLeadId;
                      return (
                        <button
                          key={fl.id}
                          type="button"
                          onClick={() => toggleFreelancer(fl.id)}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs border text-left transition ${
                            isSelected
                              ? 'bg-clay-50 text-clay-900 border-clay-300 font-medium'
                              : 'bg-white border-parchment-200 text-ink-600 hover:border-parchment-300'
                          }`}
                        >
                          <div className="truncate">
                            <div className="truncate">{fl.name}</div>
                            <div className="text-[10px] text-ink-400 truncate">{fl.role}</div>
                          </div>
                          {isSelected && <UserCheck className="w-3.5 h-3.5 text-clay-700 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetFormAndClose}
                  className="px-3.5 py-1.5 rounded-lg border border-parchment-300 text-xs font-medium text-ink-700 hover:bg-parchment-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5 disabled:opacity-70"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Creating Login...' : 'Generate Client Portal & Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Client Portal Invitation Slip View */
          <div>
            <div className="flex items-center gap-2 text-forest-700 text-xs font-semibold mb-2">
              <Check className="w-4 h-4 bg-emerald-100 rounded-full p-0.5 text-emerald-700" />
              <span>Client Portal Account Created</span>
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink-950 mb-1">
              {createdClient.companyName} Onboarded
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              Share these login coordinates with {createdClient.contactName} to invite them into their dedicated project portal.
            </p>

            <div className="bg-parchment-50 border border-parchment-300 rounded-xl p-4 font-mono text-xs text-ink-900 space-y-2 mb-4">
              <div className="flex justify-between border-b border-parchment-200 pb-2">
                <span className="text-ink-500 font-sans">Company:</span>
                <span className="font-semibold text-ink-950">{createdClient.companyName}</span>
              </div>
              <div className="flex justify-between border-b border-parchment-200 pb-2">
                <span className="text-ink-500 font-sans">Contact:</span>
                <span className="text-ink-800">{createdClient.contactName} ({createdClient.contactTitle})</span>
              </div>
              <div className="flex justify-between border-b border-parchment-200 pb-2">
                <span className="text-ink-500 font-sans">Client Username:</span>
                <span className="font-semibold text-ink-950">{createdClient.credentials.username}</span>
              </div>
              <div className="flex justify-between border-b border-parchment-200 pb-2 items-center">
                <span className="text-ink-500 font-sans">Temporary Password:</span>
                <span className="font-bold text-clay-700 bg-white px-2 py-0.5 rounded border border-parchment-300">
                  {createdClient.credentials.temporaryPassword}
                </span>
              </div>
              <div className="flex justify-between border-b border-parchment-200 pb-2">
                <span className="text-ink-500 font-sans">Active Project:</span>
                <span className="text-ink-800 font-semibold">{createdClient.orders[0]?.title}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-ink-500 font-sans">Project Budget:</span>
                <span className="text-emerald-700 font-bold">
                  {formatMoney(createdClient.orders[0]?.budgetTotal || 0, createdClient.orders[0]?.currency)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs mb-4">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>The client will establish their private permanent password during their first sign-in.</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyInvitation}
                className="flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Invitation Copied!' : 'Copy Portal Invitation Slip'}</span>
              </button>

              <button
                type="button"
                onClick={resetFormAndClose}
                className="px-4 py-2 border border-parchment-300 rounded-lg text-xs font-medium text-ink-800 hover:bg-parchment-100"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
