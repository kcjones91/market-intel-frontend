"use client";

// Shown when a server view cannot load its data (API configured but failing).
export default function ErrorView({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="px-[26px] py-[18px]">
      <div className="bg-card border border-line rounded-[10px] p-[22px] max-w-[560px] mt-10">
        <div className="text-[10px] tracking-wide text-neg uppercase">Intel API unavailable</div>
        <h1 className="font-sans text-[18px] font-bold my-2.5">This view could not load its data.</h1>
        <p className="font-sans text-[13px] text-sub leading-relaxed">
          The intelligence backend did not answer. Nothing is shown rather than out-of-date or sample data.
        </p>
        <button
          onClick={() => reset()}
          className="text-[12px] text-mint border border-mint/40 rounded-lg px-4 py-2 mt-4 hover:bg-mint/10"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
