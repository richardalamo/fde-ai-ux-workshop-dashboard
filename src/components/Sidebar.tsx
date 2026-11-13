import { useEffect, useState } from 'react';
import { FolderKanban, LayoutDashboard, ListTodo, Menu, X } from 'lucide-react';
import { NavPage } from '../types/dashboard';

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  overdueCount: number;
}

const NAV_ITEMS: { id: NavPage; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
];

export function Sidebar({ activePage, onNavigate, overdueCount }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const handleSelect = (page: NavPage) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  const renderNavLinks = () => (
    <nav aria-label="Main navigation" className="flex flex-col gap-[4px] p-[12px]">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activePage === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleSelect(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex min-h-[36px] w-full items-center justify-between rounded-[6px] px-[12px] py-[8px] text-[14px] transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-[#2B59C3]/10 font-semibold text-[#2B59C3]'
                : 'font-medium text-[#1B1F24] hover:bg-[#F6F8FA]'
            }`}
          >
            <span className="flex items-center gap-[8px]">
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? 'text-[#2B59C3]' : 'text-[#57606A]'
                }`}
                aria-hidden="true"
              />
              <span>{item.label}</span>
            </span>
            {item.id === 'overview' && overdueCount > 0 && (
              <span
                aria-label={`${overdueCount} overdue`}
                className="tabular-nums text-[12px] font-medium text-[#B42318]"
              >
                {overdueCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar (< 768 px) */}
      <header className="flex h-[56px] items-center justify-between border-b border-[#D0D7DE] bg-[#FFFFFF] px-[16px] md:hidden">
        <span className="text-[16px] font-semibold text-[#1B1F24] whitespace-nowrap">
          Project tracker
        </span>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileOpen}
          title="Open menu"
          className="inline-flex h-[36px] w-[36px] items-center justify-center rounded-[6px] border border-[#D0D7DE] bg-[#FFFFFF] text-[#1B1F24] hover:bg-[#F6F8FA] transition-colors"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="fixed inset-0 bg-[#1B1F24]/30"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex w-[220px] flex-col border-r border-[#D0D7DE] bg-[#FFFFFF]">
            <div className="flex h-[56px] items-center justify-between border-b border-[#D0D7DE] px-[16px]">
              <span className="text-[16px] font-semibold text-[#1B1F24]">
                Project tracker
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                title="Close menu"
                className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[6px] text-[#57606A] hover:bg-[#F6F8FA] hover:text-[#1B1F24] transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            {renderNavLinks()}
          </aside>
        </div>
      )}

      {/* Desktop left navigation bar (220 px) */}
      <aside className="hidden md:flex md:w-[220px] md:shrink-0 md:flex-col md:border-r md:border-[#D0D7DE] md:bg-[#FFFFFF]">
        <div className="flex h-[56px] items-center border-b border-[#D0D7DE] px-[16px]">
          <span className="text-[16px] font-semibold text-[#1B1F24] whitespace-nowrap">
            Project tracker
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">{renderNavLinks()}</div>
      </aside>
    </>
  );
}
