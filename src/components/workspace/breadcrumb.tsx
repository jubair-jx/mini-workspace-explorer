"use client";

import { ChevronRight, Home } from "lucide-react";
import { useWorkspaceStore } from "@/lib/store";
import { getPath } from "@/lib/utils";

export function Breadcrumb() {
  const items = useWorkspaceStore((s) => s.items);
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);
  const selectFolder = useWorkspaceStore((s) => s.selectFolder);

  const path = getPath(items, selectedFolderId);

  return (
    <div className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm">
      {path.map((item, index) => {
        const isLast = index === path.length - 1;
        return (
          <span key={item.id} className="flex shrink-0 items-center gap-1">
            {index === 0 && <Home className="mr-0.5 h-3.5 w-3.5 text-zinc-400" />}
            <button
              type="button"
              onClick={() => selectFolder(item.id)}
              disabled={isLast}
              className={
                isLast
                  ? "font-semibold text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 transition-colors hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
              }
            >
              {item.name}
            </button>
            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />}
          </span>
        );
      })}
    </div>
  );
}
