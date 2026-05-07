import { LoadingShell } from "@/components/LoadingShell";
import { SkeletonLine } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <LoadingShell>
      <article style={{ paddingTop: "32px", paddingBottom: "120px" }}>
        {/* Hero */}
        <SkeletonLine className="h-3 w-44" />
        <div className="mt-4">
          <SkeletonLine className="block h-[80px] w-3/4 max-w-[480px]" />
        </div>
        <div className="mt-4">
          <SkeletonLine className="h-4 w-64" />
        </div>
        <div className="mt-5">
          <SkeletonLine className="block h-[60px] w-full max-w-[420px]" />
        </div>

        {/* Provider pills */}
        <div className="mt-7 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLine key={i} className="h-9 w-32" />
          ))}
        </div>

        <hr className="hr-rule mt-10" />

        {/* Two-col */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_minmax(280px,_36%)]">
          <div className="space-y-4">
            <SkeletonLine className="h-3 w-28" />
            <SkeletonLine className="block h-[280px] w-full" />
          </div>
          <aside
            className="space-y-5"
            style={{
              border: "1px solid var(--rule-strong)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <SkeletonLine className="h-3 w-28" />
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-2/3" />
          </aside>
        </div>

        {/* Breakdown rows */}
        <hr className="hr-rule mt-12" />
        <div className="mt-6 space-y-5">
          <SkeletonLine className="h-3 w-28" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center justify-between">
                <SkeletonLine className="h-4 w-1/3" />
                <SkeletonLine className="h-4 w-20" />
              </div>
              <div className="mt-2">
                <SkeletonLine className="block h-[6px] w-full" />
              </div>
            </div>
          ))}
        </div>
      </article>
    </LoadingShell>
  );
}
