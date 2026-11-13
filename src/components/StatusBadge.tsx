import { ProjectStatus, TaskStatus } from '../types/dashboard';

interface StatusBadgeProps {
  status: TaskStatus;
}

const STATUS_STYLES: Record<TaskStatus, { text: string; bg: string }> = {
  Overdue: { text: '#B42318', bg: '#FDECEC' },
  'Due soon': { text: '#9A5B00', bg: '#FFF4E0' },
  'On track': { text: '#1E7B34', bg: '#E8F5E9' },
  Done: { text: '#57606A', bg: '#EEF1F4' },
  Blocked: { text: '#6E3FC1', bg: '#F1EBFC' },
};

const PROJECT_STATUS_STYLES: Record<ProjectStatus, { text: string; bg: string }> = {
  Overdue: { text: '#B42318', bg: '#FDECEC' },
  'At risk': { text: '#9A5B00', bg: '#FFF4E0' },
  'On track': { text: '#1E7B34', bg: '#E8F5E9' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className="inline-flex items-center rounded-full px-[8px] py-[4px] text-[12px] font-medium leading-[16px] whitespace-nowrap shrink-0"
      style={{
        color: style.text,
        backgroundColor: style.bg,
      }}
    >
      {status}
    </span>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const style = PROJECT_STATUS_STYLES[status];

  return (
    <span
      className="inline-flex items-center rounded-full px-[8px] py-[4px] text-[12px] font-medium leading-[16px] whitespace-nowrap shrink-0"
      style={{
        color: style.text,
        backgroundColor: style.bg,
      }}
    >
      {status}
    </span>
  );
}
