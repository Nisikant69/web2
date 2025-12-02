import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ count: users.length, users });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
