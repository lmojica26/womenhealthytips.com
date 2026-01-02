import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Leaf,
  Dumbbell,
  UtensilsCrossed,
  Heart,
  Sparkles,
  Play,
} from "lucide-react";

const categories = [
  {
    name: "Fitness",
    description: "Workout tips and exercises",
    icon: Dumbbell,
    color: "bg-blue-500",
    href: "/blog/category/fitness",
  },
  {
    name: "Nutrition",
    description: "Healthy eating guides",
    icon: Leaf,
    color: "bg-green-500",
    href: "/blog/category/nutrition",
  },
  {
    name: "Recipes",
    description: "Delicious healthy meals",
    icon: UtensilsCrossed,
    color: "bg-orange-500",
    href: "/recipes",
  },
  {
    name: "Wellness",
    description: "Mind and body balance",
    icon: Heart,
    color: "bg-pink-500",
    href: "/blog/category/wellness",
  },
  {
    name: "Keto",
    description: "Low-carb lifestyle",
    icon: Sparkles,
    color: "bg-purple-500",
    href: "/blog/category/keto",
  },
  {
    name: "Videos",
    description: "Watch and learn",
    icon: Play,
    color: "bg-red-500",
    href: "/videos",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-wellness-soft">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Your Wellness Journey Starts Here
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins mb-6">
              <span className="text-gradient-wellness">Transform</span> Your
              Health With Expert Tips
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover nutritious recipes, effective workout routines, and
              wellness advice tailored for women. Start your journey to a
              healthier, happier you today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/blog">
                  Explore Articles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/recipes">Browse Recipes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-poppins mb-4">
              Explore Our Content
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find the perfect content for your wellness journey across our
              carefully curated categories.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link key={category.name} href={category.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}
                    >
                      <category.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Section - Placeholder */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold font-poppins mb-2">
                Latest Articles
              </h2>
              <p className="text-muted-foreground">
                Fresh insights for your health journey
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/blog">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Placeholder cards - will be replaced with real data */}
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardHeader>
                  <Badge variant="secondary" className="w-fit">
                    Nutrition
                  </Badge>
                  <CardTitle className="line-clamp-2">
                    Coming Soon: Amazing Health Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">
                    Stay tuned for our latest articles on nutrition, fitness,
                    and wellness.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 lg:py-24 bg-gradient-wellness text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold font-poppins mb-4">
              Join Our Newsletter
            </h2>
            <p className="mb-8 opacity-90">
              Get weekly health tips, exclusive recipes, and wellness advice
              delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button
                type="submit"
                variant="secondary"
                size="lg"
                className="whitespace-nowrap"
              >
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
