import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[28rem] max-w-xl flex-col items-center justify-center gap-5 text-center">
      <p className="text-sm font-semibold text-muted-foreground">404</p>
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-normal text-foreground">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          주소가 바뀌었거나 아직 준비되지 않은 화면입니다.
        </p>
      </div>
      <Link
        className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        to="/"
      >
        홈으로 이동
      </Link>
    </section>
  );
}
