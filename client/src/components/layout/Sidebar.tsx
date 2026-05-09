import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/volunteers', icon: 'groups', label: 'Volunteers' },
  { to: '/events', icon: 'event', label: 'Events' },
  { to: '/shifts', icon: 'schedule', label: 'Shifts' },
  { to: '/attendance', icon: 'how_to_reg', label: 'Attendance' },
  { to: '/reports', icon: 'insights', label: 'Reports' },
  { to: '/messages', icon: 'forum', label: 'Messages' },
  { to: '/settings', icon: 'settings', label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-sidebar-width shrink-0 bg-surface-container-lowest border-r border-outline-variant flex flex-col">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-outline-variant">
        <span className="material-symbols-outlined text-primary text-3xl">volunteer_activism</span>
        <span className="font-bold text-lg text-on-surface">VolunteerHub</span>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium relative transition',
                isActive
                  ? 'bg-surface-container-low text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full" />}
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
