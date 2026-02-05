import { useLocation } from "wouter";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PaymentFailure() {
  const [, navigate] = useLocation();
  
  const searchParams = new URLSearchParams(window.location.search);
  const weddingId = searchParams.get("weddingId");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Оплата не прошла</CardTitle>
          <CardDescription>
            К сожалению, платеж не был завершен
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium mb-2">Возможные причины:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Недостаточно средств на карте</li>
              <li>Платеж был отменен</li>
              <li>Технические проблемы</li>
              <li>Неверные данные карты</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Вы можете попробовать оплатить еще раз или обратиться в поддержку
          </p>

          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={() => weddingId ? navigate(`/upgrade/${weddingId}`) : navigate("/dashboard")}
            >
              Попробовать снова
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

