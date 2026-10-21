"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/context/VaultContext";
import { loadEvents, describeEvent } from "@/lib/events";
import { fmtDate } from "@/lib/utils";
import SectionTitle from "@/components/ui/SectionTitle";

const PREVIEW = 6;

export default function FileTimeline({ fileId, refreshKey }) {
  const { contract } = useWallet();
  const { nameOf } = useVault();
  const [events, setEvents] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    loadEvents(contract)
      .then((list) => { if (alive) setEvents(list.filter((e) => e.fileId === String(fileId)).reverse()); })
      .catch((e) => { console.error(e); if (alive) setEvents([]); });
    return () => { alive = false; };
  }, [contract, fileId, refreshKey]);

  if (events === null) return null;
  const list = showAll ? events : events.slice(0, PREVIEW);

  return (
    <section>
      <SectionTitle>Activity</SectionTitle>
      {events.length === 0 ? (
        <p className="text-sm text-white/55">No activity yet.</p>
      ) : (
        <>
          <ol className="border-l border-white/10">
            {list.map((e, i) => (
              <li key={`${e.tx}-${i}`} className="relative pb-5 pl-6 last:pb-0">
                <span className="absolute -left-[3px] top-2 size-[5px] rounded-full bg-white/40" />
                <p className="text-sm text-white/85">{describeEvent(e, nameOf, true)}</p>
                <p className="mt-0.5 text-xs text-white/55">{fmtDate(e.time)}</p>
              </li>
            ))}
          </ol>
          {events.length > PREVIEW && (
            <button
              onClick={() => setShowAll((s) => !s)}
              className="mt-4 text-sm text-white/70 transition-colors duration-200 hover:text-azure"
            >
              {showAll ? "Show less" : `Show all (${events.length})`}
            </button>
          )}
        </>
      )}
    </section>
  );
}