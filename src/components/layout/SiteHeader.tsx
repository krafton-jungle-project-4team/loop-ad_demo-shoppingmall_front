import { CalendarCheck2, Search, UserRound } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { destinations } from "@/data/destinations";
import { useDemoUserProfile } from "@/hooks/useDemoUserProfile";
import { cn } from "@/lib/utils";
import { createSearchParams, DEFAULT_SEARCH_STATE } from "@/utils/searchParams";

const primaryNavigation = [
  { to: "/", label: "홈", end: true },
  { to: "/search", label: "숙소 검색" },
  { to: "/search?deal=summer", label: "프로모션" },
  { to: "/trips", label: "내 예약" },
];

const categoryNavigation = [
  { to: "/search?destination=seoul", label: "서울" },
  { to: "/search?destination=busan", label: "부산" },
  { to: "/search?destination=jeju", label: "제주" },
  { to: "/search?destination=gangneung", label: "강릉" },
  { to: "/search?destination=yeosu", label: "여수" },
];

export function SiteHeader() {
  const navigate = useNavigate();
  const selectedProfile = useDemoUserProfile();
  const [keyword, setKeyword] = useState("");

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedKeyword = keyword.trim();
    const matchedDestination = trimmedKeyword
      ? destinations.find((destination) =>
          destination.name.toLowerCase().includes(trimmedKeyword.toLowerCase()),
        )
      : undefined;
    const nextSearchState = {
      ...DEFAULT_SEARCH_STATE,
      destination: matchedDestination?.id ?? "",
    };

    navigate(`/search?${createSearchParams(nextSearchState)}`);
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-h-14 items-center gap-3">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 rounded-md text-lg font-bold tracking-normal text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="StayLoop 홈"
          >
            <span className="grid size-9 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              SL
            </span>
            <span className="hidden sm:inline">StayLoop</span>
          </Link>

          <form className="min-w-0 flex-1" role="search" onSubmit={handleSearchSubmit}>
            <label className="sr-only" htmlFor="site-search">
              숙소 검색
            </label>
            <div className="flex h-11 items-center rounded-md border border-input bg-card px-3 shadow-sm focus-within:ring-2 focus-within:ring-ring">
              <Search aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
              <input
                id="site-search"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="지역 또는 숙소 검색"
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                검색
              </button>
            </div>
          </form>

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              to="/trips"
              className="relative inline-flex size-11 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="내 예약"
            >
              <CalendarCheck2 aria-hidden="true" className="size-5" />
            </Link>
            <Link
              to="/login"
              className="relative inline-flex size-11 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={
                selectedProfile ? `로그인 ${selectedProfile.label}` : "로그인"
              }
            >
              <UserRound aria-hidden="true" className="size-5" />
              {selectedProfile ? (
                <span className="absolute -right-1 -top-1 size-3 rounded-full bg-primary ring-2 ring-background" />
              ) : null}
            </Link>
          </div>
        </div>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-2 lg:flex">
          {primaryNavigation.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors",
                  "hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isActive && "bg-accent text-accent-foreground",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <nav
          aria-label="카테고리"
          className="scrollbar-none flex gap-2 overflow-x-auto pb-1 lg:pb-0"
        >
          {categoryNavigation.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
