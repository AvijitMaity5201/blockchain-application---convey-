export default function Steps({ labels, current }) {
  return (
    <ol className="flex flex-wrap gap-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const cls =
          current > n ? "border-ok/40 text-ok"
          : current === n ? "animate-pulse border-azure/50 text-azure"
          : "border-white/10 text-white/40";
        return (
          <li key={label} className={`border px-3 py-1.5 text-xs ${cls}`}>
            {current > n ? "✔" : n}. {label}
          </li>
        );
      })}
    </ol>
  );
}