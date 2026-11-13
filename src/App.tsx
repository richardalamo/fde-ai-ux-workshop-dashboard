/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OverviewPage } from './components/OverviewPage';
import { ProjectsPage } from './components/ProjectsPage';
import { ReturnTaskDialog } from './components/ReturnTaskDialog';
import { Sidebar } from './components/Sidebar';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import { TasksPage } from './components/TasksPage';
import { Toast } from './components/Toast';
import { deriveTasks, generateInitialTasks, OWNERS, PROJECTS } from './data/sampleData';
import {
  DerivedTask,
  DueDateSort,
  NavPage,
  ProjectSortField,
  Task,
  TaskFilters,
  TaskStatus,
  ToastItem,
} from './types/dashboard';
import { getTodayString } from './utils/dates';

export default function App() {
  const [activePage, setActivePage] = useState<NavPage>('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [returnDialogTask, setReturnDialogTask] = useState<DerivedTask | null>(null);

  // Persistent filter & sort state across page navigation
  const [taskFilters, setTaskFilters] = useState<TaskFilters>({
    search: '',
    status: 'all',
    ownerId: 'all',
    projectId: 'all',
  });
  const [dueDateSort, setDueDateSort] = useState<DueDateSort>('asc');
  const [projectSortField, setProjectSortField] = useState<ProjectSortField>('overdue');
  const [projectSortDir, setProjectSortDir] = useState<'asc' | 'desc'>('desc');

  const [toast, setToast] = useState<ToastItem | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const loadData = useCallback(() => {
    setIsLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      try {
        const generated = generateInitialTasks(getTodayString());
        setTasks(generated);
        setIsLoading(false);
      } catch {
        setError('Could not load project tasks. Check your connection and try again.');
        setIsLoading(false);
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [loadData]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast({
      id: String(Date.now()),
      ...item,
    });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 5000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast(null);
  }, []);

  const todayStr = getTodayString();

  const derivedTasks = useMemo(
    () => deriveTasks(tasks, PROJECTS, OWNERS, todayStr),
    [tasks, todayStr]
  );

  const overdueCount = useMemo(
    () => derivedTasks.filter((t) => t.status === 'Overdue').length,
    [derivedTasks]
  );

  const selectedTask = useMemo(
    () => derivedTasks.find((t) => t.id === selectedTaskId) ?? null,
    [derivedTasks, selectedTaskId]
  );

  const handleUpdateTask = useCallback(
    (taskId: string, updates: Partial<Task>, toastMessage: string) => {
      const previousTask = tasks.find((t) => t.id === taskId);
      if (!previousTask) return;

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
      );

      showToast({
        message: toastMessage,
        undoLabel: 'Undo',
        onUndo: () => {
          setTasks((prev) =>
            prev.map((t) => (t.id === previousTask.id ? previousTask : t))
          );
        },
      });
    },
    [tasks, showToast]
  );

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      setSelectedTaskId((curr) => (curr === taskId ? null : curr));
      showToast({
        message: 'Task deleted',
      });
    },
    [showToast]
  );

  const handleApproveTask = useCallback(
    (taskId: string) => {
      handleUpdateTask(
        taskId,
        {
          manualState: 'done',
          approvalStatus: 'approved',
          returnReason: undefined,
          updatedAt: getTodayString(),
        },
        'Task approved'
      );
    },
    [handleUpdateTask]
  );

  const handleConfirmReturn = useCallback(
    (taskId: string, reason: string) => {
      handleUpdateTask(
        taskId,
        {
          manualState: 'active',
          approvalStatus: 'none',
          returnReason: reason,
          updatedAt: getTodayString(),
        },
        'Task returned'
      );
      setReturnDialogTask(null);
    },
    [handleUpdateTask]
  );

  const handleFilterByStatusFromOverview = useCallback((status: TaskStatus) => {
    setTaskFilters({
      search: '',
      status,
      ownerId: 'all',
      projectId: 'all',
    });
    setActivePage('tasks');
  }, []);

  const handleSelectProject = useCallback((projectId: string) => {
    setTaskFilters((prev) => ({
      ...prev,
      projectId,
    }));
    setActivePage('tasks');
  }, []);

  const handleToggleDueDateSort = useCallback(() => {
    setDueDateSort((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const handleToggleProjectSort = useCallback((field: ProjectSortField) => {
    setProjectSortField((prevField) => {
      if (prevField === field) {
        setProjectSortDir((prevDir) => (prevDir === 'asc' ? 'desc' : 'asc'));
        return prevField;
      }
      setProjectSortDir(field === 'name' ? 'asc' : 'desc');
      return field;
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#F6F8FA] text-[#1B1F24]">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        overdueCount={overdueCount}
      />

      <main className="flex-1 min-w-0 p-[24px]">
        <div className="mx-auto max-w-[1200px]">
          {activePage === 'overview' && (
            <OverviewPage
              tasks={derivedTasks}
              isLoading={isLoading}
              error={error}
              onRetry={loadData}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
              onFilterByStatus={handleFilterByStatusFromOverview}
              onApproveTask={handleApproveTask}
              onRequestReturn={setReturnDialogTask}
            />
          )}

          {activePage === 'projects' && (
            <ProjectsPage
              projects={PROJECTS}
              owners={OWNERS}
              tasks={derivedTasks}
              sortField={projectSortField}
              sortDir={projectSortDir}
              onToggleSort={handleToggleProjectSort}
              onSelectProject={handleSelectProject}
              isLoading={isLoading}
              error={error}
              onRetry={loadData}
            />
          )}

          {activePage === 'tasks' && (
            <TasksPage
              tasks={derivedTasks}
              owners={OWNERS}
              projects={PROJECTS}
              filters={taskFilters}
              onFiltersChange={setTaskFilters}
              dueDateSort={dueDateSort}
              onToggleDueDateSort={handleToggleDueDateSort}
              isLoading={isLoading}
              error={error}
              onRetry={loadData}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
            />
          )}
        </div>
      </main>

      <TaskDetailPanel
        task={selectedTask}
        owners={OWNERS}
        onClose={() => setSelectedTaskId(null)}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onApproveTask={handleApproveTask}
        onRequestReturn={setReturnDialogTask}
        isReturnDialogOpen={returnDialogTask !== null}
      />

      <ReturnTaskDialog
        task={returnDialogTask}
        onConfirm={handleConfirmReturn}
        onCancel={() => setReturnDialogTask(null)}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
