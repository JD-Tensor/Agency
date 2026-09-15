export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'completed';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface TaskDeliverable {
  submittedAt: string;
  url?: string;
  notes?: string;
  submittedBy: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  freelancerId: string;
  freelancerName: string;
  assignedBy: string;
  projectName: string;
  clientName?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  deliverables?: TaskDeliverable[];
  estimatedHours?: number;
  actualHours?: number;
}

