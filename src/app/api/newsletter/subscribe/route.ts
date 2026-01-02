import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const subscribeSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().optional(),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = subscribeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, firstName, source } = result.data;

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (!existing.isActive) {
        // Resubscribe
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            isActive: true,
            firstName: firstName || existing.firstName,
            unsubscribedAt: null,
          },
        });

        return NextResponse.json({
          success: true,
          message: "Welcome back! You've been resubscribed.",
        });
      }

      return NextResponse.json({
        success: true,
        message: "You're already subscribed!",
      });
    }

    // Create new subscriber
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        firstName,
        source: source || "website",
        isActive: true,
      },
    });

    // TODO: Send welcome email
    // TODO: Add to ConvertKit/Mailchimp if configured

    return NextResponse.json({
      success: true,
      message: "Thanks for subscribing! Check your inbox for a welcome email.",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find subscriber
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 404 }
      );
    }

    // Update status to unsubscribed
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "You have been unsubscribed successfully.",
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe. Please try again." },
      { status: 500 }
    );
  }
}
