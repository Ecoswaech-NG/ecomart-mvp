import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function POST(req: NextRequest) {
  try {
    // ⚠️  SECURITY: Require authentication before creating logistics listings
    const session = await getUserFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required to create logistics listings" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.type || !body.createdBy || !body.userName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify that createdBy matches authenticated user
    if (body.createdBy !== session.userId && body.createdBy !== session.email) {
      return NextResponse.json(
        { success: false, error: "You can only create logistics listings for your own account" },
        { status: 403 }
      );
    }

    const logistics = await prisma.logistics.create({
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        coverage: body.coverage,
        pricing: body.pricing,
        contact: body.contact,
        specializations: body.specializations,
        certifications: body.certifications,
        createdBy: body.createdBy,
        userName: body.userName,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, logistics });
  } catch (error) {
    console.error("Error creating logistics service:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create logistics service" },
      { status: 500 }
    );
  }
}
