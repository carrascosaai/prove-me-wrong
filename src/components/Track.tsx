"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Fires one lightweight pageview ping per navigation. No cookies, no IDs —
 * the server only stores an aggregated (day, path, referrer) counter.
 */
export function Track() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || last.current === pathname) return;
    last.current = pathname;
    const body = JSON.stringify({
      path: pathname,
      referrer: document.referrer || "",
    });
    // keepalive so it still sends if the user navigates away immediately
    fetch("/api/hit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
