'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.isLoggedIn()) router.push('/');
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await auth.login(form.email, form.password);
      } else {
        await auth.register(form.email, form.password, form.name);
      }
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up">

        {/* ── Logo ──────────────────────────────────────────── */}
        <div className="text-center mb-8">
          {/* Icon mark */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #5B47E0 0%, #7C6EF8 100%)',
              boxShadow: '0 8px 24px rgba(91,71,224,0.35)',
            }}
          >
            <span style={{ fontSize: 28 }}>📊</span>
          </div>

          <h1
            className="text-4xl font-display mb-1"
            style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--text-primary)' }}
          >
            <span className="text-neon">Sub</span>Track
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Manage all your subscriptions
          </p>
        </div>

        {/* ── Card ──────────────────────────────────────────── */}
        <div
          className="glass p-6"
          style={{ boxShadow: '0 8px 32px rgba(91,71,224,0.12), 0 0 0 1px rgba(91,71,224,0.08)' }}
        >
          {/* Tab Toggle */}
          <div
            className="flex rounded-xl overflow-hidden mb-6"
            style={{
              border: '1.5px solid rgba(91,71,224,0.15)',
              background: '#F5F6FF',
            }}
          >
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className="flex-1 py-2.5 text-sm font-display transition-all"
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 600,
                  background: mode === m
                    ? 'linear-gradient(135deg, #5B47E0 0%, #7C6EF8 100%)'
                    : 'transparent',
                  color: mode === m ? '#FFFFFF' : 'var(--text-muted)',
                  borderRadius: 10,
                  margin: 3,
                  transition: 'all 0.2s ease',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label
                  className="block text-xs mb-1.5 font-display"
                  style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                >
                  Full Name
                </label>
                <input
                  className="input-glass"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label
                className="block text-xs mb-1.5 font-display"
                style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >
                Email
              </label>
              <input
                className="input-glass"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label
                className="block text-xs mb-1.5 font-display"
                style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}
              >
                Password
              </label>
              <input
                className="input-glass"
                type="password"
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div
                className="text-sm px-3 py-2.5 rounded-xl animate-fade-in"
                style={{
                  color: '#DC2626',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-glow w-full py-3 text-sm mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#FFF' }}
                  />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center text-xs mt-6"
          style={{ color: 'var(--text-muted)' }}
        >
          🔒 Your data is encrypted and private
        </p>
      </div>
    </div>
  );
}
