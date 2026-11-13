import { Search } from 'lucide-react';
import {
  DerivedTask,
  DueDateSort,
  Owner,
  Project,
  TaskFilters,
  TaskStatus,
} from '../types/dashboard';
import { EmptyState, ErrorState, TableSkeleton } from './States';
import { TaskTable } from './TaskTable';

interface TasksPageProps {
  tasks: DerivedTask[];
  owners: Owner[];
  projects: Project[];
  filters: TaskFilters;
  onFiltersChange: (next: TaskFilters) => void;
  dueDateSort: DueDateSort;
  onToggleDueDateSort: () => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

const STATUS_OPTIONS: TaskStatus[] = [
  'Overdue',
  'Due soon',
  'On track',
  'Blocked',
  'Done',
];

export function TasksPage({
  tasks,
  owners,
  projects,
  filters,
  onFiltersChange,
  dueDateSort,
  onToggleDueDateSort,
  isLoading,
  error,
  onRetry,
  selectedTaskId,
  onSelectTask,
}: TasksPageProps) {
  const sortedProjects = [...projects].sort((a, b) => a.name.localeCompare(b.name));

  const searchLower = filters.search.trim().toLowerCase();
  const filteredTasks = tasks
    .filter((task) => {
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.ownerId !== 'all' && task.ownerId !== filters.ownerId) return false;
      if (filters.projectId !== 'all' && task.projectId !== filters.projectId) return false;
      if (searchLower) {
        const matchesTitle = task.title.toLowerCase().includes(searchLower);
        const matchesProject = task.project.name.toLowerCase().includes(searchLower);
        const matchesOwner = task.owner.name.toLowerCase().includes(searchLower);
        if (!matchesTitle && !matchesProject && !matchesOwner) return false;
      }
      return true;
    })
    .sort((a, b) => {
      const cmp = a.dueDate.localeCompare(b.dueDate);
      if (cmp !== 0) return dueDateSort === 'asc' ? cmp : -cmp;
      return a.title.localeCompare(b.title);
    });

  const activeFilterCount =
    (filters.search.trim() ? 1 : 0) +
    (filters.status !== 'all' ? 1 : 0) +
    (filters.ownerId !== 'all' ? 1 : 0) +
    (filters.projectId !== 'all' ? 1 : 0);

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      ownerId: 'all',
      projectId: 'all',
    });
  };

  return (
    <div className="space-y-[16px]">
      <div className="flex flex-wrap items-baseline justify-between gap-[8px]">
        <h1 className="text-[24px] font-semibold leading-[32px] text-[#1B1F24]">
          Tasks
        </h1>
        {!isLoading && !error && (
          <p className="text-[12px] font-medium text-[#57606A] tabular-nums">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
        )}
      </div>

      {/* Filter bar: one row above table (search, status, owner, project, Clear filters) */}
      <div
        role="search"
        aria-label="Filter tasks"
        className="flex flex-wrap items-center gap-[8px] rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[12px]"
      >
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute left-[12px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#57606A]"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Search tasks"
            placeholder="Search tasks, projects, or owners"
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className={`min-h-[36px] w-full rounded-[6px] border bg-[#FFFFFF] pl-[32px] pr-[12px] py-[4px] text-[14px] text-[#1B1F24] placeholder:text-[#57606A] ${
              filters.search.trim()
                ? 'border-[#2B59C3] bg-[#2B59C3]/[0.03]'
                : 'border-[#D0D7DE]'
            }`}
          />
        </div>

        <select
          aria-label="Filter by status"
          value={filters.status}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              status: e.target.value as TaskStatus | 'all',
            })
          }
          className={`min-h-[36px] rounded-[6px] border px-[8px] py-[4px] text-[14px] text-[#1B1F24] ${
            filters.status !== 'all'
              ? 'border-[#2B59C3] bg-[#2B59C3]/10 font-medium text-[#2B59C3]'
              : 'border-[#D0D7DE] bg-[#FFFFFF]'
          }`}
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by owner"
          value={filters.ownerId}
          onChange={(e) =>
            onFiltersChange({ ...filters, ownerId: e.target.value })
          }
          className={`min-h-[36px] rounded-[6px] border px-[8px] py-[4px] text-[14px] text-[#1B1F24] ${
            filters.ownerId !== 'all'
              ? 'border-[#2B59C3] bg-[#2B59C3]/10 font-medium text-[#2B59C3]'
              : 'border-[#D0D7DE] bg-[#FFFFFF]'
          }`}
        >
          <option value="all">All owners</option>
          {owners.map((owner) => (
            <option key={owner.id} value={owner.id}>
              {owner.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by project"
          value={filters.projectId}
          onChange={(e) =>
            onFiltersChange({ ...filters, projectId: e.target.value })
          }
          className={`min-h-[36px] max-w-[220px] rounded-[6px] border px-[8px] py-[4px] text-[14px] text-[#1B1F24] ${
            filters.projectId !== 'all'
              ? 'border-[#2B59C3] bg-[#2B59C3]/10 font-medium text-[#2B59C3]'
              : 'border-[#D0D7DE] bg-[#FFFFFF]'
          }`}
        >
          <option value="all">All projects</option>
          {sortedProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleClearFilters}
          disabled={activeFilterCount === 0}
          className={`inline-flex min-h-[36px] items-center justify-center rounded-[6px] border px-[12px] py-[4px] text-[14px] font-medium transition-colors whitespace-nowrap ${
            activeFilterCount > 0
              ? 'border-[#D0D7DE] bg-[#FFFFFF] text-[#1B1F24] hover:bg-[#F6F8FA]'
              : 'border-[#D0D7DE] bg-[#F6F8FA] text-[#57606A] opacity-60 cursor-not-allowed'
          }`}
        >
          Clear filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={12} />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : tasks.length === 0 ? (
        <EmptyState message="No tasks found." />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          message="No tasks match your current filters. Clear filters to see all tasks."
          actionLabel="Clear filters"
          onAction={handleClearFilters}
        />
      ) : (
        <TaskTable
          tasks={filteredTasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={onSelectTask}
          dueDateSort={dueDateSort}
          onToggleDueDateSort={onToggleDueDateSort}
          ariaLabel="All tasks"
        />
      )}
    </div>
  );
}
