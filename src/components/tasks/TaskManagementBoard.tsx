import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  User, 
  Calendar, 
  Trash2,
  X
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { TaskStatus, TaskPriority } from '../../types/tasks';

export const TaskManagementBoard: React.FC = () => {
  const { 
    tasks, 
    freelancers, 
    allocateTask, 
    changeTaskStatus, 
    removeTask 
  } = useAgency();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFreelancer, setSelectedFreelancer] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newFreelancerId, setNewFreelancerId] = useState(freelancers[0]?.id || '');
  const [newProject, setNewProject] = useState('AeroSync Telemetry Overhaul');
  const [newClient, setNewClient] = useState('AeroSync Technologies');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState(new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]);
  const [newEstimatedHours, setNewEstimatedHours] = useState(10);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFreelancerId) return;
    allocateTask({
      title: newTitle,
      description: newDescription,
      freelancerId: newFreelancerId,
      projectName: newProject,
      clientName: newClient,
      priority: newPriority,
      dueDate: newDueDate,
      estimatedHours: newEstimatedHours
    });
    setNewTitle('');
    setNewDescription('');
    setIsAllocateModalOpen(false);
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.freelancerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFreelancer = selectedFreelancer === 'all' || t.freelancerId === selectedFreelancer;
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;

    return matchesSearch && matchesFreelancer && matchesPriority;
  });

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'todo', label: 'To Do', color: 'border-parchment-300' },
    { status: 'in_progress', label: 'In Progress', color: 'border-amber-400' },
    { status: 'review', label: 'Under Review', color: 'border-purple-400' },
    { status: 'completed', label: 'Completed', color: 'border-emerald-400' },
  ];

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <span className="bg-red-50 text-red-700 border border-red-200 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Urgent</span>;
      case 'high':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase">High</span>;
      case 'medium':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] px-1.5 py-0.5 rounded font-medium uppercase">Medium</span>;
      case 'low':
        return <span className="bg-parchment-200 text-ink-600 text-[9px] px-1.5 py-0.5 rounded font-medium uppercase">Low</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-parchment-200">
        <div>
          <h2 className="font-serif text-2xl text-ink-950 font-normal">
            Task Allocation & Work Board
          </h2>
          <p className="text-xs text-ink-500 font-light mt-0.5">
            Assign work to freelancers, track progress across projects, and inspect submitted deliverables
          </p>
        </div>
        <button
          onClick={() => setIsAllocateModalOpen(true)}
          className="flex items-center gap-1.5 bg-clay-600 hover:bg-clay-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Allocate New Task</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-parchment-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, project, or freelancer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 border border-parchment-200 rounded-lg focus:outline-none focus:border-clay-600 bg-parchment-50/50"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-ink-500">
            <User className="w-3.5 h-3.5" />
            <span>Freelancer:</span>
            <select
              value={selectedFreelancer}
              onChange={(e) => setSelectedFreelancer(e.target.value)}
              className="text-xs p-1.5 border border-parchment-200 rounded-lg bg-white text-ink-800"
            >
              <option value="all">All Freelancers</option>
              {freelancers.map((fl) => (
                <option key={fl.id} value={fl.id}>{fl.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-ink-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs p-1.5 border border-parchment-200 rounded-lg bg-white text-ink-800"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.status);

          return (
            <div key={col.status} className="bg-parchment-50 border border-parchment-200 rounded-xl p-3 flex flex-col min-h-[500px]">
              {/* Column Header */}
              <div className={`flex items-center justify-between pb-2 mb-3 border-b-2 ${col.color}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink-900">{col.label}</span>
                  <span className="text-[10px] font-mono font-medium text-ink-500 bg-white px-1.5 py-0.2 rounded-full border border-parchment-200">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="text-center py-10 text-[11px] text-ink-400 italic">
                    No tasks in {col.label.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border border-parchment-200 rounded-lg p-3 hover:shadow-xs transition space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <span className="text-[10px] font-mono text-ink-400 bg-parchment-100 px-1.5 py-0.5 rounded">
                          {task.projectName}
                        </span>
                        {getPriorityBadge(task.priority)}
                      </div>

                      <h4 className="font-serif font-medium text-xs text-ink-950 leading-snug">
                        {task.title}
                      </h4>

                      <p className="text-[11px] text-ink-600 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Deliverables notification if any */}
                      {task.deliverables && task.deliverables.length > 0 && (
                        <div className="bg-purple-50/70 border border-purple-200 rounded p-2 text-[10px] text-purple-900 space-y-1">
                          <div className="font-semibold flex items-center justify-between">
                            <span>Deliverable Submitted</span>
                            <span className="font-mono text-[9px]">
                              {new Date(task.deliverables[0].submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {task.deliverables[0].url && (
                            <a
                              href={task.deliverables[0].url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-clay-700 hover:underline flex items-center gap-1 font-mono truncate"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{task.deliverables[0].url}</span>
                            </a>
                          )}
                          {task.deliverables[0].notes && (
                            <p className="text-ink-600 line-clamp-2 italic">
                              &quot;{task.deliverables[0].notes}&quot;
                            </p>
                          )}
                        </div>
                      )}

                      {/* Meta footer & Status selector */}
                      <div className="pt-2 border-t border-parchment-100 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 text-ink-700 font-medium">
                          <User className="w-3 h-3 text-ink-400" />
                          <span className="truncate max-w-[90px]">{task.freelancerName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-ink-500">
                          <Calendar className="w-3 h-3 text-ink-400" />
                          <span>{task.dueDate}</span>
                        </div>
                      </div>

                      {/* Status Transition Control */}
                      <div className="flex items-center justify-between pt-1">
                        <select
                          value={task.status}
                          onChange={(e) => changeTaskStatus(task.id, e.target.value as TaskStatus)}
                          className="text-[10px] p-1 rounded border border-parchment-300 bg-parchment-50 text-ink-800 focus:outline-none"
                        >
                          <option value="todo">Move to To Do</option>
                          <option value="in_progress">Move to In Progress</option>
                          <option value="review">Move to Review</option>
                          <option value="completed">Mark Completed</option>
                        </select>

                        <button
                          onClick={() => {
                            if (confirm('Delete this task?')) {
                              removeTask(task.id);
                            }
                          }}
                          className="p-1 text-ink-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Allocate Task Modal */}
      {isAllocateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white border border-parchment-300 rounded-2xl p-6 shadow-xl relative animate-in zoom-in-95">
            <button
              onClick={() => setIsAllocateModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-ink-400 hover:text-ink-900 rounded-lg hover:bg-parchment-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif text-lg font-semibold text-ink-950 mb-1">
              Allocate Work / Task
            </h3>
            <p className="text-xs text-ink-500 mb-4">
              Assign task requirements, deadlines, and project milestones to an onboarded freelancer
            </p>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-ink-700 mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                  placeholder="e.g. Build responsive charts in Next.js"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-ink-700 mb-1">Task Description & Deliverable Specs</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-2 border border-parchment-300 rounded focus:border-clay-600 focus:outline-none"
                  placeholder="Clear instructions, criteria of acceptance, and links to assets..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-ink-700 mb-1">Assign to Freelancer</label>
                  <select
                    value={newFreelancerId}
                    onChange={(e) => setNewFreelancerId(e.target.value)}
                    className="w-full p-2 border border-parchment-300 rounded bg-white"
                    required
                  >
                    {freelancers.map((fl) => (
                      <option key={fl.id} value={fl.id}>
                        {fl.name} ({fl.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-ink-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full p-2 border border-parchment-300 rounded bg-white"
                  >
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-ink-700 mb-1">Project Name</label>
                  <input
                    type="text"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full p-2 border border-parchment-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-700 mb-1">Client Organization</label>
                  <input
                    type="text"
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full p-2 border border-parchment-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-ink-700 mb-1">Target Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-2 border border-parchment-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-ink-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    value={newEstimatedHours}
                    onChange={(e) => setNewEstimatedHours(parseInt(e.target.value) || 0)}
                    className="w-full p-2 border border-parchment-300 rounded"
                    min={1}
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAllocateModalOpen(false)}
                  className="px-3.5 py-1.5 border border-parchment-300 rounded-lg text-ink-700 hover:bg-parchment-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-clay-600 hover:bg-clay-700 text-white font-medium px-4 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
