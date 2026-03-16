'use client';

import { getServiceMeta } from '../lib/serviceLogos';

/**
 * ServiceLogo
 * Renders a service brand logo (from Simple Icons CDN) inside a styled circle.
 * Falls back to the emoji icon or a letter avatar for unknown services.
 *
 * Props:
 *   serviceName  – the canonical service name (e.g. "Netflix")
 *   fallbackIcon – emoji / string to show when no logo is found
 *   fallbackColor – hex color used for the fallback avatar background tint
 *   size         – container size in pixels (default 40)
 */
export default function ServiceLogo({
  serviceName,
  fallbackIcon,
  fallbackColor = '#6366F1',
  size = 40,
}) {
  const meta = getServiceMeta(serviceName);
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size * 0.28,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  if (meta) {
    return (
      <div
        style={{
          ...containerStyle,
          background: meta.bg,
          border: `1.5px solid ${meta.color}22`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={meta.logoUrl}
          alt={serviceName}
          width={size * 0.56}
          height={size * 0.56}
          style={{ objectFit: 'contain' }}
          onError={(e) => {
            // If CDN image fails, hide img and show fallback
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
        {/* Hidden emoji fallback (shown if img errors) */}
        <span
          style={{
            display: 'none',
            fontSize: size * 0.45,
            lineHeight: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {fallbackIcon}
        </span>
      </div>
    );
  }

  // No known logo — show emoji icon or letter avatar
  const display = fallbackIcon || (serviceName?.[0]?.toUpperCase() ?? '?');
  const isEmoji = /\p{Emoji}/u.test(display);

  return (
    <div
      style={{
        ...containerStyle,
        background: `${fallbackColor}18`,
        border: `1.5px solid ${fallbackColor}30`,
      }}
    >
      {isEmoji ? (
        <span style={{ fontSize: size * 0.45, lineHeight: 1 }}>{display}</span>
      ) : (
        <span
          style={{
            fontSize: size * 0.4,
            fontWeight: 700,
            color: fallbackColor,
            fontFamily: 'Syne, sans-serif',
          }}
        >
          {display}
        </span>
      )}
    </div>
  );
}
