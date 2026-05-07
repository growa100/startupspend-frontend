import { LoadingShell } from "@/components/LoadingShell";
import { SkeletonLine } from "@/components/Skeleton";

export default function SubscriptionsLoading() {
  return (
    <LoadingShell>
      <article style={{ paddingTop: "48px" }}>
        <SkeletonLine className="h-3 w-40" />
        <div className="mt-3 flex items-baseline justify-between gap-4">
          <SkeletonLine className="block h-[40px] w-80" />
          <SkeletonLine className="h-9 w-32" />
        </div>

        <hr className="hr-rule mt-8" />

        <table className="mt-8 w-full">
          <thead>
            <tr className="border-b border-rule">
              <th className="py-3 text-left">
                <SkeletonLine className="h-3 w-16" />
              </th>
              <th className="py-3 text-right">
                <SkeletonLine className="h-3 w-20" />
              </th>
              <th className="py-3 text-right">
                <SkeletonLine className="h-3 w-24" />
              </th>
              <th className="py-3 text-right">
                <SkeletonLine className="h-3 w-12" />
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, i) => (
              <tr key={i} className="border-b border-rule">
                <td className="py-4">
                  <SkeletonLine className="h-4 w-40" />
                </td>
                <td className="py-4 text-right">
                  <SkeletonLine className="h-4 w-20" />
                </td>
                <td className="py-4 text-right">
                  <SkeletonLine className="h-4 w-24" />
                </td>
                <td className="py-4 text-right">
                  <SkeletonLine className="h-4 w-12" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
    </LoadingShell>
  );
}
