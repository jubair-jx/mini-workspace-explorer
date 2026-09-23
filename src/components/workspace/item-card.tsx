"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { File, Folder } from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/lib/store";
import { ItemMenu } from "@/components/ui/item-menu";
import { NameDialog } from "@/components/ui/name-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { collectDescendantIds } from "@/lib/utils";
import type { WorkspaceItem } from "@/lib/types";

interface ItemCardProps {
  item: WorkspaceItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const items = useWorkspaceStore((s) => s.items);
  const selectFolder = useWorkspaceStore((s) => s.selectFolder);
  const openFile = useWorkspaceStore((s) => s.openFile);
  const renameItem = useWorkspaceStore((s) => s.renameItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);

  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isFolder = item.type === "folder";
  const descendantCount = isFolder ? collectDescendantIds(items, item.id).size - 1 : 0;

  return (
    <>
      <motion.div
        layout
        role="button"
        tabIndex={0}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        onClick={() => (isFolder ? selectFolder(item.id) : openFile(item.id))}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (isFolder) selectFolder(item.id);
            else openFile(item.id);
          }
        }}
        className="group relative flex cursor-pointer flex-col items-start gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm outline-none transition-colors hover:border-indigo-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-500/50"
      >
        <div className="flex w-full items-start justify-between gap-2">
          <div
            className={
              isFolder
                ? "flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400"
                : "flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }
          >
            {isFolder ? <Folder className="h-5 w-5" /> : <File className="h-5 w-5" />}
          </div>
          <ItemMenu onRename={() => setRenaming(true)} onDelete={() => setDeleting(true)} />
        </div>
        <div className="min-w-0 w-full">
          <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-100">{item.name}</p>
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            {isFolder ? `${descendantCount} item${descendantCount === 1 ? "" : "s"}` : "Text file"}
          </p>
        </div>
      </motion.div>

      <NameDialog
        open={renaming}
        title={`Rename ${isFolder ? "folder" : "file"}`}
        confirmLabel="Rename"
        initialValue={item.name}
        onClose={() => setRenaming(false)}
        onSubmit={(value) => {
          const result = renameItem(item.id, value);
          if (result.success) toast.success("Renamed successfully");
          return result;
        }}
      />

      <ConfirmDialog
        open={deleting}
        title={`Delete "${item.name}"?`}
        description={
          isFolder && descendantCount > 0
            ? `This folder contains ${descendantCount} item${descendantCount === 1 ? "" : "s"}. Deleting it will permanently remove everything inside.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleting(false)}
        onConfirm={() => {
          deleteItem(item.id);
          setDeleting(false);
          toast.success(`"${item.name}" deleted`);
        }}
      />
    </>
  );
}
