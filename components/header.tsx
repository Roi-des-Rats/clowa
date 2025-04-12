"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Search, Plus, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, FormEvent } from "react"
import { useSupabase } from "./supabase-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { useIsMobile } from "@/hooks/use-mobile"
// Create a separate component for search functionality
function SearchBar() {
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
        className="w-full pl-8" 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </form>
  )
}

export default function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { supabase, user, isAdmin, isLoading: isUserLoading } = useSupabase()
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
      return username
    }
    return ''
  }

  const closeMobileMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }

  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${!isMobile ? 'flex justify-center' : ''}`}>
      {/* Main header row */}
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="md:hidden" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center gap-2">
            {isMobile ? (
              <span className="text-xl font-bold">CLOWA</span>
            ) : (
              <span className="text-xl font-bold">Curated List Of Web Articles</span>
            )}
          </Link>
        </div>

        {/* Search bar - now visible on both mobile and desktop */}
        <div className="flex-1 px-4 max-w-md mx-auto">
          <SearchBar />
        </div>
        
        {/* Desktop user menu - hide on mobile */}
        <div className="hidden md:flex md:items-center md:gap-2">
          {isAdmin && (
            <Button asChild variant="ghost">
              <Link href="/add-article">
                <Plus className="h-5 w-5" />
                <span>Add Article</span>
              </Link>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8">
                  {getUsername()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{username || user.email}</p>
                    {isAdmin && <p className="text-xs leading-none text-muted-foreground">Admin</p>}
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
        
        {/* Mobile button only (no dropdown, just the button) */}
        <div className="md:hidden flex items-center">
          <Button asChild variant="default" size="sm" className={user ? "hidden" : ""}>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Menu - no longer contains search */}
      {isMenuOpen && (
        <div className="md:hidden border-t py-4 px-6">
          <nav className="flex flex-col space-y-4">
            {user && (
              <div className="p-4 border rounded-md mb-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{username || user.email}</p>
                  {isAdmin && <p className="text-xs leading-none text-muted-foreground">Admin</p>}
                </div>
              </div>
            )}
            
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-sm"
              onClick={closeMobileMenu}
            >
              <span>Home</span>
            </Link>
            
            {isAdmin && (
              <Link 
                href="/add-article" 
                className="flex items-center space-x-2 text-sm"
                onClick={closeMobileMenu}
              >
                <Plus className="h-4 w-4" />
                <span>Add Article</span>
              </Link>
            )}
            
            {user && (
              <Button 
                variant="ghost" 
                className="justify-start p-0 h-auto text-sm font-normal" 
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
    </header>
  )
}
