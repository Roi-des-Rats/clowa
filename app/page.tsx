import { createServerSupabaseClient } from "@/lib/supabase"
import ArticleCard from "@/components/article-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function Home({
  searchParams,
}: {
  searchParams: { tag?: string; q?: string }
}) {
  const supabase = createServerSupabaseClient()

  // Build query
  let query = supabase
    .from("articles")
    .select(`
      *,
      tags:article_tags(
        tag:tags(*)
      )
    `)
    .order("created_at", { ascending: false })

  // Apply tag filter if provided
  if (searchParams.tag) {
    query = query.contains("tags.tag.name", [searchParams.tag])
  }

  // Apply search filter if provided
  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }

  const { data: articles, error } = await query

  if (error) {
    console.error("Error fetching articles:", error)
  }

  // Get popular tags
  const { data: popularTags } = await supabase
    .from("tags")
    .select("name, article_tags!inner(*)")
    .order("article_tags", { ascending: false })
    .limit(10)

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Curated List Of Web Articles</h1>
        <p className="text-muted-foreground">
          Discover the best articles from around the web, curated by our community.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="rounded-full">
            All
          </TabsTrigger>
          {popularTags?.map((tag) => (
            <TabsTrigger key={tag.name} value={tag.name} className="rounded-full">
              {tag.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {articles && articles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found.</p>
            </div>
          )}
        </TabsContent>

        {popularTags?.map((tag) => (
          <TabsContent key={tag.name} value={tag.name} className="space-y-4">
            {articles
              ?.filter((article) => article.tags.some((t) => t.tag.name === tag.name))
              .map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
