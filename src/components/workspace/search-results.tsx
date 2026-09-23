"use client";

import { motion } from "framer-motion";
import { File, Folder } from "lucide-react";
import { useWorkspaceStore } from "@/lib/store";
import { searchItems } from "@/lib/utils";
import { EmptyState } from "./empty-state";

export function SearchResults() {
  const items = useWorkspaceStore((s) => s.items);
  const searchQuery = useWorkspaceStore((s) => s.searchQuery);
  const selectFolder = useWorkspaceStore((s) => s.selectFolder);
  const openFile = useWorkspaceStore((s) => s.openFile);

  const results = searchItems(items, searchQuery);

  if (results.length === 0) {
    return (
      <EmptyState title={`No results for "${searchQuery.trim()}"`} description="Try a different name or check for typos." />
    );
  }

  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {results.length} result{results.length === 1 ? "" : "s"} for &quot;{searchQuery.trim()}&quot;
      </p>
      <div className="flex flex-col gap-1.5">
        {results.map(({ item, pathString }, index) => (
          <motion.button
            key={item.id}
            type="button"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, delay: index * 0.02 }}
            onClick={() => {
              if (item.type === "folder") {
                selectFolder(item.id);
              } else if (item.parentId) {
                selectFolder(item.parentId);
                openFile(item.id);
              }
            }}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
          >
            <div
              className={
                item.type === "folder"
                  ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400"
                  : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }
            >
              {item.type === "folder" ? <Folder className="h-4 w-4" /> : <File className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{item.name}</p>
              <p className="truncate text-xs text-zinc-400 dark:text-zinc-500">{pathString}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
