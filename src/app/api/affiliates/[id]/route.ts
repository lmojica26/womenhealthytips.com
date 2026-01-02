import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { updateAffiliateLinkSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/affiliates/[id] - Get single affiliate or track click
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const track = searchParams.get("track") === "true";

    const affiliate = await prisma.affiliateLink.findUnique({
      where: { id },
    });

    if (!affiliate) {
      // Try to find by shortCode
      const byShortCode = await prisma.affiliateLink.findUnique({
        where: { shortCode: id },
      });

      if (!byShortCode) {
        return NextResponse.json(
          { error: "Affiliate not found" },
          { status: 404 }
        );
      }

      // Track click and redirect
      if (track) {
        await prisma.affiliateLink.update({
          where: { id: byShortCode.id },
          data: { clickCount: { increment: 1 } },
        });
        return NextResponse.redirect(byShortCode.url);
      }

      return NextResponse.json(byShortCode);
    }

    // Track click and redirect
    if (track) {
      await prisma.affiliateLink.update({
        where: { id },
        data: { clickCount: { increment: 1 } },
      });
      return NextResponse.redirect(affiliate.url);
    }

    return NextResponse.json(affiliate);
  } catch (error) {
    console.error("Error fetching affiliate:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate" },
      { status: 500 }
    );
  }
}

// PUT /api/affiliates/[id] - Update affiliate (admin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateAffiliateLinkSchema.parse(body);

    // Check if affiliate exists
    const existingAffiliate = await prisma.affiliateLink.findUnique({
      where: { id },
    });
    if (!existingAffiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Ensure shortCode is unique if changed
    if (
      validatedData.shortCode &&
      validatedData.shortCode !== existingAffiliate.shortCode
    ) {
      const codeExists = await prisma.affiliateLink.findUnique({
        where: { shortCode: validatedData.shortCode },
      });
      if (codeExists) {
        return NextResponse.json(
          { error: "Short code already exists" },
          { status: 400 }
        );
      }
    }

    const affiliate = await prisma.affiliateLink.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.url && { url: validatedData.url }),
        ...(validatedData.shortCode && { shortCode: validatedData.shortCode }),
        ...(validatedData.network && { network: validatedData.network }),
        ...(validatedData.productId !== undefined && {
          productId: validatedData.productId,
        }),
        ...(validatedData.commission !== undefined && {
          commission: validatedData.commission,
        }),
        ...(validatedData.description !== undefined && {
          description: validatedData.description,
        }),
        ...(validatedData.imageUrl !== undefined && {
          imageUrl: validatedData.imageUrl,
        }),
        ...(validatedData.callToAction !== undefined && {
          callToAction: validatedData.callToAction,
        }),
        ...(validatedData.showInSidebar !== undefined && {
          showInSidebar: validatedData.showInSidebar,
        }),
        ...(validatedData.sidebarOrder !== undefined && {
          sidebarOrder: validatedData.sidebarOrder,
        }),
        ...(validatedData.isActive !== undefined && {
          isActive: validatedData.isActive,
        }),
      },
    });

    return NextResponse.json(affiliate);
  } catch (error) {
    console.error("Error updating affiliate:", error);
    return NextResponse.json(
      { error: "Failed to update affiliate" },
      { status: 500 }
    );
  }
}

// DELETE /api/affiliates/[id] - Delete affiliate (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if affiliate exists
    const existingAffiliate = await prisma.affiliateLink.findUnique({
      where: { id },
    });
    if (!existingAffiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    await prisma.affiliateLink.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting affiliate:", error);
    return NextResponse.json(
      { error: "Failed to delete affiliate" },
      { status: 500 }
    );
  }
}
