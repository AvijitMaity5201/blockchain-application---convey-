import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export const metadata = { title: "About | Convey" };

const CONTENTS = [
  ["overview", "Overview"],
  ["problem", "The problem"],
  ["solution", "How Convey helps"],
  ["features", "Key features"],
  ["roles", "Roles"],
  ["security", "Security model"],
  ["blockchain", "Why a blockchain"],
  ["limits", "Limitations"],
  ["start", "Getting started"],
];

const FACTS = [
  ["Type", "Web application"],
  ["Purpose", "Confidential file sharing inside an organization"],
  ["Sign-in", "MetaMask wallet"],
  ["Network", "Ethereum (Sepolia test network)"],
  ["File storage", "IPFS, encrypted files only"],
  ["Encryption", "AES-256-GCM and X25519"],
  ["Roles", "Employee, Manager, Admin"],
  ["Built with", "Next.js, Tailwind CSS, Solidity, Hardhat"],
];

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="border-b border-white/10 pb-2 font-display text-2xl">{title}</h2>
      <div className="mt-5 space-y-4 text-[15px] leading-7 text-white/80">{children}</div>
    </section>
  );
}

const List = ({ children }) => <ul className="list-disc space-y-2 pl-5 marker:text-white/55">{children}</ul>;

export default function About() {
  return (
    <main className="min-h-screen bg-canvas text-white">
      <Navbar />

      {/* Big image: put your file at web/public/images/about-hero.jpg */}
      <figure className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="relative aspect-[21/9] w-full overflow-hidden border border-white/10 bg-panel">
          <Image src="/images/about-hero.jpg" alt="" fill priority sizes="(min-width: 1280px) 1152px, 100vw" className="object-cover" />
        </div>
        <figcaption className="mt-2 text-xs text-white/55">Convey keeps files private from the moment they leave your browser.</figcaption>
      </figure>

      <div className="mx-auto max-w-6xl px-6 pb-24 pt-12 md:px-12">
        <h1 className="font-display text-4xl md:text-5xl">Convey</h1>
        <p className="mt-3 max-w-2xl text-white/70">Secure file storage and transfer for organizations.</p>
        <div className="mt-8 h-px bg-white/10" />

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem]">
          {/* Sidebar: facts and contents (first on small screens, right column on large) */}
          <aside className="space-y-6 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-8 lg:self-start">
            <div className="border border-white/10 bg-card">
              <p className="border-b border-white/10 bg-card-2 px-4 py-3 text-sm font-medium">At a glance</p>
              <dl className="divide-y divide-white/5 text-sm">
                {FACTS.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-3 px-4 py-2.5">
                    <dt className="text-white/55">{k}</dt>
                    <dd className="text-white/85">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <nav aria-label="Contents" className="border border-white/10 bg-card p-4">
              <p className="mb-3 text-sm font-medium">Contents</p>
              <ol className="space-y-1.5 text-sm">
                {CONTENTS.map(([id, label], i) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-white/70 transition-colors duration-200 hover:text-azure">
                      <span className="mr-2 text-white/55">{i + 1}</span>{label}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="min-w-0 space-y-12 lg:col-start-1 lg:row-start-1">
            <Section id="overview" title="Overview">
              <p>
                Convey is a web application for sharing confidential files inside an organization. People upload
                documents, reports, spreadsheets, proposals or ideas, and send them only to the colleagues who are
                meant to see them.
              </p>
              <p>
                Two ideas set it apart. Files are encrypted in the user's own browser before they are stored, so the
                storage service never holds a readable copy. And the record of who may do what is kept on a
                blockchain, so it cannot be changed or erased in secret. People sign in with the MetaMask wallet
                they already use, so there are no passwords to create or lose.
              </p>
            </Section>

            <Section id="problem" title="The problem">
              <p>
                Most teams still move sensitive files by email attachment, chat message or shared drive. These tools
                are convenient, but they share the same weaknesses.
              </p>
              <List>
                <li>The provider or an administrator can usually read the files.</li>
                <li>Permissions can be changed, and history deleted, without anyone noticing.</li>
                <li>When a file passes through many hands, nobody can easily prove which version is genuine.</li>
                <li>Access often lingers long after a project, or a person's role, has ended.</li>
              </List>
            </Section>

            <Section id="solution" title="How Convey helps">
              <h3 className="font-medium text-white">Private by design</h3>
              <p>
                Encryption happens before upload. The storage service and the website's server only ever handle
                scrambled data, and the keys never leave the people involved.
              </p>
              <h3 className="font-medium text-white">Permissions you can prove</h3>
              <p>
                Who owns a file, who received it, what they may do and when their access ends are all recorded in a
                smart contract. The rules are enforced by the contract itself, not by a database someone could edit.
              </p>
              <h3 className="font-medium text-white">Tampering is detected</h3>
              <p>
                Every version of a file has a fingerprint recorded on the blockchain. Each time a file is opened,
                Convey compares it with that fingerprint, and the Verify File page lets anyone check a copy they
                were given.
              </p>
              <h3 className="font-medium text-white">Everything is accountable</h3>
              <p>
                Sending, opening, removing access and deleting all leave a permanent record. Managers and
                administrators can review that history and export it.
              </p>
            </Section>

            <Section id="features" title="Key features">
              <List>
                <li>Encrypted upload and storage, with a separate key for every file.</li>
                <li>Send a file with View, Download or Edit permission, and an optional expiry date.</li>
                <li>Requests: ask for access again after it was removed, or ask for more permission.</li>
                <li>Version history, with a fingerprint recorded for every version.</li>
                <li>Integrity check every time a file is opened, plus a standalone Verify File page.</li>
                <li>An inbox that tells you when a file arrives, access changes, or a file is deleted by its owner.</li>
                <li>Delete from me, or delete for everyone, so removing a file never surprises the people who have it.</li>
                <li>Audit Logs with filters and CSV export for managers and administrators.</li>
              </List>
            </Section>

            <Section id="roles" title="Roles">
              <p><span className="text-white">Employee.</span> Uploads and sends files, opens files shared with them, makes requests and verifies files.</p>
              <p><span className="text-white">Manager.</span> Everything an employee can do, plus read access to the Audit Logs.</p>
              <p><span className="text-white">Admin.</span> Everything a manager can do, plus adding members and changing roles.</p>
              <p>
                Nobody, including the administrator, can browse files that were not shared with them. Audit Logs show
                what happened, never what is inside a file.
              </p>
            </Section>

            <Section id="security" title="Security model">
              <p>
                Each file is encrypted with its own random AES-256 key. That key is then locked separately for every
                person who receives the file, using a key pair derived from their wallet, so only that person can
                unlock it. Only the locked copies of the key are stored on the blockchain.
              </p>
              <p>
                Convey never sees a wallet's private key. Signing happens inside MetaMask, and the same wallet
                always produces the same encryption keys, so nothing needs to be saved or backed up separately.
              </p>
              <p>
                What is not secret: the file name, category, owner, fingerprint and timestamps are recorded on the
                blockchain. On a public network, a technical person could read them directly. The contents of the
                files remain encrypted.
              </p>
            </Section>

            <Section id="blockchain" title="Why a blockchain">
              <p>
                A blockchain gives the organization one shared record that no single person controls. Permissions
                and history cannot be rewritten afterwards, and the audit trail is created automatically as a side
                effect of using the system. The trade-off is that each action takes a few seconds to confirm.
              </p>
            </Section>

            <Section id="limits" title="Limitations">
              <List>
                <li>File metadata (names, categories, owners, fingerprints) is visible to anyone who inspects the blockchain.</li>
                <li>Removing access stops future access, but cannot take back a copy someone already downloaded.</li>
                <li>Each deployment serves a single organization.</li>
                <li>The online version accepts files up to 4 MB.</li>
                <li>It currently runs on a test network, using free test currency.</li>
              </List>
            </Section>

            <Section id="start" title="Getting started">
              <ol className="list-decimal space-y-2 pl-5 marker:text-white/55">
                <li>An administrator adds your wallet address to the organization.</li>
                <li>Open Convey and connect MetaMask.</li>
                <li>Create your encryption keys. This takes one signature and one confirmation, and only happens the first time.</li>
                <li>Upload a file, or open one that was shared with you.</li>
              </ol>
              <div className="pt-4">
                <Link href="/login" className="inline-block bg-white px-8 py-3.5 text-sm font-medium text-black transition duration-200 ease-out hover:bg-white/90 active:scale-[0.97]">
                  Launch app
                </Link>
              </div>
            </Section>
          </article>
        </div>
      </div>

      <Footer />
    </main>
  );
}