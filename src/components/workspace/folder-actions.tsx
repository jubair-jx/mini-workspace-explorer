"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useWorkspaceStore, ROOT_ID } from "@/lib/store";
import { ItemMenu } from "@/components/ui/item-menu";
import { NameDialog } from "@/components/ui/name-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { collectDescendantIds } from "@/lib/utils";

/** Rename/delete controls for the folder currently being browsed. */
export function FolderActions() {
  const items = useWorkspaceStore((s) => s.items);
  const selectedFolderId = useWorkspaceStore((s) => s.selectedFolderId);
  const renameItem = useWorkspaceStore((s) => s.renameItem);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);

  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const folder = items[selectedFolderId];
  if (!folder || selectedFolderId === ROOT_ID) return null;

  const descendantCount = collectDescendantIds(items, folder.id).size - 1;

  return (
    <>
      <ItemMenu onRename={() => setRenaming(true)} onDelete={() => setDeleting(true)} />

      <NameDialog
        open={renaming}
        title="Rename folder"
        confirmLabel="Rename"
        initialValue={folder.name}
        onClose={() => setRenaming(false)}
        onSubmit={(value) => {
          const result = renameItem(folder.id, value);
          if (result.success) toast.success("Renamed successfully");
          return result;
        }}
      />

      <ConfirmDialog
        open={deleting}
        title={`Delete "${folder.name}"?`}
        description={
          descendantCount > 0
            ? `This folder contains ${descendantCount} item${descendantCount === 1 ? "" : "s"}. Deleting it will permanently remove everything inside, and you'll be taken back to its parent folder.`
            : "This action cannot be undone."
        }
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleting(false)}
        onConfirm={() => {
          deleteItem(folder.id);
          setDeleting(false);
          toast.success(`"${folder.name}" deleted`);
        }}
      />
    </>
  );
}
