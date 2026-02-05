import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Heart, Calendar, MapPin, Gift, MessageCircle, Loader2, ExternalLink, CheckCircle, Star, Sparkles, Baby, Wine, Camera, Info, BanIcon } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useRoute } from "wouter";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GalleryCarousel from "@/components/GalleryCarousel";
import TimelineBlock from "@/components/TimelineBlock";
import MenuBlock from "@/components/MenuBlock";
import DressCodeBlock from "@/components/DressCodeBlock";
import CoordinatorBlock from "@/components/CoordinatorBlock";
import QRCodeBlock from "@/components/QRCodeBlock";
import BackgroundMusic from "@/components/BackgroundMusic";
import PhotoShape, { PhotoShapeType } from "@/components/PhotoShape";
import LocationInfoBlock from "@/components/LocationInfoBlock";
import CountdownTimer from "@/components/CountdownTimer";
import EventOptionsBlock from "@/components/EventOptionsBlock";
import { getTemplate } from "@shared/templates";
import { getContrastTextColor, isLightColor } from "@/lib/colorUtils";
import { getEventTypeLabel, getEventTexts, type EventType } from "@shared/const";
import {
  GoldenKoshkar,
  FloralPattern,
  GeometricKazakh,
  SilkRoadPattern,
  NomadicSymbol,
  KazakhBorderTop,
  KazakhBorderBottom,
} from "@/components/ornaments/KazakhOrnaments";

