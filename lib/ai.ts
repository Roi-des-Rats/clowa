"use server"

import { createServerSupabaseClient } from "@/lib/supabase"

export async function generateTags(title: string, url: string): Promise<string[]> {
  // Fetch the content of the article
  const response = await fetch(url)
  const content = await response.text()

  // Get existing tags from the database using your established function
  const supabase = await createServerSupabaseClient()
  const { data: existingTags, error: existingTagsError } = await supabase
    .from("tags")
    .select("name")

  let tagNames = ""
  if (existingTags && existingTags.length > 0) {
    // Extract tag names and format them for the prompt
    tagNames = existingTags.map((tag: any) => tag.name).join(", ")
  } else {
    tagNames = "NO EXISTING TAGS YET"
  }

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY || "KEY_NOT_FOUND",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Your only goal is to generate tags from the input I give you. Read the HTML page content I give and generate 7 relevant tags from the content and the title, make sure they are relevant to the content itself:
Title: "${title}"
Content: "${content}"
Existing tags in our system that you can reuse when appropriate (don't force them if they don't fit): "${tagNames}"
ONLY OUTPUT THE TAGS, NO OTHER TEXT, Output format: comma-separated list of tags, all characters must be lowercase.`,
              },
            ],
          },
        ],
      }),
    })
    const data = await response.json()
    const tagsText = data.candidates[0].content.parts[0].text
    return tagsText.split(",").map((tag: string) => tag.trim().toLowerCase())
  } catch (error) {
    console.error("Error generating tags:", error)
    return ["error"]
  }
}
