"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useWorkspaceStore } from "@/lib/store";
import { getPath } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function FileEditor({ fileId }: { fileId: string }) {
  const items = useWorkspaceStore((s) => s.items);
  const drafts = useWorkspaceStore((s) => s.drafts);
  const selectFolder = useWorkspaceStore((s) => s.selectFolder);
  const closeFile = useWorkspaceStore((s) => s.closeFile);
  const updateDraft = useWorkspaceStore((s) => s.updateDraft);
  const saveDraft = useWorkspaceStore((s) => s.saveDraft);
  const deleteItem = useWorkspaceStore((s) => s.deleteItem);
  const [deleting, setDeleting] = useState(false);

  const file = items[fileId];
  const path = getPath(items, fileId);
  const draft = drafts[fileId];
  const content = draft !== undefined ? draft : file?.content ?? "";
  const isDirty = draft !== undefined && draft !== file?.content;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleSave = () => {
    if (!isDirty) return;
    saveDraft(fileId);
    toast.success("Saved");
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, fileId]);

  if (!file) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className="flex h-full flex-col"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm">
          {path.map((item, index) => {
            const isLast = index === path.length - 1;
            return (
              <span key={item.id} className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => selectFolder(item.id)}
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

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              isDirty ? "text-amber-500" : "text-emerald-500 dark:text-emerald-400"
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", isDirty ? "bg-amber-500" : "bg-emerald-500")} />
            {isDirty ? "Unsaved changes" : "Saved"}
          </span>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-500 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            type="button"
            onClick={() => setDeleting(true)}
            aria-label="Delete file"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => (file.parentId ? selectFolder(file.parentId) : closeFile())}
            aria-label="Close file"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={deleting}
        title={`Delete "${file.name}"?`}
        description={
          isDirty
            ? "You have unsaved changes that will be lost. This action cannot be undone."
            : "This action cannot be undone."
        }
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleting(false)}
        onConfirm={() => {
          deleteItem(fileId);
          toast.success(`"${file.name}" deleted`);
        }}
      />

      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => updateDraft(fileId, e.target.value)}
        spellCheck={false}
        placeholder="Start typing…"
        className="min-h-[50vh] flex-1 resize-none rounded-2xl border border-zinc-200 bg-white p-4 font-mono text-sm leading-relaxed text-zinc-800 shadow-sm outline-none transition-colors focus:border-indigo-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-indigo-500"
      />
    </motion.div>
  );
}
