import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { ActionResult, ItemType, WorkspaceItems } from "./types";
import { collectDescendantIds, validateName } from "./utils";

export const ROOT_ID = "root";

function seedItems(): WorkspaceItems {
  const now = Date.now();
  const make = (
    id: string,
    name: string,
    type: ItemType,
    parentId: string | null,
    content?: string
  ) => ({ id, name, type, parentId, content, createdAt: now, updatedAt: now });

  const items: WorkspaceItems = {};
  const add = (item: ReturnType<typeof make>) => {
    items[item.id] = item;
  };

  add(make(ROOT_ID, "Workspace", "folder", null));
  add(make("projects", "Projects", "folder", ROOT_ID));
  add(make("webbly", "Webbly", "folder", "projects"));
  add(
    make(
      "notes",
      "notes.txt",
      "file",
      "webbly",
      "Kickoff notes for the Webbly Media assessment.\n\n- Build the Mini Workspace Explorer\n- Cover create / rename / delete / search\n- Persist everything to localStorage"
    )
  );
  add(make("tasks", "tasks.txt", "file", "webbly", "- [ ] Sidebar tree view\n- [ ] Text editor\n- [ ] Search\n- [ ] Persistence"));
  add(make("personal", "Personal", "folder", "projects"));
  add(make("documents", "Documents", "folder", ROOT_ID));
  add(
    make(
      "readme-root",
      "README.txt",
      "file",
      ROOT_ID,
      "Welcome to your workspace.\n\nCreate folders and files, search across everything, and edit text files right here in the browser."
    )
  );

  return items;
}

interface WorkspaceState {
  items: WorkspaceItems;
  selectedFolderId: string;
  expandedIds: string[];
  openFileId: string | null;
  drafts: Record<string, string>;
  searchQuery: string;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  selectFolder: (id: string) => void;
  toggleExpand: (id: string) => void;
  openFile: (id: string) => void;
  closeFile: () => void;
  createItem: (parentId: string, type: ItemType, rawName: string) => ActionResult;
  renameItem: (id: string, rawName: string) => ActionResult;
  deleteItem: (id: string) => void;
  updateDraft: (id: string, content: string) => void;
  saveDraft: (id: string) => void;
  discardDraft: (id: string) => void;
  setSearchQuery: (query: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      items: seedItems(),
      selectedFolderId: ROOT_ID,
      expandedIds: [ROOT_ID, "projects"],
      openFileId: null,
      drafts: {},
      searchQuery: "",
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      selectFolder: (id) =>
        set((state) => ({
          selectedFolderId: id,
          openFileId: null,
          searchQuery: "",
          expandedIds: state.expandedIds.includes(id)
            ? state.expandedIds
            : [...state.expandedIds, id],
        })),

      toggleExpand: (id) =>
        set((state) => ({
          expandedIds: state.expandedIds.includes(id)
            ? state.expandedIds.filter((eid) => eid !== id)
            : [...state.expandedIds, id],
        })),

      openFile: (id) => set({ openFileId: id, searchQuery: "" }),

      closeFile: () => set({ openFileId: null }),

      createItem: (parentId, type, rawName) => {
        const { items } = get();
        const { name, error } = validateName(items, parentId, rawName);
        if (error) return { success: false, error };

        const finalName = type === "file" && !name.includes(".") ? `${name}.txt` : name;
        const dupCheck = validateName(items, parentId, finalName);
        if (dupCheck.error) return { success: false, error: dupCheck.error };

        const id = nanoid();
        const now = Date.now();
        set((state) => ({
          items: {
            ...state.items,
            [id]: {
              id,
              name: finalName,
              type,
              parentId,
              content: type === "file" ? "" : undefined,
              createdAt: now,
              updatedAt: now,
            },
          },
          expandedIds: state.expandedIds.includes(parentId)
            ? state.expandedIds
            : [...state.expandedIds, parentId],
        }));
        return { success: true, id };
      },

      renameItem: (id, rawName) => {
        const { items } = get();
        const item = items[id];
        if (!item) return { success: false, error: "Item not found." };
        if (item.parentId === null) return { success: false, error: "The workspace root can't be renamed." };

        const { name, error } = validateName(items, item.parentId, rawName, id);
        if (error) return { success: false, error };

        set((state) => ({
          items: {
            ...state.items,
            [id]: { ...state.items[id], name, updatedAt: Date.now() },
          },
        }));
        return { success: true, id };
      },

      deleteItem: (id) => {
        const { items } = get();
        const target = items[id];
        if (!target || target.parentId === null) return;

        const toDelete = collectDescendantIds(items, id);
        const fallbackParentId = target.parentId;

        set((state) => {
          const newItems = { ...state.items };
          toDelete.forEach((did) => delete newItems[did]);

          const newDrafts = { ...state.drafts };
          toDelete.forEach((did) => delete newDrafts[did]);

          return {
            items: newItems,
            drafts: newDrafts,
            selectedFolderId: toDelete.has(state.selectedFolderId)
              ? fallbackParentId
              : state.selectedFolderId,
            openFileId: state.openFileId && toDelete.has(state.openFileId) ? null : state.openFileId,
            expandedIds: state.expandedIds.filter((eid) => !toDelete.has(eid)),
          };
        });
      },

      updateDraft: (id, content) =>
        set((state) => ({ drafts: { ...state.drafts, [id]: content } })),

      saveDraft: (id) => {
        const { drafts, items } = get();
        if (!(id in drafts) || !items[id]) return;
        set((state) => {
          const newDrafts = { ...state.drafts };
          const content = newDrafts[id];
          delete newDrafts[id];
          return {
            drafts: newDrafts,
            items: {
              ...state.items,
              [id]: { ...state.items[id], content, updatedAt: Date.now() },
            },
          };
        });
      },

      discardDraft: (id) =>
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[id];
          return { drafts: newDrafts };
        }),

      setSearchQuery: (query) => set({ searchQuery: query }),
    }),
    {
      name: "mini-workspace-explorer",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        items: state.items,
        selectedFolderId: state.selectedFolderId,
        expandedIds: state.expandedIds,
        openFileId: state.openFileId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
