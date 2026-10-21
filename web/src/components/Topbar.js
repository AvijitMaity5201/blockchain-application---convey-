"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mail, Menu } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/context/VaultContext";
import { ROLES } from "@/lib/contract";

export default function Topbar({ onMenu }) {
  const { account, profile, switchAccount, signOut } = useWallet();
  const { unread } = useVault();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.replace("/login");
  }

  const item = "block w-full py-1.5 text-left text-sm text-white/70 transition-colors duration-200 hover:text-azure";

  return (
    <header className="flex h-20 shrink-0 items-center justify-between px-6 md:justify-end md:px-10">
      <button onClick={onMenu} aria-label="Open menu" className="text-white/70 transition-colors duration-200 hover:text-azure md:hidden">
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-6">
        <Link
          href="/inbox"
          className={`flex items-center gap-2 text-sm transition-colors duration-200 hover:text-azure ${
            path.startsWith("/inbox") ? "text-azure" : "text-white/80"
          }`}
        >
          <Mail size={16} strokeWidth={1.75} />
          Inbox
          {unread > 0 && (
            <span className="min-w-5 bg-azure px-1.5 text-center text-[10px] font-semibold leading-5 text-black">{unread}</span>
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Account menu"
            className="flex size-10 items-center justify-center rounded-full border border-white/20 text-sm font-medium transition-colors duration-200 hover:border-azure hover:text-azure"
          >
            {profile.name.charAt(0).toUpperCase()}
          </button>

          {open && (
            <div className="absolute right-0 top-12 z-50 w-64 animate-fade-up border border-white/10 bg-panel p-4 shadow-xl motion-reduce:animate-none">
              <p className="text-sm font-medium">{profile.name}</p>
              <p className="mt-0.5 text-xs text-white/55">{ROLES[profile.role]} · {profile.department}</p>
              <p className="mt-2 break-all text-[11px] text-white/55">{account}</p>
              <div className="mt-4 border-t border-white/10 pt-3">
                <button className={item} onClick={() => { setOpen(false); switchAccount(); }}>Switch account</button>
                <button className={item} onClick={handleSignOut}>Sign out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}