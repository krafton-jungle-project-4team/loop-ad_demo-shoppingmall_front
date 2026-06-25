import { isRouteErrorResponse } from "react-router";

export interface NormalizedRouteError {
  status: string;
  title: string;
  message: string;
}

export function normalizeRouteError(error: unknown): NormalizedRouteError {
  if (isRouteErrorResponse(error)) {
    return {
      status: String(error.status),
      title: error.statusText || "Route error",
      message:
        typeof error.data === "string"
          ? error.data
          : "The route could not be rendered from the current client state.",
    };
  }

  if (error instanceof Error) {
    return {
      status: "Error",
      title: error.name || "Application error",
      message: error.message,
    };
  }

  return {
    status: "Error",
    title: "Application error",
    message: "An unknown client-side error occurred.",
  };
}
