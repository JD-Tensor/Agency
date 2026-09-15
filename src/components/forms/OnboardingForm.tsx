import React from 'react';
import { OnboardingData, OnboardingTeamMember, OnboardingChecklistItem } from '../../types/documents';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { sampleOnboarding } from '../../services/sampleData';

interface OnboardingFormProps {
  data: OnboardingData;
  onChange: (data: OnboardingData) => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({ data, onChange }) => {
  const updateField = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    onChange({ ...data, [key]: value });
  };

  const handleMemberChange = (index: number, field: keyof OnboardingTeamMember, value: string) => {
    const list = [...(data.teamMembers || [])];
    list[index] = { ...list[index], [field]: value };
    updateField('teamMembers', list);
  };

  const addMember = () => {
    const newMember: OnboardingTeamMember = {
      name: '',
      role: 'Consultant',
      email: '',
      slackHandle: ''
    };
    updateField('teamMembers', [...(data.teamMembers || []), newMember]);
  };

  const removeMember = (index: number) => {
    const list = (data.teamMembers || []).filter((_, idx) => idx !== index);
    updateField('teamMembers', list);
  };

  const handleChecklistChange = (index: number, field: keyof OnboardingChecklistItem, value: any) => {
    const list = [...(data.accessChecklist || [])];
    list[index] = { ...list[index], [field]: value };
    updateField('accessChecklist', list);
  };

  const addChecklistItem = () => {
    const newItem: OnboardingChecklistItem = {
      task: '',
      category: 'Credentials',
      provided: false,
      notes: ''
    };
    updateField('accessChecklist', [...(data.accessChecklist || []), newItem]);
  };

  const removeChecklistItem = (index: number) => {
    const list = (data.accessChecklist || []).filter((_, idx) => idx !== index);
    updateField('accessChecklist', list);
  };

  const handleMilestoneChange = (index: number, value: string) => {
    const list = [...(data.firstWeekMilestones || [])];
    list[index] = value;
    updateField('firstWeekMilestones', list);
  };

  const addMilestone = () => {
    updateField('firstWeekMilestones', [...(data.firstWeekMilestones || []), '']);
  };

  const removeMilestone = (index: number) => {
    const list = (data.firstWeekMilestones || []).filter((_, idx) => idx !== index);
    updateField('firstWeekMilestones', list);
  };

  return (
    <div className="space-y-6 text-ink-900">
      <div className="flex items-center justify-between pb-3 border-b border-parchment-300">
        <div>
          <h3 className="font-serif text-lg text-ink-950 font-normal">Client Onboarding Pack</h3>
          <p className="text-xs text-ink-500">Configure welcome letter, credentials checklist, and communication guidelines</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(sampleOnboarding)}
          className="inline-flex items-center gap-1.5 text-xs text-clay-700 hover:text-clay-800 bg-clay-50 hover:bg-clay-100 border border-clay-200 px-2.5 py-1.5 rounded transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Data
        </button>
      </div>

