import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle, RefreshCw, Home } from "lucide-react";
import { Link, useSearch } from "wouter";

export default function AIPaymentFailure() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const weddingId = params.get("weddingId");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/20 p-4">
      <Card className="max-w-md w-full overflow-hidden">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-red-600">Оплата не прошла</CardTitle>
          <CardDescription className="text-base">
            К сожалению, платёж не был завершён. Попробуйте ещё раз.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Возможные причины:
          </p>
          <ul className="text-sm text-muted-foreground text-left list-disc pl-6 space-y-1">
            <li>Недостаточно средств на карте</li>
            <li>Карта не поддерживает онлайн-платежи</li>
            <li>Соединение было прервано</li>
            <li>Истекло время сессии</li>
          </ul>

          <div className="space-y-3 pt-4">
            {weddingId && (
              <Link href={`/edit-ai/${weddingId}`}>
                <Button className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Попробовать снова
                </Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                К моим приглашениям
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





