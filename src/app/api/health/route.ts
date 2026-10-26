import { connection } from "next/server";

import { prisma } from "@/lib/prisma";

// The deploy smoke test (docs/04): 200 when the app can reach the database,
// 503 when it can't. Never cached.
export async function GET() {
  await connection();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "database unavailable" }, { status: 503 });
  }
}
