import { Nav } from "./Nav";

// The Shell owns the left nav and the page frame. The right context rail is rendered
// per-page (so each view can re-scope it), via the ContextRail component.
export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:grid md:grid-cols-[200px_1fr] min-h-screen">
      <Nav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

// Inner frame: center workspace + context rail. The rail sits beside the
// content on wide screens and below it on phones and tablets.
export function ViewFrame({
  children,
  rail,
}: {
  children: React.ReactNode;
  rail: React.ReactNode;
}) {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_280px] lg:min-h-screen">
      <main className="min-w-0 lg:overflow-y-auto pane">{children}</main>
      {rail}
    </div>
  );
}
