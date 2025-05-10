import React, { Suspense } from 'react'
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import { SupabaseProvider } from "@/components/supabase-provider"
import { bigelow, oldStandardTT } from "@/lib/fonts"

export const metadata: Metadata = {
  title: "CLOWA",
  description: "",
}

// Loading component for Suspense fallback
function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 h-16">
      <div className="container flex h-16 items-center justify-between">
        {/* Simple header loading state */}
        <div className="w-64 h-6 rounded bg-muted animate-pulse" />
        <div className="w-32 h-8 rounded bg-muted animate-pulse" />
      </div>
    </header>
  )
}

const SvgDefinitions = () => (
  <svg style={{ width: 0, height: 0, position: 'absolute' }} aria-hidden="true">
    <defs>
      <clipPath id="concaveButtonClipPath" clipPathUnits="objectBoundingBox">
        <path d="M0,0 Q0.5,0.10 1,0 Q0.93,0.5 1,1 Q0.5,0.90 0,1 Q0.07,0.5 0,0 Z" />
      </clipPath>
    </defs>
  </svg>
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${oldStandardTT.className} text-[1.2rem]`} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-title" content="CLOWA" />
      </head>
      <body className="min-h-screen bg-background">
        <SvgDefinitions />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <div className="flex min-h-screen flex-col">
              <Suspense fallback={<HeaderSkeleton />}>
                <Header />
              </Suspense>
              <main className="flex-1 container mx-auto py-4 px-4">{children}</main>
              <footer className="border-t py-4">
                <div className={`container mx-auto text-center text-sm text-muted-foreground ${bigelow.className} bigelow-rules-footer`}>
                  © {new Date().getFullYear()} CLOWA by Roi~des~Rats
                </div>
              </footer>
            </div>
            <Toaster />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'