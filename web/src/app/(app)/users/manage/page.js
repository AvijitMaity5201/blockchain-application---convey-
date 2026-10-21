"use client";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/context/VaultContext";
import { short, sameAddr } from "@/lib/utils";
import { notify } from "@/lib/notify";
import Badge from "@/components/Badge";
import Button from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import Skeleton from "@/components/ui/Skeleton";
import { inputCls, tableWrap, thCls, tdCls, trCls } from "@/components/ui/styles";

export default function ManageUsers() {
  const { contract, account } = useWallet();
  const { users, loaded, refresh } = useVault();
  const [dept, setDept] = useState({});
  const [working, setWorking] = useState("");

  async function run(key, call, message) {
    setWorking(key);
    try {
      await (await call()).wait();
      await refresh();
      notify.success(message);
      return true;
    } catch (e) {
      notify.error(e);
      return false;
    } finally {
      setWorking("");
    }
  }

  return (
    <div>
      <PageTitle title="Manage Users" />
      {!loaded ? <Skeleton className="h-48" /> : (
        <div className={tableWrap}>
          <table className="min-w-full">
            <thead>
              <tr>
                <th className={thCls}>Name</th><th className={thCls}>Wallet</th><th className={thCls}>Department</th>
                <th className={thCls}>Role</th><th className={thCls}>Status</th><th className={thCls}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const me = sameAddr(u.wallet, account);
                const edited = dept[u.wallet] !== undefined && dept[u.wallet].trim() !== u.department;
                return (
                  <tr key={u.wallet} className={`${trCls} align-top`}>
                    <td className={`${tdCls} font-medium text-white`}>{u.name}</td>
                    <td className={`${tdCls} font-mono text-xs`}>{short(u.wallet)}</td>
                    <td className={tdCls}>
                      <div className="flex gap-2">
                        <input
                          className={`${inputCls} !w-40`}
                          aria-label={`Department for ${u.name}`}
                          value={dept[u.wallet] ?? u.department}
                          onChange={(e) => setDept({ ...dept, [u.wallet]: e.target.value })}
                        />
                        {edited && (
                          <Button variant="secondary" disabled={!!working} loading={working === `d${u.wallet}`} loadingText="Saving…"
                            onClick={async () => { if (await run(`d${u.wallet}`, () => contract.updateDepartment(u.wallet, dept[u.wallet].trim()), `${u.name}'s department was updated.`)) setDept((d) => { const n = { ...d }; delete n[u.wallet]; return n; }); }}>
                            Save
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className={tdCls}>
                      <select
                        disabled={me || !!working}
                        className={`${inputCls} !w-auto`}
                        aria-label={`Role for ${u.name}`}
                        value={Number(u.role)}
                        onChange={(e) => run(`r${u.wallet}`, () => contract.updateRole(u.wallet, Number(e.target.value)), `${u.name}'s role was updated.`)}
                      >
                        <option value={1}>Employee</option>
                        <option value={2}>Manager</option>
                        <option value={3}>Admin</option>
                      </select>
                    </td>
                    <td className={tdCls}><Badge color={u.active ? "green" : "red"}>{u.active ? "Active" : "Removed"}</Badge></td>
                    <td className={`${tdCls} text-right`}>
                      {!me && (
                        <button
                          disabled={!!working}
                          onClick={() => run(`s${u.wallet}`, () => contract.setUserActive(u.wallet, !u.active), u.active ? `${u.name} was removed.` : `${u.name} was restored.`)}
                          className={`transition-opacity duration-200 hover:opacity-80 disabled:opacity-50 ${u.active ? "text-danger" : "text-ok"}`}
                        >
                          {working === `s${u.wallet}` ? "Waiting…" : u.active ? "Remove" : "Restore"}
                        </button>
                      )}
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