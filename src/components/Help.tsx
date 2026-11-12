"use client";
import { useId, useRef } from "react";
import { GLOSSARY, type GlossaryEntry, type Term } from "@/lib/glossary";
import { cn } from "@/lib/cn";

// The "?" next to a term. Tapping it opens the term's definition: a sheet
// from the bottom on phones (where there is no hover), a centred card on wide
// screens. It is a native <dialog>, so Escape, focus return and the backdrop
// come from the browser.
//
// The button is a full 40px tap target; negative margins keep it from pushing
// the text around it. It sits above the stretched link on event cards.
export function Help({ term, className }: { term: Term; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const entry: GlossaryEntry = GLOSSARY[term];

  return (
    <>
      <button
        type="button"
        aria-label={`What is ${entry.title.toLowerCase()}?`}
        aria-haspopup="dialog"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); dialog.current?.showModal(); }}
        className={cn(
          "group relative z-10 inline-flex items-center justify-center w-10 h-10 -my-[11px] -mx-[9px] align-middle rounded-full",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint",
          className
        )}
      >
        <span
          aria-hidden="true"
          className="flex items-center justify-center w-[18px] h-[18px] rounded-full border border-muted text-muted font-sans text-[12px] font-bold leading-none group-hover:text-ink group-hover:border-ink"
        >
          ?
        </span>
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        // A click on the backdrop lands on the dialog element itself; the content is one level down.
        onClick={(e) => { if (e.target === e.currentTarget) e.currentTarget.close(); }}
        className="help-sheet m-0 mt-auto w-full max-w-full md:m-auto md:max-w-[420px] p-0 bg-card text-ink border border-line rounded-t-[14px] md:rounded-[12px] backdrop:bg-black/70"
      >
        <div className="px-5 pt-5 pb-[max(20px,env(safe-area-inset-bottom))] font-sans text-left font-normal normal-case tracking-normal whitespace-normal">
          <h2 id={titleId} className="text-[16px] font-bold">{entry.title}</h2>
          <p className="text-[14px] text-sub leading-relaxed mt-2">{entry.body}</p>
          {entry.points && (
            <ul className="mt-3 border-t border-line pt-3 space-y-1.5">
              {entry.points.map((p) => (
                <li key={p} className="font-mono text-[13px] text-ink tabular-nums">{p}</li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="mt-4 w-full min-h-[44px] rounded-[8px] border border-line bg-cardhi text-[14px] font-semibold hover:border-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint"
          >
            Got it
          </button>
        </div>
      </dialog>
    </>
  );
}
