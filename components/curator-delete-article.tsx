"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { useSupabase } from "./supabase-provider"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

interface CuratorDeleteArticleProps {
  articleId: string
}

export default function CuratorDeleteArticle({ articleId }: CuratorDeleteArticleProps) {
  const { supabase, isCurator } = useSupabase()
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  if (!isCurator) return null

  const handleDeleteArticle = async () => {
    setIsDeleting(true)
    try {
      // First delete related comments
      await supabase
        .from("comments")
        .delete()
        .eq("article_id", articleId)

      // Then delete article tags
      await supabase
        .from("article_tags")
        .delete()
        .eq("article_id", articleId)

      // Finally delete the article
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", articleId)

      if (error) throw error

      toast({
        title: "Article deleted",
      })

      // Redirect to home page
      router.push("/")
    } catch (error: any) {
      console.error("Error deleting article:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete article",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          size="sm" 
          className="gap-2"
        >
          <span>Delete Article</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete article</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this article? This will also remove all comments and tags associated with it.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteArticle}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 