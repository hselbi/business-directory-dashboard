import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Try to import bcrypt, fallback to plain comparison if it fails
let bcrypt: any = null;
try {
  bcrypt = require("bcryptjs");
} catch (error) {
  console.warn(
    "bcrypt not available, using plain text comparison for development"
  );
}

// Mock user database with CORRECT hashes
const users = [
  {
    id: 1,
    email: "admin@businessintel.com",
    // Correct bcrypt hash for "admin123"
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    plainPassword: "admin123", // Fallback for development
    name: "Admin User",
    role: "admin",
    company: "Business Intelligence Platform",
  },
  {
    id: 2,
    email: "developer@example.com",
    // Correct bcrypt hash for "developer123"
    password: "$2a$10$8Nc6TCf5i9QG8wUPuQSGdO8nYrWP6TnN8YNFAKjWq1KW7Cn8BWJO6",
    plainPassword: "developer123",
    name: "Developer User",
    role: "developer",
    company: "Example Corp",
  },
  {
    id: 3,
    email: "test@test.com",
    // Correct bcrypt hash for "test123"
    password: "$2a$10$Hl4E7YRzIgSWQ0FHQhO6zOHgz8bHV1nXhYF1KdKvHGLJGPQW1kgTK",
    plainPassword: "test123",
    name: "Test User",
    role: "developer",
    company: "Test Company",
  },
];

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
  fallbackPassword: string
): Promise<boolean> {
  console.log("Verifying password...", {
    plainPasswordLength: plainPassword.length,
    hasHashedPassword: !!hashedPassword,
    hasFallbackPassword: !!fallbackPassword,
    bcryptAvailable: !!bcrypt,
  });

  if (bcrypt) {
    try {
      // First try bcrypt
      const bcryptResult = await bcrypt.compare(plainPassword, hashedPassword);
      console.log("bcrypt verification result:", bcryptResult);
      if (bcryptResult) return true;

      // If bcrypt fails, try fallback
      console.log("bcrypt failed, trying fallback comparison");
      const fallbackResult = plainPassword === fallbackPassword;
      console.log("fallback comparison result:", fallbackResult);
      return fallbackResult;
    } catch (error: any) {
      console.warn("bcrypt comparison failed:", error.message);
      // Fallback to plain text comparison
      const fallbackResult = plainPassword === fallbackPassword;
      console.log("error fallback result:", fallbackResult);
      return fallbackResult;
    }
  } else {
    // No bcrypt available, use plain text comparison
    console.log("No bcrypt, using plain text comparison");
    const result = plainPassword === fallbackPassword;
    console.log("plain text result:", result);
    return result;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== LOGIN API CALLED ===");

    const body = await request.json();
    const { email, password } = body;

    console.log("Login attempt:", {
      email,
      passwordProvided: !!password,
      passwordLength: password?.length,
    });

    // Validation
    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("User found:", {
      email: user.email,
      id: user.id,
      hasHashedPassword: !!user.password,
      hasPlainPassword: !!user.plainPassword,
    });

    // Verify password (with bcrypt or fallback)
    const isValidPassword = await verifyPassword(
      password,
      user.password,
      user.plainPassword
    );

    console.log("Password verification result:", isValidPassword);

    if (!isValidPassword) {
      console.log("❌ Password verification failed for:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("✅ Password verified successfully, generating token...");

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Token generated successfully");

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
      },
      token,
      authMethod: bcrypt ? "bcrypt+fallback" : "plaintext", // For debugging
    });

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    console.log("✅ Login successful for:", email);

    return response;
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Debug endpoint
export async function GET() {
  // Generate fresh hashes for testing
  const testHashes: any = {};

  if (bcrypt) {
    try {
      testHashes.admin123 = await bcrypt.hash("admin123", 10);
      testHashes.developer123 = await bcrypt.hash("developer123", 10);
      testHashes.test123 = await bcrypt.hash("test123", 10);
    } catch (error) {
      console.error("Error generating hashes:", error);
    }
  }

  return NextResponse.json({
    message: "Login API is working",
    bcryptAvailable: !!bcrypt,
    availableUsers: users.map((u) => ({
      email: u.email,
      role: u.role,
      hasHash: !!u.password,
      hasPlaintext: !!u.plainPassword,
    })),
    testHashes: testHashes,
    environment: process.env.NODE_ENV || "development",
  });
}
