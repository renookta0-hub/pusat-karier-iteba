// Minimal static file server for local development.
// Run with: bun run dev   (auto-restarts on file changes via --watch)
// The app itself is a single static page (public/index.html) that does its
// own hash-based routing (#/about, #/dashboard, ...) entirely client-side,
// so this server only ever needs to hand back files from ./public.

import { join } from "node:path";

const PORT = Number(process.env.PORT) || 5173;
// import.meta.dir (Bun-specific) gives a normal OS path — unlike
// new URL(...).pathname, which breaks on Windows (yields "/C:/...").
const PUBLIC_DIR = join(import.meta.dir, "public");
const INDEX_FILE = join(PUBLIC_DIR, "index.html");

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;

    const file = Bun.file(join(PUBLIC_DIR, pathname));
    if (await file.exists()) return new Response(file);

    // Hash-routed SPA: any unknown path falls back to index.html.
    return new Response(Bun.file(INDEX_FILE));
  },
});

console.log(`Pusat Karir ITEBA berjalan di http://localhost:${PORT}`);
