import { createServerSupabaseClient } from "@/lib/supabase"
import { formatDate, getHostname } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import CommentSection from "@/components/comment-section"
import AdminDeleteArticle from "@/components/admin-delete-article"
import { notFound } from "next/navigation"

export default async function ArticlePage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServerSupabaseClient()

  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      *,
      tags:article_tags(
        tag:tags(*)
      )
    `)
    .eq("id", params.id)
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
          
          {/* Admin delete button */}
          <AdminDeleteArticle articleId={article.id} />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: any) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>

        <Button asChild variant="outline" className="gap-2">
          <Link href={article.url} target="_blank" rel="noopener noreferrer">
            <span>Read Article</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {article.image_url && (
        <div className="relative w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden">
          <Image src={article.image_url || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
        </div>
      )}

      {article.description && (
        <div className="prose max-w-none dark:prose-invert">
          <p>{article.description}</p>
        </div>
      )}

      <CommentSection articleId={article.id} />
    </article>
  )
}
