import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Sparkles, Check, Zap, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
// AI Package definitions (duplicated from shared/const.ts for client)
const AI_PACKAGES = {
  start: { id: 'start', name: 'AI START', edits: 15, price: 1990 },
  pro: { id: 'pro', name: 'AI PRO', edits: 50, price: 3990 },
  unlimited: { id: 'unlimited', name: 'AI UNLIMITED', edits: 200, price: 6990 },
};

const AI_TOPUPS = {
  small: { id: 'small', edits: 10, price: 990 },
  medium: { id: 'medium', edits: 30, price: 1990 },
};

interface AIPackageSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weddingId: number;
  mode: 'package' | 'topup';
}

export function AIPackageSelector({ open, onOpenChange, weddingId, mode }: AIPackageSelectorProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const purchasePackageMutation = trpc.ai.purchasePackage.useMutation({
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при создании платежа");
      setIsPurchasing(false);
    },
  });

  const purchaseTopupMutation = trpc.ai.purchaseTopup.useMutation({
    onSuccess: (data) => {
      window.location.href = data.redirectUrl;
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при создании платежа");
      setIsPurchasing(false);
    },
  });

  const handlePurchase = (id: string) => {
    // Check if wedding is saved
    if (!weddingId || weddingId === 0) {
      toast.info("Подождите, приглашение сохраняется...");
      // Wait for auto-save and retry
      setTimeout(() => {
        onOpenChange(false);
        setTimeout(() => onOpenChange(true), 1000);
      }, 2000);
      return;
    }
    
    setSelectedPackage(id);
    setIsPurchasing(true);

    if (mode === 'package') {
      purchasePackageMutation.mutate({
        weddingId,
        packageId: id as 'start' | 'pro' | 'unlimited',
      });
    } else {
      purchaseTopupMutation.mutate({
        weddingId,
        topupId: id as 'small' | 'medium',
      });
    }
  };

  const packages = [
    {
      id: 'start',
      name: 'AI START',
      edits: 15,
      price: 1990,
      icon: Sparkles,
      popular: false,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'pro',
      name: 'AI PRO',
      edits: 50,
      price: 3990,
      icon: Zap,
      popular: true,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'unlimited',
      name: 'AI UNLIMITED',
      edits: 200,
      price: 6990,
      icon: Crown,
      popular: false,
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const topups = [
    {
      id: 'small',
      name: '+10 правок',
      edits: 10,
      price: 990,
    },
    {
      id: 'medium',
      name: '+30 правок',
      edits: 30,
      price: 1990,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            {mode === 'package' ? 'Выберите AI пакет' : 'Докупить AI-правки'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'package' 
              ? 'Вы использовали бесплатные сообщения. Приобретите пакет для продолжения работы с AI.'
              : 'Добавьте правки к вашему текущему пакету'
            }
          </DialogDescription>
        </DialogHeader>
        
        {mode === 'package' && (
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-2">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              <strong>Бонус:</strong> При покупке любого AI-пакета публикация приглашения — <strong>бесплатно!</strong>
            </p>
          </div>
        )}

        {mode === 'package' ? (
          <div className="grid gap-4 py-4 sm:grid-cols-3">
            {packages.map((pkg) => {
              const Icon = pkg.icon;
              return (
                <Card 
                  key={pkg.id}
                  className={`relative cursor-pointer transition-all hover:scale-105 ${
                    selectedPackage === pkg.id ? 'ring-2 ring-purple-500' : ''
                  } ${pkg.popular ? 'border-purple-500' : ''}`}
                  onClick={() => !isPurchasing && setSelectedPackage(pkg.id)}
                >
                  {pkg.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-500">
                      Популярный
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${pkg.color} flex items-center justify-center mb-2`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.edits} AI-правок</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold mb-4">
                      {pkg.price.toLocaleString()} ₸
                    </div>
                    <Button
                      className={`w-full bg-gradient-to-r ${pkg.color} hover:opacity-90`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(pkg.id);
                      }}
                      disabled={isPurchasing}
                    >
                      {isPurchasing && selectedPackage === pkg.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Оплата...
                        </>
                      ) : (
                        'Выбрать'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            {topups.map((topup) => (
              <Card 
                key={topup.id}
                className={`cursor-pointer transition-all hover:scale-105 ${
                  selectedPackage === topup.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => !isPurchasing && setSelectedPackage(topup.id)}
              >
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-lg">{topup.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-3xl font-bold mb-4">
                    {topup.price.toLocaleString()} ₸
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(topup.id);
                    }}
                    disabled={isPurchasing}
                  >
                    {isPurchasing && selectedPackage === topup.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Оплата...
                      </>
                    ) : (
                      'Докупить'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center text-sm text-muted-foreground mt-2">
          <p>Безопасная оплата через FreedomPay</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Component to show when AI edits are exhausted
export function AIEditsExhaustedDialog({ 
  open, 
  onOpenChange, 
  weddingId,
  editsUsed,
  editsLimit,
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void; 
  weddingId: number;
  editsUsed: number;
  editsLimit: number;
}) {
  const [showTopup, setShowTopup] = useState(false);

  if (showTopup) {
    return (
      <AIPackageSelector 
        open={open} 
        onOpenChange={onOpenChange} 
        weddingId={weddingId}
        mode="topup"
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            AI-правки закончились
          </DialogTitle>
          <DialogDescription>
            Использовано {editsUsed} из {editsLimit} AI-правок
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 text-center">
          <p className="text-muted-foreground mb-6">
            Докупите дополнительные правки, чтобы продолжить работу с AI
          </p>
          
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            onClick={() => setShowTopup(true)}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Докупить правки
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Counter component for header
export function AIEditsCounter({ 
  editsUsed, 
  editsLimit,
  className = "",
}: { 
  editsUsed: number; 
  editsLimit: number;
  className?: string;
}) {
  const remaining = Math.max(0, editsLimit - editsUsed);
  const percentage = editsLimit > 0 ? (editsUsed / editsLimit) * 100 : 0;
  
  const getColor = () => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-orange-500';
    return 'text-green-500';
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Sparkles className={`w-4 h-4 ${getColor()}`} />
      <span className="text-muted-foreground">
        Использовано <span className={`font-medium ${getColor()}`}>{editsUsed}</span> из {editsLimit}
      </span>
    </div>
  );
}

