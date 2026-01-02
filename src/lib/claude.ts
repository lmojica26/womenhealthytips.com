import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("ANTHROPIC_API_KEY is not set. Claude backup will be disabled.");
}

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function generateBlogPostWithClaude(topic: string, category: string) {
  const response = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are an expert health and wellness writer for Women's Health Tips, a website dedicated to empowering women with evidence-based health information. Write in a friendly, approachable, yet authoritative tone.

Write a comprehensive blog post about "${topic}" for the ${category} category.

Requirements:
1. Create an engaging title (60-70 characters)
2. Write a compelling excerpt/meta description (150-160 characters)
3. Structure the content with H2 and H3 headings
4. Include 5-7 practical tips or key points
5. Add a brief introduction and conclusion
6. Target word count: 1000-1500 words
7. Suggest 5-8 relevant keywords

Return the response in the following JSON format only (no markdown, no explanations):
{
  "title": "...",
  "excerpt": "...",
  "content": "... (HTML formatted with h2, h3, p, ul, li tags)",
  "keywords": ["keyword1", "keyword2", ...],
  "readingTime": <number in minutes>
}`,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No content generated");
  }

  // Extract JSON from the response
  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON response");
  }

  return JSON.parse(jsonMatch[0]) as {
    title: string;
    excerpt: string;
    content: string;
    keywords: string[];
    readingTime: number;
  };
}

export async function generateRecipeWithClaude(topic: string, dietType: string) {
  const response = await claude.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `You are a professional nutritionist and recipe developer for Women's Health Tips. Create a healthy ${dietType} recipe for "${topic}".

Requirements:
1. Recipe title (descriptive and appealing)
2. Brief description (2-3 sentences)
3. Prep time, cook time, total time (in minutes)
4. Number of servings
5. Difficulty level (EASY, MEDIUM, or HARD)
6. Complete ingredient list with measurements
7. Step-by-step instructions
8. Nutrition facts per serving (calories, protein, carbs, fat, fiber)
9. 3-5 helpful cooking tips

Return the response in the following JSON format only (no markdown, no explanations):
{
  "title": "...",
  "excerpt": "...",
  "prepTime": <number>,
  "cookTime": <number>,
  "totalTime": <number>,
  "servings": <number>,
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": ["step 1", "step 2", ...],
  "calories": <number>,
  "protein": <number>,
  "carbs": <number>,
  "fat": <number>,
  "fiber": <number>,
  "tips": "... (HTML formatted tips)",
  "keywords": ["keyword1", "keyword2", ...]
}`,
      },
    ],
  });

  const textContent = response.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No content generated");
  }

  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse JSON response");
  }

  return JSON.parse(jsonMatch[0]);
}
