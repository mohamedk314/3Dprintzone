import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { CustomRequestType } from "@prisma/client";
import { sendNewCustomRequestAdminEmail } from "@/lib/email/notifications";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_TYPES = Object.values(CustomRequestType);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, requestType, description, referenceUrl } = body;

    if (!fullName?.trim()) {
      return NextResponse.json({ success: false, message: "fullName is required" }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ success: false, message: "email is required" }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ success: false, message: "phone is required" }, { status: 400 });
    }
    if (!VALID_TYPES.includes(requestType)) {
      return NextResponse.json(
        { success: false, message: `requestType must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }
    if (!description?.trim()) {
      return NextResponse.json({ success: false, message: "description is required" }, { status: 400 });
    }

    const request = await prisma.customRequest.create({
      data: {
        fullName:     fullName.trim(),
        email:        email.trim().toLowerCase(),
        phone:        phone.trim(),
        requestType,
        description:  description.trim(),
        referenceUrl: referenceUrl?.trim() || null,
      },
      select: {
        id:          true,
        requestType: true,
        status:      true,
        createdAt:   true,
      },
    });

    sendNewCustomRequestAdminEmail({
      id: request.id, fullName: fullName.trim(),
      email: email.trim().toLowerCase(), phone: phone.trim(), requestType,
    }).catch((e) => console.error("[email]", e));

    return NextResponse.json({ success: true, data: request }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
