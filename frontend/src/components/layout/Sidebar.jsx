import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Armchair,
  UserPlus,
  Search,
  Sparkles,
  Building2,
  LogOut,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'
import { MANAGER_ROLES } from '../../utils/constants'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: null, group: 'Overview' },
  { to: '/employees', label: 'Employees', icon: Users, roles: null, group: 'Manage' },
  { to: '/projects', label: 'Projects', icon: FolderKanban, roles: null, group: 'Manage' },
  { to: '/seats', label: 'Seat Management', icon: Armchair, roles: MANAGER_ROLES, group: 'Manage' },
  { to: '/seats/availability', label: 'Seat Availability', icon: Armchair, roles: null, group: 'Manage' },
  { to: '/new-joiner', label: 'New Joiner Allocation', icon: UserPlus, roles: MANAGER_ROLES, group: 'Manage' },
  { to: '/search', label: 'Search', icon: Search, roles: null, group: 'Explore' },
  { to: '/assistant', label: 'AI Assistant', icon: Sparkles, roles: null, group: 'Explore' },
]

const GROUP_ORDER = ['Overview', 'Manage', 'Explore']

const ROLE_LABELS = { admin: 'Admin', hr: 'HR', employee: 'Employee' }

export default function Sidebar({ open, onNavigate }) {
  const { role, user, logout } = useAuth()

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))

  const groups = GROUP_ORDER.map((name) => ({
    name,
    items: visibleItems.filter((i) => i.group === name),
  })).filter((g) => g.items.length > 0)

  const initials = (user?.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-40 flex w-[250px] transform flex-col border-r border-ink-300 bg-ink transition-transform lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo lockup */}
      <div className="flex h-[66px] flex-shrink-0 items-center gap-[11px] border-b border-ink-300 px-5">
        <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-brand-600">
          <Building2 className="h-[18px] w-[18px] text-white" />
        </div>
        <div>
          <p className="font-display text-[15px] font-bold leading-tight text-white">Ethara</p>
          <p className="text-[10.5px] tracking-[0.02em] text-surface-400">Seat Allocation</p>
        </div>
      </div>

      {/* Grouped nav */}
      <nav className="flex flex-1 flex-col gap-[3px] overflow-y-auto p-3">
        {groups.map((group) => (
          <div key={group.name} className="flex flex-col gap-[3px]">
            <p className="px-2.5 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#5b5c78]">
              {group.name}
            </p>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-[11px] rounded-[10px] px-[11px] py-[9px] text-[13.5px] font-semibold transition-colors',
                    isActive
                      ? 'bg-brand-600 text-white shadow-nav'
                      : 'text-[#a9aac4] hover:bg-ink-400 hover:text-[#e9e9f5]'
                  )
                }
              >
                <item.icon className="h-[17px] w-[17px]" />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex-shrink-0 border-t border-ink-300 p-3">
        <div className="flex items-center gap-2.5 rounded-[11px] px-2.5 py-2 hover:bg-[#181935]">
          <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] bg-brand-600 text-[13px] font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-white">{user?.name || 'User'}</p>
            <p className="text-[11px] text-surface-400">{ROLE_LABELS[role] || role}</p>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            aria-label="Sign out"
            className="flex rounded-[7px] p-[5px] text-surface-400 hover:bg-ink-400 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
