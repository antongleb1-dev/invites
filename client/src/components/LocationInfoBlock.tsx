import { MapPin, Info } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface LocationInfoBlockProps {
  locationDetails?: string;
  locationDetailsKz?: string;
  language: "ru" | "kz";
  customFont?: string;
  customColor?: string;
  themeColor?: string;
}

export default function LocationInfoBlock({
  locationDetails,
  locationDetailsKz,
  language,
  customFont,
  customColor,
  themeColor,
}: LocationInfoBlockProps) {
  const content = language === "kz" && locationDetailsKz ? locationDetailsKz : locationDetails;
  
  if (!content) return null;

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: themeColor ? `${themeColor}10` : undefined,
      }}
    >
      <div className="container max-w-4xl">
        <h2 
          className="text-3xl md:text-4xl font-bold text-center mb-8"
          style={{
            fontFamily: customFont,
            color: customColor,
          }}
        >
          {language === "kz" ? "Орын туралы ақпарат" : "Информация о локации"}
        </h2>
        
        <Card 
          style={{
            borderColor: themeColor ? `${themeColor}30` : undefined,
          }}
        >
          <CardContent className="pt-8 pb-8">
            <div className="flex items-start gap-4">
              <div 
                className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full"
                style={{
                  backgroundColor: themeColor ? `${themeColor}20` : undefined,
                  color: themeColor,
                }}
              >
                <MapPin className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <div 
                  className="text-lg whitespace-pre-wrap leading-relaxed"
                  style={{
                    fontFamily: customFont,
                  }}
                >
                  {content}
                </div>
              </div>
            </div>

            <div 
              className="mt-6 p-4 rounded-lg flex items-start gap-3"
              style={{
                backgroundColor: themeColor ? `${themeColor}15` : "#f9fafb",
              }}
            >
              <Info 
                className="w-5 h-5 flex-shrink-0 mt-0.5" 
                style={{ color: themeColor }}
              />
              <p className="text-sm text-muted-foreground">
                {language === "kz"
                  ? "Орынға қалай жетуге болатыны туралы толық ақпарат"
                  : "Подробная информация о том, как добраться до места проведения"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

