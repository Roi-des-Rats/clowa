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

export default function Header() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAdmin, supabase } = useSupabase()
  const [username, setUsername] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  // Initialize search box with existing query param
  useEffect(() => {
    const currentQuery = searchParams.get('q')
    if (currentQuery) {
      setSearchQuery(currentQuery)
    }
  }, [searchParams])

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
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="md:hidden" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">Curated List Of Web Articles</span>
          </Link>
        </div>

        <div className="hidden md:flex md:flex-1 md:items-center md:justify-center md:px-4">
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
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button asChild variant="ghost" className="hidden md:flex">
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
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search articles..." 
            className="w-full pl-8" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <nav className="flex flex-col p-4 space-y-2">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md ${pathname === "/" ? "bg-accent" : "hover:bg-accent"}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {isAdmin && (
              <Link
                href="/add-article"
                className={`px-3 py-2 rounded-md ${pathname === "/add-article" ? "bg-accent" : "hover:bg-accent"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Add Article
              </Link>
            )}
            {!user && (
              <Link
                href="/login"
                className={`px-3 py-2 rounded-md ${pathname === "/login" ? "bg-accent" : "hover:bg-accent"}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
