type Props = {
  className?: string;
};

export function SkeletonLine({ className = "h-4 w-24" }: Props) {
  return <span className={`skeleton ${className}`} aria-hidden />;
}
