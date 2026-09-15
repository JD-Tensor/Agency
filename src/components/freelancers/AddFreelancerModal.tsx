import React, { useState } from 'react';
import { X, UserPlus, KeyRound, Copy, Check, Clock, ShieldAlert } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { AccessLevel, Freelancer, PaymentType } from '../../types/freelancers';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { CurrencyCode, convertAmount } from '../../services/currency';

interface AddFreelancerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddFreelancerModal: React.FC<AddFreelancerModalProps> = ({ isOpen, onClose }) => {
  const { addNewFreelancer, agencyProfile, activeCurrency, formatMoney } = useAgency();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Senior UI/UX Designer');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('contributor');
  const [paymentType, setPaymentType] = useState<PaymentType>('hourly');
  const [currency, setCurrency] = useState<CurrencyCode>(activeCurrency);
  const [paymentAmount, setPaymentAmount] = useState<number>(() => activeCurrency === 'INR' ? 3500 : 85);
  const [skillsString, setSkillsString] = useState('Figma, Design Systems, Prototyping');
  const [notes, setNotes] = useState('');

  const [createdFreelancer, setCreatedFreelancer] = useState<Freelancer | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skills = skillsString.split(',').map((s) => s.trim()).filter(Boolean);
    const newFl = addNewFreelancer({
      name,
      email,
      role,
      accessLevel,
      paymentType,
      paymentAmount,
      currency,
      skills,
      notes
    });
    setCreatedFreelancer(newFl);
  };

  const handleCopyCredentials = () => {
    if (!createdFreelancer) return;
    const paymentLabel = createdFreelancer.paymentType === 'fixed' 
      ? `${formatMoney(createdFreelancer.paymentAmount, createdFreelancer.currency)} (Fixed Project/Monthly)` 
      : `${formatMoney(createdFreelancer.paymentAmount, createdFreelancer.currency)}/hr (Hourly)`;

    const slip = `Welcome to ${agencyProfile.name}!
Here are your login credentials for our management platform:
- Platform URL: ${window.location.origin}
- Username: ${createdFreelancer.credentials.username}
- Email: ${createdFreelancer.email}
- Temporary Password: ${createdFreelancer.credentials.temporaryPassword}
- Compensation Model: ${paymentLabel}
- Role: ${createdFreelancer.role}
- Access Level: ${createdFreelancer.accessLevel.toUpperCase()}

Security Note: Upon your first login, you will be prompted to establish your permanent password.`;

    navigator.clipboard.writeText(slip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const resetFormAndClose = () => {
    setName('');
    setEmail('');
    setPaymentType('hourly');
    setPaymentAmount(85);
    setCreatedFreelancer(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white border border-parchment-300 rounded-2xl p-6 shadow-xl relative animate-in zoom-in-95">
        <button
          onClick={resetFormAndClose}
          className="absolute right-4 top-4 p-1.5 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-parchment-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {!createdFreelancer ? (
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg bg-clay-600 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-ink-950">
                  Onboard New Freelancer
                </h3>
                <p className="text-[11px] text-ink-500">
                  Configure role, access level, compensation terms, and temporary credentials
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                    placeholder="e.g. Liam Foster"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                    placeholder="liam@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Allocated Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                    placeholder="e.g. Senior Mobile Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Access Level (RBAC)</label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value as AccessLevel)}
                    className="w-full text-xs p-2 border border-parchment-300 rounded bg-white"
                  >
                    <option value="contributor">Contributor (Assigned Tasks & Deliverables)</option>
                    <option value="project_lead">Project Lead (Manage Tasks & Create SOW/Briefs)</option>
                    <option value="admin">Admin (Full Access)</option>
                    <option value="restricted">Restricted (View-Only Deliverables)</option>
                  </select>
                </div>
              </div>

              {/* Payment Model Selection (Hourly vs Fixed) */}
              <div className="p-3 bg-parchment-50 border border-parchment-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-parchment-200">
                  <div className="flex items-center gap-1 bg-parchment-100 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType('hourly');
                        if (paymentAmount > 500) setPaymentAmount(currency === 'INR' ? 3500 : 85);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                        paymentType === 'hourly'
                          ? 'bg-white text-ink-950 shadow-xs'
                          : 'text-ink-600 hover:text-ink-900'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-clay-600" />
                      <span>Hourly Rate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentType('fixed');
                        if (paymentAmount < 500) setPaymentAmount(currency === 'INR' ? 150000 : 3500);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition ${
                        paymentType === 'fixed'
                          ? 'bg-white text-ink-950 shadow-xs'
                          : 'text-ink-600 hover:text-ink-900'
                      }`}
                    >
                      <span>Fixed Payment</span>
                    </button>
                  </div>

                  <CurrencyToggle
                    value={currency}
                    onChange={(newCurr) => {
                      const converted = convertAmount(paymentAmount, currency, newCurr);
                      setCurrency(newCurr);
                      setPaymentAmount(converted);
                    }}
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-ink-600 mb-1">
                      {paymentType === 'hourly' 
                        ? `Hourly Rate Amount (${currency === 'INR' ? '₹' : '$'} / hour)` 
                        : `Fixed Payment Amount (${currency === 'INR' ? '₹' : '$'})`}
                    </label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-ink-400">
                        {currency === 'INR' ? '₹' : '$'}
                      </span>
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs pl-6 pr-3 py-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none font-mono"
                        min={0}
                        step={paymentType === 'hourly' ? (currency === 'INR' ? 100 : 5) : (currency === 'INR' ? 1000 : 50)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-ink-600 mb-1">Payment Frequency / Type</label>
                    <div className="text-xs p-2 bg-white border border-parchment-300 rounded text-ink-700 flex items-center justify-between">
                      <span>{paymentType === 'hourly' ? 'Time Logged / Invoiced' : 'Milestone / Retainer'}</span>
                      <span className="text-[10px] uppercase font-bold text-clay-700 bg-parchment-100 px-1.5 py-0.5 rounded">
                        {paymentType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">Core Skills (Comma separated)</label>
                <input
                  type="text"
                  value={skillsString}
                  onChange={(e) => setSkillsString(e.target.value)}
                  className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                  placeholder="React, Figma, Node, GraphQL"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-700 mb-1">Internal Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                  placeholder="Onboarded for upcoming client sprint deliverables..."
                />
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
                  className="bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Generate Credentials & Onboard</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Welcome & Credential Slip View */
          <div>
            <div className="flex items-center gap-2 text-forest-700 text-xs font-semibold mb-2">
              <Check className="w-4 h-4 bg-emerald-100 rounded-full p-0.5 text-emerald-700" />
              <span>Freelancer Account Generated Successfully</span>
            </div>
            <h3 className="font-serif text-xl font-semibold text-ink-950 mb-1">
              {createdFreelancer.name} Onboarded
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              Share these credentials with the team member. They will be prompted to set their permanent password on first login.
            </p>

            <div className="bg-parchment-50 border border-parchment-300 rounded-xl p-4 font-mono text-xs text-ink-900 space-y-2 mb-4">
              <div className="flex justify-between border-b border-parchment-200 pb-2">
                <span className="text-ink-500 font-sans">Assigned Username:</span>
                <span className="font-semibold text-ink-950">{createdFreelancer.credentials.username}</span>
              </div>
              <div className="flex justify-between border-b border-parchment-200 pb-2">
                <span className="text-ink-500 font-sans">Email:</span>
                <span className="text-ink-800">{createdFreelancer.email}</span>
              </div>
              <div className="flex justify-between border-b border-parchment-200 pb-2 items-center">
                <span className="text-ink-500 font-sans">Temporary Password:</span>
                <span className="font-bold text-clay-700 bg-white px-2 py-0.5 rounded border border-parchment-300">
                  {createdFreelancer.credentials.temporaryPassword}
                </span>
              </div>
              <div className="flex justify-between border-b border-parchment-200 pb-2">
                <span className="text-ink-500 font-sans">Payment Terms:</span>
                <span className="font-semibold text-emerald-700">
                  {createdFreelancer.paymentType === 'fixed'
                    ? `${formatMoney(createdFreelancer.paymentAmount, createdFreelancer.currency)} Fixed Payment`
                    : `${formatMoney(createdFreelancer.paymentAmount, createdFreelancer.currency)}/hr Hourly Rate`}
                </span>
              </div>
              <div className="flex justify-between border-b border-parchment-200 pb-2">
                <span className="text-ink-500 font-sans">Access Level:</span>
                <span className="font-medium uppercase text-[11px] text-clay-700 bg-clay-50 px-2 py-0.5 rounded">
                  {createdFreelancer.accessLevel}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-ink-500 font-sans">Allocated Role:</span>
                <span className="text-ink-800">{createdFreelancer.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs mb-4">
              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>The freelancer will be mandated to change their password upon their first sign-in.</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Credentials Copied!' : 'Copy Credential Slip'}</span>
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
