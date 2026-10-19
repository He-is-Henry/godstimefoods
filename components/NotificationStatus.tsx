"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Info } from "lucide-react";
import { registerPushNotifications } from "@/lib/push";

export default function NotificationStatus() {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");
  const [enabling, setEnabling] = useState(false);

  const checkPermission = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    } else {
      setPermission("unsupported");
    }
  };

  useEffect(() => {
    const init = () => checkPermission();

    init();
  }, []);

  const handleEnable = async () => {
    setEnabling(true);
    try {
      await registerPushNotifications();
    } catch (err) {
      console.error("Failed to enable notifications:", err);
    } finally {
      checkPermission();
      setEnabling(false);
    }
  };

  if (permission === "unsupported") return null;

  return (
    <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/50 text-sm">
      {permission === "denied" && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5 text-amber-400 font-semibold text-xs">
            <BellOff className="h-4 w-4 shrink-0" />
            <span>Push Notifications Blocked</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            You have blocked notifications for this site, so you won&apos;t receive live updates when your food order status changes.
          </p>
          <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <Info className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <span>
              To enable: Click the lock or settings icon in your browser address bar next to the URL and change <strong>Notifications</strong> to <strong>Allow</strong>.
            </span>
          </div>
        </div>
      )}

      {permission === "default" && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-300 font-semibold text-xs">
              <Bell className="h-4 w-4 shrink-0 text-purple-400" />
              <span>Push Notifications Disabled</span>
            </div>
            <p className="text-xs text-slate-400">
              Get live push alerts when your food is ready or en route.
            </p>
          </div>
          <button
            type="button"
            onClick={handleEnable}
            disabled={enabling}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            {enabling ? "Enabling..." : "Enable Live Alerts"}
          </button>
        </div>
      )}

      {permission === "granted" && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-300">
            <BellRing className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Push Notifications</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
            Enabled
          </span>
        </div>
      )}
    </div>
  );
}