      {/* Client and Project Info */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-500">Partnership Details</h4>
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

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Project Name</label>
            <input
              type="text"
              value={data.projectTitle}
              onChange={(e) => updateField('projectTitle', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="e.g. Telemetry Portal Overhaul"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Kickoff / Start Date</label>
            <input
              type="date"
              value={data.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Target Completion Date</label>
            <input
              type="date"
              value={data.targetCompletionDate}
              onChange={(e) => updateField('targetCompletionDate', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Welcome message */}
      <div>
        <label className="block text-xs font-medium text-ink-700 mb-1">Welcome Message & Orientation</label>
        <textarea
          rows={3}
          value={data.welcomeMessage}
          onChange={(e) => updateField('welcomeMessage', e.target.value)}
          className="w-full text-xs p-2 border border-parchment-300 rounded"
          placeholder="Warm welcome message from your agency partners..."
        />
      </div>

      {/* Communication Protocol */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Primary Communication</label>
          <input
            type="text"
            value={data.primaryCommunicationChannel}
            onChange={(e) => updateField('primaryCommunicationChannel', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="e.g. Shared Slack & Weekly Syncs"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Meeting Cadence</label>
          <input
            type="text"
            value={data.meetingCadence}
            onChange={(e) => updateField('meetingCadence', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="e.g. Tuesdays 10am PST"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Working Hours & Response SLA</label>
          <input
            type="text"
            value={data.workingHours}
            onChange={(e) => updateField('workingHours', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
            placeholder="Mon-Fri 9am - 6pm PST"
          />
        </div>
      </div>

      {/* Team Roster */}
      <div className="border border-parchment-200 rounded p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Agency Assigned Team</label>
          <button
            type="button"
            onClick={addMember}
            className="text-[11px] text-clay-700 hover:text-clay-800 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Add Team Member
          </button>
        </div>
        <div className="space-y-2">
          {(data.teamMembers || []).map((m, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <input
                type="text"
                value={m.name}
                onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                className="col-span-3 text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Full Name"
              />
              <input
                type="text"
                value={m.role}
                onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                className="col-span-3 text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Role (e.g. Lead Designer)"
              />
              <input
                type="email"
                value={m.email}
                onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                className="col-span-3 text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="email@agency.com"
              />
              <input
                type="text"
                value={m.slackHandle || ''}
                onChange={(e) => handleMemberChange(idx, 'slackHandle', e.target.value)}
                className="col-span-2 text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="@slack"
              />
              <button
                type="button"
                onClick={() => removeMember(idx)}
                className="col-span-1 text-ink-400 hover:text-red-500 p-1 text-center"
              >
                <Trash2 className="w-3.5 h-3.5 mx-auto" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Access & Credentials Checklist */}
      <div className="border border-parchment-200 rounded p-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div>
            <label className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Access & Asset Checklist</label>
            <p className="text-[11px] text-ink-500">Items and system access needed from client</p>
          </div>
          <button
            type="button"
            onClick={addChecklistItem}
            className="text-[11px] text-clay-700 hover:text-clay-800 flex items-center gap-1 font-medium"
          >
            <Plus className="w-3 h-3" /> Add Item
          </button>
        </div>
        <div className="space-y-2">
          {(data.accessChecklist || []).map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <select
                value={item.category}
                onChange={(e) => handleChecklistChange(idx, 'category', e.target.value)}
                className="col-span-2 text-xs p-1.5 border border-parchment-300 rounded"
              >
                <option value="Credentials">Credentials</option>
                <option value="Assets">Assets</option>
                <option value="Information">Information</option>
                <option value="Meeting">Meeting</option>
              </select>
              <input
                type="text"
                value={item.task}
                onChange={(e) => handleChecklistChange(idx, 'task', e.target.value)}
                className="col-span-5 text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Item required (e.g. GitHub invite)"
              />
              <div className="col-span-2 flex items-center gap-1.5">
                <input
                  type="checkbox"
                  id={`chk-${idx}`}
                  checked={item.provided}
                  onChange={(e) => handleChecklistChange(idx, 'provided', e.target.checked)}
                  className="rounded border-parchment-300 text-clay-600 focus:ring-clay-600"
                />
                <label htmlFor={`chk-${idx}`} className="text-xs text-ink-700 select-none">
                  {item.provided ? 'Received' : 'Pending'}
                </label>
              </div>
              <input
                type="text"
                value={item.notes || ''}
                onChange={(e) => handleChecklistChange(idx, 'notes', e.target.value)}
                className="col-span-2 text-xs p-1.5 border border-parchment-300 rounded"
                placeholder="Optional notes"
              />
              <button
                type="button"
                onClick={() => removeChecklistItem(idx)}
                className="col-span-1 text-ink-400 hover:text-red-500 p-1 text-center"
              >
                <Trash2 className="w-3.5 h-3.5 mx-auto" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Review Process & First Week Milestones */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-ink-700 mb-1">Deliverable Review Process</label>
          <textarea
            rows={2}
            value={data.deliverableReviewProcess}
            onChange={(e) => updateField('deliverableReviewProcess', e.target.value)}
            className="w-full text-xs p-2 border border-parchment-300 rounded"
          />
          <div className="mt-2">
            <label className="block text-xs font-medium text-ink-700 mb-1">Project Management Tool</label>
            <input
              type="text"
              value={data.projectManagementTool}
              onChange={(e) => updateField('projectManagementTool', e.target.value)}
              className="w-full text-xs p-2 border border-parchment-300 rounded"
              placeholder="e.g. Linear & Notion"
            />
          </div>
        </div>

        <div className="border border-parchment-200 rounded p-3 bg-white">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-forest-700 uppercase tracking-wider">First Week Milestones (Sprint 0)</label>
            <button
              type="button"
              onClick={addMilestone}
              className="text-[11px] text-forest-700 hover:text-forest-800 flex items-center gap-1 font-medium"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="space-y-1.5">
            {(data.firstWeekMilestones || []).map((m, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={m}
                  onChange={(e) => handleMilestoneChange(idx, e.target.value)}
                  className="w-full text-xs p-1 border border-parchment-300 rounded"
                  placeholder="Kickoff milestone..."
                />
                <button
                  type="button"
                  onClick={() => removeMilestone(idx)}
                  className="text-ink-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

