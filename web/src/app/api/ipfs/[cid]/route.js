import { readFile } from "fs/promises";
import path from "path";

export async function GET(_req, { params }) {
  const { cid } = await params;
  if (!/^[a-zA-Z0-9-]+$/.test(cid)) return new Response("Bad CID", { status: 400 });

  if (cid.startsWith("local-")) {
    if (process.env.NODE_ENV === "production") return new Response("Not found", { status: 404 });
    try {
      return new Response(await readFile(path.join(process.cwd(), ".storage", cid)));
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  const gateway = (process.env.IPFS_GATEWAY || "https://ipfs.io/ipfs").replace(/\/$/, "");
  const r = await fetch(`${gateway}/${cid}`);
  if (!r.ok || !r.body) return new Response("Gateway error", { status: 502 });
  return new Response(r.body, {
    headers: { "Content-Type": "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}