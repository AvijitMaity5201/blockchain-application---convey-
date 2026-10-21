export default function Skeleton({ className = "h-40" }) {
  return <div className={`animate-pulse bg-card ${className}`} />;
}