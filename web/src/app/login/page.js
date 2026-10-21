"use client";
import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { deployed } from "@/lib/contract";
import ArrowLink from "@/components/ui/ArrowLink";

// 👉 If your files have different names or extensions, change these two lines only.
const ART_SRC = "/login-art.svg";
const METAMASK_ICON = "/metamask logo.png";

const STATUS_NOTICE = {
  "no-wallet": { text: "MetaMask was not detected in this browser. Install the extension and refresh the page.", mark: "not detected" },
  "no-contract": { text: "The vault contract was not found on this network. Make sure it is deployed.", mark: "not found" },
};

/** Simple message; only `mark` is shown in calm red */
function Notice({ text, mark }) {
  const i = mark ? text.indexOf(mark) : -1;
  return (
    <p role="alert" className="mt-5 max-w-[17rem] animate-fade-up text-xs leading-relaxed text-white/60 motion-reduce:animate-none">
      {i < 0 ? text : (
        <>
          {text.slice(0, i)}
          <span className="text-danger">{mark}</span>
          {text.slice(i + mark.length)}
        </>
      )}
    </p>
  );
}

function ActionButton({ busy, busyText, children, ...props }) {
  return (
    <button
      {...props}
      disabled={busy}
      className="flex w-full max-w-[13rem] items-center justify-center gap-2.5 bg-white px-6 py-3.5 text-sm font-medium text-black transition duration-200 ease-out hover:bg-white/90 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-70"
    >
      {busy ? <span className="animate-pulse">{busyText}</span> : children}
    </button>
  );
}

function Panel({ heading, body, address, notice, children }) {
  return (
    <div className="flex w-full max-w-xs animate-fade-up flex-col items-center text-center motion-reduce:animate-none">
      <h1 className="max-w-[17rem] text-sm font-medium uppercase leading-snug tracking-[0.08em] md:text-base">
        {heading}
      </h1>
      {body && <p className="mt-5 max-w-[16rem] text-xs leading-relaxed text-white/60">{body}</p>}
      {address && <p className="mt-5 select-all break-all text-[11px] tracking-wide text-white/60">{address}</p>}
      <div className={`flex w-full justify-center ${body || address ? "mt-8" : "mt-10"}`}>{children}</div>
      {notice && <Notice {...notice} />}
    </div>
  );
}

export default function Login() {
  const { account, status, error, busy, ready, connect, switchNetwork, switchAccount, setupKeys } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (ready && status === "ready") router.replace("/dashboard");
  }, [ready, status, router]);

  const notice = error || STATUS_NOTICE[status] || null;

  let screen = null;
  if (ready && status !== "ready") {
    if (status === "wrong-network") {
      screen = (
        <Panel
          key="network"
          heading="Switch to right network"
          body={`Your wallet is on a different network than this vault (chain ${deployed.chainId}).`}
          notice={error}
        >
          <ActionButton onClick={switchNetwork} busy={busy} busyText="Switching…">Switch Network</ActionButton>
        </Panel>
      );
    } else if (status === "unregistered") {
      screen = (
        <Panel key="unregistered" heading="Unregistered wallet address" address={account} notice={error}>
          <ActionButton onClick={switchAccount} busy={busy} busyText="Opening MetaMask…">Switch Account</ActionButton>
        </Panel>
      );
    } else if (status === "revoked") {
      screen = (
        <Panel
          key="revoked"
          heading="Access revoked"
          body="Your access to this vault was removed by an administrator."
          address={account}
          notice={error}
        >
          <ActionButton onClick={switchAccount} busy={busy} busyText="Opening MetaMask…">Switch Account</ActionButton>
        </Panel>
      );
    } else if (status === "needs-keys") {
      screen = (
        <Panel
          key="keys"
          heading="Create your encryption keys"
          body="These keys let you send and receive files securely. MetaMask will ask you to sign a message and confirm one transaction."
          notice={error}
        >
          <ActionButton onClick={setupKeys} busy={busy} busyText="Waiting for MetaMask…">Create Keys</ActionButton>
        </Panel>
      );
    } else {
      screen = (
        <Panel key="connect" heading="Connect your wallet" notice={notice}>
          <ActionButton onClick={() => connect(false)} busy={busy} busyText="Connecting…">
            <Image src={METAMASK_ICON} alt="" width={18} height={18} unoptimized />
            MetaMask
          </ActionButton>
        </Panel>
      );
    }
  }

  return (
    <main className="flex min-h-screen bg-canvas text-white">
      <aside className="relative hidden w-[58%] bg-panel md:block">
        <Image src={ART_SRC} alt="" fill priority sizes="58vw" className="object-cover" />
      </aside>

      <section className="relative flex flex-1 flex-col items-center justify-center px-6">
        <ArrowLink href="/" direction="up-left" className="absolute right-6 top-6 md:right-10 md:top-8">
          Back to home
        </ArrowLink>
        {screen}
      </section>
    </main>
  );
}