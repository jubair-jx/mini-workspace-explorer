# Mini Workspace Explorer

A browser-based file manager built for the Webbly Media frontend assessment. Create, navigate,
search, edit, rename, and delete folders and text files entirely on the client, with everything
persisted to `localStorage`.

## How to run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No backend or environment variables are
required. `npm run build && npm run start` runs the production build.

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** for all styling
- **Zustand** (with the `persist` middleware) for state management
- **Framer Motion** for tree, layout, and modal animations
- **next-themes** for light/dark mode
- **sonner** for toast feedback
- **lucide-react** for icons

## Project structure

```
src/
  app/                     Root layout, global styles, single page route
  components/
    workspace/              Feature components: sidebar tree, breadcrumb, toolbar,
                             item grid/card, file editor, search, top bar
    ui/                      Reusable primitives: modal, confirm dialog, name dialog, item menu
    theme-provider.tsx       next-themes wrapper
    theme-toggle.tsx         Light/dark switch
  hooks/
    use-is-client.ts         Hydration-safe "is this running in the browser" hook
  lib/
    types.ts                 WorkspaceItem / ActionResult types
    store.ts                 Zustand store: all state + actions + persistence
    utils.ts                 Sorting, path building, search, validation, cascade-delete helpers
```

## State management approach

A single Zustand store (`src/lib/store.ts`) holds the entire workspace: the flat item map,
the current selection, expanded sidebar folders, the open file, in-memory unsaved drafts, and
the search query. All mutations (create, rename, delete, save) are store actions, so every
component reads state and dispatches actions the same way regardless of nesting depth —
there's no prop-drilling of callbacks through the tree.

The store is wrapped in Zustand's `persist` middleware with `skipHydration: true`. The
workspace explorer calls `persist.rehydrate()` once on mount, so the server-rendered and first
client-rendered pass use identical seed data (no hydration mismatch), and the real
`localStorage` contents are applied immediately after.

## File-system data structure

Items are stored as a **flat map** (`Record<id, WorkspaceItem>`) rather than a nested tree:

```ts
interface WorkspaceItem {
  id: string;
  name: string;
  type: "folder" | "file";
  parentId: string | null;
  content?: string;   // files only
  createdAt: number;
  updatedAt: number;
}
```

A flat map makes lookups, renames, and moves O(1) and avoids re-serializing a deep nested
structure on every edit. The tree is derived on demand:

- **children of a folder** — filter items by `parentId`
- **breadcrumb path** — walk `parentId` pointers up to the root
- **cascading delete** — collect the target id plus every descendant (BFS over `parentId`)
  before removing them all in one state update

`getChildren`/`getFolderChildren`/`getPath`/`collectDescendantIds`/`searchItems` in
`src/lib/utils.ts` are the single source of truth for all of this, so the sidebar tree, the
main grid, the breadcrumb, and search all stay consistent.

## Important implementation decisions

- **Unsaved edits live in a separate `drafts` map**, not in `items`. A file is "dirty" when
  `drafts[id] !== items[id].content`. This means navigating away from an open file and back
  keeps your unsaved edit (nothing is lost), while only an explicit **Save** commits it to
  `items` (and therefore to `localStorage`). A `beforeunload` listener warns before closing the
  tab with unsaved changes.
- **Root folder ("Workspace") is protected** — it can't be renamed or deleted, so the workspace
  can never become inaccessible.
- **Deleting the folder you're currently browsing** is supported directly from the breadcrumb
  area (not just from a parent's grid): deleting it cascades to all nested content and the
  view automatically falls back to the nearest surviving parent folder. Deleting the file
  you currently have open works the same way and safely discards its draft.
- **Duplicate names** are rejected case-insensitively within the same folder, for both create
  and rename, with inline validation errors instead of silent failures.
- **New text files without an extension** are given `.txt` automatically so search results and
  the file grid stay identifiable.
- **Search is global and flat** — it matches against every item in the workspace regardless of
  depth and shows each result's full path; selecting a result jumps straight to that location
  and clears the query.
- **Empty states** (empty workspace, empty folder, no search results) are handled explicitly
  rather than showing a blank panel.
