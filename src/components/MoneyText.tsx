type Props = {
  value: string | number | null | undefined;
  className?: string;
  display?: boolean;
};

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function MoneyText({ value, className = "", display = false }: Props) {
  if (value === null || value === undefined || value === "") {
    return <span className={`tabular ${className}`}>—</span>;
  }
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) {
    return <span className={`tabular ${className}`}>—</span>;
  }
  return (
    <span className={`tabular ${display ? "font-display" : ""} ${className}`}>
      {fmt.format(num)}
    </span>
  );
}
