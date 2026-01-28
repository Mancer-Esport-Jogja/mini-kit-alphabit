import { NextRequest, NextResponse } from "next/server";

// Backend API URL
const BACKEND_BIND_WALLET_URL = process.env.NEXT_PUBLIC_BACKEND_URL
  ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/bind-wallet`
  : "https://backend-alphabit.onrender.com/api/auth/bind-wallet";

export async function POST(request: NextRequest) {
  const authorization = request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  const token = authorization.split(" ")[1];
  
  try {
     const body = await request.json();

     const backendResponse = await fetch(BACKEND_BIND_WALLET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body)
      });
    
      const data = await backendResponse.json();
      return NextResponse.json(data, { status: backendResponse.status });

  } catch (error) {
    console.error("Backend bind-wallet error:", error);
      return NextResponse.json({ message: "Backend request failed" }, { status: 500 });
  }
}
