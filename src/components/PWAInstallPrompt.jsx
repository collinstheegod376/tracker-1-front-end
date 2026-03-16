'use client';

import { useState, useEffect } from 'react';

// ── PWAInstallPrompt ────────────────────────────────────────
// Shows a native-style "Add to Home Screen" prompt
export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Listen for browser's beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show after 3 seconds if not dismissed before
      const dismissed = sessionStorage.getItem('pwa_dismissed');
      if (!dismissed) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowBanner(false);
    sessionStorage.setItem('pwa_dismissed', 'true');
  }

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-24 left-4 right-4 max-w-sm mx-auto glass p-4 flex items-center gap-3 z-50 animate-slide-up"
      style={{ boxShadow: '0 0 30px rgba(109,40,217,0.4)' }}
    >
      <div className="w-10 h-10 bg-purple-700/40 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
        📲
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-display" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
          Add to Home Screen
        </p>
        <p className="text-xs text-purple-400 mt-0.5">Get the app experience</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button onClick={handleDismiss} className="text-purple-600 text-xs hover:text-purple-400">
          Not now
        </button>
        <button onClick={handleInstall} className="btn-glow text-xs px-3 py-1.5">
          Install
        </button>
      </div>
    </div>
  );
}
