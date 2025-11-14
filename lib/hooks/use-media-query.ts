"use client"

import { useEffect, useState } from "react"

/**
 * Subscribe to a CSS media query and return whether it currently matches.
 * Safely handles SSR by defaulting to false until mounted in the browser.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return
    }

    const mediaQueryList = window.matchMedia(query)
    const updateMatch = (event: MediaQueryListEvent | MediaQueryList) => {
      setMatches(event.matches)
    }

    updateMatch(mediaQueryList)

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", updateMatch)
      return () => mediaQueryList.removeEventListener("change", updateMatch)
    }

    mediaQueryList.addListener(updateMatch)
    return () => mediaQueryList.removeListener(updateMatch)
  }, [query])

  return matches
}
