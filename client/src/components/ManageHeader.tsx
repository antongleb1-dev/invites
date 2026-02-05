import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, Menu, X, Edit, ExternalLink, ArrowLeft, Wand2, Sparkles } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";

interface ManageHeaderProps {
  wedding: {
    id: number;
    slug: string;
    isPaid: boolean;
    isAI?: boolean;
  };
}

export default function ManageHeader({ wedding }: ManageHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: pricingInfo } = trpc.payment.getPricingInfo.useQuery();

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left side - Back + Logo */}
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-auto sm:px-3 p-0">
                <ArrowLeft className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline text-xs">Назад</span>
              </Button>
            </Link>
            <Link href="/">
              <span className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors cursor-pointer">
                <Heart className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
                <span className="font-['Playfair_Display'] font-bold hidden sm:inline">invites</span>
              </span>
            </Link>
            {wedding.isAI && (
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 text-xs">
                <Wand2 className="w-3 h-3 mr-0.5" />
                AI
              </Badge>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {wedding.isAI ? (
              <Link href={`/edit-ai/${wedding.id}`}>
                <Button variant="outline" size="sm" className="h-8 text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                  <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                  Редактировать
                </Button>
              </Link>
            ) : (
              <Link href={`/classic-editor/${wedding.id}`}>
                <Button variant="default" size="sm" className="h-8 text-xs">
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Редактировать
                </Button>
              </Link>
            )}
            {!wedding.isPaid && (
              <Link href={`/upgrade/${wedding.id}`}>
                <Button variant="default" size="sm" className="h-8 text-xs bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  {pricingInfo?.isPromo ? "990₸" : "4990₸"}
                </Button>
              </Link>
            )}
            <a href={`/${wedding.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                Открыть
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-1.5 hover:bg-accent rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="container py-4 flex flex-col gap-2">
            {wedding.isAI ? (
              <Link href={`/edit-ai/${wedding.id}`}>
                <Button variant="outline" size="default" className="w-full justify-start h-11 bg-gradient-to-r from-purple-500/10 to-pink-500/10" onClick={() => setMobileMenuOpen(false)}>
                  <Wand2 className="w-4 h-4 mr-3" />
                  Редактировать с AI
                </Button>
              </Link>
            ) : (
              <Link href={`/classic-editor/${wedding.id}`}>
                <Button variant="default" size="default" className="w-full justify-start h-11" onClick={() => setMobileMenuOpen(false)}>
                  <Edit className="w-4 h-4 mr-3" />
                  Редактировать
                </Button>
              </Link>
            )}
            {!wedding.isPaid && (
              <Link href={`/upgrade/${wedding.id}`}>
                <Button variant="default" size="default" className="w-full justify-start h-11 bg-gradient-to-r from-primary to-accent hover:opacity-90" onClick={() => setMobileMenuOpen(false)}>
                  <Sparkles className="w-4 h-4 mr-3" />
                  {pricingInfo?.isPromo ? (
                    <span>Оплатить <span className="line-through opacity-60 mx-1">4990₸</span> 990₸</span>
                  ) : (
                    "Оплатить 4990₸"
                  )}
                </Button>
              </Link>
            )}
            <a href={`/${wedding.slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="default" className="w-full justify-start h-11" onClick={() => setMobileMenuOpen(false)}>
                <ExternalLink className="w-4 h-4 mr-3" />
                Открыть приглашение
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

