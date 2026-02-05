import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentSuccess() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/payment/success");
  
  const searchParams = new URLSearchParams(window.location.search);
  const weddingId = searchParams.get("weddingId");

  useEffect(() => {
    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      if (weddingId) {
        navigate(`/manage/${weddingId}`);
      } else {
        navigate("/dashboard");
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [weddingId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Оплата успешна!</CardTitle>
          <CardDescription>
            Ваша свадьба успешно оплачена
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            <p className="font-medium mb-2">Теперь вам доступны:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Галерея фотографий (до 8 фото)</li>
              <li>Видео на странице</li>
              <li>Фоновая музыка</li>
              <li>Love Story блок</li>
              <li>Кастомные шрифты и цвета</li>
              <li>Приоритетная поддержка</li>
            </ul>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Автоматический переход через 5 секунд...
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={() => weddingId ? navigate(`/manage/${weddingId}`) : navigate("/dashboard")}
            >
              Перейти к управлению
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate("/dashboard")}
            >
              К списку свадеб
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

