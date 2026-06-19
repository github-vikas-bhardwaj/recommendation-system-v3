const DURATION_PATTERN = /^(\d+)(s|m|h|d)$/;

export function parseDurationToSeconds(duration: string): number {
  const match = DURATION_PATTERN.exec(duration.trim());

  if (!match) {
    throw new Error(`Invalid duration: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 3_600;
    case "d":
      return value * 86_400;
    default:
      throw new Error(`Invalid duration unit: ${unit}`);
  }
}

export function getAccessTokenMaxAgeSeconds(): number {
  return parseDurationToSeconds(process.env.JWT_ACCESS_EXPIRES_IN ?? "15m");
}

export function getRefreshTokenMaxAgeSeconds(): number {
  return parseDurationToSeconds(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d");
}
