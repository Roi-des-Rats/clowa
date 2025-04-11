import Link from "next/link"
import Image from "next/image"
import { formatDate, getHostname } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ExternalLink, MessageSquare, Heart } from "lucide-react"

interface ArticleCardProps {
  article: any
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const tags = article.tags?.map((t: any) => t.tag) || []

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      {article.image_url && (
        <div className="relative w-full h-48">
          <Image src={article.image_url || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
        </div>
      )}
      <CardHeader className="flex flex-col space-y-2">
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{formatDate(article.created_at)}</span>
            <span className="mx-2">•</span>
            <span>{getHostname(article.url)}</span>
          </div>
          <Link href={`/article/${article.id}`} className="group">
            <h3 className="font-semibold text-lg group-hover:underline line-clamp-2">{article.title}</h3>
          </Link>
        </div>
        {article.description && <p className="text-muted-foreground text-sm line-clamp-3">{article.description}</p>}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: any) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div className="flex items-center gap-2">
          <Link
            href={`/article/${article.id}`}
            className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comments</span>
          </Link>
          
          <div className="text-sm flex items-center gap-1 text-muted-foreground">
            <Heart className="h-4 w-4 text-destructive" />
            <span>{article.likes || 0}</span>
          </div>
        </div>
        
        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm flex items-center gap-1 text-muted-foreground hover:text-foreground"
        >
          <span>Read</span>
          <ExternalLink className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  )
}
