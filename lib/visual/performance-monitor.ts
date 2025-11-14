/**
 * Lightweight logger for tracking slow-loading images.
 * Adheres to the Performance Monitoring guidance in docs/VISUAL_CONTENT_SYSTEM.md.
 */
export function logImagePerformance(imageName: string, loadTimeMs: number) {
  if (loadTimeMs > 2000) {
    console.warn(`Slow image load: ${imageName} took ${Math.round(loadTimeMs)}ms`)
  }

  if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
    ;(window as any).gtag("event", "image_load", {
      image_name: imageName,
      load_time: Math.round(loadTimeMs),
      page_path: window.location.pathname,
    })
  }
}
