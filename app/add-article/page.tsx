"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/supabase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { generateTags } from "@/lib/ai"
import { X } from "lucide-react"

export default function AddArticlePage() {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingTags, setIsGeneratingTags] = useState(false)
  const [generatedTags, setGeneratedTags] = useState<string[]>([])
  const { supabase, user, isAdmin, isLoading: isUserLoading } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()

  // Redirect if not admin
  useEffect(() => {
    if (!isUserLoading && (!user || !isAdmin)) {
      router.push("/")
    }
  }, [isUserLoading, user, isAdmin, router])

  const handleGenerateTags = async () => {
    if (!title || !url) {
      toast({
        title: "Missing information",
        description: "Please provide a title and description to generate tags",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingTags(true)

    try {
      const tags = await generateTags(title, url)
      setGeneratedTags(tags)
      toast({
        title: "Tags generated",
        description: `Generated ${tags.length} tags for your article`,
      })
    } catch (error) {
      console.error("Error generating tags:", error)
      toast({
        title: "Error",
        description: "Failed to generate tags",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingTags(false)
    }
  }

  const handleRemoveTag = (indexToRemove: number) => {
    setGeneratedTags(prevTags => prevTags.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !url) {
      toast({
        title: "Missing information",
        description: "Please provide a title and URL",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // 1. Insert article
      const { data: article, error: articleError } = await supabase
        .from("articles")
        .insert({
          title,
          url,
          description: description || null,
          image_url: imageUrl || null,
          created_by: user!.id,
        })
        .select()
        .single()

      if (articleError) throw articleError

      // 2. Insert tags if any
      if (generatedTags.length > 0) {
        for (const tagName of generatedTags) {
          // Check if tag exists
          const { data: existingTag } = await supabase.from("tags").select("id").eq("name", tagName).single()

          let tagId

          if (existingTag) {
            tagId = existingTag.id
          } else {
            // Create new tag
            const { data: newTag, error: tagError } = await supabase
              .from("tags")
              .insert({ name: tagName })
              .select()
              .single()

            if (tagError) throw tagError
            tagId = newTag.id
          }

          // Create article-tag relationship
          await supabase.from("article_tags").insert({
            article_id: article.id,
            tag_id: tagId,
          })
        }
      }

      toast({
        title: "Article added",
      })

      router.push(`/article/${article.id}`)
    } catch (error: any) {
      console.error("Error adding article:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add article",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add New Article</CardTitle>
          <CardDescription>Share an interesting article with the community</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the article"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-url">Image URL (optional)</Label>
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Tags</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateTags}
                  disabled={isGeneratingTags || !title || !url}
                >
                  {isGeneratingTags ? "Generating..." : "Generate Tags"}
                </Button>
              </div>

              {generatedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {generatedTags.map((tag, index) => (
                    <div 
                      key={index} 
                      className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center group"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className="ml-1.5 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <X className="h-3 w-3 text-secondary-foreground/70 hover:text-secondary-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Adding Article..." : "Add Article"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
