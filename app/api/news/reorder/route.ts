import { NextResponse } from "next/server";
import { requireSessionManager } from "@/lib/content-auth";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    await requireSessionManager();

    const body = (await request.json()) as { ids?: unknown };

    if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "number")) {
      return NextResponse.json({ error: "ids must be an array of numbers" }, { status: 400 });
    }

    const ids = body.ids as number[];

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.news.update({
          where: { id },
          data: { position: index },
        }),
      ),
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
