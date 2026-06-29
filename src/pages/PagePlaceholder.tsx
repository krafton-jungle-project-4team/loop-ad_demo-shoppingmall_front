import { type ReactNode } from "react";

type PagePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PagePlaceholder({
  eyebrow,
  title,
  description,
  actions,
}: PagePlaceholderProps) {
  return (
    <section className="rounded-md border border-border bg-card p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-muted-foreground">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-normal text-foreground sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        <div className="h-28 rounded-md bg-muted" />
        <div className="h-28 rounded-md bg-muted" />
        <div className="h-28 rounded-md bg-muted sm:col-span-2 lg:col-span-1" />
      </div>
    </section>
  );
}
