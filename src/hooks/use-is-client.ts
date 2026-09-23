"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** True only once the component has hydrated on the client. */
export function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
