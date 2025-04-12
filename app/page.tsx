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

  // Apply search filter if provided - FIXED
  if (searchParams.q) {
    const searchTerm = searchParams.q.trim();
    query = query.or(
      `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
    )
  }

  const { data: articles, error } = await query

  if (error) {
    console.error("Error fetching articles:", error)
  }

  // Replace lines 42-57 with this working implementation
  const { data: tagCounts, error: tagError } = await supabase
    .from('article_tags')
    .select('tag_id, tags!inner(id, name)', { count: 'exact' })
    .limit(1000);  // Get a large sample to work with

  // Process the data client-side
  const tagMap: Record<string, { id: string, name: string, count: number }> = {};

  // Count occurrences
  tagCounts?.forEach(item => {
    const tagId = item.tags.id;
    if (!tagMap[tagId]) {
      tagMap[tagId] = {
        id: tagId,
        name: item.tags.name,
        count: 0
      };
    }
    tagMap[tagId].count++;
  });

  // Convert to array and sort
  const formattedTags = Object.values(tagMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4 w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="rounded-full">
            All
          </TabsTrigger>
          {formattedTags.map((tag) => (
            <TabsTrigger key={tag.name} value={tag.name} className="rounded-full">
              {tag.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {articles && articles.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found.</p>
            </div>
          )}
        </TabsContent>

        {formattedTags.map((tag) => (
          <TabsContent key={tag.name} value={tag.name} className="space-y-4">
            {articles
              ?.filter((article: any) => article.tags.some((t: any) => t.tag.name === tag.name))
              .map((article: any) => (
                <ArticleCard key={article.id} article={article} />
              ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
