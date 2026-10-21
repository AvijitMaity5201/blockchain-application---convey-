const COLORS = {
  slate: "bg-white/10 text-white/70",
  green: "bg-ok/15 text-ok",
  red: "bg-danger/15 text-danger",
  amber: "bg-warn/15 text-warn",
  blue: "bg-azure/15 text-azure",
};

export default function Badge({ children, color = "slate" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium ${COLORS[color]}`}>
      {children}
    </span>
  );
}