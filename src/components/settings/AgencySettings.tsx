import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, 
  Check, 
  Building, 
  CreditCard, 
  Sparkles, 
  Upload, 
  Trash2, 
  PenTool, 
  Image as ImageIcon,
  RotateCcw,
  Plus,
  Star,
  CheckCircle2,
  FileSignature
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { AgencyProfile } from '../../types/agency';
import { defaultAgencyProfile } from '../../services/sampleData';
import { KeyRound, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const AgencySettings: React.FC = () => {
  const { 
    agencyProfile, 
    updateAgencyProfile, 
    currentUser, 
    updateAccountCredentials,
    storedSignatures,
    addStoredSignature,
    deleteStoredSignature,
    setDefaultSignature
  } = useAgency();
  const [profile, setProfile] = useState<AgencyProfile>(agencyProfile);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // Sync signature store & primary signer when agencyProfile changes
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      signatureStore: agencyProfile.signatureStore,
      primarySigner: agencyProfile.primarySigner
    }));
  }, [agencyProfile.signatureStore, agencyProfile.primarySigner]);

  // Account Security & Credentials state
  const [accountEmail, setAccountEmail] = useState(currentUser?.email || '');
  const [accountUsername, setAccountUsername] = useState(currentUser?.username || '');
  const [newAccountPassword, setNewAccountPassword] = useState('');
  const [confirmAccountPassword, setConfirmAccountPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [credMessage, setCredMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMessage(null);

    if (newAccountPassword && newAccountPassword.length < 6) {
      setCredMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newAccountPassword && newAccountPassword !== confirmAccountPassword) {
      setCredMessage({ type: 'error', text: 'Passwords do not match. Please re-enter.' });
      return;
    }

    setIsUpdatingCreds(true);
    const res = await updateAccountCredentials({
      email: accountEmail.trim(),
      username: accountUsername.trim() || undefined,
      password: newAccountPassword ? newAccountPassword.trim() : undefined
    });
    setIsUpdatingCreds(false);

    if (res.success) {
      setCredMessage({ 
        type: 'success', 
        text: 'Credentials updated successfully! Your updated email/password are now active for future logins.' 
      });
      setNewAccountPassword('');
      setConfirmAccountPassword('');
      setTimeout(() => setCredMessage(null), 5000);
    } else {
      setCredMessage({ type: 'error', text: res.error || 'Failed to update credentials.' });
    }
  };

  const updateField = <K extends keyof AgencyProfile>(key: K, value: AgencyProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const updateBankField = (field: keyof AgencyProfile['bankDetails'], value: string) => {
    setProfile((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      }
    }));
  };

  // Signature Store state & handlers
  const [isAddingSignature, setIsAddingSignature] = useState(false);
  const [sigPreset, setSigPreset] = useState<'subhadip' | 'shayan' | 'custom'>('subhadip');
  const [newSigName, setNewSigName] = useState('Subhadip Jana');
  const [newSigTitle, setNewSigTitle] = useState('Senior Managing Partner');
  const [newSigEmail, setNewSigEmail] = useState('subhadipjana866@gmail.com');
  const [newSigIsDefault, setNewSigIsDefault] = useState(false);
  const [newSigMode, setNewSigMode] = useState<'upload' | 'draw'>('upload');
  const [newSigImage, setNewSigImage] = useState<string>('');

  const handleSelectPreset = (preset: 'subhadip' | 'shayan' | 'custom') => {
    setSigPreset(preset);
    if (preset === 'subhadip') {
      setNewSigName('Subhadip Jana');
      setNewSigTitle('Senior Managing Partner');
      setNewSigEmail('subhadipjana866@gmail.com');
    } else if (preset === 'shayan') {
      setNewSigName('Shayan Das');
      setNewSigTitle('Senior Managing Partner');
      setNewSigEmail('shayandas267@gmail.com');
    } else {
      setNewSigName('');
      setNewSigTitle('Senior Managing Partner');
      setNewSigEmail('');
    }
  };

  const newSigFileInputRef = useRef<HTMLInputElement>(null);
  const newCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingNew, setIsDrawingNew] = useState(false);

  const handleNewSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setNewSigImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startDrawingNew = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = newCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    setIsDrawingNew(true);
  };

  const drawNew = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingNew) return;
    const canvas = newCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawingNew = () => {
    if (isDrawingNew && newCanvasRef.current) {
      setIsDrawingNew(false);
      const dataUrl = newCanvasRef.current.toDataURL('image/png');
      setNewSigImage(dataUrl);
    }
  };

  const clearNewCanvas = () => {
    const canvas = newCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setNewSigImage('');
  };

  const handleSaveNewSignature = () => {
    if (!newSigName.trim()) {
      alert('Please enter signatory full name.');
      return;
    }
    if (!newSigImage) {
      alert('Please upload or draw a signature photo.');
      return;
    }

    addStoredSignature({
      name: newSigName.trim(),
      title: newSigTitle.trim() || 'Senior Managing Partner',
      email: newSigEmail.trim(),
      partnerId: sigPreset === 'subhadip' ? 'usr-subhadip' : sigPreset === 'shayan' ? 'usr-shayan' : undefined,
      signatureImage: newSigImage,
      signatureText: newSigName.trim(),
      isDefault: newSigIsDefault
    });

    setIsAddingSignature(false);
    setNewSigImage('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAgencyProfile(profile);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const primarySigId = storedSignatures.find(s => s.isDefault)?.id || storedSignatures[0]?.id;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
        <div>
          <h2 className="font-serif text-2xl text-ink-950 font-normal">
            Agency Profile & Global Defaults
          </h2>
          <p className="text-xs text-ink-500 font-light mt-0.5">
            These default coordinates and branding are automatically embedded into newly generated documents
          </p>
        </div>
        <button
          type="button"
          onClick={() => setProfile(defaultAgencyProfile)}
          className="inline-flex items-center gap-1.5 text-xs text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-3 py-1.5 rounded-lg transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Agency Sample
        </button>
      </div>

      {/* Account Security & Credentials Management Card */}
      <div className="bg-white border border-parchment-200 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-clay-600" />
        
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-parchment-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-clay-100 text-clay-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-950 font-serif">
                My Account Security & Login Credentials
              </h3>
              <p className="text-[11px] text-ink-500">
                Update your login email address, username, and authentication password
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-clay-50 text-clay-800 border border-clay-200 px-2 py-0.5 rounded font-bold">
              {currentUser?.role || 'Member'}
            </span>
            <span className="text-[10px] bg-parchment-100 text-ink-600 px-2 py-0.5 rounded font-mono font-semibold">
              Lvl {currentUser?.roleLevel || 100}
            </span>
          </div>
        </div>

        {credMessage && (
          <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2.5 ${
            credMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {credMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{credMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">
                Account Email Address
              </label>
              <input
                type="email"
                required
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                placeholder="e.g. subhadipjana866@gmail.com"
                className="w-full text-xs p-2.5 border border-parchment-300 rounded-lg focus:border-clay-600 focus:outline-none bg-parchment-50/40"
              />
              <p className="text-[10px] text-ink-400 mt-1">
                Used for account sign-in and formal communications
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">
                Username / Handle
              </label>
              <input
                type="text"
                value={accountUsername}
                onChange={(e) => setAccountUsername(e.target.value)}
                placeholder="e.g. subhadip866"
                className="w-full text-xs p-2.5 border border-parchment-300 rounded-lg focus:border-clay-600 focus:outline-none bg-parchment-50/40 font-mono"
              />
              <p className="text-[10px] text-ink-400 mt-1">
                Alternative identifier for rapid login
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-parchment-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-ink-700">
                  New Password (leave blank to keep current)
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-ink-500 hover:text-ink-900 flex items-center gap-1"
                >
                  {showPassword ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Show</>}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newAccountPassword}
                onChange={(e) => setNewAccountPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full text-xs p-2.5 border border-parchment-300 rounded-lg focus:border-clay-600 focus:outline-none bg-parchment-50/40"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmAccountPassword}
                onChange={(e) => setConfirmAccountPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full text-xs p-2.5 border border-parchment-300 rounded-lg focus:border-clay-600 focus:outline-none bg-parchment-50/40"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-ink-400">
              Authenticated Session: <strong className="text-ink-700">{currentUser?.name}</strong> ({currentUser?.email})
            </div>
            <button
              type="submit"
              disabled={isUpdatingCreds}
              className="bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isUpdatingCreds ? 'Updating...' : 'Save & Update Credentials'}</span>
            </button>
          </div>
        </form>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Branding Card */}
        <div className="bg-white border border-parchment-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-parchment-100 text-xs font-semibold uppercase tracking-wider text-ink-700">
            <Building className="w-4 h-4 text-clay-600" />
            <span>Brand Identity & Business Coordinates</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Agency Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                placeholder="e.g. Apex Digital & Labs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Tagline / Mission</label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                placeholder="e.g. High-Impact Software Engineering"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Public Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                placeholder="hello@agency.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Website URL</label>
              <input
                type="text"
                value={profile.website}
                onChange={(e) => updateField('website', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                placeholder="https://agency.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Street Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                placeholder="100 Pine Street, Suite 500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">City, State, ZIP</label>
              <input
                type="text"
                value={profile.cityStateZip}
                onChange={(e) => updateField('cityStateZip', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                placeholder="San Francisco, CA 94111"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Country</label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => updateField('country', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                placeholder="United States"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Tax / VAT ID (EIN / GST)</label>
              <input
                type="text"
                value={profile.taxId}
                onChange={(e) => updateField('taxId', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded font-mono"
                placeholder="US-EIN-94-XXXXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Default Currency Code</label>
              <select
                value={profile.defaultCurrency}
                onChange={(e) => {
                  const code = e.target.value;
                  const symbolMap: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'CA$', AUD: 'A$' };
                  setProfile((prev) => ({
                    ...prev,
                    defaultCurrency: code,
                    currencySymbol: symbolMap[code] || '$'
                  }));
                }}
                className="w-full text-xs p-2 border border-parchment-300 rounded bg-white"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="CAD">CAD (CA$)</option>
                <option value="AUD">AUD (A$)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={profile.currencySymbol}
                onChange={(e) => updateField('currencySymbol', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded text-center font-mono"
              />
            </div>
          </div>
        </div>

        {/* Banking & Remittance Coordinates */}
        <div className="bg-white border border-parchment-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-parchment-100 text-xs font-semibold uppercase tracking-wider text-ink-700">
            <CreditCard className="w-4 h-4 text-forest-700" />
            <span>Bank Remittance & Wire Instructions</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={profile.bankDetails.bankName}
                onChange={(e) => updateBankField('bankName', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded"
                placeholder="e.g. JPMorgan Chase"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Beneficiary Account Name</label>
              <input
                type="text"
                value={profile.bankDetails.accountHolder}
                onChange={(e) => updateBankField('accountHolder', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded"
                placeholder="e.g. Apex Digital LLC"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Account Number</label>
              <input
                type="text"
                value={profile.bankDetails.accountNumber}
                onChange={(e) => updateBankField('accountNumber', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded font-mono"
                placeholder="**** 4892"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Routing Number / SWIFT</label>
              <input
                type="text"
                value={profile.bankDetails.routingOrSwift}
                onChange={(e) => updateBankField('routingOrSwift', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded font-mono"
                placeholder="CHASUS33"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">IBAN (International)</label>
              <input
                type="text"
                value={profile.bankDetails.iban || ''}
                onChange={(e) => updateBankField('iban', e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded font-mono"
                placeholder="US89..."
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Default Remittance Note / Instructions</label>
            <textarea
              rows={2}
              value={profile.bankDetails.notes || ''}
              onChange={(e) => updateBankField('notes', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="Wire transfer or ACH preferred. Include invoice number in memo."
            />
          </div>
        </div>

        {/* Agency Signature Store & Authorization Library */}
        <div className="bg-white border border-parchment-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-parchment-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-clay-50 text-clay-700 flex items-center justify-center">
                <FileSignature className="w-4 h-4 text-clay-700" />
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-800">
                  Agency Signature Store & Authorization Library
                </h3>
                <p className="text-[11px] text-ink-500 font-light">
                  Official signatures for Senior Managing Partners (Subhadip Jana & Shayan Das)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAddingSignature(!isAddingSignature);
                if (!isAddingSignature) {
                  handleSelectPreset('subhadip');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-clay-50 hover:bg-clay-100 text-clay-800 border border-clay-200 rounded-lg transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingSignature ? 'Cancel' : 'Add Signature to Store'}</span>
            </button>
          </div>

          <p className="text-xs text-ink-500 leading-relaxed">
            Store and manage official signatures for both Senior Managing Partners (<strong className="text-ink-800">Subhadip Jana</strong> & <strong className="text-ink-800">Shayan Das</strong>). Whenever generating contracts, quotations, proposals, rate cards, or NDAs, you can choose between single-partner sign-off or dual-partner execution requiring both signatures.
          </p>

          {/* Add New Signature Panel (Collapsible) */}
          {isAddingSignature && (
            <div className="border border-clay-200 bg-amber-50/30 rounded-xl p-4 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink-900 flex items-center gap-1.5">
                  <PenTool className="w-3.5 h-3.5 text-clay-600" />
                  Register New Authorized Signature
                </span>
                <span className="text-[10px] text-ink-400 font-mono">Store Creator</span>
              </div>

              {/* Preset Quick-Selector */}
              <div>
                <label className="block text-[11px] font-medium text-ink-600 mb-1.5">Quick Signatory Preset:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('subhadip')}
                    className={`p-2 rounded-lg border text-left text-xs transition ${
                      sigPreset === 'subhadip' 
                        ? 'border-clay-600 bg-white shadow-xs font-medium text-ink-900' 
                        : 'border-parchment-200 bg-white/60 text-ink-600 hover:bg-white'
                    }`}
                  >
                    <div className="font-semibold text-xs">Subhadip Jana</div>
                    <div className="text-[10px] text-ink-400">Senior Managing Partner</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('shayan')}
                    className={`p-2 rounded-lg border text-left text-xs transition ${
                      sigPreset === 'shayan' 
                        ? 'border-clay-600 bg-white shadow-xs font-medium text-ink-900' 
                        : 'border-parchment-200 bg-white/60 text-ink-600 hover:bg-white'
                    }`}
                  >
                    <div className="font-semibold text-xs">Shayan Das</div>
                    <div className="text-[10px] text-ink-400">Senior Managing Partner</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectPreset('custom')}
                    className={`p-2 rounded-lg border text-left text-xs transition ${
                      sigPreset === 'custom' 
                        ? 'border-clay-600 bg-white shadow-xs font-medium text-ink-900' 
                        : 'border-parchment-200 bg-white/60 text-ink-600 hover:bg-white'
                    }`}
                  >
                    <div className="font-semibold text-xs">Custom Signatory</div>
                    <div className="text-[10px] text-ink-400">Stamp / Authorized Signer</div>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Signatory Full Name</label>
                  <input
                    type="text"
                    value={newSigName}
                    onChange={(e) => setNewSigName(e.target.value)}
                    className="w-full text-xs p-2 border border-parchment-300 rounded bg-white focus:border-clay-600 focus:outline-none"
                    placeholder="e.g. Subhadip Jana"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Official Designation / Title</label>
                  <input
                    type="text"
                    value={newSigTitle}
                    onChange={(e) => setNewSigTitle(e.target.value)}
                    className="w-full text-xs p-2 border border-parchment-300 rounded bg-white focus:border-clay-600 focus:outline-none"
                    placeholder="Senior Managing Partner"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    value={newSigEmail}
                    onChange={(e) => setNewSigEmail(e.target.value)}
                    className="w-full text-xs p-2 border border-parchment-300 rounded bg-white focus:border-clay-600 focus:outline-none"
                    placeholder="partner@agency.com"
                  />
                </div>
              </div>

              {/* Input Method Toggle: Upload vs Draw */}
              <div className="border border-parchment-200 rounded-xl p-3 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-800">Signature Capture</span>
                  <div className="flex items-center gap-1 bg-parchment-100 p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setNewSigMode('upload')}
                      className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                        newSigMode === 'upload' ? 'bg-white text-clay-700 shadow-xs' : 'text-ink-600'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewSigMode('draw')}
                      className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${
                        newSigMode === 'draw' ? 'bg-white text-clay-700 shadow-xs' : 'text-ink-600'
                      }`}
                    >
                      <PenTool className="w-3 h-3" />
                      <span>Draw on Pad</span>
                    </button>
                  </div>
                </div>

                {newSigMode === 'upload' ? (
                  <div>
                    <input
                      type="file"
                      ref={newSigFileInputRef}
                      onChange={handleNewSigUpload}
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                      className="hidden"
                    />
                    <div
                      onClick={() => newSigFileInputRef.current?.click()}
                      className="border-2 border-dashed border-parchment-300 hover:border-clay-400 rounded-xl p-5 text-center cursor-pointer transition bg-parchment-50/50 hover:bg-white"
                    >
                      <ImageIcon className="w-7 h-7 text-clay-600 mx-auto mb-1.5" />
                      <div className="text-xs font-semibold text-ink-900">Click to upload signature photo/scan</div>
                      <div className="text-[11px] text-ink-400 mt-0.5">Supports PNG, SVG, JPG, WebP with transparent or white background</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border border-parchment-300 rounded-xl bg-white overflow-hidden shadow-inner">
                      <canvas
                        ref={newCanvasRef}
                        width={500}
                        height={120}
                        onMouseDown={startDrawingNew}
                        onMouseMove={drawNew}
                        onMouseUp={stopDrawingNew}
                        onMouseLeave={stopDrawingNew}
                        onTouchStart={startDrawingNew}
                        onTouchMove={drawNew}
                        onTouchEnd={stopDrawingNew}
                        className="w-full h-28 cursor-crosshair touch-none bg-white"
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-ink-400">
                      <span>Sign smoothly using mouse, trackpad, or stylus</span>
                      <button
                        type="button"
                        onClick={clearNewCanvas}
                        className="text-xs text-ink-600 hover:text-ink-900 flex items-center gap-1 font-medium px-2 py-0.5 rounded border border-parchment-200 hover:bg-parchment-100"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear Pad</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Signature Preview if captured */}
                {newSigImage && (
                  <div className="pt-2 border-t border-parchment-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-1 border border-parchment-200 rounded bg-parchment-50/50">
                        <img src={newSigImage} alt="Preview" className="h-10 max-w-[200px] object-contain" />
                      </div>
                      <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Signature Captured Successfully
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewSigImage('')}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Set as Default Checkbox & Action Button */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSigIsDefault}
                    onChange={(e) => setNewSigIsDefault(e.target.checked)}
                    className="rounded text-clay-600 focus:ring-clay-500"
                  />
                  <span className="text-xs text-ink-700 font-medium">Set as Primary Default Signer</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingSignature(false)}
                    className="px-3 py-1.5 text-xs text-ink-600 hover:text-ink-900 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewSignature}
                    className="px-4 py-1.5 text-xs bg-clay-600 hover:bg-clay-700 text-white rounded-lg font-medium shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Signature to Store</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stored Signatures Gallery */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-ink-800">
              <span>Saved Official Signatures ({storedSignatures.length})</span>
              <span className="text-[10px] text-ink-400 font-normal">Available across all contract creators</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storedSignatures.map((sig) => {
                const isPrimary = sig.id === primarySigId;
                return (
                    <div
                      key={sig.id}
                      className={`border rounded-xl p-4 bg-white shadow-2xs transition flex flex-col justify-between ${
                        isPrimary ? 'border-clay-400 ring-1 ring-clay-200' : 'border-parchment-200 hover:border-parchment-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <div className="font-semibold text-xs text-ink-900 flex items-center gap-1.5">
                              <span>{sig.name}</span>
                              {isPrimary && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-clay-50 text-clay-700 border border-clay-200 font-medium">
                                  <Star className="w-2.5 h-2.5 fill-clay-600 text-clay-600" />
                                  Primary
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-ink-500">{sig.title}</div>
                            {sig.email && <div className="text-[10px] text-ink-400 font-mono mt-0.5">{sig.email}</div>}
                          </div>
                          {storedSignatures.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const promptMsg = isPrimary
                                  ? `Delete primary signature for ${sig.name}? Another signature in the store will automatically become primary.`
                                  : `Remove signature for ${sig.name} from store?`;
                                if (confirm(promptMsg)) {
                                  deleteStoredSignature(sig.id);
                                }
                              }}
                              className="p-1 text-ink-400 hover:text-rose-600 rounded transition"
                              title={isPrimary ? "Delete Primary Signature" : "Delete Signature"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                      {/* Signature Box */}
                      <div className="h-16 border border-parchment-200 rounded-lg p-2 bg-parchment-50/50 flex items-center justify-center my-2">
                        {sig.signatureImage ? (
                          <img
                            src={sig.signatureImage}
                            alt={`${sig.name} signature`}
                            className="max-h-12 max-w-full object-contain"
                          />
                        ) : (
                          <span className="font-serif italic text-sm text-ink-600">{sig.name}</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-parchment-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-ink-400">
                        {sig.partnerId === 'usr-subhadip' 
                          ? 'Senior Managing Partner (Subhadip)'
                          : sig.partnerId === 'usr-shayan'
                          ? 'Senior Managing Partner (Shayan)'
                          : 'Authorized Signatory'}
                      </span>
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => setDefaultSignature(sig.id)}
                          className="text-[11px] text-clay-700 hover:text-clay-900 font-medium flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Make Primary</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedNotice && (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
              <Check className="w-4 h-4 text-emerald-600" />
              Settings updated and saved!
            </span>
          )}
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-5 py-2 rounded-lg transition shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

