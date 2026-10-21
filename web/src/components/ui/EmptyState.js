export default function EmptyState({ title, text, children }) {
  return (
    <div className="border border-dashed border-white/10 px-6 py-14 text-center">
      <p className="text-sm text-white/80">{title}</p>
      {text && <p className="mt-1 text-xs text-white/40">{text}</p>}
      {children && <div className="mt-5 flex justify-center">{children}</div>}
    </div>
  );
}