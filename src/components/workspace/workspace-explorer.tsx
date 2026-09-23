"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useWorkspaceStore } from "@/lib/store";
import { TopBar } from "./top-bar";
import { Sidebar } from "./sidebar";
import { Breadcrumb } from "./breadcrumb";
import { FolderActions } from "./folder-actions";
import { Toolbar } from "./toolbar";
import { ItemGrid } from "./item-grid";
import { FileEditor } from "./file-editor";
import { SearchResults } from "./search-results";

export function WorkspaceExplorer() {
  const hasHydrated = useWorkspaceStore((s) => s.hasHydrated);
  const openFileId = useWorkspaceStore((s) => s.openFileId);
  const searchQuery = useWorkspaceStore((s) => s.searchQuery);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [prevOpenFileId, setPrevOpenFileId] = useState(openFileId);

  useEffect(() => {
    useWorkspaceStore.persist.rehydrate();
  }, []);

  if (openFileId !== prevOpenFileId) {
    setPrevOpenFileId(openFileId);
    setMobileSidebarOpen(false);
  }

  const showSearch = searchQuery.trim().length > 0;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <TopBar onMenuClick={() => setMobileSidebarOpen(true)} />

      <div className="relative flex flex-1 overflow-hidden">
        <aside className="hidden w-72 shrink-0 border-r border-zinc-200 bg-white md:block dark:border-zinc-800 dark:bg-zinc-950">
          <Sidebar />
        </aside>

        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 z-30 bg-black/40 md:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-y-0 left-0 z-40 w-72 border-r border-zinc-200 bg-white shadow-2xl md:hidden dark:border-zinc-800 dark:bg-zinc-950"
              >
                <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!hasHydrated ? (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              Loading workspace…
            </div>
          ) : showSearch ? (
            <SearchResults />
          ) : openFileId ? (
            <FileEditor fileId={openFileId} />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <Breadcrumb />
                  <FolderActions />
                </div>
                <Toolbar />
              </div>
              <ItemGrid />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
