interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-start justify-center gap-[12px] rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[24px]"
    >
      <p className="text-[14px] text-[#57606A]">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex min-h-[32px] items-center justify-center rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[12px] py-[4px] text-[14px] font-medium text-[#1B1F24] hover:bg-[#F6F8FA] transition-colors whitespace-nowrap"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start justify-center gap-[12px] rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[24px]"
    >
      <p className="text-[14px] text-[#1B1F24]">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-[32px] items-center justify-center rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] px-[12px] py-[4px] text-[14px] font-medium text-[#1B1F24] hover:bg-[#F6F8FA] transition-colors whitespace-nowrap"
      >
        Try again
      </button>
    </div>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div
      aria-label="Loading summary"
      className="grid grid-cols-1 gap-[16px] sm:grid-cols-3"
    >
      {[0, 1, 2].map((idx) => (
        <div
          key={idx}
          className="rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF] p-[16px]"
        >
          <div className="h-[16px] w-[96px] rounded-[4px] bg-[#EEF1F4] animate-pulse" />
          <div className="mt-[12px] h-[32px] w-[64px] rounded-[4px] bg-[#EEF1F4] animate-pulse" />
          <div className="mt-[12px] h-[16px] w-[160px] rounded-[4px] bg-[#EEF1F4] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
}

export function TableSkeleton({ rows = 8 }: TableSkeletonProps) {
  return (
    <div
      aria-label="Loading table"
      className="overflow-hidden rounded-[8px] border border-[#D0D7DE] bg-[#FFFFFF]"
    >
      <div className="flex h-[44px] items-center gap-[16px] border-b border-[#D0D7DE] bg-[#F6F8FA] px-[16px]">
        <div className="h-[12px] w-[140px] rounded-[4px] bg-[#D0D7DE]/60 animate-pulse" />
        <div className="h-[12px] w-[120px] rounded-[4px] bg-[#D0D7DE]/60 animate-pulse" />
        <div className="hidden sm:block h-[12px] w-[100px] rounded-[4px] bg-[#D0D7DE]/60 animate-pulse" />
        <div className="ml-auto h-[12px] w-[80px] rounded-[4px] bg-[#D0D7DE]/60 animate-pulse" />
      </div>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="flex h-[44px] items-center gap-[16px] border-b border-[#D0D7DE] last:border-b-0 px-[16px]"
        >
          <div className="h-[16px] w-[220px] rounded-[4px] bg-[#EEF1F4] animate-pulse" />
          <div className="hidden md:block h-[16px] w-[140px] rounded-[4px] bg-[#EEF1F4] animate-pulse" />
          <div className="hidden sm:block h-[16px] w-[110px] rounded-[4px] bg-[#EEF1F4] animate-pulse" />
          <div className="ml-auto h-[24px] w-[72px] rounded-full bg-[#EEF1F4] animate-pulse" />
        </div>
      ))}
    </div>
  );
}
