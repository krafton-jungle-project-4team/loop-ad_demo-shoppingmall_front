import { createFixedClock, createKrwAmount, createSequentialIdGenerator } from "@/domain/contracts";

describe("deterministic domain helpers", () => {
  it("returns copies of the fixed clock date", () => {
    const clock = createFixedClock("2026-06-25T00:00:00.000Z");

    const first = clock.now();
    first.setUTCFullYear(2030);

    expect(clock.now().toISOString()).toBe("2026-06-25T00:00:00.000Z");
  });

  it("creates deterministic sequence IDs", () => {
    const ids = createSequentialIdGenerator(7);

    expect(ids.next("ORD")).toBe("ORD-000007");
    expect(ids.next("ORD")).toBe("ORD-000008");
  });

  it("rejects fractional KRW amounts", () => {
    expect(() => createKrwAmount(100.5)).toThrow(/non-negative integer/);
  });
});
