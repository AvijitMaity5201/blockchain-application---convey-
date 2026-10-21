export default function StatCard({ label, value }) {
  return (
    <div className="border border-white/5 text-center">
      <div className="bg-card-2 px-3 py-3 text-[13px] text-white/80">{label}</div>
      <div className="bg-card px-3 py-3.5 text-base font-medium">{value}</div>
    </div>
  );
}