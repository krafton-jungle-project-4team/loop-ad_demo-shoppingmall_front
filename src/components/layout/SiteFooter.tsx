import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/35">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <Link to="/" className="font-semibold text-foreground">
            Loop Shop
          </Link>
          <p className="mt-2 max-w-xl">
            고객사 시연을 위한 프론트엔드 단독 쇼핑몰 데모입니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link className="transition-colors hover:text-foreground" to="/products">
            상품
          </Link>
          <Link className="transition-colors hover:text-foreground" to="/promotion/summer-sale">
            기획전
          </Link>
          <Link className="transition-colors hover:text-foreground" to="/cart">
            장바구니
          </Link>
        </div>
      </div>
    </footer>
  );
}
