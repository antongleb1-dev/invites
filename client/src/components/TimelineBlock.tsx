import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TimelineItem {
  time: string;
  title: string;
  titleKz?: string;
  description?: string;
  descriptionKz?: string;
}

interface TimelineBlockProps {
  timelineData: string; // JSON string
  language: "ru" | "kz";
  customFont?: string;
  customColor?: string;
  themeColor?: string;
}

export default function TimelineBlock({ timelineData, language, customFont, customColor, themeColor }: TimelineBlockProps) {
  let timeline: TimelineItem[] = [];
  
  try {
    timeline = JSON.parse(timelineData);
  } catch (e) {
    console.error("Failed to parse timeline data:", e);
    return null;
  }

  if (!timeline || timeline.length === 0) return null;

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: themeColor ? `${themeColor}10` : undefined,
      }}
    >
      <div className="container max-w-4xl">
        <h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          style={{
            fontFamily: customFont,
            color: customColor,
          }}
        >
          {language === "kz" ? "Бағдарлама" : "Программа мероприятия"}
        </h2>
        
        <div className="space-y-6">
          {timeline.map((item, index) => (
            <Card 
              key={index}
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
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{item.time}</div>
                    <div style={{ color: customColor }}>
                      {language === "kz" && item.titleKz ? item.titleKz : item.title}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              {(item.description || item.descriptionKz) && (
                <CardContent>
                  <p className="text-muted-foreground">
                    {language === "kz" && item.descriptionKz ? item.descriptionKz : item.description}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

