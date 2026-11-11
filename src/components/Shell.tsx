import { Nav } from "./Nav";

// The Shell owns the left nav and the page frame. The right context rail is rendered
// per-page (so each view can re-scope it), via the ContextRail component.
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[200px_1fr] min-h-screen">
      <Nav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

// Two-column inner frame: center workspace + right context rail.
export function ViewFrame({
  children,
  rail,
}: {
  children: React.ReactNode;
  rail: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_280px] min-h-screen">
      <main className="min-w-0 overflow-y-auto pane">{children}</main>
      {rail}
    </div>
  );
}
