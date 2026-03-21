'use client';

import { useState, useEffect, useCallback } from 'react';
import AppShell from '../../components/AppShell';
import ServiceLogo from '../../components/ServiceLogo';
import SubscriptionModal from '../../components/SubscriptionModal';
import { subscriptions as api } from '../../lib/api';

function fmt(n) {
  return parseFloat(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysUntil(dateStr) {
  const due   = new Date(dateStr);
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.ceil((due - today) / 864e5);
}

const FILTERS = ['All', 'Active', 'Due Soon', 'Overdue'];

export default function SubscriptionsPage() {
  const [allSubs,  setAllSubs]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('All');
  const [sortBy,   setSortBy]   = useState('date');   // date | price | name
  const [editing,  setEditing]  = useState(null);
  const [modalOpen,setModalOpen]= useState(false);
  const now = new Date();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.list(now.getMonth() + 1, now.getFullYear());
      setAllSubs(data.subscriptions || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave(formData) {
    if (editing) await api.update(editing.id, formData);
    setModalOpen(false);
    setEditing(null);
    fetchData();
  }

  async function handleDelete(id) {
    if (!confirm('Remove this subscription?')) return;
    await api.delete(id);
    fetchData();
  }

  function openEdit(sub) {
    setEditing(sub);
    setModalOpen(true);
  }

  // Filter + search + sort
  const displayed = allSubs
    .filter(s => {
      const name = (s.custom_name || s.service_name || '').toLowerCase();
      if (!name.includes(search.toLowerCase())) return false;
      const days = daysUntil(s.due_date);
      if (filter === 'Active'   && !(days >= 0))    return false;
      if (filter === 'Due Soon' && !(days >= 0 && days <= 3)) return false;
      if (filter === 'Overdue'  && !(days < 0))     return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return b.price - a.price;
      if (sortBy === 'name')  return (a.custom_name || a.service_name).localeCompare(b.custom_name || b.service_name);
      return new Date(a.due_date) - new Date(b.due_date);
    });

  const totalDisplayed = displayed.reduce((s, sub) => s + parseFloat(sub.price || 0), 0);

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-up">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">
              All Subscriptions
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              {loading ? '…' : `${allSubs.length} subscription${allSubs.length !== 1 ? 's' : ''} · ₦${fmt(totalDisplayed)} shown`}
            </p>
          </div>
          <a
            href="/add-service"
            className="primary-gradient text-on-primary px-5 py-2.5 rounded-full text-sm font-headline font-bold shadow-sm hover:opacity-90 transition-opacity self-start sm:self-auto"
          >
            + Add New
          </a>
        </div>

        {/* ── Search + filters ────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-outline-variant/20 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">search</span>
            <input
              className="w-full pl-9 pr-4 py-2.5 bg-surface-container-low rounded-lg text-sm border-0 focus:outline-none focus:ring-2 focus:ring-surface-tint/30 font-body placeholder-outline"
              placeholder="Search by name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter chips */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  'px-3 py-2 rounded-full text-xs font-headline font-bold transition-all',
                  filter === f
                    ? 'primary-gradient text-on-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container',
                ].join(' ')}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            className="px-3 py-2.5 bg-surface-container-low rounded-lg text-sm font-label border-0 focus:outline-none focus:ring-2 focus:ring-surface-tint/30 text-on-surface cursor-pointer"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="date">Sort: Date</option>
            <option value="price">Sort: Price</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        {/* ── List ────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-20 bg-surface-container-lowest rounded-2xl animate-pulse shadow-sm border border-outline-variant/10" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-12 text-center shadow-sm border border-outline-variant/20">
            <span className="material-symbols-outlined text-[48px] text-outline mb-4 block">subscriptions</span>
            <p className="font-headline font-bold text-on-surface-variant text-base">No subscriptions found</p>
            <p className="text-outline text-sm mt-1">
              {search || filter !== 'All' ? 'Try adjusting your filters' : 'Add your first subscription to get started'}
            </p>
            {!search && filter === 'All' && (
              <a
                href="/add-service"
                className="primary-gradient text-on-primary px-6 py-2.5 rounded-full text-sm font-headline font-bold inline-block mt-5 hover:opacity-90"
              >
                Add Subscription
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayed.map((sub, i) => {
              const days  = daysUntil(sub.due_date);
              const badge =
                days < 0  ? { text: 'OVERDUE',  cls: 'bg-error-container text-on-error-container' }
              : days <= 3  ? { text: 'DUE SOON', cls: 'bg-secondary-fixed text-on-secondary-fixed' }
              :              { text: 'ACTIVE',   cls: 'bg-tertiary-fixed text-on-tertiary-fixed'   };
              const dueLabel =
                days < 0  ? `${Math.abs(days)}d overdue`
              : days === 0 ? 'Due today'
              : days === 1 ? 'Due tomorrow'
              :              `Due in ${days}d`;
              return (
                <div
                  key={sub.id}
                  className="bg-surface-container-lowest hover:bg-surface rounded-2xl px-4 py-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-sm border border-outline-variant/15 transition-colors animate-fade-up"
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <ServiceLogo
                    serviceName={sub.service_name}
                    fallbackIcon={sub.icon}
                    fallbackColor="#2559bd"
                    size={44}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-headline font-bold text-primary text-sm truncate">
                        {sub.custom_name || sub.service_name}
                      </h5>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${badge.cls}`}>
                        {badge.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-[11px] text-on-surface-variant">
                        {dueLabel}
                      </span>
                      {sub.recurring && (
                        <span className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[12px]">autorenew</span>
                          Monthly
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
                    <p className="font-label font-bold text-primary text-sm hidden sm:block">₦{fmt(sub.price)}</p>
                    <div className="flex flex-col sm:flex-row gap-1.5 items-end sm:items-center">
                      <p className="font-label font-bold text-primary text-sm sm:hidden">₦{fmt(sub.price)}</p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEdit(sub)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary text-xs font-label font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">edit</span>
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-error-container/40 hover:bg-error-container text-error text-xs font-label font-semibold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                          <span className="hidden sm:inline">Del</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {modalOpen && (
        <SubscriptionModal
          subscription={editing}
          date={editing ? new Date(editing.due_date) : new Date()}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}
    </AppShell>
  );
}
