"use client";
import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/context/VaultContext";
import { sha256Hex, generateFileKey, encryptBuffer, wrapKey } from "@/lib/crypto";
import { uploadEncrypted } from "@/lib/ipfs";
import { notify } from "@/lib/notify";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Steps from "@/components/Steps";
import { inputCls, labelCls } from "@/components/ui/styles";

const CATEGORIES = ["Report", "Sheet", "Proposal", "Idea", "Policy", "Other"];

export default function UploadModal({ onClose }) {
  const { contract, unlockKeys } = useWallet();
  const { refresh } = useVault();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Report");
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!file) return notify.error("Please choose a file first.");
    setBusy(true);
    try {
      const kp = await unlockKeys();
      setStep(1);
      const buf = await file.arrayBuffer();
      const hash = await sha256Hex(buf);
      setStep(2);
      const fileKey = generateFileKey();
      const encrypted = await encryptBuffer(buf, fileKey);
      setStep(3);
      const cid = await uploadEncrypted(encrypted, file.name);
      setStep(4);
      const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
      const tx = await contract.uploadFile({
        name: title.trim() ? title.trim() + ext : file.name,
        fileType: file.type || ext,
        category, cid, fileHash: hash,
        wrappedKey: wrapKey(fileKey, ethers.hexlify(kp.publicKey)),
      });
      await tx.wait();
      await refresh();
      notify.success("File uploaded.");
      onClose();
    } catch (err) {
      notify.error(err);
      setStep(0);
      setBusy(false);
    }
  }

  return (
    <Modal title="Upload file" size="lg" locked={busy} onClose={onClose}>
      <form onSubmit={submit} className="space-y-5">
        <label
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f && !busy) setFile(f); }}
          className="flex cursor-pointer flex-col items-center justify-center border border-dashed border-white/15 bg-card px-6 py-10 text-center transition-colors duration-200 hover:border-azure"
        >
          <span className="max-w-full truncate text-sm text-white/80">
            {file ? file.name : "Click to choose a file, or drop it here"}
          </span>
          {file && <span className="mt-1 text-xs text-white/40">{(file.size / 1024).toFixed(1)} KB</span>}
          <input type="file" className="hidden" disabled={busy} onChange={(e) => setFile(e.target.files[0] || null)} />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Title (optional)</span>
            <input className={inputCls} value={title} disabled={busy} onChange={(e) => setTitle(e.target.value)} placeholder="Q3 Financial Report" />
          </label>
          <label className="block">
            <span className={labelCls}>Category</span>
            <select className={inputCls} value={category} disabled={busy} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>

        {step > 0 && <Steps labels={["Fingerprint", "Encrypt", "Store", "Record"]} current={step} />}

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="secondary" disabled={busy} onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy} loadingText="Uploading…">Upload</Button>
        </div>
      </form>
    </Modal>
  );
}