"use client";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/context/VaultContext";
import { ADMIN } from "@/lib/contract";
import { fmtSize, fmtStamp } from "@/lib/utils";
import ActivityTable from "@/components/ActivityTable";
import StatCard from "@/components/ui/StatCard";
import SectionTitle from "@/components/ui/SectionTitle";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { tableWrap, thCls, tdCls, trCls } from "@/components/ui/styles";

export default function Dashboard() {
  const { profile } = useWallet();
  const v = useVault();
  const n = (x) => (v.loaded ? x : "–");

  if (profile.role === ADMIN) {
    const active = v.users.filter((u) => u.active);
    return (
      <div className="space-y-10">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Members" value={n(active.length)} />
          <StatCard label="Managers" value={n(active.filter((u) => Number(u.role) === 2).length)} />
          <StatCard label="Employees" value={n(active.filter((u) => Number(u.role) === 1).length)} />
          <StatCard label="Activities" value={n(v.events.length)} />
        </div>
        <section>
          <SectionTitle>Recent activity</SectionTitle>
          <ActivityTable events={[...v.events].reverse().slice(0, 10)} actor />
        </section>
      </div>
    );
  }

  const received = v.shared.filter((f) => f.state === "active");
  const recent = [
    ...v.owned.map((f) => ({ ...f, kind: "My file", time: f.createdAt })),
    ...received.map((f) => ({ ...f, kind: "Received", time: v.sentAt[f.id] || f.createdAt })),
  ].sort((a, b) => b.time - a.time).slice(0, 6);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Files I own" value={n(v.owned.length)} />
        <StatCard label="Received from others" value={n(received.length)} />
        <StatCard label="Pending requests" value={n(v.incoming.length)} />
      </div>

      <section>
        <SectionTitle>Recent files</SectionTitle>
        {!v.loaded ? <Skeleton className="h-40" /> : recent.length === 0 ? <EmptyState title="No files yet" /> : (
          <div className={tableWrap}>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className={thCls}>Name</th><th className={thCls}>Type</th><th className={thCls}>Category</th>
                  <th className={thCls}>Size</th><th className={thCls}>Time</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((f) => (
                  <tr key={`${f.kind}-${f.id}`} className={trCls}>
                    <td className={tdCls}><Link href={`/files/${f.id}`} className="font-medium text-white transition-colors duration-200 hover:text-azure">{f.name}</Link></td>
                    <td className={tdCls}>{f.kind}</td>
                    <td className={tdCls}>{f.category}</td>
                    <td className={`${tdCls} whitespace-nowrap`}>{fmtSize(f.size)}</td>
                    <td className={`${tdCls} whitespace-nowrap`}>{fmtStamp(f.time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <SectionTitle>Recent activity</SectionTitle>
        <ActivityTable events={v.myActivity.slice(0, 8)} />
      </section>
    </div>
  );
}