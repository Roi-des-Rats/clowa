"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "./supabase-provider"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface LikeButtonProps {
  articleId: string
}

export default function LikeButton({ articleId }: LikeButtonProps) {
  const { supabase, user } = useSupabase()
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        // Get total likes count
        const { data: likesCount, error: countError } = await supabase
          .rpc('get_article_likes', { article_id: articleId })
        
        if (countError) throw countError
        setLikes(likesCount || 0)
        
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
  }, [supabase, articleId, user])

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
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
        
        setLikes(prev => Math.max(0, prev - 1))
        setIsLiked(false)
        
        toast({
          title: "Like removed",
          description: "Your like has been removed from this article",
        })
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
          setLikes(prev => prev + 1)
          setIsLiked(true)
          
          toast({
            title: "Article liked",
            description: "Thanks for liking this article!",
          })
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
    <div className="flex items-center gap-2">
      <Button 
        variant={isLiked ? "default" : "outline"}
        size="sm" 
        className={`flex items-center gap-1 ${isLiked ? "bg-destructive hover:bg-destructive/90" : ""}`}
        onClick={handleLike}
        disabled={isLoading || !user}
      >
        <Heart className={`h-4 w-4 ${isLiked ? "fill-white text-white" : "text-destructive"}`} />
        <span>{isLiked ? "Liked" : "Like"}</span>
      </Button>
      <span className="text-sm text-muted-foreground">{likes} likes</span>
    </div>
  )
} 