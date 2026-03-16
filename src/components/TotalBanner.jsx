'use client';

// ── TotalBanner ──────────────────────────────────────────────
// Displays the total monthly spend prominently at the top.
// Currency: Nigerian Naira (₦)
export default function TotalBanner({ total, count, loading }) {
  // Format number with commas: 50000 → "50,000"
  function formatNaira(amount) {
    return amount.toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #5B47E0 0%, #7C6EF8 55%, #9B8BFF 100%)',
        borderRadius: 20,
        padding: '20px 24px',
        boxShadow: '0 8px 32px rgba(91,71,224,0.35), 0 2px 8px rgba(91,71,224,0.2)',
      }}
    >
      {/* Decorative background circles */}
      <div
        style={{
          position: 'absolute',
          top: -30,
          right: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -40,
          right: 40,
          width: 90,
          height: 90,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10">
        {/* Label */}
        <p
          className="uppercase tracking-widest"
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 600,
            fontSize: '10px',
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.12em',
            marginBottom: 6,
          }}
        >
          Monthly Total
        </p>

        {/* Amount */}
        {loading ? (
          <div
            style={{
              height: 44,
              width: 160,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 10,
              marginBottom: 6,
            }}
            className="animate-pulse"
          />
        ) : (
          <div className="flex items-baseline gap-1" style={{ marginBottom: 4 }}>
            <span
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 400,
                fontSize: '1.4rem',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1,
              }}
            >
              ₦
            </span>
            <span
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: '2.6rem',
                color: '#FFFFFF',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {formatNaira(total)}
            </span>
          </div>
        )}

        {/* Subtitle */}
        <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>
          {loading ? '…' : `${count} active subscription${count !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Yearly projection */}
      {!loading && total > 0 && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
            Yearly projection
          </span>
          <span
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            ₦{formatNaira(total * 12)} / yr
          </span>
        </div>
      )}
    </div>
  );
}
