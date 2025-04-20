import { createServerSupabaseClient } from "@/lib/supabase"
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card"
import { notFound } from "next/navigation"
import { bigelow } from "@/lib/fonts"
import { Suspense } from "react"

export default async function UserPostsPage({
  params,
}: {
  params: Promise<{ username: string }> | { username: string }
}) {
  // Await params if it's a promise
  const paramsObj = params instanceof Promise ? await params : params;
  const username = paramsObj.username;
  
  const supabase = await createServerSupabaseClient()

  // Step 1: Find the user_id for the given username
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("username", username)
    .single()

  if (profileError || !profileData) {
    notFound()
  }

  // Step 2: Fetch articles created by this user
  const { data: articles, error: articlesError } = await supabase
    .from("articles")
    .select(`
      *,
      tags:article_tags(
        tag:tags(*)
      )
    `)
    .eq("created_by", profileData.user_id)
    .order("created_at", { ascending: false })

  if (articlesError) {
    console.error("Error fetching user articles:", articlesError)
    throw articlesError
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span>Posts by</span>
          <span className={`text-foreground ${bigelow.className} bigelow-rules-header`}>{username}</span>
        </h1>
      </div>

      <Suspense fallback={<ArticleCardSkeleton />}>
        {articles.length > 0 ? (
          <div className="space-y-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">This curator hasn't posted any articles yet.</p>
          </div>
        )}
      </Suspense>
    </div>
  )
}