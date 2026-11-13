import { ArrowDown, ArrowUp } from 'lucide-react';
import {
  DerivedTask,
  Owner,
  Project,
  ProjectSortField,
  ProjectSummary,
} from '../types/dashboard';
import { OwnerAvatar } from './OwnerAvatar';
import { getProjectStatus } from './ProjectSummaryPage';
import { EmptyState, ErrorState, TableSkeleton } from './States';
import { ProjectStatusBadge } from './StatusBadge';

interface ProjectsPageProps {
  projects: Project[];
  owners: Owner[];
  tasks: DerivedTask[];
  sortField: ProjectSortField;
  sortDir: 'asc' | 'desc';
  onToggleSort: (field: ProjectSortField) => void;
  onSelectProject: (projectId: string) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function ProjectsPage({
  projects,
  owners,
  tasks,
  sortField,
  sortDir,
  onToggleSort,
  onSelectProject,
  isLoading,
  error,
  onRetry,
}: ProjectsPageProps) {
  const ownerMap = new Map(owners.map((o) => [o.id, o]));

  const summaries: ProjectSummary[] = projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const doneCount = projectTasks.filter((t) => t.status === 'Done').length;
    const openCount = projectTasks.filter((t) => t.status !== 'Done').length;
    const overdueCount = projectTasks.filter((t) => t.status === 'Overdue').length;
    const blockedCount = projectTasks.filter((t) => t.status === 'Blocked').length;

    return {
      project,
      lead: ownerMap.get(project.leadId) ?? owners[0],
      doneCount,
      openCount,
      overdueCount,
      blockedCount,
      totalCount: projectTasks.length,
    };
  });

  const sortedSummaries = [...summaries].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'name') {
      cmp = a.project.name.localeCompare(b.project.name);
    } else if (sortField === 'overdue') {
      cmp = a.overdueCount - b.overdueCount;
    } else if (sortField === 'open') {
      cmp = a.openCount - b.openCount;
    } else if (sortField === 'done') {
      cmp = a.doneCount - b.doneCount;
    }
    if (cmp === 0) {
      return a.project.name.localeCompare(b.project.name);
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const renderSortHeader = (
    field: ProjectSortField,
    label: string,
    alignRight = false
  ) => {
    const active = sortField === field;
    return (
      <th
        scope="col"
        aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={`px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap ${
          alignRight ? 'text-right' : 'text-left'
        }`}
      >
        <button
          type="button"
          onClick={() => onToggleSort(field)}
          className={`inline-flex min-h-[32px] items-center gap-[4px] rounded-[6px] px-[4px] text-[12px] font-medium transition-colors whitespace-nowrap hover:bg-[#EEF1F4] ${
            alignRight ? '-mr-[4px]' : '-ml-[4px]'
          } ${active ? 'text-[#1B1F24]' : 'text-[#57606A]'}`}
        >
          <span>{label}</span>
          {active &&
            (sortDir === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5 text-[#2B59C3]" aria-hidden="true" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 text-[#2B59C3]" aria-hidden="true" />
            ))}
        </button>
      </th>
    );
  };

  return (
    <div className="space-y-[16px]">
      <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
        <h1 className="text-[24px] font-semibold leading-[32px] text-[#1B1F24]">
          Projects
        </h1>
        {!isLoading && !error && (
          <p className="text-[12px] font-medium text-[#57606A] tabular-nums">
            {projects.length} active client projects · select a project to view its summary
          </p>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton rows={12} />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : sortedSummaries.length === 0 ? (
        <EmptyState message="No projects found." />
      ) : (
        <div className="overflow-x-auto rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF]">
          <table aria-label="Projects" className="w-full border-collapse text-left">
            <thead>
              <tr className="h-[44px] border-b border-[#D0D7DE] bg-[#F6F8FA]">
                {renderSortHeader('name', 'Project')}
                <th
                  scope="col"
                  className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
                >
                  Client
                </th>
                <th
                  scope="col"
                  className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
                >
                  Lead
                </th>
                {renderSortHeader('open', 'Open', true)}
                {renderSortHeader('overdue', 'Overdue', true)}
                {renderSortHeader('done', 'Done', true)}
                <th
                  scope="col"
                  className="px-[16px] text-[12px] font-medium text-[#57606A] whitespace-nowrap"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedSummaries.map((item) => {
                const projectTasks = tasks.filter((t) => t.projectId === item.project.id);
                const projectStatus = getProjectStatus(projectTasks);

                return (
                  <tr
                    key={item.project.id}
                    tabIndex={0}
                    onClick={() => onSelectProject(item.project.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectProject(item.project.id);
                      }
                    }}
                    className="h-[44px] cursor-pointer border-b border-[#D0D7DE] last:border-b-0 hover:bg-[#F6F8FA] transition-colors"
                  >
                    <td className="px-[16px] text-[14px] font-medium text-[#1B1F24] whitespace-nowrap">
                      {item.project.name}
                    </td>
                    <td className="px-[16px] text-[14px] text-[#57606A] whitespace-nowrap">
                      {item.project.client}
                    </td>
                    <td className="px-[16px] whitespace-nowrap">
                      <OwnerAvatar owner={item.lead} />
                    </td>
                    <td className="px-[16px] text-right text-[14px] tabular-nums text-[#1B1F24] whitespace-nowrap">
                      {item.openCount}
                    </td>
                    <td
                      className={`px-[16px] text-right text-[14px] tabular-nums whitespace-nowrap ${
                        item.overdueCount > 0
                          ? 'font-semibold text-[#B42318]'
                          : 'text-[#57606A]'
                      }`}
                    >
                      {item.overdueCount}
                    </td>
                    <td className="px-[16px] text-right text-[14px] tabular-nums text-[#57606A] whitespace-nowrap">
                      {item.doneCount}
                    </td>
                    <td className="px-[16px] whitespace-nowrap">
                      <ProjectStatusBadge status={projectStatus} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
