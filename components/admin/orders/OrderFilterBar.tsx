"use client";

import { Search } from "lucide-react";

interface OrderFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;
}

const STATUSES = ["ALL", "PENDING", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function OrderFilterBar({
  searchQuery,
  setSearchQuery,
  selectedStatus,
  setSelectedStatus,
}: OrderFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search Order ID, Customer Name, Phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto">
        {STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedStatus === status
                ? "bg-purple-600 text-white shadow-md shadow-purple-950"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {status.replace(/_/g, " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
