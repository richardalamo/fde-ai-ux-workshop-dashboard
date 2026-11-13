import { DerivedTask, TaskStatus } from '../types/dashboard';
import { formatDueDateDisplay, formatOverdueDays } from '../utils/dates';
import { OwnerAvatar } from './OwnerAvatar';
import { EmptyState, ErrorState, SummaryCardsSkeleton, TableSkeleton } from './States';
import { StatusBadge } from './StatusBadge';
import { TaskTable } from './TaskTable';

interface OverviewPageProps {
  tasks: DerivedTask[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onFilterByStatus: (status: TaskStatus) => void;
  onApproveTask: (taskId: string) => void;
  onRequestReturn: (task: DerivedTask) => void;
}

export function OverviewPage({
  tasks,
  isLoading,
  error,
  onRetry,
  selectedTaskId,
  onSelectTask,
  onFilterByStatus,
  onApproveTask,
  onRequestReturn,
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

  const awaitingTasks = tasks
    .filter((t) => t.manualState === 'done' && t.approvalStatus === 'awaiting')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const awaitingProjectCount = new Set(awaitingTasks.map((t) => t.projectId)).size;

  const overdueProjectCount = new Set(overdueTasks.map((t) => t.projectId)).size;
  const oldestOverdueDays = overdueTasks.length > 0 ? overdueTasks[0].daysOverdue : 0;

  const scrollToAwaiting = () => {
    const el = document.getElementById('awaiting-approval-heading');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
          {/* Four summary cards: Overdue, Due this week, Blocked, Awaiting approval */}
          <section
            aria-label="Summary metrics"
            className="grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-4"
          >
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

            <button
              type="button"
              onClick={scrollToAwaiting}
              className="rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[16px] text-left hover:border-[#2B59C3] transition-colors"
            >
              <p className="text-[12px] font-medium leading-[16px] text-[#57606A]">
                Awaiting approval
              </p>
              <p className="mt-[8px] text-[28px] font-semibold leading-[36px] tabular-nums text-[#1B1F24]">
                {awaitingTasks.length}
              </p>
              <p className="mt-[4px] text-[12px] leading-[16px] text-[#57606A] tabular-nums">
                {awaitingTasks.length > 0
                  ? `across ${awaitingProjectCount} ${awaitingProjectCount === 1 ? 'project' : 'projects'}`
                  : 'Nothing waiting for review'}
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

          {/* Awaiting approval list */}
          <section aria-labelledby="awaiting-approval-heading" className="space-y-[12px]">
            <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
              <h2
                id="awaiting-approval-heading"
                className="text-[18px] font-semibold leading-[24px] text-[#1B1F24]"
              >
                Awaiting approval
              </h2>
              {awaitingTasks.length > 0 && (
                <p className="text-[12px] font-medium text-[#57606A] tabular-nums">
                  {awaitingTasks.length} {awaitingTasks.length === 1 ? 'task' : 'tasks'} marked done · ready for review
                </p>
              )}
            </div>

            {awaitingTasks.length === 0 ? (
              <EmptyState message="No tasks awaiting approval." />
            ) : (
              <div className="overflow-x-auto rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF]">
                <table
                  aria-label="Tasks awaiting approval"
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
                        Owner
                      </th>
                      <th
                        scope="col"
                        className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
                      >
                        Due date
                      </th>
                      <th
                        scope="col"
                        className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-[16px] text-right text-[12px] font-medium text-[#57606A] whitespace-nowrap"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {awaitingTasks.map((task) => {
                      const isSelected = task.id === selectedTaskId;
                      const dueDisplay = formatDueDateDisplay(
                        task.dueDate,
                        task.diffDays,
                        true,
                        false
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
                          <td className="px-[16px] text-[14px] font-medium text-[#1B1F24] max-w-[280px] truncate">
                            {task.title}
                          </td>
                          <td className="px-[16px] text-[14px] text-[#57606A] max-w-[200px] truncate">
                            {task.project.name}
                          </td>
                          <td className="px-[16px] whitespace-nowrap">
                            <OwnerAvatar owner={task.owner} />
                          </td>
                          <td className="px-[16px] text-[14px] tabular-nums text-[#57606A] whitespace-nowrap">
                            {dueDisplay.text}
                          </td>
                          <td className="px-[16px] whitespace-nowrap">
                            <StatusBadge status={task.status} />
                          </td>
                          <td
                            className="px-[16px] text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center justify-end gap-[8px]">
                              <button
                                type="button"
                                onClick={() => onApproveTask(task.id)}
                                className="inline-flex min-h-[32px] items-center justify-center rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[12px] py-[4px] text-[12px] font-medium text-[#2B59C3] hover:bg-[#2B59C3]/5 transition-colors whitespace-nowrap"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => onRequestReturn(task)}
                                className="inline-flex min-h-[32px] items-center justify-center rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[12px] py-[4px] text-[12px] font-medium text-[#1B1F24] hover:bg-[#F6F8FA] transition-colors whitespace-nowrap"
                              >
                                Return
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
