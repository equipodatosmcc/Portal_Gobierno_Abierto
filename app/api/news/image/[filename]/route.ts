import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOADS_DIR = path.resolve(process.cwd(), "public", "uploads", "news");

const MIME_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename: raw } = await params;
  const filename = decodeURIComponent(raw ?? "");

  if (!filename || filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    return notFound();
  }

  const extension = path.extname(filename).toLowerCase();
  const contentType = MIME_BY_EXTENSION[extension];
  if (!contentType) {
    return notFound();
  }

  const absolutePath = path.join(UPLOADS_DIR, filename);
  if (!absolutePath.startsWith(UPLOADS_DIR + path.sep)) {
    return notFound();
  }

  try {
    const fileStat = await stat(absolutePath);
    if (!fileStat.isFile()) {
      return notFound();
    }

    const buffer = await readFile(absolutePath);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileStat.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return notFound();
  }
}
