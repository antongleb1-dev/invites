import { useEffect } from "react";
import { useLocation } from "wouter";

// Страницы где НЕ показывать виджет JivoSite
const HIDDEN_PATHS = [
  "/create-ai",
  "/edit-ai",
];

// Паттерны для проверки (демо-страницы, страницы приглашений)
const HIDDEN_PATTERNS = [
  /^\/demo-/, // демо-страницы
  /^\/[a-zA-Z0-9\-_]+$/, // страницы приглашений (/:slug)
];

// Исключения - страницы где ПОКАЗЫВАТЬ виджет (несмотря на паттерн /:slug)
const ALLOWED_PATHS = [
  "/",
  "/start",
  "/create",
  "/dashboard",
  "/blog",
  "/features",
  "/terms",
  "/privacy",
  "/admin",
  "/404",
];

function shouldShowJivo(pathname: string): boolean {
  // Всегда показывать на разрешённых страницах
  if (ALLOWED_PATHS.includes(pathname)) {
    return true;
  }
  
  // Проверяем префиксы разрешённых страниц
  const allowedPrefixes = [
    "/manage/",
    "/manage-ai/",
    "/edit/",
    "/classic-editor/",
    "/premium-blocks/",
    "/rsvp-dashboard/",
    "/select-template/",
    "/blog/",
    "/online-invitation/",
    "/upgrade/",
    "/premium-dashboard/",
    "/edit-premium/",
    "/payment/",
  ];
  
  for (const prefix of allowedPrefixes) {
    if (pathname.startsWith(prefix)) {
      return true;
    }
  }
  
  // Скрывать на запрещённых страницах
  if (HIDDEN_PATHS.some(path => pathname.startsWith(path))) {
    return false;
  }
  
  // Скрывать на паттернах (демо, приглашения)
  for (const pattern of HIDDEN_PATTERNS) {
    if (pattern.test(pathname)) {
      return false;
    }
  }
  
  return true;
}

export default function JivoChat() {
  const [location] = useLocation();
  
  useEffect(() => {
    const show = shouldShowJivo(location);
    
    // Управляем CSS скрытием
    let style = document.getElementById("jivo-hide-style") as HTMLStyleElement | null;
    
    if (!show) {
      // Скрываем виджет через CSS
      if (!style) {
        style = document.createElement("style");
        style.id = "jivo-hide-style";
        document.head.appendChild(style);
      }
      style.textContent = `
        #jivo-iframe-container,
        .jivo-iframe-container,
        [class*="jivo"],
        jdiv {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
      `;
      
      // Дополнительно скрываем через API если доступен
      const jivo = (window as any).jivo_api;
      if (jivo && typeof jivo.close === 'function') {
        jivo.close();
      }
    } else {
      // Показываем виджет
      if (style) {
        style.textContent = '';
      }
      
      // Загружаем скрипт только если нужно показывать и ещё не загружен
      if (!document.getElementById("jivo-script")) {
        const script = document.createElement("script");
        script.id = "jivo-script";
        script.src = "//code.jivo.ru/widget/ztBBRFJ6v5";
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [location]);
  
  return null;
}

