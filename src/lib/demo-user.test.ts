import { describe, expect, it } from "vitest";

import {
  demoUserProfiles,
  getDemoUserProfileByType,
} from "@/lib/demo-user";

describe("demo user profiles", () => {
  it("provides typed profiles for demo login selection", () => {
    expect(demoUserProfiles).toHaveLength(4);
    expect(getDemoUserProfileByType("seoul-female-20s")).toMatchObject({
      userId: "demo-user-seoul-female-20s",
      ageGroup: "20s",
      gender: "female",
      region: "서울",
      segment: "new_customer",
    });
  });

  it("returns null for unknown profile types", () => {
    expect(getDemoUserProfileByType("unknown")).toBeNull();
    expect(getDemoUserProfileByType(null)).toBeNull();
  });
});
