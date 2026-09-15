import { Freelancer } from '../types/freelancers';
import { Task, TaskStatus, TaskDeliverable } from '../types/tasks';

const FREELANCERS_STORAGE_KEY = 'agency_freelancers_v1';
const TASKS_STORAGE_KEY = 'agency_tasks_v1';

export const generateSecureTemporaryPassword = (): string => {
  const words = ['Nexus', 'Aura', 'Sprint', 'Vector', 'Pixel', 'Summit', 'Zenith', 'Focus', 'Forge'];
  const symbols = ['!', '@', '#', '$', '%'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  const symbol = symbols[Math.floor(Math.random() * symbols.length)];
  return `${word}-${num}${symbol}`;
};

export const generateUsername = (name: string, email: string): string => {
  if (email && email.includes('@')) {
    return email.split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
  }
  return name.toLowerCase().trim().replace(/\s+/g, '.').replace(/[^a-z0-9._-]/g, '');
};

const initialSampleFreelancers: Freelancer[] = [
  {
    id: 'usr-subhadip',
    name: 'Subhadip Jana',
    email: 'subhadipjana866@gmail.com',
    role: 'Senior Managing Partner',
    accessLevel: 'admin',
    paymentType: 'fixed',
    paymentAmount: 0,
    hourlyRate: 0,
    currency: 'USD',
    status: 'active',
    skills: ['Systems Architecture', 'Distributed Infrastructure', 'Partnership Governance'],
    joinedDate: '2025-01-01',
    credentials: {
      username: 'subhadip866',
      password: 'subhadip2003#',
      mustChangePassword: false,
      generatedAt: '2025-01-01T00:00:00Z',
      lastLoginAt: '2026-09-14T00:00:00Z'
    },
    notes: 'Co-founding Senior Managing Partner'
  },
  {
    id: 'usr-shayan',
    name: 'Shayan Das',
    email: 'shayandas267@gmail.com',
    role: 'Senior Managing Partner',
    accessLevel: 'admin',
    paymentType: 'fixed',
    paymentAmount: 0,
    hourlyRate: 0,
    currency: 'USD',
    status: 'active',
    skills: ['Product Design', 'Commercial Strategy', 'Engineering Leadership'],
    joinedDate: '2025-01-01',
    credentials: {
      username: 'shayan267',
      password: 'shayan2003#',
      mustChangePassword: false,
      generatedAt: '2025-01-01T00:00:00Z',
      lastLoginAt: '2026-09-14T00:00:00Z'
    },
    notes: 'Co-founding Senior Managing Partner'
  }
];

export const getStoredFreelancers = (): Freelancer[] => {
  try {
    const raw = localStorage.getItem(FREELANCERS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read freelancers from storage', e);
  }
  return initialSampleFreelancers;
};

export const saveAllFreelancers = (freelancers: Freelancer[]): void => {
  try {
    localStorage.setItem(FREELANCERS_STORAGE_KEY, JSON.stringify(freelancers));
  } catch (e) {
    console.error('Failed to save freelancers to storage', e);
  }
};

export const saveFreelancer = (freelancer: Freelancer): Freelancer => {
  const list = getStoredFreelancers();
  const idx = list.findIndex((f) => f.id === freelancer.id);
  let updatedList: Freelancer[];
  if (idx >= 0) {
    updatedList = [...list];
    updatedList[idx] = freelancer;
  } else {
    updatedList = [freelancer, ...list];
  }
  saveAllFreelancers(updatedList);
  return freelancer;
};

export const deleteFreelancer = (id: string): void => {
  const list = getStoredFreelancers().filter((f) => f.id !== id);
  saveAllFreelancers(list);
};

export const resetFreelancerPassword = (id: string): { newPassword: string; freelancer: Freelancer | null } => {
  const list = getStoredFreelancers();
  const idx = list.findIndex((f) => f.id === id);
  if (idx === -1) return { newPassword: '', freelancer: null };

  const newPassword = generateSecureTemporaryPassword();
  const updated: Freelancer = {
    ...list[idx],
    credentials: {
      ...list[idx].credentials,
      temporaryPassword: newPassword,
      mustChangePassword: true,
      generatedAt: new Date().toISOString()
    }
  };
  list[idx] = updated;
  saveAllFreelancers(list);
  return { newPassword, freelancer: updated };
};

export const changeFreelancerPassword = (id: string, newPassword: string): boolean => {
  const list = getStoredFreelancers();
  const idx = list.findIndex((f) => f.id === id);
  if (idx === -1) return false;

  list[idx] = {
    ...list[idx],
    credentials: {
      ...list[idx].credentials,
      password: newPassword,
      temporaryPassword: undefined,
      mustChangePassword: false,
      lastLoginAt: new Date().toISOString()
    }
  };
  saveAllFreelancers(list);
  return true;
};

// Task storage
export const getStoredTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read tasks from storage', e);
  }
  return [];
};

export const saveAllTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to storage', e);
  }
};

export const saveTask = (task: Task): Task => {
  const list = getStoredTasks();
  const now = new Date().toISOString();
  const taskToSave: Task = { ...task, updatedAt: now };
  const idx = list.findIndex((t) => t.id === task.id);
  let updatedList: Task[];
  if (idx >= 0) {
    updatedList = [...list];
    updatedList[idx] = taskToSave;
  } else {
    updatedList = [taskToSave, ...list];
  }
  saveAllTasks(updatedList);
  return taskToSave;
};

export const updateTaskStatus = (taskId: string, status: TaskStatus): Task | null => {
  const list = getStoredTasks();
  const idx = list.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;
  const updated: Task = {
    ...list[idx],
    status,
    updatedAt: new Date().toISOString()
  };
  list[idx] = updated;
  saveAllTasks(list);
  return updated;
};

export const submitTaskDeliverable = (taskId: string, deliverable: TaskDeliverable): Task | null => {
  const list = getStoredTasks();
  const idx = list.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;

  const existingDeliverables = list[idx].deliverables || [];
  const updated: Task = {
    ...list[idx],
    status: 'review',
    updatedAt: new Date().toISOString(),
    deliverables: [deliverable, ...existingDeliverables]
  };
  list[idx] = updated;
  saveAllTasks(list);
  return updated;
};

export const deleteTask = (id: string): void => {
  const list = getStoredTasks().filter((t) => t.id !== id);
  saveAllTasks(list);
};
