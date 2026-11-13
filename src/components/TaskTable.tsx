import { ArrowDown, ArrowUp } from 'lucide-react';
import { DerivedTask, DueDateSort } from '../types/dashboard';
import { formatDueDateDisplay } from '../utils/dates';
import { OwnerAvatar } from './OwnerAvatar';
import { StatusBadge } from './StatusBadge';

interface TaskTableProps {
  tasks: DerivedTask[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  dueDateSort?: DueDateSort;
  onToggleDueDateSort?: () => void;
  ariaLabel: string;
}

export function TaskTable({
  tasks,
  selectedTaskId,
  onSelectTask,
  dueDateSort,
  onToggleDueDateSort,
  ariaLabel,
}: TaskTableProps) {
  return (
    <div className="overflow-x-auto rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF]">
      <table aria-label={ariaLabel} className="w-full border-collapse text-left">
        <thead>
          <tr className="h-[44px] border-b border-[#D0D7DE] bg-[#F6F8FA]">
            <th
              scope="col"
              className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
            >
              Task
            </th>
            <th
              scope="col"
              className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
            >
              Project
            </th>
            <th
              scope="col"
              className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
            >
              Owner
            </th>
            <th
              scope="col"
              aria-sort={
                onToggleDueDateSort && dueDateSort
                  ? dueDateSort === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
              className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
            >
              {onToggleDueDateSort ? (
                <button
                  type="button"
                  onClick={onToggleDueDateSort}
                  className="inline-flex min-h-[32px] items-center gap-[4px] rounded-[6px] px-[4px] -ml-[4px] text-[12px] font-medium text-[#1B1F24] hover:bg-[#EEF1F4] transition-colors whitespace-nowrap"
                >
                  <span>Due date</span>
                  {dueDateSort === 'asc' ? (
                    <ArrowUp className="h-3.5 w-3.5 text-[#2B59C3]" aria-hidden="true" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 text-[#2B59C3]" aria-hidden="true" />
                  )}
                </button>
              ) : (
                'Due date'
              )}
            </th>
            <th
              scope="col"
              className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const isSelected = task.id === selectedTaskId;
            const dueDisplay = formatDueDateDisplay(
              task.dueDate,
              task.diffDays,
              task.manualState === 'done',
              task.manualState === 'blocked'
            );

            return (
              <tr
                key={task.id}
                tabIndex={0}
                onClick={() => onSelectTask(task.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectTask(task.id);
                  }
                }}
                aria-selected={isSelected}
                className={`h-[44px] cursor-pointer border-b border-[#D0D7DE] last:border-b-0 transition-colors ${
                  isSelected ? 'bg-[#2B59C3]/5' : 'hover:bg-[#F6F8FA]'
                }`}
              >
                <td className="px-[16px] text-[14px] font-medium text-[#1B1F24] max-w-[300px] truncate">
                  {task.title}
                </td>
                <td className="px-[16px] text-[14px] text-[#57606A] max-w-[220px] truncate">
                  {task.project.name}
                </td>
                <td className="px-[16px] whitespace-nowrap">
                  <OwnerAvatar owner={task.owner} />
                </td>
                <td
                  className={`px-[16px] text-[14px] tabular-nums whitespace-nowrap ${
                    dueDisplay.isOverdueText
                      ? 'font-medium text-[#B42318]'
                      : 'text-[#57606A]'
                  }`}
                >
                  {dueDisplay.text}
                </td>
                <td className="px-[16px] whitespace-nowrap">
                  <StatusBadge status={task.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
