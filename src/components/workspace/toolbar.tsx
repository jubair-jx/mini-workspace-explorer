"use client";

import { useState } from "react";
import { FilePlus, FolderPlus } from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/lib/store";
import { NameDialog } from "@/components/ui/name-dialog";

export function Toolbar() {
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);
  const createItem = useWorkspaceStore((s) => s.createItem);
  const [dialog, setDialog] = useState<"folder" | "file" | null>(null);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setDialog("folder")}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <FolderPlus className="h-4 w-4" />
          <span className="hidden sm:inline">New Folder</span>
        </button>
        <button
          type="button"
          onClick={() => setDialog("file")}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500"
        >
          <FilePlus className="h-4 w-4" />
          <span className="hidden sm:inline">New File</span>
        </button>
      </div>

      <NameDialog
        open={dialog === "folder"}
        title="New folder"
        confirmLabel="Create"
        placeholder="Folder name"
        onClose={() => setDialog(null)}
        onSubmit={(value) => {
          const result = createItem(selectedFolderId, "folder", value);
          if (result.success) toast.success(`Folder "${value.trim()}" created`);
          return result;
        }}
      />
      <NameDialog
        open={dialog === "file"}
        title="New text file"
        confirmLabel="Create"
        placeholder="File name"
        onClose={() => setDialog(null)}
        onSubmit={(value) => {
          const result = createItem(selectedFolderId, "file", value);
          if (result.success) toast.success(`File created`);
          return result;
        }}
      />
    </>
  );
}
