import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper function to get auth token from request
function getAuthToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  return authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;
}

// Helper function to forward request to backend
async function forwardToBackend(
  request: NextRequest,
  endpoint: string,
  method: string = "GET"
) {
  const token = getAuthToken(request);
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  const backendUrl = `${API_BASE_URL}${endpoint}${
    searchParams ? `?${searchParams}` : ""
  }`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  // Add body for non-GET requests
  if (method !== "GET" && method !== "HEAD") {
    try {
      const body = await request.text();
      if (body) {
        config.body = body;
      }
    } catch (error) {
      console.error("Error reading request body:", error);
    }
  }

  try {
    const response = await fetch(backendUrl, config);
    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error forwarding to backend:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to connect to backend service",
      },
      { status: 500 }
    );
  }
}

// GET /api/settings/export - Export all settings
export async function GET(request: NextRequest) {
  return forwardToBackend(request, "/settings/export", "GET");
}
