import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(request: NextRequest) {
  try {
    // Kiểm tra NextAuth session
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { fullName, company, department, phone } = data;

    // Gọi backend API để cập nhật profile
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const response = await fetch(`${apiUrl}/auth/profile-update-google`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: session.user.email,
        fullName,
        company,
        department,
        phone,
      }),
    });

    if (!response.ok) {
      console.error(
        `Backend API error: ${response.status} ${response.statusText}`
      );
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Profile update failed",
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("Profile update successful:", result);

    // Return the updated user data for immediate UI update
    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data, // Include the updated user data
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Profile update API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
