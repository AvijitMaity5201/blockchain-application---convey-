"use client";
import { useMemo, useState } from "react";
import { useVault } from "@/context/VaultContext";
import { describeEvent, eventLabel } from "@/lib/events";
import { fmtStamp } from "@/lib/utils";
import ActivityTable from "@/components/ActivityTable";
import Button from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import { inputCls } from "@/components/ui/styles";

export default function Audit() {
  const { events, nameOf, fileName, loaded } = useVault();
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [person, setPerson] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const ctx = { who: nameOf, file: fileName };
  const people = useMemo(() => [...new Set(events.map((e) => e.from).filter(Boolean))], [events]);
  const types = useMemo(() => [...new Set(events.map((e) => e.name))], [events]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const start = from ? new Date(from).getTime() / 1000 : 0;
    const end = to ? new Date(to).getTime() / 1000 + 86400 : Infinity;
    return events
      .filter((e) => (type === "All" || e.name === type) && (person === "All" || e.from === person))
      .filter((e) => e.time >= start && e.time < end)
      .filter((e) => !term || describeEvent(e, ctx).toLowerCase().includes(term))
      .reverse();
  }, [events, q, type, person, from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  function exportCsv() {
    const esc = (v) => `"${String(v).replaceAll('"', '""')}"`;
    const rows = shown.map((e) =>
      [new Date(e.time * 1000).toISOString(), eventLabel(e.name), nameOf(e.from), describeEvent(e, ctx), e.block, e.tx].map(esc).join(","));
    const csv = ["Time,Event,Performed by,Activity,Block,Transaction", ...rows].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "audit-history.csv";
    a.click();
  }

  return (
    <div>
      <PageTitle title="Audit History">
        <Button variant="secondary" disabled={shown.length === 0} onClick={exportCsv}>Export CSV</Button>
      </PageTitle>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input className={inputCls} placeholder="Search activity" aria-label="Search activity" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls} aria-label="Event type" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="All">All events</option>
          {types.map((t) => <option key={t} value={t}>{eventLabel(t)}</option>)}
        </select>
        <select className={inputCls} aria-label="Person" value={person} onChange={(e) => setPerson(e.target.value)}>
          <option value="All">Everyone</option>
          {people.map((p) => <option key={p} value={p}>{nameOf(p)}</option>)}
        </select>
        <input type="date" className={inputCls} aria-label="From date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="date" className={inputCls} aria-label="To date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>

      <ActivityTable events={shown} actor empty={loaded ? "No activity matches your filters" : ""} />
    </div>
  );
}