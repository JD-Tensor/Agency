import React from 'react';
import { NdaData } from '../../types/documents';
import { Sparkles } from 'lucide-react';
import { sampleNda } from '../../services/sampleData';
import { SignaturePicker } from '../documents/SignaturePicker';

interface NdaFormProps {
  data: NdaData;
  onChange: (data: NdaData) => void;
}

export const NdaForm: React.FC<NdaFormProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof NdaData>(key: K, value: NdaData[K]) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="space-y-6 text-ink-900">
      <div className="flex items-center justify-between pb-3 border-b border-parchment-300">
        <div>
          <h3 className="font-serif text-lg text-ink-950 font-normal">Non-Disclosure Agreement (NDA)</h3>
          <p className="text-xs text-ink-500">Generate legally-binding mutual or unilateral confidentiality agreements</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(sampleNda)}
          className="inline-flex items-center gap-1.5 text-xs text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-2.5 py-1.5 rounded transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Data
        </button>
      </div>

      {/* Agreement Parameters */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Agreement Type</label>
          <select
            value={data.agreementType}
            onChange={(e) => updateField('agreementType', e.target.value as 'mutual' | 'one-way')}
            className="w-full text-xs p-2 border border-parchment-300 rounded bg-white"
          >
            <option value="mutual">Mutual Non-Disclosure (Two-Way)</option>
            <option value="one-way">Unilateral Non-Disclosure (One-Way)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Effective Date</label>
          <input
            type="date"
            value={data.agreementDate}
            onChange={(e) => updateField('agreementDate', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Confidentiality Duration (Years)</label>
          <input
            type="number"
            value={data.durationYears}
            onChange={(e) => updateField('durationYears', parseInt(e.target.value) || 2)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            min={1}
            max={10}
          />
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-4">
        {/* Disclosing Party / Party A */}
        <div className="border border-parchment-200 rounded p-3 bg-white space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-700">Party A (Client / Disclosing)</h4>
          <div>
            <label className="block text-[11px] font-medium text-ink-600 mb-0.5">Entity / Company Name</label>
            <input
              type="text"
              value={data.disclosingPartyName}
              onChange={(e) => updateField('disclosingPartyName', e.target.value)}
              className="w-full text-xs p-1.5 border border-parchment-300 rounded"
              placeholder="e.g. AeroSync Technologies Inc."
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-ink-600 mb-0.5">Official Address</label>
            <textarea
              rows={2}
              value={data.disclosingPartyAddress}
              onChange={(e) => updateField('disclosingPartyAddress', e.target.value)}
              className="w-full text-xs p-1.5 border border-parchment-300 rounded"
              placeholder="500 Howard St, Suite 400, San Francisco, CA"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-ink-600 mb-0.5">Authorized Representative (Name, Title)</label>
            <input
              type="text"
              value={data.disclosingPartyRepresentative}
              onChange={(e) => updateField('disclosingPartyRepresentative', e.target.value)}
              className="w-full text-xs p-1.5 border border-parchment-300 rounded"
              placeholder="e.g. Sophia Lin, VP of Product"
            />
          </div>
        </div>

        {/* Receiving Party / Party B */}
        <div className="border border-parchment-200 rounded p-3 bg-white space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-700">Party B (Agency / Receiving)</h4>
          <div>
            <label className="block text-[11px] font-medium text-ink-600 mb-0.5">Agency / Company Name</label>
            <input
              type="text"
              value={data.receivingPartyName}
              onChange={(e) => updateField('receivingPartyName', e.target.value)}
              className="w-full text-xs p-1.5 border border-parchment-300 rounded"
              placeholder="e.g. Aura Studio & Labs LLC"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-ink-600 mb-0.5">Official Address</label>
            <textarea
              rows={2}
              value={data.receivingPartyAddress}
              onChange={(e) => updateField('receivingPartyAddress', e.target.value)}
              className="w-full text-xs p-1.5 border border-parchment-300 rounded"
              placeholder="440 Montgomery St, Suite 900, San Francisco, CA"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-ink-600 mb-0.5">Authorized Representative (Name, Title)</label>
            <input
              type="text"
              value={data.receivingPartyRepresentative}
              onChange={(e) => updateField('receivingPartyRepresentative', e.target.value)}
              className="w-full text-xs p-1.5 border border-parchment-300 rounded"
              placeholder="e.g. Subhadip Jana, Senior Managing Partner"
            />
          </div>
        </div>
      </div>

      {/* Purpose & Scope */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Purpose of Disclosure</label>
          <textarea
            rows={2}
            value={data.purpose}
            onChange={(e) => updateField('purpose', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="Evaluating and performing technical consulting, UI/UX product design, and software engineering services..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Confidential Information Scope & Definition</label>
          <textarea
            rows={3}
            value={data.confidentialInfoScope}
            onChange={(e) => updateField('confidentialInfoScope', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="Detailed definition of trade secrets, intellectual property, financial figures, customer data, and code..."
          />
        </div>
      </div>

      {/* Jurisdiction & Clauses */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Governing State / Jurisdiction</label>
          <input
            type="text"
            value={data.governingLawState}
            onChange={(e) => updateField('governingLawState', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="e.g. California"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Governing Country</label>
          <input
            type="text"
            value={data.governingCountry}
            onChange={(e) => updateField('governingCountry', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="e.g. United States"
          />
        </div>
      </div>

      {/* Remedies Clause */}
      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1">Remedies & Injunctive Relief Language</label>
        <textarea
          rows={2}
          value={data.remediesClause}
          onChange={(e) => updateField('remediesClause', e.target.value)}
          className="w-full text-xs p-2 border border-parchment-300 rounded"
        />
      </div>

      {/* Agency Authorized Signatures from Signature Store */}
      <SignaturePicker
        value={data.agencySigners}
        onChange={(selection) => updateField('agencySigners', selection)}
        title="Agency NDA Authorization"
        description="Pick authorized partner signature(s) from your Signature Store to execute this NDA. Supports Dual Signatures for both partners."
      />
    </div>
  );
};

