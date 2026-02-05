import { Card, CardContent } from "@/components/ui/card";
import { Baby, Wine, Camera, BanIcon, Check, HelpCircle } from "lucide-react";

interface EventOptionsBlockProps {
  childrenPolicy?: "neutral" | "allowed" | "not_allowed";
  alcoholPolicy?: "neutral" | "allowed" | "not_allowed";
  photoPolicy?: "neutral" | "allowed" | "not_allowed";
  language: "ru" | "kz";
  customFont?: string;
  customColor?: string;
  themeColor?: string;
}

export default function EventOptionsBlock({
  childrenPolicy,
  alcoholPolicy,
  photoPolicy,
  language,
  customFont,
  customColor,
  themeColor,
}: EventOptionsBlockProps) {
  const texts = {
    ru: {
      title: "Важная информация",
      children: {
        allowed: "С детьми",
        not_allowed: "Без детей",
        neutral: "",
      },
      alcohol: {
        allowed: "Алкоголь будет",
        not_allowed: "Без алкоголя",
        neutral: "",
      },
      photo: {
        allowed: "Фото и видео разрешены",
        not_allowed: "Без фото и видео",
        neutral: "",
      },
    },
    kz: {
      title: "Маңызды ақпарат",
      children: {
        allowed: "Балалармен",
        not_allowed: "Балаларсыз",
        neutral: "",
      },
      alcohol: {
        allowed: "Алкоголь болады",
        not_allowed: "Алкогольсіз",
        neutral: "",
      },
      photo: {
        allowed: "Фото және видео рұқсат",
        not_allowed: "Фото және видеосыз",
        neutral: "",
      },
    },
  };

  const t = texts[language];

  const getIcon = (policy: string | undefined, type: "children" | "alcohol" | "photo") => {
    if (policy === "allowed") {
      return <Check className="w-5 h-5 text-green-600" />;
    }
    if (policy === "not_allowed") {
      return <BanIcon className="w-5 h-5 text-red-500" />;
    }
    return null;
  };

  const getMainIcon = (type: "children" | "alcohol" | "photo") => {
    switch (type) {
      case "children":
        return <Baby className="w-6 h-6" style={{ color: themeColor || customColor }} />;
      case "alcohol":
        return <Wine className="w-6 h-6" style={{ color: themeColor || customColor }} />;
      case "photo":
        return <Camera className="w-6 h-6" style={{ color: themeColor || customColor }} />;
    }
  };

  const options = [
    { type: "children" as const, policy: childrenPolicy, text: t.children[childrenPolicy || "neutral"] },
    { type: "alcohol" as const, policy: alcoholPolicy, text: t.alcohol[alcoholPolicy || "neutral"] },
    { type: "photo" as const, policy: photoPolicy, text: t.photo[photoPolicy || "neutral"] },
  ].filter(opt => opt.policy && opt.policy !== "neutral");

  if (options.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container max-w-4xl">
        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-8"
          style={{
            fontFamily: customFont,
            color: customColor,
          }}
        >
          {t.title}
        </h2>
        <Card className="border-0 shadow-md" style={{ backgroundColor: 'rgba(250, 245, 235, 0.9)' }}>
          <CardContent className="p-6">
            <div className={`grid gap-4 ${options.length === 1 ? 'grid-cols-1' : options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {options.map((opt) => (
                <div
                  key={opt.type}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg"
                  style={{ backgroundColor: themeColor ? `${themeColor}15` : 'rgba(0,0,0,0.03)' }}
                >
                  <div className="flex items-center gap-2">
                    {getMainIcon(opt.type)}
                    {getIcon(opt.policy, opt.type)}
                  </div>
                  <span
                    className="text-sm font-medium text-center"
                    style={{ fontFamily: customFont, color: customColor }}
                  >
                    {opt.text}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}


