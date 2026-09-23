"use client";

import { useState, type FormEvent } from "react";
import { Modal } from "./modal";
import { cn } from "@/lib/utils";

interface NameDialogProps {
  open: boolean;
  title: string;
  confirmLabel: string;
  initialValue?: string;
  placeholder?: string;
  onSubmit: (value: string) => { success: boolean; error?: string };
  onClose: () => void;
}

export function NameDialog({
  open,
  title,
  confirmLabel,
  initialValue = "",
  placeholder,
  onSubmit,
  onClose,
}: NameDialogProps) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setValue(initialValue);
      setError(null);
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const result = onSubmit(value);
    if (!result.success) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        <input
          autoFocus
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          className={cn(
            "mt-4 w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 dark:text-zinc-100",
            error
              ? "border-red-400 focus:border-red-500 dark:border-red-500/70"
              : "border-zinc-300 focus:border-indigo-500 dark:border-zinc-700 dark:focus:border-indigo-400"
          )}
        />
        {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg px-3.5 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
