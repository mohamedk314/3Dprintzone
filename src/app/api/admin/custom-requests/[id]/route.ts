import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { CustomRequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_STATUSES = Object.values(CustomRequestStatus);

const fullSelect = {
  id:           true,
  fullName:     true,
  email:        true,
  phone:        true,
  requestType:  true,
  description:  true,
  referenceUrl: true,
  status:       true,
  adminNotes:   true,
  createdAt:    true,
  updatedAt:    true,
} as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();

    const { id } = await params;

    const request = await prisma.customRequest.findUnique({
      where:  { id },
      select: fullSelect,
    });

    if (!request) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: request });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status  = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();

    const { id } = await params;
    const body   = await req.json();
    const { status, adminNotes } = body;

    const existing = await prisma.customRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { success: false, message: `status must be one of: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided" },
        { status: 400 }
      );
    }

    const updated = await prisma.customRequest.update({
      where:  { id },
      data:   updateData,
      select: fullSelect,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status  = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
