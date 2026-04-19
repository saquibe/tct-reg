import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Registration } from "@/lib/models/Registration";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ regCode: string }> },
) {
  try {
    // Await the params to get the regCode
    const { regCode } = await params;

    await connectToDatabase();
    const registration = await Registration.findOne({
      regCode: regCode,
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error fetching registration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
