"use client";

import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <FolderOpen className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
      </div>
      <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      <p className="mt-1 max-w-xs text-sm text-zinc-400 dark:text-zinc-500">{description}</p>
    </motion.div>
  );
}
