"use client"

import { useState } from "react"
import { useSupabase } from "./supabase-provider"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface LikeButtonProps {
  articleId: string
  initialLikes: number
}

export default function LikeButton({ articleId, initialLikes }: LikeButtonProps) {
  const { supabase, user } = useSupabase()
  const [likes, setLikes] = useState(initialLikes)
  const [isLiking, setIsLiking] = useState(false)
  const { toast } = useToast()

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like articles",
        variant: "destructive",
      })
      return
    }

    setIsLiking(true)
    
    try {
      // Update likes count
      const { error } = await supabase
        .from('articles')
        .update({ likes: likes + 1 })
        .eq('id', articleId)
      
      if (error) throw error
      
      // Update local state
      setLikes(prev => prev + 1)
      
      toast({
        title: "Article liked",
        description: "Thanks for liking this article!",
      })
    } catch (error: any) {
      console.error("Error liking article:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to like article",
        variant: "destructive",
      })
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={handleLike}
        disabled={isLiking || !user}
      >
        <Heart className="h-4 w-4 text-destructive" />
        <span>Like</span>
      </Button>
      <span className="text-sm text-muted-foreground">{likes} likes</span>
    </div>
  )
} 