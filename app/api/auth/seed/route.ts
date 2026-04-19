// app/api/auth/seed/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/lib/models/User";

export async function POST() {
  try {
    await connectToDatabase();

    const users = [
      { name: "Admin User", email: "admin@tct.com", password: "admin123" },
      {
        name: "John Smith",
        email: "john.smith@example.com",
        password: "user123",
      },
      {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        password: "user123",
      },
      {
        name: "Michael Brown",
        email: "michael.b@example.com",
        password: "user123",
      },
      {
        name: "Emily Davis",
        email: "emily.d@example.com",
        password: "user123",
      },
      {
        name: "David Wilson",
        email: "david.w@example.com",
        password: "user123",
      },
      {
        name: "Lisa Anderson",
        email: "lisa.a@example.com",
        password: "user123",
      },
      {
        name: "Robert Taylor",
        email: "robert.t@example.com",
        password: "user123",
      },
      {
        name: "Maria Garcia",
        email: "maria.g@example.com",
        password: "user123",
      },
      {
        name: "James Martinez",
        email: "james.m@example.com",
        password: "user123",
      },
      {
        name: "Patricia Lee",
        email: "patricia.l@example.com",
        password: "user123",
      },
      {
        name: "Thomas White",
        email: "thomas.w@example.com",
        password: "user123",
      },
      {
        name: "Jennifer Harris",
        email: "jennifer.h@example.com",
        password: "user123",
      },
      {
        name: "Charles Clark",
        email: "charles.c@example.com",
        password: "user123",
      },
      {
        name: "Susan Lewis",
        email: "susan.l@example.com",
        password: "user123",
      },
    ];

    let created = 0;
    let updated = 0;

    for (const user of users) {
      const existingUser = await User.findOne({ email: user.email });

      if (existingUser) {
        // Update existing user
        existingUser.name = user.name;
        existingUser.password = user.password;
        await existingUser.save();
        updated++;
      } else {
        // Create new user
        await User.create(user);
        created++;
      }
    }

    return NextResponse.json({
      message: "Users seeded successfully",
      created,
      updated,
      total: users.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
