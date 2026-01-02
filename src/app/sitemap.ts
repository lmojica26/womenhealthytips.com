import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://womenhealthytips.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/recipes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/videos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Fetch all published posts
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const postPages: MetadataRoute.Sitemap = posts.map((post: typeof posts[number]) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Fetch all published recipes
  const recipes = await prisma.recipe.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const recipePages: MetadataRoute.Sitemap = recipes.map((recipe: typeof recipes[number]) => ({
    url: `${siteUrl}/recipes/${recipe.slug}`,
    lastModified: recipe.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Fetch all published videos
  const videos = await prisma.video.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { publishedAt: "desc" },
  });

  const videoPages: MetadataRoute.Sitemap = videos.map((video: typeof videos[number]) => ({
    url: `${siteUrl}/videos/${video.slug}`,
    lastModified: video.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Fetch all categories
  const categories = await prisma.category.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { order: "asc" },
  });

  const categoryPages: MetadataRoute.Sitemap = categories.map((category: typeof categories[number]) => ({
    url: `${siteUrl}/blog?category=${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...postPages,
    ...recipePages,
    ...videoPages,
    ...categoryPages,
  ];
}
