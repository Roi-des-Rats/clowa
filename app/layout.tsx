import React, { Suspense } from 'react'
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import { SupabaseProvider } from "@/components/supabase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Clowa - Curated List Of Web Articles",
  description: "A curated collection of the best web articles worth reading",
    generator: 'v0.dev'
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <div className="flex min-h-screen flex-col">
              <Suspense fallback={<HeaderSkeleton />}>
                <Header />
              </Suspense>
              <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
              <footer className="border-t py-4">
                <div className="container mx-auto text-center text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Clowa - Curated List Of Web Articles
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