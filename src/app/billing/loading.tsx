import { LoadingShell } from "@/components/LoadingShell";
import { SkeletonLine } from "@/components/Skeleton";

export default function BillingLoading() {
  return (
    <LoadingShell>
      <article style={{ paddingTop: "48px" }}>
        <SkeletonLine className="h-3 w-24" />
        <div className="mt-3">
          <SkeletonLine className="block h-[40px] w-72" />
        </div>

        <hr className="hr-rule mt-8" />

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-rule p-6 space-y-3">
              <SkeletonLine className="h-3 w-20" />
              <SkeletonLine className="block h-7 w-32" />
              <SkeletonLine className="h-3 w-full" />
              <SkeletonLine className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </article>
    </LoadingShell>
  );
}
