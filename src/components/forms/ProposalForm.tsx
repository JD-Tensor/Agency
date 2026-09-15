import React from 'react';
import { ProposalData, ProposalMilestone } from '../../types/documents';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { sampleProposal } from '../../services/sampleData';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { translateDocumentPayload } from '../../services/currency';
import { SignaturePicker } from '../documents/SignaturePicker';

interface ProposalFormProps {
  data: ProposalData;
  onChange: (data: ProposalData) => void;
}

export const ProposalForm: React.FC<ProposalFormProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof ProposalData>(key: K, value: ProposalData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const handleMilestoneChange = (index: number, field: keyof ProposalMilestone, value: any) => {
    const list = [...(data.milestones || [])];
    list[index] = { ...list[index], [field]: value };
    updateField('milestones', list);
  };

  const addMilestone = () => {
    const newM: ProposalMilestone = {
      title: `Phase ${(data.milestones?.length || 0) + 1}: Sprint Deliverable`,
      duration: 'Weeks 1 – 2',
      deliverables: ['Key milestone deliverable item'],
      price: 5000
    };
    updateField('milestones', [...(data.milestones || []), newM]);
  };

  const removeMilestone = (index: number) => {
    const list = (data.milestones || []).filter((_, idx) => idx !== index);
    updateField('milestones', list);
  };

  const handleDeliverableChange = (mIndex: number, dIndex: number, text: string) => {
    const list = [...(data.milestones || [])];
    const delivs = [...list[mIndex].deliverables];
    delivs[dIndex] = text;
    list[mIndex].deliverables = delivs;
    updateField('milestones', list);
  };

  const addDeliverable = (mIndex: number) => {
    const list = [...(data.milestones || [])];
    list[mIndex].deliverables = [...list[mIndex].deliverables, ''];
    updateField('milestones', list);
  };

  const removeDeliverable = (mIndex: number, dIndex: number) => {
    const list = [...(data.milestones || [])];
    list[mIndex].deliverables = list[mIndex].deliverables.filter((_, idx) => idx !== dIndex);
    updateField('milestones', list);
  };

  const handleAdvantageChange = (index: number, value: string) => {
    const list = [...(data.agencyAdvantages || [])];
    list[index] = value;
    updateField('agencyAdvantages', list);
  };

  const addAdvantage = () => {
    updateField('agencyAdvantages', [...(data.agencyAdvantages || []), '']);
  };

  const removeAdvantage = (index: number) => {
    const list = (data.agencyAdvantages || []).filter((_, idx) => idx !== index);
    updateField('agencyAdvantages', list);
  };

  return (
    <div className="space-y-6 text-ink-900">
      <div className="flex items-center justify-between pb-3 border-b border-parchment-300">
        <div>
          <h3 className="font-serif text-lg text-ink-950 font-normal">Proposal & Scope of Work</h3>
          <p className="text-xs text-ink-500">Construct comprehensive scopes, milestones, pricing, and terms</p>
        </div>
        <button
          type="button"
          onClick={() => onChange({ ...sampleProposal, proposalNumber: data.proposalNumber || sampleProposal.proposalNumber })}
          className="inline-flex items-center gap-1.5 text-xs text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-2.5 py-1.5 rounded transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Data
        </button>
      </div>

      {/* Target Client & Identifiers */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Client & Proposal Info</h4>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-ink-700">Proposal ID</label>
              <span className="text-[10px] text-ink-400 font-mono">Autofilled</span>
            </div>
            <input
              type="text"
              value={data.proposalNumber}
              readOnly
              disabled
              className="w-full text-xs p-2 border border-parchment-300 rounded font-mono bg-parchment-100/80 text-ink-700 cursor-not-allowed select-all font-semibold"
              placeholder="PROP-2026-001"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={data.issueDate}
              onChange={(e) => updateField('issueDate', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Valid Until</label>
            <input
              type="date"
              value={data.validUntil}
              onChange={(e) => updateField('validUntil', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
            />
          </div>
        </div>

        <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-2.5 flex items-center justify-between">
          <span className="text-xs font-medium text-ink-700">Proposal Currency (USD / INR)</span>
          <CurrencyToggle
            value={data.currency || 'USD'}
            onChange={(newCurr) => {
              const translated = translateDocumentPayload({ type: 'proposal', data }, newCurr);
              onChange(translated.data as ProposalData);
            }}
            showRateNotice={true}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Client Company / Entity</label>
            <input
              type="text"
              value={data.clientCompany}
              onChange={(e) => updateField('clientCompany', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="e.g. AeroSync Technologies"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Primary Client Contact Name</label>
            <input
              type="text"
              value={data.clientName}
              onChange={(e) => updateField('clientName', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="e.g. Sophia Lin"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Client Email</label>
            <input
              type="email"
              value={data.clientEmail}
              onChange={(e) => updateField('clientEmail', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="sophia@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Client Address</label>
            <input
              type="text"
              value={data.clientAddress}
              onChange={(e) => updateField('clientAddress', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="500 Howard St, San Francisco, CA"
            />
          </div>
        </div>
      </div>

      {/* Project Narrative */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Project Narrative</h4>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Project Title</label>
          <input
            type="text"
            value={data.projectTitle}
            onChange={(e) => updateField('projectTitle', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="e.g. Enterprise Telemetry Portal & Design System Overhaul"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Executive Summary</label>
          <textarea
            rows={3}
            value={data.executiveSummary}
            onChange={(e) => updateField('executiveSummary', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="High-level overview of the strategic partnership..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Problem Statement</label>
            <textarea
              rows={2}
              value={data.problemStatement}
              onChange={(e) => updateField('problemStatement', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="The challenge the client faces..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Proposed Solution</label>
            <textarea
              rows={2}
              value={data.proposedSolution}
              onChange={(e) => updateField('proposedSolution', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="How our agency executes and resolves this..."
            />
          </div>
        </div>
      </div>

      {/* Phased Milestones */}
      <div className="border border-parchment-200 rounded p-3 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-xs font-semibold text-ink-800 uppercase tracking-wider">Phased Milestones & Deliverables</label>
            <p className="text-[11px] text-ink-500">Define the project phases, timeline durations, deliverables, and cost allocations</p>
          </div>
          <button
            type="button"
            onClick={addMilestone}
            className="text-xs text-clay-700 hover:text-clay-800 flex items-center gap-1 font-medium bg-clay-50 px-2 py-1 rounded border border-clay-200"
          >
            <Plus className="w-3.5 h-3.5" /> Add Phase
          </button>
        </div>

        <div className="space-y-4">
          {(data.milestones || []).map((m, mIdx) => (
            <div key={mIdx} className="border border-parchment-200 rounded p-3 bg-parchment-50/40">
              <div className="flex items-center justify-between gap-3 mb-2">
                <input
                  type="text"
                  value={m.title}
                  onChange={(e) => handleMilestoneChange(mIdx, 'title', e.target.value)}
                  className="font-medium text-xs p-1.5 border border-parchment-300 rounded bg-white flex-1"
                  placeholder="Phase Title (e.g. Phase 1: UX Audit)"
                />
                <input
                  type="text"
                  value={m.duration}
                  onChange={(e) => handleMilestoneChange(mIdx, 'duration', e.target.value)}
                  className="text-xs p-1.5 border border-parchment-300 rounded bg-white w-28 text-center"
                  placeholder="e.g. Weeks 1 – 2"
                />
                <input
                  type="number"
                  value={m.price || 0}
                  onChange={(e) => handleMilestoneChange(mIdx, 'price', parseFloat(e.target.value) || 0)}
                  className="text-xs p-1.5 border border-parchment-300 rounded bg-white w-28 font-mono text-right"
                  placeholder="Cost ($)"
                />
                <button
                  type="button"
                  onClick={() => removeMilestone(mIdx)}
                  className="text-ink-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Deliverables sub-list */}
              <div className="pl-2 space-y-1.5 border-l-2 border-clay-200">
                <div className="flex items-center justify-between text-[11px] text-ink-600 font-medium">
                  <span>Deliverables list</span>
                  <button
                    type="button"
                    onClick={() => addDeliverable(mIdx)}
                    className="text-clay-700 hover:text-clay-800 flex items-center gap-0.5 text-[10px]"
                  >
                    <Plus className="w-2.5 h-2.5" /> Add Deliverable
                  </button>
                </div>
                {m.deliverables.map((deliv, dIdx) => (
                  <div key={dIdx} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={deliv}
                      onChange={(e) => handleDeliverableChange(mIdx, dIdx, e.target.value)}
                      className="w-full text-xs p-1 border border-parchment-300 rounded bg-white"
                      placeholder="e.g. Figma component library with dark/light modes"
                    />
                    <button
                      type="button"
                      onClick={() => removeDeliverable(mIdx, dIdx)}
                      className="text-ink-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment & Payment Schedule */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Fixed Total Investment ($)</label>
          <input
            type="number"
            value={data.fixedTotal ?? (data.milestones || []).reduce((sum, m) => sum + (m.price || 0), 0)}
            onChange={(e) => updateField('fixedTotal', parseFloat(e.target.value) || 0)}
            className="w-full text-xs p-2 border border-parchment-300 rounded font-mono text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Payment Schedule & Terms</label>
          <input
            type="text"
            value={data.paymentSchedule}
            onChange={(e) => updateField('paymentSchedule', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="e.g. 50% upfront deposit, 50% upon delivery"
          />
        </div>
      </div>

      {/* Agency Advantages */}
      <div className="border border-parchment-200 rounded p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Why Choose Us (Advantages)</label>
          <button
            type="button"
            onClick={addAdvantage}
            className="text-[11px] text-clay-700 hover:text-clay-800 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Add Advantage
          </button>
        </div>
        <div className="space-y-1.5">
          {(data.agencyAdvantages || []).map((adv, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                value={adv}
                onChange={(e) => handleAdvantageChange(idx, e.target.value)}
                className="w-full text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Key differentiator or guarantee..."
              />
              <button
                type="button"
                onClick={() => removeAdvantage(idx)}
                className="text-ink-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Terms & Conditions */}
      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1">Terms, IP Ownership & Rights</label>
        <textarea
          rows={3}
          value={data.termsAndConditions}
          onChange={(e) => updateField('termsAndConditions', e.target.value)}
          className="w-full text-xs p-2 border border-parchment-300 rounded"
          placeholder="Specify IP ownership transfer upon final payment, cancellation terms, etc."
        />
      </div>

      {/* Agency Authorized Signatures from Signature Store */}
      <SignaturePicker
        value={data.agencySigners}
        onChange={(selection) => updateField('agencySigners', selection)}
        title="Agency Proposal Authorization"
        description="Pick authorized partner signature(s) from your Signature Store. Supports Dual Signatures for both partners."
      />

      {/* Client Signer information */}
      <div className="border border-parchment-200 rounded-xl p-4 bg-white shadow-2xs space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-800">
          Client Signatory / Countersign Space
        </h4>
        <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Client Signatory Name</label>
          <input
            type="text"
            value={data.clientSignerName || ''}
            onChange={(e) => updateField('clientSignerName', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="Sophia Lin"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Client Signatory Title</label>
          <input
            type="text"
            value={data.clientSignerTitle || ''}
            onChange={(e) => updateField('clientSignerTitle', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="VP of Product"
          />
        </div>
      </div>
    </div>
    </div>
  );
};

