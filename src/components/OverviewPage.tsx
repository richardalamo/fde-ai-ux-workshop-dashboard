import { DerivedTask, TaskStatus } from '../types/dashboard';
import { formatOverdueDays } from '../utils/dates';
import { EmptyState, ErrorState, SummaryCardsSkeleton, TableSkeleton } from './States';
import { TaskTable } from './TaskTable';

interface OverviewPageProps {
  tasks: DerivedTask[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onFilterByStatus: (status: TaskStatus) => void;
}

export function OverviewPage({
  tasks,
  isLoading,
  error,
  onRetry,
  selectedTaskId,
  onSelectTask,
  onFilterByStatus,
}: OverviewPageProps) {
  const overdueTasks = tasks
    .filter((t) => t.status === 'Overdue')
    .sort((a, b) => {
      if (a.diffDays !== b.diffDays) return a.diffDays - b.diffDays;
      return a.project.name.localeCompare(b.project.name);
    });

  const dueThisWeekTasks = tasks.filter(
    (t) => t.manualState !== 'done' && t.diffDays >= 0 && t.diffDays <= 7
  );
  const dueSoonCount = dueThisWeekTasks.filter((t) => t.diffDays <= 3).length;

  const blockedTasks = tasks.filter((t) => t.status === 'Blocked');
  const blockedPastDueCount = blockedTasks.filter((t) => t.diffDays < 0).length;
  const blockedProjectCount = new Set(blockedTasks.map((t) => t.projectId)).size;

  const overdueProjectCount = new Set(overdueTasks.map((t) => t.projectId)).size;
  const oldestOverdueDays = overdueTasks.length > 0 ? overdueTasks[0].daysOverdue : 0;

  return (
    <div className="space-y-[24px]">
      <div>
        <h1 className="text-[24px] font-semibold leading-[32px] text-[#1B1F24]">
          Overview
        </h1>
      </div>

      {isLoading ? (
        <>
          <SummaryCardsSkeleton />
          <div className="space-y-[12px]">
            <div className="h-[24px] w-[160px] rounded-[4px] bg-[#EEF1F4] animate-pulse" />
            <TableSkeleton rows={8} />
          </div>
        </>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <>
          {/* Three summary cards: Overdue, Due this week, Blocked */}
          <section aria-label="Summary metrics" className="grid grid-cols-1 gap-[16px] sm:grid-cols-3">
            <button
              type="button"
              onClick={() => onFilterByStatus('Overdue')}
              className="rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[16px] text-left hover:border-[#2B59C3] transition-colors"
            >
              <p className="text-[12px] font-medium leading-[16px] text-[#57606A]">
                Overdue
              </p>
              <p className="mt-[8px] text-[28px] font-semibold leading-[36px] tabular-nums text-[#1B1F24]">
                {overdueTasks.length}
              </p>
              <p className="mt-[4px] text-[12px] leading-[16px] text-[#57606A] tabular-nums">
                {overdueTasks.length > 0
                  ? `oldest ${oldestOverdueDays} ${oldestOverdueDays === 1 ? 'day' : 'days'} · across ${overdueProjectCount} ${overdueProjectCount === 1 ? 'project' : 'projects'}`
                  : 'No overdue tasks'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onFilterByStatus('Due soon')}
              className="rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[16px] text-left hover:border-[#2B59C3] transition-colors"
            >
              <p className="text-[12px] font-medium leading-[16px] text-[#57606A]">
                Due this week
              </p>
              <p className="mt-[8px] text-[28px] font-semibold leading-[36px] tabular-nums text-[#1B1F24]">
                {dueThisWeekTasks.length}
              </p>
              <p className="mt-[4px] text-[12px] leading-[16px] text-[#57606A] tabular-nums">
                {dueThisWeekTasks.length > 0
                  ? `${dueSoonCount} due within 3 days`
                  : 'Nothing due in the next 7 days'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onFilterByStatus('Blocked')}
              className="rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[16px] text-left hover:border-[#2B59C3] transition-colors"
            >
              <p className="text-[12px] font-medium leading-[16px] text-[#57606A]">
                Blocked
              </p>
              <p className="mt-[8px] text-[28px] font-semibold leading-[36px] tabular-nums text-[#1B1F24]">
                {blockedTasks.length}
              </p>
              <p className="mt-[4px] text-[12px] leading-[16px] text-[#57606A] tabular-nums">
                {blockedTasks.length > 0
                  ? `across ${blockedProjectCount} ${blockedProjectCount === 1 ? 'project' : 'projects'}${
                      blockedPastDueCount > 0 ? ` · ${blockedPastDueCount} past due` : ''
                    }`
                  : 'No blocked tasks'}
              </p>
            </button>
          </section>

          {/* Overdue tasks list, most overdue first */}
          <section aria-labelledby="overdue-heading" className="space-y-[12px]">
            <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
              <h2
                id="overdue-heading"
                className="text-[18px] font-semibold leading-[24px] text-[#1B1F24]"
              >
                Overdue tasks
              </h2>
              {overdueTasks.length > 0 && (
                <p className="text-[12px] font-medium text-[#57606A] tabular-nums">
                  {overdueTasks.length} {overdueTasks.length === 1 ? 'task' : 'tasks'} · most overdue first · oldest {formatOverdueDays(oldestOverdueDays)}
                </p>
              )}
            </div>

            {overdueTasks.length === 0 ? (
              <EmptyState message="No overdue tasks. Nice work." />
            ) : (
              <TaskTable
                tasks={overdueTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={onSelectTask}
                ariaLabel="Overdue tasks"
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
