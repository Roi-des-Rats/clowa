"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "./supabase-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Heart } from "lucide-react"
interface CommentLikeButtonProps {
  commentId: string
}

export default function CommentLikeButton({ commentId }: CommentLikeButtonProps) {
  const { supabase, user } = useSupabase()
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        // Get total likes count
        const { data: likesData, error: countError } = await supabase
          .from('comment_likes')
          .select('created_at', { count: 'exact' })
          .eq('comment_id', commentId)
        
        if (countError) throw countError
        setLikes(likesData?.length || 0)
        
        // Check if current user has liked the comment
        if (user) {
          const { data: userLike, error: likeError } = await supabase
            .from('comment_likes')
            .select('comment_id, user_id')
            .eq('comment_id', commentId)
            .eq('user_id', user.id)
            .maybeSingle()
          
          if (likeError) throw likeError
          setIsLiked(!!userLike)
        }
      } catch (error) {
        console.error("Error fetching comment likes", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLikes()
  }, [supabase, commentId, user])

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like comments",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', user.id)
        
        if (error) throw error
        
        setLikes(prev => Math.max(0, prev - 1))
        setIsLiked(false)
      } else {
        // Add like
        const { error } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          })
        
        if (error) {
          if (error.code === '23505') { // Unique constraint violation
            toast({
              title: "Already liked",
              description: "You've already liked this comment",
            })
          } else {
            throw error
          }
        } else {
          setLikes(prev => prev + 1)
          setIsLiked(true)
        }
      }
    } catch (error: any) {
      console.error("Error toggling comment like:", error)
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
    <Button 
      variant="ghost" 
      size="sm" 
      className={`px-2 h-7 text-xs flex items-center gap-1`}
      onClick={handleLike}
      disabled={isLoading}
    >
      <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-primary text-primary" : "text-muted-foreground"}`} />
      <span className={isLiked ? "text-primary" : "text-muted-foreground"}>{likes}</span>
    </Button>
  )
} 