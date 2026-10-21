"use client";
import { useVault } from "@/context/VaultContext";
import { describeEvent } from "@/lib/events";
import { fmtStamp, short } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import Skeleton from "@/components/ui/Skeleton";
import { tableWrap, thCls, tdCls, trCls } from "@/components/ui/styles";

/** actor=true shows names and a "Performed by" column (admin and audit views); otherwise "You" wording. */
export default function ActivityTable({ events, actor = false, empty = "No activity yet" }) {
  const { nameOf, youOf, fileName, loaded } = useVault();
  if (!loaded) return <Skeleton className="h-40" />;
  if (!events.length) return <EmptyState title={empty} />;
  const ctx = { who: actor ? nameOf : youOf, file: fileName };

  return (
    <div className={tableWrap}>
      <table className="min-w-full">
        <thead>
          <tr>
            <th className={thCls}>Time</th>
            <th className={thCls}>Activity</th>
            {actor && <th className={thCls}>Performed by</th>}
            <th className={thCls}>Block · Transaction</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.key} className={`${trCls} align-top`}>
              <td className={`${tdCls} whitespace-nowrap`}>{fmtStamp(e.time)}</td>
              <td className={tdCls}>{describeEvent(e, ctx)}</td>
              {actor && <td className={`${tdCls} whitespace-nowrap`}>{nameOf(e.from)}</td>}
              <td className={`${tdCls} whitespace-nowrap font-mono text-xs`}>#{e.block} · {short(e.tx)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}