'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard, BookOpen, FileText, ClipboardList,
  Users, GraduationCap, BarChart2, Shield, Settings,
  BookMarked, Bell, Menu, X, LogOut,
} from 'lucide-react'
import type { Session } from 'next-auth'
import type { Role } from '@prisma/client'
import LocaleSwitcher from '@/components/LocaleSwitcher'

type NavItem = {
  href: string
  icon: React.ComponentType<{ className?: string }>
  labelKey: string
}

const NAV: Record<Role, NavItem[]> = {
  STAFF: [
    { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    { href: '/learn', icon: BookOpen, labelKey: 'myCourse' },
    { href: '/submissions/my', icon: FileText, labelKey: 'mySubmissions' },
    { href: '/settings', icon: Settings, labelKey: 'settings' },
    { href: '/guide', icon: BookMarked, labelKey: 'guide' },
  ],
  MANAGER: [
    { href: '/manage/queue', icon: ClipboardList, labelKey: 'queue' },
    { href: '/manage/mentees', icon: Users, labelKey: 'myMentees' },
    { href: '/settings', icon: Settings, labelKey: 'settings' },
    { href: '/guide', icon: BookMarked, labelKey: 'guide' },
  ],
  ADMIN: [
    { href: '/admin/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
    { href: '/admin/courses', icon: GraduationCap, labelKey: 'courses' },
    { href: '/admin/users', icon: Users, labelKey: 'users' },
    { href: '/manage/queue', icon: ClipboardList, labelKey: 'queue' },
    { href: '/admin/audit', icon: Shield, labelKey: 'audit' },
    { href: '/admin/analytics', icon: BarChart2, labelKey: 'analytics' },
    { href: '/settings', icon: Settings, labelKey: 'settings' },
    { href: '/guide', icon: BookMarked, labelKey: 'guide' },
  ],
}

interface Props {
  children: React.ReactNode
  session: Session
  locale: string
}

export default function AppShell({ children, session, locale }: Props) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const t = useTranslations('nav')

  const role = (session.user.role ?? 'STAFF') as Role
  const items = NAV[role] ?? NAV.STAFF
  const displayName = session.user.name ?? session.user.email ?? '?'
  const initial = displayName[0].toUpperCase()

  const isActive = (href: string) => {
    const full = `/${locale}${href}`
    return pathname === full || (href !== '/dashboard' && pathname.startsWith(`${full}/`))
  }

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-60 flex flex-col
          bg-slate-900 border-r border-white/5
          transition-transform duration-200 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-white/5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/30 flex-shrink-0">
            <span className="text-white text-xs font-bold">CB</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-none">Click Broker</p>
            <p className="text-blue-400 text-xs mt-0.5">Learning</p>
          </div>
          <button
            className="lg:hidden text-slate-500 hover:text-white transition-colors"
            onClick={() => setOpen(false)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={`/${locale}${item.href}`}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {t(item.labelKey)}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-blue-400 text-xs font-bold">{initial}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-xs font-medium truncate leading-tight">{displayName}</p>
              <p className="text-slate-500 text-xs truncate">{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 flex items-center gap-3 px-4 border-b border-white/5 bg-slate-900/50 flex-shrink-0">
          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          {/* Notifications */}
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <Bell className="w-4 h-4" />
          </button>

          {/* Language toggle */}
          <LocaleSwitcher locale={locale} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
