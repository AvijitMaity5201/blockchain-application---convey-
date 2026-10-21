"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Search, Trash2 } from "lucide-react";
import { useVault } from "@/context/VaultContext";
import { CATEGORIES } from "@/lib/contract";
import { fmtSize, fmtStamp } from "@/lib/utils";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { inputCls, tableWrap, thCls, tdCls, trCls } from "@/components/ui/styles";

const SORTS = {
  newest: ["Newest first", (a, b) => b.time - a.time],
  oldest: ["Oldest first", (a, b) => a.time - b.time],
  az: ["Name A–Z", (a, b) => a.name.localeCompare(b.name)],
  za: ["Name Z–A", (a, b) => b.name.localeCompare(a.name)],
};

/** mode: "mine" (recorded time) or "shared" (sent time + sender) */
export default function FileList({ files, mode, onDelete, timeOf = (f) => f.createdAt, emptyTitle, emptyAction }) {
  const { nameOf } = useVault();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("newest");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return files
      .map((f) => ({ ...f, time: timeOf(f) }))
      .filter((f) => cat === "All" || f.category === cat)
      .filter((f) => !term || f.name.toLowerCase().includes(term))
      .sort(SORTS[sort][1]);
  }, [files, q, cat, sort, timeOf]);

  if (!files.length) return <EmptyState title={emptyTitle}>{emptyAction}</EmptyState>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[12rem] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/55" />
          <input className={`${inputCls} pl-9`} placeholder="Search files" aria-label="Search files" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className={`${inputCls} !w-auto`} aria-label="Category" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={`${inputCls} !w-auto`} aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          {Object.entries(SORTS).map(([k, [label]]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No files match your search">
          <Button variant="secondary" onClick={() => { setQ(""); setCat("All"); }}>Clear filters</Button>
        </EmptyState>
      ) : (
        <div className={tableWrap}>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className={thCls}>Name</th>
                <th className={thCls}>Category</th>
                <th className={thCls}>Size</th>
                <th className={thCls}>{mode === "mine" ? "Recorded" : "Sent"}</th>
                {mode === "shared" && <th className={thCls}>From</th>}
                <th className={`${thCls} w-12`}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr
                  key={f.id}
                  tabIndex={0}
                  onClick={() => router.push(`/files/${f.id}`)}
                  onKeyDown={(e) => { if (e.key === "Enter") router.push(`/files/${f.id}`); }}
                  className={`${trCls} cursor-pointer`}
                >
                  <td className={tdCls}>
                    <span className="inline-flex items-center gap-2.5 font-medium text-white">
                      <FileText size={16} strokeWidth={1.75} className="shrink-0 text-white/55" />
                      {f.name}
                      {f.state === "deleted" && <Badge color="red">Deleted by owner</Badge>}
                    </span>
                  </td>
                  <td className={tdCls}>{f.category}</td>
                  <td className={`${tdCls} whitespace-nowrap`}>{fmtSize(f.size)}</td>
                  <td className={`${tdCls} whitespace-nowrap`}>{f.time ? fmtStamp(f.time) : "–"}</td>
                  {mode === "shared" && <td className={`${tdCls} whitespace-nowrap`}>{nameOf(f.owner)}</td>}
                  <td className={`${tdCls} text-right`}>
                    <button
                      aria-label={`Delete ${f.name}`}
                      onClick={(e) => { e.stopPropagation(); onDelete(f); }}
                      className="p-1 text-white/55 transition-colors duration-200 hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}