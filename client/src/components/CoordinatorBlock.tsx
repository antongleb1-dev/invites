import { User, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface CoordinatorBlockProps {
  coordinatorName?: string;
  coordinatorPhone?: string;
  coordinatorEmail?: string;
  language: "ru" | "kz";
  customFont?: string;
  customColor?: string;
  themeColor?: string;
}

export default function CoordinatorBlock({
  coordinatorName,
  coordinatorPhone,
  coordinatorEmail,
  language,
  customFont,
  customColor,
  themeColor,
}: CoordinatorBlockProps) {
  if (!coordinatorName && !coordinatorPhone && !coordinatorEmail) return null;

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
          {language === "kz" ? "Координатор байланысы" : "Контакты координатора"}
        </h2>
        
        <Card 
          style={{
            borderColor: themeColor ? `${themeColor}30` : undefined,
          }}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div 
                className="flex items-center justify-center w-12 h-12 rounded-full"
                style={{
                  backgroundColor: themeColor ? `${themeColor}20` : undefined,
                  color: themeColor,
                }}
              >
                <User className="w-6 h-6" />
              </div>
              <span style={{ color: customColor }}>
                {coordinatorName}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coordinatorPhone && (
              <div className="flex items-center gap-3">
                <Phone 
                  className="w-5 h-5" 
                  style={{ color: themeColor }}
                />
                <a 
                  href={`tel:${coordinatorPhone}`}
                  className="text-lg hover:underline"
                  style={{ color: customColor }}
                >
                  {coordinatorPhone}
                </a>
              </div>
            )}
            
            {coordinatorEmail && (
              <div className="flex items-center gap-3">
                <Mail 
                  className="w-5 h-5" 
                  style={{ color: themeColor }}
                />
                <a 
                  href={`mailto:${coordinatorEmail}`}
                  className="text-lg hover:underline"
                  style={{ color: customColor }}
                >
                  {coordinatorEmail}
                </a>
              </div>
            )}

            {coordinatorPhone && (
              <div className="pt-4">
                <Button 
                  asChild 
                  className="w-full"
                  style={{
                    backgroundColor: themeColor,
                  }}
                >
                  <a href={`https://wa.me/${coordinatorPhone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    {language === "kz" ? "WhatsApp арқылы жазу" : "Написать в WhatsApp"}
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

