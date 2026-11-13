import { Owner } from '../types/dashboard';

interface OwnerAvatarProps {
  owner: Owner;
}

export function OwnerAvatar({ owner }: OwnerAvatarProps) {
  return (
    <div className="inline-flex items-center gap-[8px] min-w-0">
      <span
        aria-hidden="true"
        className="inline-flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#EEF1F4] border border-[#D0D7DE] text-[12px] font-medium text-[#1B1F24]"
      >
        {owner.initials}
      </span>
      <span className="truncate text-[14px] text-[#1B1F24]">{owner.name}</span>
    </div>
  );
}
