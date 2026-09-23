"use client";

import { FolderKanban, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchInput } from "./search-input";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Toggle sidebar"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 md:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <FolderKanban className="h-4 w-4" />
        </div>
        <span className="hidden text-sm font-semibold text-zinc-900 sm:inline dark:text-zinc-100">
          Workspace Explorer
        </span>
      </div>

      <div className="mx-auto w-full max-w-xl">
        <SearchInput />
      </div>

      <ThemeToggle />
    </header>
  );
}
