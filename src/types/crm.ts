// Core CRM Types

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  companyId?: string;
  tags: string[];
  notes: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  address?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';

export interface Lead {
  id: string;
  contactId: string;
  status: LeadStatus;
  source: string;
  value?: number;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Deal {
  id: string;
  name: string;
  value: number;
  stage: DealStage;
  closeDate: Date;
  contactId?: string;
  companyId?: string;
  ownerId: string;
  probability: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskType = 'call' | 'email' | 'meeting';

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  dueDate: Date;
  completed: boolean;
  contactId?: string;
  dealId?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: string;
  content: string;
  entityType: 'contact' | 'company' | 'deal';
  entityId: string;
  authorId: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: 'note' | 'task' | 'deal_update' | 'status_change' | 'email' | 'call';
  description: string;
  entityType: 'contact' | 'company' | 'deal';
  entityId: string;
  authorId: string;
  createdAt: Date;
}

// Dashboard Stats
export interface DashboardStats {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  totalDealValue: number;
  leadsByStatus: Record<LeadStatus, number>;
  dealsByStage: Record<DealStage, number>;
  tasksDueToday: number;
  recentActivities: Activity[];
}
