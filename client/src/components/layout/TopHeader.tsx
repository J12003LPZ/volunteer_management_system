import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function TopHeader() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const initials = (user?.email ?? 'A').slice(0, 2).toUpperCase();
  return (
    <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-container-padding">
      <div className="relative max-w-md w-full">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
        <input
          type="search"
          placeholder="Search volunteers, events..."
          className="w-full h-10 pl-10 pr-3 rounded-md bg-surface-container-low border border-outline-variant text-sm focus:outline-none focus:border-primary"
        />
      </div>
      <div className="flex items-center gap-3">
        <button className="h-10 w-10 grid place-items-center rounded-full hover:bg-surface-container-low" aria-label="Notifications">
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2">
              <Avatar><AvatarFallback>{initials}</AvatarFallback></Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => { logout(); navigate('/login'); }}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
