"use client"

import Link from "next/link"
import { formatDate, getHostname } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useSupabase } from "@/components/supabase-provider"
import { useState, useEffect } from "react"
import { ExternalLinkIcon, Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ArticleCardProps {
  article: any
}

// Create a client component for likes display
function ArticleCardLikes({ articleId }: { articleId: string }) {
  const { supabase, user } = useSupabase()
  const [likesCount, setLikesCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  
  useEffect(() => {
    const fetchLikes = async () => {
      try {
        // Get total likes count
        const { data, error } = await supabase
          .rpc('get_article_likes', { article_id: articleId })
        
        if (error) throw error
        setLikesCount(data || 0)
        
        // Check if current user has liked the article
        if (user) {
          const { data: userLike, error: likeError } = await supabase
            .from('article_likes')
            .select('article_id, user_id')
            .eq('article_id', articleId)
            .eq('user_id', user.id)
            .maybeSingle()
          
          if (likeError) throw likeError
          setIsLiked(!!userLike)
        }
      } catch (error) {
        console.error("Error fetching likes", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLikes()
  }, [articleId, supabase, user])
  
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like articles",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', articleId)
          .eq('user_id', user.id)
        
        if (error) throw error
        
        setLikesCount(prev => Math.max(0, prev - 1))
        setIsLiked(false)
      } else {
        // Add like
        const { error } = await supabase
          .from('article_likes')
          .insert({
            article_id: articleId,
            user_id: user.id
          })
        
        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            toast({
              title: "Already liked",
              description: "You've already liked this article",
            })
          } else {
            throw error
          }
        } else {
          setLikesCount(prev => prev + 1)
          setIsLiked(true)
        }
      }
    } catch (error: any) {
      console.error("Error toggling like:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to process like action",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="text-sm flex items-center gap-1 text-muted-foreground">
      <button 
        onClick={handleLike}
        disabled={isLoading}
        className="flex items-center gap-1 disabled:opacity-70"
      >
        <Heart 
          className={`h-4 w-4 ${isLiked ? "fill-destructive text-destructive" : "text-destructive"} hover:scale-110 transition-transform`} 
        />
        {likesCount > 0 && <span>{likesCount}</span>}
      </button>
    </div>
  )
}

// Create a client component for comment counts
function ArticleCardComments({ articleId }: { articleId: string }) {
  const { supabase } = useSupabase()
  const [commentsCount, setCommentsCount] = useState(0)
  
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error, count } = await supabase
        .from('comments')
        .select('id', { count: 'exact' })
        .eq('article_id', articleId)
      
      if (!error) {
        setCommentsCount(count || 0)
      }
    }
    
    fetchComments()
  }, [supabase, articleId])
  
  return (
    <div className="text-sm flex items-center text-muted-foreground">
      {commentsCount > 0 && (
        <>
          <span>{commentsCount}</span>
        </>
      )}
    </div>
  )
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const tags = article.tags?.map((t: any) => t.tag) || []

  return (
    <Card className="overflow-hidden flex flex-col sm:flex-row w-full">
      {/* Content section - takes remaining space */}
      <div className="flex flex-col justify-between flex-grow p-4 sm:p-6">
        {/* Header content */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{formatDate(article.created_at)}</span>
            <span className="mx-2">•</span>
            <span>{getHostname(article.url)}</span>
          </div>
          
          <Link href={`/article/${article.id}`} className="group">
            <h3 className="font-semibold text-lg group-hover:underline line-clamp-2">{article.title}</h3>
          </Link>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag: any) => (
              <Badge key={tag.id} variant="secondary">
                #{tag.name}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Footer content */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <Link
              href={`/article/${article.id}`}
              className="text-sm flex gap-1 items-center text-muted-foreground hover:text-foreground"
            >
              <span className="underline">Comments</span>
              <ArticleCardComments articleId={article.id} />
            </Link>
            <ArticleCardLikes articleId={article.id} />
          </div>
          
          <Link
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <span className="underline">Article Page</span>
            <ExternalLinkIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </Card>
  )
}
