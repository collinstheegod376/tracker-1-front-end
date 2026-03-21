'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode,    setMode]    = useState('login');
  const [form,    setForm]    = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => { if (auth.isLoggedIn()) router.push('/'); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await auth.login(form.email, form.password);
      else                  await auth.register(form.email, form.password, form.name);
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div
        className="absolute top-0 left-0 right-0 h-72 pointer-events-none"
        style={{
          background: 'linear-gradient(160deg, rgba(0,21,62,0.06) 0%, rgba(0,40,103,0.03) 50%, transparent 100%)',
        }}
      />

      <div className="relative w-full max-w-md">

        {/* Logo block */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg,#00153e,#002867)' }}
          >
            <span className="material-symbols-outlined text-on-primary text-[30px]">account_balance_wallet</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">
            SubTrack
          </h1>
          <p className="text-on-surface-variant text-sm mt-2 font-body">
            Manage all your subscriptions in one place
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 sm:p-8 shadow-sm border border-outline-variant/30">

          {/* Mode toggle */}
          <div
            className="flex rounded-xl overflow-hidden mb-7 p-1"
            style={{ background: '#f2f4f7' }}
          >
            {['login','register'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setError(''); }}
                className={[
                  'flex-1 py-2.5 text-sm font-headline font-semibold rounded-lg transition-all',
                  mode === m
                    ? 'primary-gradient text-on-primary shadow-sm'
                    : 'text-outline hover:text-on-surface',
                ].join(' ')}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Full Name
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-surface-tint/30 focus:border-surface-tint/60 transition-all placeholder-outline"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-surface-tint/30 focus:border-surface-tint/60 transition-all placeholder-outline"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-label font-semibold text-on-surface-variant uppercase tracking-widest mb-1.5">
                Password
              </label>
              <input
                className="w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-sm font-body focus:outline-none focus:ring-2 focus:ring-surface-tint/30 focus:border-surface-tint/60 transition-all placeholder-outline"
                type="password"
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-error-container text-on-error-container text-sm font-body border border-error/20 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full primary-gradient text-on-primary py-3 rounded-full text-sm font-headline font-bold shadow-sm hover:opacity-90 transition-opacity mt-2 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-outline mt-6">
          🔒 Your data is encrypted and secure
        </p>
      </div>
    </div>
  );
}
