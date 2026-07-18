import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { CustomRequestType, CustomRequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_TYPES    = Object.values(CustomRequestType);
const VALID_STATUSES = Object.values(CustomRequestStatus);

export async function GET(req: NextRequest) {
  try {
    await requireAuthenticatedAdmin();

    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, Number(searchParams.get("page")  ?? "1"));
    const limit  = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
    const type   = searchParams.get("type")   as CustomRequestType   | null;
    const status = searchParams.get("status") as CustomRequestStatus | null;
    const search = searchParams.get("search")?.trim() ?? "";
    const from   = searchParams.get("from");
    const to     = searchParams.get("to");

    if (type && !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, message: `type must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { success: false, message: `status must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const where = {
      ...(type   ? { requestType: type }   : {}),
      ...(status ? { status }              : {}),
      ...(from || to ? {
        createdAt: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to   ? { lte: new Date(to)   } : {}),
        },
      } : {}),
      ...(search ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { email:    { contains: search, mode: "insensitive" as const } },
          { phone:    { contains: search, mode: "insensitive" as const } },
        ],
      } : {}),
    };

    const [total, requests] = await Promise.all([
      prisma.customRequest.count({ where }),
      prisma.customRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip:    (page - 1) * limit,
        take:    limit,
        select: {
          id:          true,
          fullName:    true,
          email:       true,
          phone:       true,
          requestType: true,
          status:      true,
          referenceUrl: true,
          createdAt:   true,
          updatedAt:   true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: requests,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status  = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
