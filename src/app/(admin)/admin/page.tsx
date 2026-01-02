import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  UtensilsCrossed,
  Video,
  Eye,
  TrendingUp,
  Users,
  Link2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

const stats = [
  {
    title: "Total Posts",
    value: "0",
    icon: FileText,
    change: "+0 this week",
    href: "/admin/posts",
  },
  {
    title: "Total Recipes",
    value: "0",
    icon: UtensilsCrossed,
    change: "+0 this week",
    href: "/admin/recipes",
  },
  {
    title: "Total Videos",
    value: "0",
    icon: Video,
    change: "+0 this week",
    href: "/admin/videos",
  },
  {
    title: "Page Views",
    value: "0",
    icon: Eye,
    change: "+0% from last week",
    href: "/admin",
  },
];

const quickActions = [
  {
    title: "Create New Post",
    description: "Write a new blog article",
    icon: FileText,
    href: "/admin/posts/new",
    color: "bg-blue-500",
  },
  {
    title: "Add Recipe",
    description: "Add a new healthy recipe",
    icon: UtensilsCrossed,
    href: "/admin/recipes/new",
    color: "bg-orange-500",
  },
  {
    title: "Add Video",
    description: "Embed a YouTube video",
    icon: Video,
    href: "/admin/videos/new",
    color: "bg-red-500",
  },
  {
    title: "Generate AI Post",
    description: "Create content with AI",
    icon: Sparkles,
    href: "/admin/posts/new?ai=true",
    color: "bg-purple-500",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold font-poppins">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your site.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div
                    className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-4`}
                  >
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Affiliate Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Posts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Posts</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/posts">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No posts yet</p>
              <Button className="mt-4" asChild>
                <Link href="/admin/posts/new">Create First Post</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Performance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Affiliate Performance</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/affiliates">Manage</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No affiliate links configured</p>
              <Button className="mt-4" asChild>
                <Link href="/admin/affiliates">Add Affiliate Link</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Generation Info */}
      <Card className="bg-gradient-wellness-soft border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">AI Content Generation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Automated daily blog posts are currently disabled. Enable them
                in settings to automatically generate SEO-optimized nutrition
                and health content.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/settings">Configure AI Settings</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
