"use client";
import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/context/VaultContext";
import { notify } from "@/lib/notify";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const SCOPES = [
  ["me", "Delete from me", "Removes the file from your list. People you sent it to keep their access."],
  ["everyone", "Delete from receivers too", "Removes the file for you and everyone you sent it to. They are told that you deleted it."],
];

export default function DeleteModal({ file, onClose, onDone }) {
  const { contract } = useWallet();
  const { refresh, shares } = useVault();
  const [scope, setScope] = useState("me");
  const [busy, setBusy] = useState(false);
  const people = shares.filter((s) => s.file.id === file.id).length;

  async function go() {
    const everyone = file.mine && scope === "everyone";
    setBusy(true);
    try {
      await (await (everyone ? contract.deleteForEveryone(file.id) : contract.hideFile(file.id))).wait();
      await refresh();
      notify.success(everyone ? "File deleted for everyone." : "File removed from your list.");
      onDone?.();
      onClose();
    } catch (e) {
      notify.error(e);
      setBusy(false);
    }
  }

  return (
    <Modal title={file.mine ? "Delete this file?" : "Remove from your list?"} locked={busy} onClose={onClose}>
      {file.mine ? (
        <>
          <div className="space-y-3" role="radiogroup" aria-label="Delete options">
            {SCOPES.map(([value, title, text]) => (
              <label
                key={value}
                className={`block cursor-pointer border p-4 transition-colors duration-200 focus-within:border-azure ${scope === value ? "border-azure bg-azure/5" : "border-white/10 hover:border-white/30"}`}
              >
                <input type="radio" name="scope" className="sr-only" checked={scope === value} onChange={() => setScope(value)} />
                <span className="block text-sm font-medium">{title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-white/55">{text}</span>
              </label>
            ))}
          </div>
          {people > 0 && <p className="mt-4 text-xs text-white/55">Currently shared with {people} {people === 1 ? "person" : "people"}.</p>}
        </>
      ) : (
        <p className="text-sm leading-relaxed text-white/60">
          “{file.name}” will disappear from your list. You won't see it again unless the owner sends it to you again.
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" disabled={busy} onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={go} loading={busy} loadingText="Waiting for blockchain…">
          {file.mine && scope === "everyone" ? "Delete for everyone" : file.mine ? "Delete from me" : "Remove"}
        </Button>
      </div>
    </Modal>
  );
}