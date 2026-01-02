import { z } from "zod";

// Post schemas
export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1).max(200).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  contentJson: z.any().optional(),
  featuredImage: z.string().url().optional().nullable(),
  featuredImageAlt: z.string().max(200).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.string().datetime().optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).optional(),
  isAiGenerated: z.boolean().default(false),
  aiModel: z.string().optional(),
  aiPrompt: z.string().optional(),
});

export const updatePostSchema = createPostSchema.partial();

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).default(0),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Affiliate Link schemas
export const createAffiliateLinkSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  url: z.string().url("Valid URL is required"),
  shortCode: z.string().min(1).max(50).optional(),
  network: z.enum(["CLICKBANK", "AMAZON", "SHAREASALE", "CJ_AFFILIATE", "IMPACT", "OTHER"]).default("OTHER"),
  productId: z.string().optional(),
  commission: z.number().min(0).max(100).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().nullable(),
  callToAction: z.string().max(100).optional(),
  showInSidebar: z.boolean().default(true),
  sidebarOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const updateAffiliateLinkSchema = createAffiliateLinkSchema.partial();

// Recipe schemas
export const createRecipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  contentJson: z.any().optional(),
  featuredImage: z.string().url().optional().nullable(),
  featuredImageAlt: z.string().max(200).optional(),
  images: z.array(z.string().url()).optional(),
  videoUrl: z.string().url().optional().nullable(),
  prepTime: z.number().int().min(0).optional(),
  cookTime: z.number().int().min(0).optional(),
  totalTime: z.number().int().min(0).optional(),
  servings: z.number().int().min(1).optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  ingredients: z.array(z.object({
    item: z.string(),
    amount: z.string().optional(),
    unit: z.string().optional(),
    notes: z.string().optional(),
  })),
  nutritionFacts: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
    fiber: z.number().optional(),
    sugar: z.number().optional(),
  }).optional(),
  isVegan: z.boolean().default(false),
  isVegetarian: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isKeto: z.boolean().default(false),
  isDairyFree: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.string().datetime().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).optional(),
});

export const updateRecipeSchema = createRecipeSchema.partial();

// Video schemas
export const createVideoSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  youtubeId: z.string().min(1, "YouTube ID is required"),
  youtubeUrl: z.string().url("Valid YouTube URL is required"),
  thumbnailUrl: z.string().url().optional().nullable(),
  duration: z.number().int().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.string().datetime().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).optional(),
});

export const updateVideoSchema = createVideoSchema.partial();

// Query params schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]).optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Type exports
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateAffiliateLinkInput = z.infer<typeof createAffiliateLinkSchema>;
export type UpdateAffiliateLinkInput = z.infer<typeof updateAffiliateLinkSchema>;
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
