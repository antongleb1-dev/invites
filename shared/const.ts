export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Event types for different invitation types
export const EVENT_TYPES = {
  wedding: 'wedding',
  birthday: 'birthday',
  corporate: 'corporate',
  anniversary: 'anniversary',
  sundettoi: 'sundettoi', // Kazakh circumcision celebration
  tusaukeser: 'tusaukeser', // Kazakh first steps ceremony
  kyz_uzatu: 'kyz_uzatu', // Kazakh bride farewell
  betashar: 'betashar', // Kazakh bride unveiling
  other: 'other',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

// Labels for event types (Russian and Kazakh)
export const EVENT_TYPE_LABELS: Record<EventType, { ru: string; kz: string }> = {
  wedding: { ru: 'Свадьба', kz: 'Той' },
  birthday: { ru: 'День рождения', kz: 'Туған күн' },
  corporate: { ru: 'Корпоратив', kz: 'Корпоратив' },
  anniversary: { ru: 'Юбилей', kz: 'Мерейтой' },
  sundettoi: { ru: 'Сүндеттой', kz: 'Сүндет той' },
  tusaukeser: { ru: 'Тұсау кесу', kz: 'Тұсау кесер' },
  kyz_uzatu: { ru: 'Қыз ұзату', kz: 'Қыз ұзату' },
  betashar: { ru: 'Беташар', kz: 'Беташар' },
  other: { ru: 'Другое', kz: 'Басқа' },
};

// Get display label for event type
export const getEventTypeLabel = (eventType: EventType, lang: 'ru' | 'kz' = 'ru'): string => {
  return EVENT_TYPE_LABELS[eventType]?.[lang] || EVENT_TYPE_LABELS.other[lang];
};

// Universal text labels based on event type
export const getEventTexts = (eventType: EventType, lang: 'ru' | 'kz' = 'ru') => {
  const texts = {
    wedding: {
      ru: {
        createTitle: 'Создать приглашение на свадьбу',
        eventTitle: 'Название свадьбы',
        eventDate: 'Дата свадьбы',
        wishesTitle: 'Пожелания',
        wishesDescription: 'Оставьте ваши поздравления и пожелания',
        rsvpTitle: 'Подтвердите участие',
      },
      kz: {
        createTitle: 'Той шақыруын жасау',
        eventTitle: 'Той атауы',
        eventDate: 'Той күні',
        wishesTitle: 'Тілектер',
        wishesDescription: 'Құттықтауларыңызды қалдырыңыз',
        rsvpTitle: 'Қатысуыңызды растаңыз',
      },
    },
    birthday: {
      ru: {
        createTitle: 'Создать приглашение на день рождения',
        eventTitle: 'Название праздника',
        eventDate: 'Дата праздника',
        wishesTitle: 'Поздравления',
        wishesDescription: 'Оставьте ваши поздравления имениннику',
        rsvpTitle: 'Подтвердите участие',
      },
      kz: {
        createTitle: 'Туған күн шақыруын жасау',
        eventTitle: 'Мереке атауы',
        eventDate: 'Мереке күні',
        wishesTitle: 'Құттықтаулар',
        wishesDescription: 'Құттықтауларыңызды қалдырыңыз',
        rsvpTitle: 'Қатысуыңызды растаңыз',
      },
    },
    corporate: {
      ru: {
        createTitle: 'Создать приглашение на корпоратив',
        eventTitle: 'Название мероприятия',
        eventDate: 'Дата мероприятия',
        wishesTitle: 'Пожелания',
        wishesDescription: 'Оставьте ваши пожелания',
        rsvpTitle: 'Подтвердите участие',
      },
      kz: {
        createTitle: 'Корпоратив шақыруын жасау',
        eventTitle: 'Іс-шара атауы',
        eventDate: 'Іс-шара күні',
        wishesTitle: 'Тілектер',
        wishesDescription: 'Тілектеріңізді қалдырыңыз',
        rsvpTitle: 'Қатысуыңызды растаңыз',
      },
    },
    anniversary: {
      ru: {
        createTitle: 'Создать приглашение на юбилей',
        eventTitle: 'Название юбилея',
        eventDate: 'Дата юбилея',
        wishesTitle: 'Поздравления',
        wishesDescription: 'Оставьте ваши поздравления юбиляру',
        rsvpTitle: 'Подтвердите участие',
      },
      kz: {
        createTitle: 'Мерейтой шақыруын жасау',
        eventTitle: 'Мерейтой атауы',
        eventDate: 'Мерейтой күні',
        wishesTitle: 'Құттықтаулар',
        wishesDescription: 'Құттықтауларыңызды қалдырыңыз',
        rsvpTitle: 'Қатысуыңызды растаңыз',
      },
    },
    sundettoi: {
      ru: {
        createTitle: 'Создать приглашение на сүндет той',
        eventTitle: 'Название торжества',
        eventDate: 'Дата торжества',
        wishesTitle: 'Поздравления',
        wishesDescription: 'Оставьте ваши поздравления',
        rsvpTitle: 'Подтвердите участие',
      },
      kz: {
        createTitle: 'Сүндет той шақыруын жасау',
        eventTitle: 'Той атауы',
        eventDate: 'Той күні',
        wishesTitle: 'Тілектер',
        wishesDescription: 'Тілектеріңізді қалдырыңыз',
        rsvpTitle: 'Қатысуыңызды растаңыз',
      },
    },
    tusaukeser: {
      ru: {
        createTitle: 'Создать приглашение на тұсау кесу',
        eventTitle: 'Название торжества',
        eventDate: 'Дата торжества',
        wishesTitle: 'Поздравления',
        wishesDescription: 'Оставьте ваши поздравления малышу',
        rsvpTitle: 'Подтвердите участие',
      },
      kz: {
        createTitle: 'Тұсау кесер шақыруын жасау',
        eventTitle: 'Той атауы',
        eventDate: 'Той күні',
        wishesTitle: 'Тілектер',
        wishesDescription: 'Тілектеріңізді қалдырыңыз',
        rsvpTitle: 'Қатысуыңызды растаңыз',
      },
    },
    kyz_uzatu: {
      ru: {
        createTitle: 'Создать приглашение на қыз ұзату',
        eventTitle: 'Название торжества',
        eventDate: 'Дата торжества',
        wishesTitle: 'Поздравления',
        wishesDescription: 'Оставьте ваши пожелания невесте',
        rsvpTitle: 'Подтвердите участие',
      },
      kz: {
        createTitle: 'Қыз ұзату шақыруын жасау',
        eventTitle: 'Той атауы',
        eventDate: 'Той күні',
        wishesTitle: 'Тілектер',
        wishesDescription: 'Тілектеріңізді қалдырыңыз',
        rsvpTitle: 'Қатысуыңызды растаңыз',
      },
    },
    betashar: {
      ru: {
        createTitle: 'Создать приглашение на беташар',
        eventTitle: 'Название торжества',
        eventDate: 'Дата торжества',
        wishesTitle: 'Поздравления',
        wishesDescription: 'Оставьте ваши пожелания',
        rsvpTitle: 'Подтвердите участие',
      },
      kz: {
        createTitle: 'Беташар шақыруын жасау',
        eventTitle: 'Той атауы',
        eventDate: 'Той күні',
        wishesTitle: 'Тілектер',
        wishesDescription: 'Тілектеріңізді қалдырыңыз',
        rsvpTitle: 'Қатысуыңызды растаңыз',
      },
    },
    other: {
      ru: {
        createTitle: 'Создать приглашение',
        eventTitle: 'Название мероприятия',
        eventDate: 'Дата мероприятия',
        wishesTitle: 'Пожелания',
        wishesDescription: 'Оставьте ваши пожелания',
        rsvpTitle: 'Подтвердите участие',
      },
      kz: {
        createTitle: 'Шақыру жасау',
        eventTitle: 'Іс-шара атауы',
        eventDate: 'Іс-шара күні',
        wishesTitle: 'Тілектер',
        wishesDescription: 'Тілектеріңізді қалдырыңыз',
        rsvpTitle: 'Қатысуыңызды растаңыз',
      },
    },
  };

  return texts[eventType]?.[lang] || texts.other[lang];
};

// AI Package definitions
export const AI_PACKAGES = {
  start: {
    id: 'start',
    name: 'AI START',
    edits: 15,
    price: 1990,
    description: '15 AI-правок',
  },
  pro: {
    id: 'pro',
    name: 'AI PRO',
    edits: 50,
    price: 3990,
    description: '50 AI-правок',
  },
  unlimited: {
    id: 'unlimited',
    name: 'AI UNLIMITED',
    edits: 200, // soft limit with fair use
    price: 6990,
    description: '200 AI-правок',
  },
} as const;

export type AIPackageId = keyof typeof AI_PACKAGES;

// AI Edit top-ups (докупка правок)
export const AI_TOPUPS = {
  small: {
    id: 'small',
    edits: 10,
    price: 990,
    description: '+10 AI-правок',
  },
  medium: {
    id: 'medium',
    edits: 30,
    price: 1990,
    description: '+30 AI-правок',
  },
} as const;

export type AITopupId = keyof typeof AI_TOPUPS;

// Helper to get package by ID
export const getAIPackage = (id: AIPackageId) => AI_PACKAGES[id];

// Helper to get topup by ID
export const getAITopup = (id: AITopupId) => AI_TOPUPS[id];
