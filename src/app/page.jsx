'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { subscriptions as api, auth, notifications } from '../lib/api';
import Calendar from '../components/Calendar';
import SubscriptionModal from '../components/SubscriptionModal';
import TotalBanner from '../components/TotalBanner';
import SubscriptionList from '../components/SubscriptionList';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [allSubs, setAllSubs] = useState([]);
  const [summary, setSummary] = useState({ total_monthly: 0, subscription_count: 0 });
  const [selectedDate, setSelectedDate] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    const u = auth.getUser();
    if (!u) {
      router.push('/login');
      return;
    }
    setUser(u);
    registerServiceWorker();
  }, []);

  // Load data when month changes
  useEffect(() => {
    if (user) fetchData();
  }, [user, currentMonth]);

  async function fetchData() {
    try {
      setLoading(true);
      const month = currentMonth.getMonth() + 1;
      const year = currentMonth.getFullYear();
      const [subsData, sumData] = await Promise.all([
        api.list(month, year),
        api.summary(),
      ]);
      setAllSubs(subsData.subscriptions || []);
      setSummary(sumData);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  }

  async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker registered');
      } catch (err) {
        console.error('SW registration failed:', err);
      }
    }
  }

  function handleDayClick(date) {
    setSelectedDate(date);
    setEditingSub(null);
    setModalOpen(true);
  }

  function handleEditSub(sub) {
    setEditingSub(sub);
    setSelectedDate(new Date(sub.due_date));
    setModalOpen(true);
  }

  async function handleSaveSub(formData) {
    try {
      if (editingSub) {
        await api.update(editingSub.id, formData);
      } else {
        await api.create(formData);
      }
      setModalOpen(false);
      setEditingSub(null);
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteSub(id) {
    if (!confirm('Delete this subscription?')) return;
    try {
      await api.delete(id);
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  }

  // Group subscriptions by date for calendar display
  const subsByDate = allSubs.reduce((acc, sub) => {
    const dateKey = sub.due_date?.slice(0, 10);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(sub);
    return acc;
  }, {});

  return (
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="px-4 pt-8 pb-4 flex items-center justify-between max-w-lg mx-auto">
        <div>
          <h1 className="text-2xl font-display font-800 text-white" style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
            <span className="text-neon">Sub</span>Track
          </h1>
          <p className="text-xs text-purple-400 mt-0.5">
            {user?.name ? `Hey, ${user.name.split(' ')[0]} 👋` : 'Your subscriptions'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => notifications.subscribe().then(() => alert('Notifications enabled!')).catch(alert)}
            className="btn-ghost text-xs px-3 py-2"
          >
            🔔
          </button>
          <button
            onClick={auth.logout}
            className="btn-ghost text-xs px-3 py-2"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Total Banner */}
      <div className="px-4 max-w-lg mx-auto mb-4">
        <TotalBanner
          total={parseFloat(summary.total_monthly || 0)}
          count={parseInt(summary.subscription_count || 0)}
          loading={loading}
        />
      </div>

      {/* Calendar */}
      <div className="px-4 max-w-lg mx-auto mb-6">
        <Calendar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          subsByDate={subsByDate}
          onDayClick={handleDayClick}
        />
      </div>

      {/* Subscription List */}
      <div className="px-4 max-w-lg mx-auto pb-24">
        <h2 className="font-display font-700 text-sm text-purple-300 uppercase tracking-widest mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>
          This Month
        </h2>
        <SubscriptionList
          subscriptions={allSubs}
          loading={loading}
          onEdit={handleEditSub}
          onDelete={handleDeleteSub}
        />
      </div>

      {/* Add Button (FAB) */}
      <div className="fixed bottom-6 right-4 z-40">
        <button
          className="btn-glow w-14 h-14 rounded-full text-2xl flex items-center justify-center shadow-2xl"
          onClick={() => { setSelectedDate(new Date()); setEditingSub(null); setModalOpen(true); }}
          aria-label="Add subscription"
        >
          +
        </button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <SubscriptionModal
          date={selectedDate}
          subscription={editingSub}
          onSave={handleSaveSub}
          onClose={() => { setModalOpen(false); setEditingSub(null); }}
        />
      )}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
