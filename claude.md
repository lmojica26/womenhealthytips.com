# Women's Health Tips - Project Context

## Project Overview

A modern, SEO-optimized women's health and wellness website with AI-powered content automation. Based on the existing site womenhealthytips.com.

**Domain:** womenhealthytips.com
**Language:** English only
**Target Audience:** Women interested in health, nutrition, fitness, and wellness

## Tech Stack

| Technology | Choice | Purpose |
|------------|--------|---------|
| Framework | Next.js 14+ (App Router) | Core framework |
| Styling | Tailwind CSS + shadcn/ui | UI components |
| Database | PostgreSQL + Prisma ORM | Data storage |
| Auth | Clerk | Admin authentication |
| AI Content | OpenAI GPT-4 + Claude | Blog generation |
| AI Images | DALL-E | Featured images |
| Videos | YouTube embeds | Video content |
| Hosting | Vercel | Deployment + Cron |
| Image Storage | Cloudinary | Media files |

## Design System

### Colors
- **Primary (Green):** #10b981 - Wellness, health, growth
- **Secondary (Pink):** #ec4899 - Feminine, vibrant, engaging
- **Background:** White/Light gray
- **Text:** Dark gray (#1f2937)

### Typography
- **Headings:** Poppins or Inter (bold)
- **Body:** Inter (regular)

### Style Guidelines
- Fresh, modern, minimalist wellness aesthetic
- Clean whitespace
- Rounded corners on cards
- Subtle shadows
- High-quality imagery

## Content Categories

1. **Fitness** - Workout tips, exercises, fitness challenges
2. **Cooking** - Healthy recipes, meal prep
3. **Keto** - Ketogenic diet recipes and tips
4. **Clean Eating** - Whole foods, clean recipes
5. **Vegan** - Plant-based recipes and nutrition
6. **Yoga** - Yoga practices, mindfulness

## Key Features

### Public Website
- Homepage with hero, featured content, newsletter
- Blog listing with category filters and pagination
- Individual blog posts with sidebar (affiliate widgets)
- Recipe section with diet filters and nutrition facts
- Video gallery with YouTube embeds
- SEO optimized (sitemap, JSON-LD, meta tags)

### Admin Panel (Protected by Clerk)
- Dashboard with stats and analytics
- Rich text editor (TipTap) for content creation
- Posts, Recipes, Videos management
- Media library with AI image generation
- Affiliate links management (ClickBank, Amazon, etc.)
- Category and tag management
- Site settings

### AI Automation
- Daily blog post generation (8 AM UTC)
- SEO-optimized content about nutrition/health
- DALL-E generated featured images
- Topic rotation system
- Generation logging

### Affiliate Marketing
- Right sidebar with ClickBank product widgets
- Sticky product cards for visibility
- Category-based product recommendations
- Click tracking
- Admin configurable slots

## Database Models

- `Category` - Content categories
- `Post` - Blog articles with SEO fields
- `Recipe` - Recipes with ingredients, nutrition
- `Video` - YouTube embed references
- `Tag` - Content tags
- `AffiliateLink` - Affiliate links with tracking
- `Media` - Uploaded/generated images
- `SiteSettings` - Global configuration
- `AiGenerationLog` - AI usage tracking
- `NewsletterSubscriber` - Email subscribers

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages (blog, recipes, videos)
│   ├── (admin)/           # Admin panel (protected)
│   ├── api/               # API routes
│   ├── sign-in/           # Clerk auth pages
│   └── sign-up/
├── components/
│   ├── ui/                # shadcn components
│   ├── layout/            # Header, Footer, Sidebar
│   ├── blog/              # Blog components
│   ├── recipes/           # Recipe components
│   ├── videos/            # Video components
│   ├── affiliates/        # Sidebar widgets
│   ├── editor/            # TipTap editor
│   ├── seo/               # JSON-LD, meta
│   └── admin/             # Admin dashboard
├── lib/                   # Utilities (prisma, openai, etc.)
├── services/              # Business logic
├── hooks/                 # React hooks
└── types/                 # TypeScript types
```

## Environment Variables

```
DATABASE_URL                          # PostgreSQL connection
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY    # Clerk public key
CLERK_SECRET_KEY                      # Clerk secret
OPENAI_API_KEY                        # OpenAI/DALL-E
ANTHROPIC_API_KEY                     # Claude API
CLOUDINARY_CLOUD_NAME                 # Image storage
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
CRON_SECRET                           # Secure cron jobs
NEXT_PUBLIC_SITE_URL                  # https://womenhealthytips.com
```

## Implementation Status

### Phase 1: Foundation Setup ✅ COMPLETE
- [x] Initialize Next.js 16 project with App Router
- [x] Configure Tailwind CSS with green/pink wellness theme
- [x] Install shadcn/ui components (button, card, dialog, etc.)
- [x] Set up Prisma 7 schema with all models
- [x] Configure Clerk auth with middleware
- [x] Create layout structure (public + admin)

### Phase 2: Admin Panel ✅ COMPLETE
- [x] TipTap rich text editor with toolbar
- [x] Posts management (CRUD, listing, create/edit)
- [x] Categories API and management
- [x] Affiliates management with sidebar widgets
- [x] Dashboard with stats

### Phase 3: Public Website ✅ COMPLETE
- [x] Homepage with hero, categories, newsletter
- [x] Blog listing with pagination and category filter
- [x] Blog post page with sidebar and related posts
- [x] Recipe listing with diet type filter
- [x] Recipe page with ingredients, instructions, nutrition
- [x] Video listing with category filter
- [x] Video page with YouTube embed
- [x] SEO JSON-LD (Article, Recipe, Video, Breadcrumb)
- [x] Sitemap and robots.txt generation

### Phase 4: AI Automation ✅ COMPLETE
- [x] OpenAI client (GPT-4 for content, DALL-E for images)
- [x] Claude client (backup for content generation)
- [x] Blog post generation API (/api/ai/generate-post)
- [x] Recipe generation API (/api/ai/generate-recipe)
- [x] Image generation API (/api/ai/generate-image)
- [x] Daily cron job (/api/cron/daily-post)
- [x] Vercel cron configuration (8 AM UTC daily)
- [x] Topic rotation system (30+ health topics)
- [x] AI generation logging

### Phase 5: Affiliate & SEO ✅ COMPLETE
- [x] Affiliate management
- [x] Sidebar widgets
- [x] SEO optimization (JSON-LD, meta tags, sitemap)
- [x] Performance (loading states, error boundaries)

### Phase 6: Launch ✅ COMPLETE
- [x] Google Analytics integration
- [x] Newsletter subscription API
- [x] Error handling (404, global error boundary)
- [x] Loading states for all pages
- [x] TypeScript compilation verified
- [ ] Deploy to Vercel (requires env vars)

## Important Notes

- All content in English only
- AI generates 1 blog post daily about nutrition/health
- Videos are YouTube embeds (no self-hosting)
- Admin access only (no public user registration)
- ClickBank is primary affiliate network
- Mobile-first responsive design

## Commands Reference

```bash
# Development
npm run dev

# Build
npm run build

# Prisma
npx prisma generate
npx prisma migrate dev
npx prisma studio

# shadcn/ui
npx shadcn@latest add [component]
```

---

*Last Updated: January 2026*
