// ============================================================
// API Client - Handles all requests to the SubTrack backend
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Get stored JWT token
function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('subtrack_token');
}

// Main fetch wrapper with auth headers
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // If 401, token expired — clear and redirect
  if (response.status === 401) {
    localStorage.removeItem('subtrack_token');
    localStorage.removeItem('subtrack_user');
    window.location.href = '/login';
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API error ${response.status}`);
  }

  return data;
}

// ── Auth ────────────────────────────────────────────────────
export const auth = {
  async register(email, password, name) {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    localStorage.setItem('subtrack_token', data.token);
    localStorage.setItem('subtrack_user', JSON.stringify(data.user));
    return data;
  },

  async login(email, password) {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('subtrack_token', data.token);
    localStorage.setItem('subtrack_user', JSON.stringify(data.user));
    return data;
  },

  logout() {
    localStorage.removeItem('subtrack_token');
    localStorage.removeItem('subtrack_user');
    window.location.href = '/login';
  },

  getUser() {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('subtrack_user');
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn() {
    return !!getToken();
  },
};

// ── Subscriptions ───────────────────────────────────────────
export const subscriptions = {
  async list(month, year) {
    const params = month && year ? `?month=${month}&year=${year}` : '';
    return apiFetch(`/api/subscriptions${params}`);
  },

  async summary() {
    return apiFetch('/api/subscriptions/summary');
  },

  async create(data) {
    return apiFetch('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return apiFetch(`/api/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return apiFetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
  },
};

// ── Push Notifications ───────────────────────────────────────
export const notifications = {
  async subscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    const registration = await navigator.serviceWorker.ready;
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    // Convert VAPID key to Uint8Array
    const applicationServerKey = urlBase64ToUint8Array(vapidKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    // Send subscription to backend
    await apiFetch('/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });

    return subscription;
  },

  async sendTest() {
    return apiFetch('/api/notifications/send-test', { method: 'POST' });
  },
};

// Helper: convert VAPID base64 key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
