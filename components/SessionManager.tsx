"use client";

import { getSessions, revokeAllSessions, revokeSession } from "@/lib/auth";
import { Laptop, Monitor, ShieldAlert, Smartphone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function SessionManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    getSessions()
      .then((res) => setSessions(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRevoke = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await revokeSession(id);
      setSessions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeAll = async () => {
    setActionLoading("ALL");
    try {
      const res = await revokeAllSessions();
      setSessions(res);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    const info = deviceInfo.toLowerCase();
    if (info.includes("mobile") || info.includes("android") || info.includes("iphone")) {
      return <Smartphone className="h-5 w-5 text-purple-400" />;
    }
    if (info.includes("mac") || info.includes("windows") || info.includes("linux")) {
      return <Laptop className="h-5 w-5 text-purple-400" />;
    }
    return <Monitor className="h-5 w-5 text-purple-400" />;
  };

  if (loading) {
    return (
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 animate-pulse">
        <div className="h-6 w-40 bg-slate-800 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-slate-800/50 rounded-xl" />
          <div className="h-16 bg-slate-800/50 rounded-xl" />
        </div>
      </div>
    );
  }

  const otherSessionsCount = sessions.filter((s) => !s.currentDevice).length;

  return (
    <div className="mt-8 rounded-2xl border border-purple-500/20 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Active Sessions & Devices
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage devices currently logged into your account.
          </p>
        </div>

        {otherSessionsCount > 0 && (
          <button
            onClick={handleRevokeAll}
            disabled={actionLoading === "ALL"}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4" />
            {actionLoading === "ALL" ? "Revoking..." : "Revoke All Other Devices"}
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${session.currentDevice
                ? "border-purple-500/40 bg-purple-950/20"
                : "border-slate-800/80 bg-slate-950/40 hover:border-slate-700"
              }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                {getDeviceIcon(session.deviceInfo)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">
                    {session.deviceInfo}
                  </span>
                  {session.currentDevice && (
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      Current Device
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span>{session.location || session.ipAddress}</span>
                  <span>•</span>
                  <span>
                    Last active {new Date(session.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {!session.currentDevice && (
              <button
                onClick={() => handleRevoke(session.id)}
                disabled={actionLoading === session.id}
                className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all disabled:opacity-50 cursor-pointer"
                aria-label="Revoke Session"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
