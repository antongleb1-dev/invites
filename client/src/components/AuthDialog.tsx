import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { Loader2, Phone } from "lucide-react";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { trpc } from "@/lib/trpc";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthDialog({ open, onOpenChange, onSuccess }: AuthDialogProps) {
  const [loading, setLoading] = useState(false);

  // Email auth state
  const [emailMode, setEmailMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Password reset state
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  
  // tRPC mutation for updating phone
  const updatePhoneMutation = trpc.user.updatePhone.useMutation();

  // Validate phone number (Kazakhstan format)
  const validatePhone = (phoneNumber: string): boolean => {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    // Kazakhstan phone: starts with 7 and has 11 digits total, or 10 digits without country code
    return digits.length >= 10 && digits.length <= 12;
  };

  // Handle email/password authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone for registration
    if (emailMode === "register" && !validatePhone(phone)) {
      alert("Пожалуйста, введите корректный номер телефона");
      return;
    }
    
    setLoading(true);

    try {
      if (emailMode === "register") {
        // Register new user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Get fresh ID token
        const idToken = await userCredential.user.getIdToken();
        
        // Update phone number in database
        try {
          await updatePhoneMutation.mutateAsync({ phone });
        } catch (phoneError) {
          console.error("Failed to save phone:", phoneError);
          // Continue anyway, phone can be added later
        }
        
        alert("Регистрация успешна!");
      } else {
        // Login existing user
        await signInWithEmailAndPassword(auth, email, password);
      }

      onOpenChange(false);
      if (onSuccess) onSuccess();
      window.location.reload(); // Reload to update auth state
    } catch (error: any) {
      console.error("Email auth error:", error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onOpenChange(false);
      if (onSuccess) onSuccess();
      window.location.reload(); // Reload to update auth state
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      alert(`Ошибка входа через Google: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      alert("Пожалуйста, введите email");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert("Письмо для сброса пароля отправлено! Проверьте вашу почту.");
      setShowResetPassword(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Вход в систему</DialogTitle>
            <DialogDescription>
              Войдите или создайте новый аккаунт для продолжения
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={emailMode === "login" ? "default" : "outline"}
                    onClick={() => setEmailMode("login")}
                    className="flex-1"
                  >
                    Вход
                  </Button>
                  <Button
                    variant={emailMode === "register" ? "default" : "outline"}
                    onClick={() => setEmailMode("register")}
                    className="flex-1"
                  >
                    Регистрация
                  </Button>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  {emailMode === "register" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Имя (необязательно)</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Ваше имя"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          Номер телефона <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+7 (777) 123-45-67"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Для связи по вашим приглашениям
                        </p>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password">Пароль</Label>
                      {emailMode === "login" && (
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(true)}
                          className="text-xs text-primary hover:underline"
                        >
                          Забыли пароль?
                        </button>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    {emailMode === "register" && (
                      <p className="text-xs text-muted-foreground">
                        Минимум 6 символов
                      </p>
                    )}
                  </div>

                  {emailMode === "register" && (
                    <div className="flex items-start space-x-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground">
                        Я согласен с{" "}
                        <a href="/terms" target="_blank" className="text-primary hover:underline">
                          Условиями использования
                        </a>
                        {" "}и{" "}
                        <a href="/privacy" target="_blank" className="text-primary hover:underline">
                          Политикой конфиденциальности
                        </a>
                      </label>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading || (emailMode === "register" && !termsAccepted)}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {emailMode === "register" ? "Регистрация..." : "Вход..."}
                      </>
                    ) : (
                      emailMode === "register" ? "Создать аккаунт" : "Войти"
                    )}
                  </Button>
                </form>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Или</span>
                  </div>
                </div>

                {/* Google Sign-In Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Войти через Google
                </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Восстановление пароля</DialogTitle>
            <DialogDescription>
              Введите ваш email, и мы отправим вам ссылку для сброса пароля
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="your@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowResetPassword(false)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Отправить"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </>
  );
}

