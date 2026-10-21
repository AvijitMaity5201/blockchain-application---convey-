import Link from "next/link";

const STEPS = [
  {
    title: "Upload and lock",
    text: "Choose a file and upload it. Before anything leaves your browser, Convey takes a fingerprint of the file (a SHA-256 hash) and encrypts it with a fresh key. Only the encrypted copy is ever stored, so the storage service never holds anything readable.",
  },
  {
    title: "Record it on the blockchain",
    text: "The fingerprint, the storage reference and the permissions are written to a smart contract through your MetaMask wallet. That record cannot be quietly edited or deleted, which is what makes later tampering detectable.",
  },
  {
    title: "Send it to the right people",
    text: "Pick who receives the file, what they may do with it (view, download or edit) and when their access ends. The file key is locked separately for each recipient, so only the people you choose can open it.",
  },
  {
    title: "Open and verify",
    text: "When a recipient opens the file, Convey decrypts it in their browser and compares its fingerprint with the blockchain record. If even one byte has changed, they are warned and the file is not opened. Anyone can also check a copy of a file on the Verify File page.",
  },
  {
    title: "Stay in control and accountable",
    text: "Owners can remove access at any time, and recipients can ask for more. Every action, whether sending, opening, removing or deleting, is recorded, so managers and administrators can review exactly what happened and when.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-8 bg-canvas px-6 py-24 text-white md:px-12 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[1fr_1.6fr] md:gap-20">
          <div className="md:sticky md:top-24 md:self-start">
            <p className="text-sm text-white/55">How it works</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Share files without trusting a middleman
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
              Convey lets people in an organization share confidential files without depending on one server
              or one administrator. Each file is locked before it leaves your computer, and every permission
              is written to a blockchain that nobody can quietly rewrite.
            </p>
          </div>

          <ol className="divide-y divide-white/10 border-y border-white/10">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-6 py-8 md:gap-10 md:py-10">
                <span className="w-8 shrink-0 pt-1 font-display text-sm text-white/55">0{i + 1}</span>
                <div>
                  <h3 className="text-lg font-medium">{s.title}</h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mx-auto mt-20 flex max-w-6xl flex-col gap-6 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm leading-relaxed text-white/70">
          Ready to try it? Connect your wallet to get started, or read more about what Convey is and why it exists.
        </p>
        <div className="flex gap-4">
          <Link href="/login" className="bg-white px-8 py-3.5 text-sm font-medium text-black transition duration-200 ease-out hover:bg-white/90 active:scale-[0.97]">
            Create account
          </Link>
          <Link href="/about" className="border border-white/25 px-8 py-3.5 text-sm font-medium text-white">
            About Convey
          </Link>
        </div>
      </div>
    </section>
  );
}