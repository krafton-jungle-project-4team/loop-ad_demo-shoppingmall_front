import { Grid3X3, Home, ReceiptText, ShoppingCart, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

import { SAMPLE_ORDER_PATH } from "@/config/demo-routes";
import { useDemoUserProfile } from "@/hooks/useDemoUserProfile";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/state/cart-context";

const mobileItems = [
  { to: "/", label: "홈", icon: Home },
  { to: "/products", label: "상품", icon: Grid3X3 },
  { to: "/cart", label: "장바구니", icon: ShoppingCart },
  { to: "/login", label: "로그인", icon: UserRound },
  { to: SAMPLE_ORDER_PATH, label: "주문", icon: ReceiptText },
];

export function MobileNavigation() {
  const { itemCount } = useCartStore();
  const selectedProfile = useDemoUserProfile();
  const cartBadgeLabel = itemCount > 99 ? "99+" : String(itemCount);

  return (
    <nav
      aria-label="모바일 주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-3 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {mobileItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive && "bg-accent text-accent-foreground",
              )
            }
          >
            <span className="relative">
              <Icon aria-hidden="true" className="size-5" />
              {to === "/cart" && itemCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-4 text-primary-foreground">
                  {cartBadgeLabel}
                </span>
              ) : null}
              {to === "/login" && selectedProfile ? (
                <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-primary ring-2 ring-background" />
              ) : null}
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
