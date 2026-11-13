import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B1F24]/40 p-[16px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[420px] rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[24px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="text-[18px] font-semibold leading-[24px] text-[#1B1F24]"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-desc"
          className="mt-[8px] text-[14px] leading-[20px] text-[#57606A]"
        >
          {description}
        </p>
        <div className="mt-[24px] flex items-center justify-end gap-[12px]">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="inline-flex min-h-[36px] items-center justify-center rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[16px] py-[8px] text-[14px] font-medium text-[#1B1F24] hover:bg-[#F6F8FA] transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-[36px] items-center justify-center rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[16px] py-[8px] text-[14px] font-medium text-[#B42318] hover:bg-[#FDECEC] transition-colors whitespace-nowrap"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
