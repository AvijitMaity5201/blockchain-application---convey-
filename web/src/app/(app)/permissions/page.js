"use client";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/context/VaultContext";
import { ACCESS, accessLabel } from "@/lib/contract";
import { unwrapKey, wrapKey } from "@/lib/crypto";
import { expiryFromDays, fmtStamp, sameAddr } from "@/lib/utils";
import { notify } from "@/lib/notify";
import Badge from "@/components/Badge";
import ActivityTable from "@/components/ActivityTable";
import RequestModal from "@/components/RequestModal";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import PageTitle from "@/components/ui/PageTitle";
import Skeleton from "@/components/ui/Skeleton";
import Tabs from "@/components/ui/Tabs";
import { inputCls, tableWrap, thCls, tdCls, trCls } from "@/components/ui/styles";

const HISTORY = ["AccessRequested", "RequestResolved", "FileShared", "AccessRevoked"];

export default function Permissions() {
  const { contract, account, unlockKeys } = useWallet();
  const { received, incoming, outgoing, events, filesById, userBy, nameOf, refresh, loaded } = useVault();
  const [tab, setTab] = useState("ask");
  const [asking, setAsking] = useState(null);
  const [working, setWorking] = useState("");
  const [days, setDays] = useState({});

  const pendingFor = new Set(outgoing.filter((r) => r.status === 0).map((r) => r.fileId));
  const mine = (a) => sameAddr(a, account);
  const history = events
    .filter((e) => HISTORY.includes(e.name) &&
      (mine(e.args.requester) || mine(e.args.owner) || mine(e.args.user) || filesById[e.fileId]?.mine))
    .reverse();

  async function accept(r) {
    setWorking(`a${r.id}`);
    try {
      const u = userBy[r.requester.toLowerCase()];
      if (!u || u.encKey.length !== 66) { notify.error(`${nameOf(r.requester)} needs to sign in once to create their encryption keys.`); return; }
      const kp = await unlockKeys();
      const mineGrant = await contract.getMyGrant(r.fileId);
      const key = unwrapKey(mineGrant.wrappedKey, kp.secretKey);
      await (await contract.resolveRequest(r.id, true, expiryFromDays(days[r.id] || 0), wrapKey(key, u.encKey))).wait();
      await refresh();
      notify.success(`${nameOf(r.requester)} now has ${ACCESS[r.level]} access.`);
    } catch (e) { notify.error(e); } finally { setWorking(""); }
  }

  async function reject(r) {
    setWorking(`r${r.id}`);
    try {
      await (await contract.resolveRequest(r.id, false, 0, "0x")).wait();
      await refresh();
      notify.success("Request rejected.");
    } catch (e) { notify.error(e); } finally { setWorking(""); }
  }

  return (
    <div>
      <PageTitle title="Permissions" />
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[["ask", "Ask for permission"], ["grant", "Grant permission", incoming.length], ["history", "History"]]}
      />

      {!loaded ? <Skeleton className="h-48" /> : tab === "ask" ? (
        <>
          {received.length === 0 ? <EmptyState title="No received files yet" /> : (
            <div className={tableWrap}>
              <table className="min-w-full">
                <thead>
                  <tr><th className={thCls}>File</th><th className={thCls}>From</th><th className={thCls}>Granted permission</th><th className={thCls}></th></tr>
                </thead>
                <tbody>
                  {received.map((f) => (
                    <tr key={f.id} className={trCls}>
                      <td className={`${tdCls} font-medium text-white`}>{f.name}</td>
                      <td className={tdCls}>{nameOf(f.owner)}</td>
                      <td className={tdCls}><Badge color={f.level > 0 ? "blue" : "amber"}>{accessLabel(f)}</Badge></td>
                      <td className={`${tdCls} text-right`}>
                        {pendingFor.has(f.id) ? <Badge color="amber">Request pending</Badge>
                          : f.level >= 3 ? <span className="text-xs text-white/55">Full access</span>
                          : <Button variant="secondary" onClick={() => setAsking(f)}>Request more</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {asking && <RequestModal file={asking} onClose={() => setAsking(null)} />}
        </>
      ) : tab === "grant" ? (
        incoming.length === 0 ? <EmptyState title="No requests waiting for you" /> : (
          <div className={tableWrap}>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className={thCls}>File</th><th className={thCls}>Requested by</th><th className={thCls}>Previous</th>
                  <th className={thCls}>Requested</th><th className={thCls}>Reason</th><th className={thCls}>Date</th>
                  <th className={thCls}>Access period</th><th className={thCls}></th>
                </tr>
              </thead>
              <tbody>
                {incoming.map((r) => (
                  <tr key={r.id} className={`${trCls} align-top`}>
                    <td className={`${tdCls} font-medium text-white`}>{r.file.name}</td>
                    <td className={`${tdCls} whitespace-nowrap`}>{nameOf(r.requester)}</td>
                    <td className={tdCls}>{r.fromLevel ? ACCESS[r.fromLevel] : "None"}</td>
                    <td className={tdCls}><Badge color="blue">{ACCESS[r.level]}</Badge></td>
                    <td className={`${tdCls} min-w-[12rem]`}>{r.reason}</td>
                    <td className={`${tdCls} whitespace-nowrap`}>{fmtStamp(r.ts)}</td>
                    <td className={tdCls}>
                      <select className={`${inputCls} !w-auto`} aria-label="Access period" value={days[r.id] || 0}
                        onChange={(e) => setDays({ ...days, [r.id]: Number(e.target.value) })}>
                        <option value={0}>Never expires</option><option value={1}>1 day</option>
                        <option value={7}>7 days</option><option value={30}>30 days</option>
                      </select>
                    </td>
                    <td className={`${tdCls} whitespace-nowrap`}>
                      <div className="flex gap-2">
                        <Button disabled={!!working} loading={working === `a${r.id}`} loadingText="Confirming…" onClick={() => accept(r)}>Accept</Button>
                        <Button variant="secondary" disabled={!!working} loading={working === `r${r.id}`} loadingText="Confirming…" onClick={() => reject(r)}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <ActivityTable events={history} empty="No permission activity yet" />
      )}
    </div>
  );
}