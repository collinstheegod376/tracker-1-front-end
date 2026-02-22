'use client';

import { useState, useEffect } from 'react';

// Preset service options with icons and default prices
const PRESETS = [
  { name: 'Netflix', icon: '🎬', price: 15.99, color: '#e50914' },
  { name: 'Amazon Prime', icon: '📦', price: 14.99, color: '#00a8e8' },
  { name: 'Spotify', icon: '🎵', price: 9.99, color: '#1db954' },
  { name: 'Internet', icon: '🌐', price: 59.99, color: '#6366f1' },
  { name: 'Rent', icon: '🏠', price: 1200, color: '#f59e0b' },
  { name: 'Custom', icon: '⚡', price: 0, color: '#8b5cf6' },
];

export default function SubscriptionModal({ date, subscription, onSave, onClose }) {
  const [form, setForm] = useState({
    service_name: 'Netflix',
    custom_name: '',
    price: '15.99',
    due_date: '',
    recurring: true,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (subscription) {
      setForm({
        service_name: subscription.service_name || 'Custom',
        custom_name: subscription.custom_name || '',
        price: String(subscription.price || ''),
        due_date: subscription.due_date?.slice(0, 10) || formatDate(date),
        recurring: subscription.recurring !== false,
        notes: subscription.notes || '',
      });
    } else {
      setForm((f) => ({ ...f, due_date: formatDate(date) }));
    }
  }, [subscription, date]);

  function formatDate(d) {
    if (!d) return '';
    const date_ = new Date(d);
    return date_.toISOString().slice(0, 10);
  }

  function selectPreset(preset) {
    setForm((f) => ({
      ...f,
      service_name: preset.name,
      price: preset.name !== 'Custom' && !subscription ? String(preset.price) : f.price,
      custom_name: preset.name === 'Custom' ? f.custom_name : '',
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.price || isNaN(parseFloat(form.price))) {
      alert('Please enter a valid price');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...form,
        price: parseFloat(form.price),
      });
    } finally {
      setSaving(false);
    }
  }

  const selectedPreset = PRESETS.find((p) => p.name === form.service_name) || PRESETS[5];

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="glass w-full max-w-sm mx-auto animate-slide-up"
        style={{ borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-purple-700" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between py-3 mb-2">
            <h3 className="font-display text-lg font-700 text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              {subscription ? 'Edit Subscription' : `Add for ${date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            </h3>
            <button onClick={onClose} className="text-purple-500 hover:text-purple-300 text-xl leading-none">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Service selector */}
            <div>
              <label className="block text-xs text-purple-400 mb-2 font-display uppercase tracking-wider" style={{ fontFamily: 'Syne, sans-serif' }}>
                Service
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => selectPreset(preset)}
                    className={`glass-light p-2.5 rounded-xl flex flex-col items-center gap-1 transition-all ${
                      form.service_name === preset.name
                        ? 'border-purple-500 bg-purple-900/40'
                        : 'hover:border-purple-700/50'
                    }`}
                    style={form.service_name === preset.name ? {
                      borderColor: preset.color,
                      boxShadow: `0 0 12px ${preset.color}40`,
                    } : {}}
                  >
                    <span className="text-lg leading-none">{preset.icon}</span>
                    <span className="text-xs text-purple-300 font-display" style={{ fontFamily: 'Syne, sans-serif', fontSize: '10px' }}>
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom name (only for Custom) */}
            {form.service_name === 'Custom' && (
              <div>
                <label className="block text-xs text-purple-400 mb-1.5 font-display uppercase tracking-wider" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Service Name
                </label>
                <input
                  className="input-glass"
                  type="text"
                  placeholder="e.g. Disney+, Gym, VPN..."
                  value={form.custom_name}
                  onChange={(e) => setForm({ ...form, custom_name: e.target.value })}
                />
              </div>
            )}

            {/* Price */}
            <div>
              <label className="block text-xs text-purple-400 mb-1.5 font-display uppercase tracking-wider" style={{ fontFamily: 'Syne, sans-serif' }}>
                Price
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-display" style={{ fontFamily: 'Syne, sans-serif' }}>
                  $
                </span>
                <input
                  className="input-glass pl-7"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs text-purple-400 mb-1.5 font-display uppercase tracking-wider" style={{ fontFamily: 'Syne, sans-serif' }}>
                Due Date
              </label>
              <input
                className="input-glass"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                required
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Recurring toggle */}
            <div className="flex items-center justify-between glass-light px-4 py-3 rounded-xl">
              <div>
                <p className="text-sm text-purple-200 font-display" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Recurring Monthly
                </p>
                <p className="text-xs text-purple-500 mt-0.5">Auto-renews each month</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, recurring: !form.recurring })}
                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${
                  form.recurring ? 'bg-purple-600' : 'bg-purple-900/60'
                }`}
                style={form.recurring ? { boxShadow: '0 0 12px rgba(139,92,246,0.5)' } : {}}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                    form.recurring ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost flex-1 py-3 text-sm">
                Cancel
              </button>
              <button type="submit" className="btn-glow flex-1 py-3 text-sm" disabled={saving}>
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
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
