import { Errors, createClient } from "@farcaster/quick-auth";
import { NextRequest, NextResponse } from "next/server";

const client = createClient();

// Backend API URL
const BACKEND_AUTH_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth`
  : "https://backend-alphabit.onrender.com/api/auth";

export async function GET(request: NextRequest) {
  // Because we're fetching this endpoint via `sdk.quickAuth.fetch`,
  // if we're in a mini app, the request will include the necessary `Authorization` header.
  const authorization = request.headers.get("Authorization");

  // Here we ensure that we have a valid token.
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  const token = authorization.split(" ")[1];

  // Dev mode: Forward dev-token directly to backend
  if (token === "dev-token") {
    try {
      const backendResponse = await fetch(BACKEND_AUTH_URL, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await backendResponse.json();
      return NextResponse.json(data, { status: backendResponse.status });
    } catch (error) {
      console.error("Backend auth error:", error);
      return NextResponse.json({ message: "Backend auth failed" }, { status: 500 });
    }
  }

  try {
    // Verify Farcaster JWT
    const payload = await client.verifyJwt({
      token,
      domain: getUrlHost(request),
    });

    // Forward verified token to backend to get full user profile
    const backendResponse = await fetch(BACKEND_AUTH_URL, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!backendResponse.ok) {
      // If backend fails, return basic user info from JWT
      return NextResponse.json({
        success: true,
        data: {
          user: {
            fid: payload.sub,
            username: null,
            displayName: null,
            pfpUrl: null,
            primaryEthAddress: null,
          },
          isNewUser: false,
        },
      });
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    if (e instanceof Error) {
      return NextResponse.json({ message: e.message }, { status: 500 });
    }

    throw e;
  }
}

function getUrlHost(request: NextRequest) {
  // First try to get the origin from the Origin header
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host;
    } catch (error) {
      console.warn("Invalid origin header:", origin, error);
    }
  }

  // Fallback to Host header
  const host = request.headers.get("host");
  if (host) {
    return host;
  }

  // Final fallback to environment variables
  let urlValue: string;
  if (process.env.VERCEL_ENV === "production") {
    urlValue = process.env.NEXT_PUBLIC_URL!;
  } else if (process.env.VERCEL_URL) {
    urlValue = `https://${process.env.VERCEL_URL}`;
  } else {
    urlValue = "http://localhost:3000";
  }

  const url = new URL(urlValue);
  return url.host;
}
