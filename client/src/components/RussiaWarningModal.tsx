import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface RussiaWarningModalProps {
  open: boolean;
  onClose: () => void;
  /** If true, shows AI-specific warning about generation */
  isAIWarning?: boolean;
}

export function RussiaWarningModal({ open, onClose, isAIWarning = false }: RussiaWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-xl">
            {isAIWarning ? "Предупреждение" : "Важная информация"}
          </DialogTitle>
          <DialogDescription className="text-base text-foreground/80 mt-4 leading-relaxed">
            Оплата российскими банковскими картами сейчас может быть недоступна из-за ограничений платёжных систем. 
            {isAIWarning && (
              <span className="block mt-3 font-medium text-amber-700 dark:text-amber-400">
                Чтобы не тратить генерации зря, рекомендуем дождаться выхода мобильного приложения с альтернативными способами оплаты.
              </span>
            )}
            {!isAIWarning && (
              <span className="block mt-3">
                Чтобы не тратить генерации зря, рекомендуем дождаться выхода мобильного приложения с альтернативными способами оплаты.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 sm:justify-center">
          <Button 
            onClick={onClose}
            className="w-full sm:w-auto min-w-[120px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Понятно
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



