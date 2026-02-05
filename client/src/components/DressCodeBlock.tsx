import { Sparkles } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface DressCodeBlockProps {
  dressCode: string;
  dressCodeKz?: string;
  language: "ru" | "kz";
  customFont?: string;
  customColor?: string;
  themeColor?: string;
}

export default function DressCodeBlock({ dressCode, dressCodeKz, language, customFont, customColor, themeColor }: DressCodeBlockProps) {
  const content = language === "kz" && dressCodeKz ? dressCodeKz : dressCode;
  
  if (!content) return null;

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: themeColor ? `${themeColor}10` : undefined,
      }}
    >
      <div className="container max-w-3xl">
        <h2 
          className="text-3xl md:text-4xl font-bold text-center mb-8"
          style={{
            fontFamily: customFont,
            color: customColor,
          }}
        >
          {language === "kz" ? "Киім коды" : "Dress Code"}
        </h2>
        
        <Card 
          className="text-center"
          style={{
            borderColor: themeColor ? `${themeColor}30` : undefined,
          }}
        >
          <CardContent className="pt-8 pb-8">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
              style={{
                backgroundColor: themeColor ? `${themeColor}20` : undefined,
                color: themeColor,
              }}
            >
              <Sparkles className="w-8 h-8" />
            </div>
            
            <div 
              className="text-lg whitespace-pre-wrap"
              style={{
                fontFamily: customFont,
              }}
            >
              {content}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

