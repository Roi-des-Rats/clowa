import Link from "next/link"
import { Button } from "@/components/ui/button"
import { bigelow } from "@/lib/fonts"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-5xl font-bold mb-6">
        <span className={`${bigelow.className} bigelow-rules-header tracking-wider text-3xl`}>404 - Not Found</span>
      </h1>
      
      <p className="text-muted-foreground mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. The article might have been removed or the link might be incorrect.
      </p>
      
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button variant="default" asChild>
          <Link href="/" className="flex items-center gap-2">
            <span>Home Page</span>
          </Link>
        </Button>
      </div>
    </div>
  )
} 