import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuthenticatedAdmin } from "@/lib/auth/admin-session";
import { toSlug } from "@/lib/utils/slug";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();

    const { id } = await params;
    const body = await req.json();
    const { name, description, iconKey, imageUrl, isActive, sortOrder, brand } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return NextResponse.json(
          { success: false, message: "name must be a non-empty string" },
          { status: 400 }
        );
      }
      const slug = toSlug(name);
      if (slug !== existing.slug) {
        const conflict = await prisma.category.findUnique({ where: { slug } });
        if (conflict) {
          return NextResponse.json(
            { success: false, message: "A category with this name already exists" },
            { status: 409 }
          );
        }
        updateData.slug = slug;
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) updateData.description = description ?? null;
    if (iconKey !== undefined) updateData.iconKey = iconKey ?? "cube";
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);
    if (brand !== undefined) updateData.brand = brand;

    // Image is only supported for RAYK categories. If the resolved brand is
    // anything other than "rayk", we always clear the column.
    const resolvedBrand = (brand ?? existing.brand) as string;
    if (imageUrl !== undefined) {
      updateData.imageUrl = resolvedBrand === "rayk" ? (imageUrl ?? null) : null;
    } else if (brand !== undefined && resolvedBrand !== "rayk") {
      updateData.imageUrl = null;
    }

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuthenticatedAdmin();

    const { id } = await params;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true, message: "Category deactivated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    const status = message === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
