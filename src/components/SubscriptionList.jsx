'use client';

import ServiceLogo from './ServiceLogo';

// ── SubscriptionList ────────────────────────────────────────
// Displays all subscriptions for the current month.
// Currency: Nigerian Naira (₦)
export default function SubscriptionList({ subscriptions, loading, onEdit, onDelete }) {

  // ── Loading skeleton ──────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl"
            style={{
              height: 72,
              background: '#F0F1FF',
              border: '1px solid rgba(91,71,224,0.08)',
            }}
          />
        ))}
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────
  if (subscriptions.length === 0) {
    return (
      <div
        className="text-center py-12 rounded-2xl"
        style={{
          background: '#FAFBFF',
          border: '1.5px dashed rgba(91,71,224,0.18)',
        }}
      >
        <p style={{ fontSize: 36, marginBottom: 10 }}>📋</p>
        <p
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          No subscriptions this month
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>
          Tap a date or the + button to add one
        </p>
      </div>
    );
  }

  // ── Helpers ───────────────────────────────────────────────
  function daysUntil(dateStr) {
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  }

  function dueBadge(days) {
    if (days < 0)  return { label: 'Overdue', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' };
    if (days === 0) return { label: 'Today',   color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' };
    if (days <= 3)  return { label: `${days}d left`, color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' };
    return { label: `${days}d`, color: '#5B47E0', bg: '#F0EEFF', border: '#C4B8FF' };
  }

  // Format with commas: 15000 → "15,000.00"
  function formatNaira(amount) {
    return parseFloat(amount).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // ── Render list ───────────────────────────────────────────
  return (
    <div className="space-y-3">
      {subscriptions.map((sub, i) => {
        const days  = daysUntil(sub.due_date);
        const badge = dueBadge(days);
        const name  = sub.custom_name || sub.service_name;

        return (
          <div
            key={sub.id}
            className="glass-light animate-slide-in-right"
            style={{
              animationDelay: `${i * 0.05}s`,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '14px 16px',
              borderRadius: 16,
            }}
          >
            {/* ── Service Logo ─────────────────────────────── */}
            <ServiceLogo
              serviceName={sub.service_name}
              fallbackIcon={sub.icon}
              fallbackColor={sub.color || '#5B47E0'}
              size={44}
            />

            {/* ── Info ─────────────────────────────────────── */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: 4,
                }}
              >
                {name}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Due date */}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {new Date(sub.due_date).toLocaleDateString('en-NG', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>

                {/* Recurring icon */}
                {sub.recurring && (
                  <span
                    title="Recurring monthly"
                    style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}
                  >
                    ↻
                  </span>
                )}

                {/* Due badge */}
                <span
                  className="badge"
                  style={{
                    color: badge.color,
                    background: badge.bg,
                    border: `1px solid ${badge.border}`,
                  }}
                >
                  {badge.label}
                </span>
              </div>
            </div>

            {/* ── Price + Actions ───────────────────────────── */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  marginBottom: 6,
                  letterSpacing: '-0.01em',
                }}
              >
                ₦{formatNaira(sub.price)}
              </p>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onEdit(sub)}
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--accent)',
                    fontWeight: 600,
                    background: 'var(--accent-light)',
                    border: 'none',
                    borderRadius: 6,
                    padding: '3px 8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(91,71,224,0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--accent-light)')}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(sub.id)}
                  style={{
                    fontSize: '0.72rem',
                    color: '#DC2626',
                    fontWeight: 600,
                    background: '#FEF2F2',
                    border: 'none',
                    borderRadius: 6,
                    padding: '3px 8px',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#FEE2E2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#FEF2F2')}
                >
                  Del
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
