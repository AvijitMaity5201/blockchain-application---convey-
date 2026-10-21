"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderOpen, Share2, KeyRound, ShieldCheck, Upload, ScrollText, UserPlus, Users } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { useVault } from "@/context/VaultContext";
import { ADMIN, MANAGER } from "@/lib/contract";

const DASH = { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard };
const AUDIT = { href: "/audit", label: "Audit History", icon: ScrollText };
const STAFF = [
  DASH,
  { href: "/files", label: "My Files", icon: FolderOpen },
  { href: "/shared", label: "Shared with me", icon: Share2 },
  { href: "/permissions", label: "Permissions", icon: KeyRound, badge: true },
  { href: "/verification", label: "Verification", icon: ShieldCheck },
  { href: "/upload", label: "Upload Files", icon: Upload },
];
const ADMIN_NAV = [
  DASH,
  { href: "/users/add", label: "Add Users", icon: UserPlus },
  { href: "/users/manage", label: "Manage Users", icon: Users },
  AUDIT,
];

function Item({ href, label, icon: Icon, active, badge, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-200 hover:text-azure ${active ? "text-azure" : "text-white/70"}`}
    >
      <Icon size={17} strokeWidth={1.75} className="shrink-0" />
      <span className="flex-1">{label}</span>
      {badge > 0 && <span className="min-w-5 bg-azure px-1.5 text-center text-[10px] font-semibold leading-5 text-black">{badge}</span>}
    </Link>
  );
}

export default function Sidebar({ open, onClose }) {
  const path = usePathname();
  const { profile } = useWallet();
  const { incoming } = useVault();
  const isActive = (href) => path === href || path.startsWith(href + "/");
  const isAdmin = profile.role === ADMIN;
  const main = (isAdmin ? ADMIN_NAV : STAFF).map((n) => (n.badge ? { ...n, badge: incoming.length } : n));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-panel transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 md:self-start ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="relative flex h-20 shrink-0 items-center px-8">
          <Link href="/dashboard" className="font-display text-xl font-medium tracking-tight text-shimmer">Convey</Link>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-white/5 via-white/25 to-white/5" />
        </div>
        <nav className="flex-1 overflow-y-auto px-5 py-8">
          <div className="space-y-1">
            {main.map((n) => <Item key={n.href} {...n} active={isActive(n.href)} onClick={onClose} />)}
          </div>
          {profile.role === MANAGER && (
            <>
              <p className="mb-2 mt-8 px-3 text-xs text-white/55">Controls</p>
              <Item {...AUDIT} active={isActive(AUDIT.href)} onClick={onClose} />
            </>
          )}
        </nav>
      </aside>
    </>
  );
}