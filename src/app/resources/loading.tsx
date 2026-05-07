import { LoadingShell } from "@/components/LoadingShell";
import { SkeletonLine } from "@/components/Skeleton";

export default function ResourcesLoading() {
  return (
    <LoadingShell>
      <article style={{ paddingTop: "48px" }}>
        <SkeletonLine className="h-3 w-32" />
        <div className="mt-3">
          <SkeletonLine className="block h-[40px] w-80" />
        </div>

        <div className="mt-6 flex items-center gap-1 border-b border-rule">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-4 py-3">
              <SkeletonLine className="h-3 w-24" />
            </div>
          ))}
        </div>

        <ul className="mt-6 flex flex-col">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="border-b border-rule py-5">
              <div className="flex items-center justify-between gap-4">
                <span className="flex min-w-0 items-center gap-3">
                  <SkeletonLine className="block h-7 w-7" />
                  <span className="flex flex-col gap-2">
                    <SkeletonLine className="h-4 w-56" />
                    <SkeletonLine className="h-3 w-32" />
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-6">
                  <SkeletonLine className="h-3 w-16" />
                  <SkeletonLine className="h-4 w-24" />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </LoadingShell>
  );
}
