import { createServerSupabaseClient } from "@/lib/supabase"
import { formatDate, getHostname } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import CommentSection from "@/components/comment-section"
import CuratorDeleteArticle from "@/components/curator-delete-article"
import LikeButton from "@/components/like-button"
import { notFound } from "next/navigation"
import type { Database } from "@/lib/database.types"
import { ExternalLinkIcon } from "lucide-react"

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string }
}) {
  // Await params if it's a promise
  const paramsObj = params instanceof Promise ? await params : params;
  
  // Explicitly type this to match your database type
  const articleId: any = paramsObj.id
  
  const supabase = await createServerSupabaseClient()

  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      *,
      tags:article_tags(
        tag:tags(*)
      )
    `)
    .eq("id", articleId)
    .single()

  if (error || !article) {
    notFound()
  }

  const tags = article.tags?.map((t: any) => t.tag) || []

  return (
    <article className="mx-auto max-w-3xl">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>
            <div className="text-sm text-muted-foreground mt-2">
              {formatDate(article.created_at)} • {getHostname(article.url)}
            </div>
          </div>
          
          {/* Curator delete button */}
          <CuratorDeleteArticle articleId={article.id} />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: any) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center">
          <Button asChild variant="outline" className="gap-1 border-primary">
            <Link href={article.url} target="_blank" rel="noopener noreferrer">
              <span className="underline">Article Page</span>
              <ExternalLinkIcon className="w-4 h-4" />
            </Link>
          </Button>
          
          {/* Like button */}
          <LikeButton articleId={article.id} />
        </div>
      </div>

      {article.description && (
        <div className="prose max-w-none dark:prose-invert mt-6">
          <p>{article.description}</p>
        </div>
      )}

      <div className="mt-8">
        <CommentSection articleId={article.id} />
      </div>
    </article>
  )
}
