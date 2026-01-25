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
    // CRITICAL: We must verify against the domain specified in our manifest signature
    // which is "mini-kit-alphabit.vercel.app". Dynamic host detection often fails
    // in containerized environments or internal routing.
    const domain = process.env.NEXT_PUBLIC_URL ? new URL(process.env.NEXT_PUBLIC_URL).host : "mini-kit-alphabit.vercel.app";
    const payload = await client.verifyJwt({
      token,
      domain,
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


