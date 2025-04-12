import { createServerSupabaseClient } from "@/lib/supabase"

interface ArticleLikesCountProps {
  articleId: string
}

export default async function ArticleLikesCount({ articleId }: ArticleLikesCountProps) {
  const supabase = createServerSupabaseClient()
  
  const { data: likesCount, error } = await supabase
    .rpc('get_article_likes', { article_id: articleId })
  
  if (error) {
    console.error("Error fetching likes count:", error)
    return <span>0 likes</span>
  }

  return <span>{likesCount || 0} likes</span>
} 