import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

export async function GET(request: NextRequest) {
  try {
    console.log('Verify API called'); // Debug log

    // Get token from cookie or Authorization header
    const cookieToken = request.cookies.get('auth-token')?.value
    const authHeader = request.headers.get('authorization')
    const bearerToken = authHeader?.replace('Bearer ', '')

    console.log('Cookie token exists:', !!cookieToken); // Debug log
    console.log('Bearer token exists:', !!bearerToken); // Debug log

    const token = cookieToken || bearerToken

    if (!token) {
      console.log('No token provided'); // Debug log
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      )
    }

    console.log('Token found, verifying...'); // Debug log

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log('Token verified successfully:', { userId: decoded.userId, email: decoded.email }); // Debug log

    const user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      company: decoded.company
    }

    return NextResponse.json({
      success: true,
      user
    })

  } catch (error) {
    console.error('Token verification error:', error)
    
    // Provide more specific error information
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      )
    } else if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      )
    } else {
      return NextResponse.json(
        { error: 'Token verification failed' },
        { status: 401 }
      )
    }
  }
}

export async function POST(request: NextRequest) {
  // Same logic as GET for flexibility
  return GET(request)
}