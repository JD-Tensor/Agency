export type AccessLevel = 'admin' | 'project_lead' | 'contributor' | 'restricted';

export type FreelancerStatus = 'active' | 'invited' | 'paused' | 'offboarded';

export type PaymentType = 'hourly' | 'fixed';

export interface FreelancerCredentials {
  username: string;
  temporaryPassword?: string;
  password?: string;
  mustChangePassword?: boolean;
  generatedAt: string;
  lastLoginAt?: string;
}

export interface Freelancer {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string; // e.g. "Senior UI/UX Designer", "Frontend Architect", "Backend Engineer"
  accessLevel: AccessLevel;
  paymentType: PaymentType; // 'hourly' or 'fixed'
  paymentAmount: number; // e.g. 85 ($/hr) or 3500 (fixed)
  hourlyRate?: number; // for backward compatibility
  currency: string;
  status: FreelancerStatus;
  skills: string[];
  joinedDate: string;
  credentials: FreelancerCredentials;
  allocatedTaskIds?: string[];
  notes?: string;
}
