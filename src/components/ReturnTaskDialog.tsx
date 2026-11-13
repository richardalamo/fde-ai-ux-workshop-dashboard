import { useEffect, useRef, useState } from 'react';
import { DerivedTask } from '../types/dashboard';

interface ReturnTaskDialogProps {
  task: DerivedTask | null;
  onConfirm: (taskId: string, reason: string) => void;
  onCancel: () => void;
}

export function ReturnTaskDialog({
  task,
  onConfirm,
  onCancel,
}: ReturnTaskDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!task) return;
    setReason('');
    setError(null);
    const frame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [task, onCancel]);

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Enter a reason so the owner knows what to update.');
      textareaRef.current?.focus();
      return;
    }
    onConfirm(task.id, trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B1F24]/40 p-[16px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="return-dialog-title"
      aria-describedby="return-dialog-desc"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[420px] rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[24px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="return-dialog-title"
          className="text-[18px] font-semibold leading-[24px] text-[#1B1F24]"
        >
          Return task to in progress
        </h2>
        <p
          id="return-dialog-desc"
          className="mt-[8px] text-[14px] leading-[20px] text-[#57606A]"
        >
          {task.title} · {task.project.name}
        </p>

        <form onSubmit={handleSubmit} className="mt-[16px] space-y-[16px]">
          <div>
            <label
              htmlFor="return-reason-input"
              className="block text-[12px] font-medium text-[#57606A]"
            >
              Reason for returning
            </label>
            <textarea
              ref={textareaRef}
              id="return-reason-input"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Explain what still needs work..."
              className="mt-[4px] w-full rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[12px] py-[8px] text-[14px] text-[#1B1F24] placeholder:text-[#57606A]"
            />
            {error && (
              <p role="alert" className="mt-[4px] text-[12px] text-[#B42318]">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-[12px]">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex min-h-[36px] items-center justify-center rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[16px] py-[8px] text-[14px] font-medium text-[#1B1F24] hover:bg-[#F6F8FA] transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex min-h-[36px] items-center justify-center rounded-[6px] bg-[#2B59C3] px-[16px] py-[8px] text-[14px] font-medium text-[#FFFFFF] hover:bg-[#22479E] transition-colors whitespace-nowrap"
            >
              Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
