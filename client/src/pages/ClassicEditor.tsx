import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HexColorPicker } from "react-colorful";
import { trpc } from "@/lib/trpc";
import {
  Heart,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Languages,
  Eye,
  Copy,
  ExternalLink,
  MessageCircle,
  Gift,
  Users,
  Palette,
  FileText,
  Settings,
  Share2,
  Check,
  Baby,
  Wine,
  Camera,
  Loader2,
  Layout,
  Image as ImageIcon,
  Music,
  Video,
  Clock,
  Timer,
  Utensils,
  Shirt,
  Phone,
  QrCode,
  Info,
  GripVertical,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Star,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { getAllTemplates } from "@shared/templates";

// Timeline item type
interface TimelineItem {
  time: string;
  title: string;
  titleKz?: string;
  description?: string;
  descriptionKz?: string;
}

// Menu item type
interface MenuItem {
  name: string;
  nameKz?: string;
  description?: string;
  descriptionKz?: string;
  isHalal?: boolean;
  category?: string;
}

// WhatsApp and Telegram SVG icons
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

export default function ClassicEditor() {
  const [, params] = useRoute("/classic-editor/:id");
  const weddingId = params?.id ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { language, setLanguage } = useLanguage();

  const { data: wedding, isLoading, refetch } = trpc.wedding.getById.useQuery(
    { id: weddingId! },
    { enabled: !!weddingId }
  );

  const { data: gallery } = trpc.gallery.list.useQuery(
    { weddingId: weddingId! },
    { enabled: !!weddingId }
  );

  const utils = trpc.useUtils();

  const updateMutation = trpc.wedding.update.useMutation({
    onSuccess: () => {
      toast.success(language === 'kz' ? "Сақталды!" : "Сохранено!");
      refetch();
    },
    onError: (error) => {
      // Parse Zod validation errors
      let errorMessage = language === 'kz' ? "Қате" : "Ошибка";
      try {
        const parsed = JSON.parse(error.message);
        if (Array.isArray(parsed) && parsed.length > 0) {
          errorMessage = parsed[0].message || errorMessage;
        }
      } catch {
        errorMessage = error.message || errorMessage;
      }
      toast.error(errorMessage);
    },
  });

  const addImageMutation = trpc.gallery.add.useMutation({
    onSuccess: () => {
      toast.success("Фото добавлено!");
      utils.gallery.list.invalidate();
      setGalleryForm({ imageUrl: "", caption: "", captionKz: "" });
    },
  });

  const deleteImageMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("Фото удалено");
      utils.gallery.list.invalidate();
    },
  });

  // Form state - Content
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    titleKz: "",
    date: "",
    location: "",
    locationKz: "",
    mapUrl: "",
    description: "",
    descriptionKz: "",
    backgroundImage: "",
    showHeart: false,
    headerIcon: "none" as "none" | "heart" | "crescent" | "star" | "sparkle" | "party",
    templateId: "",
    // Block visibility
    showRsvp: true,
    showWishlist: true,
    showWishes: true,
    showCountdown: true,
    // Block order (JSON string)
    blockOrder: "" as string,
    // Event options
    childrenPolicy: "neutral" as "neutral" | "allowed" | "not_allowed",
    alcoholPolicy: "neutral" as "neutral" | "allowed" | "not_allowed",
    photoPolicy: "neutral" as "neutral" | "allowed" | "not_allowed",
    // Additional blocks
    showTimeline: false,
    showMenu: false,
    showDressCode: false,
    showCoordinator: false,
    showQrCode: false,
    showLocationDetails: false,
    dressCode: "",
    dressCodeKz: "",
    coordinatorName: "",
    coordinatorPhone: "",
    coordinatorEmail: "",
    qrCodeData: "",
    locationDetails: "",
    locationDetailsKz: "",
    // Design customization
    customFont: "",
    customColor: "",
    textColor: "",
    themeColor: "",
    buttonColor: "",
    buttonTextColor: "",
    photoShape: "square" as string,
    customBackgroundUrl: "",
    musicUrl: "",
    videoUrl: "",
    loveStory: "",
    loveStoryKz: "",
  });

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [galleryForm, setGalleryForm] = useState({ imageUrl: "", caption: "", captionKz: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [customBackgroundDeleted, setCustomBackgroundDeleted] = useState(false); // Track if user deleted custom background
  const [activeTab, setActiveTab] = useState("content");
  
  // Block order for drag & drop
  // Note: "interactive" combines RSVP + Wishlist + Wishes as they are one tabbed section on the page
  const defaultBlockOrder = ["countdown", "gallery", "timeline", "menu", "dressCode", "info", "eventOptions", "interactive"];
  const [blockOrder, setBlockOrder] = useState<string[]>(defaultBlockOrder);
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  
  const blockLabels: Record<string, { icon: React.ReactNode; label: string }> = {
    countdown: { icon: <Timer className="w-4 h-4" />, label: "Таймер" },
    gallery: { icon: <ImageIcon className="w-4 h-4" />, label: "Галерея" },
    timeline: { icon: <Clock className="w-4 h-4" />, label: "Программа" },
    menu: { icon: <Utensils className="w-4 h-4" />, label: "Меню" },
    dressCode: { icon: <Shirt className="w-4 h-4" />, label: "Дресс-код" },
    info: { icon: <Info className="w-4 h-4" />, label: "Информация" },
    eventOptions: { icon: <Settings className="w-4 h-4" />, label: "Опции" },
    interactive: { icon: <Users className="w-4 h-4" />, label: "RSVP / Подарки / Пожелания" },
  };
  
  const handleDragStart = (blockId: string) => {
    setDraggedBlock(blockId);
  };
  
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedBlock || draggedBlock === targetId) return;
    
    setBlockOrder(prev => {
      const newOrder = [...prev];
      const draggedIndex = newOrder.indexOf(draggedBlock);
      const targetIndex = newOrder.indexOf(targetId);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedBlock);
      
      return newOrder;
    });
  };
  
  const handleDragEnd = () => {
    setDraggedBlock(null);
  };
  
  // Sync blockOrder state to formData whenever it changes (only after data is loaded)
  useEffect(() => {
    if (!isDataLoaded) return; // Don't sync until data is loaded from DB
    setFormData(prev => ({ ...prev, blockOrder: JSON.stringify(blockOrder) }));
  }, [blockOrder, isDataLoaded]);
  
  // Touch drag & drop handlers
  const [touchDraggedBlock, setTouchDraggedBlock] = useState<string | null>(null);
  const [touchStartY, setTouchStartY] = useState(0);
  
  const handleTouchStart = (blockId: string, e: React.TouchEvent) => {
    setTouchDraggedBlock(blockId);
    setTouchStartY(e.touches[0].clientY);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDraggedBlock) return;
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const targetBlock = elements.find(el => el.getAttribute('data-block-id'));
    
    if (targetBlock) {
      const targetId = targetBlock.getAttribute('data-block-id');
      if (targetId && targetId !== touchDraggedBlock) {
        setBlockOrder(prev => {
          const newOrder = [...prev];
          const draggedIndex = newOrder.indexOf(touchDraggedBlock);
          const targetIndex = newOrder.indexOf(targetId);
          
          if (draggedIndex === -1 || targetIndex === -1) return prev;
          
          newOrder.splice(draggedIndex, 1);
          newOrder.splice(targetIndex, 0, touchDraggedBlock);
          
          return newOrder;
        });
      }
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    setTouchDraggedBlock(null);
  };

  // Read active tab from URL or localStorage on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl && ['content', 'design', 'blocks', 'media', 'share'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
      return;
    }
    if (weddingId) {
      const savedTab = localStorage.getItem(`editor-tab-${weddingId}`);
      if (savedTab && ['content', 'design', 'blocks', 'media', 'share'].includes(savedTab)) {
        setActiveTab(savedTab);
      }
    }
  }, [weddingId]);

  // Save active tab to localStorage and URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (weddingId) {
      localStorage.setItem(`editor-tab-${weddingId}`, tab);
    }
    // Update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  };

  // Templates
  const templates = getAllTemplates();

  useEffect(() => {
    if (wedding && !isDataLoaded) {
      setFormData({
        slug: wedding.slug,
        title: wedding.title,
        titleKz: wedding.titleKz || "",
        date: wedding.date ? new Date(wedding.date).toISOString().slice(0, 16) : "",
        location: wedding.location || "",
        locationKz: wedding.locationKz || "",
        mapUrl: wedding.mapUrl || "",
        description: wedding.description || "",
        descriptionKz: wedding.descriptionKz || "",
        backgroundImage: wedding.backgroundImage || "",
        showHeart: wedding.showHeart !== false,
        headerIcon: (wedding as any).headerIcon || "none",
        templateId: wedding.templateId || "",
        // Block visibility
        showRsvp: (wedding as any).showRsvp !== false,
        showWishlist: (wedding as any).showWishlist !== false,
        showWishes: (wedding as any).showWishes !== false,
        showCountdown: (wedding as any).showCountdown !== false,
        blockOrder: (wedding as any).blockOrder || "",
        // Event options
        childrenPolicy: (wedding as any).childrenPolicy || "neutral",
        alcoholPolicy: (wedding as any).alcoholPolicy || "neutral",
        photoPolicy: (wedding as any).photoPolicy || "neutral",
        // Additional blocks
        showTimeline: wedding.showTimeline || false,
        showMenu: wedding.showMenu || false,
        showDressCode: wedding.showDressCode || false,
        showCoordinator: wedding.showCoordinator || false,
        showQrCode: wedding.showQrCode || false,
        showLocationDetails: wedding.showLocationDetails || false,
        dressCode: wedding.dressCode || "",
        dressCodeKz: wedding.dressCodeKz || "",
        coordinatorName: wedding.coordinatorName || "",
        coordinatorPhone: wedding.coordinatorPhone || "",
        coordinatorEmail: wedding.coordinatorEmail || "",
        qrCodeData: wedding.qrCodeData || "",
        locationDetails: wedding.locationDetails || "",
        locationDetailsKz: wedding.locationDetailsKz || "",
        // Design customization
        customFont: wedding.customFont || "",
        customColor: wedding.customColor || "",
        textColor: (wedding as any).textColor || "",
        themeColor: wedding.themeColor || "",
        buttonColor: wedding.buttonColor || "",
        buttonTextColor: wedding.buttonTextColor || "",
        photoShape: wedding.photoShape || "square",
        customBackgroundUrl: wedding.customBackgroundUrl || "",
        musicUrl: wedding.musicUrl || "",
        videoUrl: wedding.videoUrl || "",
        loveStory: wedding.loveStory || "",
        loveStoryKz: wedding.loveStoryKz || "",
      });

      if (wedding.timelineData) {
        try { setTimeline(JSON.parse(wedding.timelineData)); } catch (e) {}
      }
      if (wedding.menuData) {
        try { setMenu(JSON.parse(wedding.menuData)); } catch (e) {}
      }
      if (wedding.backgroundImage) {
        setImagePreview(wedding.backgroundImage);
      }
      // Parse block order with migration from old format
      if ((wedding as any).blockOrder) {
        try {
          const parsed = JSON.parse((wedding as any).blockOrder);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Migrate old format: replace separate rsvp/wishlist/wishes with single interactive
            const migratedOrder = parsed.filter((id: string) => !['rsvp', 'wishlist', 'wishes'].includes(id));
            if (parsed.some((id: string) => ['rsvp', 'wishlist', 'wishes'].includes(id)) && !migratedOrder.includes('interactive')) {
              const firstInteractiveIndex = parsed.findIndex((id: string) => ['rsvp', 'wishlist', 'wishes'].includes(id));
              migratedOrder.splice(Math.max(0, firstInteractiveIndex), 0, 'interactive');
            }
            // Ensure all default blocks exist
            defaultBlockOrder.forEach(block => {
              if (!migratedOrder.includes(block)) {
                migratedOrder.push(block);
              }
            });
            setBlockOrder(migratedOrder);
          }
        } catch (e) {}
      }
      setIsDataLoaded(true);
    }
  }, [wedding, isDataLoaded]);

  // Language mode from wedding
  const languageMode = (wedding as any)?.languageMode || 'both';
  const showRussian = languageMode === 'ru' || languageMode === 'both';
  const showKazakh = languageMode === 'kz' || languageMode === 'both';

  // Copy link handler
  const handleCopyLink = async () => {
    const link = `https://invites.kz/${formData.slug}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success(language === 'kz' ? "Көшірілді!" : "Скопировано!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Share handlers
  const handleWhatsAppShare = () => {
    const link = `https://invites.kz/${formData.slug}`;
    const text = language === 'kz' ? `Сізді шақырамыз! ${link}` : `Приглашаем вас! ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleTelegramShare = () => {
    const link = `https://invites.kz/${formData.slug}`;
    const text = language === 'kz' ? `Сізді шақырамыз!` : `Приглашаем вас!`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // Image handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: fd });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setGalleryForm({ ...galleryForm, imageUrl: data.url });
      toast.success("Фото загружено!");
    } catch (error) {
      toast.error("Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  const handleCustomBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: fd });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setFormData(prev => ({ ...prev, customBackgroundUrl: data.url }));
      toast.success("Фон загружен!");
    } catch (error) {
      toast.error("Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  // Timeline handlers
  const addTimelineItem = () => setTimeline([...timeline, { time: "", title: "", titleKz: "" }]);
  const removeTimelineItem = (index: number) => setTimeline(timeline.filter((_, i) => i !== index));
  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: string) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], [field]: value };
    setTimeline(updated);
  };
  const moveTimelineItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= timeline.length) return;
    const updated = [...timeline];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setTimeline(updated);
  };

  // Menu handlers
  const addMenuItem = () => setMenu([...menu, { name: "", nameKz: "", isHalal: false, category: "main" }]);
  const removeMenuItem = (index: number) => setMenu(menu.filter((_, i) => i !== index));
  const updateMenuItem = (index: number, field: keyof MenuItem, value: any) => {
    const updated = [...menu];
    updated[index] = { ...updated[index], [field]: value };
    setMenu(updated);
  };

  // Save handler
  const handleSubmit = async () => {
    let backgroundImageUrl = formData.backgroundImage;

    if (imageFile) {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", imageFile);
      try {
        const response = await fetch("/api/upload", { method: "POST", body: formDataUpload });
        if (!response.ok) throw new Error("Upload error");
        const data = await response.json();
        backgroundImageUrl = data.url;
      } catch (error) {
        toast.error("Ошибка загрузки изображения");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    updateMutation.mutate({
      id: weddingId!,
      slug: formData.slug || undefined,
      title: formData.title,
      titleKz: formData.titleKz || undefined,
      date: formData.date ? new Date(formData.date) : undefined,
      location: formData.location || undefined,
      locationKz: formData.locationKz || undefined,
      mapUrl: formData.mapUrl || undefined,
      description: formData.description || undefined,
      descriptionKz: formData.descriptionKz || undefined,
      backgroundImage: backgroundImageUrl || undefined,
      showHeart: formData.headerIcon === 'heart', // Legacy support
      headerIcon: formData.headerIcon,
      templateId: formData.templateId || undefined,
      // Block visibility
      showRsvp: formData.showRsvp,
      showWishlist: formData.showWishlist,
      showWishes: formData.showWishes,
      showCountdown: formData.showCountdown,
      blockOrder: formData.blockOrder || undefined,
      // Event options
      childrenPolicy: formData.childrenPolicy,
      alcoholPolicy: formData.alcoholPolicy,
      photoPolicy: formData.photoPolicy,
      // Additional blocks
      showTimeline: formData.showTimeline,
      timelineData: timeline.length > 0 ? JSON.stringify(timeline) : undefined,
      showMenu: formData.showMenu,
      menuData: menu.length > 0 ? JSON.stringify(menu) : undefined,
      showDressCode: formData.showDressCode,
      dressCode: formData.dressCode || undefined,
      dressCodeKz: formData.dressCodeKz || undefined,
      showCoordinator: formData.showCoordinator,
      coordinatorName: formData.coordinatorName || undefined,
      coordinatorPhone: formData.coordinatorPhone || undefined,
      coordinatorEmail: formData.coordinatorEmail || undefined,
      showQrCode: formData.showQrCode,
      qrCodeData: formData.qrCodeData || undefined,
      showLocationDetails: formData.showLocationDetails,
      locationDetails: formData.locationDetails || undefined,
      locationDetailsKz: formData.locationDetailsKz || undefined,
      // Design customization
      customFont: formData.customFont || undefined,
      customColor: formData.customColor || undefined,
      textColor: formData.textColor || undefined,
      themeColor: formData.themeColor || undefined,
      buttonColor: formData.buttonColor || undefined,
      buttonTextColor: formData.buttonTextColor || undefined,
      photoShape: formData.photoShape || undefined,
      // If user explicitly deleted custom background, send null to clear it in DB
      customBackgroundUrl: customBackgroundDeleted ? null : (formData.customBackgroundUrl || undefined),
      musicUrl: formData.musicUrl || undefined,
      videoUrl: formData.videoUrl || undefined,
      loveStory: formData.loveStory || undefined,
      loveStoryKz: formData.loveStoryKz || undefined,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader><CardTitle>Требуется авторизация</CardTitle></CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wedding || wedding.userId !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardHeader><CardTitle>Приглашение не найдено</CardTitle></CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Мои приглашения</span>
                </Button>
              </Link>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <h1 className="text-lg font-semibold truncate">{wedding.title}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={(val) => setLanguage(val as 'ru' | 'kz')}>
                <SelectTrigger className="w-[100px]">
                  <Languages className="w-4 h-4 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="kz">Қазақша</SelectItem>
                </SelectContent>
              </Select>
              
              <a href={`/${formData.slug}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Просмотр</span>
                </Button>
              </a>
              
              <Button size="sm" onClick={handleSubmit} disabled={updateMutation.isPending || uploading}>
                {updateMutation.isPending || uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Сохранить</span>
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Share Link Bar */}
          <div className="mt-3 flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="text-sm text-muted-foreground whitespace-nowrap">invites.kz/</span>
              <span className="text-sm font-medium truncate">{formData.slug}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant={copied ? "default" : "outline"} size="sm" onClick={handleCopyLink}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline ml-2">{copied ? "Скопировано" : "Копировать"}</span>
              </Button>
              <Button variant="outline" size="sm" onClick={handleWhatsAppShare} className="bg-[#25D366]/10 hover:bg-[#25D366]/20 border-[#25D366]/30">
                <WhatsAppIcon />
              </Button>
              <Button variant="outline" size="sm" onClick={handleTelegramShare} className="bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border-[#0088cc]/30">
                <TelegramIcon />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="max-w-5xl mx-auto">
          {/* Mobile: horizontal scroll, Desktop: grid */}
          <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="w-full h-auto p-1.5 bg-muted/80 rounded-xl flex sm:grid sm:grid-cols-5 gap-1 overflow-x-auto sm:overflow-visible">
              <TabsTrigger 
                value="content" 
                className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-3 sm:px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all min-w-[60px] sm:min-w-0"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="text-[10px] sm:text-sm font-medium whitespace-nowrap">Контент</span>
              </TabsTrigger>
              <TabsTrigger 
                value="design" 
                className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-3 sm:px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all min-w-[60px] sm:min-w-0"
              >
                <Palette className="w-4 h-4 shrink-0" />
                <span className="text-[10px] sm:text-sm font-medium whitespace-nowrap">Дизайн</span>
              </TabsTrigger>
              <TabsTrigger 
                value="blocks" 
                className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-3 sm:px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all min-w-[60px] sm:min-w-0"
              >
                <Layout className="w-4 h-4 shrink-0" />
                <span className="text-[10px] sm:text-sm font-medium whitespace-nowrap">Блоки</span>
              </TabsTrigger>
              <TabsTrigger 
                value="media" 
                className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-3 sm:px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all min-w-[60px] sm:min-w-0"
              >
                <ImageIcon className="w-4 h-4 shrink-0" />
                <span className="text-[10px] sm:text-sm font-medium whitespace-nowrap">Медиа</span>
              </TabsTrigger>
              <TabsTrigger 
                value="share" 
                className="flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-3 sm:px-4 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all min-w-[60px] sm:min-w-0"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span className="text-[10px] sm:text-sm font-medium whitespace-nowrap">Ссылка</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content Tab */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>URL адрес</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">invites.kz/</span>
                    <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="flex-1" />
                  </div>
                </div>

                {showRussian && (
                  <div className="space-y-2">
                    <Label>{languageMode === 'both' ? 'Название (русский)' : 'Название'}</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                )}
                {showKazakh && (
                  <div className="space-y-2">
                    <Label>{languageMode === 'both' ? 'Атауы (қазақша)' : 'Атауы'}</Label>
                    <Input value={formData.titleKz} onChange={(e) => setFormData({ ...formData, titleKz: e.target.value })} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Calendar className="w-4 h-4" />Дата и время</Label>
                  <Input type="datetime-local" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>

                {showRussian && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" />{languageMode === 'both' ? 'Место (русский)' : 'Место'}</Label>
                    <Input value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                )}
                {showKazakh && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MapPin className="w-4 h-4" />{languageMode === 'both' ? 'Орын (қазақша)' : 'Орын'}</Label>
                    <Input value={formData.locationKz} onChange={(e) => setFormData({ ...formData, locationKz: e.target.value })} />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Ссылка на карту</Label>
                  <Input value={formData.mapUrl} onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })} placeholder="https://go.2gis.com/..." />
                </div>

                {showRussian && (
                  <div className="space-y-2">
                    <Label>{languageMode === 'both' ? 'Описание (русский)' : 'Описание'}</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} />
                  </div>
                )}
                {showKazakh && (
                  <div className="space-y-2">
                    <Label>{languageMode === 'both' ? 'Сипаттама (қазақша)' : 'Сипаттама'}</Label>
                    <Textarea value={formData.descriptionKz} onChange={(e) => setFormData({ ...formData, descriptionKz: e.target.value })} rows={4} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Design Tab */}
          <TabsContent value="design">
            <div className="space-y-6">
              {/* Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Шаблоны</CardTitle>
                  <CardDescription>Выберите готовый дизайн</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {templates.map((template) => {
                      const isSelected = formData.templateId === template.id;
                      return (
                        <div
                          key={template.id}
                          onClick={() => setFormData({ ...formData, templateId: template.id })}
                          className={`cursor-pointer border-2 rounded-lg p-3 transition-all hover:shadow-md ${isSelected ? 'border-primary bg-primary/5' : 'border-border'}`}
                        >
                          {isSelected && <Badge className="mb-2 bg-primary"><Check className="w-3 h-3 mr-1" />Выбран</Badge>}
                          <div className="flex gap-1 mb-2">
                            {[template.colors.primary, template.colors.secondary, template.colors.accent].map((c, i) => (
                              <div key={i} className="w-6 h-6 rounded-full border" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                          <h3 className="font-medium text-sm">{template.name}</h3>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Fonts & Colors */}
              <Card>
                <CardHeader>
                  <CardTitle>Шрифты и цвета</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Шрифт заголовков</Label>
                    <Select value={formData.customFont || "default"} onValueChange={(val) => setFormData({ ...formData, customFont: val === "default" ? "" : val })}>
                      <SelectTrigger><SelectValue placeholder="По умолчанию" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">По умолчанию (Playfair Display)</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                        <SelectItem value="Lora">Lora</SelectItem>
                        <SelectItem value="Cormorant Garamond">Cormorant Garamond</SelectItem>
                        <SelectItem value="Great Vibes">Great Vibes</SelectItem>
                        <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                        <SelectItem value="Marck Script">Marck Script</SelectItem>
                        <SelectItem value="Caveat">Caveat</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Comfortaa">Comfortaa</SelectItem>
                        <SelectItem value="Raleway">Raleway</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6">
                    {/* Theme Color */}
                    <div className="space-y-2">
                      <Label>Цвет темы</Label>
                      <p className="text-xs text-muted-foreground mb-2">Фон, акценты, иконки</p>
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg border cursor-pointer" style={{ backgroundColor: formData.themeColor || '#D4A574' }} onClick={() => setShowColorPicker(showColorPicker === 'theme' ? null : 'theme')} />
                        <Input value={formData.themeColor} onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })} placeholder="#D4A574" className="flex-1" />
                      </div>
                      {showColorPicker === 'theme' && (
                        <HexColorPicker color={formData.themeColor || '#D4A574'} onChange={(color) => setFormData({ ...formData, themeColor: color })} style={{ width: '100%' }} />
                      )}
                    </div>

                    {/* Text Color */}
                    <div className="space-y-2">
                      <Label>Цвет текста</Label>
                      <p className="text-xs text-muted-foreground mb-2">Имена, заголовки, текст</p>
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg border cursor-pointer" style={{ backgroundColor: formData.textColor || '#1a1a1a' }} onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')} />
                        <Input value={formData.textColor} onChange={(e) => setFormData({ ...formData, textColor: e.target.value })} placeholder="#1a1a1a" className="flex-1" />
                      </div>
                      {showColorPicker === 'text' && (
                        <HexColorPicker color={formData.textColor || '#1a1a1a'} onChange={(color) => setFormData({ ...formData, textColor: color })} style={{ width: '100%' }} />
                      )}
                    </div>

                    {/* Button Color */}
                    <div className="space-y-2">
                      <Label>Цвет кнопок</Label>
                      <p className="text-xs text-muted-foreground mb-2">Фон кнопок</p>
                      <div className="flex gap-3">
                        <div className="w-12 h-12 rounded-lg border cursor-pointer" style={{ backgroundColor: formData.buttonColor || formData.themeColor || '#D4A574' }} onClick={() => setShowColorPicker(showColorPicker === 'button' ? null : 'button')} />
                        <Input value={formData.buttonColor} onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })} placeholder="Как тема" className="flex-1" />
                      </div>
                      {showColorPicker === 'button' && (
                        <HexColorPicker color={formData.buttonColor || formData.themeColor || '#D4A574'} onChange={(color) => setFormData({ ...formData, buttonColor: color })} style={{ width: '100%' }} />
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Форма фото</Label>
                    <Select value={formData.photoShape} onValueChange={(val) => setFormData({ ...formData, photoShape: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="square">▢ Квадрат (скруглённый)</SelectItem>
                        <SelectItem value="circle">○ Круг</SelectItem>
                        <SelectItem value="oval">⬭ Овал</SelectItem>
                        <SelectItem value="heart">♡ Сердце</SelectItem>
                        <SelectItem value="arch">⌓ Арка</SelectItem>
                        <SelectItem value="soft-arch">◠ Мягкая арка</SelectItem>
                        <SelectItem value="petal">❧ Лепесток</SelectItem>
                        <SelectItem value="diamond">◇ Ромб</SelectItem>
                        <SelectItem value="hexagon">⬡ Шестиугольник</SelectItem>
                        <SelectItem value="frame">▣ Рамка</SelectItem>
                        <SelectItem value="ornate">✦ Орнамент</SelectItem>
                        <SelectItem value="vintage">❋ Винтаж</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Выберите форму обрамления для главной фотографии
                    </p>
                  </div>

                  {/* Header Icon Selection */}
                  <div className="space-y-3">
                    <Label>Иконка над именем</Label>
                    <Select value={formData.headerIcon} onValueChange={(val: "none" | "heart" | "crescent" | "star" | "sparkle" | "party") => setFormData({ ...formData, headerIcon: val })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          <span className="flex items-center gap-2">— Без иконки</span>
                        </SelectItem>
                        <SelectItem value="heart">
                          <span className="flex items-center gap-2">
                            <Heart className="w-4 h-4 fill-current" /> Сердце
                          </span>
                        </SelectItem>
                        <SelectItem value="crescent">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9c1.5 0 2.91-.37 4.15-1.02A7 7 0 0 1 9 12a7 7 0 0 1 7.98-6.98A8.97 8.97 0 0 0 12 3z"/>
                            </svg>
                            Полумесяц
                          </span>
                        </SelectItem>
                        <SelectItem value="star">
                          <span className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-current" /> Звезда
                          </span>
                        </SelectItem>
                        <SelectItem value="sparkle">
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Орнамент
                          </span>
                        </SelectItem>
                        <SelectItem value="party">
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z"/>
                            </svg>
                            Праздник
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Декоративный символ, отображаемый над именами
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Background */}
              <Card>
                <CardHeader>
                  <CardTitle>Свой фон</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input type="file" accept="image/*" onChange={handleCustomBackgroundUpload} disabled={uploading} />
                  {formData.customBackgroundUrl && (
                    <div>
                      <img src={formData.customBackgroundUrl} alt="Фон" className="w-full h-48 object-cover rounded-lg" />
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => {
                        setFormData({ ...formData, customBackgroundUrl: "" });
                        setCustomBackgroundDeleted(true); // Mark as explicitly deleted
                      }}>
                        <Trash2 className="w-4 h-4 mr-2" />Удалить
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Blocks Tab */}
          <TabsContent value="blocks">
            <div className="space-y-6">
              {/* Main Blocks */}
              <Card>
                <CardHeader>
                  <CardTitle>Основные блоки</CardTitle>
                  <CardDescription>Включите или отключите блоки приглашения</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Timer className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Таймер обратного отсчёта</p>
                        <p className="text-sm text-muted-foreground">Показывает время до мероприятия</p>
                      </div>
                    </div>
                    <Switch checked={formData.showCountdown} onCheckedChange={(checked) => setFormData({ ...formData, showCountdown: checked })} />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Подтверждение участия (RSVP)</p>
                        <p className="text-sm text-muted-foreground">Гости смогут подтвердить присутствие</p>
                      </div>
                    </div>
                    <Switch checked={formData.showRsvp} onCheckedChange={(checked) => setFormData({ ...formData, showRsvp: checked })} />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Список подарков</p>
                        <p className="text-sm text-muted-foreground">Гости смогут выбрать подарок</p>
                      </div>
                    </div>
                    <Switch checked={formData.showWishlist} onCheckedChange={(checked) => setFormData({ ...formData, showWishlist: checked })} />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Пожелания гостей</p>
                        <p className="text-sm text-muted-foreground">Гости смогут оставить поздравления</p>
                      </div>
                    </div>
                    <Switch checked={formData.showWishes} onCheckedChange={(checked) => setFormData({ ...formData, showWishes: checked })} />
                  </div>
                </CardContent>
              </Card>

              {/* Block Order - Drag & Drop */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5" />
                    Порядок блоков
                  </CardTitle>
                  <CardDescription>Перетащите блоки для изменения порядка отображения</CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="space-y-2"
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ touchAction: touchDraggedBlock ? 'none' : 'auto' }}
                  >
                    {blockOrder.map((blockId) => {
                      const block = blockLabels[blockId];
                      if (!block) return null;
                      const isDragging = draggedBlock === blockId || touchDraggedBlock === blockId;
                      return (
                        <div
                          key={blockId}
                          data-block-id={blockId}
                          draggable
                          onDragStart={() => handleDragStart(blockId)}
                          onDragOver={(e) => handleDragOver(e, blockId)}
                          onDragEnd={handleDragEnd}
                          onTouchStart={(e) => handleTouchStart(blockId, e)}
                          style={{ touchAction: 'none' }}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-grab active:cursor-grabbing transition-all select-none ${
                            isDragging ? "opacity-50 border-primary bg-primary/5 scale-105 z-50" : "hover:border-primary/50 hover:bg-muted/50"
                          }`}
                        >
                          <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-primary flex-shrink-0">{block.icon}</span>
                          <span className="font-medium text-sm">{block.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Event Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Опции мероприятия</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Baby className="w-5 h-5 text-primary" />
                      <span className="font-medium">Дети</span>
                    </div>
                    <Select value={formData.childrenPolicy} onValueChange={(val) => setFormData({ ...formData, childrenPolicy: val as any })}>
                      <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neutral">Не указано</SelectItem>
                        <SelectItem value="allowed">С детьми</SelectItem>
                        <SelectItem value="not_allowed">Без детей</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Wine className="w-5 h-5 text-primary" />
                      <span className="font-medium">Алкоголь</span>
                    </div>
                    <Select value={formData.alcoholPolicy} onValueChange={(val) => setFormData({ ...formData, alcoholPolicy: val as any })}>
                      <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="neutral">Не указано</SelectItem>
                        <SelectItem value="allowed">Разрешён</SelectItem>
                        <SelectItem value="not_allowed">Без алкоголя</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Blocks */}
              <Card>
                <CardHeader>
                  <CardTitle>Дополнительные блоки</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    {/* Timeline */}
                    <AccordionItem value="timeline">
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <Switch checked={formData.showTimeline} onCheckedChange={(checked) => setFormData({ ...formData, showTimeline: checked })} onClick={(e) => e.stopPropagation()} />
                          <Clock className="w-4 h-4" />
                          <span>Программа мероприятия</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {formData.showTimeline && (
                          <div className="space-y-4 pt-4">
                            {timeline.map((item, index) => (
                              <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                                <div className="flex flex-col gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveTimelineItem(index, 'up')} disabled={index === 0}><ChevronUp className="w-4 h-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveTimelineItem(index, 'down')} disabled={index === timeline.length - 1}><ChevronDown className="w-4 h-4" /></Button>
                                </div>
                                <div className="flex-1 grid gap-2">
                                  <Input placeholder="Время (18:00)" value={item.time} onChange={(e) => updateTimelineItem(index, "time", e.target.value)} />
                                  <Input placeholder="Название" value={item.title} onChange={(e) => updateTimelineItem(index, "title", e.target.value)} />
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => removeTimelineItem(index)}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={addTimelineItem}><Plus className="w-4 h-4 mr-2" />Добавить</Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Menu */}
                    <AccordionItem value="menu">
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <Switch checked={formData.showMenu} onCheckedChange={(checked) => setFormData({ ...formData, showMenu: checked })} onClick={(e) => e.stopPropagation()} />
                          <Utensils className="w-4 h-4" />
                          <span>Меню</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {formData.showMenu && (
                          <div className="space-y-4 pt-4">
                            {menu.map((item, index) => (
                              <div key={index} className="p-3 border rounded-lg space-y-2">
                                <div className="flex gap-2">
                                  <Input placeholder="Название блюда" value={item.name} onChange={(e) => updateMenuItem(index, "name", e.target.value)} className="flex-1" />
                                  <div className="flex items-center gap-2">
                                    <Switch checked={item.isHalal} onCheckedChange={(checked) => updateMenuItem(index, "isHalal", checked)} />
                                    <span className="text-sm">Халал</span>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => removeMenuItem(index)}><Trash2 className="w-4 h-4" /></Button>
                                </div>
                              </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={addMenuItem}><Plus className="w-4 h-4 mr-2" />Добавить блюдо</Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Dress Code */}
                    <AccordionItem value="dresscode">
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <Switch checked={formData.showDressCode} onCheckedChange={(checked) => setFormData({ ...formData, showDressCode: checked })} onClick={(e) => e.stopPropagation()} />
                          <Shirt className="w-4 h-4" />
                          <span>Дресс-код</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {formData.showDressCode && (
                          <div className="space-y-4 pt-4">
                            <Textarea placeholder="Формальный стиль..." value={formData.dressCode} onChange={(e) => setFormData({ ...formData, dressCode: e.target.value })} />
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>

                    {/* Coordinator */}
                    <AccordionItem value="coordinator">
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <Switch checked={formData.showCoordinator} onCheckedChange={(checked) => setFormData({ ...formData, showCoordinator: checked })} onClick={(e) => e.stopPropagation()} />
                          <Phone className="w-4 h-4" />
                          <span>Контакт координатора</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {formData.showCoordinator && (
                          <div className="space-y-4 pt-4">
                            <Input placeholder="Имя" value={formData.coordinatorName} onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })} />
                            <Input placeholder="+7 777 123 45 67" value={formData.coordinatorPhone} onChange={(e) => setFormData({ ...formData, coordinatorPhone: e.target.value })} />
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Главное фото</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {imagePreview && <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />}
                  <Input type="file" accept="image/*" onChange={handleImageChange} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Музыка и видео</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Music className="w-4 h-4" />Фоновая музыка</Label>
                    <Input value={formData.musicUrl} onChange={(e) => setFormData({ ...formData, musicUrl: e.target.value })} placeholder="https://youtube.com/... или ссылка на MP3" />
                    <p className="text-xs text-muted-foreground">YouTube или прямая ссылка на аудиофайл</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Video className="w-4 h-4" />Видео (YouTube URL)</Label>
                    <Input value={formData.videoUrl} onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })} placeholder="https://youtube.com/..." />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Наша история</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {showRussian && <Textarea placeholder="Расскажите вашу историю..." value={formData.loveStory} onChange={(e) => setFormData({ ...formData, loveStory: e.target.value })} rows={4} />}
                  {showKazakh && <Textarea placeholder="Сіздің тарихыңыз..." value={formData.loveStoryKz} onChange={(e) => setFormData({ ...formData, loveStoryKz: e.target.value })} rows={4} />}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Галерея ({gallery?.length || 0}/8)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input type="file" accept="image/*" onChange={handleGalleryUpload} disabled={uploading || (gallery && gallery.length >= 8)} />
                  {galleryForm.imageUrl && (
                    <div className="space-y-2">
                      <img src={galleryForm.imageUrl} alt="New" className="w-32 h-32 object-cover rounded-lg" />
                      <Input placeholder="Подпись" value={galleryForm.caption} onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })} />
                      <Button onClick={() => addImageMutation.mutate({ weddingId: weddingId!, ...galleryForm })}><Plus className="w-4 h-4 mr-2" />Добавить</Button>
                    </div>
                  )}
                  {gallery && gallery.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {gallery.map((img) => (
                        <div key={img.id} className="relative group">
                          <img src={img.imageUrl} alt="" className="w-full h-24 object-cover rounded-lg" />
                          <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => deleteImageMutation.mutate({ id: img.id, weddingId: weddingId! })}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Share Tab */}
          <TabsContent value="share">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Share2 className="w-5 h-5" />Ссылка на приглашение</CardTitle>
                <CardDescription>Скопируйте ссылку и отправьте гостям</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-lg font-medium break-all">https://invites.kz/{formData.slug}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button onClick={handleCopyLink} variant={copied ? "default" : "outline"} className="w-full">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Скопировано!" : "Скопировать ссылку"}
                  </Button>
                  <Link href={`/${formData.slug}`} target="_blank">
                    <Button variant="outline" className="w-full"><ExternalLink className="w-4 h-4 mr-2" />Открыть</Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Отправить через:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={handleWhatsAppShare} className="w-full bg-[#25D366] hover:bg-[#128C7E]">
                      <WhatsAppIcon />
                      <span className="ml-2">WhatsApp</span>
                    </Button>
                    <Button onClick={handleTelegramShare} className="w-full bg-[#0088cc] hover:bg-[#006699]">
                      <TelegramIcon />
                      <span className="ml-2">Telegram</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
