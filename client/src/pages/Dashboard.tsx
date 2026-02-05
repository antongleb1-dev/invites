import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Heart, Plus, Calendar, MapPin, ExternalLink, Loader2, Sparkles, Wand2, Settings, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { AuthDialog } from "@/components/AuthDialog";
import { useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const { data: weddings, isLoading } = trpc.wedding.myWeddings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Требуется авторизация</CardTitle>
            <CardDescription>
              Пожалуйста, войдите в систему, чтобы увидеть свои приглашения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full"
              onClick={() => setAuthDialogOpen(true)}
            >
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <Link href="/">
              <span className="flex items-center gap-1.5 sm:gap-2 text-lg sm:text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary fill-primary flex-shrink-0" />
                <span className="font-['Playfair_Display'] hidden xs:inline">Invites.kz</span>
              </span>
            </Link>
            
            {/* Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* User name - hidden on mobile */}
              <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline max-w-[150px] truncate">
                {user?.name || user?.email}
              </span>
              
              {/* Create buttons */}
              <Link href="/create-ai">
                <Button size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">AI</span>
                </Button>
              </Link>
              <Link href="/create">
                <Button size="sm" variant="outline" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Создать</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Мои приглашения
          </h1>
          <p className="text-xl text-muted-foreground">
            Управляйте своими приглашениями на мероприятия
          </p>
        </div>

        {weddings && weddings.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">У вас пока нет приглашений</h2>
              <p className="text-muted-foreground mb-6">
                Создайте своё первое онлайн-приглашение
              </p>
              <Link href="/create">
                <Button size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Создать приглашение
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddings?.map((wedding) => (
              <Card key={wedding.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {wedding.backgroundImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={wedding.backgroundImage}
                      alt={wedding.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2">{wedding.title}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      {wedding.isAI && (
                        <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700">
                          <Wand2 className="w-3 h-3 mr-1" />
                          AI
                        </Badge>
                      )}
                      {wedding.isPaid && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          Оплачено
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                  <CardDescription className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(wedding.date).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{wedding.location}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!wedding.isPaid && (
                    <div className="pt-1">
                      <Link href={`/upgrade/${wedding.id}`}>
                        <Button className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Оплатить
                        </Button>
                      </Link>
                    </div>
                  )}
                  <div className="flex flex-col gap-3">
                    <a href={`/${wedding.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Открыть
                      </Button>
                    </a>
                    {/* Кнопка управления - разные страницы для AI и классических */}
                    <Link href={wedding.isAI ? `/manage-ai/${wedding.slug}` : `/manage/${wedding.slug}`}>
                      <Button variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Управление
                      </Button>
                    </Link>
                    {/* Кнопка редактирования - разная для AI и классических */}
                    {wedding.isAI ? (
                      <Link href={`/edit-ai/${wedding.id}`}>
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                          <Wand2 className="w-4 h-4 mr-2" />
                          Редактировать с AI
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/classic-editor/${wedding.id}`}>
                        <Button variant="secondary" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Редактировать
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        onSuccess={() => {
          setAuthDialogOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
}

