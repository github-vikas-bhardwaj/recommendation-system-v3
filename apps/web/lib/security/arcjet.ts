import arcjet, { type ArcjetDecision, fixedWindow, request, slidingWindow } from "@arcjet/next";

function arcjetMode(): "LIVE" | "DRY_RUN" {
  return process.env.ARCJET_ENV === "LIVE" ? "LIVE" : "DRY_RUN";
}

function getArcjetKey(): string {
  const key = process.env.ARCJET_KEY;
  if (!key) {
    throw new Error("ARCJET_KEY is not set");
  }
  return key;
}

const aj = arcjet({
  key: getArcjetKey(),
  characteristics: ["ip.src"],
  rules: [],
});

export function rateLimitMessage(decision: ArcjetDecision): string {
  if (decision.reason.isRateLimit()) {
    return "Too many requests. Please try again later.";
  }
  return "Request blocked.";
}
/** Server Actions (signin, signup) */
export async function protectAuthAction(): Promise<ArcjetDecision> {
  const req = await request();
  return aj
    .withRule(
      slidingWindow({
        mode: arcjetMode(),
        interval: "1m",
        max: 5,
      })
    )
    .protect(req);
}
/** GET /api/auth/refresh */
export async function protectRefreshRoute(req: Request): Promise<ArcjetDecision> {
  return aj
    .withRule(
      fixedWindow({
        mode: arcjetMode(),
        window: "1m",
        max: 20,
      })
    )
    .protect(req);
}
