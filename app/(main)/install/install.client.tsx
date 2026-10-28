'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Smartphone, Monitor, Share, PlusSquare, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallClient() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running as installed app
    const standalone = window.matchMedia('(display-mode: standalone)').matches;

    const setDetails = () => {
      setIsStandalone(standalone);

      // Check iOS
      const userAgent = window.navigator.userAgent.toLowerCase();
      setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    }
    setDetails();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-3">
        <Image
          src="/android-chrome-192x192.png"
          alt="Godstime Food Canteen"
          width={80}
          height={80}
          className="mx-auto rounded-2xl shadow-md"
        />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Install Godstime Food Canteen
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Get fast access, full-screen ordering, and real-time order tracking notifications directly from your home screen.
        </p>
      </div>

      {isStandalone ? (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            App is Installed!
          </p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            You are running Godstime Food Canteen as a native application.
          </p>
        </div>
      ) : deferredPrompt ? (
        <button
          onClick={handleInstallClick}
          className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
        >
          <Smartphone className="w-5 h-5" />
          Install App Now
        </button>
      ) : isIOS ? (
        <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 border border-slate-800">
          <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
            iOS Safari Instructions
          </p>
          <ol className="text-xs space-y-2.5 text-slate-300">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 font-bold text-purple-400">1</span>
              Tap the <Share className="w-4 h-4 text-purple-400 inline" /> Share button in Safari&apos;s toolbar.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 font-bold text-purple-400">2</span>
              Scroll down and tap <PlusSquare className="w-4 h-4 text-purple-400 inline" /> Add to Home Screen.
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center shrink-0 font-bold text-purple-400">3</span>
              Tap Add in the top right corner.
            </li>
          </ol>
        </div>
      ) : (
        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl space-y-2 text-center">
          <Monitor className="w-6 h-6 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Use your browser menu (three dots in Chrome or Edge) and select <span className="font-semibold text-slate-800 dark:text-slate-200">&quot;Install app&quot;</span> or <span className="font-semibold text-slate-800 dark:text-slate-200">&quot;Add to Home Screen&quot;</span>.
          </p>
        </div>
      )}
    </div>
  );
}