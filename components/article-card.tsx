"use client"

import Link from "next/link"
import Image from "next/image"
import { formatDate, getHostname } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useSupabase } from "@/components/supabase-provider"
import { useState, useEffect } from "react"
import { ExternalLinkIcon, Heart } from "lucide-react"

interface ArticleCardProps {
  article: any
}

// Create a client component for likes display
function ArticleCardLikes({ articleId }: { articleId: string }) {
  const { supabase } = useSupabase()
  const [likesCount, setLikesCount] = useState(0)
  
  useEffect(() => {
    const fetchLikes = async () => {
      const { data, error } = await supabase
        .rpc('get_article_likes', { article_id: articleId })
      
      if (!error) {
        setLikesCount(data || 0)
      }
    }
    
    fetchLikes()
  }, [articleId, supabase])
  
  return (
    <div className="text-sm flex items-center gap-1 text-muted-foreground">
      {likesCount > 0 && (
        <>
          <Heart className="h-4 w-4 text-destructive" />
          <span>{likesCount}</span>
        </>
      )}
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
      {/* Image section - take up more space on horizontal layout */}
      {article.image_url && (
        <div className="relative w-full h-48 sm:h-auto sm:w-1/3 sm:min-h-[12rem]">
          <Image 
            src={article.image_url || "/placeholder.svg"} 
            alt={article.title} 
            fill 
            className="object-cover" 
          />
        </div>
      )}
      
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
          
          {article.description && 
            <p className="text-muted-foreground text-sm line-clamp-2">{article.description}</p>
          }
          
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
