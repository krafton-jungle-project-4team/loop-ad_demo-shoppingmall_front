import type { ComponentProps } from "react";
import { ThemeProvider } from "next-themes";
import { RouterProvider } from "react-router/dom";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { appRouter } from "./router";

type AppRouter = ComponentProps<typeof RouterProvider>["router"];

interface AppProps {
  router?: AppRouter;
}

export function App({ router = appRouter }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}
