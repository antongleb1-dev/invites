import { QrCode } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useEffect, useRef } from "react";

interface QRCodeBlockProps {
  qrCodeData?: string;
  language: "ru" | "kz";
  customFont?: string;
  customColor?: string;
  themeColor?: string;
}

export default function QRCodeBlock({
  qrCodeData,
  language,
  customFont,
  customColor,
  themeColor,
}: QRCodeBlockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!qrCodeData || !canvasRef.current) return;

    // Simple QR code generation using a library would be better
    // For now, we'll use a QR code API service
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeData)}`;
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      canvas.width = 300;
      canvas.height = 300;
      ctx.drawImage(img, 0, 0, 300, 300);
    };
    img.src = qrUrl;
  }, [qrCodeData]);

  if (!qrCodeData) return null;

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
          {language === "kz" ? "QR-код" : "QR-код для гостей"}
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
              <QrCode className="w-8 h-8" />
            </div>
            
            <div className="flex justify-center mb-4">
              <canvas 
                ref={canvasRef}
                className="border-4 rounded-lg"
                style={{
                  borderColor: themeColor || "#e5e7eb",
                }}
              />
            </div>

            <p 
              className="text-muted-foreground"
              style={{
                fontFamily: customFont,
              }}
            >
              {language === "kz" 
                ? "Шақыруды ашу үшін QR-кодты сканерлеңіз"
                : "Отсканируйте QR-код для быстрого доступа к приглашению"
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

