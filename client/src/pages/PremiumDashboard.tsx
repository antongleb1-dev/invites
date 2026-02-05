import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Palette, Layout, Blocks, CheckCircle2, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";

export default function PremiumDashboard() {
  const [, params] = useRoute("/premium-dashboard/:slug");
  const slug = params?.slug || "";

  const { data: wedding, isLoading } = trpc.wedding.getBySlug.useQuery({ slug });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Свадьба не найдена</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/my-weddings">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться к списку
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All users now have access to premium features
  // Payment is only required for publication

  const features = [
    {
      title: "Дизайн и кастомизация",
      description: "Настройте шрифты, цвета и тему оформления вашего приглашения",
      icon: Palette,
      href: `/edit-premium/${slug}`,
      status: wedding.customFont || wedding.customColor || wedding.themeColor 
        ? "Настроено" 
        : "Не настроено",
      configured: !!(wedding.customFont || wedding.customColor || wedding.themeColor),
      details: [
        wedding.customFont && `Шрифт: ${wedding.customFont}`,
        wedding.customColor && `Цвет акцента: ${wedding.customColor}`,
        wedding.themeColor && `Цвет темы: ${wedding.themeColor}`,
      ].filter(Boolean),
    },
    {
      title: "Эксклюзивные шаблоны",
      description: "Выберите один из 5 эксклюзивных шаблонов с казахскими орнаментами",
      icon: Layout,
      href: `/select-template/${wedding.id}`,
      status: wedding.templateId && wedding.templateId !== 'classic'
        ? "Выбран шаблон" 
        : "Классический шаблон",
      configured: !!(wedding.templateId && wedding.templateId !== 'classic'),
      details: wedding.templateId && wedding.templateId !== 'classic' 
        ? [`Шаблон: ${wedding.templateId}`]
        : [],
    },
    {
      title: "Конструктор блоков",
      description: "Добавьте программу мероприятия, меню, дресс-код и другие блоки",
      icon: Blocks,
      href: `/premium-blocks/${wedding.id}`,
      status: (wedding.showTimeline || wedding.showMenu || wedding.showDressCode || 
              wedding.showCoordinator || wedding.showQrCode || wedding.showLocationDetails)
        ? "Блоки добавлены"
        : "Блоки не добавлены",
      configured: !!(wedding.showTimeline || wedding.showMenu || wedding.showDressCode || 
                     wedding.showCoordinator || wedding.showQrCode || wedding.showLocationDetails),
      details: [
        wedding.showTimeline && "✓ Программа мероприятия",
        wedding.showMenu && "✓ Меню",
        wedding.showDressCode && "✓ Дресс-код",
        wedding.showCoordinator && "✓ Контакты координатора",
        wedding.showQrCode && "✓ QR-код",
        wedding.showLocationDetails && "✓ Информация о локации",
      ].filter(Boolean),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/10">
      <Header />

      <div className="container py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/manage/${slug}`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад к управлению
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Настройки дизайна</h1>
              <p className="text-xl text-muted-foreground">
                Настройте все функции вашего приглашения
              </p>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <Link href={feature.href}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary">
                        <Icon className="w-6 h-6" />
                      </div>
                      {feature.configured && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={feature.configured ? "default" : "outline"}
                          className="text-xs"
                        >
                          {feature.status}
                        </Badge>
                      </div>
                      
                      {feature.details.length > 0 && (
                        <div className="space-y-1">
                          {feature.details.map((detail, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground">
                              {detail}
                            </p>
                          ))}
                        </div>
                      )}

                      <Button 
                        variant="ghost" 
                        className="w-full justify-between group-hover:bg-accent"
                      >
                        {feature.configured ? "Изменить" : "Настроить"}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>

        {/* Quick Tips */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">💡 Советы по настройке</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Начните с шаблона:</strong> Выберите один из шаблонов с казахскими орнаментами для быстрого старта</p>
            <p>• <strong>Настройте цвета:</strong> Используйте цвета темы для создания единого стиля всего приглашения</p>
            <p>• <strong>Добавьте блоки:</strong> Программа мероприятия и меню помогут гостям лучше подготовиться к свадьбе</p>
            <p>• <strong>Кастомные шрифты:</strong> Выберите красивый курсивный шрифт с поддержкой казахского алфавита</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

