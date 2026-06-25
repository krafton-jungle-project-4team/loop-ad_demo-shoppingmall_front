export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(prefix: string): string;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

export function createFixedClock(isoTimestamp: string): Clock {
  const fixedDate = new Date(isoTimestamp);

  if (Number.isNaN(fixedDate.getTime())) {
    throw new Error(`Invalid ISO timestamp for fixed clock: ${isoTimestamp}`);
  }

  return {
    now: () => new Date(fixedDate),
  };
}

export function createSequentialIdGenerator(startAt = 1): IdGenerator {
  let nextValue = startAt;

  return {
    next(prefix: string) {
      const id = `${prefix}-${String(nextValue).padStart(6, "0")}`;
      nextValue += 1;
      return id;
    },
  };
}
