export type ItemType = "folder" | "file";

export interface WorkspaceItem {
  id: string;
  name: string;
  type: ItemType;
  parentId: string | null;
  /** Only present on files. */
  content?: string;
  createdAt: number;
  updatedAt: number;
}

export type WorkspaceItems = Record<string, WorkspaceItem>;

export interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}
