/**
 * FT-style toggle. Pure-CSS — a 36×20 track with a 16×16 dot. Active
 * state uses --accent. No animation extravagance, just a simple
 * transition.
 */
export function Toggle({
  checked,
  onChange,
  disabled,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex shrink-0 items-center disabled:opacity-50"
      style={{
        width: "36px",
        height: "20px",
        background: checked ? "#990F3D" : "#E9E1D9",
        borderRadius: "10px",
        transition: "background-color 120ms ease",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "2px",
          left: checked ? "18px" : "2px",
          width: "16px",
          height: "16px",
          background: "#FFFFFF",
          borderRadius: "8px",
          transition: "left 120ms ease",
        }}
      />
    </button>
  );
}
