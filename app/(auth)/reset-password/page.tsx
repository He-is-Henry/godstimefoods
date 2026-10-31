import { Suspense } from "react";
import ResetPasswordClient from "./reset-passowrd.client";

function ResetPasswordSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 rounded-2xl bg-purple-950/20 border border-purple-500/20 backdrop-blur-xl shadow-2xl shadow-purple-950/50 animate-pulse">
        <div className="text-center mb-6 space-y-3">
          <div className="h-9 w-3/4 mx-auto bg-purple-900/50 rounded-lg" />
          <div className="h-4 w-2/3 mx-auto bg-purple-900/30 rounded" />
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <div className="h-3 w-28 bg-purple-900/50 rounded" />
            <div className="h-12 w-full bg-slate-900/80 border border-purple-500/20 rounded-xl" />
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
            <div className="h-3 w-32 bg-purple-900/50 rounded" />

            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-slate-800" />
                <div className="h-3 w-40 bg-purple-900/30 rounded" />
              </div>
            ))}
          </div>

          <div className="h-12 w-full rounded-xl bg-purple-900/50" />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordClient />
    </Suspense>
  );
          }
