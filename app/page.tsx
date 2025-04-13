import { createServerSupabaseClient } from "@/lib/supabase"
import ArticleCard from "@/components/article-card"
import MainContent from "@/components/main-content"

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }> | { tag?: string; q?: string }
}) {
  const searchParamsObj = searchParams ? 
    (searchParams instanceof Promise ? await searchParams : searchParams) 
    : {};
  const searchQuery = searchParamsObj.q;
  const tagQuery = searchParamsObj.tag;
  
  const supabase = await createServerSupabaseClient()

  try {
    // First, get all articles without filtering
    const { data: allArticles, error: allArticlesError } = await supabase
      .from("articles")
      .select(`
        *,
        tags:article_tags(
        tag:tags(*)
        )
      `)
      .order("created_at", { ascending: false });

    if (allArticlesError) {
      console.error("Error fetching articles:", allArticlesError);
      throw allArticlesError;
    }

    // Then filter the articles based on tags and search query client-side
    let filteredArticles = allArticles;

    // Apply tag filter if provided
    if (tagQuery) {
      const tagNames = tagQuery.split(',');
      
      if (tagNames.length > 0) {
        filteredArticles = filteredArticles.filter(article => 
          article.tags.some((tagItem: any) => 
            tagNames.includes(tagItem.tag.name)
          )
        );
      }
    }

    // Apply search filter if provided
    if (searchQuery) {
      const searchTerm = searchQuery.trim().toLowerCase();
      filteredArticles = filteredArticles.filter(article => 
        article.title.toLowerCase().includes(searchTerm) || 
        (article.description && article.description.toLowerCase().includes(searchTerm))
      );
    }

    // Process tag data
    const { data: tagCounts, error: tagError } = await supabase
      .from('article_tags')
      .select('tag_id, tags!inner(id, name)', { count: 'exact' })
      .limit(1000);
      
    if (tagError) {
      console.error("Error fetching tags:", tagError);
    }

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
        <MainContent tags={formattedTags} initialArticles={filteredArticles || []} />
      </div>
    );
  } catch (err) {
    console.error("Failed to load home page:", err);
    
    // Return a fallback UI
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Error Loading Content</h2>
          <p className="text-muted-foreground">There was a problem loading articles. Please try again later.</p>
        </div>
      </div>
    );
  }
}
