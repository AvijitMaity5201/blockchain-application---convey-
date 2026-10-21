"use client";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/context/VaultContext";
import { decryptBuffer, sha256Hex, unwrapKey } from "@/lib/crypto";
import { downloadEncrypted } from "@/lib/ipfs";
import { fmtStamp } from "@/lib/utils";
import { notify } from "@/lib/notify";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageTitle from "@/components/ui/PageTitle";
import Skeleton from "@/components/ui/Skeleton";
import { tableWrap, thCls, tdCls, trCls } from "@/components/ui/styles";

export default function Verification() {
  const { contract, unlockKeys } = useWallet();
  const { owned, shared, events, nameOf, loaded } = useVault();
  const [results, setResults] = useState({});
  const [all, setAll] = useState(false);

  const files = [
    ...owned.map((f) => ({ ...f, source: "My file" })),
    ...shared.filter((f) => f.state === "active").map((f) => ({ ...f, source: "Received" })),
  ];
  const uploadEvent = (id) => events.find((e) => e.name === "FileUploaded" && e.fileId === String(id));

  /** Read-only check: the blockchain record vs the stored encrypted file. No transaction needed. */
  async function verifyOne(f) {
    setResults((r) => ({ ...r, [f.id]: { state: "checking" } }));
    try {
      const kp = await unlockKeys();
      const versions = [...(await contract.getVersions(f.id))];
      const latest = versions[versions.length - 1];
      const grant = await contract.getMyGrant(f.id);
      const key = unwrapKey(grant.wrappedKey, kp.secretKey);
      let ok = false;
      try {
        const plain = await decryptBuffer(await downloadEncrypted(latest.cid), key);
        ok = (await sha256Hex(plain)).toLowerCase() === latest.fileHash.toLowerCase();
      } catch {}
      setResults((r) => ({ ...r, [f.id]: { state: ok ? "ok" : "bad", versions: versions.length, at: Number(latest.timestamp), by: latest.uploader, checked: Date.now() / 1000 } }));
    } catch (e) {
      setResults((r) => ({ ...r, [f.id]: { state: "error" } }));
      notify.error(e);
    }
  }

  async function verifyAll() {
    setAll(true);
    for (const f of files) await verifyOne(f);
    setAll(false);
  }

  const badge = (r) =>
    !r ? <span className="text-white/55">Not checked</span>
    : r.state === "checking" ? <span className="animate-pulse text-azure">Checking…</span>
    : r.state === "ok" ? <Badge color="green">Verified</Badge>
    : r.state === "bad" ? <Badge color="red">Altered or missing</Badge>
    : <Badge color="amber">Could not check</Badge>;

  return (
    <div>
      <PageTitle title="Verification">
        <Button variant="secondary" disabled={all || files.length === 0} loading={all} loadingText="Verifying…" onClick={verifyAll}>Verify all</Button>
      </PageTitle>

      {!loaded ? <Skeleton className="h-48" /> : files.length === 0 ? <EmptyState title="No files to verify yet" /> : (
        <div className={tableWrap}>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className={thCls}>File</th><th className={thCls}>Source</th><th className={thCls}>Recorded on blockchain</th>
                <th className={thCls}>Block</th><th className={thCls}>Versions</th><th className={thCls}>Result</th><th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => {
                const r = results[f.id];
                const up = uploadEvent(f.id);
                return (
                  <tr key={`${f.source}-${f.id}`} className={trCls}>
                    <td className={tdCls}>
                      <span className="block font-medium text-white">{f.name}</span>
                      <span className="block text-[11px] text-white/55">{f.source === "Received" ? `from ${nameOf(f.owner)}` : "uploaded by you"}</span>
                    </td>
                    <td className={tdCls}>{f.source}</td>
                    <td className={`${tdCls} whitespace-nowrap`}>{fmtStamp(up?.time || f.createdAt)}</td>
                    <td className={`${tdCls} whitespace-nowrap font-mono text-xs`}>{up ? `#${up.block}` : "–"}</td>
                    <td className={tdCls}>{r?.versions ?? "–"}</td>
                    <td className={tdCls}>
                      {badge(r)}
                      {r?.checked && <span className="mt-1 block text-[11px] text-white/55">Checked {fmtStamp(r.checked)}</span>}
                    </td>
                    <td className={`${tdCls} text-right`}>
                      <Button variant="secondary" disabled={all || r?.state === "checking"} onClick={() => verifyOne(f)}>Verify</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}