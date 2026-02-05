import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./AuthDialog";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lock, Save, Share2, Sparkles } from "lucide-react";

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: "save" | "share" | "continue" | "features";
  onSuccess?: () => void;
}

export function AuthRequiredDialog({ 
  open, 
  onOpenChange, 
  reason = "save",
  onSuccess 
}: AuthRequiredDialogProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { language } = useLanguage();

  const texts = {
    ru: {
      save: {
        title: "Сохраните своё приглашение",
        description: "Чтобы сохранить и отправить приглашение гостям, войдите или зарегистрируйтесь",
        icon: <Save className="w-8 h-8" />,
      },
      share: {
        title: "Поделитесь приглашением",
        description: "Чтобы получить ссылку и отправить гостям, войдите или зарегистрируйтесь",
        icon: <Share2 className="w-8 h-8" />,
      },
      continue: {
        title: "Продолжите редактирование",
        description: "Чтобы продолжить редактирование позже, войдите или зарегистрируйтесь",
        icon: <Sparkles className="w-8 h-8" />,
      },
      features: {
        title: "Разблокируйте все функции",
        description: "Для доступа к RSVP, списку подарков и пожеланиям войдите или зарегистрируйтесь",
        icon: <Lock className="w-8 h-8" />,
      },
      benefits: [
        "✨ Сохранение приглашения",
        "🔗 Персональная ссылка",
        "📊 Статистика и управление",
        "🎁 RSVP, подарки, пожелания",
      ],
      login: "Войти",
      register: "Зарегистрироваться",
      later: "Позже",
    },
    kz: {
      save: {
        title: "Шақыруыңызды сақтаңыз",
        description: "Шақыруды сақтап, қонақтарға жіберу үшін кіріңіз немесе тіркеліңіз",
        icon: <Save className="w-8 h-8" />,
      },
      share: {
        title: "Шақырумен бөлісіңіз",
        description: "Сілтеме алып, қонақтарға жіберу үшін кіріңіз немесе тіркеліңіз",
        icon: <Share2 className="w-8 h-8" />,
      },
      continue: {
        title: "Өңдеуді жалғастырыңыз",
        description: "Кейін өңдеуді жалғастыру үшін кіріңіз немесе тіркеліңіз",
        icon: <Sparkles className="w-8 h-8" />,
      },
      features: {
        title: "Барлық мүмкіндіктерді ашыңыз",
        description: "RSVP, сыйлықтар тізімі мен тілектерге қол жеткізу үшін кіріңіз",
        icon: <Lock className="w-8 h-8" />,
      },
      benefits: [
        "✨ Шақыруды сақтау",
        "🔗 Жеке сілтеме",
        "📊 Статистика және басқару",
        "🎁 RSVP, сыйлықтар, тілектер",
      ],
      login: "Кіру",
      register: "Тіркелу",
      later: "Кейін",
    },
  };

  const t = texts[language];
  const content = t[reason];

  const handleAuthSuccess = () => {
    setShowAuthDialog(false);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 text-purple-600">
              {content.icon}
            </div>
            <DialogTitle className="text-xl">{content.title}</DialogTitle>
            <DialogDescription className="text-base">
              {content.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {t.benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => setShowAuthDialog(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {t.register}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              {t.later}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AuthDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}


