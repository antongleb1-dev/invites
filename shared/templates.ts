// Premium template configurations for event invitation pages
// Supports all event types: weddings, birthdays, corporate events, anniversaries, sundettoi, tusaukeser, kyz_uzatu, betashar, etc.

import type { EventType } from './const';

export type TemplateConfig = {
  id: string;
  name: string;
  nameKz: string;
  description: string;
  descriptionKz: string;
  isPremium: boolean;
  previewImage?: string;
  backgroundImage?: string;
  // Recommended event types for this template (empty = all types)
  recommendedFor?: EventType[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    ornament: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  ornamentStyle: 'golden' | 'floral' | 'geometric' | 'silk' | 'nomadic' | 'islamic' | 'starry' | 'cloud' | 'none';
  layout: 'classic' | 'modern' | 'elegant';
};

export const TEMPLATES: Record<string, TemplateConfig> = {
  classic: {
    id: 'classic',
    name: 'Классический',
    nameKz: 'Классикалық',
    description: 'Элегантный классический дизайн для любых мероприятий',
    descriptionKz: 'Кез-келген іс-шараларға арналған классикалық дизайн',
    isPremium: false,
    colors: {
      primary: '#D4AF37',
      secondary: '#F5F5DC',
      accent: '#8B7355',
      background: '#FFFFFF',
      text: '#333333',
      ornament: '#D4AF37',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    },
    ornamentStyle: 'none',
    layout: 'classic',
  },

  kazakh_gold_ornament: {
    id: 'kazakh_gold_ornament',
    name: 'Казахское Золото',
    nameKz: 'Қазақ Алтыны',
    description: 'Роскошный шаблон с золотыми казахскими орнаментами кошкар и традиционными узорами',
    descriptionKz: 'Алтын қазақ қошқар ою-өрнектері мен дәстүрлі үлгілері бар сәнді үлгі',
    isPremium: true,
    backgroundImage: '/templates/kazakh-gold-bg.png',
    colors: {
      primary: '#D4AF37', // Gold
      secondary: '#C9A55C', // Light Gold
      accent: '#FFD700', // Bright Gold
      background: '#FFFEF7', // Cream White
      text: '#2C1810',
      ornament: '#D4AF37',
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Crimson Text',
    },
    ornamentStyle: 'golden',
    layout: 'elegant',
  },

  kazakh_swirl_elegance: {
    id: 'kazakh_swirl_elegance',
    name: 'Казахские Завитки',
    nameKz: 'Қазақ Ою-өрнектері',
    description: 'Элегантный дизайн с казахскими завитками в бежево-коричневых тонах',
    descriptionKz: 'Бежді-қоңыр түстердегі қазақ ою-өрнектері бар сәнді дизайн',
    isPremium: true,
    backgroundImage: '/templates/kazakh-swirl-bg.png',
    colors: {
      primary: '#A08B7A', // Taupe
      secondary: '#E8DCC4', // Beige
      accent: '#8B7355', // Brown
      background: '#F5F0E8', // Light Beige
      text: '#4A3F35',
      ornament: '#A08B7A',
    },
    fonts: {
      heading: 'Philosopher',
      body: 'Jost',
    },
    ornamentStyle: 'golden',
    layout: 'elegant',
  },

  islamic_arch_gold: {
    id: 'islamic_arch_gold',
    name: 'Исламская Арка',
    nameKz: 'Ислам Арка',
    description: 'Величественный дизайн с исламскими арками, мечетями и золотыми узорами',
    descriptionKz: 'Ислам аркалары, мешіттері және алтын ою-өрнектері бар керемет дизайн',
    isPremium: true,
    backgroundImage: '/templates/islamic-arch-bg.png',
    colors: {
      primary: '#B8956A', // Antique Gold
      secondary: '#F5E6D3', // Cream
      accent: '#D4AF37', // Gold
      background: '#FFF9F0', // Ivory
      text: '#3E2C1F',
      ornament: '#B8956A',
    },
    fonts: {
      heading: 'Cinzel',
      body: 'Raleway',
    },
    ornamentStyle: 'islamic',
    layout: 'elegant',
  },

  mandala_golden_dream: {
    id: 'mandala_golden_dream',
    name: 'Золотая Мандала',
    nameKz: 'Алтын Мандала',
    description: 'Восточный шаблон с золотыми мандалами и индийскими узорами',
    descriptionKz: 'Алтын мандалалары және үнді ою-өрнектері бар шығыс үлгісі',
    isPremium: true,
    backgroundImage: '/templates/mandala-bg.png',
    colors: {
      primary: '#C9A55C', // Golden Brown
      secondary: '#F5E6D3', // Cream
      accent: '#D4AF37', // Gold
      background: '#FFF8E7', // Light Yellow
      text: '#3E2C1F',
      ornament: '#C9A55C',
    },
    fonts: {
      heading: 'Libre Baskerville',
      body: 'Source Sans Pro',
    },
    ornamentStyle: 'geometric',
    layout: 'elegant',
  },

  magnolia_garden: {
    id: 'magnolia_garden',
    name: 'Сад Магнолий',
    nameKz: 'Магнолия Бағы',
    description: 'Нежный шаблон с белыми магнолиями и зелеными листьями',
    descriptionKz: 'Ақ магнолиялары және жасыл жапырақтары бар нәзік үлгі',
    isPremium: true,
    backgroundImage: '/templates/magnolia-bg.png',
    colors: {
      primary: '#8B9A7D', // Sage Green
      secondary: '#F5F5F0', // Off White
      accent: '#D4C5B9', // Beige
      background: '#FFFFFF', // White
      text: '#3E3E3E',
      ornament: '#8B9A7D',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    },
    ornamentStyle: 'floral',
    layout: 'elegant',
  },

  starry_night_blue: {
    id: 'starry_night_blue',
    name: 'Звездная Ночь',
    nameKz: 'Жұлдызды Түн',
    description: 'Романтичный шаблон с темно-синим фоном и золотыми звездами',
    descriptionKz: 'Қою көк фонды және алтын жұлдыздары бар романтикалық үлгі',
    isPremium: true,
    backgroundImage: '/templates/starry-night-bg.png',
    colors: {
      primary: '#2C4A6E', // Navy Blue
      secondary: '#4A6FA5', // Medium Blue
      accent: '#D4AF37', // Gold
      background: '#1A2B42', // Dark Blue
      text: '#E8E8E8',
      ornament: '#D4AF37',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Open Sans',
    },
    ornamentStyle: 'starry',
    layout: 'modern',
  },

  cloud_frame_chinese: {
    id: 'cloud_frame_chinese',
    name: 'Облачная Рамка',
    nameKz: 'Бұлтты Жақтау',
    description: 'Изысканный дизайн с китайскими облаками и золотыми рамками',
    descriptionKz: 'Қытай бұлттары және алтын жақтаулары бар талғампаз дизайн',
    isPremium: true,
    backgroundImage: '/templates/cloud-frame-bg.png',
    colors: {
      primary: '#3D5A80', // Dark Blue
      secondary: '#98C1D9', // Light Blue
      accent: '#D4AF37', // Gold
      background: '#2E4057', // Navy
      text: '#E8E8E8',
      ornament: '#D4AF37',
    },
    fonts: {
      heading: 'Cinzel',
      body: 'Raleway',
    },
    ornamentStyle: 'cloud',
    layout: 'elegant',
  },

  minimal_vine_border: {
    id: 'minimal_vine_border',
    name: 'Минимал Лоза',
    nameKz: 'Минималды Жүзім',
    description: 'Минималистичный шаблон с тонкими растительными рамками',
    descriptionKz: 'Жұқа өсімдік жақтаулары бар минималистік үлгі',
    isPremium: true,
    previewImage: '/templates/minimal-vine-bg.png',
    backgroundImage: '/templates/minimal-vine-bg.png',
    colors: {
      primary: '#5A4A3A', // Dark Brown
      secondary: '#E8DCC4', // Beige
      accent: '#8B7355', // Medium Brown
      background: '#F5F0E8', // Cream
      text: '#3E3E3E',
      ornament: '#5A4A3A',
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Nunito',
    },
    ornamentStyle: 'floral',
    layout: 'modern',
  },

  pearl_frame_elegance: {
    id: 'pearl_frame_elegance',
    name: 'Жемчужная Рамка',
    nameKz: 'Інжу Жақтау',
    description: 'Роскошный дизайн с жемчужными рамками и перламутровым фоном',
    descriptionKz: 'Інжу жақтаулары және перламутр фоны бар сәнді дизайн',
    isPremium: true,
    previewImage: '/templates/pearl-frame-bg.png',
    backgroundImage: '/templates/pearl-frame-bg.png',
    colors: {
      primary: '#E8D5C4', // Pearl Beige
      secondary: '#F5EFE7', // Ivory
      accent: '#C9B8A8', // Taupe
      background: '#FFF9F5', // Cream White
      text: '#4A3F35',
      ornament: '#E8D5C4',
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Crimson Text',
    },
    ornamentStyle: 'geometric',
    layout: 'elegant',
  },

  embossed_damask_luxury: {
    id: 'embossed_damask_luxury',
    name: 'Тисненый Дамаск',
    nameKz: 'Басылған Дамаск',
    description: 'Изысканный шаблон с тиснеными дамасскими узорами',
    descriptionKz: 'Басылған дамаск ою-өрнектері бар талғампаз үлгі',
    isPremium: true,
    previewImage: '/templates/embossed-damask-bg.png',
    backgroundImage: '/templates/embossed-damask-bg.png',
    colors: {
      primary: '#8B7D6B', // Warm Gray
      secondary: '#D4C4B0', // Sand
      accent: '#A08B7A', // Taupe
      background: '#F5F0E8', // Light Beige
      text: '#3E3530',
      ornament: '#8B7D6B',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    },
    ornamentStyle: 'geometric',
    layout: 'elegant',
  },

  paper_flowers_garden: {
    id: 'paper_flowers_garden',
    name: 'Бумажные Цветы',
    nameKz: 'Қағаз Гүлдер',
    description: 'Нежный дизайн с бумажными цветами и пастельными тонами',
    descriptionKz: 'Қағаз гүлдері және пастель түстері бар нәзік дизайн',
    isPremium: true,
    previewImage: '/templates/paper-flowers-bg.png',
    backgroundImage: '/templates/paper-flowers-bg.png',
    colors: {
      primary: '#D4A5A5', // Dusty Rose
      secondary: '#F5E6E8', // Blush
      accent: '#B8A0A0', // Mauve
      background: '#FFF5F7', // Light Pink
      text: '#5A4A4A',
      ornament: '#D4A5A5',
    },
    fonts: {
      heading: 'Libre Baskerville',
      body: 'Source Sans Pro',
    },
    ornamentStyle: 'floral',
    layout: 'elegant',
  },

  lily_floral_dream: {
    id: 'lily_floral_dream',
    name: 'Лилии Мечты',
    nameKz: 'Арман Лилиялары',
    description: 'Романтичный шаблон с белыми лилиями и золотыми акцентами',
    descriptionKz: 'Ақ лилиялары және алтын акценттері бар романтикалық үлгі',
    isPremium: true,
    previewImage: '/templates/lily-floral-bg.png',
    backgroundImage: '/templates/lily-floral-bg.png',
    colors: {
      primary: '#9B8B7E', // Warm Taupe
      secondary: '#F0E6D2', // Champagne
      accent: '#C9A55C', // Gold
      background: '#FFF8F0', // Ivory
      text: '#4A3F35',
      ornament: '#9B8B7E',
    },
    fonts: {
      heading: 'Cinzel',
      body: 'Raleway',
    },
    ornamentStyle: 'floral',
    layout: 'elegant',
  },

  white_floral_frame: {
    id: 'white_floral_frame',
    name: 'Белая Цветочная Рамка',
    nameKz: 'Ақ Гүл Жақтау',
    description: 'Элегантный дизайн с белыми цветочными рамками',
    descriptionKz: 'Ақ гүл жақтаулары бар сәнді дизайн',
    isPremium: true,
    previewImage: '/templates/white-floral-frame-bg.png',
    backgroundImage: '/templates/white-floral-frame-bg.png',
    colors: {
      primary: '#A8998B', // Greige
      secondary: '#E8E0D5', // Warm White
      accent: '#8B7D6B', // Taupe
      background: '#FFFBF7', // Off White
      text: '#3E3530',
      ornament: '#A8998B',
    },
    fonts: {
      heading: 'Philosopher',
      body: 'Jost',
    },
    ornamentStyle: 'floral',
    layout: 'elegant',
  },

  golden_border_classic: {
    id: 'golden_border_classic',
    name: 'Золотая Классика',
    nameKz: 'Алтын Классика',
    description: 'Классический шаблон с золотыми рамками и орнаментами',
    descriptionKz: 'Алтын жақтаулары және ою-өрнектері бар классикалық үлгі',
    isPremium: true,
    previewImage: '/templates/golden-border-bg.png',
    backgroundImage: '/templates/golden-border-bg.png',
    colors: {
      primary: '#D4AF37', // Gold
      secondary: '#F5E6D3', // Cream
      accent: '#B8956A', // Antique Gold
      background: '#FFF9F0', // Ivory
      text: '#3E2C1F',
      ornament: '#D4AF37',
    },
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'Crimson Text',
    },
    ornamentStyle: 'golden',
    layout: 'classic',
  },

  white_ribbon_romance: {
    id: 'white_ribbon_romance',
    name: 'Белые Ленты',
    nameKz: 'Ақ Таспалар',
    description: 'Романтичный дизайн с белыми лентами и кружевами',
    descriptionKz: 'Ақ таспалары және кружеволары бар романтикалық дизайн',
    isPremium: true,
    previewImage: '/templates/white-ribbon-bg.png',
    backgroundImage: '/templates/white-ribbon-bg.png',
    colors: {
      primary: '#C4B5A0', // Linen
      secondary: '#F0E6D2', // Champagne
      accent: '#A8998B', // Greige
      background: '#FFFBF7', // Off White
      text: '#4A3F35',
      ornament: '#C4B5A0',
    },
    fonts: {
      heading: 'Playfair Display',
      body: 'Lato',
    },
    ornamentStyle: 'silk',
    layout: 'elegant',
  },

  corner_ornament_vintage: {
    id: 'corner_ornament_vintage',
    name: 'Винтажные Уголки',
    nameKz: 'Винтаждық Бұрыштар',
    description: 'Винтажный шаблон с угловыми орнаментами и узорами',
    descriptionKz: 'Бұрыштық ою-өрнектері мен үлгілері бар винтаждық үлгі',
    isPremium: true,
    previewImage: '/templates/corner-ornament-bg.png',
    backgroundImage: '/templates/corner-ornament-bg.png',
    colors: {
      primary: '#8B7355', // Brown
      secondary: '#E8DCC4', // Beige
      accent: '#A08B7A', // Taupe
      background: '#F5F0E8', // Cream
      text: '#3E3530',
      ornament: '#8B7355',
    },
    fonts: {
      heading: 'Merriweather',
      body: 'Nunito',
    },
    ornamentStyle: 'geometric',
    layout: 'classic',
  },

  ornament_label_luxury: {
    id: 'ornament_label_luxury',
    name: 'Роскошные Этикетки',
    nameKz: 'Сәнді Белгілер',
    description: 'Роскошный дизайн с декоративными этикетками и рамками',
    descriptionKz: 'Декоративті белгілері және жақтаулары бар сәнді дизайн',
    isPremium: true,
    backgroundImage: '/templates/ornament-label-bg.png',
    colors: {
      primary: '#9B8B7E', // Warm Taupe
      secondary: '#D4C4B0', // Sand
      accent: '#C9A55C', // Gold
      background: '#FFF8F0', // Ivory
      text: '#4A3F35',
      ornament: '#9B8B7E',
    },
    fonts: {
      heading: 'Cinzel',
      body: 'Raleway',
    },
    ornamentStyle: 'golden',
    layout: 'elegant',
  },
};

export const getTemplate = (templateId: string): TemplateConfig => {
  return TEMPLATES[templateId] || TEMPLATES.classic;
};

export const getPremiumTemplates = (): TemplateConfig[] => {
  return Object.values(TEMPLATES).filter(t => t.isPremium);
};

export const getAllTemplates = (): TemplateConfig[] => {
  return Object.values(TEMPLATES);
};

