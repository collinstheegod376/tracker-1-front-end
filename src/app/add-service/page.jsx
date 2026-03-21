'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../../components/AppShell';
import ServiceLogo from '../../components/ServiceLogo';
import { subscriptions as api } from '../../lib/api';

const PRESETS = [
  { name: 'Netflix',         icon: '🎬', price: 4600,  color: '#E50914' },
  { name: 'Amazon Prime',    icon: '📦', price: 2500,  color: '#00A8E8' },
  { name: 'Disney+',         icon: '✨', price: 3500,  color: '#113CCF' },
  { name: 'Spotify',         icon: '🎵', price: 1800,  color: '#1DB954' },
  { name: 'Apple Music',     icon: '🎧', price: 1500,  color: '#FC3C44' },
  { name: 'YouTube Premium', icon: '▶️', price: 2200,  color: '#FF0000' },
  { name: 'ChatGPT',         icon: '🤖', price: 24000, color: '#10A37F' },
  { name: 'iCloud',          icon: '☁️', price: 750,   color: '#3693F3' },
  { name: 'Google One',      icon: '🔵', price: 450,   color: '#4285F4' },
  { name: 'Twitter / X',     icon: '🐦', price: 1200,  color: '#000000' },
  { name: 'Internet',        icon: '🌐', price: 15000, color: '#6366F1' },
  { name: 'Rent',            icon: '🏠', price: 150000,color: '#f59e0b' },
  { name: 'Custom',          icon: '⚡', price: 0,     color: '#2559bd' },
];

function fmt(n) {
  return parseFloat(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function AddServicePage() {
  const router = useRouter();
  const today  = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    service_name: '',
    custom_name:  '',
    price:        '',
    due_date:     today,
    recurring:    true,
    notes:        '',
  });
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  const selected = PRESETS.find(p => p.name === form.service_name);

  function pickPreset(p) {
    setForm(f => ({
      ...f,
      service_name: p.name,
      price:        p.name !== 'Custom' ? String(p.price) : f.price,
      custom_name:  p.name === 'Custom' ? f.custom_name : '',
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.service_name) { setError('Please select a service.'); return; }
    if (!form.price || isNaN(parseFloat(form.price))) { setError('Enter a valid price.'); return; }
    if (form.service_name === 'Custom' && !form.custom_name.trim()) { setError('Enter a service name.'); return; }
    setError('');
    setSaving(true);
    try {
      await api.create({ ...form, price: parseFloat(form.price) });
      setSuccess(true);
      setTimeout(() => router.push('/subscriptions'), 1400);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-up">

        {/* ── Header ──────────────────────────────────────── */}
        <div>
          <h2 className="font-headline text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Add Service</h2>
          <p className="text-on-surface-variant text-sm mt-1">Track a new recurring or one-time payment.</p>
        </div>

        {/* ── Success state ────────────────────────────────── */}
        {success && (
          <div className="bg-tertiary-fixed/30 border border-on-tertiary-container/30 rounded-2xl p-6 text-center animate-fade-in">
            <span className="material-symbols-outlined text-on-tertiary-container text-[40px] block mb-2">check_circle</span>
            <p className="font-headline font-bold text-primary">Subscription added!</p>
            <p className="text-on-surface-variant text-sm mt-1">Redirecting you to your subscriptions…</p>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Service Picker ───────────────────────────── */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-outline-variant/20">
              <label className="block text-[11px] font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-4">
                Choose Service
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {PRESETS.map(p => {
                  const isSelected = form.service_name === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => pickPreset(p)}
                      className={[
                        'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer',
                        isSelected
                          ? 'shadow-md scale-[1.03]'
                          : 'border-outline-variant/20 bg-surface-container-low hover:border-outline-variant/50 hover:bg-surface-container',
                      ].join(' ')}
                      style={isSelected ? {
                        borderColor: p.color,
                        background: `${p.color}10`,
                        boxShadow: `0 0 0 3px ${p.color}20`,
                      } : {}}
                    >
                      <ServiceLogo
                        serviceName={p.name}
                        fallbackIcon={p.icon}
                        fallbackColor={p.color}
                        size={36}
                      />
                      <span
                        className="text-[10px] font-headline font-bold text-center leading-tight"
                        style={{ color: isSelected ? p.color : '#43474f' }}
                      >
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Details form ────────────────────────────── */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-6 shadow-sm border border-outline-variant/20 space-y-4">
              <label className="block text-[11px] font-label font-semibold text-on-surface-variant uppercase tracking-widest">
                Details
              </label>

              {/* Custom name */}
              {form.service_name === 'Custom' && (
                <div>
                  <label className="block text-xs font-label font-semibold text-on-surface-variant mb-1.5">
                    Service Name *
                  </label>
                  <input
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-surface-tint/30 transition-all placeholder-outline"
                    placeholder="e.g. Gym membership, Canva Pro…"
                    value={form.custom_name}
                    onChange={e => setForm({ ...form, custom_name: e.target.value })}
                  />
                </div>
              )}

              {/* Price */}
              <div>
                <label className="block text-xs font-label font-semibold text-on-surface-variant mb-1.5">
                  Price (₦) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-headline font-bold text-primary text-sm pointer-events-none">₦</span>
                  <input
                    className="w-full pl-8 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-surface-tint/30 transition-all"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                {form.price && !isNaN(parseFloat(form.price)) && (
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    = ₦{fmt(form.price)} · Yearly: ₦{fmt(parseFloat(form.price) * 12)}
                  </p>
                )}
              </div>

              {/* Due date */}
              <div>
                <label className="block text-xs font-label font-semibold text-on-surface-variant mb-1.5">
                  Due / Billing Date *
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-surface-tint/30 transition-all"
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                  required
                />
              </div>

              {/* Recurring toggle */}
              <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3.5 border border-outline-variant/20">
                <div>
                  <p className="font-headline font-semibold text-sm text-on-surface">Recurring Monthly</p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Auto-renews each billing cycle</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, recurring: !form.recurring })}
                  style={{
                    width: 46,
                    height: 26,
                    borderRadius: 999,
                    background: form.recurring
                      ? 'linear-gradient(135deg,#00153e,#002867)'
                      : '#e0e3e6',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    flexShrink: 0,
                    transition: 'background 0.22s ease',
                    boxShadow: form.recurring ? '0 0 0 3px rgba(0,21,62,0.15)' : 'none',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 3,
                      left: form.recurring ? 23 : 3,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                      transition: 'left 0.22s ease',
                    }}
                  />
                </button>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-label font-semibold text-on-surface-variant mb-1.5">
                  Notes <span className="font-normal opacity-60">(optional)</span>
                </label>
                <textarea
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-surface-tint/30 transition-all resize-none placeholder-outline"
                  rows={2}
                  placeholder="Plan name, account info…"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-3 bg-error-container text-on-error-container rounded-xl text-sm font-body border border-error/20 animate-fade-in">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 py-3 rounded-full border-2 border-outline-variant/40 text-on-surface-variant font-headline font-semibold text-sm hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 primary-gradient text-on-primary py-3 rounded-full font-headline font-bold text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                disabled={saving || !form.service_name}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving…
                  </span>
                ) : 'Add Subscription'}
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
