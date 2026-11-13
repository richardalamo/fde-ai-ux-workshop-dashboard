import { ArrowLeft, Copy } from 'lucide-react';
import { DerivedTask, Owner, Project, ProjectStatus } from '../types/dashboard';
import { formatFullDate, formatOverdueDays, formatShortDate } from '../utils/dates';
import { OwnerAvatar } from './OwnerAvatar';
import { EmptyState, ErrorState, SummaryCardsSkeleton, TableSkeleton } from './States';
import { ProjectStatusBadge } from './StatusBadge';
import { TaskTable } from './TaskTable';

interface ProjectSummaryPageProps {
  project: Project;
  owners: Owner[];
  tasks: DerivedTask[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onBack: () => void;
  onViewAllInTasks: (projectId: string) => void;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onCopySummary: (summaryText: string) => void;
}

export function getProjectStatus(projectTasks: DerivedTask[]): ProjectStatus {
  if (projectTasks.some((t) => t.status === 'Overdue')) {
    return 'Overdue';
  }
  if (projectTasks.some((t) => t.status === 'Due soon' || t.status === 'Blocked')) {
    return 'At risk';
  }
  return 'On track';
}

export function ProjectSummaryPage({
  project,
  owners,
  tasks,
  isLoading,
  error,
  onRetry,
  onBack,
  onViewAllInTasks,
  selectedTaskId,
  onSelectTask,
  onCopySummary,
}: ProjectSummaryPageProps) {
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const lead = owners.find((o) => o.id === project.leadId) ?? owners[0];

  const totalCount = projectTasks.length;
  const doneCount = projectTasks.filter((t) => t.status === 'Done').length;
  const openCount = totalCount - doneCount;
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const projectStatus = getProjectStatus(projectTasks);

  const overdueTasks = projectTasks
    .filter((t) => t.status === 'Overdue')
    .sort((a, b) => a.diffDays - b.diffDays);

  const nextFiveDueTasks = projectTasks
    .filter((t) => t.manualState !== 'done' && t.diffDays >= 0)
    .sort((a, b) => {
      if (a.diffDays !== b.diffDays) return a.diffDays - b.diffDays;
      return a.title.localeCompare(b.title);
    })
    .slice(0, 5);

  const ownerStats = Array.from(
    projectTasks.reduce((map, task) => {
      const existing = map.get(task.ownerId) ?? {
        owner: task.owner,
        open: 0,
        overdue: 0,
        done: 0,
      };
      if (task.status === 'Done') {
        existing.done += 1;
      } else {
        existing.open += 1;
        if (task.status === 'Overdue') {
          existing.overdue += 1;
        }
      }
      map.set(task.ownerId, existing);
      return map;
    }, new Map<string, { owner: Owner; open: number; overdue: number; done: number }>())
  )
    .map(([, stat]) => stat)
    .sort((a, b) => {
      if (a.open !== b.open) return b.open - a.open;
      return a.owner.name.localeCompare(b.owner.name);
    });

  const buildPlainTextSummary = () => {
    const lines: string[] = [
      `${project.name} (${project.client})`,
      `Status: ${projectStatus}`,
      `Lead: ${lead.name}`,
      `Progress: ${doneCount} of ${totalCount} tasks done (${progressPct}%)`,
      '',
      `Overdue tasks (${overdueTasks.length}):`,
    ];

    if (overdueTasks.length === 0) {
      lines.push('- None');
    } else {
      for (const task of overdueTasks) {
        lines.push(
          `- ${task.title} — ${task.owner.name} (${formatFullDate(task.dueDate)}, ${formatOverdueDays(task.daysOverdue)})`
        );
      }
    }

    lines.push('', `Next due tasks (${nextFiveDueTasks.length}):`);
    if (nextFiveDueTasks.length === 0) {
      lines.push('- None');
    } else {
      for (const task of nextFiveDueTasks) {
        lines.push(
          `- ${task.title} — ${task.owner.name} (Due ${formatShortDate(task.dueDate)}, ${task.status})`
        );
      }
    }

    lines.push(
      '',
      `Owners (${ownerStats.length}): ${ownerStats
        .map((s) => `${s.owner.name} (${s.open} open, ${s.done} done)`)
        .join(', ')}`
    );

    return lines.join('\n');
  };

  return (
    <div className="space-y-[24px]">
      {/* Back navigation + Header */}
      <div className="space-y-[12px]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-[32px] items-center gap-[8px] rounded-[6px] px-[8px] -ml-[8px] text-[14px] font-medium text-[#2B59C3] hover:bg-[#2B59C3]/5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Back to projects</span>
        </button>

        <div className="flex flex-wrap items-start justify-between gap-[16px]">
          <div className="space-y-[8px]">
            <div className="flex flex-wrap items-center gap-[12px]">
              <h1 className="text-[24px] font-semibold leading-[32px] text-[#1B1F24]">
                {project.name}
              </h1>
              <ProjectStatusBadge status={projectStatus} />
            </div>
            <p className="text-[14px] text-[#57606A]">
              {project.client} · Project lead: {lead.name}
            </p>
            <p className="text-[12px] text-[#57606A]">
              Status rule: Overdue if any task is overdue; At risk if any task is due soon or blocked; otherwise On track.
            </p>
          </div>

          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => onViewAllInTasks(project.id)}
              className="inline-flex min-h-[36px] items-center justify-center rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[12px] py-[8px] text-[14px] font-medium text-[#1B1F24] hover:bg-[#F6F8FA] transition-colors whitespace-nowrap"
            >
              View all tasks
            </button>
            <button
              type="button"
              onClick={() => onCopySummary(buildPlainTextSummary())}
              className="inline-flex min-h-[36px] items-center justify-center gap-[8px] rounded-[6px] bg-[#2B59C3] px-[16px] py-[8px] text-[14px] font-medium text-[#FFFFFF] hover:bg-[#22479E] transition-colors whitespace-nowrap"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              <span>Copy summary</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <>
          <SummaryCardsSkeleton />
          <TableSkeleton rows={5} />
        </>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : (
        <>
          {/* Summary metrics: Progress, Overdue tasks, Owners */}
          <section
            aria-label="Project metrics"
            className="grid grid-cols-1 gap-[16px] sm:grid-cols-3"
          >
            <div className="rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[16px]">
              <p className="text-[12px] font-medium leading-[16px] text-[#57606A]">
                Progress
              </p>
              <p className="mt-[8px] text-[28px] font-semibold leading-[36px] tabular-nums text-[#1B1F24]">
                {doneCount} / {totalCount}
              </p>
              <p className="mt-[4px] text-[12px] leading-[16px] text-[#57606A] tabular-nums">
                {progressPct}% complete · {openCount} open
              </p>
              <div
                aria-hidden="true"
                className="mt-[8px] h-[4px] w-full overflow-hidden rounded-full bg-[#EEF1F4]"
              >
                <div
                  className="h-full rounded-full bg-[#2B59C3]"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[16px]">
              <p className="text-[12px] font-medium leading-[16px] text-[#57606A]">
                Overdue tasks
              </p>
              <p className="mt-[8px] text-[28px] font-semibold leading-[36px] tabular-nums text-[#1B1F24]">
                {overdueTasks.length}
              </p>
              <p className="mt-[4px] text-[12px] leading-[16px] text-[#57606A] tabular-nums">
                {overdueTasks.length > 0
                  ? `oldest ${formatOverdueDays(overdueTasks[0].daysOverdue)}`
                  : 'No overdue tasks'}
              </p>
            </div>

            <div className="rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[16px]">
              <p className="text-[12px] font-medium leading-[16px] text-[#57606A]">
                Owners
              </p>
              <p className="mt-[8px] text-[28px] font-semibold leading-[36px] tabular-nums text-[#1B1F24]">
                {ownerStats.length}
              </p>
              <p className="mt-[4px] truncate text-[12px] leading-[16px] text-[#57606A]">
                {ownerStats.length > 0
                  ? ownerStats.map((s) => s.owner.name).join(', ')
                  : 'No assigned owners'}
              </p>
            </div>
          </section>

          {/* Owners breakdown */}
          <section aria-labelledby="project-owners-heading" className="space-y-[12px]">
            <h2
              id="project-owners-heading"
              className="text-[18px] font-semibold leading-[24px] text-[#1B1F24]"
            >
              Owners
            </h2>
            {ownerStats.length === 0 ? (
              <EmptyState message="No owners are assigned to tasks on this project yet." />
            ) : (
              <div className="overflow-x-auto rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF]">
                <table aria-label="Project owners" className="w-full border-collapse text-left">
                  <thead>
                    <tr className="h-[44px] border-b border-[#D0D7DE] bg-[#F6F8FA]">
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
                        Role
                      </th>
                      <th
                        scope="col"
                        className="px-[16px] text-right text-[12px] font-medium text-[#57606A] whitespace-nowrap"
                      >
                        Open
                      </th>
                      <th
                        scope="col"
                        className="px-[16px] text-right text-[12px] font-medium text-[#57606A] whitespace-nowrap"
                      >
                        Overdue
                      </th>
                      <th
                        scope="col"
                        className="px-[16px] text-right text-[12px] font-medium text-[#57606A] whitespace-nowrap"
                      >
                        Done
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ownerStats.map((stat) => (
                      <tr
                        key={stat.owner.id}
                        className="h-[44px] border-b border-[#D0D7DE] last:border-b-0"
                      >
                        <td className="px-[16px] whitespace-nowrap">
                          <OwnerAvatar owner={stat.owner} />
                        </td>
                        <td className="px-[16px] text-[14px] text-[#57606A] whitespace-nowrap">
                          {stat.owner.role}
                        </td>
                        <td className="px-[16px] text-right text-[14px] tabular-nums text-[#1B1F24] whitespace-nowrap">
                          {stat.open}
                        </td>
                        <td
                          className={`px-[16px] text-right text-[14px] tabular-nums whitespace-nowrap ${
                            stat.overdue > 0
                              ? 'font-semibold text-[#B42318]'
                              : 'text-[#57606A]'
                          }`}
                        >
                          {stat.overdue}
                        </td>
                        <td className="px-[16px] text-right text-[14px] tabular-nums text-[#57606A] whitespace-nowrap">
                          {stat.done}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Overdue tasks */}
          <section aria-labelledby="project-overdue-heading" className="space-y-[12px]">
            <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
              <h2
                id="project-overdue-heading"
                className="text-[18px] font-semibold leading-[24px] text-[#1B1F24]"
              >
                Overdue tasks
              </h2>
              {overdueTasks.length > 0 && (
                <p className="text-[12px] font-medium text-[#57606A] tabular-nums">
                  {overdueTasks.length} {overdueTasks.length === 1 ? 'task' : 'tasks'} · most overdue first
                </p>
              )}
            </div>

            {overdueTasks.length === 0 ? (
              <EmptyState message="No overdue tasks for this project." />
            ) : (
              <TaskTable
                tasks={overdueTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={onSelectTask}
                ariaLabel="Project overdue tasks"
              />
            )}
          </section>

          {/* Next 5 due tasks */}
          <section aria-labelledby="project-next-due-heading" className="space-y-[12px]">
            <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
              <h2
                id="project-next-due-heading"
                className="text-[18px] font-semibold leading-[24px] text-[#1B1F24]"
              >
                Next 5 due tasks
              </h2>
              {nextFiveDueTasks.length > 0 && (
                <p className="text-[12px] font-medium text-[#57606A] tabular-nums">
                  Soonest upcoming deadlines first
                </p>
              )}
            </div>

            {nextFiveDueTasks.length === 0 ? (
              <EmptyState message="No upcoming due tasks for this project." />
            ) : (
              <TaskTable
                tasks={nextFiveDueTasks}
                selectedTaskId={selectedTaskId}
                onSelectTask={onSelectTask}
                ariaLabel="Next 5 due tasks"
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
