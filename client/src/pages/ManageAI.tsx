import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import {
  Heart,
  Loader2,
  Users,
  Gift,
  MessageCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Wand2,
  RefreshCw,
  Trash2,
  Check,
  X,
  ArrowLeft,
  Settings,
  Link2,
  Edit3,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function ManageAI() {
  const { isAuthenticated, user } = useAuth();
  const [, params] = useRoute("/manage-ai/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";

  // Settings editing state
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Fetch wedding data
  const { data: wedding, isLoading, refetch: refetchWedding } = trpc.wedding.getBySlug.useQuery({ slug });
  
  // Update wedding mutation
  const updateWeddingMutation = trpc.wedding.update.useMutation({
    onSuccess: (_, variables) => {
      toast.success("Настройки сохранены");
      setIsEditingSettings(false);
      refetchWedding();
      // If slug changed, redirect to new URL
      if (variables.slug && variables.slug !== slug) {
        setLocation(`/manage-ai/${variables.slug}`);
      }
    },
    onError: (error) => {
      // Parse Zod validation errors
      let errorMessage = "Ошибка сохранения";
      try {
        const parsed = JSON.parse(error.message);
        if (Array.isArray(parsed) && parsed.length > 0) {
          errorMessage = parsed[0].message || errorMessage;
        }
      } catch {
        errorMessage = error.message || errorMessage;
      }
      toast.error(errorMessage);
    },
  });

  // Initialize edit values when wedding loads
  useEffect(() => {
    if (wedding) {
      setEditTitle(wedding.title);
      setEditSlug(wedding.slug);
    }
  }, [wedding]);
  
  // Detect blocks in AI HTML
  const { data: blocks, refetch: refetchBlocks } = trpc.ai.detectBlocks.useQuery(
    { slug },
    { enabled: !!wedding }
  );
  
  // Fetch data only for detected blocks
  const { data: rsvps, refetch: refetchRsvps } = trpc.rsvp.list.useQuery(
    { weddingId: wedding?.id || 0 },
    { enabled: !!wedding && blocks?.hasRsvp }
  );
  
  const { data: wishlist, refetch: refetchWishlist } = trpc.wishlist.list.useQuery(
    { weddingId: wedding?.id || 0 },
    { enabled: !!wedding && blocks?.hasWishlist }
  );
  
  const { data: wishes, refetch: refetchWishes } = trpc.wish.listAll.useQuery(
    { weddingId: wedding?.id || 0 },
    { enabled: !!wedding && blocks?.hasWishes }
  );

  // Mutations
  const approveWishMutation = trpc.wish.approve.useMutation({
    onSuccess: () => {
      refetchWishes();
      toast.success("Пожелание одобрено");
    },
  });

  const deleteWishMutation = trpc.wish.delete.useMutation({
    onSuccess: () => {
      refetchWishes();
      toast.success("Пожелание удалено");
    },
  });

  // Refresh all data
  const handleRefresh = () => {
    refetchWedding();
    refetchBlocks();
    refetchRsvps();
    refetchWishlist();
    refetchWishes();
    toast.success("Данные обновлены");
  };

  // Save settings
  const handleSaveSettings = async () => {
    if (!wedding) return;
    
    // Validate
    if (!editTitle.trim()) {
      toast.error("Название не может быть пустым");
      return;
    }
    if (!editSlug.trim()) {
      toast.error("URL не может быть пустым");
      return;
    }
    
    // Clean slug
    const cleanSlug = editSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    
    setIsSavingSettings(true);
    try {
      await updateWeddingMutation.mutateAsync({
        id: wedding.id,
        title: editTitle.trim(),
        slug: cleanSlug,
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchRsvps();
      refetchWishlist();
      refetchWishes();
      refetchBlocks();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refetchRsvps, refetchWishlist, refetchWishes, refetchBlocks]);

  if (isLoading) {
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
              Войдите в систему для управления приглашениями
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">На главную</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Приглашение не найдено</CardTitle>
            <CardDescription>
              Приглашение с таким адресом не существует
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">Вернуться к списку</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check ownership
  if (wedding.userId !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Нет доступа</CardTitle>
            <CardDescription>
              У вас нет прав для управления этим приглашением
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">Вернуться к списку</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Count stats
  const rsvpYes = rsvps?.filter(r => r.attending !== 'no').length || 0;
  const rsvpNo = rsvps?.filter(r => r.attending === 'no').length || 0;
  const totalGuests = rsvps?.reduce((sum, r) => sum + (r.guestCount || 1), 0) || 0;
  const pendingWishes = wishes?.filter(w => !w.isApproved).length || 0;
  const reservedGifts = wishlist?.filter(w => w.isReserved).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left - Back + Logo + AI Badge */}
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
                  <span className="font-['Playfair_Display'] font-bold hidden sm:inline">Invites</span>
                </span>
              </Link>
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 text-xs">
                <Wand2 className="w-3 h-3 mr-0.5" />
                AI
              </Badge>
              {/* Title - hidden on mobile, shown on md+ */}
              <span className="hidden md:inline text-sm font-medium text-muted-foreground truncate max-w-[200px]">
                {wedding.title}
              </span>
            </div>
            
            {/* Right - Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 w-8 sm:h-8 sm:w-auto sm:px-2 p-0">
                <RefreshCw className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline text-xs">Обновить</span>
              </Button>
              <a href={`/${wedding.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                  <ExternalLink className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Открыть</span>
                </Button>
              </a>
              <Link href={`/edit-ai/${wedding.id}`}>
                <Button size="sm" className="h-8 px-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500">
                  <Wand2 className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Редактировать</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {blocks?.hasRsvp && (
            <>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{rsvpYes}</p>
                      <p className="text-sm text-muted-foreground">Придут</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{totalGuests}</p>
                      <p className="text-sm text-muted-foreground">Всего гостей</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          {blocks?.hasWishes && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{pendingWishes}</p>
                    <p className="text-sm text-muted-foreground">Новых пожеланий</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {blocks?.hasWishlist && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                    <Gift className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{reservedGifts}/{wishlist?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Подарков выбрано</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Настройки приглашения
              </CardTitle>
              {!isEditingSettings && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingSettings(true)}>
                  <Edit3 className="w-4 h-4 mr-1" />
                  Изменить
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditingSettings ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Название приглашения</Label>
                  <Input
                    id="edit-title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Например: Свадьба Айгуль и Нурлана"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-slug">URL приглашения</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">invites.kz/</span>
                    <Input
                      id="edit-slug"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                      placeholder="aigul-nurlan"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Только латинские буквы, цифры и дефис
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                    {isSavingSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Сохранить
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setIsEditingSettings(false);
                    setEditTitle(wedding?.title || "");
                    setEditSlug(wedding?.slug || "");
                  }}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Название</p>
                  <p className="font-medium">{wedding?.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ссылка</p>
                  <a 
                    href={`https://invites.kz/${wedding?.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Link2 className="w-4 h-4" />
                    invites.kz/{wedding?.slug}
                  </a>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Sections */}
        <div className="space-y-8">
          {/* RSVP Section */}
          {blocks?.hasRsvp && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  RSVP — Ответы гостей
                </CardTitle>
                <CardDescription>
                  {rsvps?.length || 0} ответов получено
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!rsvps || rsvps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Пока нет ответов от гостей</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rsvps.map((rsvp) => (
                      <div
                        key={rsvp.id}
                        className={`p-4 rounded-lg border ${
                          rsvp.attending === 'no' 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-lg">{rsvp.name}</p>
                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-muted-foreground">
                              {rsvp.phone && <span>📞 {rsvp.phone}</span>}
                              {rsvp.email && <span>✉️ {rsvp.email}</span>}
                              <span>👥 {rsvp.guestCount} чел.</span>
                            </div>
                            {rsvp.dietaryRestrictions && (
                              <p className="mt-2 text-sm">🍽️ {rsvp.dietaryRestrictions}</p>
                            )}
                          </div>
                          <Badge variant={rsvp.attending === 'no' ? 'destructive' : 'default'}>
                            {rsvp.attending === 'no' ? 'Не придёт' : 'Придёт'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Wishes Section */}
          {blocks?.hasWishes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Пожелания
                </CardTitle>
                <CardDescription>
                  {wishes?.length || 0} пожеланий получено
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!wishes || wishes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Пока нет пожеланий</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {wishes.map((wish) => (
                      <div
                        key={wish.id}
                        className={`p-4 rounded-lg border ${
                          wish.isApproved 
                            ? 'bg-background border-border' 
                            : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium">{wish.guestName}</p>
                              {!wish.isApproved && (
                                <Badge variant="outline" className="text-amber-600 border-amber-300">
                                  На модерации
                                </Badge>
                              )}
                            </div>
                            <p className="text-muted-foreground">{wish.message}</p>
                          </div>
                          <div className="flex gap-2">
                            {!wish.isApproved && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 hover:bg-green-50"
                                onClick={() => approveWishMutation.mutate({ id: wish.id, weddingId: wedding.id })}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => deleteWishMutation.mutate({ id: wish.id, weddingId: wedding.id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Wishlist Section */}
          {blocks?.hasWishlist && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Wishlist — Подарки
                </CardTitle>
                <CardDescription>
                  {reservedGifts} из {wishlist?.length || 0} подарков зарезервировано
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!wishlist || wishlist.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Wishlist пуст</p>
                    <p className="text-sm mt-2">Добавьте подарки через AI-редактор</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {wishlist.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-lg border ${
                          item.isReserved 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-background border-border'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                            {item.isReserved && item.reservedBy && (
                              <p className="text-sm text-green-600 mt-2">
                                ✓ Зарезервировано: {item.reservedBy}
                              </p>
                            )}
                          </div>
                          {item.isReserved ? (
                            <Badge className="bg-green-100 text-green-700">Выбран</Badge>
                          ) : (
                            <Badge variant="outline">Доступен</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* No blocks detected */}
          {!blocks?.hasRsvp && !blocks?.hasWishes && !blocks?.hasWishlist && (
            <Card>
              <CardContent className="py-12 text-center">
                <Wand2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Нет активных форм</h3>
                <p className="text-muted-foreground mb-6">
                  В этом AI-приглашении не обнаружены формы для сбора данных.
                  <br />
                  Добавьте RSVP, Wishlist или Пожелания через AI-редактор.
                </p>
                <Link href={`/edit-ai/${wedding.id}`}>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Открыть AI-редактор
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

