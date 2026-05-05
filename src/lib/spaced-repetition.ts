import type { FlashcardProgress } from "@/lib/progress/types";

const BUCKET_DELAYS_MS = [
  0,
  4 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
] as const;

const MIN_BUCKET = 1;
const MAX_BUCKET = BUCKET_DELAYS_MS.length;

function delayForBucket(bucket: number) {
  const idx = Math.min(Math.max(bucket, MIN_BUCKET), MAX_BUCKET) - 1;
  return BUCKET_DELAYS_MS[idx] ?? 0;
}

export function getOrCreateCardProgress(
  existing?: FlashcardProgress,
): FlashcardProgress {
  return (
    existing ?? {
      bucket: MIN_BUCKET,
      nextDue: 0,
    }
  );
}

export function applyGotIt(
  now: number,
  existing?: FlashcardProgress,
): FlashcardProgress {
  const current = getOrCreateCardProgress(existing);
  const nextBucket = Math.min(current.bucket + 1, MAX_BUCKET);
  return {
    bucket: nextBucket,
    nextDue: now + delayForBucket(nextBucket),
  };
}

export function applyNeedReview(
  now: number,
  existing?: FlashcardProgress,
): FlashcardProgress {
  void getOrCreateCardProgress(existing);
  return {
    bucket: MIN_BUCKET,
    nextDue: now,
  };
}

export function isDue(now: number, card: FlashcardProgress) {
  return card.nextDue <= now;
}
