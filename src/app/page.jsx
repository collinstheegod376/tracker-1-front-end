'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppShell from '../components/AppShell';
import ServiceLogo from '../components/ServiceLogo';
import { subscriptions as api } from '../lib/api';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function categorize(sub) {
  const n = (sub.service_name || sub.custom_name || '').toLowerCase();
  if (['netflix','hulu','disney','youtube premium','prime video','apple tv','peacock','hbo','showtime'].some(s => n.includes(s)))
    return { label: 'Entertainment',  color: '#ba1a1a' };
  if (['spotify','apple music','youtube music','tidal','deezer','amazon music'].some(s => n.includes(s)))
    return { label: 'Music',          color: '#7c3aed' };
  if (['chatgpt','openai','github','adobe','microsoft','notion','slack','zoom','figma','canva','vpn'].some(s => n.includes(s)))
    return { label: 'Software & SaaS',color: '#2559bd' };
  if (['icloud','google one','onedrive','dropbox'].some(s => n.includes(s)))
    return { label: 'Cloud Storage',  color: '#0891b2' };
  return    { label: 'Core Utilities',color: '#00aa45' };
}

function fmt(n) {
  return parseFloat(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysUntil(dateStr) {
  const due   = new Date(dateStr);
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.ceil((due - today) / 864e5);
}

export default function Dashboard() {
  const [allSubs, setAllSubs] = useState([]);
  const [summary, setSummary] = useState({ total_monthly: 0, subscription_count: 0 });
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [subsData, sumData] = await Promise.all([
        api.list(now.getMonth() + 1, now.getFullYear()),
        api.summary(),
      ]);
      setAllSubs(subsData.subscriptions || []);
      setSummary(sumData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const total        = parseFloat(summary.total_monthly || 0);
  const count        = parseInt(summary.subscription_count || 0);
  const daysInMonth  = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyVelocity= total / daysInMonth;

  // Next 3 upcoming
  const today0 = new Date(); today0.setHours(0,0,0,0);
  const upcoming = [...allSubs]
    .filter(s => new Date(s.due_date) >= today0)
    .sort((a,b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  // Categories
  const catMap = {};
  allSubs.forEach(s => {
    const c = categorize(s);
    if (!catMap[c.label]) catMap[c.label] = { ...c, total: 0 };
    catMap[c.label].total += parseFloat(s.price || 0);
  });
  const catList = Object.values(catMap).sort((a,b) => b.total - a.total);

  // Top 4 by price
  const topSubs = [...allSubs].sort((a,b) => b.price - a.price).slice(0,4);

  return (
    <AppShell>
      <div className="space-y-6 lg:space-y-8">

        {/* ── Headline ──────────────────────────────────────── */}
        <section className="animate-fade-up">
          <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary tracking-tight leading-tight">
            The Monthly Edition
          </h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Your financial footprint, curated for {MONTHS[now.getMonth()]}.
          </p>
        </section>

        {/* ── Bento Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

          {/* Main spending card */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 lg:p-10 flex flex-col justify-between min-h-[260px] lg:min-h-[380px] shadow-sm animate-fade-up delay-100">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-label font-semibold text-on-surface-variant uppercase tracking-widest">
                  Total Commitment
                </span>
                <div className="flex items-baseline gap-3 mt-2 flex-wrap">
                  {loading ? (
                    <div className="h-12 w-44 bg-surface-container-high rounded-lg animate-pulse" />
                  ) : (
                    <>
                      <h3 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-bold text-primary tracking-tighter">
                        ₦{fmt(total)}
                      </h3>
                      <span className="text-on-tertiary-container font-bold flex items-center gap-1 text-sm">
                        <span className="material-symbols-outlined text-[16px]">trending_up</span>
                        {count} active
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-surface-container-low p-3 rounded-xl flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-[28px]">account_balance_wallet</span>
              </div>
            </div>

            {/* Spend Pulse wave */}
            <div className="mt-6 relative h-28 lg:h-40 bg-surface-container-low rounded-xl overflow-hidden">
              <div className="absolute inset-0 spend-pulse-gradient" />
              <svg
                className="absolute bottom-0 w-full h-20 wave-animate"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <path
                  d="M0,80 Q10,75 20,85 T40,60 T60,70 T80,40 T100,50 L100,100 L0,100 Z"
                  fill="rgba(105,255,135,0.2)"
                />
                <path
                  d="M0,80 Q10,75 20,85 T40,60 T60,70 T80,40 T100,50"
                  fill="none"
                  stroke="#00aa45"
                  strokeWidth="2"
                />
              </svg>
              <div className="absolute top-3 left-4 lg:top-4 lg:left-6">
                <span className="text-[10px] font-bold text-on-tertiary-container uppercase tracking-widest">
                  Daily Velocity
                </span>
                {loading ? (
                  <div className="h-5 w-28 bg-surface-container-high rounded animate-pulse mt-1" />
                ) : (
                  <p className="font-headline font-bold text-primary text-sm lg:text-lg mt-0.5">
                    ₦{fmt(dailyVelocity)} / day
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming card — dark navy */}
          <div className="lg:col-span-4 bg-primary rounded-2xl p-6 lg:p-8 text-on-primary flex flex-col shadow-sm animate-fade-up delay-200">
            <div className="flex items-center justify-between mb-5 lg:mb-7">
              <h4 className="font-headline text-lg font-bold">Upcoming</h4>
              <span className="material-symbols-outlined text-on-primary-container text-[22px]">event</span>
            </div>

            {loading ? (
              <div className="space-y-4 flex-1">
                {[1,2,3].map(i => (
                  <div key={i} className="h-12 bg-white/10 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-6">
                <p className="text-sm text-on-primary-container text-center opacity-70">
                  No renewals coming up this month.
                </p>
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-5 flex-1">
                {upcoming.map(sub => {
                  const days = daysUntil(sub.due_date);
                  const day  = new Date(sub.due_date).getDate();
                  return (
                    <div key={sub.id} className="flex gap-3 items-center">
                      <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm flex-shrink-0 font-headline">
                        {day}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-headline font-bold text-sm truncate">
                          {sub.custom_name || sub.service_name}
                        </p>
                        <p className="text-[11px] text-on-primary-container mt-0.5">
                          {days === 0 ? 'Due today' : days === 1 ? 'Tomorrow' : `In ${days} days`}
                          {sub.recurring ? ' · Recurring' : ''}
                        </p>
                      </div>
                      <span className="font-headline font-bold text-sm flex-shrink-0">
                        ₦{fmt(sub.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href="/subscriptions"
              className="mt-5 lg:mt-7 w-full bg-white/10 hover:bg-white/20 py-3 rounded-full text-sm font-bold font-headline transition-colors text-center"
            >
              View Full Calendar →
            </Link>
          </div>

          {/* Sector distribution */}
          {catList.length > 0 && (
            <div className="lg:col-span-5 bg-surface-container-low rounded-2xl p-6 lg:p-8 shadow-sm animate-fade-up delay-300">
              <h4 className="font-headline text-lg font-bold text-primary mb-5">Sector Distribution</h4>
              <div className="space-y-3">
                {catList.map(cat => {
                  const pct = total > 0 ? Math.round((cat.total / total) * 100) : 0;
                  return (
                    <div key={cat.label} className="bg-surface-container-lowest p-3.5 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                          <span className="font-headline font-bold text-sm">{cat.label}</span>
                        </div>
                        <span className="font-label font-bold text-sm text-primary">₦{fmt(cat.total)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: cat.color, transition: 'width 0.8s ease' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top subscriptions */}
          <div className={`${catList.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'} bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-sm animate-fade-up delay-400`}>
            <div className="flex items-center justify-between mb-5 lg:mb-7">
              <h4 className="font-headline text-lg font-bold text-primary">Top Subscriptions</h4>
              <Link href="/subscriptions" className="text-surface-tint font-bold text-sm hover:underline font-label">
                Manage All
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-[60px] bg-surface-container-low rounded-xl animate-pulse" />)}
              </div>
            ) : topSubs.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-on-surface-variant text-sm mb-4">No subscriptions yet</p>
                <Link
                  href="/add-service"
                  className="primary-gradient text-on-primary px-6 py-2.5 rounded-full text-sm font-bold font-headline inline-block hover:opacity-90"
                >
                  Add Your First
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {topSubs.map(sub => {
                  const days = daysUntil(sub.due_date);
                  const badge =
                    days < 0 ? { text: 'OVERDUE',  cls: 'bg-error-container text-on-error-container' }
                  : days <= 3 ? { text: 'DUE SOON', cls: 'bg-secondary-fixed text-on-secondary-fixed' }
                  :             { text: 'ACTIVE',   cls: 'bg-tertiary-fixed text-on-tertiary-fixed'   };
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 lg:p-4 bg-surface hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ServiceLogo
                          serviceName={sub.service_name}
                          fallbackIcon={sub.icon}
                          fallbackColor="#2559bd"
                          size={44}
                        />
                        <div className="min-w-0">
                          <h5 className="font-headline font-bold text-primary text-sm truncate">
                            {sub.custom_name || sub.service_name}
                          </h5>
                          <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                            {sub.recurring ? 'Monthly' : 'One-time'} · Due{' '}
                            {new Date(sub.due_date).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <p className="font-label font-bold text-primary text-sm">₦{fmt(sub.price)}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${badge.cls} mt-1 inline-block`}>
                          {badge.text}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop FAB */}
      <Link
        href="/add-service"
        className="hidden lg:flex fixed bottom-8 right-8 h-14 w-14 rounded-full primary-gradient text-on-primary shadow-2xl items-center justify-center active:scale-90 transition-transform z-50 hover:opacity-90"
      >
        <span className="material-symbols-outlined text-[24px]">add</span>
      </Link>

      <PWAInstallPrompt />
    </AppShell>
  );
}
