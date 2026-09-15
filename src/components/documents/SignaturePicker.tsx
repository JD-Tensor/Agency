import React, { useEffect } from 'react';
import { useAgency } from '../../context/AgencyContext';
import { DocumentSignatorySelection } from '../../types/documents';
import { FileSignature, Users, User, Check, ShieldCheck } from 'lucide-react';

interface SignaturePickerProps {
  value?: DocumentSignatorySelection;
  onChange: (selection: DocumentSignatorySelection) => void;
  title?: string;
  description?: string;
  allowDual?: boolean;
}

export const SignaturePicker: React.FC<SignaturePickerProps> = ({
  value,
  onChange,
  title = 'Agency Authorized Signatories',
  description = 'Select official partner signatures from the Signature Store to execute this document.',
  allowDual = true
}) => {
  const { storedSignatures, agencyProfile } = useAgency();

  // Find defaults
  const primarySig = storedSignatures.find(s => s.isDefault) || storedSignatures[0];
  const secondSig = storedSignatures.find(s => s.id !== primarySig?.id) || storedSignatures[1] || primarySig;

  // Initialize selection if not present
  useEffect(() => {
    if (!value || (!value.signer1Id && !value.signer1Name)) {
      onChange({
        mode: value?.mode || 'single',
        signer1Id: primarySig?.id,
        signer1Name: primarySig?.name || agencyProfile.primarySigner.name,
        signer1Title: primarySig?.title || agencyProfile.primarySigner.title,
        signer1Image: primarySig?.signatureImage || agencyProfile.primarySigner.signatureImage,
        signer2Id: secondSig?.id,
        signer2Name: secondSig?.name || 'Shayan Das',
        signer2Title: secondSig?.title || 'Senior Managing Partner',
        signer2Image: secondSig?.signatureImage
      });
    }
  }, []);

  const mode = value?.mode || 'single';

  const setMode = (newMode: 'single' | 'dual') => {
    onChange({
      ...value,
      mode: newMode,
      signer1Id: value?.signer1Id || primarySig?.id,
      signer1Name: value?.signer1Name || primarySig?.name,
      signer1Title: value?.signer1Title || primarySig?.title,
      signer1Image: value?.signer1Image || primarySig?.signatureImage,
      signer2Id: value?.signer2Id || secondSig?.id,
      signer2Name: value?.signer2Name || secondSig?.name,
      signer2Title: value?.signer2Title || secondSig?.title,
      signer2Image: value?.signer2Image || secondSig?.signatureImage
    });
  };

  const handleSelectSigner1 = (sigId: string) => {
    const selected = storedSignatures.find(s => s.id === sigId);
    if (!selected) return;
    onChange({
      ...value,
      mode,
      signer1Id: selected.id,
      signer1Name: selected.name,
      signer1Title: selected.title,
      signer1Image: selected.signatureImage
    });
  };

  const handleSelectSigner2 = (sigId: string) => {
    const selected = storedSignatures.find(s => s.id === sigId);
    if (!selected) return;
    onChange({
      ...value,
      mode,
      signer2Id: selected.id,
      signer2Name: selected.name,
      signer2Title: selected.title,
      signer2Image: selected.signatureImage
    });
  };

  const activeSigner1 = storedSignatures.find(s => s.id === value?.signer1Id) || primarySig;
  const activeSigner2 = storedSignatures.find(s => s.id === value?.signer2Id) || secondSig;

  return (
    <div className="border border-parchment-200 rounded-xl p-4 bg-white shadow-2xs space-y-4">
      {/* Header & Execution Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-parchment-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-clay-50 text-clay-700 flex items-center justify-center">
            <FileSignature className="w-4 h-4 text-clay-700" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-800 flex items-center gap-1.5">
              <span>{title}</span>
              <span className="text-[10px] text-clay-600 bg-clay-50 px-2 py-0.2 rounded font-normal normal-case border border-clay-200">
                Signature Store
              </span>
            </h4>
            <p className="text-[11px] text-ink-500 font-light">{description}</p>
          </div>
        </div>

        {/* Mode Toggle: Single vs Dual Execution */}
        {allowDual && (
          <div className="inline-flex p-0.5 bg-parchment-100 rounded-lg text-xs self-start sm:self-auto border border-parchment-200">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                mode === 'single' 
                  ? 'bg-white text-clay-800 shadow-2xs font-semibold' 
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <User className="w-3 h-3 text-clay-600" />
              <span>Single Signatory</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('dual')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition ${
                mode === 'dual' 
                  ? 'bg-white text-clay-800 shadow-2xs font-semibold' 
                  : 'text-ink-600 hover:text-ink-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-clay-600" />
              <span>Dual Signatures (Both Partners)</span>
            </button>
          </div>
        )}
      </div>

      {/* Signatory Selection Cards */}
      <div className={`grid gap-4 ${mode === 'dual' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Signatory 1 */}
        <div className="border border-parchment-200 rounded-lg p-3.5 bg-parchment-50/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-clay-600" />
              {mode === 'dual' ? 'Partner 1 (Senior Managing Partner)' : 'Authorized Signatory'}
            </span>
            <span className="text-[10px] text-ink-400 font-mono">Signatory 1</span>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-ink-600 mb-1">Choose from Signature Store:</label>
            <select
              value={activeSigner1?.id || ''}
              onChange={(e) => handleSelectSigner1(e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded bg-white font-medium text-ink-900 focus:border-clay-600 focus:outline-none"
            >
              {storedSignatures.map((sig) => (
                <option key={sig.id} value={sig.id}>
                  {sig.name} — {sig.title} {sig.isDefault ? '(Primary Default)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Active Stamp Preview */}
          <div className="bg-white border border-parchment-200 rounded p-2.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-ink-900">{activeSigner1?.name || value?.signer1Name}</div>
              <div className="text-[11px] text-ink-500">{activeSigner1?.title || value?.signer1Title}</div>
            </div>
            <div className="h-10 border border-parchment-200 rounded bg-parchment-50/60 px-2 py-0.5 flex items-center justify-center">
              {activeSigner1?.signatureImage || value?.signer1Image ? (
                <img
                  src={activeSigner1?.signatureImage || value?.signer1Image}
                  alt="Signature"
                  className="max-h-8 max-w-[120px] object-contain"
                />
              ) : (
                <span className="font-serif italic text-xs text-ink-600">{activeSigner1?.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Signatory 2 (Only in Dual Mode) */}
        {mode === 'dual' && (
          <div className="border border-parchment-200 rounded-lg p-3.5 bg-parchment-50/40 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-800 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-clay-600" />
                Partner 2 (Senior Managing Partner)
              </span>
              <span className="text-[10px] text-ink-400 font-mono">Signatory 2</span>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-600 mb-1">Choose from Signature Store:</label>
              <select
                value={activeSigner2?.id || ''}
                onChange={(e) => handleSelectSigner2(e.target.value)}
                className="w-full text-xs p-2 border border-parchment-300 rounded bg-white font-medium text-ink-900 focus:border-clay-600 focus:outline-none"
              >
                {storedSignatures.map((sig) => (
                  <option key={sig.id} value={sig.id}>
                    {sig.name} — {sig.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Stamp Preview */}
            <div className="bg-white border border-parchment-200 rounded p-2.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-ink-900">{activeSigner2?.name || value?.signer2Name}</div>
                <div className="text-[11px] text-ink-500">{activeSigner2?.title || value?.signer2Title}</div>
              </div>
              <div className="h-10 border border-parchment-200 rounded bg-parchment-50/60 px-2 py-0.5 flex items-center justify-center">
                {activeSigner2?.signatureImage || value?.signer2Image ? (
                  <img
                    src={activeSigner2?.signatureImage || value?.signer2Image}
                    alt="Signature"
                    className="max-h-8 max-w-[120px] object-contain"
                  />
                ) : (
                  <span className="font-serif italic text-xs text-ink-600">{activeSigner2?.name}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {mode === 'dual' ? (
        <div className="text-[11px] text-clay-800 bg-clay-50/70 border border-clay-200 rounded-lg p-2.5 flex items-center gap-2">
          <Check className="w-4 h-4 text-clay-600 shrink-0" />
          <span>
            <strong>Dual Executive Sign-off Enabled:</strong> Both {activeSigner1?.name} and {activeSigner2?.name} will be rendered in official partner authorization blocks on the document.
          </span>
        </div>
      ) : (
        <div className="text-[11px] text-ink-500 flex items-center gap-2">
          <span>Standard execution with authorized partner signature ({activeSigner1?.name}).</span>
        </div>
      )}
    </div>
  );
};

