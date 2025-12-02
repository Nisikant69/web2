import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT } from "jose"; // <--- CHANGED: Using 'jose' for signing

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("SERVER RECEIVED:", body);

    const lookupValue = body.identifier || body.email || body.username;
    const password = body.password;

    if (!lookupValue || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: lookupValue },
          { username: lookupValue }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // --- JWT GENERATION WITH JOSE (Edge Compatible) ---
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is missing!");
      return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
    }
    
    // Convert secret to Uint8Array (Required by jose)
    const secretKey = new TextEncoder().encode(secret);
    
    // Create the token exactly how middleware expects it
    const token = await new SignJWT({ userId: user.id, username: user.username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(secretKey);

    // --- SET COOKIE ---
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    console.log("Login Success! Token generated with jose.");
    return NextResponse.json({ success: true, user: { id: user.id, name: user.fullName } });

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
