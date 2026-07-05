import { CheckCircle2, MapPin, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import { useDemoUserProfile } from "@/hooks/useDemoUserProfile";
import {
  demoUserProfiles,
  selectDemoUserProfile,
  type DemoUserProfile,
} from "@/lib/demo-user";
import { setLoopAdDemoUserIdentity } from "@/lib/loop-ad-sdk";
import { cn } from "@/lib/utils";

export function LoginPage() {
  const selectedProfile = useDemoUserProfile();

  function handleSelectProfile(profile: DemoUserProfile) {
    selectDemoUserProfile(profile.type);
    setLoopAdDemoUserIdentity();
  }

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-5">
      <div className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="text-sm font-semibold text-muted-foreground">Login</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground">
          사용자 타입 선택
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          선택한 여행자 identity와 세그먼트 정보가 이후 Event SDK 이벤트와 광고 요청 context에 반영됩니다.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {demoUserProfiles.map((profile) => {
          const isSelected = selectedProfile?.type === profile.type;

          return (
            <button
              key={profile.type}
              type="button"
              onClick={() => handleSelectProfile(profile)}
              className={cn(
                "flex min-h-48 flex-col justify-between rounded-md border bg-card p-5 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/35 hover:bg-accent/40",
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="grid size-11 place-items-center rounded-md bg-muted text-muted-foreground">
                  <UserRound aria-hidden="true" className="size-5" />
                </span>
                {isSelected ? (
                  <CheckCircle2 aria-hidden="true" className="size-5 text-primary" />
                ) : null}
              </span>

              <span className="mt-5 flex flex-col gap-3">
                <span>
                  <span className="block text-lg font-bold text-foreground">
                    {profile.label}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                    {profile.description}
                  </span>
                </span>

                <span className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    <MapPin aria-hidden="true" className="size-3.5" />
                    {profile.region}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {profile.ageGroup}
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {profile.gender}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selectedProfile ? (
        <div className="flex flex-col justify-between gap-3 rounded-md border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-foreground">
              현재 선택: {selectedProfile.label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              userId {selectedProfile.userId}
            </p>
          </div>
          <Link
            to="/search"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            숙소 둘러보기
          </Link>
        </div>
      ) : null}
    </section>
  );
}
