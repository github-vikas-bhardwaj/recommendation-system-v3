import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userInput = body?.input;

    if (typeof userInput !== "string" || userInput.trim() === "") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const apiUrl = process.env.AI_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { error: "Recommendation service is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(`${apiUrl}/recommend/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: { input: userInput.trim() } }),
      signal: AbortSignal.timeout(180_000),
    });

    if (!response.ok) {
      const errorText = await response.text();

      return NextResponse.json(
        {
          error: "Recommendation service failed",
          details: errorText,
        },
        { status: 502 }
      );
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid response from recommendation service" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[/api/recommend]", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json({ error: "Recommendation request timed out" }, { status: 504 });
    }

    return NextResponse.json({ error: "Recommendation service unavailable" }, { status: 503 });
  }
}
