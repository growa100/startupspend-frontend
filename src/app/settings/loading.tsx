import { LoadingShell } from "@/components/LoadingShell";
import { SkeletonLine } from "@/components/Skeleton";

export default function SettingsLoading() {
  return (
    <LoadingShell>
      <article style={{ paddingTop: "48px" }}>
        <SkeletonLine className="h-3 w-24" />
        <div className="mt-3">
          <SkeletonLine className="block h-[40px] w-72" />
        </div>

        <hr className="hr-rule mt-8" />

        <div className="mt-8 space-y-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <section key={i} className="space-y-4">
              <SkeletonLine className="h-3 w-32" />
              <SkeletonLine className="h-4 w-3/4" />
              <SkeletonLine className="block h-10 w-full max-w-md" />
            </section>
          ))}
        </div>
      </article>
    </LoadingShell>
  );
}
