"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // We only want to log customer page hits, not admin panel clicks
    if (pathname.startsWith("/sapanyak")) {
      return;
    }

    const logVisit = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
        await fetch(`${apiUrl}/analytics/log-visit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: pathname }),
        });
      } catch (err) {
        console.error("Failed to log analytics visit:", err);
      }
    };

    logVisit();
  }, [pathname]);

  return null;
}
