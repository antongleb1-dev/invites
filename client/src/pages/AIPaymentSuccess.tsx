import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Link, useSearch, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function AIPaymentSuccess() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const weddingId = params.get("weddingId");
  const packageId = params.get("package");
  const topupId = params.get("topup");
  
  const [activated, setActivated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [, navigate] = useLocation();

  const activatePackageMutation = trpc.ai.activatePackage.useMutation();
  const addTopupMutation = trpc.ai.addTopupEdits.useMutation();

  useEffect(() => {
    const activate = async () => {
      if (!weddingId) {
        setError("Не найден ID приглашения");
        return;
      }

      try {
        if (packageId) {
          await activatePackageMutation.mutateAsync({
            weddingId: parseInt(weddingId),
            packageId: packageId as 'start' | 'pro' | 'unlimited',
            orderId: 'payment_success',
          });
        } else if (topupId) {
          await addTopupMutation.mutateAsync({
            weddingId: parseInt(weddingId),
            topupId: topupId as 'small' | 'medium',
            orderId: 'payment_success',
          });
        }
        setActivated(true);
      } catch (err: any) {
        console.error('Error activating package:', err);
        // If already activated (duplicate callback), show success anyway
        if (err.message?.includes('already') || err.data?.code === 'CONFLICT') {
          setActivated(true);
        } else {
          setError(err.message || "Ошибка активации пакета");
        }
      }
    };

    activate();
  }, [weddingId, packageId, topupId]);

  // Auto-redirect to dashboard after 5 seconds
  useEffect(() => {
    if (!activated) return;
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [activated, navigate]);

  const packages: Record<string, { name: string; edits: number }> = {
    start: { name: 'AI START', edits: 15 },
    pro: { name: 'AI PRO', edits: 50 },
    unlimited: { name: 'AI UNLIMITED', edits: 200 },
  };

  const topups: Record<string, { name: string; edits: number }> = {
    small: { name: '+10 правок', edits: 10 },
    medium: { name: '+30 правок', edits: 30 },
  };

  const currentPackage = packageId ? packages[packageId] : null;
  const currentTopup = topupId ? topups[topupId] : null;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/20 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-500">Ошибка</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard">
              <Button className="w-full">Вернуться к приглашениям</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/20 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-16 text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-500 mb-4" />
            <p className="text-muted-foreground">Активируем пакет...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-accent/20 p-4">
      <Card className="max-w-md w-full overflow-hidden">
        {/* Success animation background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5" />
        
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl text-green-600">Оплата успешна!</CardTitle>
          <CardDescription className="text-base">
            {currentPackage 
              ? `Пакет ${currentPackage.name} активирован`
              : currentTopup
                ? `${currentTopup.name} добавлено`
                : 'Пакет активирован'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-6 relative">
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-300/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="font-semibold text-purple-600">
                {currentPackage?.name || currentTopup?.name || 'AI Пакет'}
              </span>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {currentPackage?.edits || currentTopup?.edits || 0} правок
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Теперь вы можете создавать и редактировать AI-приглашения
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground mb-4">
            Автоматический переход через {countdown} сек...
          </div>

          <div className="space-y-3">
            {weddingId && (
              <Link href={`/edit-ai/${weddingId}`}>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Продолжить редактирование
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                К моим приглашениям
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





