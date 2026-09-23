import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { WorkspaceItem, WorkspaceItems } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Folders first, then files, alphabetically (case-insensitive) within each group. */
export function sortItems(items: WorkspaceItem[]): WorkspaceItem[] {
  return [...items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export function getChildren(items: WorkspaceItems, parentId: string): WorkspaceItem[] {
  return sortItems(Object.values(items).filter((item) => item.parentId === parentId));
}

export function getFolderChildren(items: WorkspaceItems, parentId: string): WorkspaceItem[] {
  return getChildren(items, parentId).filter((item) => item.type === "folder");
}

/** Path from root to the given item, inclusive, root first. */
export function getPath(items: WorkspaceItems, id: string): WorkspaceItem[] {
  const path: WorkspaceItem[] = [];
  let current: WorkspaceItem | undefined = items[id];
  while (current) {
    path.unshift(current);
    current = current.parentId ? items[current.parentId] : undefined;
  }
  return path;
}

export function getPathString(items: WorkspaceItems, id: string): string {
  return getPath(items, id)
    .map((item) => item.name)
    .join(" / ");
}

/** Returns the id of the given item plus every descendant id (for cascading deletes). */
export function collectDescendantIds(items: WorkspaceItems, id: string): Set<string> {
  const result = new Set<string>([id]);
  const stack = [id];
  while (stack.length) {
    const current = stack.pop()!;
    for (const item of Object.values(items)) {
      if (item.parentId === current && !result.has(item.id)) {
        result.add(item.id);
        stack.push(item.id);
      }
    }
  }
  return result;
}

export function validateName(
  items: WorkspaceItems,
  parentId: string,
  rawName: string,
  excludeId?: string
): { name: string; error: string | null } {
  const name = rawName.trim();
  if (!name) {
    return { name, error: "Name cannot be empty." };
  }
  if (name.length > 100) {
    return { name, error: "Name is too long (max 100 characters)." };
  }
  if (/[\\/]/.test(name)) {
    return { name, error: "Name cannot contain \\ or / characters." };
  }
  const duplicate = Object.values(items).some(
    (item) =>
      item.parentId === parentId &&
      item.id !== excludeId &&
      item.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    return { name, error: `"${name}" already exists in this folder.` };
  }
  return { name, error: null };
}

export interface SearchMatch {
  item: WorkspaceItem;
  pathString: string;
}

export function searchItems(items: WorkspaceItems, query: string): SearchMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return Object.values(items)
    .filter((item) => item.parentId !== null && item.name.toLowerCase().includes(q))
    .map((item) => ({ item, pathString: getPathString(items, item.id) }))
    .sort((a, b) => a.pathString.localeCompare(b.pathString));
}
