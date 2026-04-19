// app/api/test-db/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";

export async function GET() {
  try {
    await connectToDatabase();
    return NextResponse.json({
      success: true,
      message: "Database connected successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
