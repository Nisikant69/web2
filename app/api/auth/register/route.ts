import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // THE FIX:
    // The frontend sends 'name', but the DB needs 'fullName'.
    // We try to grab 'fullName' first. If it's missing, we grab 'name'.
    const fullName = body.fullName || body.name;
    const { email, username, password } = body || {}

    // Validation
    if (!fullName || !email || !username || !password) {
      console.log("Missing fields. Received:", body);
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    })

    if (existing) {
      return NextResponse.json({ error: 'User with that email or username already exists' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashed,
      }
    })

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
