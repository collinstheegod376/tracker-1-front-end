'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../lib/api';

const NAV = [
  { href: '/',              icon: 'dashboard',     label: 'Dashboard'    },
  { href: '/subscriptions', icon: 'subscriptions', label: 'Subscriptions'},
  { href: '/add-service',   icon: 'add_circle',    label: 'Add Service'  },
  { href: '/analytics',     icon: 'analytics',     label: 'Analytics'    },
];

export default function AppShell({ children }) {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [user, setUser]             = useState(null);
  const [authReady, setAuthReady]   = useState(false);
  const pathname = usePathname();
  const router   = useRouter();

  useEffect(() => {
    const u = auth.getUser();
    if (!u) { router.push('/login'); return; }
    setUser(u);
    setAuthReady(true);
  }, []);

  // Close drawer when route changes
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  if (!authReady) {
    return <div className="min-h-screen bg-surface" />;
  }

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Mobile overlay ────────────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className={[
          'fixed left-0 top-0 h-screen w-64 bg-slate-50 border-r border-outline-variant/30',
          'flex flex-col p-4 z-50 transition-transform duration-300 ease-in-out',
          menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Brand */}
        <div className="mb-8 px-2 pt-1">
          <h1 className="text-xl font-extrabold tracking-tight text-primary font-headline">
            SubTrack
          </h1>
          <p className="text-sm text-outline font-body mt-0.5">Financial Curator</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1">
          {NAV.map(({ href, icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={[
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-headline font-semibold transition-all',
                  active
                    ? 'text-primary bg-white shadow-sm'
                    : 'text-outline hover:bg-white/70 hover:text-on-surface',
                ].join(' ')}
              >
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-1">
          <button className="primary-gradient text-on-primary py-2.5 px-4 rounded-full text-xs font-bold font-headline mb-2 shadow-sm hover:opacity-90 transition-opacity">
            Upgrade Plan
          </button>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-headline font-medium text-outline hover:bg-white/70 hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Settings
          </a>
          <button
            onClick={auth.logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-headline font-medium text-outline hover:bg-white/70 hover:text-on-surface transition-colors w-full text-left"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Content area ──────────────────────────────────── */}
      <div className="lg:ml-64 flex flex-col min-h-screen">

        {/* Top header */}
        <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] h-16 z-40 bg-white/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm flex items-center justify-between px-4 lg:px-8">

          {/* Left: hamburger + search */}
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <button
              className="lg:hidden p-1.5 text-outline hover:text-primary transition-colors rounded-lg"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                search
              </span>
              <input
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg text-sm border-0 focus:outline-none focus:ring-2 focus:ring-surface-tint/30 font-body placeholder-outline"
                placeholder="Search subscriptions…"
                type="text"
              />
            </div>
          </div>

          {/* Right: actions + avatar */}
          <div className="flex items-center gap-2 ml-3">
            <button className="hidden sm:flex p-1.5 text-outline hover:text-primary transition-colors rounded-lg">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
            <button className="hidden sm:flex p-1.5 text-outline hover:text-primary transition-colors rounded-lg">
              <span className="material-symbols-outlined text-[22px]">help</span>
            </button>
            <Link
              href="/add-service"
              className="primary-gradient text-on-primary px-4 py-2 rounded-full text-xs font-headline font-bold shadow-sm hover:opacity-90 transition-opacity hidden sm:block"
            >
              Add New
            </Link>
            <div className="h-9 w-9 rounded-full primary-gradient flex items-center justify-center text-on-primary text-xs font-headline font-bold flex-shrink-0">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 pt-16">
          <div className="px-4 sm:px-6 lg:px-10 xl:px-12 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile FAB */}
      <Link
        href="/add-service"
        className="fixed bottom-6 right-5 h-14 w-14 rounded-full primary-gradient text-on-primary shadow-2xl flex items-center justify-center lg:hidden z-50 active:scale-90 transition-transform"
        aria-label="Add subscription"
      >
        <span className="material-symbols-outlined text-[24px]">add</span>
      </Link>
    </div>
  );
}
