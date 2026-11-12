"use client";
import { useEffect } from "react";

// A link to a folded <details> section scrolls to it but leaves it shut.
// This opens the section named by the address hash, on load and on each jump.
export function OpenOnHash({ id }: { id: string }) {
  useEffect(() => {
    const open = () => {
      if (window.location.hash !== `#${id}`) return;
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement) el.open = true;
    };
    // A second tap on the same link changes no hash, so listen for the tap itself as well.
    const onClick = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest("a") : null;
      if (link?.getAttribute("href") === `#${id}`) setTimeout(open, 0);   // after the hash is set
    };
    open();
    window.addEventListener("hashchange", open);
    document.addEventListener("click", onClick);
    return () => { window.removeEventListener("hashchange", open); document.removeEventListener("click", onClick); };
  }, [id]);
  return null;
}
