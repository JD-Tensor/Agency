import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Send, 
  ExternalLink, 
  Check, 
  X
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { TaskStatus } from '../../types/tasks';

export const FreelancerWorkspace: React.FC = () => {
  const { 
    currentUser, 
    tasks, 
    changeTaskStatus, 
    submitDeliverable,
    agencyProfile 
  } = useAgency();

  // Tasks allocated to this specific logged-in freelancer
  const myTasks = tasks.filter((t) => {
    if (currentUser?.isOwner) return true; // Owner can preview all
    return t.freelancerId === currentUser?.id || t.freelancerName === currentUser?.name;
  });

  const [deliverableModalTaskId, setDeliverableModalTaskId] = useState<string | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState('');
  const [deliverableNotes, setDeliverableNotes] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const activeTasks = myTasks.filter((t) => t.status !== 'completed');
  const completedTasks = myTasks.filter((t) => t.status === 'completed');

  const handleOpenDeliverableModal = (taskId: string) => {
    setDeliverableModalTaskId(taskId);
    setDeliverableUrl('');
    setDeliverableNotes('');
  };

  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableModalTaskId) return;

    submitDeliverable(deliverableModalTaskId, {
      submittedAt: new Date().toISOString(),
      url: deliverableUrl,
      notes: deliverableNotes,
      submittedBy: currentUser?.name || 'Freelancer'
    });

    const taskId = deliverableModalTaskId;
    setDeliverableModalTaskId(null);
    setSubmittedNotice(taskId);
    setTimeout(() => setSubmittedNotice(null), 3000);
  };

  const getStatusPill = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return <span className="bg-parchment-200 text-ink-700 text-[10px] px-2 py-0.5 rounded font-medium">To Do</span>;
      case 'in_progress':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] px-2 py-0.5 rounded font-medium">In Progress</span>;
      case 'review':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] px-2 py-0.5 rounded font-medium">Under Review</span>;
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2 py-0.5 rounded font-medium">Completed</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-parchment-200 rounded-xl p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-forest-700 inline-block"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-700">
              Freelancer Workspace
            </span>
          </div>
          <h2 className="font-serif text-2xl text-ink-950 font-normal">
            Welcome back, {currentUser?.name || 'Freelancer'}
          </h2>
          <p className="text-xs text-ink-500 font-light mt-0.5">
            Role: <strong className="text-ink-800">{currentUser?.role || 'Contributor'}</strong> • Access Level: <strong className="uppercase text-forest-700">{currentUser?.accessLevel || 'restricted'}</strong>
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-ink-500">Agency: {agencyProfile.name}</div>
          <div className="text-xs font-medium text-ink-800 mt-1 flex items-center gap-3">
            <span>Active: <strong className="font-mono text-clay-700">{activeTasks.length}</strong></span>
            <span>Done: <strong className="font-mono text-emerald-700">{completedTasks.length}</strong></span>
          </div>
        </div>
      </div>

      {submittedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Deliverable submitted successfully! The task has been moved to <strong>Under Review</strong> for agency feedback.</span>
        </div>
      )}

      {/* Assigned Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg text-ink-950 font-normal">
            My Allocated Tasks ({myTasks.length})
          </h3>
          <span className="text-xs text-ink-500 font-light">
            Update your task status or submit deliverables below
          </span>
        </div>

        {myTasks.length === 0 ? (
          <div className="bg-white border border-parchment-200 rounded-xl p-12 text-center text-xs text-ink-400">
            You currently have no tasks allocated. Contact your project lead.
          </div>
        ) : (
          <div className="space-y-3">
            {myTasks.map((task) => {
              return (
                <div
                  key={task.id}
                  className="bg-white border border-parchment-200 rounded-xl p-5 hover:border-clay-300 hover:shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-ink-500 bg-parchment-100 px-2 py-0.5 rounded border border-parchment-200">
                        {task.projectName}
                      </span>
                      {getStatusPill(task.status)}
                      <span className="text-[10px] text-ink-400">
                        Due: <strong className="text-ink-700">{task.dueDate}</strong>
                      </span>
                    </div>

                    <h4 className="font-serif text-base font-semibold text-ink-950">
                      {task.title}
                    </h4>

                    <p className="text-xs text-ink-600 leading-relaxed max-w-2xl">
                      {task.description}
                    </p>

                    {/* Previously submitted deliverable preview */}
                    {task.deliverables && task.deliverables.length > 0 && (
                      <div className="mt-2 bg-purple-50/60 border border-purple-200 rounded p-2 text-xs text-purple-900 flex items-center justify-between max-w-xl">
                        <div className="flex items-center gap-2 truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 flex-shrink-0" />
                          <span className="font-medium text-[11px]">Deliverable submitted:</span>
                          {task.deliverables[0].url && (
                            <a
                              href={task.deliverables[0].url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-clay-700 hover:underline flex items-center gap-1 font-mono text-[11px] truncate"
                            >
                              <span className="truncate">{task.deliverables[0].url}</span>
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            </a>
                          )}
                        </div>
                        <span className="text-[10px] text-purple-600 font-mono flex-shrink-0 ml-2">
                          {new Date(task.deliverables[0].submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status update & Deliverable Action Controls */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-parchment-100">
                    <select
                      value={task.status}
                      onChange={(e) => changeTaskStatus(task.id, e.target.value as TaskStatus)}
                      className="text-xs p-1.5 border border-parchment-300 rounded-lg bg-parchment-50 text-ink-800 font-medium focus:outline-none"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Under Review</option>
                      <option value="completed">Completed</option>
                    </select>

                    <button
                      onClick={() => handleOpenDeliverableModal(task.id)}
                      className="flex items-center gap-1 text-xs font-medium text-clay-700 hover:text-white bg-clay-50 hover:bg-clay-600 border border-clay-200 hover:border-clay-600 px-3 py-1.5 rounded-lg transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>Submit Work</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Deliverable Modal */}
      {deliverableModalTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-parchment-300 rounded-2xl p-6 shadow-xl relative animate-in zoom-in-95">
            <button
              onClick={() => setDeliverableModalTaskId(null)}
              className="absolute right-4 top-4 p-1.5 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-parchment-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-clay-600 flex items-center justify-center text-white">
                <Send className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-ink-950">
                Submit Deliverable / Work Link
              </h3>
            </div>
            <p className="text-xs text-ink-500 mb-4">
              Provide your pull request link, Figma link, staging demo URL, and completion notes
            </p>

            <form onSubmit={handleSubmitDeliverable} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-ink-700 mb-1">
                  Deliverable URL (GitHub PR / Figma / Loom / Staging Link)
                </label>
                <input
                  type="url"
                  value={deliverableUrl}
                  onChange={(e) => setDeliverableUrl(e.target.value)}
                  className="w-full p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none font-mono"
                  placeholder="https://github.com/... or https://figma.com/..."
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-ink-700 mb-1">
                  Work Notes & Acceptance Summary
                </label>
                <textarea
                  rows={3}
                  value={deliverableNotes}
                  onChange={(e) => setDeliverableNotes(e.target.value)}
                  className="w-full p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                  placeholder="Explain what was implemented, how to test, or caveats..."
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeliverableModalTaskId(null)}
                  className="px-3.5 py-1.5 border border-parchment-300 rounded-lg text-ink-700 hover:bg-parchment-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-clay-600 hover:bg-clay-700 text-white font-medium px-4 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
