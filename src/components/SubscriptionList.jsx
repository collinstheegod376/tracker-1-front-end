'use client';

// ── SubscriptionList ────────────────────────────────────────
// Displays all subscriptions for the current month
export default function SubscriptionList({ subscriptions, loading, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-light h-16 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="glass-light p-8 text-center rounded-xl">
        <p className="text-3xl mb-3">📋</p>
        <p className="text-purple-400 text-sm font-display" style={{ fontFamily: 'Syne, sans-serif' }}>
          No subscriptions this month
        </p>
        <p className="text-purple-600 text-xs mt-1">Tap a date or the + button to add one</p>
      </div>
    );
  }

  function daysUntil(dateStr) {
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  }

  function dueBadge(days) {
    if (days < 0) return { label: 'Overdue', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
    if (days === 0) return { label: 'Today', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
    if (days <= 3) return { label: `${days}d left`, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
    return { label: `${days}d`, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' };
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((sub, i) => {
        const days = daysUntil(sub.due_date);
        const badge = dueBadge(days);
        const name = sub.custom_name || sub.service_name;

        return (
          <div
            key={sub.id}
            className="glass-light flex items-center gap-3 px-4 py-3.5 animate-slide-in-right rounded-xl"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: `${sub.color}25`, border: `1px solid ${sub.color}50` }}
            >
              {sub.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-display truncate" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                {name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-purple-500">
                  {new Date(sub.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                {sub.recurring && (
                  <span className="text-purple-700 text-xs">↻</span>
                )}
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ color: badge.color, background: badge.bg, fontSize: '10px' }}
                >
                  {badge.label}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-display font-700 text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
                ${parseFloat(sub.price).toFixed(2)}
              </p>
              <div className="flex gap-1.5 mt-1 justify-end">
                <button
                  onClick={() => onEdit(sub)}
                  className="text-purple-500 hover:text-purple-300 text-xs transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(sub.id)}
                  className="text-red-600 hover:text-red-400 text-xs transition-colors"
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
