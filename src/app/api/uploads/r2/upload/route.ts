import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

export async function POST(req: NextRequest) {
  try {
    await requireAuthenticatedAdmin();

    const accountId       = process.env.R2_ACCOUNT_ID;
    const accessKeyId     = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName      = process.env.R2_BUCKET_NAME;
    const publicUrl       = process.env.R2_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
      return NextResponse.json({ success: false, message: "Storage not configured" }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "file field is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Only jpeg, png, and webp images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "File exceeds 10 MB limit" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const random    = Math.random().toString(36).slice(2, 8);
    const safe      = sanitizeFilename(file.name);
    const key       = `uploads/${timestamp}-${random}-${safe}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    await client.send(new PutObjectCommand({
      Bucket:        bucketName,
      Key:           key,
      Body:          buffer,
      ContentType:   file.type,
      ContentLength: buffer.length,
    }));

    const imageUrl = `${publicUrl.replace(/\/$/, "")}/${key}`;

    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
