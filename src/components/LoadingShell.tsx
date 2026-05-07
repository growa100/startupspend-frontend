import { MobileBottomNav } from "./MobileBottomNav";
import { NavBar } from "./NavBar";
import { TopStrip } from "./TopStrip";

export function LoadingShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-bone">
      <TopStrip />
      <NavBar />
      <section className="mx-auto max-w-ft px-6 pb-32 md:pb-24">
        {children}
      </section>
      <MobileBottomNav />
    </main>
  );
}
