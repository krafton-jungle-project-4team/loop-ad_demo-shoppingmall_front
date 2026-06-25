import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <section className="flex min-h-[55dvh] flex-col justify-center gap-6">
      <div className="flex max-w-3xl flex-col gap-4">
        <Badge variant="outline" className="w-fit">
          404
        </Badge>
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            Page not found
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            This route is not registered in the commerce demo shell.
          </p>
        </div>
        <Button asChild className="w-fit">
          <Link to="/">Return home</Link>
        </Button>
      </div>
    </section>
  );
}
