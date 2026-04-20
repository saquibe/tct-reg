import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { Registration } from "@/lib/models/Registration";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email");
    const mobile = searchParams.get("mobile");

    if (email) {
      const existing = await Registration.findOne({ email });
      if (existing) {
        return NextResponse.json({
          exists: true,
          regCode: existing.regCode,
          field: "email",
        });
      }
    }

    if (mobile) {
      const existing = await Registration.findOne({ mobile });
      if (existing) {
        return NextResponse.json({
          exists: true,
          regCode: existing.regCode,
          field: "mobile",
        });
      }
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error("Error checking registration:", error);
    return NextResponse.json(
      { exists: false, error: "Server error" },
      { status: 500 },
    );
  }
}
