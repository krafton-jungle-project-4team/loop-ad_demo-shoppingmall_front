import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/35">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <Link to="/" className="font-semibold text-foreground">
            StayLoop
          </Link>
          <p className="mt-2 max-w-xl">
            Loop Ad 광고 슬롯과 예약 전환 이벤트를 확인할 수 있는 숙소 예약 데모입니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link className="transition-colors hover:text-foreground" to="/search">
            숙소 검색
          </Link>
          <Link className="transition-colors hover:text-foreground" to="/search?deal=summer">
            프로모션
          </Link>
          <Link className="transition-colors hover:text-foreground" to="/trips">
            내 예약
          </Link>
        </div>
      </div>
    </footer>
  );
}
