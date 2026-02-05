import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Heart, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles, 
  Image, 
  Music, 
  Video, 
  Palette, 
  Users,
  Gift,
  MessageCircle,
  Calendar,
  Snowflake,
  PartyPopper,
  Shield,
  Clock,
  Zap,
  Crown,
  Loader2
} from "lucide-react";
import { Link, useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function UpgradePremium() {
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute("/upgrade/:weddingId");
  const [, setLocation] = useLocation();
  const weddingId = params?.weddingId ? parseInt(params.weddingId) : 0;
  const [isActivating, setIsActivating] = useState(false);

  const { data: wedding } = trpc.wedding.myWeddings.useQuery(undefined, {
    enabled: isAuthenticated,
    select: (weddings) => weddings.find((w) => w.id === weddingId),
  });

  // Get AI package status for this invitation
  const { data: packageStatus } = trpc.ai.getPackageStatus.useQuery(
    { weddingId },
    { enabled: isAuthenticated && weddingId > 0 }
  );

  // Get pricing info for promo
  const { data: pricingInfo } = trpc.payment.getPricingInfo.useQuery();

  const paymentMutation = trpc.payment.createPremiumPayment.useMutation({
    onSuccess: (data) => {
      // Redirect to FreedomPay payment page
      window.location.href = data.redirectUrl;
    },
    onError: (error: any) => {
      toast.error(error.message || "Ошибка при создании платежа");
    },
  });

  // Free activation for AI package owners
  const freeActivationMutation = trpc.payment.activateFreeWithAIPackage.useMutation({
    onSuccess: () => {
      toast.success("Приглашение опубликовано!");
      setLocation(wedding?.isAI ? `/manage-ai/${wedding.slug}` : `/manage/${wedding?.slug}`);
    },
    onError: (error: any) => {
      toast.error(error.message || "Ошибка активации");
      setIsActivating(false);
    },
  });

  // AI Package purchase
  const purchasePackageMutation = trpc.ai.purchasePackage.useMutation({
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
    onError: (error: any) => {
      toast.error(error.message || "Ошибка при создании платежа");
    },
  });

  const handleUpgrade = () => {
    paymentMutation.mutate({ weddingId });
  };

  const handleFreeActivation = () => {
    setIsActivating(true);
    freeActivationMutation.mutate({ weddingId });
  };

  const handleBuyPackage = (packageId: 'start' | 'pro' | 'unlimited') => {
    purchasePackageMutation.mutate({ weddingId, packageId });
  };

  const hasAIPackage = packageStatus?.hasPackage;

  if (!isAuthenticated || !wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Приглашение не найдено</CardTitle>
            <CardDescription>
              Проверьте правильность ссылки
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

  if (wedding.isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Уже оплачено!
            </CardTitle>
            <CardDescription>
              Это приглашение уже опубликовано
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/manage/${wedding.slug}`}>
              <Button className="w-full">Вернуться к управлению</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const remainingPromoSlots = pricingInfo?.remainingPromoSlots || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl" />
        {/* Snowflakes for New Year */}
        {pricingInfo?.isPromo && (
          <>
            <Snowflake className="absolute top-[15%] left-[10%] w-6 h-6 text-white/10 animate-pulse" />
            <Snowflake className="absolute top-[25%] right-[15%] w-8 h-8 text-white/10 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <Snowflake className="absolute top-[45%] left-[20%] w-5 h-5 text-white/10 animate-pulse" style={{ animationDelay: '1s' }} />
            <Snowflake className="absolute bottom-[30%] right-[25%] w-7 h-7 text-white/10 animate-pulse" style={{ animationDelay: '1.5s' }} />
          </>
        )}
      </div>

      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-3 sm:py-4 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-white hover:text-primary transition-colors cursor-pointer">
              <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-primary fill-primary" />
              <span className="font-['Playfair_Display'] hidden sm:inline">Invites.kz</span>
            </span>
          </Link>
          <Link href={wedding.isAI ? `/manage-ai/${wedding.slug}` : `/manage/${wedding.slug}`}>
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Назад</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-8 sm:py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-10 sm:mb-16">
            {/* Promo Banner */}
            {pricingInfo?.isPromo && (
              <div className="mb-6 sm:mb-8">
                <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <PartyPopper className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                    <span className="text-amber-200 font-bold text-sm sm:text-base">Акция февраля!</span>
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-amber-500/30" />
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm sm:text-base">Осталось</span>
                    <span className="px-2 py-1 rounded-lg bg-amber-500/30 text-amber-300 font-bold text-lg">
                      {remainingPromoSlots}
                    </span>
                    <span className="text-white font-medium text-sm sm:text-base">из 100 мест</span>
                  </div>
                </div>
              </div>
            )}

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Опубликуйте ваше
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                приглашение
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto px-4">
              После оплаты ваша страница станет доступна гостям по уникальной ссылке
            </p>
          </div>

          {/* AI Package - Free Publication */}
          {hasAIPackage && (
            <div className="max-w-lg mx-auto mb-12 sm:mb-16 px-4">
              <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-green-900/50 via-emerald-900/50 to-green-900/50 border-green-500/50">
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold shadow-lg">
                  ✓ БЕСПЛАТНО
                </div>
                
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl text-white">Публикация включена!</CardTitle>
                  <CardDescription className="text-green-300">
                    У вас есть AI-пакет {packageStatus?.package?.toUpperCase()} — публикация бесплатна
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="text-center pb-8">
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center justify-center gap-2 sm:gap-3">
                      <span className="text-4xl sm:text-5xl font-bold text-green-400 line-through opacity-50">
                        990 ₸
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mt-2">
                      <span className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        0
                      </span>
                      <span className="text-2xl sm:text-3xl text-green-400 font-medium">₸</span>
                    </div>
                    <p className="text-green-400/80 text-sm mt-2 flex items-center justify-center gap-1">
                      <Sparkles className="w-4 h-4" />
                      Публикация включена в ваш AI-пакет
                    </p>
                  </div>

                  <ul className="space-y-3 text-left mb-8 px-2 sm:px-4">
                    <BenefitItem text="Публикация по уникальной ссылке" />
                    <BenefitItem text="Доступ для всех гостей 24/7" />
                    <BenefitItem text="RSVP, Wishlist, Пожелания" />
                    <BenefitItem text="Галерея фото и музыка" />
                    <BenefitItem text="Бессрочный доступ" />
                  </ul>

                  <Button
                    size="lg"
                    className="w-full text-base sm:text-lg py-5 sm:py-6 font-semibold shadow-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    onClick={handleFreeActivation}
                    disabled={isActivating}
                  >
                    {isActivating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Публикация...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Опубликовать бесплатно
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* No AI Package - Show options */}
          {!hasAIPackage && (
            <div className="max-w-4xl mx-auto mb-12 sm:mb-16 px-4">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Option 1: Pay 990 for publication only */}
                <Card className={`relative overflow-hidden border-2 ${
                  pricingInfo?.isPromo 
                    ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-amber-500/50' 
                    : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-600/50'
                }`}>
                  {pricingInfo?.isPromo && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-bold shadow-lg">
                      -80%
                    </div>
                  )}
                  
                  <CardHeader className="text-center pt-6 pb-2">
                    <CardTitle className="text-lg sm:text-xl text-white">Только публикация</CardTitle>
                    <CardDescription className="text-slate-400">
                      Без AI-функций
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center pb-6">
                    <div className="mb-4">
                      {pricingInfo?.isPromo ? (
                        <>
                          <div className="text-lg text-slate-500 line-through">4 990 ₸</div>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">990</span>
                            <span className="text-xl text-amber-400">₸</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl font-bold text-white">990</span>
                          <span className="text-xl text-slate-400">₸</span>
                        </div>
                      )}
                    </div>

                    <ul className="space-y-2 text-left mb-6 text-sm">
                      <BenefitItem text="Публикация приглашения" />
                      <BenefitItem text="RSVP, Wishlist, Пожелания" />
                      <BenefitItem text="Бессрочный доступ" />
                    </ul>

                    <Button
                      size="lg"
                      className={`w-full py-4 font-semibold ${
                        pricingInfo?.isPromo 
                          ? 'bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600' 
                          : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800'
                      }`}
                      onClick={handleUpgrade}
                      disabled={paymentMutation.isPending}
                    >
                      {paymentMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Оплата...
                        </>
                      ) : (
                        <>Оплатить {pricingInfo?.isPromo ? '990' : '990'} ₸</>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Option 2: Buy AI Package (includes free publication) */}
                <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-purple-900/50 border-purple-500/50">
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] sm:text-xs font-bold shadow-lg">
                    ⭐ ТОП
                  </div>
                  
                  <CardHeader className="text-center pt-6 pb-2">
                    <CardTitle className="text-lg sm:text-xl text-white flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      AI-пакет
                    </CardTitle>
                    <CardDescription className="text-purple-300">
                      Публикация + AI-редактор
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="text-center pb-6">
                    <div className="space-y-3 mb-4">
                      {/* AI START */}
                      <button
                        onClick={() => handleBuyPackage('start')}
                        disabled={purchasePackageMutation.isPending}
                        className="w-full p-3 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold">AI START</div>
                            <div className="text-purple-300 text-sm">15 AI-правок</div>
                          </div>
                          <div className="text-right">
                            <div className="text-purple-400 font-bold">1 990 ₸</div>
                            <div className="text-green-400 text-xs">+ публикация</div>
                          </div>
                        </div>
                      </button>

                      {/* AI PRO */}
                      <button
                        onClick={() => handleBuyPackage('pro')}
                        disabled={purchasePackageMutation.isPending}
                        className="w-full p-3 rounded-lg border-2 border-purple-500/50 bg-purple-500/20 hover:bg-purple-500/30 transition-colors text-left ring-2 ring-purple-500/30"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold flex items-center gap-2">
                              AI PRO
                              <Badge className="bg-purple-500 text-white text-[10px]">Популярный</Badge>
                            </div>
                            <div className="text-purple-300 text-sm">50 AI-правок</div>
                          </div>
                          <div className="text-right">
                            <div className="text-purple-400 font-bold">3 990 ₸</div>
                            <div className="text-green-400 text-xs">+ публикация</div>
                          </div>
                        </div>
                      </button>

                      {/* AI UNLIMITED */}
                      <button
                        onClick={() => handleBuyPackage('unlimited')}
                        disabled={purchasePackageMutation.isPending}
                        className="w-full p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-semibold flex items-center gap-2">
                              <Crown className="w-4 h-4 text-amber-400" />
                              AI UNLIMITED
                            </div>
                            <div className="text-amber-300 text-sm">200 AI-правок</div>
                          </div>
                          <div className="text-right">
                            <div className="text-amber-400 font-bold">6 990 ₸</div>
                            <div className="text-green-400 text-xs">+ публикация</div>
                          </div>
                        </div>
                      </button>
                    </div>

                    <ul className="space-y-2 text-left mb-4 text-sm">
                      <BenefitItem text="Публикация БЕСПЛАТНО" />
                      <BenefitItem text="AI создаёт уникальный дизайн" />
                      <BenefitItem text="Редактирование через чат" />
                    </ul>

                    <p className="text-purple-300/60 text-xs">
                      При покупке AI-пакета публикация включена
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Features Grid */}
          <div className="mb-12 sm:mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8 text-center">
              Что получите после оплаты
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="RSVP система"
                description="Гости подтвердят присутствие онлайн"
              />
              <FeatureCard
                icon={<Gift className="w-6 h-6" />}
                title="Wishlist подарков"
                description="Создайте список желаемых подарков"
              />
              <FeatureCard
                icon={<MessageCircle className="w-6 h-6" />}
                title="Пожелания гостей"
                description="Соберите тёплые слова от близких"
              />
              <FeatureCard
                icon={<Image className="w-6 h-6" />}
                title="Фотогалерея"
                description="Добавьте неограниченно фотографий"
              />
              <FeatureCard
                icon={<Music className="w-6 h-6" />}
                title="Фоновая музыка"
                description="Создайте атмосферу с любимой песней"
              />
              <FeatureCard
                icon={<Palette className="w-6 h-6" />}
                title="Кастомизация"
                description="Выберите цвета, шрифты и стиль"
              />
            </div>
          </div>

          {/* Final CTA - only show if no AI package */}
          {!hasAIPackage && (
            <div className="text-center px-4">
              <Card className={`${
                pricingInfo?.isPromo 
                  ? 'bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30' 
                  : 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border-purple-500/30'
              } border`}>
                <CardContent className="py-8 sm:py-10">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                    💡 Совет: выберите AI-пакет
                  </h3>
                  <p className="text-slate-400 mb-6 text-sm sm:text-base">
                    С AI-пакетом вы получите бесплатную публикацию + возможность создавать уникальные дизайны через AI
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      onClick={() => handleBuyPackage('pro')}
                      disabled={purchasePackageMutation.isPending}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      AI PRO — 3990₸
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-slate-300">
      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
        <CheckCircle className="w-3.5 h-3.5 text-green-400" />
      </div>
      <span className="text-sm sm:text-base">{text}</span>
    </li>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-purple-500/30 transition-colors">
      <CardHeader className="pb-2">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-purple-400 mb-3">
          {icon}
        </div>
        <CardTitle className="text-base sm:text-lg text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-slate-400 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
