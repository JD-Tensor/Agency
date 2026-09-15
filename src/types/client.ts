export interface ClientMilestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'todo';
  dueDate: string;
  completedAt?: string;
  deliverableUrl?: string;
}

export interface ClientProjectOrder {
  id: string;
  title: string;
  description: string;
  status: 'discovery' | 'in_progress' | 'review' | 'completed';
  progressPercentage: number;
  startDate: string;
  targetDeliveryDate: string;
  budgetTotal: number;
  currency: string;
  projectLeadId: string;
  projectLeadName: string;
  assignedFreelancerIds: string[];
  communicationChannels: {
    slackChannel?: string;
    meetingSchedule?: string;
    contactEmail: string;
    emergencyPhone?: string;
  };
  milestones: ClientMilestone[];
}

export interface ClientPortalCredentials {
  username: string;
  password?: string;
  temporaryPassword?: string;
  mustChangePassword?: boolean;
  generatedAt: string;
  lastLoginAt?: string;
}

export interface ClientAccount {
  id: string;
  companyName: string;
  contactName: string;
  contactTitle: string;
  email: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  credentials: ClientPortalCredentials;
  orders: ClientProjectOrder[];
  sharedDocumentIds?: string[];
  notes?: string;
  createdAt: string;
}

