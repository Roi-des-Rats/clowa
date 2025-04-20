"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useSupabase } from "./supabase-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import CommentLikeButton from "@/components/comment-like-button"

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  username: string
}

export default function CommentSection({ articleId }: { articleId: string }) {
  const { supabase, user, isCurator, isLoading } = useSupabase()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Move fetchComments outside useEffect so we can call it directly
  const fetchComments = async () => {
    setIsLoadingComments(true)
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles (username)
      `)
      .eq("article_id", articleId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching comments:", error)
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      })
    } else {
      const formattedComments = data?.map(comment => ({
        ...comment,
        username: comment.profiles?.username || 'Unknown User'
      })) || []
      setComments(formattedComments)
    }
    setIsLoadingComments(false)
  }

  useEffect(() => {
    fetchComments()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`comments-${articleId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `article_id=eq.${articleId}`,
        },
        () => {
          fetchComments()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, articleId, toast])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to post a comment",
        variant: "destructive",
      })
      return
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const { error } = await supabase.from("comments").insert({
      article_id: articleId,
      user_id: user.id,
      profile_id: user.id,
      content: newComment.trim(),
    })

    if (error) {
      console.error("Error posting comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      })
    } else {
      setNewComment("")
      toast({
        title: "Comment posted",
      })
      
      // Force fetch comments after posting
      await fetchComments()
    }

    setIsSubmitting(false)
  }

  // Add this new function to handle comment deletion
  const handleDeleteComment = async (commentId: string) => {
    setIsDeleting(commentId)
    
    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
      
      if (error) {
        throw error
      }
      
      toast({
        title: "Comment deleted",
      })
      
      // Manually fetch comments after deletion
      await fetchComments()
    } catch (error: any) {
      console.error("Error deleting comment:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const CommentSkeleton = () => (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </>
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Comments</h2>

      {!isLoading && !user && (
        <div className="bg-muted p-4 rounded-lg text-center">
          <p className="mb-2">Sign in to join the conversation</p>
          <Button asChild variant="default" size="sm">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      )}

      <div className="space-y-6">
        <Suspense fallback={<CommentSkeleton />}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 group">
                <div className="space-y-1 w-full">
                <div className="flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{comment.username}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                  </div>
                  
                  {/* Curator delete button */}
                  {isCurator && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="underline text-destructive">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete comment</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isDeleting === comment.id}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {isDeleting === comment.id ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <p className="text-sm">{comment.content}</p>
                
                {/* Add the comment like button */}
                <div className="mt-2">
                  <CommentLikeButton commentId={comment.id} />
                </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
