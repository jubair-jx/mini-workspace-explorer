"use client";

import { AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "@/lib/store";
import { getChildren } from "@/lib/utils";
import { ItemCard } from "./item-card";
import { EmptyState } from "./empty-state";

export function ItemGrid() {
  const items = useWorkspaceStore((s) => s.items);
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);
  const children = getChildren(items, selectedFolderId);

  if (children.length === 0) {
    return (
      <EmptyState
        title="This folder is empty"
        description="Create a new folder or text file to get started."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence initial={false}>
        {children.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  );
}
