import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-accent/20 rounded-lg p-1">
      <Button
        variant={language === "ru" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("ru")}
        className="text-xs px-3 py-1 h-7"
      >
        Рус
      </Button>
      <Button
        variant={language === "kk" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("kk")}
        className="text-xs px-3 py-1 h-7"
      >
        Қаз
      </Button>
    </div>
  );
}

