import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, message: "No session found" },
        { status: 401 }
      );
    }

    // Call backend to get fresh user data
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${apiUrl}/auth/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: session.user.email }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch user data" },
        { status: response.status }
      );
    }

    const userData = await response.json();

    if (userData.success && userData.data) {
      return NextResponse.json({
        success: true,
        data: userData.data,
      });
    } else {
      return NextResponse.json(
        { success: false, message: "User data not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Refresh user data error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
