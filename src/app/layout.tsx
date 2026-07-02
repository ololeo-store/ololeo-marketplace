import type { Metadata } from "next";
import "./globals.css";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { ThemeProvider } from "@/lib/theme";
import { ThemeTransitionProvider } from "@/components/ThemeTransition";

export const metadata: Metadata = {
  title: "Ololeo Bucket",
  description: "Beautiful handcrafted flower buckets for every moment.",
};

const NO_FLASH_SCRIPT = `(function(){try{var t=localStorage.getItem('ololeo-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_SCRIPT }} />
      </head>
      <body className="font-sans antialiased flex flex-col min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <ThemeTransitionProvider>
            <AnalyticsTracker />
            {children}
          </ThemeTransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
