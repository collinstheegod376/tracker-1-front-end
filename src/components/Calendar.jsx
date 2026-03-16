'use client';

// ── Calendar Component ───────────────────────────────────────
// Monthly grid calendar with subscription indicators on dates.
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS   = [
  'January', 'February', 'March',     'April',   'May',      'June',
  'July',    'August',   'September', 'October', 'November', 'December',
];

export default function Calendar({ currentMonth, onMonthChange, subsByDate, onDayClick }) {
  const today = new Date();
  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Build the 6-week grid
  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();

  const cells = [];

  // Previous month overflow
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, currentMonth: false });
  }
  // Current month
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true });
  }
  // Next month overflow
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false });
  }

  function prevMonth() { onMonthChange(new Date(year, month - 1, 1)); }
  function nextMonth() { onMonthChange(new Date(year, month + 1, 1)); }

  function isToday(day, isCurrent) {
    return (
      isCurrent &&
      day === today.getDate() &&
      month === today.getMonth() &&
      year  === today.getFullYear()
    );
  }

  function getDateKey(day, isCurrent) {
    const d = isCurrent
      ? new Date(year, month, day)
      : day <= 15
        ? new Date(year, month + 1, day)
        : new Date(year, month - 1, day);
    return d.toISOString().slice(0, 10);
  }

  function handleCellClick(day, isCurrent) {
    if (isCurrent) onDayClick(new Date(year, month, day));
  }

  return (
    <div
      className="glass"
      style={{ padding: '16px 14px', borderRadius: 20 }}
    >
      {/* ── Month navigation ──────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <button
          onClick={prevMonth}
          className="btn-ghost"
          style={{ padding: '6px 12px', fontSize: '1.1rem', lineHeight: 1 }}
          aria-label="Previous month"
        >
          ‹
        </button>

        <h2
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
          }}
        >
          {MONTHS[month]} {year}
        </h2>

        <button
          onClick={nextMonth}
          className="btn-ghost"
          style={{ padding: '6px 12px', fontSize: '1.1rem', lineHeight: 1 }}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* ── Weekday headers ───────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          marginBottom: 6,
        }}
      >
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 600,
              fontSize: '10px',
              color: 'var(--text-muted)',
              paddingBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Day grid ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
        {cells.map((cell, i) => {
          const dateKey = getDateKey(cell.day, cell.currentMonth);
          const daySubs = subsByDate[dateKey] || [];
          const today_  = isToday(cell.day, cell.currentMonth);

          return (
            <div
              key={i}
              className={`cal-day ${!cell.currentMonth ? 'other-month' : ''} ${daySubs.length > 0 ? 'has-items' : ''} ${today_ ? 'today' : ''}`}
              onClick={() => handleCellClick(cell.day, cell.currentMonth)}
            >
              {/* Day number */}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: today_ ? 22 : 'auto',
                  height: today_ ? 22 : 'auto',
                  borderRadius: today_ ? '50%' : 0,
                  background: today_ ? 'var(--accent)' : 'transparent',
                  color: today_
                    ? '#FFFFFF'
                    : cell.currentMonth
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: today_ || daySubs.length > 0 ? 700 : 400,
                  fontSize: '0.72rem',
                  lineHeight: 1,
                }}
              >
                {cell.day}
              </span>

              {/* Subscription colour dots */}
              {daySubs.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: 2,
                    marginTop: 3,
                    paddingLeft: 2,
                    paddingRight: 2,
                    maxWidth: '100%',
                  }}
                >
                  {daySubs.slice(0, 3).map((sub) => (
                    <div
                      key={sub.id}
                      className="sub-dot"
                      style={{
                        backgroundColor: sub.color || 'var(--accent)',
                        boxShadow: `0 0 4px ${sub.color || 'var(--accent)'}60`,
                      }}
                      title={sub.custom_name || sub.service_name}
                    />
                  ))}
                  {daySubs.length > 3 && (
                    <span style={{ fontSize: 7, color: 'var(--text-muted)' }}>+</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
