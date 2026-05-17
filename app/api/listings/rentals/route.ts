import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/getUser";

export async function POST(req: NextRequest) {
  try {
    // ⚠️  SECURITY: Require authentication before creating rentals
    const session = await getUserFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required to create rental listings" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.vehicle || !body.location || !body.daily || !body.createdBy || !body.userName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify that createdBy matches authenticated user
    if (body.createdBy !== session.userId && body.createdBy !== session.email) {
      return NextResponse.json(
        { success: false, error: "You can only create rentals for your own account" },
        { status: 403 }
      );
    }

    const rental = await prisma.rental.create({
      data: {
        vehicle: body.vehicle,
        location: body.location,
        daily: body.daily,
        weekly: body.weekly,
        monthly: body.monthly,
        deposit: body.deposit,
        minAge: body.minAge,
        insurance: body.insurance ?? false,
        delivery: body.delivery ?? false,
        deliveryFee: body.deliveryFee,
        rules: body.rules,
        createdBy: body.createdBy,
        userName: body.userName,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, rental });
  } catch (error) {
    console.error("Error creating rental listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create rental listing" },
      { status: 500 }
    );
  }
}
