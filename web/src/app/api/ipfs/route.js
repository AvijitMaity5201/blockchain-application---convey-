import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file) return NextResponse.json({ error: "No file received" }, { status: 400 });

    // Online: real IPFS through Pinata
    if (process.env.PINATA_JWT) {
      const body = new FormData();
      body.append("file", file);
      body.append("network", "public");
      const r = await fetch("https://uploads.pinata.cloud/v3/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
        body,
      });
      const j = await r.json().catch(() => ({}));
      const cid = j?.data?.cid;
      if (!r.ok || !cid) return NextResponse.json({ error: "The storage service rejected the upload." }, { status: 502 });
      return NextResponse.json({ cid });
    }

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "File storage is not configured." }, { status: 500 });
    }

    // Local development only: store in web/.storage
    const buf = Buffer.from(await file.arrayBuffer());
    const cid = "local-" + crypto.createHash("sha256").update(buf).digest("hex");
    const dir = path.join(process.cwd(), ".storage");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, cid), buf);
    return NextResponse.json({ cid });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}