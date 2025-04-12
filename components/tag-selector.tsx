"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import ArticleCard from "@/components/article-card"
import { useRouter, useSearchParams } from "next/navigation"

type Tag = {
  id: string
  name: string
  count: number
}

type Article = any

interface TagSelectorProps {
  tags: Tag[]
  initialArticles: Article[]
}

export default function TagSelector({ tags, initialArticles }: TagSelectorProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(initialArticles)

  // Initialize selected tags from URL on component mount
  useEffect(() => {
    const tagParam = searchParams.get('tag')
    if (tagParam) {
      // Split by comma if multiple tags are in URL
      const tagArray = tagParam.split(',')
      setSelectedTags(tagArray)
    } else {
      setSelectedTags([])
    }
  }, [searchParams])

  // Filter articles whenever selected tags change
  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredArticles(initialArticles)
    } else {
      const filtered = initialArticles.filter(article => {
        // Check if article has ALL selected tags
        return selectedTags.every(selectedTag => 
          article.tags.some((t: any) => t.tag.name === selectedTag)
        );
      });
      setFilteredArticles(filtered)
    }
  }, [selectedTags, initialArticles])

  // Update URL when selected tags change
  useEffect(() => {
    // Create a new query string based on the current selected tags
    const queryParams = new URLSearchParams()
    if (selectedTags.length > 0) {
      queryParams.set('tag', selectedTags.join(','))
    }
    
    // Preserve existing search query if any
    const searchQuery = searchParams.get('q')
    if (searchQuery) {
      queryParams.set('q', searchQuery)
    }
    
    // Build the new URL path
    const newPath = selectedTags.length > 0 || searchQuery 
      ? `?${queryParams.toString()}`
      : '/'
    
    // Update the URL
    router.push(newPath)
  }, [selectedTags, searchParams, router])

  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(t => t !== tagName) // Remove tag if already selected
      } else {
        return [...prev, tagName] // Add tag if not selected
      }
    })
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge 
            key={tag.id} 
            variant={selectedTags.includes(tag.name) ? "default" : "outline"}
            className="px-3 text-sm cursor-pointer hover:bg-primary/90"
            onClick={() => toggleTag(tag.name)}
          >
            #{tag.name}
            {selectedTags.includes(tag.name) && <span className="ml-1.5">✕</span>}
          </Badge>
        ))}
      </div>

      <div className="space-y-4">
        {filteredArticles.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filteredArticles.map((article: any) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found.</p>
          </div>
        )}
      </div>
    </div>
  )
} 