import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Try to import bcrypt, fallback to plain comparison if it fails
let bcrypt: any = null;
try {
  bcrypt = require("bcryptjs");
} catch (error) {
  console.warn(
    "bcrypt not available, using plain text passwords for development"
  );
}

// Mock user database - In production, use a real database
let users = [
  {
    id: 1,
    email: "admin@businessintel.com",
    password: "$2a$10$rOZbGKCZXvOVWqMhF.pNTOQxKtYfJ/YbOVZQKqP7aXV.XVnKZQnL.",
    plainPassword: "admin123",
    name: "Admin User",
    role: "admin",
    company: "Business Intelligence Platform",
    createdAt: new Date().toISOString(),
  },
];

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

async function hashPassword(
  password: string
): Promise<{ hash: string; plain: string }> {
  if (bcrypt) {
    try {
      const hash = await bcrypt.hash(password, 10);
      return { hash, plain: password };
    } catch (error: any) {
      console.warn("bcrypt hashing failed, using plain text:", error.message);
      return { hash: password, plain: password };
    }
  } else {
    // No bcrypt available, store as plain text (development only)
    return { hash: password, plain: password };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, company } = await request.json();

    // Validation
    if (!email || !password || !name || !company) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const { hash, plain } = await hashPassword(password);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email: email.toLowerCase(),
      password: hash,
      plainPassword: plain, // For development fallback
      name,
      role: "developer",
      company,
      createdAt: new Date().toISOString(),
    };

    // Add to database (in production, save to real database)
    users.push(newUser);

    console.log("New user registered:", {
      email: newUser.email,
      id: newUser.id,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        company: newUser.company,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        company: newUser.company,
      },
      token,
      authMethod: bcrypt ? "bcrypt" : "plaintext", // For debugging
    });

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
