import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-8xl font-bold text-gradient-wellness">404</span>
        </div>
        <h1 className="text-2xl font-bold font-poppins mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have
          been moved or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/blog">
              <Search className="h-4 w-4 mr-2" />
              Browse Blog
            </Link>
          </Button>
        </div>
        <div className="mt-8 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            Looking for something specific?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/recipes">Recipes</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/videos">Videos</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
