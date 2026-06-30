import { useEffect, useState } from "react";

export function useMinWidth(minWidth: number): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia(`(min-width: ${minWidth}px)`).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);
    const handleChange = () => setMatches(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [minWidth]);

  return matches;
}
