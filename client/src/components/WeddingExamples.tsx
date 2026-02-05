import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Calendar, MapPin, ExternalLink, Cake, Baby, Wand2, Palette, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const examples = [
  // AI-созданные приглашения (первые)
  {
    id: 1,
    slug: 'malikaaskar',
    eventType: 'wedding',
    editorType: 'ai',
    names: { ru: "Малика & Аскар", kk: "Малика & Асқар" },
    date: "2025",
    location: { ru: "Казахстан", kk: "Қазақстан" },
    theme: { ru: "Свадьба", kk: "Той" },
    description: { 
      ru: "Уникальное AI-приглашение с современным дизайном и интерактивными элементами",
      kk: "Заманауи дизайны мен интерактивті элементтері бар AI-шақыру"
    },
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    icon: Heart
  },
  {
    id: 2,
    slug: 'ai-1768103015847',
    eventType: 'anniversary',
    editorType: 'ai',
    names: { ru: "Юбилей 50 лет", kk: "50 жас мерейтойы" },
    date: "2025",
    location: { ru: "Казахстан", kk: "Қазақстан" },
    theme: { ru: "Юбилей", kk: "Мерейтой" },
    description: { 
      ru: "Торжественное AI-приглашение на юбилей с уникальным дизайном",
      kk: "Ерекше дизайны бар мерейтойға салтанатты AI-шақыру"
    },
    color: "from-emerald-500/20 to-teal-500/20",
    borderColor: "border-emerald-500/30",
    icon: Star
  },
  {
    id: 3,
    slug: 'tusau-keser-alihan',
    eventType: 'tusaukeser',
    editorType: 'ai',
    names: { ru: "Тұсау кесер Әліхан", kk: "Әліханның тұсау кесері" },
    date: "2025",
    location: { ru: "Казахстан", kk: "Қазақстан" },
    theme: { ru: "Тұсау кесер", kk: "Тұсау кесер" },
    description: { 
      ru: "Праздничное AI-приглашение на тұсау кесер с традиционными элементами",
      kk: "Дәстүрлі элементтері бар тұсау кесерге мерекелік AI-шақыру"
    },
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    icon: Baby
  },
  {
    id: 4,
    slug: 'madinawed',
    eventType: 'wedding',
    editorType: 'ai',
    names: { ru: "Мадина & ...", kk: "Мадина & ..." },
    date: "2025",
    location: { ru: "Казахстан", kk: "Қазақстан" },
    theme: { ru: "Свадьба", kk: "Той" },
    description: { 
      ru: "Элегантное свадебное приглашение с AI-дизайном",
      kk: "AI-дизайны бар талғампаз той шақыруы"
    },
    color: "from-rose-500/20 to-pink-500/20",
    borderColor: "border-rose-500/30",
    icon: Heart
  },
  {
    id: 5,
    slug: 'diasbday',
    eventType: 'birthday',
    editorType: 'ai',
    names: { ru: "День рождения Диаса", kk: "Диастың туған күні" },
    date: "2025",
    location: { ru: "Казахстан", kk: "Қазақстан" },
    theme: { ru: "День рождения", kk: "Туған күн" },
    description: { 
      ru: "Яркое AI-приглашение на день рождения с уникальным дизайном",
      kk: "Ерекше дизайны бар туған күнге жарқын AI-шақыру"
    },
    color: "from-orange-500/20 to-amber-500/20",
    borderColor: "border-orange-500/30",
    icon: Cake
  },
  // Классические приглашения (последние)
  {
    id: 6,
    slug: 'demo-aigerim-nurlan',
    eventType: 'wedding',
    editorType: 'classic',
    names: { ru: "Айгерім & Нұрлан", kk: "Айгерім & Нұрлан" },
    date: "15.08.2024",
    location: { ru: "Алматы", kk: "Алматы" },
    theme: { ru: "Свадьба", kk: "Той" },
    description: { 
      ru: "Элегантное приглашение с традиционными казахскими узорами и золотыми акцентами",
      kk: "Дәстүрлі қазақ ою-өрнектері мен алтын акценттері бар талғампаз шақыру"
    },
    color: "from-amber-500/20 to-yellow-500/20",
    borderColor: "border-amber-500/30",
    icon: Heart
  },
  {
    id: 7,
    slug: 'demo-anna-dmitry',
    eventType: 'wedding',
    editorType: 'classic',
    names: { ru: "Анна & Дмитрий", kk: "Анна & Дмитрий" },
    date: "22.09.2024",
    location: { ru: "Астана", kk: "Астана" },
    theme: { ru: "Свадьба", kk: "Той" },
    description: { 
      ru: "Минималистичный дизайн с акцентом на фотографии и чистые линии",
      kk: "Фотосуреттер мен таза сызықтарға баса назар аударатын минималистік дизайн"
    },
    color: "from-slate-500/20 to-gray-500/20",
    borderColor: "border-slate-500/30",
    icon: Heart
  },
];

export default function WeddingExamples() {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 bg-gradient-to-b from-background to-accent/10">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Heart className="w-4 h-4" />
            {t('examples.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('examples.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('examples.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {examples.map((example) => (
            <a key={example.id} target="_blank" rel="noopener noreferrer" href={`/${example.slug}`}>
              <Card 
                className={`group hover:shadow-xl transition-all duration-300 border-2 ${example.borderColor} bg-gradient-to-br ${example.color} hover:scale-105 cursor-pointer h-full`}
              >
                <CardContent className="p-6">
                  {/* Editor type badge */}
                  <div className="flex items-center justify-between mb-3">
                    {example.editorType === 'ai' ? (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 flex items-center gap-1">
                        <Wand2 className="w-3 h-3" />
                        AI
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 border-slate-400 text-slate-600">
                        <Palette className="w-3 h-3" />
                        {language === 'kz' ? 'Классикалық' : 'Классический'}
                      </Badge>
                    )}
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>

                  <div className="mb-3">
                    <h3 className="text-xl font-bold mb-2 font-['Playfair_Display']">
                      {example.names[language]}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {example.theme[language]}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {example.description[language]}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{example.location[language]}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-xs text-primary font-medium">
                      {example.icon && <example.icon className="w-3 h-3 fill-primary text-primary" />}
                      <span>{t('examples.viewExample')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            {t('examples.cta')}
          </p>
        </div>
      </div>
    </section>
  );
}