export default function WeddingPage() {
  const [, params] = useRoute("/:slug");
  const slug = params?.slug || "";
  const { user, isAuthenticated } = useAuth();

  // Check if user is admin
  const { data: isAdmin } = trpc.admin.isAdmin.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: wedding, isLoading } = trpc.wedding.getBySlug.useQuery({ slug });
  const { data: wishlist } = trpc.wishlist.list.useQuery(
    { weddingId: wedding?.id || 0 },
    { enabled: !!wedding }
  );
  const { data: wishes } = trpc.wish.listApproved.useQuery(
    { weddingId: wedding?.id || 0 },
    { enabled: !!wedding }
  );
  const { data: gallery } = trpc.gallery.list.useQuery(
    { weddingId: wedding?.id || 0 },
    { enabled: !!wedding }
  );

  // Set dynamic meta tags for SEO

  // Payment mutation for FreedomPay
  const paymentMutation = trpc.payment.createPremiumPayment.useMutation({
    onSuccess: (data) => {
      // Redirect to FreedomPay payment page
      window.location.href = data.redirectUrl;
    },
    onError: (error: any) => {
      console.error('Payment error:', error);
      // You can add toast notification here if needed
    },
  });

  const handlePayment = () => {
    if (wedding?.id) {
      paymentMutation.mutate({ weddingId: wedding.id });
    }
  };
  useEffect(() => {
    if (wedding) {
      const weddingTitle = `${wedding.title} | Invites.kz`;
      const eventType = (wedding as any).eventType as EventType || 'wedding';
      const eventLabel = getEventTypeLabel(eventType, 'ru');
      const weddingDescription = wedding.description 
        ? wedding.description.substring(0, 160) 
        : `Приглашение на ${eventLabel.toLowerCase()}: ${wedding.title}. ${wedding.date ? new Date(wedding.date).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}`;
      
      document.title = weddingTitle;
      
      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', weddingDescription);
      
      // Update Open Graph tags
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };
      
      updateMetaTag('og:title', weddingTitle);
      updateMetaTag('og:description', weddingDescription);
      updateMetaTag('og:url', `https://invites.kz/${wedding.slug}`);
      if (wedding.backgroundImage) {
        updateMetaTag('og:image', wedding.backgroundImage);
      }
    }
  }, [wedding]);

  const [language, setLanguage] = useState<"ru" | "kz">("ru");
  
  // Get language mode from wedding data
  const languageMode = (wedding as any)?.languageMode || 'both';
  
  // Set initial language based on languageMode
  useEffect(() => {
    if (wedding) {
      const mode = (wedding as any)?.languageMode || 'both';
      if (mode === 'kz') {
        setLanguage('kz');
      } else {
        setLanguage('ru');
      }
    }
  }, [wedding]);

  // Get template configuration
  const template = wedding ? getTemplate(wedding.templateId || 'classic') : getTemplate('classic');

  // Apply background to html and body for full viewport coverage
  useEffect(() => {
    if (!wedding) return;
    
    const bgImage = wedding.customBackgroundUrl || template.backgroundImage;
    const bgColor = template.colors.background;
    
    // Apply to document root elements
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    document.body.style.minHeight = '100vh';
    
    if (bgImage) {
      document.body.style.backgroundImage = `url(${bgImage})`;
      document.body.style.backgroundRepeat = wedding.customBackgroundUrl ? 'no-repeat' : 'repeat';
      document.body.style.backgroundSize = wedding.customBackgroundUrl ? 'cover' : '400px 400px';
      document.body.style.backgroundPosition = wedding.customBackgroundUrl ? 'center top' : 'top left';
      document.body.style.backgroundAttachment = 'fixed';
    }
    
    return () => {
      // Cleanup on unmount
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = '';
      document.body.style.backgroundRepeat = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
      document.body.style.backgroundAttachment = '';
      document.body.style.minHeight = '';
    };
  }, [wedding, template]);

  // Render ornament based on template style
  const renderOrnament = () => {
    const ornamentClass = "absolute w-32 h-32 opacity-20";
    switch (template.ornamentStyle) {
      case 'golden':
        return <GoldenKoshkar className={ornamentClass} color={template.colors.ornament} />;
      case 'floral':
        return <FloralPattern className={ornamentClass} color={template.colors.ornament} />;
      case 'geometric':
        return <GeometricKazakh className={ornamentClass} color={template.colors.ornament} />;
      case 'silk':
        return <SilkRoadPattern className={ornamentClass} color={template.colors.ornament} />;
      case 'nomadic':
        return <NomadicSymbol className={ornamentClass} color={template.colors.ornament} />;
      case 'islamic':
        return <GeometricKazakh className={ornamentClass} color={template.colors.ornament} />;
      case 'starry':
        return <FloralPattern className={ornamentClass} color={template.colors.ornament} />;
      case 'cloud':
        return <SilkRoadPattern className={ornamentClass} color={template.colors.ornament} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Приглашение не найдено</CardTitle>
            <CardDescription>
              Проверьте правильность адреса
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Owner Preview Logic - владелец видит полную страницу, остальные заглушку
  // Админ может просматривать все приглашения без ограничений
  const isOwner = wedding.userId === user?.id;
  const canViewUnpaid = isOwner || isAdmin === true;
  const showPaymentBanner = !wedding.isPaid && isOwner;
  
  // Public demo slugs (for showcase on homepage)
  const publicDemoSlugs = [
    'demo-aigerim-nurlan', 'demo-anna-dmitry', // Classic demos
    'malikaaskar', 'ai-1768103015847', 'tusau-keser-alihan', 'madinawed', 'diasbday' // AI demos
  ];
  const isPublicDemo = slug.startsWith("demo-") || publicDemoSlugs.includes(slug);
  const hideFromPublic = !wedding.isPaid && !isPublicDemo && !canViewUnpaid;

  // Блокировка для НЕ-владельцев неоплаченных страниц
  if (hideFromPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Страница не опубликована</CardTitle>
            <CardDescription>
              Доступ появится после оплаты
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Владелец приглашения должен оплатить, чтобы страница стала доступна гостям.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Показываем баннер админу при просмотре чужого приглашения
  const showAdminBanner = isAdmin === true && !isOwner;

  // ВАЖНО: Если владелец - продолжаем показывать страницу с баннером
  // Если оплачено - показываем всем без баннера

  // AI-generated invitation - show HTML directly
  if ((wedding as any).isAI && (wedding as any).aiGeneratedHtml) {
    // Inject form handling script into AI HTML - uses postMessage to parent
    const formHandlerScript = `
<script>
  // Smart data extraction from form inputs
  function extractFormData(form) {
    const data = {};
    
    // Get all inputs, selects, textareas
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(function(input, index) {
      let value = input.value;
      if (input.type === 'checkbox') value = input.checked;
      if (input.type === 'radio' && !input.checked) return;
      
      // Try to determine field name
      let fieldName = input.name;
      
      if (!fieldName) {
        // Try placeholder
        const placeholder = (input.placeholder || '').toLowerCase();
        const label = input.closest('label')?.textContent?.toLowerCase() || '';
        const prevLabel = input.previousElementSibling?.textContent?.toLowerCase() || '';
        const hint = placeholder + ' ' + label + ' ' + prevLabel;
        
        // Detect field type by hints
        if (hint.includes('имя') || hint.includes('name') || hint.includes('как вас') || hint.includes('ваше имя')) {
          fieldName = 'name';
        } else if (hint.includes('телефон') || hint.includes('phone') || hint.includes('номер')) {
          fieldName = 'phone';
        } else if (hint.includes('email') || hint.includes('почт') || hint.includes('@')) {
          fieldName = 'email';
        } else if (hint.includes('гост') || hint.includes('количество') || hint.includes('сколько') || hint.includes('guests') || hint.includes('человек')) {
          fieldName = 'guestCount';
        } else if (hint.includes('пожелани') || hint.includes('сообщени') || hint.includes('message') || hint.includes('текст') || hint.includes('комментар')) {
          fieldName = 'message';
        } else if (hint.includes('участ') || hint.includes('прид') || hint.includes('attend') || hint.includes('будете')) {
          fieldName = 'attending';
        } else if (hint.includes('подарок') || hint.includes('gift') || hint.includes('item') || hint.includes('название')) {
          // Check if it looks like a name/title or an ID
          if (input.type === 'hidden' || !isNaN(parseInt(value))) {
            fieldName = 'itemId';
          } else {
            fieldName = 'giftName';
          }
        } else {
          fieldName = 'field_' + index;
        }
      }
      
      // Map select values for attending
      if (input.tagName === 'SELECT' && !data.attending) {
        const selectedText = (input.options[input.selectedIndex]?.text || '').toLowerCase();
        if (selectedText.includes('приду') || selectedText.includes('да') || selectedText.includes('yes') || selectedText.includes('буду')) {
          data.attending = 'yes';
        } else if (selectedText.includes('не приду') || selectedText.includes('нет') || selectedText.includes('no') || selectedText.includes('не смогу')) {
          data.attending = 'no';
        }
      }
      
      if (fieldName && value) {
        data[fieldName] = value;
      }
    });
    
    // For wishlist forms, try to extract gift name from context if not found
    if (!data.giftName && !data.itemId) {
      // Try to find gift name from parent card/container
      const container = form.closest('[data-gift-name], .gift-card, .wishlist-item, .gift-item');
      if (container) {
        const giftNameAttr = container.getAttribute('data-gift-name');
        if (giftNameAttr) {
          data.giftName = giftNameAttr;
        } else {
          // Try to find heading/title in container
          const heading = container.querySelector('h3, h4, h5, .gift-title, .item-name');
          if (heading) {
            data.giftName = heading.textContent.trim();
          }
        }
      }
      
      // Try button text or nearby text
      if (!data.giftName) {
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) {
          const btnParent = submitBtn.closest('.gift-card, .wishlist-item, article, section, div[class*="gift"], div[class*="item"]');
          if (btnParent) {
            const title = btnParent.querySelector('h1, h2, h3, h4, h5, strong, b');
            if (title && title.textContent.length < 100) {
              data.giftName = title.textContent.trim();
            }
          }
        }
      }
    }
    
    console.log('Extracted form data:', data);
    return data;
  }
  
  // Form submission handler - sends data to parent window
  function submitForm(event, formType) {
    event.preventDefault();
    const form = event.target;
    const data = extractFormData(form);
    
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
    const originalText = submitBtn ? submitBtn.textContent || submitBtn.value : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      if (submitBtn.textContent !== undefined) submitBtn.textContent = 'Отправка...';
      else submitBtn.value = 'Отправка...';
    }
    
    // Store button reference for later
    window._lastSubmitBtn = submitBtn;
    window._lastOriginalText = originalText;
    window._lastForm = form;
    
    console.log('Submitting form:', formType, data);
    
    // Send to parent window
    window.parent.postMessage({
      type: 'AI_FORM_SUBMIT',
      formType: formType,
      data: data
    }, '*');
  }
  
  // Listen for response from parent
  window.addEventListener('message', function(event) {
    if (event.data.type === 'AI_FORM_RESPONSE') {
      const btn = window._lastSubmitBtn;
      const originalText = window._lastOriginalText;
      const form = window._lastForm;
      
      if (btn) {
        btn.disabled = false;
        btn.textContent = originalText;
      }
      
      if (event.data.success) {
        alert(event.data.message || 'Отправлено!');
        if (form) form.reset();
      } else {
        alert(event.data.message || 'Ошибка при отправке');
      }
    }
  });
  
  // Detect form type by content
  function detectFormType(form) {
    const formText = form.innerText.toLowerCase();
    const formHtml = form.innerHTML.toLowerCase();
    
    if (formHtml.includes('attending') || formHtml.includes('guests') || 
        formText.includes('rsvp') || formText.includes('приду') || 
        formText.includes('подтвердить') || formText.includes('участие')) {
      return 'rsvp';
    }
    
    if (formHtml.includes('message') || formHtml.includes('wish') ||
        formText.includes('пожелани') || formText.includes('поздравлени')) {
      return 'wish';
    }
    
    if (formHtml.includes('itemid') || formHtml.includes('reserve') ||
        formText.includes('подарок') || formText.includes('зарезервировать')) {
      return 'wishlist';
    }
    
    return 'rsvp';
  }
  
  // Auto-attach to forms that DON'T have onsubmit attribute
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('form').forEach(function(form) {
      // Skip if already handled or has inline onsubmit handler
      if (form.dataset.handled) return;
      if (form.hasAttribute('onsubmit')) {
        console.log('Form has onsubmit, skipping auto-attach');
        return;
      }
      
      form.dataset.handled = 'true';
      
      form.addEventListener('submit', function(e) {
        const formType = form.dataset.formType || detectFormType(form);
        submitForm(e, formType);
      });
    });
    console.log('AI Form handlers attached');
  });
</script>
`;
    
    // Insert script before </body> or at the end
    let aiHtml = (wedding as any).aiGeneratedHtml;
    if (aiHtml.includes('</body>')) {
      aiHtml = aiHtml.replace('</body>', formHandlerScript + '</body>');
    } else {
      aiHtml = aiHtml + formHandlerScript;
    }

    // Component to handle form submissions from iframe
    const AIInvitationWithForms = () => {
      const submitFormMutation = trpc.ai.submitForm.useMutation();
      const iframeRef = useRef<HTMLIFrameElement>(null);
      
      useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
          if (event.data.type === 'AI_FORM_SUBMIT') {
            console.log('[AI Form] Received from iframe:', event.data);
            try {
              const result = await submitFormMutation.mutateAsync({
                slug: slug,
                formType: event.data.formType,
                data: event.data.data,
              });
              
              iframeRef.current?.contentWindow?.postMessage({
                type: 'AI_FORM_RESPONSE',
                success: result.success,
                message: result.message,
              }, '*');
            } catch (error: any) {
              console.error('[AI Form] Error:', error);
              iframeRef.current?.contentWindow?.postMessage({
                type: 'AI_FORM_RESPONSE',
                success: false,
                message: error.message || 'Ошибка при отправке',
              }, '*');
            }
          }
        };
        
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
      }, [slug]);
      
      return (
        <iframe
          ref={iframeRef}
          srcDoc={aiHtml}
          className="w-full border-0"
          style={{ 
            height: showPaymentBanner ? 'calc(100vh - 100px)' : '100vh',
            marginTop: showPaymentBanner ? '100px' : '0',
          }}
          title={wedding.title}
        />
      );
    };

    return (
      <div className="min-h-screen bg-background">
        {/* Payment banner for owner */}
        {showPaymentBanner && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 text-center">
            <p className="text-sm font-medium">
              Это предпросмотр. Чтобы гости увидели страницу — оплатите публикацию.
            </p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={handlePayment}
              disabled={paymentMutation.isPending}
            >
              {paymentMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Оплатить 990 ₸
            </Button>
          </div>
        )}
        {/* Admin view banner */}
        {showAdminBanner && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-purple-600 text-white p-3 text-center">
            <p className="text-sm font-medium">
              🔐 Режим администратора: AI приглашение #{wedding.id} | Статус: {wedding.isPaid ? '✅ Оплачено' : '⏳ Не оплачено'}
            </p>
          </div>
        )}
        <AIInvitationWithForms />
      </div>
    );
  }

  const title = language === "kz" && wedding.titleKz ? wedding.titleKz : wedding.title;
  const location = language === "kz" && wedding.locationKz ? wedding.locationKz : wedding.location;
  const description = language === "kz" && wedding.descriptionKz ? wedding.descriptionKz : wedding.description;

  // Apply template and custom styles
  // Priority: Template colors can be overridden by custom colors
  const isCustomTemplate = template.id !== 'classic';
  // User customization always takes priority over template defaults
  const effectivePrimaryColor = wedding.customColor || template.colors.primary;
  const effectiveTextColor = (wedding as any).textColor || null; // Main text color for all content
  const effectiveThemeColor = wedding.themeColor || template.colors.accent;
  const effectiveButtonColor = wedding.buttonColor || effectiveThemeColor; // Button color with fallback to theme color
  const effectiveFont = wedding.customFont || template.fonts.heading;
  
  // Calculate optimal text color based on background brightness
  const autoTextColor = getContrastTextColor(template.colors.background);
  const isLightBackground = isLightColor(template.colors.background);
  
  const templateStyles = {
    '--template-primary': effectivePrimaryColor,
    '--template-secondary': template.colors.secondary,
    '--template-accent': effectiveThemeColor,
    '--template-bg': template.colors.background,
    '--template-text': autoTextColor, // Use calculated text color for optimal contrast
    '--template-heading-font': template.fonts.heading,
    '--template-body-font': template.fonts.body,
    '--custom-font': effectiveFont,
    '--custom-color': effectivePrimaryColor,
  } as React.CSSProperties;

  // Parse block order
  // Note: "interactive" combines RSVP + Wishlist + Wishes as they are one tabbed section
  const defaultBlockOrder = ["countdown", "gallery", "timeline", "menu", "dressCode", "info", "eventOptions", "interactive"];
  let parsedBlockOrder: string[] = defaultBlockOrder;
  try {
    if ((wedding as any).blockOrder) {
      const parsed = JSON.parse((wedding as any).blockOrder);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Migrate old format: replace separate rsvp/wishlist/wishes with single interactive
        const migratedOrder = parsed.filter((id: string) => !['rsvp', 'wishlist', 'wishes'].includes(id));
        if (parsed.some((id: string) => ['rsvp', 'wishlist', 'wishes'].includes(id)) && !migratedOrder.includes('interactive')) {
          // Find position of first interactive block and insert there
          const firstInteractiveIndex = parsed.findIndex((id: string) => ['rsvp', 'wishlist', 'wishes'].includes(id));
          migratedOrder.splice(firstInteractiveIndex, 0, 'interactive');
        }
        parsedBlockOrder = migratedOrder;
      }
    }
  } catch (e) {}

  return (
    <div 
      className="min-h-screen relative flex flex-col"
      style={{
        ...templateStyles,
        color: effectiveTextColor || autoTextColor,
        fontFamily: template.fonts.body,
      }}
    >
      {/* Плашка превью для владельца неоплаченной страницы */}
      {showPaymentBanner && (
        <div className="bg-[#d4a27a] text-white p-4 text-center border-b-2 border-[#b8956a] sticky top-0 z-50">
          <p className="font-medium">
            📋 Это предварительный показ. Страница станет доступна гостям после оплаты.
          </p>
          <button onClick={handlePayment} disabled={paymentMutation.isPending} className="mt-2 bg-white text-[#d4a27a] px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors">
            {paymentMutation.isPending ? "Обработка..." : "Оплатить сейчас"}
          </button>
        </div>
      )}
      {/* Admin view banner */}
      {showAdminBanner && (
        <div className="bg-purple-600 text-white p-3 text-center border-b-2 border-purple-700 sticky top-0 z-50">
          <p className="font-medium">
            🔐 Режим администратора: просмотр приглашения ID #{wedding.id} | Статус: {wedding.isPaid ? '✅ Оплачено' : '⏳ Не оплачено'}
          </p>
        </div>
      )}
      {/* Decorative ornaments */}
      {template.ornamentStyle !== 'none' && (
        <>
          <div className="absolute top-10 left-10 opacity-10">
            {renderOrnament()}
          </div>
          <div className="absolute top-10 right-10 opacity-10">
            {renderOrnament()}
          </div>
          <div className="absolute bottom-10 left-10 opacity-10">
            {renderOrnament()}
          </div>
          <div className="absolute bottom-10 right-10 opacity-10">
            {renderOrnament()}
          </div>
        </>
      )}
      
      {/* Decorative borders */}
      {template.ornamentStyle !== 'none' && (
        <>
          <div className="absolute top-0 left-0 right-0">
            <KazakhBorderTop color={template.colors.ornament} />
          </div>
          <div className="absolute bottom-0 left-0 right-0">
            <KazakhBorderBottom color={template.colors.ornament} />
          </div>
        </>
      )}
      {/* Hero Section */}
      <section
        className="relative min-h-[80vh] flex items-center justify-center"
        style={{
          background: true
            ? `linear-gradient(135deg, ${effectiveThemeColor}15, ${effectiveThemeColor}05)`
            : undefined,
        }}
      >
        <div className="container relative z-10 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Photo Side */}
              {wedding.backgroundImage && (
                <div className="flex justify-center">
                  <PhotoShape
                    imageUrl={wedding.backgroundImage}
                    shape={(wedding.photoShape as PhotoShapeType) || "square"}
                    themeColor={effectiveThemeColor}
                    alt={title}
                    className="w-full max-w-md aspect-square"
                  />
                </div>
              )}
              
              {/* Content Side */}
              <div className={`space-y-6 ${wedding.backgroundImage ? "text-center md:text-left" : "text-center md:col-span-2"}`}>
            {/* Language Toggle - only show if languageMode is 'both' */}
            {languageMode === 'both' && (wedding.titleKz || wedding.locationKz || wedding.descriptionKz) && (
              <div className="flex justify-center gap-2 mb-8">
                <Button
                  variant={language === "ru" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("ru")}
                  style={language === "ru" ? {
                    backgroundColor: effectiveButtonColor,
                    borderColor: effectiveButtonColor,
                    color: wedding.buttonTextColor || "#FFFFFF",
                  } : {}}
                >
                  Русский
                </Button>
                <Button
                  variant={language === "kz" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("kz")}
                  style={language === "kz" ? {
                    backgroundColor: effectiveButtonColor,
                    borderColor: effectiveButtonColor,
                    color: wedding.buttonTextColor || "#FFFFFF",
                  } : {}}
                >
                  Қазақша
                </Button>
              </div>
            )}

            {/* Header Icon - based on headerIcon field or legacy showHeart */}
            {(() => {
              const iconType = (wedding as any).headerIcon || (wedding.showHeart ? 'heart' : 'none');
              const iconColor = effectiveThemeColor || template.colors.primary;
              const iconClass = "w-16 h-16 mx-auto";
              
              switch (iconType) {
                case 'heart':
                  return <Heart className={`${iconClass} fill-current`} style={{ color: iconColor }} />;
                case 'crescent':
                  return (
                    <svg className={iconClass} viewBox="0 0 64 64" fill={iconColor}>
                      <path d="M42 8C28.7 8 18 18.7 18 32s10.7 24 24 24c4.4 0 8.5-1.2 12-3.2C48.6 56.2 41.5 58 34 58 18.5 58 6 45.5 6 30S18.5 2 34 2c4.5 0 8.8 1.1 12.6 3C44.4 8.7 43.2 8 42 8z"/>
                    </svg>
                  );
                case 'star':
                  return <Star className={`${iconClass} fill-current`} style={{ color: iconColor }} />;
                case 'sparkle':
                  return <Sparkles className={iconClass} style={{ color: iconColor }} />;
                case 'party':
                  return (
                    <svg className={iconClass} viewBox="0 0 64 64" fill={iconColor}>
                      <path d="M32 4l4 12h12l-10 8 4 12-10-8-10 8 4-12-10-8h12z"/>
                      <path d="M12 32l-6 20 20-6-14-14z" opacity="0.7"/>
                      <path d="M52 32l6 20-20-6 14-14z" opacity="0.7"/>
                      <circle cx="20" cy="16" r="3" opacity="0.5"/>
                      <circle cx="44" cy="16" r="3" opacity="0.5"/>
                      <circle cx="8" cy="28" r="2" opacity="0.5"/>
                      <circle cx="56" cy="28" r="2" opacity="0.5"/>
                    </svg>
                  );
                default:
                  return null;
              }
            })()}
            
            <h1
              className="text-5xl md:text-7xl font-bold text-foreground"
              style={{
                fontFamily: effectiveFont ? effectiveFont : undefined,
                color: effectiveTextColor || effectivePrimaryColor || undefined,
              }}
            >
              {title}
            </h1>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-lg text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {new Date(wedding.date).toLocaleDateString(language === "kz" ? "kk-KZ" : "ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {location}
                </div>
                {wedding.mapUrl && (
                  <Button
                    variant="default"
                    size="sm"
                    asChild
                    style={effectiveButtonColor ? {
                      backgroundColor: effectiveButtonColor,
                      borderColor: effectiveButtonColor,
                      color: wedding.buttonTextColor || "#FFFFFF",
                    } : {
                      backgroundColor: "#FFFFFF",
                      color: "#000000",
                    }}
                  >
                    <a href={wedding.mapUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {language === "kz" ? "Картада ашу" : "Открыть на карте"}
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {description && (
              <p
                className="text-xl text-muted-foreground"
                style={{
                  fontFamily: effectiveFont ? effectiveFont : 'Lora',
                }}
              >
                {description}
              </p>
            )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Love Story Section */}
      {(wedding.loveStory || wedding.loveStoryKz) && (
        <section 
          className="py-16"
          style={{
            backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}10` : undefined,
          }}
        >
          <div className="container max-w-3xl">
            <div className="p-8 rounded-lg" style={{
              backgroundColor: 'rgba(250, 245, 235, 0.9)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}>
              <h2 
                className="text-3xl md:text-4xl font-bold text-center mb-8"
                style={{
                  fontFamily: effectiveFont ? effectiveFont : undefined,
                  color: effectiveTextColor || effectivePrimaryColor || undefined,
                }}
              >
                {language === "kz" ? "Біздің тарихымыз" : "Наша история"}
              </h2>
              <div className="prose prose-lg max-w-none text-foreground">
                <p 
                  className="whitespace-pre-wrap text-center"
                  style={{
                    fontFamily: effectiveFont ? effectiveFont : undefined,
                  }}
                >
                  {language === "kz" && wedding.loveStoryKz ? wedding.loveStoryKz : wedding.loveStory}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Blocks - rendered in order from blockOrder */}
      {parsedBlockOrder.map((blockId) => {
        switch (blockId) {
          case 'countdown':
            return (wedding as any).showCountdown !== false && wedding.date ? (
              <CountdownTimer
                key="countdown"
                targetDate={new Date(wedding.date)}
                language={language}
                customFont={effectiveFont || undefined}
                customColor={effectivePrimaryColor || undefined}
                themeColor={effectiveThemeColor || undefined}
              />
            ) : null;
          
          case 'gallery':
            return gallery && gallery.length > 0 ? (
              <GalleryCarousel 
                key="gallery"
                gallery={gallery} 
                language={language} 
                customFont={effectiveFont || undefined}
                customColor={effectivePrimaryColor || undefined}
                themeColor={effectiveThemeColor || undefined}
              />
            ) : null;
          
          case 'timeline':
            return wedding.showTimeline && wedding.timelineData ? (
              <TimelineBlock
                key="timeline"
                timelineData={wedding.timelineData}
                language={language}
                customFont={effectiveFont || undefined}
                customColor={effectivePrimaryColor || undefined}
                themeColor={effectiveThemeColor || undefined}
              />
            ) : null;
          
          case 'menu':
            return wedding.showMenu && wedding.menuData ? (
              <MenuBlock
                key="menu"
                menuData={wedding.menuData}
                language={language}
                customFont={effectiveFont || undefined}
                customColor={effectivePrimaryColor || undefined}
                themeColor={effectiveThemeColor || undefined}
              />
            ) : null;
          
          case 'dressCode':
            return wedding.showDressCode && (wedding.dressCode || wedding.dressCodeKz) ? (
              <DressCodeBlock
                key="dressCode"
                dressCode={wedding.dressCode || ""}
                dressCodeKz={wedding.dressCodeKz || undefined}
                language={language}
                customFont={effectiveFont || undefined}
                customColor={effectivePrimaryColor || undefined}
                themeColor={effectiveThemeColor || undefined}
              />
            ) : null;
          
          case 'info':
            return wedding.showLocationDetails && (wedding.locationDetails || wedding.locationDetailsKz) ? (
              <LocationInfoBlock
                key="info"
                locationDetails={wedding.locationDetails || undefined}
                locationDetailsKz={wedding.locationDetailsKz || undefined}
                language={language}
                customFont={effectiveFont || undefined}
                customColor={effectivePrimaryColor || undefined}
                themeColor={effectiveThemeColor || undefined}
              />
            ) : null;
          
          case 'eventOptions':
            return ((wedding as any).childrenPolicy && (wedding as any).childrenPolicy !== 'neutral') ||
                   ((wedding as any).alcoholPolicy && (wedding as any).alcoholPolicy !== 'neutral') ||
                   ((wedding as any).photoPolicy && (wedding as any).photoPolicy !== 'neutral') ? (
              <EventOptionsBlock
                key="eventOptions"
                childrenPolicy={(wedding as any).childrenPolicy}
                alcoholPolicy={(wedding as any).alcoholPolicy}
                photoPolicy={(wedding as any).photoPolicy}
                language={language}
                customFont={effectiveFont || undefined}
                customColor={effectivePrimaryColor || undefined}
                themeColor={effectiveThemeColor || undefined}
              />
            ) : null;
          
          case 'interactive':
            const showRsvpBlock = (wedding as any).showRsvp !== false;
            const showWishlistBlock = (wedding as any).showWishlist !== false;
            const showWishesBlock = (wedding as any).showWishes !== false;
            const visibleTabsCount = [showRsvpBlock, showWishlistBlock, showWishesBlock].filter(Boolean).length;
            
            if (visibleTabsCount === 0) return null;
            
            const defaultTabValue = showRsvpBlock ? 'rsvp' : showWishlistBlock ? 'wishlist' : 'wishes';
            
            return (
              <section 
                key="interactive"
                className="py-16"
                style={{
                  backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}10` : undefined,
                }}
              >
                <div className="container max-w-4xl">
                  <div className="p-8 rounded-lg" style={{
                    backgroundColor: 'rgba(250, 245, 235, 0.9)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}>
                    <div style={effectiveThemeColor ? {
                      // @ts-ignore
                      '--theme-color': effectiveThemeColor,
                    } : {}}>
                      <Tabs defaultValue={defaultTabValue} className="w-full">
                        <TabsList 
                          className={`grid w-full`}
                          style={{
                            backgroundColor: effectiveThemeColor ? effectiveThemeColor : undefined,
                            gridTemplateColumns: `repeat(${visibleTabsCount}, 1fr)`,
                          }}
                        >
                          {showRsvpBlock && (
                            <TabsTrigger value="rsvp">
                              <Calendar className="w-4 h-4 mr-2" />
                              RSVP
                            </TabsTrigger>
                          )}
                          {showWishlistBlock && (
                            <TabsTrigger value="wishlist">
                              <Gift className="w-4 h-4 mr-2" />
                              {language === "kz" ? "Сыйлықтар" : "Подарки"}
                            </TabsTrigger>
                          )}
                          {showWishesBlock && (
                            <TabsTrigger value="wishes">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              {language === "kz" ? "Тілектер" : "Пожелания"}
                            </TabsTrigger>
                          )}
                        </TabsList>

                        {showRsvpBlock && (
                          <TabsContent value="rsvp">
                            <RsvpForm 
                              weddingId={wedding.id} 
                              language={language}
                              customFont={effectiveFont || undefined}
                              customColor={effectivePrimaryColor || undefined}
                              themeColor={effectiveThemeColor || undefined}
                              buttonColor={effectiveButtonColor || undefined}
                              buttonTextColor={wedding.buttonTextColor || undefined}
                            />
                          </TabsContent>
                        )}
                        {showWishlistBlock && (
                          <TabsContent value="wishlist">
                            <WishlistSection 
                              weddingId={wedding.id} 
                              language={language}
                              customFont={effectiveFont || undefined}
                              customColor={effectivePrimaryColor || undefined}
                              themeColor={effectiveThemeColor || undefined}
                              buttonColor={effectiveButtonColor || undefined}
                              buttonTextColor={wedding.buttonTextColor || undefined}
                            />
                          </TabsContent>
                        )}
                        {showWishesBlock && (
                          <TabsContent value="wishes">
                            <WishesSection 
                              weddingId={wedding.id} 
                              language={language}
                              customFont={effectiveFont || undefined}
                              customColor={effectivePrimaryColor || undefined}
                              themeColor={effectiveThemeColor || undefined}
                              buttonColor={effectiveButtonColor || undefined}
                              buttonTextColor={wedding.buttonTextColor || undefined}
                            />
                          </TabsContent>
                        )}
                      </Tabs>
                    </div>
                  </div>
                </div>
              </section>
            );
          
          default:
            return null;
        }
      })}

      {/* Video Section - always after dynamic blocks */}
      {wedding.videoUrl && (
        <section 
          className="py-16"
          style={{
            backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}10` : undefined,
          }}
        >
          <div className="container max-w-4xl">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-8"
              style={{
                fontFamily: effectiveFont || undefined,
                color: effectiveTextColor || effectivePrimaryColor || undefined,
              }}
            >
              {language === "kz" ? "Біздің видео" : "Наше видео"}
            </h2>
            <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
              {wedding.videoUrl.includes('youtube.com') || wedding.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={wedding.videoUrl.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video src={wedding.videoUrl} controls className="w-full h-full" />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Coordinator Contacts Section */}
      {wedding.showCoordinator && (wedding.coordinatorName || wedding.coordinatorPhone || wedding.coordinatorEmail) && (
        <CoordinatorBlock
          coordinatorName={wedding.coordinatorName || undefined}
          coordinatorPhone={wedding.coordinatorPhone || undefined}
          coordinatorEmail={wedding.coordinatorEmail || undefined}
          language={language}
          customFont={effectiveFont || undefined}
          customColor={effectivePrimaryColor || undefined}
          themeColor={effectiveThemeColor || undefined}
        />
      )}

      {/* QR Code Section */}
      {wedding.showQrCode && wedding.qrCodeData && (
        <QRCodeBlock
          qrCodeData={wedding.qrCodeData}
          language={language}
          customFont={effectiveFont || undefined}
          customColor={effectivePrimaryColor || undefined}
          themeColor={effectiveThemeColor || undefined}
        />
      )}

      {/* Event Options Section */}
      {(((wedding as any).childrenPolicy && (wedding as any).childrenPolicy !== 'neutral') ||
        ((wedding as any).alcoholPolicy && (wedding as any).alcoholPolicy !== 'neutral') ||
        ((wedding as any).photoPolicy && (wedding as any).photoPolicy !== 'neutral')) && (
        <section 
          className="py-16"
          style={{
            backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}10` : undefined,
          }}
        >
          <div className="container max-w-3xl">
            <h2 
              className="text-3xl md:text-4xl font-bold text-center mb-8"
              style={{
                fontFamily: effectiveFont || template.fonts.heading,
                color: effectivePrimaryColor || effectiveTextColor || autoTextColor,
              }}
            >
              {language === 'kz' ? 'Маңызды ақпарат' : 'Важная информация'}
            </h2>
            
            <Card 
              style={{
                borderColor: effectiveThemeColor ? `${effectiveThemeColor}30` : undefined,
              }}
            >
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-center mb-6">
                  <div 
                    className="flex items-center justify-center w-16 h-16 rounded-full"
                    style={{
                      backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}20` : undefined,
                      color: effectiveThemeColor,
                    }}
                  >
                    <Info className="w-8 h-8" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {(wedding as any).childrenPolicy === 'allowed' && (
                    <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}10` : '#f9fafb' }}>
                      <Baby className="w-5 h-5 flex-shrink-0" style={{ color: effectiveThemeColor }} />
                      <span style={{ fontFamily: effectiveFont }}>
                        {language === 'kz' ? 'Балалармен келуге болады' : 'Можно с детьми'}
                      </span>
                    </div>
                  )}
                  {(wedding as any).childrenPolicy === 'not_allowed' && (
                    <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}10` : '#f9fafb' }}>
                      <div className="relative flex-shrink-0">
                        <Baby className="w-5 h-5" style={{ color: effectiveThemeColor }} />
                        <BanIcon className="w-3 h-3 absolute -top-1 -right-1 text-red-500" />
                      </div>
                      <span style={{ fontFamily: effectiveFont }}>
                        {language === 'kz' ? 'Балаларсыз келуді сұраймыз' : 'Просим без детей'}
                      </span>
                    </div>
                  )}
                  {(wedding as any).alcoholPolicy === 'allowed' && (
                    <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}10` : '#f9fafb' }}>
                      <Wine className="w-5 h-5 flex-shrink-0" style={{ color: effectiveThemeColor }} />
                      <span style={{ fontFamily: effectiveFont }}>
                        {language === 'kz' ? 'Алкоголь болады' : 'Будет алкоголь'}
                      </span>
                    </div>
                  )}
                  {(wedding as any).alcoholPolicy === 'not_allowed' && (
                    <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}10` : '#f9fafb' }}>
                      <div className="relative flex-shrink-0">
                        <Wine className="w-5 h-5" style={{ color: effectiveThemeColor }} />
                        <BanIcon className="w-3 h-3 absolute -top-1 -right-1 text-red-500" />
                      </div>
                      <span style={{ fontFamily: effectiveFont }}>
                        {language === 'kz' ? 'Алкогольсіз той' : 'Без алкоголя'}
                      </span>
                    </div>
                  )}
                  {(wedding as any).photoPolicy === 'allowed' && (
                    <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}10` : '#f9fafb' }}>
                      <Camera className="w-5 h-5 flex-shrink-0" style={{ color: effectiveThemeColor }} />
                      <span style={{ fontFamily: effectiveFont }}>
                        {language === 'kz' ? 'Фото/видео түсіруге болады' : 'Можно фотографировать'}
                      </span>
                    </div>
                  )}
                  {(wedding as any).photoPolicy === 'not_allowed' && (
                    <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}10` : '#f9fafb' }}>
                      <div className="relative flex-shrink-0">
                        <Camera className="w-5 h-5" style={{ color: effectiveThemeColor }} />
                        <BanIcon className="w-3 h-3 absolute -top-1 -right-1 text-red-500" />
                      </div>
                      <span style={{ fontFamily: effectiveFont }}>
                        {language === 'kz' ? 'Фото/видео түсіруге болмайды' : 'Пожалуйста, без съёмки'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Background Music Player */}
      {wedding.musicUrl && (
        <BackgroundMusic 
          musicUrl={wedding.musicUrl} 
          autoplay={true}
          themeColor={effectiveThemeColor || undefined}
        />
      )}
      
      {/* Spacer to push footer down */}
      <div className="flex-1" />
      
      {/* Footer */}
      <footer 
        className="mt-auto py-12 text-center"
        style={{
          backgroundColor: effectiveThemeColor ? `${effectiveThemeColor}08` : 'transparent',
        }}
      >
        <p 
          className="text-sm opacity-40"
          style={{ 
            color: effectiveTextColor || autoTextColor,
            fontFamily: effectiveFont || template.fonts.body,
          }}
        >
          {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

function RsvpForm({ weddingId, language, customFont, customColor, themeColor, buttonColor, buttonTextColor }: { weddingId: number; language: "ru" | "kz"; customFont?: string; customColor?: string; themeColor?: string; buttonColor?: string; buttonTextColor?: string }) {
  const effectiveButtonColor = buttonColor || themeColor;
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    attending: "yes" as "yes" | "no" | "yes_plus_one" | "yes_with_spouse",
    guestCount: 1,
    dietaryRestrictions: "",
    needsParking: false,
    needsTransfer: false,
  });

  const submitMutation = trpc.rsvp.submit.useMutation({
    onSuccess: () => {
      toast.success(language === "kz" ? "Рахмет! Жауабыңыз қабылданды" : "Спасибо! Ваш ответ принят");
      setFormData({ name: "", phone: "", attending: "yes", guestCount: 1, dietaryRestrictions: "", needsParking: false, needsTransfer: false });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({ ...formData, weddingId });
  };

  return (
    <Card style={{
      backgroundColor: themeColor ? `${themeColor}08` : undefined,
      borderColor: themeColor ? `${themeColor}30` : undefined,
    }}>
      <CardHeader>
        <CardTitle style={{ fontFamily: customFont, color: customColor }}>{language === "kz" ? "Қатысуды растау" : "Подтвердите присутствие"}</CardTitle>
        <CardDescription>
          {language === "kz"
            ? "Біз сіздің келетініңізді білгіміз келеді"
            : "Нам важно знать, что вы придёте"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{language === "kz" ? "Аты-жөніңіз" : "Ваше имя"} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={themeColor ? {
                // @ts-ignore
                '--input-focus-ring': themeColor,
              } : {}}
              className="focus-visible:ring-2 focus-visible:ring-[var(--input-focus-ring)] focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{language === "kz" ? "Телефон" : "Телефон"}</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={themeColor ? {
                // @ts-ignore
                '--input-focus-ring': themeColor,
              } : {}}
              className="focus-visible:ring-2 focus-visible:ring-[var(--input-focus-ring)] focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-2">
            <Label>{language === "kz" ? "Келесіз бе?" : "Вы придёте?"} *</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={formData.attending === "yes" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, attending: "yes", guestCount: 1 })}
                style={formData.attending === "yes" && effectiveButtonColor ? {
                  backgroundColor: effectiveButtonColor,
                  borderColor: effectiveButtonColor,
                  color: buttonTextColor || "#FFFFFF",
                } : {}}
              >
                {language === "kz" ? "Келемін" : "Приду"}
              </Button>
              <Button
                type="button"
                variant={formData.attending === "yes_with_spouse" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, attending: "yes_with_spouse", guestCount: 2 })}
                style={formData.attending === "yes_with_spouse" && effectiveButtonColor ? {
                  backgroundColor: effectiveButtonColor,
                  borderColor: effectiveButtonColor,
                  color: buttonTextColor || "#FFFFFF",
                } : {}}
              >
                {language === "kz" ? "Жұбаймен келемін" : "Приду + супруг/а"}
              </Button>
              <Button
                type="button"
                variant={formData.attending === "yes_plus_one" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, attending: "yes_plus_one", guestCount: 2 })}
                style={formData.attending === "yes_plus_one" && effectiveButtonColor ? {
                  backgroundColor: effectiveButtonColor,
                  borderColor: effectiveButtonColor,
                  color: buttonTextColor || "#FFFFFF",
                } : {}}
              >
                {language === "kz" ? "Келемін +1" : "Приду +1"}
              </Button>
              <Button
                type="button"
                variant={formData.attending === "no" ? "default" : "outline"}
                onClick={() => setFormData({ ...formData, attending: "no", guestCount: 0 })}
                style={formData.attending === "no" && effectiveButtonColor ? {
                  backgroundColor: effectiveButtonColor,
                  borderColor: effectiveButtonColor,
                  color: buttonTextColor || "#FFFFFF",
                } : {}}
              >
                {language === "kz" ? "Келе алмаймын" : "Не приду"}
              </Button>
            </div>
          </div>

          {formData.attending !== "no" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="dietary">{language === "kz" ? "Тағам шектеулері немесе аллергия" : "Особенности питания или аллергии"}</Label>
                <Input
                  id="dietary"
                  value={formData.dietaryRestrictions}
                  onChange={(e) => setFormData({ ...formData, dietaryRestrictions: e.target.value })}
                  placeholder={language === "kz" ? "Мысалы: вегетариан, лактоза аллергиясы" : "Например: вегетарианец, аллергия на лактозу"}
                  style={themeColor ? {
                    // @ts-ignore
                    '--input-focus-ring': themeColor,
                  } : {}}
                  className="focus-visible:ring-2 focus-visible:ring-[var(--input-focus-ring)] focus-visible:ring-offset-0"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="parking"
                  checked={formData.needsParking}
                  onChange={(e) => setFormData({ ...formData, needsParking: e.target.checked })}
                  className="rounded"
                  style={themeColor ? {
                    accentColor: themeColor,
                  } : {}}
                />
                <Label htmlFor="parking" className="font-normal cursor-pointer">
                  {language === "kz" ? "Тұрақ қажет" : "Нужна парковка"}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="transfer"
                  checked={formData.needsTransfer}
                  onChange={(e) => setFormData({ ...formData, needsTransfer: e.target.checked })}
                  className="rounded"
                  style={themeColor ? {
                    accentColor: themeColor,
                  } : {}}
                />
                <Label htmlFor="transfer" className="font-normal cursor-pointer">
                  {language === "kz" ? "Трансфер қажет" : "Нужен трансфер"}
                </Label>
              </div>
            </>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitMutation.isPending}
            style={effectiveButtonColor ? {
              backgroundColor: effectiveButtonColor,
              borderColor: effectiveButtonColor,
              color: buttonTextColor || "#FFFFFF",
            } : {}}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {language === "kz" ? "Жіберілуде..." : "Отправка..."}
              </>
            ) : (
              <>{language === "kz" ? "Жіберу" : "Отправить"}</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function WishlistSection({ weddingId, language, customFont, customColor, themeColor, buttonColor, buttonTextColor }: { weddingId: number; language: "ru" | "kz"; customFont?: string; customColor?: string; themeColor?: string; buttonColor?: string; buttonTextColor?: string }) {
  const effectiveButtonColor = buttonColor || themeColor;
  const [reserveId, setReserveId] = useState<number | null>(null);
  const [reserveData, setReserveData] = useState({
    reservedBy: "",
    reservedEmail: "",
    reservedPhone: "",
  });

  const { data: wishlist } = trpc.wishlist.list.useQuery({ weddingId });
  
  const utils = trpc.useUtils();
  const reserveMutation = trpc.wishlist.reserve.useMutation({
    onSuccess: () => {
      toast.success(language === "kz" ? "Сыйлық брондалды!" : "Подарок зарезервирован!");
      utils.wishlist.list.invalidate();
      setReserveId(null);
      setReserveData({ reservedBy: "", reservedEmail: "", reservedPhone: "" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleReserve = (id: number) => {
    if (!reserveData.reservedBy || !reserveData.reservedEmail) {
      toast.error(language === "kz" ? "Атыңыз бен email-ді толтырыңыз" : "Заполните имя и email");
      return;
    }
    reserveMutation.mutate({ id, ...reserveData });
  };

  if (!wishlist || wishlist.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === "kz" ? "Сыйлықтар тізімі әзірге жоқ" : "Список подарков пока пуст"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {wishlist.map((item) => {
        const name = language === "kz" && item.nameKz ? item.nameKz : item.name;
        const description = language === "kz" && item.descriptionKz ? item.descriptionKz : item.description;

        return (
          <Card 
            key={item.id}
            style={{
              backgroundColor: themeColor ? `${themeColor}08` : undefined,
              borderColor: themeColor ? `${themeColor}30` : undefined,
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-start justify-between gap-2">
                <span style={{ fontFamily: customFont, color: customColor }}>{name}</span>
                {item.isReserved && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {language === "kz" ? "Брондалған" : "Зарезервировано"}
                  </span>
                )}
              </CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-3">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:underline"
                style={{
                  color: themeColor || undefined,
                }}
              >
                <ExternalLink className="w-4 h-4" />
                {language === "kz" ? "Сілтемені ашу" : "Открыть ссылку"}
              </a>

              {!item.isReserved && (
                <>
                  {reserveId === item.id ? (
                    <div className="space-y-3 pt-3 border-t">
                      <Input
                        placeholder={language === "kz" ? "Атыңыз" : "Ваше имя"}
                        value={reserveData.reservedBy}
                        onChange={(e) =>
                          setReserveData({ ...reserveData, reservedBy: e.target.value })
                        }
                        style={themeColor ? {
                          // @ts-ignore
                          '--input-focus-ring': themeColor,
                        } : {}}
                        className="focus-visible:ring-2 focus-visible:ring-[var(--input-focus-ring)] focus-visible:ring-offset-0"
                      />
                      <Input
                        type="email"
                        placeholder="Email"
                        value={reserveData.reservedEmail}
                        onChange={(e) =>
                          setReserveData({ ...reserveData, reservedEmail: e.target.value })
                        }
                        style={themeColor ? {
                          // @ts-ignore
                          '--input-focus-ring': themeColor,
                        } : {}}
                        className="focus-visible:ring-2 focus-visible:ring-[var(--input-focus-ring)] focus-visible:ring-offset-0"
                      />
                      <Input
                        type="tel"
                        placeholder={language === "kz" ? "Телефон" : "Телефон"}
                        value={reserveData.reservedPhone}
                        onChange={(e) =>
                          setReserveData({ ...reserveData, reservedPhone: e.target.value })
                        }
                        style={themeColor ? {
                          // @ts-ignore
                          '--input-focus-ring': themeColor,
                        } : {}}
                        className="focus-visible:ring-2 focus-visible:ring-[var(--input-focus-ring)] focus-visible:ring-offset-0"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReserve(item.id)}
                          disabled={reserveMutation.isPending}
                          className="flex-1"
                        >
                          {reserveMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : language === "kz" ? (
                            "Растау"
                          ) : (
                            "Подтвердить"
                          )}
                        </Button>
                        <Button variant="outline" onClick={() => setReserveId(null)}>
                          {language === "kz" ? "Болдырмау" : "Отмена"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      onClick={() => setReserveId(item.id)} 
                      className="w-full"
                      style={effectiveButtonColor ? {
                        backgroundColor: effectiveButtonColor,
                        borderColor: effectiveButtonColor,
                        color: buttonTextColor || "#FFFFFF",
                      } : {}}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      {language === "kz" ? "Брондау" : "Зарезервировать"}
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function WishesSection({ weddingId, language, customFont, customColor, themeColor, buttonColor, buttonTextColor }: { weddingId: number; language: "ru" | "kz"; customFont?: string; customColor?: string; themeColor?: string; buttonColor?: string; buttonTextColor?: string }) {
  const effectiveButtonColor = buttonColor || themeColor;
  const [formData, setFormData] = useState({
    guestName: "",
    message: "",
  });

  const { data: wishes } = trpc.wish.listApproved.useQuery({ weddingId });

  const utils = trpc.useUtils();
  const submitMutation = trpc.wish.submit.useMutation({
    onSuccess: () => {
      toast.success(
        language === "kz"
          ? "Рахмет! Тілегіңіз модерациядан өткеннен кейін көрсетіледі"
          : "Спасибо! Ваше пожелание появится после модерации"
      );
      setFormData({ guestName: "", message: "" });
      utils.wish.listApproved.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate({ ...formData, weddingId });
  };

  return (
    <div className="space-y-6">
      <Card style={{
        backgroundColor: themeColor ? `${themeColor}08` : undefined,
        borderColor: themeColor ? `${themeColor}30` : undefined,
      }}>
        <CardHeader>
          <CardTitle style={{ color: customColor }}>{language === "kz" ? "Тілек қалдыру" : "Оставить пожелание"}</CardTitle>
          <CardDescription>
            {language === "kz"
              ? "Жылы сөздер мен тілектеріңізді жазыңыз"
              : "Напишите тёплые слова и пожелания"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">{language === "kz" ? "Атыңыз" : "Ваше имя"} *</Label>
              <Input
                id="guestName"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                required
                style={themeColor ? {
                  // @ts-ignore
                  '--input-focus-ring': themeColor,
                } : {}}
                className="focus-visible:ring-2 focus-visible:ring-[var(--input-focus-ring)] focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">{language === "kz" ? "Тілек" : "Пожелание"} *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                required
                style={themeColor ? {
                  // @ts-ignore
                  '--input-focus-ring': themeColor,
                } : {}}
                className="focus-visible:ring-2 focus-visible:ring-[var(--input-focus-ring)] focus-visible:ring-offset-0"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitMutation.isPending}
              style={effectiveButtonColor ? {
                backgroundColor: effectiveButtonColor,
                borderColor: effectiveButtonColor,
                color: buttonTextColor || "#FFFFFF",
              } : {}}
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "kz" ? "Жіберілуде..." : "Отправка..."}
                </>
              ) : (
                <>{language === "kz" ? "Жіберу" : "Отправить"}</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {wishes && wishes.length > 0 && (
        <div className="space-y-4">
          <h3 
            className="text-2xl font-bold"
            style={{
              fontFamily: customFont,
              color: customColor,
            }}
          >
            {language === "kz" ? "Тілектер" : "Пожелания гостей"}
          </h3>
          {wishes.map((wish) => (
            <Card 
              key={wish.id}
              style={{
                backgroundColor: themeColor ? `${themeColor}08` : undefined,
                borderColor: themeColor ? `${themeColor}30` : undefined,
              }}
            >
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: customColor }}>{wish.guestName}</CardTitle>
                <CardDescription>
                  {new Date(wish.createdAt).toLocaleDateString(language === "kz" ? "kk-KZ" : "ru-RU")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">{wish.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

