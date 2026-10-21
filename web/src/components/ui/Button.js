const VARIANTS = {
  primary: "bg-white text-black hover:bg-white/90",
  secondary: "border border-white/15 text-white hover:border-white/40",
  danger: "border border-danger/40 text-danger hover:bg-danger/10",
};

/** Class string, so links can look like buttons too */
export const buttonClass = (variant = "primary", extra = "") =>
  `inline-flex h-10 items-center justify-center gap-2 px-4 text-sm font-medium transition duration-200 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${extra}`;

export default function Button({ variant = "primary", loading = false, loadingText = "Please wait…", className = "", children, ...props }) {
  return (
    <button {...props} disabled={props.disabled || loading} className={buttonClass(variant, className)}>
      {loading ? <span className="animate-pulse">{loadingText}</span> : children}
    </button>
  );
}