"use client";

import { useWorkspaceStore, ROOT_ID } from "@/lib/store";
import { TreeNode } from "./tree-node";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const items = useWorkspaceStore((s) => s.items);
  const root = items[ROOT_ID];

  if (!root) return null;

  return (
    <nav className="flex h-full flex-col overflow-y-auto p-3">
      <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        Folders
      </p>
      <TreeNode item={root} depth={0} onNavigate={onNavigate} />
    </nav>
  );
}
