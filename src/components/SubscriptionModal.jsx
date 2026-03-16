'use client';

import { useState, useEffect } from 'react';
import ServiceLogo from './ServiceLogo';

// ── Preset service options ────────────────────────────────────
// Prices are in Nigerian Naira (₦)
const PRESETS = [
  // Row 1 – Video
  { name: 'Netflix',         icon: '🎬', price: 4600,  color: '#E50914' },
  { name: 'Amazon Prime',    icon: '📦', price: 2500,  color: '#00A8E8' },
  { name: 'Disney+',         icon: '✨', price: 3500,  color: '#113CCF' },
  // Row 2 – Music / Audio
  { name: 'Spotify',         icon: '🎵', price: 1800,  color: '#1DB954' },
  { name: 'Apple Music',     icon: '🎧', price: 1500,  color: '#FC3C44' },
  { name: 'YouTube Premium', icon: '▶️', price: 2200,  color: '#FF0000' },
  // Row 3 – AI & Cloud
  { name: 'ChatGPT',         icon: '🤖', price: 24000, color: '#10A37F' },
  { name: 'iCloud',          icon: '☁️', price: 750,   color: '#3693F3' },
  { name: 'Google One',      icon: '🔵', price: 450,   color: '#4285F4' },
  // Row 4 – Other
  { name: 'Twitter / X',     icon: '🐦', price: 1200,  color: '#000000' },
  { name: 'Internet',        icon: '🌐', price: 15000, color: '#6366F1' },
  { name: 'Custom',          icon: '⚡', price: 0,     color: '#5B47E0' },
];

export default function SubscriptionModal({ date, subscription, onSave, onClose }) {
  const [form, setForm] = useState({
    service_name: 'Netflix',
    custom_name: '',
    price: '4600',
    due_date: '',
    recurring: true,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  // Pre-fill when editing
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
    return new Date(d).toISOString().slice(0, 10);
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
      await onSave({ ...form, price: parseFloat(form.price) });
    } finally {
      setSaving(false);
    }
  }

  const selectedPreset = PRESETS.find((p) => p.name === form.service_name) || PRESETS[PRESETS.length - 1];

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="animate-slide-up"
        style={{
          background: '#FFFFFF',
          border: '1px solid rgba(91,71,224,0.1)',
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxWidth: 480,
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 -8px 40px rgba(91,71,224,0.15)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 99,
              background: 'rgba(91,71,224,0.2)',
            }}
          />
        </div>

        <div style={{ padding: '0 20px 32px' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0 16px',
            }}
          >
            <h3
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 700,
                fontSize: '1.1rem',
                color: 'var(--text-primary)',
              }}
            >
              {subscription
                ? 'Edit Subscription'
                : `Add for ${date?.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })}`}
            </h3>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 99,
                background: '#F5F6FF',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                color: 'var(--text-muted)',
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* ── Service selector ──────────────────────────── */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 10,
                }}
              >
                Service
              </label>

              {/* 3-column grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 8,
                }}
              >
                {PRESETS.map((preset) => {
                  const isSelected = form.service_name === preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => selectPreset(preset)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 6,
                        padding: '10px 6px',
                        borderRadius: 14,
                        border: isSelected
                          ? `2px solid ${preset.color}`
                          : '1.5px solid rgba(91,71,224,0.1)',
                        background: isSelected
                          ? `${preset.color}10`
                          : '#FAFBFF',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        boxShadow: isSelected
                          ? `0 0 0 3px ${preset.color}18`
                          : 'none',
                      }}
                    >
                      <ServiceLogo
                        serviceName={preset.name}
                        fallbackIcon={preset.icon}
                        fallbackColor={preset.color}
                        size={36}
                      />
                      <span
                        style={{
                          fontFamily: 'Syne, sans-serif',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '10px',
                          color: isSelected ? preset.color : 'var(--text-secondary)',
                          textAlign: 'center',
                          lineHeight: 1.2,
                        }}
                      >
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Custom name (only for Custom) ─────────────── */}
            {form.service_name === 'Custom' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 6,
                  }}
                >
                  Service Name
                </label>
                <input
                  className="input-glass"
                  type="text"
                  placeholder="e.g. Gym, VPN, Canva…"
                  value={form.custom_name}
                  onChange={(e) => setForm({ ...form, custom_name: e.target.value })}
                />
              </div>
            )}

            {/* ── Price ─────────────────────────────────────── */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 6,
                }}
              >
                Price (₦)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: 14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    fontSize: '1rem',
                    pointerEvents: 'none',
                  }}
                >
                  ₦
                </span>
                <input
                  className="input-glass"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  style={{ paddingLeft: 32 }}
                />
              </div>
            </div>

            {/* ── Due Date ──────────────────────────────────── */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 6,
                }}
              >
                Due Date
              </label>
              <input
                className="input-glass"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                required
              />
            </div>

            {/* ── Recurring toggle ──────────────────────────── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F8F9FF',
                border: '1px solid rgba(91,71,224,0.1)',
                borderRadius: 14,
                padding: '14px 16px',
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'var(--text-primary)',
                    marginBottom: 2,
                  }}
                >
                  Recurring Monthly
                </p>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Auto-renews each month
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setForm({ ...form, recurring: !form.recurring })}
                style={{
                  position: 'relative',
                  width: 46,
                  height: 26,
                  borderRadius: 999,
                  background: form.recurring
                    ? 'linear-gradient(135deg, #5B47E0, #7C6EF8)'
                    : '#E5E7EB',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.25s ease',
                  boxShadow: form.recurring
                    ? '0 0 12px rgba(91,71,224,0.4)'
                    : 'none',
                  flexShrink: 0,
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
                    background: '#FFFFFF',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    transition: 'left 0.25s ease',
                  }}
                />
              </button>
            </div>

            {/* ── Action buttons ────────────────────────────── */}
            <div style={{ display: 'flex', gap: 12, paddingTop: 4 }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost"
                style={{ flex: 1, padding: '13px 0', fontSize: '0.875rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-glow"
                style={{ flex: 1, padding: '13px 0', fontSize: '0.875rem' }}
                disabled={saving}
              >
                {saving ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#FFF',
                        animation: 'spin 0.7s linear infinite',
                      }}
                    />
                    Saving…
                  </span>
                ) : subscription ? 'Save Changes' : 'Add Subscription'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Inline spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
