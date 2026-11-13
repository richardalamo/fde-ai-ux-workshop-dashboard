export type TaskStatus = 'Overdue' | 'Due soon' | 'On track' | 'Done' | 'Blocked';

export type ProjectStatus = 'Overdue' | 'At risk' | 'On track';

export type TaskManualState = 'active' | 'blocked' | 'done';

export type ApprovalStatus = 'none' | 'awaiting' | 'approved';

export interface Owner {
  id: string;
  name: string;
  initials: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  leadId: string;
}

export interface Task {
  id: string;
  title: string;
  projectId: string;
  ownerId: string;
  dueDate: string; // YYYY-MM-DD
  manualState: TaskManualState;
  approvalStatus: ApprovalStatus;
  returnReason?: string;
  blockerReason?: string;
  notes: string;
  updatedAt: string; // YYYY-MM-DD
}

export interface DerivedTask extends Task {
  status: TaskStatus;
  diffDays: number;
  daysOverdue: number;
  project: Project;
  owner: Owner;
}

export interface ProjectSummary {
  project: Project;
  lead: Owner;
  doneCount: number;
  openCount: number;
  overdueCount: number;
  blockedCount: number;
  totalCount: number;
}

export interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  ownerId: string | 'all';
  projectId: string | 'all';
}

export type DueDateSort = 'asc' | 'desc';

export type ProjectSortField = 'name' | 'overdue' | 'open' | 'done';

export type NavPage = 'overview' | 'projects' | 'tasks';

export interface ToastItem {
  id: string;
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
}
