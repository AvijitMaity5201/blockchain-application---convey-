"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { useVault } from "@/context/VaultContext";
import { fmtDate, short } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";
import { inputCls, tableWrap, thCls, tdCls, trCls } from "@/components/ui/styles";

const SORTS = {
  newest: { label: "Newest first", fn: (a, b) => b.createdAt - a.createdAt },
  oldest: { label: "Oldest first", fn: (a, b) => a.createdAt - b.createdAt },
  name: { label: "Name A–Z", fn: (a, b) => a.name.localeCompare(b.name) },
};

export default function FileTable({
  files,
  extras = [],
  ownerLabel = "Owner",
  emptyTitle = "No files yet",
  emptyAction,
  searchable = true,
}) {
  const { nameOf } = useVault();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("newest");

  const categories = useMemo(() => ["All", ...new Set(files.map((f) => f.category))], [files]);
  const activeCat = categories.includes(cat) ? cat : "All";

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return files
      .filter((f) => activeCat === "All" || f.category === activeCat)
      .filter((f) => !term || f.name.toLowerCase().includes(term) || nameOf(f.owner).toLowerCase().includes(term))
      .sort(SORTS[sort].fn);
  }, [files, q, activeCat, sort, nameOf]);

  if (!files.length) return <EmptyState title={emptyTitle}>{emptyAction}</EmptyState>;

  return (
    <div>
      {searchable && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[14rem] flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/55" />
            <input
              className={`${inputCls} pl-9`}
              placeholder="Search by name or owner"
              aria-label="Search files"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select className={`${inputCls} !w-auto`} aria-label="Filter by category" value={activeCat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c === "All" ? "All categories" : c}</option>)}
          </select>
          <select className={`${inputCls} !w-auto`} aria-label="Sort files" value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </div>
      )}

      {shown.length === 0 ? (
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
                <th className={thCls}>{ownerLabel}</th>
                <th className={thCls}>Created</th>
                {extras.map((x) => <th key={x.label} className={thCls}>{x.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {shown.map((f) => (
                <tr key={f.id} className={trCls}>
                  <td className={tdCls}>
                    <Link href={`/files/${f.id}`} className="inline-flex items-center gap-2.5 font-medium text-white transition-colors duration-200 hover:text-azure">
                      <FileText size={16} strokeWidth={1.75} className="shrink-0 text-white/55" />
                      {f.name}
                    </Link>
                  </td>
                  <td className={tdCls}>{f.category}</td>
                  <td className={tdCls}>
                    <span className="block text-white/90">{nameOf(f.owner)}</span>
                    <span className="block font-mono text-[11px] text-white/55">{short(f.owner)}</span>
                  </td>
                  <td className={`${tdCls} whitespace-nowrap`}>{fmtDate(f.createdAt)}</td>
                  {extras.map((x) => <td key={x.label} className={tdCls}>{x.render(f)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}