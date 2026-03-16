import './globals.css';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata = {
  title: 'SubTrack – Subscription Manager',
  description: 'Track all your subscriptions in one beautiful place',
  manifest: '/manifest.json',
  themeColor: '#5B47E0',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SubTrack',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
