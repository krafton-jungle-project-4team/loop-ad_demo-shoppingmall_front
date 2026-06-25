import { AlertTriangle } from "lucide-react";
import { Link, useRouteError } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { normalizeRouteError } from "./error-utils";

export function AppErrorBoundary() {
  const error = normalizeRouteError(useRouteError());

  return (
    <main className="min-h-dvh bg-background px-4 py-10 text-foreground sm:px-6">
      <section className="mx-auto flex min-h-[70dvh] max-w-3xl flex-col justify-center gap-6">
        <Badge variant="destructive" className="w-fit">
          {error.status}
        </Badge>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle aria-hidden="true" className="size-7 text-destructive" />
            <h1 className="text-3xl font-semibold tracking-normal">{error.title}</h1>
          </div>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">{error.message}</p>
        </div>

        <Button asChild className="w-fit">
          <Link to="/">Return home</Link>
        </Button>
      </section>
    </main>
  );
}
