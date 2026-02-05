import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Heart, Menu, X, BookOpen, MessageCircle } from "lucide-react";
import { useState } from "react";
import { AuthDialog } from "./AuthDialog";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const { user, isAuthenticated, logout } = useFirebaseAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container py-4 flex items-center justify-between">
        <Link href="/">
          <span className="flex items-center gap-2 text-2xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
            <Heart className="w-7 h-7 text-primary fill-primary" />
            <span className="font-['Playfair_Display']">invites.kz</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <BookOpen className="w-4 h-4 mr-2" />
              {t("header.blog")}
            </Button>
          </Link>
          <a href="https://t.me/bookmekz" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              Поддержка
            </Button>
          </a>
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user?.displayName || user?.email}
              </span>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  {t("header.dashboard")}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setAuthDialogOpen(true)}>
                {t("header.login")}
              </Button>
              <Button size="sm" onClick={() => setAuthDialogOpen(true)}>
                {t("header.register")}
              </Button>
            </>
          )}
        </div>

        {/* Mobile: Language Switcher + Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button
            className="p-2 hover:bg-accent rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="container py-6 flex flex-col gap-3">
            <Link href="/blog">
              <Button variant="ghost" size="lg" className="w-full h-12" onClick={() => setMobileMenuOpen(false)}>
                <BookOpen className="w-5 h-5 mr-3" />
                {t("header.blog")}
              </Button>
            </Link>
            <a href="https://t.me/bookmekz" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="lg" className="w-full h-12" onClick={() => setMobileMenuOpen(false)}>
                <MessageCircle className="w-5 h-5 mr-3" />
                Поддержка
              </Button>
            </a>
            {isAuthenticated ? (
              <>
                <div className="text-sm text-muted-foreground py-3 border-b border-border/50 text-center">
                  {user?.displayName || user?.email}
                </div>
                <Link href="/dashboard">
                  <Button variant="outline" size="lg" className="w-full h-12" onClick={() => setMobileMenuOpen(false)}>
                    {t("header.dashboard")}
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="w-full h-12" 
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Выйти
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="w-full h-12"
                  onClick={() => {
                    setAuthDialogOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  {t("header.login")}
                </Button>
                <Button 
                  size="lg"
                  className="w-full h-12"
                  onClick={() => {
                    setAuthDialogOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  {t("header.register")}
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
      />
    </header>
  );
}

