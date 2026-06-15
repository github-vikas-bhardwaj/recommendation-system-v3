export function incrementCounter(current: number, step = 1): number {
  if (!Number.isFinite(current)) {
    throw new Error("current must be a finite number");
  }
  if (!Number.isFinite(step)) {
    throw new Error("step must be a finite number");
  }
  return current + step;
}
