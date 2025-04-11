"use server"

export async function generateTags(title: string, url: string): Promise<string[]> {
  // Fetch the content of the article
  const response = await fetch(url)
  const content = await response.text()

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
                text: `Read the HTML page content I give and generate 7 relevant tags from the content and the title, make sure they are relevant to the content itself:\nTitle: ${title}\nContent: ${content}\nONLY OUTPUT THE TAGS, NO OTHER TEXT, Output format: comma-separated list of tags`,
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
