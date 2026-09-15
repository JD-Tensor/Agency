import React from 'react';
import { DiscoveryCallData } from '../../types/documents';
import { AgencyProfile } from '../../types/agency';
import { DocumentHeader, DocumentFooter } from './DocumentHeader';

interface DiscoveryTemplateProps {
  data: DiscoveryCallData;
  agency: AgencyProfile;
  docNumber?: string;
}

export const DiscoveryTemplate: React.FC<DiscoveryTemplateProps> = ({
  data,
  agency,
  docNumber = 'DISC-2026-001'
}) => {
  return (
    <div className="a4-sheet p-10 font-sans text-ink-900 bg-white">
      <DocumentHeader 
        agency={agency}
        docTitle="Discovery Call Brief & Project Intake"
        docNumber={docNumber}
        docDate={data.callDate || new Date().toISOString().split('T')[0]}
        docTypeBadge="Client Discovery"
      />

      {/* Client & Metadata Card */}
      <div className="grid grid-cols-2 gap-4 bg-parchment-50 border border-parchment-200 rounded-lg p-4 mb-6 text-xs">
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1">
            Client Information
          </div>
          <div className="font-semibold text-ink-900 text-sm">{data.clientName || 'Client Name'}</div>
          <div className="text-ink-700">{data.clientRole} {data.clientRole && data.clientCompany ? '•' : ''} {data.clientCompany}</div>
          <div className="text-ink-500">{data.clientEmail}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500 tracking-wider mb-1">
            Call Details & Attendees
          </div>
          <div className="text-ink-800">
            <span className="font-medium text-ink-600">Attendees:</span> {data.attendees || 'None specified'}
          </div>
          <div className="text-ink-800 mt-1">
            <span className="font-medium text-ink-600">Project:</span> {data.projectTitle || 'Untitled Engagement'}
          </div>
        </div>
      </div>

      {/* Business Overview */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-clay-600"></span>
          Executive Overview & Background
        </h2>
        <div className="text-xs text-ink-800 leading-relaxed bg-white p-3 rounded border border-parchment-200">
          {data.businessOverview || 'No overview recorded.'}
        </div>
      </div>

      {/* Primary Goals & Pain Points Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-parchment-50 p-3.5 rounded border border-parchment-200">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-forest-700 mb-2">
            Target Goals & Success Metrics
          </h3>
          <ul className="space-y-1.5 text-xs text-ink-800">
            {data.primaryGoals && data.primaryGoals.length > 0 ? (
              data.primaryGoals.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-forest-700 font-bold">✓</span>
                  <span>{goal}</span>
                </li>
              ))
            ) : (
              <li className="text-ink-400 italic">No goals defined</li>
            )}
          </ul>
        </div>

        <div className="bg-parchment-50 p-3.5 rounded border border-parchment-200">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-clay-700 mb-2">
            Key Pain Points & Current Hurdles
          </h3>
          <ul className="space-y-1.5 text-xs text-ink-800">
            {data.painPoints && data.painPoints.length > 0 ? (
              data.painPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-clay-700 font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))
            ) : (
              <li className="text-ink-400 italic">No pain points defined</li>
            )}
          </ul>
        </div>
      </div>

      {/* Desired Scope & Features */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-2">
          Key Scope Deliverables & Features
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {data.desiredFeatures && data.desiredFeatures.length > 0 ? (
            data.desiredFeatures.map((feat, idx) => (
              <div key={idx} className="text-xs bg-white border border-parchment-200 p-2 rounded flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-400"></span>
                <span className="text-ink-800">{feat}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-ink-400 italic col-span-2">No specific features recorded.</div>
          )}
        </div>
      </div>

      {/* Target Audience & Tech Stack & Budget */}
      <div className="grid grid-cols-3 gap-3 mb-6 bg-parchment-50 p-3 rounded border border-parchment-200 text-xs">
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500">Target Audience</div>
          <div className="text-ink-800 mt-0.5">{data.targetAudience || 'General Audience'}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500">Tech Preferences</div>
          <div className="text-ink-800 mt-0.5">{data.techStackPreference || 'Standard Modern Web Stack'}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-semibold text-ink-500">Budget & Target Launch</div>
          <div className="text-ink-800 mt-0.5 font-medium text-clay-700">{data.budgetRange || 'TBD'}</div>
          <div className="text-[11px] text-ink-600 mt-0.5">{data.targetLaunchDate || 'Flexible'}</div>
        </div>
      </div>

      {/* Immediate Next Steps Table */}
      <div className="mb-6">
        <h2 className="text-xs uppercase font-semibold tracking-wider text-ink-500 mb-2">
          Immediate Action Items & Ownership
        </h2>
        <table className="w-full text-xs border border-parchment-200 rounded print:overflow-visible">
          <thead className="bg-parchment-100 text-ink-600 font-semibold text-[10px] uppercase">
            <tr>
              <th className="text-left p-2 border-b border-parchment-200">Action Item</th>
              <th className="text-left p-2 border-b border-parchment-200 w-36">Owner</th>
              <th className="text-left p-2 border-b border-parchment-200 w-28">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-parchment-200">
            {data.immediateNextSteps && data.immediateNextSteps.length > 0 ? (
              data.immediateNextSteps.map((step, idx) => (
                <tr key={idx} className="hover:bg-parchment-50/50">
                  <td className="p-2 text-ink-900">{step.action}</td>
                  <td className="p-2 text-ink-700 font-medium">{step.owner}</td>
                  <td className="p-2 text-ink-600">{step.dueDate}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-2 text-ink-400 italic text-center">No action items added</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.additionalNotes && (
        <div className="text-[11px] text-ink-600 bg-parchment-50 p-2.5 rounded border border-parchment-200 mb-4">
          <span className="font-semibold text-ink-700">Internal Context:</span> {data.additionalNotes}
        </div>
      )}

      <DocumentFooter agency={agency} />
    </div>
  );
};

