"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Save,
  Eye,
  ArrowLeft,
  Sparkles,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import Link from "next/link";

const postFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Content is required"),
  featuredImage: z.string().url().optional().or(z.literal("")),
  featuredImageAlt: z.string().max(200).optional(),
  categoryId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"]),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.string().optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface Category {
  id: string;
  name: string;
  color: string;
}

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    excerpt?: string;
    content: string;
    contentJson?: object;
    featuredImage?: string;
    featuredImageAlt?: string;
    categoryId?: string;
    status: string;
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  isAiMode?: boolean;
}

export function PostForm({ initialData, isAiMode = false }: PostFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editorContent, setEditorContent] = useState(
    initialData?.content || ""
  );
  const [editorJson, setEditorJson] = useState<object | null>(
    initialData?.contentJson || null
  );

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      featuredImage: initialData?.featuredImage || "",
      featuredImageAlt: initialData?.featuredImageAlt || "",
      categoryId: initialData?.categoryId || null,
      status: (initialData?.status as PostFormValues["status"]) || "DRAFT",
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
      keywords: initialData?.keywords?.join(", ") || "",
    },
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleEditorChange = (html: string, json: object) => {
    setEditorContent(html);
    setEditorJson(json);
    form.setValue("content", html);
  };

  const onSubmit = async (data: PostFormValues) => {
    setSaving(true);
    try {
      const keywords = data.keywords
        ? data.keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : [];

      const payload = {
        ...data,
        content: editorContent,
        contentJson: editorJson,
        keywords,
        featuredImage: data.featuredImage || null,
        categoryId: data.categoryId || null,
      };

      const url = initialData
        ? `/api/posts/${initialData.id}`
        : "/api/posts";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save post");
      }

      toast.success(initialData ? "Post updated!" : "Post created!");
      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      console.error("Error saving post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save post"
      );
    } finally {
      setSaving(false);
    }
  };

  const generateWithAI = async () => {
    const topic = form.getValues("title");
    if (!topic) {
      toast.error("Please enter a topic/title first");
      return;
    }

    setGenerating(true);
    try {
      // This would call the AI generation API
      toast.info("AI generation coming soon!");
      // const res = await fetch("/api/ai/generate-post", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ topic, categoryId: form.getValues("categoryId") }),
      // });
      // const data = await res.json();
      // form.setValue("title", data.title);
      // form.setValue("excerpt", data.excerpt);
      // setEditorContent(data.content);
      // form.setValue("metaDescription", data.metaDescription);
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/posts">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-poppins">
              {initialData ? "Edit Post" : "Create Post"}
            </h1>
            <p className="text-muted-foreground">
              {initialData
                ? "Update your blog post"
                : "Write a new blog article"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAiMode && !initialData && (
            <Button
              type="button"
              variant="outline"
              onClick={generateWithAI}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate with AI
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => form.setValue("status", "DRAFT")}
          >
            Save as Draft
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {form.watch("status") === "PUBLISHED" ? "Publish" : "Save"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    placeholder="Enter post title..."
                    className="text-lg"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    {...form.register("excerpt")}
                    placeholder="Brief description of the post..."
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <TiptapEditor
                content={editorContent}
                onChange={handleEditorChange}
                placeholder="Start writing your post..."
              />
              {form.formState.errors.content && (
                <p className="text-sm text-destructive mt-2">
                  {form.formState.errors.content.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title (max 70 chars)</Label>
                <Input
                  id="metaTitle"
                  {...form.register("metaTitle")}
                  placeholder="SEO title..."
                  maxLength={70}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {form.watch("metaTitle")?.length || 0}/70 characters
                </p>
              </div>
              <div>
                <Label htmlFor="metaDescription">
                  Meta Description (max 160 chars)
                </Label>
                <Textarea
                  id="metaDescription"
                  {...form.register("metaDescription")}
                  placeholder="SEO description..."
                  maxLength={160}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {form.watch("metaDescription")?.length || 0}/160 characters
                </p>
              </div>
              <div>
                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                <Input
                  id="keywords"
                  {...form.register("keywords")}
                  placeholder="health, nutrition, wellness..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"] as const).map(
                  (status) => (
                    <Badge
                      key={status}
                      variant={
                        form.watch("status") === status ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => form.setValue("status", status)}
                    >
                      {status.toLowerCase()}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={!form.watch("categoryId") ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => form.setValue("categoryId", null)}
                >
                  None
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={
                      form.watch("categoryId") === category.id
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    style={{
                      borderColor:
                        form.watch("categoryId") === category.id
                          ? undefined
                          : category.color,
                    }}
                    onClick={() => form.setValue("categoryId", category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.watch("featuredImage") ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={form.watch("featuredImage")}
                    alt={form.watch("featuredImageAlt") || "Featured image"}
                    className="object-cover w-full h-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => form.setValue("featuredImage", "")}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="aspect-video rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      No image selected
                    </p>
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="featuredImage">Image URL</Label>
                <Input
                  id="featuredImage"
                  {...form.register("featuredImage")}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="featuredImageAlt">Alt Text</Label>
                <Input
                  id="featuredImageAlt"
                  {...form.register("featuredImageAlt")}
                  placeholder="Image description..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
