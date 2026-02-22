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
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display mb-2" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
            <span className="text-neon">Sub</span>
            <span className="text-white">Track</span>
          </h1>
          <p className="text-purple-400 text-sm">Manage all your subscriptions</p>
        </div>

        {/* Card */}
        <div className="glass p-6">
          {/* Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-purple-800 mb-6">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 text-sm font-display transition-all ${
                  mode === m
                    ? 'bg-purple-700 text-white'
                    : 'text-purple-400 hover:text-purple-300'
                }`}
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs text-purple-400 mb-1.5 font-display" style={{ fontFamily: 'Syne, sans-serif' }}>Name</label>
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
              <label className="block text-xs text-purple-400 mb-1.5 font-display" style={{ fontFamily: 'Syne, sans-serif' }}>Email</label>
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
              <label className="block text-xs text-purple-400 mb-1.5 font-display" style={{ fontFamily: 'Syne, sans-serif' }}>Password</label>
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
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2 animate-fade-in">
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
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-purple-600 mt-6">
          Your data is encrypted and private
        </p>
      </div>
    </div>
  );
}
