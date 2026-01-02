"use client";

import { useSearchParams } from "next/navigation";
import { PostForm } from "@/components/forms/post-form";

export default function NewPostPage() {
  const searchParams = useSearchParams();
  const isAiMode = searchParams.get("ai") === "true";

  return <PostForm isAiMode={isAiMode} />;
}
