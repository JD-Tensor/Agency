import React from 'react';
import { DiscoveryCallData } from '../../types/documents';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { sampleDiscoveryCall } from '../../services/sampleData';

interface DiscoveryFormProps {
  data: DiscoveryCallData;
  onChange: (data: DiscoveryCallData) => void;
}

export const DiscoveryForm: React.FC<DiscoveryFormProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof DiscoveryCallData>(key: K, value: DiscoveryCallData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const handleArrayChange = (field: 'primaryGoals' | 'painPoints' | 'desiredFeatures', index: number, value: string) => {
    const list = [...(data[field] || [])];
    list[index] = value;
    updateField(field, list);
  };

  const addArrayItem = (field: 'primaryGoals' | 'painPoints' | 'desiredFeatures') => {
    updateField(field, [...(data[field] || []), '']);
  };

  const removeArrayItem = (field: 'primaryGoals' | 'painPoints' | 'desiredFeatures', index: number) => {
    const list = (data[field] || []).filter((_, idx) => idx !== index);
    updateField(field, list);
  };

  const handleStepChange = (index: number, key: 'action' | 'owner' | 'dueDate', value: string) => {
    const list = [...(data.immediateNextSteps || [])];
    list[index] = { ...list[index], [key]: value };
    updateField('immediateNextSteps', list);
  };

  const addStep = () => {
    updateField('immediateNextSteps', [
      ...(data.immediateNextSteps || []),
      { action: '', owner: '', dueDate: '' }
    ]);
  };

  const removeStep = (index: number) => {
    const list = (data.immediateNextSteps || []).filter((_, idx) => idx !== index);
    updateField('immediateNextSteps', list);
  };

  return (
    <div className="space-y-6 text-ink-900">
      <div className="flex items-center justify-between pb-3 border-b border-parchment-300">
        <div>
          <h3 className="font-serif text-lg text-ink-950 font-normal">Discovery Call Details</h3>
          <p className="text-xs text-ink-500">Record prospect intake, goals, pain points, and next steps</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(sampleDiscoveryCall)}
          className="inline-flex items-center gap-1.5 text-xs text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-2.5 py-1.5 rounded transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Data
        </button>
      </div>

      {/* Client info */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Prospect & Call Info</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Client Contact Name</label>
            <input
              type="text"
              value={data.clientName}
              onChange={(e) => updateField('clientName', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
              placeholder="e.g. Sophia Lin"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Company / Organization</label>
            <input
              type="text"
              value={data.clientCompany}
              onChange={(e) => updateField('clientCompany', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
              placeholder="e.g. AeroSync Technologies"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Role / Title</label>
            <input
              type="text"
              value={data.clientRole}
              onChange={(e) => updateField('clientRole', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
              placeholder="e.g. VP of Product"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Email</label>
            <input
              type="email"
              value={data.clientEmail}
              onChange={(e) => updateField('clientEmail', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
              placeholder="sophia@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Call Date</label>
            <input
              type="date"
              value={data.callDate}
              onChange={(e) => updateField('callDate', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Attendees</label>
          <input
            type="text"
            value={data.attendees}
            onChange={(e) => updateField('attendees', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
            placeholder="e.g. Sophia Lin (VP Product), David Miller (CTO)"
          />
        </div>
      </div>

      {/* Project Overview */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Project Understanding</h4>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Project Working Title</label>
          <input
            type="text"
            value={data.projectTitle}
            onChange={(e) => updateField('projectTitle', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
            placeholder="e.g. Enterprise Fleet Monitoring Platform"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Business Overview & Context</label>
          <textarea
            rows={3}
            value={data.businessOverview}
            onChange={(e) => updateField('businessOverview', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
            placeholder="Explain the prospect's business model and why they are seeking your agency..."
          />
        </div>
      </div>

      {/* Goals & Pain Points Lists */}
      <div className="grid grid-cols-2 gap-4">
        {/* Goals */}
        <div className="border border-parchment-200 p-3 rounded bg-parchment-50/50">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-forest-700 uppercase tracking-wider">Primary Goals</label>
            <button
              type="button"
              onClick={() => addArrayItem('primaryGoals')}
              className="text-[11px] text-forest-700 hover:text-forest-800 flex items-center gap-1 font-medium"
            >
              <Plus className="w-3 h-3" /> Add Goal
            </button>
          </div>
          <div className="space-y-2">
            {(data.primaryGoals || []).map((goal, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => handleArrayChange('primaryGoals', idx, e.target.value)}
                  className="w-full text-xs p-1.5 border border-parchment-300 rounded bg-white"
                  placeholder="Target goal or KPI..."
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('primaryGoals', idx)}
                  className="text-ink-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pain points */}
        <div className="border border-parchment-200 p-3 rounded bg-parchment-50/50">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-clay-700 uppercase tracking-wider">Current Pain Points</label>
            <button
              type="button"
              onClick={() => addArrayItem('painPoints')}
              className="text-[11px] text-clay-700 hover:text-clay-800 flex items-center gap-1 font-medium"
            >
              <Plus className="w-3 h-3" /> Add Hurdle
            </button>
          </div>
          <div className="space-y-2">
            {(data.painPoints || []).map((point, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={point}
                  onChange={(e) => handleArrayChange('painPoints', idx, e.target.value)}
                  className="w-full text-xs p-1.5 border border-parchment-300 rounded bg-white"
                  placeholder="Existing friction or bottleneck..."
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('painPoints', idx)}
                  className="text-ink-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scope Features */}
      <div className="border border-parchment-200 p-3 rounded bg-white">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Desired Features & Scope Deliverables</label>
          <button
            type="button"
            onClick={() => addArrayItem('desiredFeatures')}
            className="text-[11px] text-clay-700 hover:text-clay-800 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Add Feature
          </button>
        </div>
        <div className="space-y-2">
          {(data.desiredFeatures || []).map((feat, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <input
                type="text"
                value={feat}
                onChange={(e) => handleArrayChange('desiredFeatures', idx, e.target.value)}
                className="w-full text-xs p-1.5 border border-parchment-300 rounded bg-white"
                placeholder="Specific feature or requirement..."
              />
              <button
                type="button"
                onClick={() => removeArrayItem('desiredFeatures', idx)}
                className="text-ink-400 hover:text-red-500 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Practical parameters */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Budget Range</label>
          <input
            type="text"
            value={data.budgetRange}
            onChange={(e) => updateField('budgetRange', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
            placeholder="e.g. $30,000 - $50,000"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Target Timeline</label>
          <input
            type="text"
            value={data.targetLaunchDate}
            onChange={(e) => updateField('targetLaunchDate', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
            placeholder="e.g. 8-10 weeks / Q4"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Tech Stack Preferences</label>
          <input
            type="text"
            value={data.techStackPreference}
            onChange={(e) => updateField('techStackPreference', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
            placeholder="React, Next.js, Node"
          />
        </div>
      </div>

      {/* Next Steps Table */}
      <div className="border border-parchment-200 p-3 rounded bg-white">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Action Items & Next Steps</label>
          <button
            type="button"
            onClick={addStep}
            className="text-[11px] text-clay-700 hover:text-clay-800 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Add Action
          </button>
        </div>
        <div className="space-y-2">
          {(data.immediateNextSteps || []).map((step, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={step.action}
                onChange={(e) => handleStepChange(idx, 'action', e.target.value)}
                className="col-span-6 text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Action to take..."
              />
              <input
                type="text"
                value={step.owner}
                onChange={(e) => handleStepChange(idx, 'owner', e.target.value)}
                className="col-span-3 text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Owner (e.g. Agency)"
              />
              <input
                type="text"
                value={step.dueDate}
                onChange={(e) => handleStepChange(idx, 'dueDate', e.target.value)}
                className="col-span-2 text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Due date"
              />
              <button
                type="button"
                onClick={() => removeStep(idx)}
                className="col-span-1 text-ink-400 hover:text-red-500 p-1 text-center"
              >
                <Trash2 className="w-3.5 h-3.5 mx-auto" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

