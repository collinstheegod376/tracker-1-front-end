'use client';

import { useState, useEffect } from 'react';
import ServiceLogo from './ServiceLogo';

const PRESETS = [
  { name: 'Netflix',         icon: '🎬', price: 4600,  color: '#E50914' },
  { name: 'Amazon Prime',    icon: '📦', price: 2500,  color: '#00A8E8' },
  { name: 'Disney+',         icon: '✨', price: 3500,  color: '#113CCF' },
  { name: 'Spotify',         icon: '🎵', price: 1800,  color: '#1DB954' },
  { name: 'Apple Music',     icon: '🎧', price: 1500,  color: '#FC3C44' },
  { name: 'YouTube Premium', icon: '▶️', price: 2200,  color: '#FF0000' },
  { name: 'ChatGPT',         icon: '🤖', price: 24000, color: '#10A37F' },
  { name: 'iCloud',          icon: '☁️', price: 750,   color: '#3693F3' },
  { name: 'Internet',        icon: '🌐', price: 15000, color: '#6366F1' },
  { name: 'Rent',            icon: '🏠', price: 150000,color: '#f59e0b' },
  { name: 'Custom',          icon: '⚡', price: 0,     color: '#2559bd' },
];

export default function SubscriptionModal({ date, subscription, onSave, onClose }) {
  const [form, setForm] = useState({
    service_name: 'Netflix',
    custom_name:  '',
    price:        '4600',
    due_date:     '',
    recurring:    true,
    notes:        '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (subscription) {
      setForm({
        service_name: subscription.service_name || 'Custom',
        custom_name:  subscription.custom_name  || '',
        price:        String(subscription.price  || ''),
        due_date:     subscription.due_date?.slice(0,10) || fmtDate(date),
        recurring:    subscription.recurring !== false,
        notes:        subscription.notes || '',
      });
    } else {
      setForm(f => ({ ...f, due_date: fmtDate(date) }));
    }
  }, [subscription, date]);

  function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toISOString().slice(0,10);
  }

  function pickPreset(p) {
    setForm(f => ({
      ...f,
      service_name: p.name,
      price: p.name !== 'Custom' && !subscription ? String(p.price) : f.price,
      custom_name: p.name === 'Custom' ? f.custom_name : '',
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.price || isNaN(parseFloat(form.price))) { alert('Enter a valid price'); return; }
    setSaving(true);
    try {
      await onSave({ ...form, price: parseFloat(form.price) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="bg-surface-container-lowest w-full max-w-sm mx-auto animate-slide-up overflow-y-auto"
        style={{
          borderRadius: '20px 20px 0 0',
          maxHeight: '92vh',
          boxShadow: '0 -8px 40px rgba(0,21,62,0.18)',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-outline-variant" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between py-3 mb-1">
            <h3 className="font-headline font-bold text-primary text-lg">
              {subscription ? 'Edit Subscription'
                : `Add · ${date?.toLocaleDateString('en-NG',{ month: 'short', day: 'numeric' })}`}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Service picker */}
            <div>
              <label className="block text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-2">
                Service
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRESETS.map(p => {
                  const sel = form.service_name === p.name;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => pickPreset(p)}
                      className="flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all"
                      style={sel ? {
                        borderColor: p.color,
                        background: `${p.color}10`,
                        boxShadow: `0 0 0 2px ${p.color}20`,
                      } : {
                        borderColor: '#e0e3e6',
                        background: '#f2f4f7',
                      }}
                    >
                      <ServiceLogo serviceName={p.name} fallbackIcon={p.icon} fallbackColor={p.color} size={28} />
                      <span
                        className="text-[9px] font-headline font-bold text-center leading-tight"
                        style={{ color: sel ? p.color : '#43474f' }}
                      >
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom name */}
            {form.service_name === 'Custom' && (
              <div>
                <label className="block text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Name
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-surface-tint/30 transition-all"
                  placeholder="e.g. Gym, Canva Pro…"
                  value={form.custom_name}
                  onChange={e => setForm({ ...form, custom_name: e.target.value })}
                />
              </div>
            )}

            {/* Price */}
            <div>
              <label className="block text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-1.5">
                Price (₦)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-headline font-bold text-primary text-sm pointer-events-none">₦</span>
                <input
                  className="w-full pl-7 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-surface-tint/30 transition-all"
                  type="number" step="1" min="0" placeholder="0"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Due date */}
            <div>
              <label className="block text-[10px] font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-1.5">
                Due Date
              </label>
              <input
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-surface-tint/30 transition-all"
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                required
              />
            </div>

            {/* Recurring */}
            <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant/20">
              <div>
                <p className="font-headline font-semibold text-sm text-on-surface">Recurring Monthly</p>
                <p className="text-[10px] text-outline mt-0.5">Auto-renews each month</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, recurring: !form.recurring })}
                style={{
                  width:44, height:24, borderRadius:999,
                  background: form.recurring ? 'linear-gradient(135deg,#00153e,#002867)' : '#e0e3e6',
                  border:'none', cursor:'pointer', position:'relative', flexShrink:0,
                  transition:'background 0.22s ease',
                }}
              >
                <span style={{
                  position:'absolute', top:2,
                  left: form.recurring ? 22 : 2,
                  width:20, height:20, borderRadius:'50%',
                  background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
                  transition:'left 0.22s ease',
                }} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full border-2 border-outline-variant/40 text-on-surface-variant font-headline font-semibold text-sm hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 primary-gradient text-on-primary py-3 rounded-full font-headline font-bold text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60"
                disabled={saving}
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving…
                  </span>
                ) : subscription ? 'Save Changes' : 'Add Subscription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
