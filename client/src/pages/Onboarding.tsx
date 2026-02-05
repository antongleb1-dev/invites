import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import Header from "@/components/Header";
import { AuthDialog } from "@/components/AuthDialog";
import { 
  Heart, 
  Calendar, 
  Baby, 
  Building, 
  PartyPopper, 
  Sparkles,
  Wand2,
  Palette,
  ArrowRight,
  ArrowLeft,
  Check
} from "lucide-react";

type EventType = "wedding" | "birthday" | "sundetToi" | "corporate" | "anniversary" | "other";
type EditorType = "ai" | "classic";

interface OnboardingData {
  eventType: EventType;
  editorType: EditorType;
  names: string;
  date: string;
}

const eventTypes: { type: EventType; icon: React.ReactNode; labelRu: string; labelKz: string }[] = [
  { type: "wedding", icon: <Heart className="w-6 h-6" />, labelRu: "Свадьба", labelKz: "Той" },
  { type: "birthday", icon: <Calendar className="w-6 h-6" />, labelRu: "День рождения", labelKz: "Туған күн" },
  { type: "sundetToi", icon: <Baby className="w-6 h-6" />, labelRu: "Сүндет той", labelKz: "Сүндет той" },
  { type: "corporate", icon: <Building className="w-6 h-6" />, labelRu: "Корпоратив", labelKz: "Корпоратив" },
  { type: "anniversary", icon: <PartyPopper className="w-6 h-6" />, labelRu: "Юбилей", labelKz: "Мерейтой" },
  { type: "other", icon: <Sparkles className="w-6 h-6" />, labelRu: "Другое", labelKz: "Басқа" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    eventType: "wedding",
    editorType: "ai",
    names: "",
    date: "",
  });

  const handleEventSelect = (type: EventType) => {
    setData({ ...data, eventType: type });
  };

  const handleEditorSelect = (type: EditorType) => {
    setData({ ...data, editorType: type });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save to localStorage and redirect
      const guestDraft = {
        ...data,
        createdAt: new Date().toISOString(),
        id: `guest_${Date.now()}`,
      };
      localStorage.setItem('bookme_guest_draft', JSON.stringify(guestDraft));
      
      if (data.editorType === "ai") {
        // For AI, save initial prompt - works without auth
        const eventLabel = eventTypes.find(e => e.type === data.eventType)?.[language === 'kz' ? 'labelKz' : 'labelRu'] || '';
        const prompt = data.names 
          ? `${eventLabel} - ${data.names}${data.date ? `, ${data.date}` : ''}`
          : eventLabel;
        localStorage.setItem('bookme_ai_prompt', prompt);
        setLocation('/create-ai');
      } else {
        // Classic editor requires auth
        if (!isAuthenticated) {
          localStorage.setItem('bookme_redirect_after_auth', '/create');
          setShowAuthDialog(true);
        } else {
          setLocation('/create');
        }
      }
    }
  };
  
  const handleAuthSuccess = () => {
    setShowAuthDialog(false);
    setLocation('/create');
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const texts = {
    ru: {
      step1Title: "Какое событие вы планируете?",
      step1Subtitle: "Выберите тип вашего мероприятия",
      step2Title: "Как вы хотите создать приглашение?",
      step2Subtitle: "Выберите удобный способ",
      step3Title: "Базовая информация",
      step3Subtitle: "Эти данные можно изменить позже",
      aiTitle: "AI-редактор",
      aiDesc: "Опишите своё событие, а ИИ создаст уникальный дизайн за минуту",
      classicTitle: "Классический редактор",
      classicDesc: "Выберите готовый шаблон и настройте его под себя",
      recommended: "Рекомендуем",
      namesLabel: "Имена (например: Асан и Айгуль)",
      namesPlaceholder: "Введите имена",
      dateLabel: "Дата события",
      next: "Далее",
      back: "Назад",
      create: "Создать приглашение",
      skip: "Пропустить",
    },
    kz: {
      step1Title: "Қандай іс-шара жоспарлап жатырсыз?",
      step1Subtitle: "Іс-шара түрін таңдаңыз",
      step2Title: "Шақыруды қалай жасағыңыз келеді?",
      step2Subtitle: "Ыңғайлы әдісті таңдаңыз",
      step3Title: "Негізгі ақпарат",
      step3Subtitle: "Бұл мәліметтерді кейін өзгертуге болады",
      aiTitle: "AI-редактор",
      aiDesc: "Іс-шараңызды сипаттаңыз, AI бірегей дизайн жасайды",
      classicTitle: "Классикалық редактор",
      classicDesc: "Дайын үлгіні таңдап, өзіңізге бейімдеңіз",
      recommended: "Ұсынамыз",
      namesLabel: "Есімдер (мысалы: Асан мен Айгүл)",
      namesPlaceholder: "Есімдерді енгізіңіз",
      dateLabel: "Іс-шара күні",
      next: "Келесі",
      back: "Артқа",
      create: "Шақыру жасау",
      skip: "Өткізіп жіберу",
    },
  };

  const t = texts[language];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-accent/20">
      <Header />
      
      <main className="flex-1 container px-4 py-6 md:py-12 overflow-auto">
        <div className="max-w-2xl mx-auto pb-4">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-3 h-3 rounded-full transition-all ${
                  s === step 
                    ? "bg-purple-500 scale-125" 
                    : s < step 
                    ? "bg-purple-500" 
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Step 1: Event Type */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold">{t.step1Title}</h1>
                <p className="text-muted-foreground">{t.step1Subtitle}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {eventTypes.map((event) => (
                  <Card
                    key={event.type}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      data.eventType === event.type
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 ring-2 ring-purple-500"
                        : "hover:border-purple-300"
                    }`}
                    onClick={() => handleEventSelect(event.type)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        data.eventType === event.type
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}>
                        {event.icon}
                      </div>
                      <span className="font-medium text-sm">
                        {language === 'kz' ? event.labelKz : event.labelRu}
                      </span>
                      {data.eventType === event.type && (
                        <Check className="w-4 h-4 mx-auto mt-2 text-purple-500" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Editor Type */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold">{t.step2Title}</h1>
                <p className="text-muted-foreground">{t.step2Subtitle}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AI Editor */}
                <Card
                  className={`cursor-pointer transition-all hover:scale-105 relative ${
                    data.editorType === "ai"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 ring-2 ring-purple-500"
                      : "hover:border-purple-300"
                  }`}
                  onClick={() => handleEditorSelect("ai")}
                >
                  <div className="absolute -top-2 left-4 px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded-full">
                    {t.recommended}
                  </div>
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 mb-4 rounded-xl flex items-center justify-center ${
                      data.editorType === "ai"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      <Wand2 className={`w-7 h-7 ${data.editorType === "ai" ? "text-white" : "text-gray-600"}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t.aiTitle}</h3>
                    <p className="text-sm text-muted-foreground">{t.aiDesc}</p>
                  </CardContent>
                </Card>

                {/* Classic Editor */}
                <Card
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    data.editorType === "classic"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 ring-2 ring-purple-500"
                      : "hover:border-purple-300"
                  }`}
                  onClick={() => handleEditorSelect("classic")}
                >
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 mb-4 rounded-xl flex items-center justify-center ${
                      data.editorType === "classic"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      <Palette className={`w-7 h-7 ${data.editorType === "classic" ? "text-white" : "text-gray-600"}`} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t.classicTitle}</h3>
                    <p className="text-sm text-muted-foreground">{t.classicDesc}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 3: Basic Info */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center space-y-2">
                <h1 className="text-2xl md:text-3xl font-bold">{t.step3Title}</h1>
                <p className="text-muted-foreground">{t.step3Subtitle}</p>
              </div>
              
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="names">{t.namesLabel}</Label>
                    <Input
                      id="names"
                      value={data.names}
                      onChange={(e) => setData({ ...data, names: e.target.value })}
                      placeholder={t.namesPlaceholder}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">{t.dateLabel}</Label>
                    <Input
                      id="date"
                      type="date"
                      value={data.date}
                      onChange={(e) => setData({ ...data, date: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>

      {/* Navigation buttons - sticky on mobile */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t md:border-t-0 p-4 md:static md:bg-transparent md:backdrop-blur-none">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-3">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} className="flex-shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t.back}</span>
              <span className="sm:hidden">Назад</span>
            </Button>
          ) : (
            <div />
          )}
          
          <div className="flex gap-2 flex-shrink-0">
            {step === 3 && (
              <Button variant="ghost" onClick={handleNext} className="hidden sm:flex">
                {t.skip}
              </Button>
            )}
            <Button 
              onClick={handleNext}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 whitespace-nowrap"
            >
              <span className="hidden sm:inline">{step === 3 ? t.create : t.next}</span>
              <span className="sm:hidden">{step === 3 ? "Создать" : "Далее"}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Auth dialog for classic editor */}
      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

