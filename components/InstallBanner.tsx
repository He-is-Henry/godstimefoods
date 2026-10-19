'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const DISMISS_KEY = 'pwa_install_dismissed_until';
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Do not show if already running as an installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) return;

    // 2. Check 14-day dismissal window
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    const expiryTime = Date.now() + FOURTEEN_DAYS_MS;
    localStorage.setItem(DISMISS_KEY, expiryTime.toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 bg-slate-900/95 backdrop-blur border border-purple-500/30 text-white p-4 rounded-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Image
          src="/android-chrome-192x192.png"
          alt="App Icon"
          width={40}
          height={40}
          className="rounded-lg shrink-0"
        />
        <div>
          <h4 className="text-sm font-semibold text-purple-200">Install App</h4>
          <p className="text-xs text-slate-300">Add to your home screen for quick orders and instant updates.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <button
          onClick={handleDismiss}
          className="px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition whitespace-nowrap"
        >
          Dismiss for 14 days
        </button>
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-md transition"
        >
          Install
        </button>
      </div>
    </div>
  );
}