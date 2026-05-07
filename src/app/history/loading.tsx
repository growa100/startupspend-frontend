import { LoadingShell } from "@/components/LoadingShell";
import { SkeletonLine } from "@/components/Skeleton";

export default function HistoryLoading() {
  return (
    <LoadingShell>
      <article style={{ paddingTop: "48px" }}>
        <SkeletonLine className="h-3 w-32" />
        <div className="mt-3">
          <SkeletonLine className="block h-[40px] w-80" />
        </div>

        <div className="mt-6 flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLine key={i} className="h-8 w-24" />
          ))}
        </div>

        <hr className="hr-rule mt-8" />

        <section className="mt-10">
          <SkeletonLine className="h-3 w-28" />
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonLine className="h-3 w-20" />
                <SkeletonLine className="block h-7 w-32" />
              </div>
            ))}
          </div>
        </section>

        <hr className="hr-rule mt-10" />

        <section className="mt-10">
          <SkeletonLine className="h-3 w-32" />
          <div className="mt-5">
            <SkeletonLine className="block h-[280px] w-full" />
          </div>
        </section>

        <hr className="hr-rule mt-10" />

        <section className="mt-10">
          <SkeletonLine className="h-3 w-36" />
          <div className="mt-5">
            <SkeletonLine className="block h-[260px] w-full" />
          </div>
        </section>
      </article>
    </LoadingShell>
  );
}
