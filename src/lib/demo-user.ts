export type DemoUserType =
  | "seoul-female-20s"
  | "busan-male-30s"
  | "gyeonggi-female-40s"
  | "daegu-male-50s";

export type DemoUserProfile = {
  type: DemoUserType;
  label: string;
  description: string;
  userId: string;
  privacySubjectId: string;
  ageGroup: string;
  gender: string;
  region: string;
  segment: string;
  preferredCategory: string;
};

export const DEMO_USER_PROFILE_CHANGE_EVENT = "loop-ad-demo-user-profile-change";

const DEMO_USER_PROFILE_STORAGE_KEY = "loop-ad-demo-user-profile.v1";

export const demoUserProfiles: DemoUserProfile[] = [
  {
    type: "seoul-female-20s",
    label: "서울 20대 여성",
    description: "도심 호텔과 당일 특가에 반응하는 신규 여행자",
    userId: "demo-user-seoul-female-20s",
    privacySubjectId:
      "sub_423fda0c41fee11cbc38d7b8cce21aa0d3a04169f52f744af71ace5ccb59325b",
    ageGroup: "20s",
    gender: "female",
    region: "서울",
    segment: "new_customer",
    preferredCategory: "city_hotel",
  },
  {
    type: "busan-male-30s",
    label: "부산 30대 남성",
    description: "출장 숙소와 빠른 예약 흐름을 선호하는 여행자",
    userId: "demo-user-busan-male-30s",
    privacySubjectId:
      "sub_93b7d6695749b1a7d8bf0ec9a6aed87e695cdd57c6b007a3100e26e3851de6c1",
    ageGroup: "30s",
    gender: "male",
    region: "부산",
    segment: "high_intent",
    preferredCategory: "business_hotel",
  },
  {
    type: "gyeonggi-female-40s",
    label: "경기 40대 여성",
    description: "가족 여행과 무료 취소 옵션에 관심이 높은 재방문 여행자",
    userId: "demo-user-gyeonggi-female-40s",
    privacySubjectId:
      "sub_15c15deb0e66b26c5c2ae49ab4fe5d0f8dfab4a11ba74adfc1bf77242f3a708a",
    ageGroup: "40s",
    gender: "female",
    region: "경기",
    segment: "returning_customer",
    preferredCategory: "family_resort",
  },
  {
    type: "daegu-male-50s",
    label: "대구 50대 남성",
    description: "가격 비교 후 예약하는 실속형 여행자",
    userId: "demo-user-daegu-male-50s",
    privacySubjectId:
      "sub_a286579d9bf43b07f9109132e8763dae101920546d0c4c6cf1dffc677dca081d",
    ageGroup: "50s",
    gender: "male",
    region: "대구",
    segment: "value_seeker",
    preferredCategory: "value_stay",
  },
];

export function getDemoUserProfileByType(
  type: string | null | undefined,
): DemoUserProfile | null {
  return demoUserProfiles.find((profile) => profile.type === type) ?? null;
}

export function getSelectedDemoUserProfile(): DemoUserProfile | null {
  const storage = getStorage();

  if (!storage) {
    return null;
  }

  try {
    return getDemoUserProfileByType(
      storage.getItem(DEMO_USER_PROFILE_STORAGE_KEY),
    );
  } catch {
    return null;
  }
}

export function selectDemoUserProfile(type: DemoUserType): DemoUserProfile {
  const profile = getDemoUserProfileByType(type);

  if (!profile) {
    throw new Error(`Unknown demo user type: ${type}`);
  }

  const storage = getStorage();

  if (storage) {
    try {
      storage.setItem(DEMO_USER_PROFILE_STORAGE_KEY, profile.type);
    } catch {
      // Demo login should still update the current page when storage is unavailable.
    }
  }

  dispatchDemoUserProfileChange();
  return profile;
}

export function clearSelectedDemoUserProfile(): void {
  const storage = getStorage();

  if (storage) {
    try {
      storage.removeItem(DEMO_USER_PROFILE_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  }

  dispatchDemoUserProfileChange();
}

function dispatchDemoUserProfileChange(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(DEMO_USER_PROFILE_CHANGE_EVENT));
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}
