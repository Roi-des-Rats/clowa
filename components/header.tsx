"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Search, Plus, Menu, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, FormEvent } from "react"
import { useSupabase } from "./supabase-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
import { bigelow } from "@/lib/fonts"
// Create a separate component for search functionality
function SearchBar({ className }: { className?: string }) {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Initialize search box with existing query param
  useEffect(() => {
    const currentQuery = searchParams.get('q')
    if (currentQuery) {
      setSearchQuery(currentQuery)
    }
  }, [searchParams])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const trimmedQuery = searchQuery.trim()
    
    if (trimmedQuery) {
      // Navigate to home with search query
      router.push(`/?q=${encodeURIComponent(trimmedQuery)}`)
    } else {
      // If search is cleared, go to home without params
      router.push('/')
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input 
        type="search" 
        placeholder="Search articles..." 
        className={`w-full pl-8`} 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </form>
  )
}

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { supabase, user, isCurator, isLoading: isUserLoading } = useSupabase()
  const [username, setUsername] = useState<string>("")
  const router = useRouter()
  const isMobile = useIsMobile()

  // Fetch username from profiles table when user is available
  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single()
          
        if (!error && data?.username) {
          setUsername(data.username)
        }
      }
    }
    
    fetchUsername()
  }, [user, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  // Get first character of username for avatar fallback
  const getUsername = () => {
    if (username) {
      // If username is longer than 10 characters, return the first 10 characters
      return username.length > 15 ? username.substring(0, 15) + "..." : username
    }
    return '...'
  }

  const closeMobileMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }

  const closeSearchMenu = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false)
    }
  }

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${!isMobile ? 'flex justify-center' : ''}`}>
      {/* Main header row */}
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="md:hidden" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center gap-2">
            {isMobile ? (
              <span className={`text-xl font-bold text-foreground underline decoration-primary decoration-2 underline-offset-1 ${bigelow.className} bigelow-rules-header`}>CLOWA</span>
            ) : (
              <span className={`text-xl font-bold text-foreground ${bigelow.className} bigelow-rules-header`}><span className="underline decoration-primary decoration-2 underline-offset-2">C</span>urated <span className="underline decoration-primary decoration-2 underline-offset-2">L</span>ist <span className="underline decoration-primary decoration-2 underline-offset-2">O</span>f <span className="underline decoration-primary decoration-2 underline-offset-2">W</span>eb <span className="underline decoration-primary decoration-2 underline-offset-2">A</span>rticles</span>
            )}
          </Link>
        </div>

        {/* Search bar - visible only on desktop */}
        {!isMobile ? (
          <div className="flex-1 px-4 max-w-md mx-auto">
            <SearchBar />
          </div>
        ) : (
          <div className="hidden"></div>
        )}
        
        {/* Desktop user menu - hide on mobile */}
        <div className="hidden md:flex md:items-center md:gap-2">
          {isCurator && (
            <Button asChild variant="ghost">
              <Link href="/add-article">
                <Plus className="h-5 w-5" />
                <span>Add Article</span>
              </Link>
            </Button>
          )}

          <Link href="/about" className="flex items-center space-x-4 text-sm mx-2" onClick={closeMobileMenu}>
            <span className="underline">About</span>
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative text-primary">
                  {getUsername()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-primary">{username || user.email}</p>
                    {isCurator && <p className="text-xs leading-none text-muted-foreground">Curator</p>}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
        
        {/* Mobile buttons */}
        <div className="md:hidden flex items-center gap-2">
          {/* Replace dropdown with button toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
          
          <Button asChild variant="default" size="sm" className={user ? "hidden" : ""}>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t py-4 px-6">
          <nav className="flex flex-col space-y-4">
            {user && (
              <div className="rounded-md mb-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-primary">{username || user.email}</p>
                  {isCurator && <p className="text-xs leading-none text-muted-foreground">Curator</p>}
                </div>
              </div>
            )}
            
            {isCurator && (
              <Link 
                href="/add-article" 
                className="flex items-center space-x-2 text-sm"
                onClick={closeMobileMenu}
              >
                <Plus className="h-4 w-4" />
                <span>Add Article</span>
              </Link>
            )}

            <Link href="/about" className="flex items-center space-x-2 text-sm" onClick={closeMobileMenu}>
              <span className="underline">About</span>
            </Link>
            
            {user && (
              <Button 
                variant="ghost" 
                className="justify-start p-0 h-auto text-sm font-normal hover:bg-transparent" 
                onClick={() => {
                  handleSignOut();
                  closeMobileMenu();
                }}
              >
                Log out
              </Button>
            )}
          </nav>
        </div>
      )}

      {/* Search Menu - similar to mobile menu */}
      {isSearchOpen && (
        <div className="md:hidden border-t py-4 px-6">
          <div className="mb-4">
            <SearchBar />
          </div>
          {/* Add some recent searches or popular tags here if needed */}
        </div>
      )}
    </header>
  )
}
