'use client';

// ── Calendar Component ──────────────────────────────────────
// Monthly grid calendar with subscription indicators on dates
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function Calendar({ currentMonth, onMonthChange, subsByDate, onDayClick }) {
  const today = new Date();
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Build the 6-week grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

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

  function prevMonth() {
    onMonthChange(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    onMonthChange(new Date(year, month + 1, 1));
  }

  function isToday(day, isCurrent) {
    return (
      isCurrent &&
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
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
    const d = isCurrent ? new Date(year, month, day) : null;
    if (d) onDayClick(d);
  }

  return (
    <div className="glass p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="btn-ghost px-3 py-1.5 text-sm"
          aria-label="Previous month"
        >
          ‹
        </button>
        <h2 className="font-display font-700 text-white text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="btn-ghost px-3 py-1.5 text-sm"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-purple-500 font-display pb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          const dateKey = getDateKey(cell.day, cell.currentMonth);
          const daySubs = subsByDate[dateKey] || [];
          const today_ = isToday(cell.day, cell.currentMonth);

          return (
            <div
              key={i}
              className={`cal-day ${!cell.currentMonth ? 'other-month' : ''} ${
                daySubs.length > 0 ? 'has-items' : ''
              } ${today_ ? 'today' : ''}`}
              onClick={() => handleCellClick(cell.day, cell.currentMonth)}
            >
              <span
                className={`text-xs leading-none ${
                  today_
                    ? 'text-white font-700 text-neon'
                    : cell.currentMonth
                    ? 'text-purple-200'
                    : 'text-purple-700'
                }`}
                style={{ fontFamily: 'Syne, sans-serif', fontWeight: today_ ? 700 : 400 }}
              >
                {cell.day}
              </span>

              {/* Subscription color dots */}
              {daySubs.length > 0 && (
                <div className="flex flex-wrap justify-center gap-0.5 mt-1 max-w-full px-0.5">
                  {daySubs.slice(0, 3).map((sub) => (
                    <div
                      key={sub.id}
                      className="sub-dot"
                      style={{ backgroundColor: sub.color || '#8b5cf6' }}
                      title={sub.custom_name || sub.service_name}
                    />
                  ))}
                  {daySubs.length > 3 && (
                    <span className="text-purple-500" style={{ fontSize: '6px' }}>+</span>
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
