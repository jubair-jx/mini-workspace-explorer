"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { useWorkspaceStore } from "@/lib/store";
import { getFolderChildren } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { WorkspaceItem } from "@/lib/types";

interface TreeNodeProps {
  item: WorkspaceItem;
  depth: number;
  onNavigate?: () => void;
}

export function TreeNode({ item, depth, onNavigate }: TreeNodeProps) {
  const items = useWorkspaceStore((s) => s.items);
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);
  const expandedIds = useWorkspaceStore((s) => s.expandedIds);
  const selectFolder = useWorkspaceStore((s) => s.selectFolder);
  const toggleExpand = useWorkspaceStore((s) => s.toggleExpand);

  const children = getFolderChildren(items, item.id);
  const isExpanded = expandedIds.includes(item.id);
  const isSelected = selectedFolderId === item.id;
  const hasChildren = children.length > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          selectFolder(item.id);
          onNavigate?.();
        }}
        style={{ paddingLeft: depth * 16 + 8 }}
        className={cn(
          "group flex w-full items-center gap-1.5 rounded-lg py-1.5 pr-2 text-left text-sm transition-colors",
          isSelected
            ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
            : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/70"
        )}
      >
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) toggleExpand(item.id);
          }}
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded text-zinc-400 transition-transform dark:text-zinc-500",
            hasChildren && isExpanded && "rotate-90",
            !hasChildren && "invisible"
          )}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
        {isSelected || isExpanded ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-indigo-500 dark:text-indigo-400" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
        )}
        <span className="truncate">{item.name}</span>
      </button>
      <AnimatePresence initial={false}>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children.map((child) => (
              <TreeNode key={child.id} item={child} depth={depth + 1} onNavigate={onNavigate} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
