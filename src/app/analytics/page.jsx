'use client';

import { useState, useEffect } from 'react';
import AppShell from '../../components/AppShell';
import ServiceLogo from '../../components/ServiceLogo';
import { subscriptions as api } from '../../lib/api';

function fmt(n) {
  return parseFloat(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtShort(n) {
  const v = parseFloat(n || 0);
  if (v >= 1_000_000) return '₦' + (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000)     return '₦' + (v / 1_000).toFixed(1)     + 'K';
  return '₦' + v.toFixed(0);
}

function categorize(sub) {
  const n = (sub.service_name || sub.custom_name || '').toLowerCase();
  if (['netflix','hulu','disney','youtube premium','prime video','apple tv','peacock','hbo'].some(s => n.includes(s)))
    return { label: 'Entertainment',  color: '#ba1a1a', icon: 'movie' };
  if (['spotify','apple music','youtube music','tidal','deezer'].some(s => n.includes(s)))
    return { label: 'Music',          color: '#7c3aed', icon: 'music_note' };
  if (['chatgpt','github','adobe','microsoft','notion','slack','zoom','figma','canva','vpn'].some(s => n.includes(s)))
    return { label: 'Software & SaaS',color: '#2559bd', icon: 'terminal' };
  if (['icloud','google one','onedrive','dropbox'].some(s => n.includes(s)))
    return { label: 'Cloud Storage',  color: '#0891b2', icon: 'cloud' };
  return    { label: 'Core Utilities',color: '#00aa45', icon: 'bolt' };
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AnalyticsPage() {
  const [allSubs, setAllSubs] = useState([]);
  const [summary, setSummary] = useState({ total_monthly: 0, subscription_count: 0 });
  const [loading, setLoading] = useState(true);
  const now = new Date();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [s, sum] = await Promise.all([
          api.list(now.getMonth() + 1, now.getFullYear()),
          api.summary(),
        ]);
        setAllSubs(s.subscriptions || []);
        setSummary(sum);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const monthly  = parseFloat(summary.total_monthly || 0);
  const yearly   = monthly * 12;
  const count    = parseInt(summary.subscription_count || 0);
  const avgCost  = count > 0 ? monthly / count : 0;

  // Categories
  const catMap = {};
  allSubs.forEach(s => {
    const c = categorize(s);
    if (!catMap[c.label]) catMap[c.label] = { ...c, total: 0, count: 0 };
    catMap[c.label].total += parseFloat(s.price || 0);
    catMap[c.label].count += 1;
  });
  const cats = Object.values(catMap).sort((a,b) => b.total - a.total);
  const maxCat = cats[0]?.total || 1;

  // Sorted subscriptions
  const sorted = [...allSubs].sort((a,b) => b.price - a.price);
  const maxPrice = sorted[0]?.price || 1;

  // Simulated monthly trend (current month as base, slight variance for visual)
  const trendSeeds = [0.72, 0.85, 0.78, 0.91, 0.88, 0.94, 0.87, 0.96, 1.02, 0.99, 1.05, 1.0];
  const trendData = MONTHS.map((m, i) => ({
    month: m,
    value: i === now.getMonth() ? monthly : monthly * trendSeeds[i],
    isCurrent: i === now.getMonth(),
  }));
  const maxTrend = Math.max(...trendData.map(d => d.value), 1);

  const StatCard = ({ icon, label, value, sub, accent }) => (
    <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-outline-variant/15 flex flex-col gap-3 animate-fade-up">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}15` }}
      >
        <span className="material-symbols-outlined text-[20px]" style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p className="text-[11px] font-label font-semibold text-on-surface-variant uppercase tracking-widest">{label}</p>
        {loading ? (
          <div className="h-7 w-32 bg-surface-container-high rounded animate-pulse mt-1" />
        ) : (
          <p className="font-headline font-extrabold text-primary text-xl mt-0.5 tracking-tight">{value}</p>
        )}
        {sub && <p className="text-[11px] text-on-surface-variant mt-1">{sub}</p>}
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-6 lg:space-y-8">

        {/* ── Headline ──────────────────────────────────────── */}
        <div className="animate-fade-up">
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Analytics</h2>
          <p className="text-on-surface-variant text-sm mt-1">
            Deep-dive into your subscription spend for {MONTHS[now.getMonth()]} {now.getFullYear()}.
          </p>
        </div>

        {/* ── Stat cards ────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard icon="payments"          label="Monthly Spend"   value={`₦${fmt(monthly)}`}       sub={`${count} subscriptions`}    accent="#2559bd" />
          <StatCard icon="calendar_month"    label="Yearly Projection" value={fmtShort(yearly)}        sub="at current rate"             accent="#00aa45" />
          <StatCard icon="subscriptions"     label="Active Subs"     value={String(count)}             sub="this month"                  accent="#7c3aed" />
          <StatCard icon="avg_pace"          label="Avg per Sub"     value={`₦${fmt(avgCost)}`}        sub="monthly average"             accent="#0891b2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">

          {/* Monthly Trend chart */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-5 sm:p-7 shadow-sm border border-outline-variant/15 animate-fade-up delay-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-headline font-bold text-primary text-lg">Monthly Trend</h4>
                <p className="text-[11px] text-on-surface-variant mt-0.5">Estimated 12-month spend pattern</p>
              </div>
              <span className="text-[11px] font-label font-semibold text-on-tertiary-container bg-tertiary-fixed/30 px-3 py-1 rounded-full">
                {MONTHS[now.getMonth()]} actual
              </span>
            </div>

            {loading ? (
              <div className="h-40 bg-surface-container-high rounded-xl animate-pulse" />
            ) : (
              <div className="relative">
                {/* Y-axis labels */}
                <div className="flex gap-1 sm:gap-2 items-end h-36 sm:h-44">
                  {trendData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className="w-full rounded-t-lg transition-all duration-700 relative group cursor-default"
                        style={{
                          height: `${Math.max((d.value / maxTrend) * 100, 4)}%`,
                          background: d.isCurrent
                            ? 'linear-gradient(180deg,#2559bd,#00153e)'
                            : 'linear-gradient(180deg,#e0e3e6,#c4c6d0)',
                        }}
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-on-primary text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          {fmtShort(d.value)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* X-axis labels */}
                <div className="flex gap-1 sm:gap-2 mt-2">
                  {trendData.map((d, i) => (
                    <div key={i} className="flex-1 text-center">
                      <span
                        className="text-[9px] sm:text-[10px] font-label font-semibold"
                        style={{ color: d.isCurrent ? '#2559bd' : '#747780' }}
                      >
                        {d.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category breakdown */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-5 sm:p-7 shadow-sm border border-outline-variant/15 animate-fade-up delay-200">
            <h4 className="font-headline font-bold text-primary text-lg mb-5">By Category</h4>
            {loading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-surface-container-high rounded-xl animate-pulse" />)}
              </div>
            ) : cats.length === 0 ? (
              <p className="text-on-surface-variant text-sm">No data yet</p>
            ) : (
              <div className="space-y-3">
                {cats.map(cat => {
                  const pct = Math.round((cat.total / maxCat) * 100);
                  return (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]" style={{ color: cat.color }}>{cat.icon}</span>
                          <span className="font-label font-semibold text-xs text-on-surface">{cat.label}</span>
                        </div>
                        <span className="font-label font-bold text-xs text-primary">₦{fmt(cat.total)}</span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: cat.color }}
                        />
                      </div>
                      <p className="text-[10px] text-outline mt-1">{cat.count} subscription{cat.count !== 1 ? 's' : ''}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Per-subscription cost table */}
          <div className="lg:col-span-12 bg-surface-container-lowest rounded-2xl p-5 sm:p-7 shadow-sm border border-outline-variant/15 animate-fade-up delay-300">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-headline font-bold text-primary text-lg">Cost Breakdown</h4>
              <span className="text-[11px] font-label text-on-surface-variant">Sorted by price</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-14 bg-surface-container-high rounded-xl animate-pulse" />)}
              </div>
            ) : sorted.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-8">No subscriptions yet</p>
            ) : (
              <div className="space-y-2.5">
                {sorted.map((sub, i) => {
                  const pct = Math.round((sub.price / maxPrice) * 100);
                  const sharePct = monthly > 0 ? ((sub.price / monthly) * 100).toFixed(1) : '0';
                  return (
                    <div key={sub.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                      <span className="font-headline font-bold text-on-surface-variant text-sm w-5 flex-shrink-0">{i + 1}</span>
                      <ServiceLogo
                        serviceName={sub.service_name}
                        fallbackIcon={sub.icon}
                        fallbackColor="#2559bd"
                        size={36}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-headline font-bold text-primary text-sm truncate">
                            {sub.custom_name || sub.service_name}
                          </span>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                            <span className="font-label font-bold text-primary text-sm">₦{fmt(sub.price)}</span>
                            <span className="text-[10px] font-label text-on-surface-variant hidden sm:block">{sharePct}% of total</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#2559bd,#00153e)' }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
