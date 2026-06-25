import { Link, useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getRouteMetadata, type AppRouteId } from "./route-metadata";

interface RoutePlaceholderProps {
  routeId: AppRouteId;
}

function formatParams(params: Record<string, string | undefined>) {
  return Object.entries(params)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
}

export function RoutePlaceholder({ routeId }: RoutePlaceholderProps) {
  const route = getRouteMetadata(routeId);
  const params = useParams();
  const paramSummary = formatParams(params);

  return (
    <section className="flex min-h-[55dvh] flex-col justify-center gap-6">
      <div className="flex max-w-3xl flex-col gap-4">
        <Badge variant="outline" className="w-fit">
          {route.phase}
        </Badge>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
            {route.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">{route.summary}</p>
        </div>

        <dl className="grid max-w-2xl gap-3 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/30 p-3">
            <dt className="font-medium text-foreground">Route</dt>
            <dd className="mt-1 font-mono text-xs">{route.path}</dd>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3">
            <dt className="font-medium text-foreground">Owner</dt>
            <dd className="mt-1">{route.owner}</dd>
          </div>
          {paramSummary ? (
            <div className="rounded-lg border bg-muted/30 p-3 sm:col-span-2">
              <dt className="font-medium text-foreground">Current params</dt>
              <dd className="mt-1">{paramSummary}</dd>
            </div>
          ) : null}
        </dl>

        {routeId !== "home" ? (
          <Button asChild variant="outline" className="w-fit">
            <Link to="/">Return home</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
