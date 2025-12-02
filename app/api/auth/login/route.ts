import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers"; // <--- 1. Import this
import jwt from "jsonwebtoken"; // <--- 2. Import this (npm install jsonwebtoken @types/jsonwebtoken)


const secret = process.env.JWT_SECRET; // This now reads from your .env file
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("SERVER RECEIVED:", body);

    const lookupValue = body.identifier || body.email || body.username;
    const password = body.password;

    if (!lookupValue || !password) {
      return NextResponse.json({ error: "Missing email/username or password" }, { status: 400 });
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

    // --- 3. GENERATE TOKEN (The Missing Link) ---
    // Ensure JWT_SECRET matches what your middleware uses
    const secret = process.env.JWT_SECRET || "fallback-secret-key-change-this";
    const token = jwt.sign(
      { userId: user.id, username: user.username }, 
      secret, 
      { expiresIn: "1d" }
    );

    // --- 4. SET COOKIE (Crucial Step) ---
    // Note: In Next.js 15/16, cookies() is async
    const cookieStore = await cookies();
    
    cookieStore.set("token", token, { // Name must match middleware ('token')
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // False on localhost
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    console.log("Login Success! Cookie set.");
    return NextResponse.json({ success: true, user: { id: user.id, name: user.fullName } });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}