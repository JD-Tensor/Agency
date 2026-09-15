import React from 'react';
import { OnboardingData } from '../../types/documents';
import { AgencyProfile } from '../../types/agency';
import { DocumentHeader, DocumentFooter } from './DocumentHeader';

interface OnboardingTemplateProps {
  data: OnboardingData;
  agency: AgencyProfile;
  docNumber?: string;
}

export const OnboardingTemplate: React.FC<OnboardingTemplateProps> = ({
  data,
  agency,
  docNumber = 'ONB-2026-001'
}) => {
  return (
    <div className="a4-sheet p-10 font-sans text-ink-900 bg-white">
      <DocumentHeader 
        agency={agency}
        docTitle="Client Onboarding & Project Playbook"
        docNumber={docNumber}
        docDate={data.startDate || new Date().toISOString().split('T')[0]}
        docTypeBadge="Client Onboarding"
      />

      {/* Project & Client Card */}
      <div className="grid grid-cols-2 gap-4 bg-parchment-50 border border-parchment-200 rounded-lg p-4 mb-6 text-xs">
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1">
            Client Partnership
          </div>
          <div className="font-semibold text-ink-950 text-sm">{data.clientCompany || data.clientName}</div>
          <div className="text-ink-700">Primary Contact: {data.clientName}</div>
          <div className="text-ink-500">{data.clientEmail}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1">
            Engagement Timeline
          </div>
          <div className="text-ink-800">
            <span className="font-medium text-ink-600">Start Date:</span> {data.startDate}
          </div>
          <div className="text-ink-800 mt-0.5">
            <span className="font-medium text-ink-600">Target Launch:</span> {data.targetCompletionDate}
          </div>
          <div className="text-ink-700 font-medium mt-1">Project: {data.projectTitle}</div>
        </div>
      </div>

      {/* Welcome Message */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-clay-600"></span>
          Welcome from the Team
        </h2>
        <div className="text-xs text-ink-800 leading-relaxed bg-white p-3 rounded border border-parchment-200">
          {data.welcomeMessage}
        </div>
      </div>

      {/* Communication & SLA Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6 bg-parchment-50 p-3 rounded border border-parchment-200 text-xs">
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500">Communication Channels</div>
          <div className="text-ink-800 mt-1 font-medium">{data.primaryCommunicationChannel}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500">Meeting Cadence</div>
          <div className="text-ink-800 mt-1">{data.meetingCadence}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500">Working Hours & SLA</div>
          <div className="text-ink-800 mt-1">{data.workingHours}</div>
        </div>
      </div>

      {/* Team Roster */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-2">
          Your Dedicated Agency Team
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {data.teamMembers && data.teamMembers.length > 0 ? (
            data.teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white border border-parchment-200 p-2.5 rounded text-xs">
                <div className="font-semibold text-ink-900">{member.name}</div>
                <div className="text-clay-700 text-[11px] font-medium">{member.role}</div>
                <div className="text-ink-500 text-[10px] mt-1">{member.email}</div>
                {member.slackHandle && (
                  <div className="text-forest-700 text-[10px] font-mono mt-0.5">{member.slackHandle}</div>
                )}
              </div>
            ))
          ) : (
            <div className="text-xs text-ink-400 italic col-span-3">No team members specified.</div>
          )}
        </div>
      </div>

      {/* Access & Credentials Checklist Table */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-2">
          Required Assets & Credentials Checklist
        </h2>
        <table className="w-full text-xs border border-parchment-200 rounded overflow-hidden">
          <thead className="bg-parchment-100 text-ink-600 font-semibold text-[10px] uppercase">
            <tr>
              <th className="text-left p-2 border-b border-parchment-200 w-28">Category</th>
              <th className="text-left p-2 border-b border-parchment-200">Required Item / Asset</th>
              <th className="text-left p-2 border-b border-parchment-200 w-24">Status</th>
              <th className="text-left p-2 border-b border-parchment-200">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-parchment-200">
            {data.accessChecklist && data.accessChecklist.length > 0 ? (
              data.accessChecklist.map((item, idx) => (
                <tr key={idx} className="hover:bg-parchment-50/50">
                  <td className="p-2 text-ink-600 text-[11px] font-medium">{item.category}</td>
                  <td className="p-2 text-ink-900 font-medium">{item.task}</td>
                  <td className="p-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      item.provided 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {item.provided ? '✓ Received' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="p-2 text-ink-500 text-[11px]">{item.notes || '—'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-2 text-ink-400 italic text-center">No checklist items defined.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Process & First Week Milestones */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-parchment-200 p-3 rounded bg-white text-xs">
          <div className="text-[11px] uppercase font-semibold text-ink-600 mb-1">
            Deliverable Review & Approval Process
          </div>
          <p className="text-ink-700 leading-relaxed">{data.deliverableReviewProcess}</p>
          <div className="text-[11px] text-ink-500 mt-2">
            Tooling: <span className="font-medium text-ink-800">{data.projectManagementTool}</span>
          </div>
        </div>

        <div className="border border-parchment-200 p-3 rounded bg-parchment-50 text-xs">
          <div className="text-[11px] uppercase font-semibold text-forest-700 mb-1">
            First Week Milestones (Sprint 0)
          </div>
          <ul className="space-y-1 text-ink-800">
            {data.firstWeekMilestones && data.firstWeekMilestones.map((m, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-forest-700 font-bold">✓</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <DocumentFooter agency={agency} />
    </div>
  );
};

