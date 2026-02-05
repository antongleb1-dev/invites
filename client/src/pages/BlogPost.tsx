import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import TableOfContents from "@/components/blog/TableOfContents";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Tag, Share2, Heart } from "lucide-react";
import { getPostBySlug, getRelatedPosts } from "../../../blog/posts";
import { BLOG_CATEGORIES } from "@shared/blog";
import { marked } from "marked";
import { toast } from "sonner";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug || "";
  const { language, setLanguage } = useLanguage();
  
  const post = getPostBySlug(slug);
  const relatedPosts = post ? getRelatedPosts(slug, 3) : [];

  useEffect(() => {
    if (post) {
      const title = language === 'kk' && post.titleKz ? post.titleKz : post.title;
      document.title = `${title} | Invites.kz`;
    }
  }, [post, language]);

  const handleShare = async () => {
    const url = `https://invites.kz/blog/${slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.description,
          url,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(url);
      toast.success(language === 'kk' ? 'Сілтеме көшірілді' : 'Ссылка скопирована');
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'kk' ? 'Мақала табылмады' : 'Статья не найдена'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'kk' ? 'Блогқа оралу' : 'Вернуться в блог'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const title = language === 'kk' && post.titleKz ? post.titleKz : post.title;
  const description = language === 'kk' && post.descriptionKz ? post.descriptionKz : post.description;
  const categoryName = language === 'kk' 
    ? BLOG_CATEGORIES[post.category].nameKz 
    : BLOG_CATEGORIES[post.category].name;

  // Render Markdown content
  const htmlContent = post.content ? marked(post.content) : '';

  return (
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
            <div className="flex items-center gap-1 bg-accent/20 rounded-lg p-1">
              <Button
                variant={language === "ru" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLanguage("ru")}
                className="text-xs px-3 py-1 h-7"
              >
                Рус
              </Button>
              <Button
                variant={language === "kk" ? "default" : "ghost"}
                size="sm"
                onClick={() => setLanguage("kk")}
                className="text-xs px-3 py-1 h-7"
              >
                Қаз
              </Button>
            </div>
            <Link href="/blog">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'kk' ? 'Блог' : 'Блог'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <article className="container py-12 max-w-4xl">
        {/* Article Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge>{categoryName}</Badge>
            {post.readTime && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime} {language === 'kk' ? 'мин' : 'мин'}
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{description}</p>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString(language === 'kk' ? 'kk-KZ' : 'ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span>•</span>
              <span>{post.author}</span>
            </div>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              {language === 'kk' ? 'Бөлісу' : 'Поделиться'}
            </Button>
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map(tag => (
                <Badge key={tag} variant="outline">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Cover Image */}
        {post.image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={post.image}
              alt={title}
              className="w-full aspect-video object-cover"
            />
          </div>
        )}

        {/* Table of Contents */}
        {post.content && (
          <div className="mb-8">
            <TableOfContents content={post.content} />
          </div>
        )}

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none mb-12 prose-headings:scroll-mt-20 prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-4 prose-p:text-lg prose-p:leading-relaxed prose-p:mb-6 prose-strong:text-foreground prose-strong:font-semibold"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-6">
              {language === 'kk' ? 'Ұқсас мақалалар' : 'Похожие статьи'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map(relatedPost => {
                const relatedTitle = language === 'kk' && relatedPost.titleKz 
                  ? relatedPost.titleKz 
                  : relatedPost.title;
                
                return (
                  <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                      {relatedPost.image && (
                        <div className="aspect-video overflow-hidden rounded-t-lg">
                          <img
                            src={relatedPost.image}
                            alt={relatedTitle}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-base line-clamp-2">{relatedTitle}</CardTitle>
                      </CardHeader>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

