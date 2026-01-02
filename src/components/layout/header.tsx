"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Blog", href: "/blog" },
  { name: "Recipes", href: "/recipes" },
  { name: "Videos", href: "/videos" },
  { name: "Nutrition Tips", href: "/nutrition-tips" },
  { name: "About", href: "/about" },
];

const categories = [
  { name: "Fitness", href: "/blog/category/fitness" },
  { name: "Cooking", href: "/blog/category/cooking" },
  { name: "Keto", href: "/blog/category/keto" },
  { name: "Clean Eating", href: "/blog/category/clean-eating" },
  { name: "Vegan", href: "/blog/category/vegan" },
  { name: "Yoga", href: "/blog/category/yoga" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gradient-wellness font-poppins">
              Women&apos;s Health Tips
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold text-muted-foreground mb-3">
                    Categories
                  </p>
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      onClick={() => setIsOpen(false)}
                      className="block py-2 text-muted-foreground hover:text-primary"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Categories Bar - Desktop */}
        <div className="hidden md:flex items-center space-x-4 pb-3 border-t pt-2">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
