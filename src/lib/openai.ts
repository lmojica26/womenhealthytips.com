import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY is not set. AI features will be disabled.");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function generateBlogPost(topic: string, category: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are an expert health and wellness writer for Women's Health Tips, a website dedicated to empowering women with evidence-based health information. Write in a friendly, approachable, yet authoritative tone. Your content should be:

- Engaging and easy to read
- Based on current health research
- Practical with actionable tips
- Sensitive to women's health concerns
- SEO-optimized with natural keyword integration

Always include a compelling introduction, well-structured body with subheadings, and a motivating conclusion.`,
      },
      {
        role: "user",
        content: `Write a comprehensive blog post about "${topic}" for the ${category} category.

Requirements:
1. Create an engaging title (60-70 characters)
2. Write a compelling excerpt/meta description (150-160 characters)
3. Structure the content with H2 and H3 headings
4. Include 5-7 practical tips or key points
5. Add a brief introduction and conclusion
6. Target word count: 1000-1500 words
7. Suggest 5-8 relevant keywords

Return the response in the following JSON format:
{
  "title": "...",
  "excerpt": "...",
  "content": "... (HTML formatted with h2, h3, p, ul, li tags)",
  "keywords": ["keyword1", "keyword2", ...],
  "readingTime": <number in minutes>
}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content generated");
  }

  return JSON.parse(content) as {
    title: string;
    excerpt: string;
    content: string;
    keywords: string[];
    readingTime: number;
  };
}

export async function generateRecipe(topic: string, dietType: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a professional nutritionist and recipe developer for Women's Health Tips. Create delicious, healthy recipes that are:

- Nutritionally balanced
- Easy to follow with clear instructions
- Suitable for home cooks
- Focused on whole, healthy ingredients
- Aligned with the specified diet type

Include accurate nutrition information and practical cooking tips.`,
      },
      {
        role: "user",
        content: `Create a healthy ${dietType} recipe for "${topic}".

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

Return the response in the following JSON format:
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
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No content generated");
  }

  return JSON.parse(content);
}

export async function generateImage(prompt: string): Promise<string> {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Professional, high-quality photograph for a women's health and wellness blog: ${prompt}. Style: bright, clean, modern wellness aesthetic with soft natural lighting. Colors: incorporate soft greens and pinks. No text or logos.`,
    n: 1,
    size: "1792x1024",
    quality: "standard",
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("No image generated");
  }

  return imageUrl;
}

export async function generateImagePrompt(title: string, category: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are an expert at creating image prompts for DALL-E. Create descriptive, detailed prompts that will generate beautiful, professional images for a women's health and wellness blog.",
      },
      {
        role: "user",
        content: `Create a DALL-E image prompt for a blog post titled "${title}" in the ${category} category. The image should be appropriate for a women's health website with a modern, clean aesthetic. Return only the prompt, no explanations.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return response.choices[0].message.content || `Healthy lifestyle image for ${title}`;
}
