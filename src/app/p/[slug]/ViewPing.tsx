"use client";

import { useEffect } from "react";

export function ViewPing({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `pmw:viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // ignore
    }
    fetch(`/api/p/${slug}/view`, { method: "POST", keepalive: true }).catch(
      () => {},
    );
  }, [slug]);
  return null;
}
