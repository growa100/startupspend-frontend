import { LoadingShell } from "@/components/LoadingShell";
import { SkeletonLine } from "@/components/Skeleton";

export default function ConnectionsLoading() {
  return (
    <LoadingShell>
      <article style={{ paddingTop: "48px" }}>
        <SkeletonLine className="h-3 w-32" />
        <div className="mt-3 flex items-baseline justify-between gap-4">
          <SkeletonLine className="block h-[40px] w-72" />
          <SkeletonLine className="h-9 w-36" />
        </div>

        <hr className="hr-rule mt-8" />

        <ul className="mt-8 flex flex-col">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="border-b border-rule py-5">
              <div className="flex items-center justify-between gap-4">
                <span className="flex min-w-0 items-center gap-3">
                  <SkeletonLine className="block h-8 w-8" />
                  <SkeletonLine className="h-4 w-48" />
                </span>
                <span className="flex shrink-0 items-baseline gap-4">
                  <SkeletonLine className="h-3 w-24" />
                  <SkeletonLine className="h-3 w-12" />
                </span>
              </div>
            </li>
          ))}
        </ul>
      </article>
    </LoadingShell>
  );
}
