import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Tag, Heart } from "lucide-react";
import { getAllPosts } from "../../../blog/posts";
import { BLOG_CATEGORIES, type BlogCategory } from "@shared/blog";
import { useEffect } from "react";

export default function BlogList() {
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');
  const [language, setLanguage] = useState<'ru' | 'kz'>('ru');

  const allPosts = getAllPosts();
  const filteredPosts = selectedCategory === 'all' 
    ? allPosts 
    : allPosts.filter(post => post.category === selectedCategory);

  const categories: Array<BlogCategory | 'all'> = ['all', 'weddings', 'traditions', 'tips', 'ideas'];

  const getCategoryName = (cat: BlogCategory | 'all') => {
    if (cat === 'all') return language === 'kz' ? 'Барлығы' : 'Все';
    return language === 'kz' ? BLOG_CATEGORIES[cat].nameKz : BLOG_CATEGORIES[cat].name;
  };

  // Set page title for SEO
  useEffect(() => {
    document.title = 'Блог о свадьбах | Invites.kz';
  }, []);

  return (
    <>

      <div className="min-h-screen bg-gradient-to-b from-background to-accent/10">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors">
                <Heart className="w-6 h-6 text-primary fill-primary" />
                <span className="font-['Playfair_Display']">Invites.kz</span>
              </a>
            </Link>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'ru' ? 'kz' : 'ru')}
              >
                {language === 'ru' ? 'ҚАЗ' : 'РУС'}
              </Button>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  {language === 'kz' ? 'Менің тойларым' : 'Мои свадьбы'}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="container py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              {language === 'kz' ? 'Той туралы блог' : 'Блог о свадьбах'}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {language === 'kz' 
                ? 'Қазақтың үйлену дәстүрлері, той ұйымдастыру бойынша кеңестер және шығармашылық идеялар'
                : 'Казахские свадебные традиции, советы по организации и креативные идеи'}
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
                size="sm"
              >
                {getCategoryName(cat)}
              </Button>
            ))}
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => {
              const title = language === 'kz' && post.titleKz ? post.titleKz : post.title;
              const description = language === 'kz' && post.descriptionKz ? post.descriptionKz : post.description;
              const categoryName = language === 'kz' 
                ? BLOG_CATEGORIES[post.category].nameKz 
                : BLOG_CATEGORIES[post.category].name;

              return (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {post.image && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={post.image}
                          alt={title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{categoryName}</Badge>
                        {post.readTime && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime} {language === 'kz' ? 'мин' : 'мин'}
                          </span>
                        )}
                      </div>
                      <CardTitle className="line-clamp-2">{title}</CardTitle>
                      <CardDescription className="line-clamp-2">{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString(language === 'kz' ? 'kk-KZ' : 'ru-RU')}
                        </span>
                      </div>
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {post.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {language === 'kz' ? 'Мақалалар табылмады' : 'Статьи не найдены'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

