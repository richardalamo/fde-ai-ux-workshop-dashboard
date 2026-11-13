import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { DerivedTask, Owner, Task, TaskManualState } from '../types/dashboard';
import { computeTaskStatus } from '../data/sampleData';
import { formatFullDate, formatOverdueDays, getDiffDays, getTodayString } from '../utils/dates';
import { ConfirmDialog } from './ConfirmDialog';
import { StatusBadge } from './StatusBadge';

interface TaskDetailPanelProps {
  task: DerivedTask | null;
  owners: Owner[];
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>, toastMessage: string) => void;
  onDeleteTask: (taskId: string) => void;
  onApproveTask: (taskId: string) => void;
  onRequestReturn: (task: DerivedTask) => void;
  isReturnDialogOpen: boolean;
}

export function TaskDetailPanel({
  task,
  owners,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onApproveTask,
  onRequestReturn,
  isReturnDialogOpen,
}: TaskDetailPanelProps) {
  const [title, setTitle] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [manualState, setManualState] = useState<TaskManualState>('active');
  const [blockerReason, setBlockerReason] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setOwnerId(task.ownerId);
    setDueDate(task.dueDate);
    setManualState(task.manualState);
    setBlockerReason(task.blockerReason ?? '');
    setNotes(task.notes);
    setConfirmDeleteOpen(false);
  }, [task]);

  useEffect(() => {
    if (!task) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !confirmDeleteOpen && !isReturnDialogOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [task, confirmDeleteOpen, isReturnDialogOpen, onClose]);

  if (!task) return null;

  const todayStr = getTodayString();
  const previewDiffDays = dueDate ? getDiffDays(dueDate, todayStr) : task.diffDays;
  const previewStatus = computeTaskStatus(manualState, previewDiffDays);

  const isDirty =
    title.trim() !== task.title ||
    ownerId !== task.ownerId ||
    dueDate !== task.dueDate ||
    manualState !== task.manualState ||
    (manualState === 'blocked' ? blockerReason.trim() : '') !==
      (task.manualState === 'blocked' ? (task.blockerReason ?? '').trim() : '') ||
    notes.trim() !== task.notes.trim();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const transitioningToDone = task.manualState !== 'done' && manualState === 'done';
    const leavingDone = task.manualState === 'done' && manualState !== 'done';

    const nextApprovalStatus = transitioningToDone
      ? 'awaiting'
      : leavingDone
        ? 'none'
        : task.approvalStatus;

    onUpdateTask(
      task.id,
      {
        title: title.trim(),
        ownerId,
        dueDate,
        manualState,
        approvalStatus: nextApprovalStatus,
        returnReason: transitioningToDone ? undefined : task.returnReason,
        blockerReason: manualState === 'blocked' ? blockerReason.trim() : undefined,
        notes: notes.trim(),
        updatedAt: todayStr,
      },
      transitioningToDone ? 'Marked done · waiting for approval' : 'Task updated'
    );
  };

  const handleQuickDoneToggle = () => {
    const nextState: TaskManualState = task.manualState === 'done' ? 'active' : 'done';
    setManualState(nextState);
    onUpdateTask(
      task.id,
      {
        manualState: nextState,
        approvalStatus: nextState === 'done' ? 'awaiting' : 'none',
        returnReason: nextState === 'done' ? undefined : task.returnReason,
        updatedAt: todayStr,
      },
      nextState === 'done' ? 'Marked done · waiting for approval' : 'Task reopened'
    );
  };

  const isDone = task.manualState === 'done';
  const isAwaitingApproval = isDone && task.approvalStatus === 'awaiting';
  const isApproved = isDone && task.approvalStatus === 'approved';

  return (
    <>
      <div
        className="fixed inset-0 z-40 flex justify-end bg-[#1B1F24]/25"
        role="dialog"
        aria-modal="true"
        aria-label="Task details"
        onClick={onClose}
      >
        <aside
          className="flex h-full w-full sm:w-[420px] flex-col border-l border-[#D0D7DE] bg-[#FFFFFF] shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#D0D7DE] px-[24px] py-[16px]">
            <div className="flex items-center gap-[8px]">
              <StatusBadge status={previewStatus} />
              {previewStatus === 'Overdue' && (
                <span className="text-[12px] font-medium text-[#B42318] tabular-nums">
                  {formatOverdueDays(Math.abs(previewDiffDays))}
                </span>
              )}
              {isAwaitingApproval && manualState === 'done' && (
                <span className="text-[12px] font-medium text-[#57606A]">
                  Awaiting approval
                </span>
              )}
              {isApproved && manualState === 'done' && (
                <span className="text-[12px] font-medium text-[#57606A]">
                  Approved
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              title="Close (Esc)"
              className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[#57606A] hover:bg-[#F6F8FA] hover:text-[#1B1F24] transition-colors"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Form body */}
          <form onSubmit={handleSave} className="flex flex-1 flex-col overflow-y-auto">
            <div className="flex-1 space-y-[16px] p-[24px]">
              <div>
                <p className="text-[12px] font-medium text-[#57606A]">
                  {task.project.name} · {task.project.client}
                </p>
                <label htmlFor="task-title" className="sr-only">
                  Task title
                </label>
                <input
                  id="task-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-[8px] w-full rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[12px] py-[8px] text-[16px] font-semibold text-[#1B1F24]"
                />
              </div>

              {task.returnReason && (
                <div className="rounded-[6px] border border-[#D0D7DE] bg-[#F6F8FA] p-[12px]">
                  <p className="text-[12px] font-medium text-[#57606A]">
                    Returned for revision
                  </p>
                  <p className="mt-[4px] text-[14px] leading-[20px] text-[#1B1F24]">
                    {task.returnReason}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="task-owner"
                    className="block text-[12px] font-medium text-[#57606A]"
                  >
                    Owner
                  </label>
                  <select
                    id="task-owner"
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    className="mt-[4px] min-h-[36px] w-full rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[8px] py-[4px] text-[14px] text-[#1B1F24]"
                  >
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="task-due-date"
                    className="block text-[12px] font-medium text-[#57606A]"
                  >
                    Due date
                  </label>
                  <input
                    id="task-due-date"
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-[4px] min-h-[36px] w-full rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[8px] py-[4px] text-[14px] tabular-nums text-[#1B1F24]"
                  />
                </div>
              </div>

              <div>
                <span className="block text-[12px] font-medium text-[#57606A]">
                  Workflow state
                </span>
                <div className="mt-[4px] grid grid-cols-3 gap-[8px]">
                  {(
                    [
                      { value: 'active', label: 'In progress' },
                      { value: 'blocked', label: 'Blocked' },
                      { value: 'done', label: 'Done' },
                    ] as const
                  ).map((option) => {
                    const selected = manualState === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setManualState(option.value)}
                        aria-pressed={selected}
                        className={`min-h-[32px] rounded-[6px] border px-[8px] py-[4px] text-[12px] font-medium transition-colors whitespace-nowrap ${
                          selected
                            ? 'border-[#2B59C3] bg-[#2B59C3]/10 text-[#2B59C3]'
                            : 'border-[#D0D7DE] bg-[#FFFFFF] text-[#1B1F24] hover:bg-[#F6F8FA]'
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-[4px] text-[12px] text-[#57606A]">
                  Tasks marked Done wait for manager approval before closing.
                </p>
              </div>

              {manualState === 'blocked' && (
                <div>
                  <label
                    htmlFor="task-blocker"
                    className="block text-[12px] font-medium text-[#57606A]"
                  >
                    Blocker reason
                  </label>
                  <textarea
                    id="task-blocker"
                    rows={2}
                    value={blockerReason}
                    onChange={(e) => setBlockerReason(e.target.value)}
                    placeholder="What is holding this task up?"
                    className="mt-[4px] w-full rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[12px] py-[8px] text-[14px] text-[#1B1F24] placeholder:text-[#57606A]"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="task-notes"
                  className="block text-[12px] font-medium text-[#57606A]"
                >
                  Notes
                </label>
                <textarea
                  id="task-notes"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add context for the team..."
                  className="mt-[4px] w-full rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[12px] py-[8px] text-[14px] text-[#1B1F24] placeholder:text-[#57606A]"
                />
              </div>

              <div className="border-t border-[#D0D7DE] pt-[12px] text-[12px] text-[#57606A] space-y-[4px]">
                <p>Project lead: {owners.find((o) => o.id === task.project.leadId)?.name}</p>
                <p className="tabular-nums">Last updated: {formatFullDate(task.updatedAt)}</p>
              </div>
            </div>

            {/* Footer actions: at most one primary button per view */}
            <div className="flex items-center justify-between gap-[8px] border-t border-[#D0D7DE] bg-[#F6F8FA] px-[24px] py-[16px]">
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                className="inline-flex min-h-[36px] items-center justify-center rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[12px] py-[8px] text-[14px] font-medium text-[#B42318] hover:bg-[#FDECEC] transition-colors whitespace-nowrap"
              >
                Delete
              </button>

              <div className="flex items-center gap-[8px]">
                {isAwaitingApproval ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onRequestReturn(task)}
                      className="inline-flex min-h-[36px] items-center justify-center rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[12px] py-[8px] text-[14px] font-medium text-[#1B1F24] hover:bg-[#F6F8FA] transition-colors whitespace-nowrap"
                    >
                      Return
                    </button>
                    <button
                      type="button"
                      onClick={() => onApproveTask(task.id)}
                      className={`inline-flex min-h-[36px] items-center justify-center rounded-[6px] px-[12px] py-[8px] text-[14px] font-medium transition-colors whitespace-nowrap ${
                        !isDirty
                          ? 'bg-[#2B59C3] text-[#FFFFFF] hover:bg-[#22479E]'
                          : 'border border-[#D0D7DE] bg-[#FFFFFF] text-[#1B1F24] hover:bg-[#F6F8FA]'
                      }`}
                    >
                      Approve
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleQuickDoneToggle}
                    className={`inline-flex min-h-[36px] items-center justify-center rounded-[6px] px-[12px] py-[8px] text-[14px] font-medium transition-colors whitespace-nowrap ${
                      !isDirty && !isDone
                        ? 'bg-[#2B59C3] text-[#FFFFFF] hover:bg-[#22479E]'
                        : 'border border-[#D0D7DE] bg-[#FFFFFF] text-[#1B1F24] hover:bg-[#F6F8FA]'
                    }`}
                  >
                    {isDone ? 'Reopen' : 'Mark done'}
                  </button>
                )}

                {isDirty && (
                  <button
                    type="submit"
                    className="inline-flex min-h-[36px] items-center justify-center rounded-[6px] bg-[#2B59C3] px-[16px] py-[8px] text-[14px] font-medium text-[#FFFFFF] hover:bg-[#22479E] transition-colors whitespace-nowrap"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </form>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        title="Delete this task?"
        description={`"${task.title}" will be permanently removed from ${task.project.name}. This cannot be undone.`}
        confirmLabel="Delete"
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          onDeleteTask(task.id);
        }}
      />
    </>
  );
}
