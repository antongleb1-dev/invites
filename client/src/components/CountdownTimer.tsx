import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: Date;
  language: "ru" | "kz";
  customFont?: string;
  customColor?: string;
  themeColor?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({
  targetDate,
  language,
  customFont,
  customColor,
  themeColor,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const labels = {
    ru: { days: "дней", hours: "часов", minutes: "минут", seconds: "секунд", started: "Событие началось!" },
    kz: { days: "күн", hours: "сағат", minutes: "минут", seconds: "секунд", started: "Оқиға басталды!" },
  };

  const l = labels[language];

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
          {language === "kz" ? "Іс-шараға дейін" : "До события осталось"}
        </h2>

        <Card
          style={{
            borderColor: themeColor ? `${themeColor}30` : undefined,
          }}
        >
          <CardContent className="pt-8 pb-8">
            {isExpired ? (
              <div className="text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                  style={{
                    backgroundColor: themeColor ? `${themeColor}20` : "#f0f9ff",
                    color: themeColor || "#3b82f6",
                  }}
                >
                  <Clock className="w-8 h-8" />
                </div>
                <p
                  className="text-2xl font-semibold"
                  style={{ fontFamily: customFont, color: customColor }}
                >
                  {l.started}
                </p>
              </div>
            ) : timeLeft ? (
              <div className="flex justify-center gap-4 md:gap-8">
                <TimeUnit value={timeLeft.days} label={l.days} themeColor={themeColor} customFont={customFont} />
                <TimeUnit value={timeLeft.hours} label={l.hours} themeColor={themeColor} customFont={customFont} />
                <TimeUnit value={timeLeft.minutes} label={l.minutes} themeColor={themeColor} customFont={customFont} />
                <TimeUnit value={timeLeft.seconds} label={l.seconds} themeColor={themeColor} customFont={customFont} />
              </div>
            ) : (
              <div className="text-center">
                <div className="animate-pulse flex justify-center gap-4 md:gap-8">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-16 md:w-20 h-24 bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function TimeUnit({
  value,
  label,
  themeColor,
  customFont,
}: {
  value: number;
  label: string;
  themeColor?: string;
  customFont?: string;
}) {
  return (
    <div className="text-center">
      <div
        className="w-16 md:w-20 h-20 md:h-24 rounded-lg flex items-center justify-center mb-2"
        style={{
          backgroundColor: themeColor ? `${themeColor}15` : "#f3f4f6",
        }}
      >
        <span
          className="text-3xl md:text-4xl font-bold tabular-nums"
          style={{
            fontFamily: customFont,
            color: themeColor || "#1f2937",
          }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span
        className="text-xs md:text-sm text-muted-foreground"
        style={{ fontFamily: customFont }}
      >
        {label}
      </span>
    </div>
  );
}


