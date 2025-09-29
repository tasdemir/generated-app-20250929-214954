import { NavLink } from 'react-router-dom';
import { Home, Users, BarChart3, Shield, FilePlus, Search, List, CalendarClock, User } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
const commonLinks = [
  { to: '/app', icon: Home, text: 'Dashboard' },
  { to: '/app/scoreboard', icon: BarChart3, text: 'Skorboard' },
  { to: '/app/profile', icon: User, text: 'Profil' },
];
const adminLinks = [
  { to: '/app/admin/users', icon: Users, text: 'Kullanıcı Listesi' },
  { to: '/app/admin/fields', icon: Shield, text: 'Saha Yönetimi' },
  { to: '/app/matches', icon: List, text: 'Maç Listesi' },
];
const coachLinks = [
  { to: '/app/coach/create-match', icon: FilePlus, text: 'Yeni Maç Oluştur' },
  { to: '/app/matches', icon: List, text: 'Maçlarım' },
  { to: '/app/past-matches', icon: CalendarClock, text: 'Geçmiş Maçlar' },
];
const playerLinks = [
  { to: '/app/player/search-match', icon: Search, text: 'Maç Ara' },
  { to: '/app/matches', icon: List, text: 'Aktif Maçlarım' },
  { to: '/app/past-matches', icon: CalendarClock, text: 'Geçmiş Maçlar' },
];
const NavItem = ({ to, icon: Icon, text }: { to: string; icon: React.ElementType; text: string }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50',
        isActive && 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
      )
    }
  >
    <Icon className="h-4 w-4" />
    {text}
  </NavLink>
);
export function NavLinks() {
  const { user } = useAuthStore();
  let roleLinks = [];
  switch (user?.role) {
    case 'admin':
      roleLinks = adminLinks;
      break;
    case 'coach':
      roleLinks = coachLinks;
      break;
    case 'player':
      roleLinks = playerLinks;
      break;
  }
  return (
    <>
      {commonLinks.map(link => <NavItem key={link.to} {...link} />)}
      {roleLinks.map(link => <NavItem key={link.to} {...link} />)}
    </>
  );
}