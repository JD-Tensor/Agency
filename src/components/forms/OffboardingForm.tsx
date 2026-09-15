import React from 'react';
import { OffboardingData, HandoverAsset } from '../../types/documents';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { sampleOffboarding } from '../../services/sampleData';
import { SignaturePicker } from '../documents/SignaturePicker';

interface OffboardingFormProps {
  data: OffboardingData;
  onChange: (data: OffboardingData) => void;
}

export const OffboardingForm: React.FC<OffboardingFormProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof OffboardingData>(key: K, value: OffboardingData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const handleDeliverableChange = (index: number, value: string) => {
    const list = [...(data.deliverablesDelivered || [])];
    list[index] = value;
    updateField('deliverablesDelivered', list);
  };

  const addDeliverable = () => {
    updateField('deliverablesDelivered', [...(data.deliverablesDelivered || []), '']);
  };

  const removeDeliverable = (index: number) => {
    const list = (data.deliverablesDelivered || []).filter((_, idx) => idx !== index);
    updateField('deliverablesDelivered', list);
  };

  const handleAssetChange = (index: number, field: keyof HandoverAsset, value: any) => {
    const list = [...(data.assetsAndCredentialsHandover || [])];
    list[index] = { ...list[index], [field]: value };
    updateField('assetsAndCredentialsHandover', list);
  };

  const addAsset = () => {
    const newAsset: HandoverAsset = {
      item: '',
      locationOrUrl: '',
      accessTransferred: true,
      notes: ''
    };
    updateField('assetsAndCredentialsHandover', [...(data.assetsAndCredentialsHandover || []), newAsset]);
  };

  const removeAsset = (index: number) => {
    const list = (data.assetsAndCredentialsHandover || []).filter((_, idx) => idx !== index);
    updateField('assetsAndCredentialsHandover', list);
  };

  const handleRecChange = (index: number, value: string) => {
    const list = [...(data.postLaunchRecommendations || [])];
    list[index] = value;
    updateField('postLaunchRecommendations', list);
  };

  const addRec = () => {
    updateField('postLaunchRecommendations', [...(data.postLaunchRecommendations || []), '']);
  };

  const removeRec = (index: number) => {
    const list = (data.postLaunchRecommendations || []).filter((_, idx) => idx !== index);
    updateField('postLaunchRecommendations', list);
  };

  return (
    <div className="space-y-6 text-ink-900">
      <div className="flex items-center justify-between pb-3 border-b border-parchment-300">
        <div>
          <h3 className="font-serif text-lg text-ink-950 font-normal">Project Offboarding & Handover</h3>
          <p className="text-xs text-ink-500">Document completed scope delivery, asset transfer, and formal client sign-off</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(sampleOffboarding)}
          className="inline-flex items-center gap-1.5 text-xs text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-2.5 py-1.5 rounded transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Data
        </button>
      </div>

      {/* Project & Client Card */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Project & Client Info</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Client Company</label>
            <input
              type="text"
              value={data.clientCompany}
              onChange={(e) => updateField('clientCompany', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="AeroSync Technologies"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Client Approver Name</label>
            <input
              type="text"
              value={data.clientName}
              onChange={(e) => updateField('clientName', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="Sophia Lin"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Project Working Title</label>
            <input
              type="text"
              value={data.projectTitle}
              onChange={(e) => updateField('projectTitle', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="Telemetry Portal Overhaul"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Project Completion Date</label>
            <input
              type="date"
              value={data.projectCompletedDate}
              onChange={(e) => updateField('projectCompletedDate', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1">Executive Handover Summary</label>
        <textarea
          rows={3}
          value={data.executiveSummary}
          onChange={(e) => updateField('executiveSummary', e.target.value)}
          className="w-full text-xs p-2 border border-parchment-300 rounded"
          placeholder="Brief summary verifying the conclusion of scheduled milestones..."
        />
      </div>

      {/* Deliverables Delivered */}
      <div className="border border-parchment-200 rounded p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Completed Deliverables Verified</label>
          <button
            type="button"
            onClick={addDeliverable}
            className="text-[11px] text-clay-700 hover:text-clay-800 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Add Deliverable
          </button>
        </div>
        <div className="space-y-1.5">
          {(data.deliverablesDelivered || []).map((deliv, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                value={deliv}
                onChange={(e) => handleDeliverableChange(idx, e.target.value)}
                className="w-full text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Specific deliverable (e.g. Production Next.js repository)..."
              />
              <button
                type="button"
                onClick={() => removeDeliverable(idx)}
                className="text-ink-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Assets & Credentials Handover */}
      <div className="border border-parchment-200 rounded p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Asset, Credential & Code Transference</label>
            <p className="text-[11px] text-ink-500">Record repos, design systems, hosting accounts, and domain access passed to client</p>
          </div>
          <button
            type="button"
            onClick={addAsset}
            className="text-[11px] text-clay-700 hover:text-clay-800 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Add Asset
          </button>
        </div>
        <div className="space-y-2">
          {(data.assetsAndCredentialsHandover || []).map((asset, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={asset.item}
                onChange={(e) => handleAssetChange(idx, 'item', e.target.value)}
                className="col-span-3 text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Asset (e.g. GitHub Repo)"
              />
              <input
                type="text"
                value={asset.locationOrUrl}
                onChange={(e) => handleAssetChange(idx, 'locationOrUrl', e.target.value)}
                className="col-span-4 text-xs p-1.5 border border-parchment-300 rounded font-mono text-[11px]"
                placeholder="URL or repository link"
              />
              <div className="col-span-2 flex items-center gap-1">
                <input
                  type="checkbox"
                  id={`asset-chk-${idx}`}
                  checked={asset.accessTransferred}
                  onChange={(e) => handleAssetChange(idx, 'accessTransferred', e.target.checked)}
                  className="rounded border-parchment-300 text-clay-600 focus:ring-clay-600"
                />
                <label htmlFor={`asset-chk-${idx}`} className="text-xs text-ink-700 select-none">
                  Transferred
                </label>
              </div>
              <input
                type="text"
                value={asset.notes || ''}
                onChange={(e) => handleAssetChange(idx, 'notes', e.target.value)}
                className="col-span-2 text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Notes"
              />
              <button
                type="button"
                onClick={() => removeAsset(idx)}
                className="col-span-1 text-ink-400 hover:text-red-500 p-1 text-center"
              >
                <Trash2 className="w-3.5 h-3.5 mx-auto" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Warranty and Maintenance */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Warranty & Support Period</label>
          <textarea
            rows={2}
            value={data.warrantyAndSupportPeriod}
            onChange={(e) => updateField('warrantyAndSupportPeriod', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="e.g. 30-day post-launch bug warranty..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Hosting & Maintenance Guidance</label>
          <textarea
            rows={2}
            value={data.hostingAndMaintenanceNotes}
            onChange={(e) => updateField('hostingAndMaintenanceNotes', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="Hosting tier, DNS providers, recurring update recommendations..."
          />
        </div>
      </div>

      {/* Post Launch Recommendations */}
      <div className="border border-parchment-200 rounded p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-clay-700 uppercase tracking-wider">Post-Launch Growth Recommendations</label>
          <button
            type="button"
            onClick={addRec}
            className="text-[11px] text-clay-700 hover:text-clay-800 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Add Recommendation
          </button>
        </div>
        <div className="space-y-1.5">
          {(data.postLaunchRecommendations || []).map((rec, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                value={rec}
                onChange={(e) => handleRecChange(idx, e.target.value)}
                className="w-full text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Strategic recommendation (e.g. schedule user interviews in 30 days)..."
              />
              <button
                type="button"
                onClick={() => removeRec(idx)}
                className="text-ink-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Formal Signoff Statement */}
      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1">Formal Acceptance Statement</label>
        <textarea
          rows={2}
          value={data.formalSignoffStatement}
          onChange={(e) => updateField('formalSignoffStatement', e.target.value)}
          className="w-full text-xs p-2 border border-parchment-300 rounded"
        />
      </div>

      {/* Agency Authorized Signatures from Signature Store */}
      <SignaturePicker
        value={data.agencySigners}
        onChange={(selection) => updateField('agencySigners', selection)}
        title="Agency Delivery & Release Authorization"
        description="Pick authorized partner signature(s) from your Signature Store to execute formal delivery and asset handover."
      />
    </div>
  );
};

