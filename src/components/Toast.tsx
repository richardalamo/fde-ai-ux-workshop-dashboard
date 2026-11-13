import { X } from 'lucide-react';
import { ToastItem } from '../types/dashboard';

interface ToastProps {
  toast: ToastItem | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[24px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-[12px] rounded-[8px] bg-[#1B1F24] px-[16px] py-[8px] text-[14px] text-[#FFFFFF] shadow-lg max-w-[calc(100vw-32px)]"
    >
      <span className="truncate">{toast.message}</span>
      {toast.onUndo && (
        <>
          <span aria-hidden="true" className="text-[#57606A]">
            ·
          </span>
          <button
            type="button"
            onClick={() => {
              toast.onUndo?.();
              onDismiss();
            }}
            className="inline-flex min-h-[32px] items-center rounded-[6px] px-[8px] text-[14px] font-medium text-[#93B4FF] hover:text-[#FFFFFF] transition-colors whitespace-nowrap shrink-0"
          >
            {toast.undoLabel ?? 'Undo'}
          </button>
        </>
      )}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        title="Dismiss"
        className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[#D0D7DE] hover:text-[#FFFFFF] transition-colors shrink-0"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
