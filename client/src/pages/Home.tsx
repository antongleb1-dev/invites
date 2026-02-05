import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { Heart, Calendar, Gift, MessageCircle, Sparkles, CheckCircle, Music, Palette, ImageIcon, Wand2, Send, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthDialog } from "@/components/AuthDialog";
import WeddingExamples from "@/components/WeddingExamples";
import Testimonials from "@/components/Testimonials";
import { useState, useRef } from "react";

// Event type suggestions with translation keys
const eventSuggestions = [
  { emoji: "💒", key: "wedding" },
  { emoji: "🎂", key: "birthday" },
  { emoji: "👶", key: "sundetToi" },
  { emoji: "🏢", key: "corporate" },
  { emoji: "🎉", key: "anniversary" },
  { emoji: "🎄", key: "newYear" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [, setLocation] = useLocation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();

  // Handle AI Box submit - no auth required, guest mode supported
  const handleAiSubmit = () => {
    if (!aiPrompt.trim()) return;
    
    // Save prompt to localStorage for later use
    localStorage.setItem('bookme_ai_prompt', aiPrompt);
    
    // Go directly to AI editor - auth will be requested when saving/sharing
    setLocation('/create-ai');
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: typeof eventSuggestions[0]) => {
    const label = t(`home.ai.suggestion.${suggestion.key}`);
    const promptSuffix = t("home.ai.suggestionPrompt");
    const prompt = `${label} - ${promptSuffix}`;
    setAiPrompt(prompt);
    textareaRef.current?.focus();
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAiSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-accent/20">
      {/* Header */}
      <Header />

      {/* Hero Section with AI Box */}
      <section className="py-12 md:py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 text-purple-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              {t("home.ai.badge")}
            </div>
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
              {t("home.ai.title")}{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{t("home.ai.titleHighlight")}</span>
              {" "}{t("home.ai.titleEnd")}
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.ai.description")}
            </p>

            {/* AI Box */}
            <div className="max-w-2xl mx-auto pt-4">
              <div className="relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl" style={{ padding: '1px' }}>
                  <div className="absolute inset-[1px] bg-card rounded-2xl" />
                </div>
                
                {/* Input area */}
                <div className="relative p-4">
                  <Textarea
                    ref={textareaRef}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t("home.ai.placeholder")}
                    className="min-h-[80px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/60 pr-14"
                    rows={2}
                  />
                  
                  {/* Send button */}
                  <Button
                    onClick={handleAiSubmit}
                    disabled={!aiPrompt.trim()}
                    size="icon"
                    className="absolute right-4 bottom-4 h-10 w-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Suggestions */}
                <div className="relative border-t border-border/50 px-4 py-3 bg-muted/30">
                  <div className="flex flex-wrap gap-2">
                    {eventSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.key}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 text-sm transition-all"
                      >
                        <span>{suggestion.emoji}</span>
                        <span>{t(`home.ai.suggestion.${suggestion.key}`)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alternative - Classic editor card */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
                {/* AI Editor - current path indicator */}
                <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-300 rounded-xl p-4 text-left">
                  <div className="absolute -top-2 left-4 px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded-full">
                    {t("home.ai.recommended")}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Wand2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-foreground">{t("home.ai.aiEditorTitle")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t("home.ai.aiEditorDesc")}</p>
                </div>

                {/* Classic Editor card */}
                {isAuthenticated ? (
                  <Link href="/create" className="block">
                    <div className="h-full bg-card border border-border rounded-xl p-4 text-left hover:border-purple-300 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                          <Palette className="w-4 h-4 text-muted-foreground group-hover:text-purple-600" />
                        </div>
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          {t("home.ai.classicEditorTitle")}
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{t("home.ai.classicEditorDesc")}</p>
                    </div>
                  </Link>
                ) : (
                  <Link href="/start" className="block w-full text-left">
                    <div className="h-full bg-card border border-border rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                          <Palette className="w-4 h-4 text-muted-foreground group-hover:text-purple-600" />
                        </div>
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          {t("home.ai.classicEditorTitle")}
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{t("home.ai.classicEditorDesc")}</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("home.features.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("home.features.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title={t("home.features.rsvp.title")}
              description={t("home.features.rsvp.description")}
            />
            <FeatureCard
              icon={<Gift className="w-8 h-8" />}
              title={t("home.features.wishlist.title")}
              description={t("home.features.wishlist.description")}
            />
            <FeatureCard
              icon={<MessageCircle className="w-8 h-8" />}
              title={t("home.features.wishes.title")}
              description={t("home.features.wishes.description")}
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title={t("home.features.bilingual.title")}
              description={t("home.features.bilingual.description")}
            />
            <FeatureCard
              icon={<Music className="w-8 h-8" />}
              title={t("home.features.music.title")}
              description={t("home.features.music.description")}
            />
            <FeatureCard
              icon={<Palette className="w-8 h-8" />}
              title={t("home.features.templates.title")}
              description={t("home.features.templates.description")}
            />
            <FeatureCard
              icon={<ImageIcon className="w-8 h-8" />}
              title={t("home.features.customDesign.title")}
              description={t("home.features.customDesign.description")}
            />
          </div>
        </div>
      </section>

      {/* Pricing section removed - payment only required before publishing */}

      {/* Wedding Examples Section */}
      <WeddingExamples />

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("home.cta.ready")}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            {t("home.cta.aiDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAuthenticated ? (
              <Link href="/create-ai">
                <Button size="lg" className="text-base px-6 py-5 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Wand2 className="w-5 h-5 mr-2" />
                  {t("home.cta.createWithAi")}
                </Button>
              </Link>
            ) : (
              <Button 
                size="lg" 
                className="text-base px-6 py-5 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => setAuthDialogOpen(true)}
              >
                <Wand2 className="w-5 h-5 mr-2" />
                {t("home.cta.startFree")}
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        onSuccess={() => {
          setAuthDialogOpen(false);
          // Check if there's a specific redirect path
          const redirectPath = localStorage.getItem('bookme_redirect_after_auth');
          if (redirectPath) {
            localStorage.removeItem('bookme_redirect_after_auth');
            window.location.href = redirectPath;
          } else {
            // Default: go to AI editor (prompt is saved in localStorage)
            window.location.href = '/create-ai';
          }
        }}
      />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingFeature({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2">
      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
      <span className="text-foreground">{text}</span>
    </li>
  );
}

