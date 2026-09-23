"use client";

import { Search, X } from "lucide-react";
import { useWorkspaceStore } from "@/lib/store";

export function SearchInput() {
  const searchQuery = useWorkspaceStore((s) => s.searchQuery);
  const setSearchQuery = useWorkspaceStore((s) => s.setSearchQuery);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search the whole workspace…"
        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-8 text-sm text-zinc-800 outline-none transition-colors placeholder:text-zinc-400 focus:border-indigo-400 focus:bg-white dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-indigo-500 dark:focus:bg-zinc-900"
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery("")}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
