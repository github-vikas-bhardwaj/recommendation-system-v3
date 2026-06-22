/** Postgres error code for unique constraint violations */
export const UNIQUE_VIOLATION_CODE = "23505";

export function isUniqueViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const code = "code" in error && typeof error.code === "string" ? error.code : undefined;
  const causeCode =
    "cause" in error &&
    typeof error.cause === "object" &&
    error.cause !== null &&
    "code" in error.cause &&
    typeof error.cause.code === "string"
      ? error.cause.code
      : undefined;

  return code === UNIQUE_VIOLATION_CODE || causeCode === UNIQUE_VIOLATION_CODE;
}
