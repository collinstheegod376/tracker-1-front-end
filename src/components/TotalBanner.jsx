'use client';

// ── TotalBanner ─────────────────────────────────────────────
// Displays the total monthly spend prominently at the top
export default function TotalBanner({ total, count, loading }) {
  return (
    <div
      className="glass p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(109,40,217,0.25), rgba(76,29,149,0.15))',
        border: '1px solid rgba(139,92,246,0.3)',
        boxShadow: '0 0 40px rgba(109,40,217,0.2)',
      }}
    >
      {/* Background glow orb */}
      <div
        className="absolute -top-4 -right-4 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent)' }}
      />

      <div className="relative z-10">
        <p className="text-xs text-purple-400 uppercase tracking-widest font-display mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
          Monthly Total
        </p>

        {loading ? (
          <div className="h-10 w-32 bg-purple-900/40 rounded-lg animate-pulse mt-1" />
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-purple-400 text-xl font-300">$</span>
            <span
              className="text-4xl font-display font-800 text-white"
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, textShadow: '0 0 30px rgba(196,181,253,0.4)' }}
            >
              {total.toFixed(2)}
            </span>
          </div>
        )}

        <p className="text-xs text-purple-500 mt-1.5">
          {loading ? '...' : `${count} active subscription${count !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Yearly projection */}
      {!loading && total > 0 && (
        <div className="mt-3 pt-3 border-t border-purple-800/40 flex items-center justify-between">
          <span className="text-xs text-purple-500">Yearly projection</span>
          <span className="text-xs font-display text-purple-300" style={{ fontFamily: 'Syne, sans-serif' }}>
            ${(total * 12).toFixed(2)} / yr
          </span>
        </div>
      )}
    </div>
  );
}
