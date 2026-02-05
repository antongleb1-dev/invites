import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  RefreshCw,
  Wand2,
  Settings,
  Square,
  Check,
  Lock,
  Music,
  Video
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AIPackageSelector, AIEditsExhaustedDialog, AIEditsCounter } from "@/components/AIPackageSelector";
import { AuthDialog } from "@/components/AuthDialog";

type ViewMode = "mobile" | "tablet" | "desktop";
type AIProvider = "claude" | "openai";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function CreateAI() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // View mode for preview
  const [viewMode, setViewMode] = useState<ViewMode>("mobile");
  
  // AI provider - OpenAI (ChatGPT-4) is default
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
    "🎨 Создаю уникальный дизайн...",
    "📐 Выстраиваю структуру...",
    "🖌️ Применяю стили...",
    "🌈 Добавляю акценты...",
    "📱 Адаптирую под мобильные...",
    "✅ Финальные штрихи...",
  ];
  
  // Generated HTML
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  
  // Auto-save state
  const [savedInvitationId, setSavedInvitationId] = useState<number | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  
  // Save dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Uploaded files
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; type: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // AI Package state
  const [showPackageSelector, setShowPackageSelector] = useState(false);
  const [showEditsExhausted, setShowEditsExhausted] = useState(false);
  
  // Free messages counter (before requiring package)
  const FREE_MESSAGES_LIMIT = 1; // 1 бесплатное сообщение для первой генерации
  const [freeMessagesUsed, setFreeMessagesUsed] = useState(0);
  
  // Auth dialog
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const pendingMessageRef = useRef<string | null>(null);
  
  // Abort controller for cancelling requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Refs
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // tRPC
  const { data: providersData, isLoading: isLoadingProviders } = trpc.ai.getProviders.useQuery();
  
  // AI Package status (only query if we have a saved invitation)
  const { data: packageStatus, refetch: refetchPackageStatus } = trpc.ai.getPackageStatus.useQuery(
    { weddingId: savedInvitationId! },
    { enabled: !!savedInvitationId && isAuthenticated }
  );
  
  const incrementEditsMutation = trpc.ai.incrementEditCount.useMutation();
  const chatMutation = trpc.ai.chat.useMutation();
  const saveMutation = trpc.ai.saveHtml.useMutation();
  const updateMutation = trpc.ai.updateHtml.useMutation();

  // Initialize with welcome message
  useEffect(() => {
    if (providersData?.welcomeMessage && messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: providersData.welcomeMessage,
        timestamp: new Date(),
      }]);
      
      // Set default provider
      if (providersData.defaultProvider) {
        setProvider(providersData.defaultProvider);
      }
    }
  }, [providersData]);

  // Ref to track if we should auto-send
  const pendingAutoSendRef = useRef<string | null>(null);
  
  // Check for saved prompt from home page
  useEffect(() => {
    const savedPrompt = localStorage.getItem('bookme_ai_prompt');
    if (savedPrompt && providersData && messages.length <= 1 && !isProcessing) {
      // Clear the saved prompt
      localStorage.removeItem('bookme_ai_prompt');
      // Store for auto-send
      pendingAutoSendRef.current = savedPrompt;
      // Set the prompt in the input
      setChatInput(savedPrompt);
    }
  }, [providersData, messages.length, isProcessing]);
  
  // Auto-send when chatInput is set from saved prompt
  useEffect(() => {
    if (pendingAutoSendRef.current && chatInput === pendingAutoSendRef.current && !isProcessing && providersData) {
      pendingAutoSendRef.current = null;
      // Trigger send after a short delay
      const timer = setTimeout(() => {
        const sendBtn = document.querySelector('[data-ai-send-btn]') as HTMLButtonElement;
        if (sendBtn && !sendBtn.disabled) {
          sendBtn.click();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [chatInput, isProcessing, providersData]);

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
    }, 2500); // Change message every 2.5 seconds
    
    return () => clearInterval(interval);
  }, [isProcessing, progressMessages.length]);

  // Auto-save ref to track current invitation ID
  const savedIdRef = useRef<number | null>(null);
  
  // Sync ref with state
  useEffect(() => {
    savedIdRef.current = savedInvitationId;
  }, [savedInvitationId]);

  // Track auto-save state
  const autoSaveInProgressRef = useRef<boolean>(false);
  const pendingAutoSaveRef = useRef<string | null>(null);
  const messagesRef = useRef(messages);
  
  // Keep messages ref updated
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Auto-save when HTML changes (for authenticated users only)
  // Saves immediately after first generation, then debounced for updates
  useEffect(() => {
    // Only auto-save for authenticated users with generated HTML
    if (!generatedHtml || !isAuthenticated) {
      console.log('[AutoSave] Skipped - no HTML:', !generatedHtml, 'not authenticated:', !isAuthenticated);
      return;
    }
    
    // Store pending HTML
    pendingAutoSaveRef.current = generatedHtml;
    
    // If save is already in progress, it will pick up the latest HTML when done
    if (autoSaveInProgressRef.current) {
      console.log('[AutoSave] Save in progress, queuing latest HTML');
      return;
    }
    
    const performSave = async () => {
      const htmlToSave = pendingAutoSaveRef.current;
      if (!htmlToSave) {
        console.log('[AutoSave] No HTML to save');
        return;
      }
      
      autoSaveInProgressRef.current = true;
      console.log('[AutoSave] Starting save process...');
      
      try {
        // Prepare chat history from ref (current state)
        const chatHistory = messagesRef.current
          .filter(m => m.id !== 'welcome')
          .map(m => ({ role: m.role, content: m.content }));
        
        if (savedIdRef.current) {
          // Update existing invitation silently
          console.log('[AutoSave] Updating existing invitation:', savedIdRef.current);
          await updateMutation.mutateAsync({
            id: savedIdRef.current,
            html: htmlToSave,
            chatHistory,
          });
          console.log('[AutoSave] Updated successfully');
        } else {
          // Create new invitation with auto-generated slug (draft)
          const autoSlug = `ai-${Date.now()}`;
          const autoTitle = 'AI приглашение (черновик)';
          
          console.log('[AutoSave] Creating new draft with slug:', autoSlug);
          
          const result = await saveMutation.mutateAsync({
            html: htmlToSave,
            slug: autoSlug,
            title: autoTitle,
            chatHistory,
          });
          
          savedIdRef.current = result.id;
          setSavedInvitationId(result.id);
          setSlug(autoSlug);
          setTitle(autoTitle);
          
          console.log('[AutoSave] Draft created! ID:', result.id, 'Slug:', result.slug);
        }
        
        setLastSaveTime(new Date());
        
        // Check if there's newer HTML to save
        if (pendingAutoSaveRef.current !== htmlToSave) {
          console.log('[AutoSave] New changes detected, saving again...');
          autoSaveInProgressRef.current = false;
          performSave();
          return;
        }
        
        pendingAutoSaveRef.current = null;
      } catch (error: any) {
        console.error('[AutoSave] Error:', error.message || error);
        // Keep pending HTML for retry on next change
      } finally {
        autoSaveInProgressRef.current = false;
      }
    };
    
    // First save is immediate (500ms), subsequent saves are debounced (2s)
    const isFirstSave = !savedIdRef.current;
    const debounceTime = isFirstSave ? 500 : 2000;
    
    console.log(`[AutoSave] Scheduling save in ${debounceTime}ms (firstSave: ${isFirstSave})`);
    
    const timer = setTimeout(performSave, debounceTime);
    
    return () => {
      console.log('[AutoSave] Clearing timer');
      clearTimeout(timer);
    };
  }, [generatedHtml, isAuthenticated]);

  // Stop/Cancel generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsProcessing(false);
    setWasCancelled(true);
    
    // Add cancellation message
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

    // Require authentication for AI generation (tokens cost money)
    if (!isAuthenticated) {
      pendingMessageRef.current = chatInput;
      setShowAuthRequired(true);
      return;
    }

    // ЛИМИТЫ AI СООБЩЕНИЙ:
    // 1. Если есть пакет — проверяем лимит пакета
    // 2. Если нет пакета — даём FREE_MESSAGES_LIMIT бесплатных, потом требуем пакет
    
    if (savedInvitationId && packageStatus) {
      // Есть сохранённое приглашение — проверяем пакет
      if (!packageStatus.hasPackage) {
        // Нет пакета — проверяем бесплатный лимит
        if (freeMessagesUsed >= FREE_MESSAGES_LIMIT) {
          setShowPackageSelector(true);
          return;
        }
      } else if (packageStatus.editsRemaining <= 0) {
        // Есть пакет, но лимит исчерпан
        setShowEditsExhausted(true);
        return;
      }
    } else if (generatedHtml) {
      // HTML уже есть, но приглашение ещё не сохранено — проверяем бесплатный лимит
      if (freeMessagesUsed >= FREE_MESSAGES_LIMIT) {
        // Принудительно сохраняем и показываем диалог покупки пакета
        toast.info("Для продолжения работы с AI необходимо приобрести пакет");
        // Подождём авто-сохранение и покажем диалог
        setTimeout(() => setShowPackageSelector(true), 1000);
        return;
      }
    }

    // Reset cancellation flag
    setWasCancelled(false);
    
    // Create new abort controller
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
      // Include uploaded files info in the context with absolute URLs
      const baseUrl = window.location.origin;
      const filesContext = uploadedFiles.length > 0 
        ? `\n\n[ВАЖНО! Загруженные файлы - используй эти ТОЧНЫЕ URL в HTML:
${uploadedFiles.map(f => {
  const absoluteUrl = f.url.startsWith('http') ? f.url : `${baseUrl}${f.url}`;
  if (f.type.startsWith('audio/')) {
    return `- АУДИО "${f.name}": <audio src="${absoluteUrl}" autoplay loop controls></audio>`;
  } else if (f.type.startsWith('video/')) {
    return `- ВИДЕО "${f.name}": <video src="${absoluteUrl}" autoplay loop muted playsinline></video>`;
  }
  return `- ФОТО "${f.name}": <img src="${absoluteUrl}" />`;
}).join('\n')}]`
        : '';
      
      const messagesWithFiles = newMessages.map((m, i) => ({
        role: m.role,
        content: i === newMessages.length - 1 && m.role === 'user' && uploadedFiles.length > 0
          ? m.content + filesContext
          : m.content,
      }));

      const result = await chatMutation.mutateAsync({
        provider,
        messages: messagesWithFiles,
        currentHtml: generatedHtml,
      });

      // Check if cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Increment counters
      if (savedInvitationId && packageStatus?.hasPackage) {
        // Increment package edit count
        incrementEditsMutation.mutate({ weddingId: savedInvitationId });
        refetchPackageStatus();
      } else {
        // Increment free messages counter
        setFreeMessagesUsed(prev => prev + 1);
      }

      // Update HTML if generated
      if (result.html) {
        setGeneratedHtml(result.html);
        toast.success("Приглашение обновлено!");
      }
      
      // Clear uploaded files after successful send
      setUploadedFiles([]);
    } catch (error: any) {
      // Don't show error if cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      toast.error(error.message || "Ошибка при отправке сообщения");
      // Remove user message on error
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
    const isMobile = window.innerWidth < 768;
    const maxHeight = isMobile ? 200 : 120; // Higher max on mobile for longer prompts
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
    textarea.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
  };

  // Reset conversation
  const handleReset = () => {
    setMessages([]);
    setGeneratedHtml(null);
    setUploadedFiles([]);
    if (providersData?.welcomeMessage) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: providersData.welcomeMessage,
        timestamp: new Date(),
      }]);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedList: Array<{ name: string; url: string; type: string }> = [];

      for (const file of Array.from(files)) {
        // Check file size (100MB max)
        if (file.size > 100 * 1024 * 1024) {
          toast.error(`Файл ${file.name} слишком большой. Максимум 100MB`);
          continue;
        }

        // Create FormData
        const formData = new FormData();
        formData.append('file', file);

        // Upload to server
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (!response.ok) {
          toast.error(data.error || `Ошибка загрузки файла ${file.name}`);
          continue;
        }

        uploadedList.push({
          name: file.name,
          url: data.url,
          type: file.type || data.type,
        });
      }

      if (uploadedList.length > 0) {
        setUploadedFiles(prev => [...prev, ...uploadedList]);
        
        // Add message about uploaded files with type info
        const fileDescriptions = uploadedList.map(f => {
          if (f.type.startsWith('audio/')) return `🎵 ${f.name}`;
          if (f.type.startsWith('video/')) return `🎬 ${f.name}`;
          return `🖼️ ${f.name}`;
        }).join(', ');
        
        const uploadMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: `📎 Загружены файлы: ${fileDescriptions}\n\nИспользуй их в приглашении.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, uploadMessage]);

        toast.success(`Загружено файлов: ${uploadedList.length}`);
      }
    } catch (error: any) {
      console.error('[Upload] Error:', error);
      toast.error(error.message || "Ошибка при загрузке файлов");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Trigger file input
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Open save dialog (or auth dialog for guests)
  const handleOpenSaveDialog = () => {
    if (!generatedHtml) {
      toast.error("Сначала создайте приглашение");
      return;
    }
    setShowSaveDialog(true);
  };
  
  // Handle successful auth - auto-send pending message
  const handleAuthSuccess = async () => {
    setShowAuthRequired(false);
    
    // If there's a pending message, reload to trigger auto-send
    if (pendingMessageRef.current) {
      localStorage.setItem('bookme_ai_prompt', pendingMessageRef.current);
      pendingMessageRef.current = null;
      window.location.reload();
    } else if (generatedHtml) {
      // After auth, open save dialog if there's already HTML
      setShowSaveDialog(true);
    }
  };

  // Save invitation (manual save with custom slug/title)
  const handleSaveInvitation = async () => {
    if (!generatedHtml || !slug.trim() || !title.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    setIsSaving(true);

    try {
      // Prepare chat history for saving
      const chatHistory = messages
        .filter(m => m.id !== 'welcome') // Exclude welcome message
        .map(m => ({ role: m.role, content: m.content }));

      const finalSlug = slug.trim();
      const finalTitle = title.trim();
      
      if (savedInvitationId) {
        // Update existing invitation with new title/slug
        const result = await updateMutation.mutateAsync({
          id: savedInvitationId,
          html: generatedHtml,
          title: finalTitle,
          slug: finalSlug,
          chatHistory,
        });
        
        toast.success("Приглашение сохранено!");
        setShowSaveDialog(false);
        setLocation(`/manage/${result.slug || finalSlug}`);
      } else {
        // Create new invitation
        const wedding = await saveMutation.mutateAsync({
          html: generatedHtml,
          slug: finalSlug,
          title: finalTitle,
          chatHistory,
        });

        setSavedInvitationId(wedding.id);
        savedIdRef.current = wedding.id;
        
        toast.success("Приглашение сохранено!");
        setShowSaveDialog(false);
        setLocation(`/manage/${wedding.slug}`);
      }
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

  // Show loading while checking providers
  if (isLoadingProviders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            {/* Left - Logo with AI badge */}
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <Link href="/">
                <span className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors cursor-pointer">
                  <Heart className="w-5 h-5 text-primary fill-primary flex-shrink-0" />
                  <span className="font-['Playfair_Display'] font-bold hidden sm:inline">Invites</span>
                </span>
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

              <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 w-7 p-0">
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>

              {/* AI Edits Counter */}
              {savedInvitationId && packageStatus?.hasPackage && (
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-300/30">
                  <AIEditsCounter 
                    editsUsed={packageStatus.editsUsed} 
                    editsLimit={packageStatus.editsLimit}
                    className="text-xs"
                  />
                </div>
              )}

              {/* Buy package button - show when no package */}
              {savedInvitationId && !packageStatus?.hasPackage && (
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

              {/* Save button - always visible when there's HTML */}
              {generatedHtml && (
                <Button size="sm" onClick={handleOpenSaveDialog} className="h-7 px-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Save className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Сохранить</span>
                </Button>
              )}

              <Link href="/create">
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Settings className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Auth required banner for guests */}
      {!authLoading && !isAuthenticated && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-300/30 px-4 py-3">
          <div className="container flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Войдите, чтобы создать приглашение с AI</span>
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowAuthRequired(true)}
              className="h-7 px-3 text-xs bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Войти
            </Button>
          </div>
        </div>
      )}

      {/* No AI configured warning */}
      {!hasAnyProvider && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 px-4 py-3">
          <div className="container flex items-center gap-2 text-yellow-600">
            <AlertCircle className="w-5 h-5" />
            <span>
              AI не настроен. Добавьте <code className="bg-yellow-500/20 px-1 rounded">ANTHROPIC_API_KEY</code> или{" "}
              <code className="bg-yellow-500/20 px-1 rounded">OPENAI_API_KEY</code> в переменные окружения.
            </span>
          </div>
        </div>
      )}

      {/* Main workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Preview area - scrollable, includes chat history on mobile */}
        <div className="flex-1 bg-muted/30 overflow-auto pb-[120px] lg:pb-4">
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
                  <p className="text-base sm:text-lg font-medium">Превью появится здесь</p>
                  <p className="text-xs sm:text-sm text-center px-4">Опишите ваше мероприятие в чате</p>
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
                    <h3 className="font-semibold text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Дизайнер</h3>
                    <p className="text-[10px] text-muted-foreground">История диалога</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-2",
                        message.role === "user" ? "flex-row-reverse" : ""
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                        )}
                      >
                        {message.role === "user" ? (
                          <User className="w-3.5 h-3.5" />
                        ) : (
                          <Bot className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div
                        className={cn(
                          "rounded-2xl px-3 py-2 max-w-[85%]",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-white dark:bg-muted rounded-tl-sm shadow-sm"
                        )}
                      >
                        <div 
                          className="text-sm whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: message.content
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\n/g, '<br/>')
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {/* Progress indicator */}
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
            <div>
              <h3 className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI Дизайнер</h3>
              <p className="text-xs text-muted-foreground">Создаю уникальные приглашения</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatScrollRef} className="flex-1 overflow-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                  )}
                >
                  {message.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 max-w-[85%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted rounded-tl-sm"
                  )}
                >
                  <div 
                    className="text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
                    }}
                  />
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

          {/* Quick suggestions */}
          {messages.length <= 2 && !generatedHtml && (
            <div className="px-4 py-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Быстрый старт:</p>
              <div className="flex flex-wrap gap-2">
                {["Свадьба", "День рождения", "Корпоратив", "Сүндет той"].map((s) => (
                  <button key={s} onClick={() => setChatInput(s)} className="px-3 py-1.5 text-xs bg-accent hover:bg-accent/80 rounded-full" disabled={isProcessing}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop input area */}
          <div className="p-3 border-t border-border">
            <input ref={fileInputRef} type="file" multiple accept="image/*,audio/*,video/*" onChange={handleFileUpload} className="hidden" />
            {uploadedFiles.length > 0 && (
              <div className="flex gap-2 mb-2 overflow-x-auto">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs">
                    {f.type.startsWith('image/') ? (
                      <img src={f.url} alt={f.name} className="w-6 h-6 rounded object-cover" />
                    ) : f.type.startsWith('audio/') ? (
                      <Music className="w-4 h-4 text-purple-500" />
                    ) : f.type.startsWith('video/') ? (
                      <Video className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    <span className="max-w-[100px] truncate">{f.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={chatInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Опишите мероприятие..."
                  disabled={isProcessing || !hasAnyProvider}
                  className="min-h-[44px] pr-12 resize-none"
                  style={{ height: 'auto', overflowY: 'hidden' }}
                  rows={1}
                />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8" onClick={handleUploadClick} disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-muted-foreground" />}
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
                  data-ai-send-btn 
                  onClick={handleSendMessage} 
                  disabled={!chatInput.trim() || !hasAnyProvider || isProcessing} 
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
          {/* Quick suggestions */}
          {messages.length <= 2 && !generatedHtml && (
            <div className="px-2 py-1.5 border-b border-border">
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                {["💒 Свадьба", "🎂 День рождения", "🏢 Корпоратив", "👶 Сүндет той"].map((s) => (
                  <button key={s} onClick={() => setChatInput(s.split(' ').slice(1).join(' '))} className="px-2.5 py-1 text-[11px] bg-accent hover:bg-accent/80 rounded-full whitespace-nowrap flex-shrink-0" disabled={isProcessing}>{s}</button>
                ))}
              </div>
            </div>
          )}


          {/* Uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="px-2 py-1.5 border-b border-border">
              <div className="flex gap-1.5 overflow-x-auto">
                {uploadedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-[10px] flex-shrink-0">
                    {f.type.startsWith('image/') ? (
                      <img src={f.url} alt={f.name} className="w-5 h-5 rounded object-cover" />
                    ) : f.type.startsWith('audio/') ? (
                      <Music className="w-3.5 h-3.5 text-purple-500" />
                    ) : f.type.startsWith('video/') ? (
                      <Video className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    <span className="max-w-[60px] truncate">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-2">
            <input ref={fileInputRef} type="file" multiple accept="image/*,audio/*,video/*" onChange={handleFileUpload} className="hidden" />
            <div className="flex gap-1.5">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  value={chatInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Опишите мероприятие..."
                  disabled={isProcessing || !hasAnyProvider}
                  className="min-h-[36px] pr-9 resize-none text-sm"
                  style={{ height: 'auto', overflowY: 'hidden' }}
                  rows={1}
                />
                <Button size="icon" variant="ghost" className="absolute right-0.5 top-0.5 h-7 w-7" onClick={handleUploadClick} disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5 text-muted-foreground" />}
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
                  data-ai-send-btn 
                  onClick={handleSendMessage} 
                  disabled={!chatInput.trim() || !hasAnyProvider || isProcessing} 
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

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сохранить приглашение</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Название приглашения</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Свадьба Александра и Марии"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="slug">URL приглашения</Label>
              <div className="flex items-center mt-2">
                <span className="text-muted-foreground text-sm mr-2">invites.kz/</span>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="alexander-maria"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Только латинские буквы, цифры и дефис
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveInvitation} disabled={isSaving || !slug.trim() || !title.trim()}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Package Selector Modal - show when invitation exists OR when free limit reached */}
      <AIPackageSelector
        open={showPackageSelector}
        onOpenChange={setShowPackageSelector}
        weddingId={savedInvitationId || 0}
        mode="package"
      />

      {/* AI Edits Exhausted Modal */}
      {savedInvitationId && packageStatus && (
        <AIEditsExhaustedDialog
          open={showEditsExhausted}
          onOpenChange={setShowEditsExhausted}
          weddingId={savedInvitationId}
          editsUsed={packageStatus.editsUsed}
          editsLimit={packageStatus.editsLimit}
        />
      )}
      
      {/* Auth Dialog */}
      <AuthDialog
        open={showAuthRequired}
        onOpenChange={setShowAuthRequired}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
