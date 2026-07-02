"use client";
import { useEffect } from "react";

export default function TabScroller({ activeId }: { activeId: string }) {
  useEffect(() => {
    // Adding a tiny delay ensures the DOM is fully painted and the container is scrollable
    const timeoutId = setTimeout(() => {
      const el = document.getElementById(activeId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [activeId]);

  return null;
}
