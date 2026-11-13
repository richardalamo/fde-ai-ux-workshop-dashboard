import { DerivedTask, Owner, Task } from '../types/dashboard';
import { formatOverdueDays, getTodayString } from '../utils/dates';
import { EmptyState } from './States';
import { StatusBadge } from './StatusBadge';

interface NeedsYouTodayPanelProps {
  tasks: DerivedTask[];
  owners: Owner[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>, toastMessage: string) => void;
}

interface RankedTask {
  task: DerivedTask;
  reason: string;
  reasonColor: string;
}

function getNeedsYouTodayTasks(tasks: DerivedTask[]): RankedTask[] {
  const overdue = tasks
    .filter((t) => t.status === 'Overdue')
    .sort((a, b) => {
      if (a.diffDays !== b.diffDays) return a.diffDays - b.diffDays;
      return a.project.name.localeCompare(b.project.name);
    })
    .map((task) => ({
      task,
      reason: formatOverdueDays(task.daysOverdue),
      reasonColor: '#B42318',
    }));

  const blocked = tasks
    .filter((t) => t.status === 'Blocked')
    .sort((a, b) => {
      if (a.diffDays !== b.diffDays) return a.diffDays - b.diffDays;
      return a.project.name.localeCompare(b.project.name);
    })
    .map((task) => {
      let reason = 'Blocked';
      if (task.diffDays < 0) {
        const days = Math.abs(task.diffDays);
        reason = `Blocked · ${days} ${days === 1 ? 'day' : 'days'} late`;
      } else if (task.diffDays === 0) {
        reason = 'Blocked · due today';
      }
      return {
        task,
        reason,
        reasonColor: '#6E3FC1',
      };
    });

  const dueToday = tasks
    .filter(
      (t) =>
        t.manualState === 'active' &&
        t.status !== 'Overdue' &&
        t.status !== 'Blocked' &&
        t.diffDays === 0
    )
    .sort((a, b) => a.project.name.localeCompare(b.project.name))
    .map((task) => ({
      task,
      reason: 'Due today',
      reasonColor: '#9A5B00',
    }));

  return [...overdue, ...blocked, ...dueToday].slice(0, 5);
}

export function NeedsYouTodayPanel({
  tasks,
  owners,
  selectedTaskId,
  onSelectTask,
  onUpdateTask,
}: NeedsYouTodayPanelProps) {
  const ranked = getNeedsYouTodayTasks(tasks);
  const todayStr = getTodayString();

  return (
    <section aria-labelledby="needs-you-today-heading" className="space-y-[12px]">
      <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
        <h2
          id="needs-you-today-heading"
          className="text-[18px] font-semibold leading-[24px] text-[#1B1F24]"
        >
          Needs you today
        </h2>
        {ranked.length > 0 && (
          <p className="text-[12px] font-medium text-[#57606A] tabular-nums">
            Top {ranked.length} · overdue, blocked, then due today
          </p>
        )}
      </div>

      {ranked.length === 0 ? (
        <EmptyState message="Nothing needs you today. All active work is on track for later." />
      ) : (
        <div className="overflow-x-auto rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF]">
          <table
            aria-label="Needs you today"
            className="w-full border-collapse text-left"
          >
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
                  Reason
                </th>
                <th
                  scope="col"
                  className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
                >
                  Owner
                </th>
                <th
                  scope="col"
                  className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
                >
                  Due date
                </th>
              </tr>
            </thead>
            <tbody>
              {ranked.map(({ task, reason, reasonColor }) => {
                const isSelected = task.id === selectedTaskId;
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
                    <td className="px-[16px] text-[14px] font-medium text-[#1B1F24] max-w-[260px] truncate">
                      {task.title}
                    </td>
                    <td className="px-[16px] text-[14px] text-[#57606A] max-w-[180px] truncate">
                      {task.project.name}
                    </td>
                    <td className="px-[16px] whitespace-nowrap">
                      <div className="inline-flex items-center gap-[8px]">
                        <StatusBadge status={task.status} />
                        <span
                          className="text-[12px] font-medium tabular-nums"
                          style={{ color: reasonColor }}
                        >
                          {reason}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-[16px] whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <select
                        aria-label={`Change owner for ${task.title}`}
                        value={task.ownerId}
                        onChange={(e) => {
                          if (e.target.value === task.ownerId) return;
                          onUpdateTask(
                            task.id,
                            {
                              ownerId: e.target.value,
                              updatedAt: todayStr,
                            },
                            'Owner updated'
                          );
                        }}
                        className="min-h-[32px] rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[8px] py-[4px] text-[14px] text-[#1B1F24]"
                      >
                        {owners.map((owner) => (
                          <option key={owner.id} value={owner.id}>
                            {owner.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td
                      className="px-[16px] whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <input
                        type="date"
                        aria-label={`Change due date for ${task.title}`}
                        value={task.dueDate}
                        onChange={(e) => {
                          if (!e.target.value || e.target.value === task.dueDate) return;
                          onUpdateTask(
                            task.id,
                            {
                              dueDate: e.target.value,
                              updatedAt: todayStr,
                            },
                            'Due date updated'
                          );
                        }}
                        className="min-h-[32px] rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[8px] py-[4px] text-[14px] tabular-nums text-[#1B1F24]"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
