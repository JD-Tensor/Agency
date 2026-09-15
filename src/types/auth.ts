import { AccessLevel } from './freelancers';

export type UserAccessLevel = AccessLevel | 'client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: string;
  accessLevel: UserAccessLevel;
  isOwner?: boolean;
  avatarUrl?: string;
  freelancerId?: string;
  clientId?: string;
  clientCompanyName?: string;
  mustChangePassword?: boolean;
  roleLevel?: number;
  roleName?: string;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}
