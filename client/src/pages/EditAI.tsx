import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  Heart, 
  Loader2, 
  Smartphone, 
  Tablet, 
  Monitor,
  Sparkles,
  Send,
  Save,
  AlertCircle,
  Bot,
  User,
  Upload,
  ArrowLeft,
  Wand2,
  Square,
  Check,
  Lock
} from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AIPackageSelector, AIEditsExhaustedDialog, AIEditsCounter } from "@/components/AIPackageSelector";
import { RussiaWarningModal } from "@/components/RussiaWarningModal";
import { useGeoLocation } from "@/hooks/useGeoLocation";

type ViewMode = "mobile" | "tablet" | "desktop";
type AIProvider = "claude" | "openai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function EditAI() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const invitationId = parseInt(params.id || "0");
  
  // View mode for preview
  const [viewMode, setViewMode] = useState<ViewMode>("mobile");
  
  // AI provider
  const [provider, setProvider] = useState<AIProvider>("openai"); // GPT-4.1 по умолчанию
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStage, setProgressStage] = useState(0);
  const [wasCancelled, setWasCancelled] = useState(false);
  
  // Progress messages that cycle during generation
  const progressMessages = [
    "✨ Анализирую запрос...",
    "🎨 Обновляю дизайн...",
    "📐 Перестраиваю структуру...",
    "🖌️ Применяю изменения...",
    "🌈 Добавляю акценты...",
    "📱 Адаптирую под мобильные...",
    "✅ Финальные штрихи...",
  ];
  
  // Generated HTML
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  
  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // AI Package state
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  const [showEditsExhausted, setShowEditsExhausted] = useState(false);
  
  // Russia warning for AI generation
  const { isRussia } = useGeoLocation();
  const [showRussiaWarning, setShowRussiaWarning] = useState(false);
  
  // Refs
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // tRPC
  const { data: providersData, isLoading: isLoadingProviders } = trpc.ai.getProviders.useQuery();
  const { data: invitationData, isLoading: isLoadingInvitation } = trpc.ai.getForEdit.useQuery(
    { id: invitationId },
    { enabled: invitationId > 0 }
  );
  const chatMutation = trpc.ai.chat.useMutation();
  const updateMutation = trpc.ai.updateHtml.useMutation();
  
  // AI Package status
  const { data: packageStatus, refetch: refetchPackageStatus } = trpc.ai.getPackageStatus.useQuery(
    { weddingId: invitationId },
    { enabled: invitationId > 0 && isAuthenticated }
  );
  const incrementEditsMutation = trpc.ai.incrementEditCount.useMutation();

  // Initialize with saved data
  useEffect(() => {
    if (invitationData) {
      // Restore HTML
      if (invitationData.html) {
        setGeneratedHtml(invitationData.html);
      }
      
      // Restore chat history
      if (invitationData.chatHistory && invitationData.chatHistory.length > 0) {
        const restoredMessages: Message[] = invitationData.chatHistory.map((m: any, i: number) => ({
          id: `restored-${i}`,
          role: m.role,
          content: m.content,
          timestamp: new Date(),
        }));
        setMessages(restoredMessages);
      } else if (providersData?.welcomeMessage) {
        // Add welcome message if no history
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: `Продолжаем редактирование приглашения "${invitationData.title}".\n\nЧто хотите изменить?`,
          timestamp: new Date(),
        }]);
      }
    }
  }, [invitationData, providersData]);

  // Set default provider
  useEffect(() => {
    if (providersData?.defaultProvider) {
      setProvider(providersData.defaultProvider);
    }
  }, [providersData]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Progress animation - cycle through stages while processing
  useEffect(() => {
    if (!isProcessing) {
      setProgressStage(0);
      return;
    }
    
    const interval = setInterval(() => {
      setProgressStage(prev => (prev + 1) % progressMessages.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [isProcessing, progressMessages.length]);

  // Track previous values to avoid unnecessary saves
  const prevHtmlRef = useRef<string | null>(null);
  const prevMessagesLengthRef = useRef<number>(0);

  // Auto-save when HTML or messages change (debounced, silent)
  useEffect(() => {
    if (!generatedHtml || !isAuthenticated || !invitationId) return;
    
    // Check if there are actual changes
    const hasHtmlChanged = prevHtmlRef.current !== null && prevHtmlRef.current !== generatedHtml;
    const hasMessagesChanged = prevMessagesLengthRef.current !== messages.length;
    
    // Update refs
    prevHtmlRef.current = generatedHtml;
    prevMessagesLengthRef.current = messages.length;
    
    // Only save if something actually changed
    if (!hasHtmlChanged && !hasMessagesChanged) return;
    
    const timer = setTimeout(async () => {
      try {
        const chatHistory = messages
          .filter(m => m.id !== 'welcome')
          .map(m => ({ role: m.role, content: m.content }));
        
        await updateMutation.mutateAsync({
          id: invitationId,
          html: generatedHtml,
          chatHistory,
        });
        
        console.log('[AutoSave] Silently saved invitation:', invitationId);
      } catch (error: any) {
        console.error('[AutoSave] Error:', error);
        // Only show error toast, no success notification
        toast.error('Ошибка автосохранения');
      }
    }, 5000); // 5 second debounce
    
    return () => clearTimeout(timer);
  }, [generatedHtml, messages, isAuthenticated, invitationId, updateMutation]);

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setWasCancelled(true);
    
    const cancelMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "⏹️ Генерация остановлена. Вы можете продолжить редактирование или отправить новый запрос.",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, cancelMessage]);
    
    toast.info("Генерация остановлена");
  };

  // Send message
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isProcessing) return;
    
    if (!isAuthenticated) {
      toast.error("Войдите в систему");
      return;
    }

    // Show warning for Russian users about payment limitations
    console.log('[EditAI] isRussia check:', isRussia);
    if (isRussia) {
      console.log('[EditAI] Blocking - showing Russia warning');
      setShowRussiaWarning(true);
      return;
    }

    // Check AI package limits
    if (packageStatus) {
      if (!packageStatus.hasPackage) {
        setShowPackageSelector(true);
        return;
      }
      if (packageStatus.editsRemaining <= 0) {
        setShowEditsExhausted(true);
        return;
      }
    }

    setWasCancelled(false);
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setChatInput("");
    setIsProcessing(true);

    try {
      const result = await chatMutation.mutateAsync({
        provider,
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        currentHtml: generatedHtml,
      });

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Increment edit count
      if (packageStatus?.hasPackage) {
        incrementEditsMutation.mutate({ weddingId: invitationId });
        refetchPackageStatus();
      }

      if (result.html) {
        setGeneratedHtml(result.html);
        toast.success("Приглашение обновлено!");
      }
    } catch (error: any) {
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      toast.error(error.message || "Ошибка при отправке сообщения");
      setMessages(messages);
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
      inputRef.current?.focus();
    }
  };

  // Handle Enter key - desktop only (Shift+Enter for newline)
  // On mobile, Enter creates newline, send only via button
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    if (e.key === "Enter") {
      if (isMobile) {
        // On mobile: Enter = newline (default behavior)
        return;
      }
      // On desktop: Enter = send, Shift+Enter = newline
      if (!e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    }
  };

  // Auto-resize textarea on input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setChatInput(textarea.value);
    
    // Auto-resize: reset height to auto, then set to scrollHeight
    textarea.style.height = 'auto';
    const maxHeight = window.innerWidth < 768 ? 150 : 120; // Higher max on mobile
    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
  };

  // Save changes
  const handleSave = async () => {
    if (!generatedHtml) {
      toast.error("Нет изменений для сохранения");
      return;
    }

    setIsSaving(true);

    try {
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      await updateMutation.mutateAsync({
        id: invitationId,
        html: generatedHtml,
        chatHistory,
      });

      toast.success("Изменения сохранены!");
    } catch (error: any) {
      toast.error(error.message || "Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  // Get preview width
  const getPreviewWidth = () => {
    switch (viewMode) {
      case "mobile": return "max-w-[375px]";
      case "tablet": return "max-w-[768px]";
      case "desktop": return "max-w-full";
    }
  };

  // Loading state
  if (authLoading || isLoadingProviders || isLoadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not found
  if (!invitationData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold mb-2">Приглашение не найдено</h2>
            <p className="text-muted-foreground mb-4">
              Возможно, оно было удалено или у вас нет доступа.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">К моим приглашениям</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasAnyProvider = providersData?.available.claude || providersData?.available.openai;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header - single row on all devices */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-2">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Left - Back + AI badge */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="h-7 w-7 sm:h-8 sm:w-auto sm:px-3 p-0">
                  <ArrowLeft className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline text-xs">Назад</span>
                </Button>
              </Link>
              {/* AI badge with sparkle animation */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 border border-purple-300/30">
                <div className="relative">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <div className="absolute inset-0 animate-ping">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400 opacity-50" />
                  </div>
                </div>
                <span className="text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI
                </span>
              </div>
            </div>

            {/* Center - View mode switcher */}
            <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
              <Button
                variant={viewMode === "mobile" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("mobile")}
                className="h-7 w-7 p-0"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={viewMode === "tablet" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("tablet")}
                className="h-7 w-7 p-0"
              >
                <Tablet className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={viewMode === "desktop" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("desktop")}
                className="h-7 w-7 p-0"
              >
                <Monitor className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-1">
              {/* Provider selector - with visible text */}
              {hasAnyProvider && (
                <Select value={provider} onValueChange={(v) => setProvider(v as AIProvider)}>
                  <SelectTrigger className="w-[85px] sm:w-[110px] h-7 text-xs border-purple-300/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providersData?.available.claude && (
                      <SelectItem value="claude">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-500" />
                          Claude
                        </span>
                      </SelectItem>
                    )}
                    {providersData?.available.openai && (
                      <SelectItem value="openai">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          OpenAI
                        </span>
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}

              {/* AI Edits Counter */}
              {packageStatus?.hasPackage && (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-300/30">
                  <AIEditsCounter 
                    editsUsed={packageStatus.editsUsed} 
                    editsLimit={packageStatus.editsLimit}
                    className="text-xs"
                  />
                </div>
              )}

              {/* Buy package button - show when no package */}
              {!packageStatus?.hasPackage && (
                <Button 
                  size="sm" 
                  onClick={() => setShowPackageSelector(true)}
                  className="h-7 px-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Lock className="w-3 h-3 sm:mr-1" />
                  <span className="hidden sm:inline">Купить пакет</span>
                </Button>
              )}

              {/* Auto-save status indicator */}
              {/* Auto-save indicator removed - saves silently in background */}

              <Button 
                onClick={handleSave} 
                disabled={isSaving || !generatedHtml}
                size="sm"
                className="h-7 px-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isSaving ? (
                  <Loader2 className="w-3.5 h-3.5 sm:mr-1 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 sm:mr-1" />
                )}
                <span className="hidden sm:inline">Сохранить</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview area - scrollable, includes chat history on mobile */}
        <div className="flex-1 bg-muted/30 overflow-auto pb-[100px] lg:pb-4">
          <div className="p-2 sm:p-4">
            <div className={`mx-auto ${getPreviewWidth()}`}>
              {generatedHtml ? (
                <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                  <iframe
                    srcDoc={generatedHtml}
                    className="w-full border-0"
                    style={{ 
                      height: viewMode === "mobile" ? "667px" : viewMode === "tablet" ? "1024px" : "800px",
                    }}
                    title="Preview"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] sm:h-[500px] text-muted-foreground">
                  <div className="relative mb-4">
                    <Wand2 className="w-12 h-12 sm:w-16 sm:h-16 opacity-30" />
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-medium">Загрузка приглашения...</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat history - shown inline on mobile only */}
          <div className="lg:hidden px-2 pb-4">
            {messages.length > 0 && (
              <>
                {/* Chat header */}
                <div className="p-2 mb-3 flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">{invitationData.title}</h3>
                    <p className="text-[10px] text-muted-foreground">История диалога</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={cn("flex gap-2", message.role === "user" ? "flex-row-reverse" : "")}>
                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-purple-500 to-pink-500 text-white")}>
                        {message.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      <div className={cn("rounded-2xl px-3 py-2 max-w-[85%]", message.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-white dark:bg-muted rounded-tl-sm shadow-sm")}>
                        <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                      </div>
                    </div>
                  ))}

                  {isProcessing && (
                    <div className="flex gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                        <Wand2 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="bg-white dark:bg-muted rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                          <span className="text-xs text-purple-600">{progressMessages[progressStage]}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Desktop sidebar - chat panel */}
        <div className="hidden lg:flex w-[400px] xl:w-[450px] border-l border-border flex-col bg-background">
          {/* Chat header */}
          <div className="p-3 border-b border-border flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">{invitationData.title}</h3>
              <p className="text-xs text-muted-foreground">Опишите что хотите изменить</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatScrollRef} className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex gap-3", message.role === "user" ? "flex-row-reverse" : "")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-gradient-to-br from-purple-500 to-pink-500 text-white")}>
                  {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={cn("rounded-2xl px-4 py-3 max-w-[85%]", message.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm")}>
                  <div className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                  <Wand2 className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl rounded-tl-sm px-4 py-3 border border-purple-200/50">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">{progressMessages[progressStage]}</span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-purple-100 dark:bg-purple-900/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${((progressStage + 1) / progressMessages.length) * 100}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop input area */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Опишите изменения..."
                  disabled={isProcessing || !hasAnyProvider}
                  className="min-h-[44px] max-h-[120px] pr-12 resize-none"
                  rows={1}
                />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8" disabled>
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </Button>
              </div>
              {/* Send / Stop buttons */}
              {isProcessing ? (
                <Button 
                  onClick={handleStopGeneration} 
                  size="icon" 
                  className="h-[44px] w-[44px] bg-red-500 hover:bg-red-600"
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!chatInput.trim() || !hasAnyProvider} 
                  size="icon" 
                  className="h-[44px] w-[44px] bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile sticky input - only the input box */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-40">
          <div className="p-2">
            <div className="flex gap-1.5">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Опишите изменения..."
                  disabled={isProcessing || !hasAnyProvider}
                  className="min-h-[36px] max-h-[80px] pr-9 resize-none text-sm"
                  rows={1}
                />
                <Button size="icon" variant="ghost" className="absolute right-0.5 top-0.5 h-7 w-7" disabled>
                  <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
              {/* Send / Stop buttons - mobile */}
              {isProcessing ? (
                <Button 
                  onClick={handleStopGeneration} 
                  size="icon" 
                  className="h-[36px] w-[36px] bg-red-500 hover:bg-red-600"
                >
                  <Square className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!chatInput.trim() || !hasAnyProvider} 
                  size="icon" 
                  className="h-[36px] w-[36px] bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Package Selector Modal */}
      <AIPackageSelector
        open={showPackageSelector}
        onOpenChange={setShowPackageSelector}
        weddingId={invitationId}
        mode="package"
      />

      {/* AI Edits Exhausted Modal */}
      {packageStatus && (
        <AIEditsExhaustedDialog
          open={showEditsExhausted}
          onOpenChange={setShowEditsExhausted}
          weddingId={invitationId}
          editsUsed={packageStatus.editsUsed}
          editsLimit={packageStatus.editsLimit}
        />
      )}
      
      {/* Russia Warning Modal */}
      <RussiaWarningModal
        open={showRussiaWarning}
        onClose={() => setShowRussiaWarning(false)}
        isAIWarning={true}
      />
    </div>
  );
}

