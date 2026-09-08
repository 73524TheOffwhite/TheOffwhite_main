export const RESERVE_PATH = "/events" as const;
export const RESERVE_HASH = "book" as const;
export const RESERVE_STEP_ONE_EVENT = "reserve:go-step-one";

/** Hash values that should open the reservation flow at step 1. */
export const RESERVE_STEP_ONE_HASHES = new Set([RESERVE_HASH, "reserve"]);

export function isReserveStepOneHash(hash: string) {
  return RESERVE_STEP_ONE_HASHES.has(hash.replace(/^#/, ""));
}
