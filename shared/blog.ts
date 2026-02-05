/**
 * Blog post categories
 */
export type BlogCategory = 
  | 'weddings'      // Свадьбы
  | 'birthdays'     // Дни рождения
  | 'traditions'    // Традиции
  | 'corporate'     // Корпоративы
  | 'tips'          // Советы
  | 'ideas';        // Идеи

/**
 * Blog post metadata
 */
export interface BlogPost {
  slug: string;
  title: string;
  titleKz?: string;
  description: string;
  descriptionKz?: string;
  category: BlogCategory;
  author: string;
  date: string; // ISO date string
  image?: string; // Cover image URL
  tags: string[];
  content: string; // Markdown content
  readTime?: number; // Estimated read time in minutes
}

/**
 * Blog post frontmatter (metadata at the top of Markdown files)
 */
export interface BlogFrontmatter {
  title: string;
  titleKz?: string;
  description: string;
  descriptionKz?: string;
  category: BlogCategory;
  author: string;
  date: string;
  image?: string;
  tags: string[];
}

/**
 * Category display information
 */
export const BLOG_CATEGORIES: Record<BlogCategory, { name: string; nameKz: string; description: string }> = {
  weddings: {
    name: 'Свадьбы',
    nameKz: 'Тойлар',
    description: 'Идеи и вдохновение для свадебных торжеств',
  },
  birthdays: {
    name: 'Дни рождения',
    nameKz: 'Туған күндер',
    description: 'Идеи для незабываемых дней рождения и юбилеев',
  },
  traditions: {
    name: 'Традиции',
    nameKz: 'Дәстүрлер',
    description: 'Казахские традиции и обычаи для разных мероприятий',
  },
  corporate: {
    name: 'Корпоративы',
    nameKz: 'Корпоративтер',
    description: 'Идеи для корпоративных мероприятий и праздников',
  },
  tips: {
    name: 'Советы',
    nameKz: 'Кеңестер',
    description: 'Полезные советы по организации мероприятий',
  },
  ideas: {
    name: 'Идеи',
    nameKz: 'Идеялар',
    description: 'Креативные идеи для незабываемых событий',
  },
};

/**
 * Calculate estimated read time based on content length
 */
export function calculateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate SEO-friendly slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9а-яё\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

