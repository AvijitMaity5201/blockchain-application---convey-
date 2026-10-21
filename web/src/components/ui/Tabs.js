export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="mb-8 flex gap-6 overflow-x-auto border-b border-white/10 sm:gap-8" role="tablist">
      {tabs.map(([v, label, count]) => (
        <button
          key={v}
          role="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
          className={`-mb-px shrink-0 border-b pb-3 text-sm transition-colors duration-200 ${
            value === v ? "border-azure text-white" : "border-transparent text-white/55 hover:text-azure"
          }`}
        >
          {label}
          {count > 0 && <span className="ml-2 bg-azure px-1.5 text-[10px] font-semibold leading-5 text-black">{count}</span>}
        </button>
      ))}
    </div>
  );
}