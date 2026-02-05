
import type { BlogPost, BlogCategory } from "@shared/blog";

// Blog posts data
const posts: BlogPost[] = [
  {
    slug: "kazakh-wedding-traditions",
    title: "Казахские свадебные традиции",
    titleKz: "Қазақ той дәстүрлері",
    description: "Узнайте о богатых традициях казахской свадьбы: от сватовства до беташара",
    descriptionKz: "Қазақ тойының бай дәстүрлері туралы біліңіз: құдалықтан беташарға дейін",
    category: "traditions",
    author: "BookMe.kz",
    date: "2024-11-15",
    image: "/blog/kazakh-wedding.jpg",
    tags: ["традиции", "казахская свадьба", "беташар", "құдалық"],
    readTime: 8,
    content: `
# Казахские свадебные традиции

Казахская свадьба — это не просто торжество, а целый комплекс обрядов и традиций, передающихся из поколения в поколение.

## Құдалық (Сватовство)

Первым этапом является сватовство. Родители жениха отправляют сватов к родителям невесты...

## Қыз ұзату (Проводы невесты)

Один из самых трогательных моментов свадьбы — проводы невесты из родительского дома...

## Беташар (Открытие лица невесты)

Беташар — это красивый обряд представления невесты родственникам жениха...

## Современные традиции

Сегодня многие пары сочетают традиционные обряды с современными элементами...
    `,
  },
  {
    slug: "modern-wedding-trends",
    title: "Современные тренды свадеб 2024",
    titleKz: "2024 жылғы заманауи той трендтері",
    description: "Актуальные тренды в оформлении и организации свадеб",
    descriptionKz: "Тойларды безендіру мен ұйымдастырудағы өзекті трендтер",
    category: "ideas",
    author: "BookMe.kz",
    date: "2024-10-20",
    image: "/blog/modern-wedding.jpg",
    tags: ["тренды", "современная свадьба", "декор"],
    readTime: 6,
    content: `
# Современные тренды свадеб 2024

## Минимализм в декоре

Меньше — значит больше. Современные пары выбирают элегантный минимализм...

## Экологичность

Эко-свадьбы становятся всё популярнее: многоразовая посуда, живые цветы, локальные продукты...

## Персонализация

Уникальные элементы, отражающие историю пары: кастомные приглашения, авторский декор...

## Технологии

Онлайн-приглашения, RSVP через интернет, трансляции для дальних гостей...
    `,
  },
  {
    slug: "wedding-planning-tips",
    title: "10 советов по планированию свадьбы",
    titleKz: "Тойды жоспарлаудың 10 кеңесі",
    description: "Практические советы для организации идеальной свадьбы",
    descriptionKz: "Тамаша тойды ұйымдастыру үшін практикалық кеңестер",
    category: "tips",
    author: "BookMe.kz",
    date: "2024-09-10",
    image: "/blog/planning.jpg",
    tags: ["планирование", "советы", "организация"],
    readTime: 10,
    content: `
# 10 советов по планированию свадьбы

## 1. Начните заранее

Идеальный срок — 6-12 месяцев до свадьбы...

## 2. Определите бюджет

Реалистичный бюджет — основа успешного планирования...

## 3. Составьте список гостей

От количества гостей зависит выбор площадки и меню...

## 4. Выберите площадку

Бронируйте популярные места заранее...

## 5. Найдите подрядчиков

Фотограф, видеооператор, ведущий, декоратор...
    `,
  },
  {
    slug: "dress-code-guide",
    title: "Гид по дресс-коду на свадьбе",
    titleKz: "Тойдағы киім коды бойынша нұсқаулық",
    description: "Как правильно указать дресс-код и что он означает",
    descriptionKz: "Киім кодын қалай дұрыс көрсету керек және ол нені білдіреді",
    category: "tips",
    author: "BookMe.kz",
    date: "2024-08-25",
    image: "/blog/dress-code.jpg",
    tags: ["дресс-код", "стиль", "гости"],
    readTime: 5,
    content: `
# Гид по дресс-коду на свад
ьбе

## Что такое дресс-код?

Дресс-код помогает создать единую атмосферу торжества...

## Популярные варианты

- **Black Tie** — вечерние платья и смокинги
- **Cocktail** — коктейльные платья и костюмы
- **Garden Party** — лёгкие платья и светлые костюмы
- **Casual** — свободный стиль

## Как указать в приглашении

Укажите дресс-код чётко и понятно, при необходимости добавьте примеры...
    `,
  },
  {
    slug: "betashar-ceremony",
    title: "Беташар: традиция и современность",
    titleKz: "Беташар: дәстүр мен заманауилық",
    description: "Всё о красивейшей казахской традиции беташар",
    descriptionKz: "Беташар — ең әдемі қазақ дәстүрі туралы барлығы",
    category: "traditions",
    author: "BookMe.kz",
    date: "2024-07-30",
    image: "/blog/betashar.jpg",
    tags: ["беташар", "традиции", "обряды"],
    readTime: 7,
    content: `
# Беташар: традиция и современность

## История обряда

Беташар — древний казахский обряд открытия лица невесты...

## Как проходит беташар

Невеста стоит с закрытым лицом, а специально приглашённый певец (жыршы) исполняет песню...

## Современные интерпретации

Сегодня беташар адаптируется под современные реалии, но сохраняет свою суть...

## Подготовка к беташару

Выбор исполнителя, украшение невесты, подготовка подарков...
    `,
  },
];

/**
 * Get all blog posts
 */
export function getAllPosts(): BlogPost[] {
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get post by slug
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find(post => post.slug === slug);
}

/**
 * Get posts by category
 */
export function getPostsByCategory(category: BlogCategory): BlogPost[] {
  return posts.filter(post => post.category === category);
}

/**
 * Get related posts (same category, excluding current)
 */
export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];
  
  return posts
    .filter(post => post.slug !== currentSlug && post.category === currentPost.category)
    .slice(0, limit);
}

/**
 * Search posts
 */
export function searchPosts(query: string): BlogPost[] {
  const lowerQuery = query.toLowerCase();
  return posts.filter(post => 
    post.title.toLowerCase().includes(lowerQuery) ||
    post.description.toLowerCase().includes(lowerQuery) ||
    post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}

export default posts;





