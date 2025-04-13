import { createServerSupabaseClient } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { bigelow } from "@/lib/fonts"

export default async function AboutPage() {
  const supabase = await createServerSupabaseClient()
  
  // Fetch users who are curators
  const { data: curators, error } = await supabase
    .from("user_roles")
    .select(`
      user_id,
      profiles (
        username
      )
    `)
    .eq("is_curator", true)
  
  if (error) {
    console.error("Error fetching curators:", error)
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">About</h2>
        <p className="mt-4">
            <span className={`text-2xl tracking-wider font-bold text-foreground ${bigelow.className}`}>CLOWA</span> <span className={`text-2xl tracking-wider font-bold text-foreground ${bigelow.className}`}>(Curated List Of Web Articles)</span> is a website where a handful of curators share articles, blog posts, and other written web content that they think are worth reading.
        </p>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Curators List</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {curators && curators.length > 0 ? (
            curators.map((curator) => (
              <Card key={curator.user_id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col space-y-2">
                    <h3 className="font-medium text-lg">
                      {curator.profiles?.username}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground col-span-2">No curators found.</p>
          )}
        </div>
      </section>
      
      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Contact</h2>
        <p>
          You can contact us at <Link 
            href="mailto:info@clowa.net" 
            className="text-primary underline inline-flex items-center"
          >
            info@clowa.net
          </Link>.
        </p>
      </section>
    </div>
  )
}