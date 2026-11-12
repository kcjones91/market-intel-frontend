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
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [id]);
  return null;
}
