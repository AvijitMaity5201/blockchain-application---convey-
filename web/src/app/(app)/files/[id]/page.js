"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye, Download, Share2, Trash2, KeyRound, ArrowLeft, ShieldCheck, ShieldAlert } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/context/VaultContext";
import { ACCESS, accessLabel } from "@/lib/contract";
import { sha256Hex, decryptBuffer, encryptBuffer, unwrapKey } from "@/lib/crypto";
import { downloadEncrypted, uploadEncrypted } from "@/lib/ipfs";
import { fmtExpiry, fmtSize, fmtStamp, isExpired, short } from "@/lib/utils";
import { notify } from "@/lib/notify";
import Badge from "@/components/Badge";
import ShareModal from "@/components/ShareModal";
import RequestModal from "@/components/RequestModal";
import DeleteModal from "@/components/DeleteModal";
import Modal from "@/components/ui/Modal";
import MetaGrid from "@/components/ui/MetaGrid";
import Skeleton from "@/components/ui/Skeleton";
import Button, { buttonClass } from "@/components/ui/Button";
import SectionTitle from "@/components/ui/SectionTitle";
import { tableWrap, thCls, tdCls, trCls } from "@/components/ui/styles";

export default function FileDetail() {
  const { id } = useParams();
  const fileId = Number(id);
  const router = useRouter();
  const { contract, unlockKeys } = useWallet();
  const { filesById, loaded, nameOf, userBy, refresh } = useVault();

  const file = filesById[fileId];
  const hasAccess = !!file && file.level > 0;
  const isOwner = !!file && file.mine;

  const [versions, setVersions] = useState([]);
  const [access, setAccess] = useState([]);
  const [verified, setVerified] = useState(null);
  const [preview, setPreview] = useState(null);
  const [warn, setWarn] = useState(false);
  const [modal, setModal] = useState(null); // share | delete | request
  const [action, setAction] = useState(null);
  const [phase, setPhase] = useState("");

  const loadDetails = useCallback(async () => {
    if (!hasAccess) { setVersions([]); setAccess([]); return; }
    setVersions([...(await contract.getVersions(fileId))]);
    setAccess(isOwner ? [...(await contract.getAccessList(fileId))] : []);
  }, [contract, fileId, hasAccess, isOwner]);

  useEffect(() => { loadDetails().catch(console.error); }, [loadDetails]);

  function closePreview() {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  }

  /** View / Download: 1) blockchain transaction  2) verify against the on-chain fingerprint  3) show or save */
  async function open(mode) {
    setAction(mode);
    setPhase("Confirm in MetaMask…");
    try {
      const kp = await unlockKeys(); // free signature, once per page load
      const list = versions.length ? versions : [...(await contract.getVersions(fileId))];
      const latest = list[list.length - 1];

      await (await contract.recordAccess(fileId, mode === "download" ? 1 : 0)).wait();

      setPhase("Verifying file…");
      const grant = await contract.getMyGrant(fileId);
      const key = unwrapKey(grant.wrappedKey, kp.secretKey);
      const enc = await downloadEncrypted(latest.cid);
      let plain = null;
      try { plain = await decryptBuffer(enc, key); } catch {}
      const ok = !!plain && (await sha256Hex(plain)).toLowerCase() === latest.fileHash.toLowerCase();
      setVerified(ok);
      if (!ok) { setWarn(true); return; }

      const type = file.fileType.includes("/") ? file.fileType : "application/octet-stream";
      if (mode === "download") {
        const url = URL.createObjectURL(new Blob([plain], { type }));
        const a = document.createElement("a");
        a.href = url; a.download = file.name; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        notify.success("File verified and downloaded.");
      } else {
        closePreview();
        const isText = type.startsWith("text/") || type === "application/json";
        setPreview({
          type,
          url: isText ? null : URL.createObjectURL(new Blob([plain], { type })),
          text: isText ? new TextDecoder().decode(plain).slice(0, 20000) : null,
        });
        notify.success("File verified.");
      }
    } catch (e) {
      notify.error(e);
    } finally {
      setAction(null);
    }
  }

  async function addVersion(e) {
    const f = e.target.files[0];
    e.target.value = "";
    if (!f) return;
    setAction("version");
    try {
      const kp = await unlockKeys();
      const grant = await contract.getMyGrant(fileId);
      const key = unwrapKey(grant.wrappedKey, kp.secretKey); // the same file key is reused for every version
      const buf = await f.arrayBuffer();
      const hash = await sha256Hex(buf);
      const cid = await uploadEncrypted(await encryptBuffer(buf, key), f.name);
      await (await contract.addVersion(fileId, cid, hash, f.size)).wait();
      await Promise.all([loadDetails(), refresh()]);
      notify.success("New version recorded on the blockchain.");
    } catch (err) {
      notify.error(err);
    } finally {
      setAction(null);
    }
  }

  async function revoke(user) {
    setAction(`revoke:${user}`);
    try {
      await (await contract.revokeAccess(fileId, user)).wait();
      await Promise.all([loadDetails(), refresh()]);
      notify.success(`Access revoked for ${nameOf(user)}.`);
    } catch (e) {
      notify.error(e);
    } finally {
      setAction(null);
    }
  }

  if (!loaded) return <Skeleton className="h-64" />;
  if (!file) return <p className="text-sm text-white/55">This file doesn't exist, or hasn't been shared with you.</p>;

  const busy = !!action;
  const integrity =
    !hasAccess ? <span className="text-white/55">–</span>
    : verified === true ? <span className="inline-flex items-center gap-1.5 text-ok"><ShieldCheck size={14} /> Verified</span>
    : verified === false ? <span className="inline-flex items-center gap-1.5 text-danger"><ShieldAlert size={14} /> Mismatch</span>
    : <span className="text-white/55">Not checked yet</span>;

  return (
    <div className="space-y-8">
      <div>
        <button onClick={() => router.back()} className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/55 transition-colors duration-200 hover:text-azure">
          <ArrowLeft size={13} /> Back
        </button>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <h1 className="min-w-0 break-words text-xl font-medium">{file.name}</h1>
          <div className="flex flex-wrap gap-3">
            {hasAccess && (
              <Button variant="secondary" disabled={busy} loading={action === "view"} loadingText={phase} onClick={() => open("view")}>
                <Eye size={15} /> View
              </Button>
            )}
            {!isOwner && file.level >= 2 && (
              <Button disabled={busy} loading={action === "download"} loadingText={phase} onClick={() => open("download")}>
                <Download size={15} /> Download
              </Button>
            )}
            {isOwner && (
              <Button disabled={busy} onClick={() => setModal("share")}><Share2 size={15} /> Share</Button>
            )}
            {!isOwner && file.isActive && file.level < 3 && (
              <Button variant="secondary" disabled={busy} onClick={() => setModal("request")}><KeyRound size={15} /> Request permission</Button>
            )}
            <Button variant="danger" disabled={busy} onClick={() => setModal("delete")}>
              <Trash2 size={15} /> {isOwner ? "Delete" : "Remove"}
            </Button>
          </div>
        </div>
      </div>

      {file.state === "deleted" && <p className="border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{nameOf(file.owner)} deleted this file.</p>}
      {file.state === "revoked" && <p className="border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">Your access to this file was revoked. You can request permission again.</p>}
      {file.state === "expired" && <p className="border border-warn/30 bg-warn/5 px-4 py-3 text-sm text-warn">Your access expired on {fmtStamp(file.expiry)}. You can request permission again.</p>}

      <MetaGrid
        items={[
          { label: "Category", value: file.category },
          { label: "Size", value: fmtSize(file.size) },
          { label: "Owner", value: <>{nameOf(file.owner)}<span className="mt-0.5 block font-mono text-[11px] text-white/55">{short(file.owner)}</span></> },
          { label: "Recorded", value: fmtStamp(file.createdAt) },
          { label: "Your access", value: <span className={hasAccess ? "text-azure" : "text-warn"}>{accessLabel(file)}</span> },
          { label: "Integrity", value: integrity },
        ]}
      />

      {preview && (
        <div className="border border-white/10 bg-card p-3">
          <div className="mb-2 flex justify-end">
            <button onClick={closePreview} className="text-xs text-white/55 transition-colors duration-200 hover:text-azure">Close preview</button>
          </div>
          {preview.text !== null ? <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap p-3 text-sm text-white/80">{preview.text}</pre>
            : preview.type === "application/pdf" ? <iframe src={preview.url} title="Preview" className="h-[70vh] w-full" />
            : preview.type.startsWith("image/") ? <img src={preview.url} alt="" className="mx-auto max-h-[70vh] max-w-full" />
            : <p className="p-6 text-center text-sm text-white/55">No preview is available for this file type.</p>}
        </div>
      )}

      {hasAccess && (
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <SectionTitle>Versions</SectionTitle>
            {file.level >= 3 && (
              <label className={`${buttonClass("secondary")} cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
                {action === "version" ? "Waiting for blockchain…" : "+ New version"}
                <input type="file" className="hidden" disabled={busy} onChange={addVersion} />
              </label>
            )}
          </div>
          <div className={tableWrap}>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className={thCls}>Version</th><th className={thCls}>Added by</th><th className={thCls}>Recorded</th>
                  <th className={thCls}>Size</th><th className={thCls}>SHA-256</th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v, i) => (
                  <tr key={i} className={trCls}>
                    <td className={tdCls}>v{i + 1}</td>
                    <td className={tdCls}>{nameOf(v.uploader)}</td>
                    <td className={`${tdCls} whitespace-nowrap`}>{fmtStamp(v.timestamp)}</td>
                    <td className={`${tdCls} whitespace-nowrap`}>{fmtSize(v.size)}</td>
                    <td className={`${tdCls} font-mono text-xs`}>{short(v.fileHash)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {isOwner && hasAccess && (
        <section>
          <SectionTitle>Shared with</SectionTitle>
          {access.length === 0 ? <p className="text-sm text-white/55">Not shared with anyone yet.</p> : (
            <div className={tableWrap}>
              <table className="min-w-full">
                <thead>
                  <tr><th className={thCls}>Person</th><th className={thCls}>Permission</th><th className={thCls}>Expires</th><th className={thCls}></th></tr>
                </thead>
                <tbody>
                  {access.map((a) => {
                    const u = userBy[a.user.toLowerCase()];
                    return (
                      <tr key={a.user} className={trCls}>
                        <td className={tdCls}>
                          <span className="block text-white/90">{u?.name || short(a.user)}</span>
                          <span className="block text-[11px] text-white/55">{u?.department}</span>
                        </td>
                        <td className={tdCls}><Badge color="blue">{ACCESS[Number(a.level)]}</Badge></td>
                        <td className={`${tdCls} whitespace-nowrap`}>
                          {fmtExpiry(a.expiry)}{isExpired(a.expiry) && <span className="ml-2"><Badge color="amber">Expired</Badge></span>}
                        </td>
                        <td className={`${tdCls} text-right`}>
                          <button disabled={busy} onClick={() => revoke(a.user)} className="text-danger transition-opacity duration-200 hover:opacity-80 disabled:opacity-50">
                            {action === `revoke:${a.user}` ? "Revoking…" : "Revoke"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {modal === "share" && <ShareModal file={file} onDone={loadDetails} onClose={() => setModal(null)} />}
      {modal === "request" && <RequestModal file={file} onClose={() => setModal(null)} />}
      {modal === "delete" && <DeleteModal file={file} onDone={() => router.push(isOwner ? "/files" : "/shared")} onClose={() => setModal(null)} />}

      {warn && (
        <Modal title="Warning: file does not match" onClose={() => setWarn(false)}>
          <p className="text-sm leading-relaxed text-white/70">
            The contents of this file do not match the fingerprint recorded on the blockchain. It may have been
            <span className="text-danger"> altered or could be harmful</span>. Do not open or forward it. Tell the owner and your administrator.
          </p>
          <div className="mt-6 flex justify-end"><Button variant="secondary" onClick={() => setWarn(false)}>Close</Button></div>
        </Modal>
      )}
    </div>
  );
}