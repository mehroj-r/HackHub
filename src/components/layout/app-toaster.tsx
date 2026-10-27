"use client";

import { useSyncExternalStore } from "react";

import { Toaster } from "@/components/ui/sonner";

// The app's toasts. On phones they come in at the top, so they never cover the
// ActionDock or the tab bar at the bottom (thumb-first); from md up they sit
// bottom-right. Toasts are a "live" moment, so their icon takes the live red.

const PHONE = "(width < 48rem)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function AppToaster() {
  const phone = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE).matches,
    () => false,
  );

  return (
    <Toaster
      theme="dark"
      position={phone ? "top-center" : "bottom-right"}
      toastOptions={{ classNames: { toast: "cn-toast", icon: "text-live" } }}
    />
  );
}
