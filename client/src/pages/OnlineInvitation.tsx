import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Heart, Sparkles, Users, Gift, MessageCircle, Music, 
  Globe, CheckCircle, ArrowRight, Calendar, MapPin,
  Star, Zap, Shield
} from "lucide-react";

// SEO данные для каждого типа мероприятия
const EVENT_TYPES: Record<string, {
  title: string;
  titleKz: string;
  description: string;
  descriptionKz: string;
  metaTitle: string;
  metaDescription: string;
  icon: string;
  color: string;
  features: string[];
  useCases: string[];
}> = {
  wedding: {
    title: "Онлайн-приглашения на свадьбу",
    titleKz: "Тойға онлайн-шақыру",
    description: "Создайте красивый сайт-приглашение на свадьбу с RSVP, wishlist подарков и пожеланиями гостей. Это не PDF — это интерактивный сайт!",
    descriptionKz: "Тойға әдемі онлайн-шақыру жасаңыз. RSVP, сыйлықтар тізімі және тілектер.",
    metaTitle: "Онлайн-приглашение на свадьбу — сайт с RSVP и Wishlist | Invites.kz",
    metaDescription: "Создайте интерактивный сайт-приглашение на свадьбу. Гости подтверждают участие, выбирают подарки, оставляют пожелания. Это НЕ PDF и НЕ картинка!",
    icon: "💒",
    color: "from-rose-400 to-pink-500",
    features: [
      "Подтверждение участия (RSVP) — узнайте сколько гостей придёт",
      "Wishlist подарков — гости резервируют подарки онлайн",
      "Пожелания гостей — тёплые слова молодожёнам",
      "Таймер обратного отсчёта — до дня свадьбы",
      "Карта места — гости легко найдут локацию",
      "Фотогалерея — ваши лучшие фото"
    ],
    useCases: [
      "Классическая свадьба",
      "Выездная регистрация",
      "Камерная свадьба",
      "Свадьба в стиле (бохо, рустик, классика)"
    ]
  },
  birthday: {
    title: "Онлайн-приглашения на день рождения",
    titleKz: "Туған күнге онлайн-шақыру",
    description: "Яркие интерактивные приглашения на день рождения. Гости подтверждают участие и оставляют пожелания онлайн.",
    descriptionKz: "Туған күнге жарқын онлайн-шақыру. Қонақтар қатысуын растайды.",
    metaTitle: "Онлайн-приглашение на день рождения — сайт с RSVP | Invites.kz",
    metaDescription: "Создайте яркое интерактивное приглашение на день рождения. Гости подтверждают участие онлайн, оставляют пожелания. Не PDF!",
    icon: "🎂",
    color: "from-amber-400 to-orange-500",
    features: [
      "RSVP — узнайте кто придёт заранее",
      "Wishlist — избежите повторяющихся подарков",
      "Пожелания — собирайте тёплые слова",
      "Яркий дизайн — под любой возраст",
      "Музыка — добавьте любимые треки",
      "Фото именинника — в галерее"
    ],
    useCases: [
      "Детский день рождения",
      "Юбилей 50, 60, 70 лет",
      "Молодёжная вечеринка",
      "Тематический праздник"
    ]
  },
  corporate: {
    title: "Онлайн-приглашения на корпоратив",
    titleKz: "Корпоративке онлайн-шақыру",
    description: "Профессиональные приглашения на корпоративные мероприятия с подтверждением участия и программой.",
    descriptionKz: "Корпоративтік шараларға кәсіби онлайн-шақыру.",
    metaTitle: "Онлайн-приглашение на корпоратив — профессиональный сайт | Invites.kz",
    metaDescription: "Создайте профессиональное приглашение на корпоратив. RSVP для учёта гостей, программа мероприятия, карта места.",
    icon: "🏢",
    color: "from-blue-500 to-indigo-600",
    features: [
      "RSVP — точный учёт участников",
      "Программа мероприятия — расписание по времени",
      "Дресс-код — требования к одежде",
      "Контакты организаторов",
      "Корпоративный стиль — под бренд компании",
      "Карта места — схема проезда"
    ],
    useCases: [
      "Новогодний корпоратив",
      "День компании",
      "Тимбилдинг",
      "Конференция",
      "Открытие офиса"
    ]
  },
  anniversary: {
    title: "Онлайн-приглашения на юбилей",
    titleKz: "Мерейтойға онлайн-шақыру",
    description: "Торжественные приглашения на юбилей с классическим дизайном, RSVP и пожеланиями гостей.",
    descriptionKz: "Мерейтойға салтанатты онлайн-шақыру.",
    metaTitle: "Онлайн-приглашение на юбилей — элегантный сайт | Invites.kz",
    metaDescription: "Создайте торжественное приглашение на юбилей. Элегантный дизайн, RSVP, wishlist, пожелания гостей.",
    icon: "🎉",
    color: "from-purple-500 to-violet-600",
    features: [
      "Классический элегантный дизайн",
      "RSVP — подтверждение участия",
      "Wishlist — список подарков",
      "Пожелания — собирайте поздравления",
      "Фотогалерея — история жизни",
      "Таймер — обратный отсчёт"
    ],
    useCases: [
      "Юбилей 50 лет",
      "Юбилей 60 лет",
      "Юбилей 70 лет",
      "Годовщина свадьбы"
    ]
  },
  sundettoi: {
    title: "Онлайн-приглашения на сүндет той",
    titleKz: "Сүндет тойға онлайн-шақыру",
    description: "Традиционные казахские приглашения на сүндет той с национальным орнаментом и двуязычностью.",
    descriptionKz: "Сүндет тойға дәстүрлі қазақ онлайн-шақыруы. Ұлттық өрнек пен екі тілде.",
    metaTitle: "Онлайн-приглашение на сүндет той — казахский стиль | Invites.kz",
    metaDescription: "Создайте традиционное приглашение на сүндет той. Казахский орнамент, двуязычность (русский + казахский), RSVP.",
    icon: "👶",
    color: "from-sky-400 to-blue-500",
    features: [
      "Казахский национальный орнамент",
      "Двуязычность — русский и казахский",
      "RSVP — подтверждение гостей",
      "Традиционные элементы дизайна",
      "Карта места — легко найти той",
      "Программа мероприятия"
    ],
    useCases: [
      "Сүндет той",
      "Традиционный той",
      "Семейное торжество"
    ]
  },
  tusaukeser: {
    title: "Онлайн-приглашения на тұсау кесер",
    titleKz: "Тұсау кесерге онлайн-шақыру",
    description: "Красочные приглашения на тұсау кесер с национальным колоритом и интерактивными функциями.",
    descriptionKz: "Тұсау кесерге әдемі онлайн-шақыру. Ұлттық стиль.",
    metaTitle: "Онлайн-приглашение на тұсау кесер — казахский стиль | Invites.kz",
    metaDescription: "Создайте красочное приглашение на тұсау кесер. Казахский стиль, двуязычность, RSVP и wishlist.",
    icon: "🎀",
    color: "from-pink-400 to-rose-500",
    features: [
      "Детский праздничный дизайн",
      "Казахские традиции",
      "Двуязычность",
      "RSVP для гостей",
      "Wishlist подарков",
      "Фото малыша"
    ],
    useCases: [
      "Тұсау кесер",
      "Первые шаги малыша",
      "Детский той"
    ]
  },
  "kyz-uzatu": {
    title: "Онлайн-приглашения на қыз ұзату",
    titleKz: "Қыз ұзатуға онлайн-шақыру",
    description: "Элегантные приглашения на қыз ұзату с казахскими традициями и современным дизайном.",
    descriptionKz: "Қыз ұзатуға әсем онлайн-шақыру. Қазақ дәстүрлері мен заманауи дизайн.",
    metaTitle: "Онлайн-приглашение на қыз ұзату — традиции и стиль | Invites.kz",
    metaDescription: "Создайте элегантное приглашение на қыз ұзату. Казахские традиции, современный дизайн, RSVP и пожелания.",
    icon: "👰",
    color: "from-rose-300 to-pink-400",
    features: [
      "Традиционный казахский стиль",
      "Элегантный дизайн",
      "Двуязычность",
      "RSVP — подтверждение участия",
      "Пожелания невесте",
      "Фотогалерея"
    ],
    useCases: [
      "Қыз ұзату",
      "Проводы невесты",
      "Традиционная свадьба"
    ]
  }
};

export default function OnlineInvitation() {
  const { eventType } = useParams<{ eventType: string }>();
  const data = EVENT_TYPES[eventType || "wedding"] || EVENT_TYPES.wedding;

  // Обновляем мета-теги
  useEffect(() => {
    document.title = data.metaTitle;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", data.metaDescription);
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-6xl mb-4 block">{data.icon}</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-['Playfair_Display']">
              {data.title}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {data.description}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/create-ai">
                <Button size="lg" className={`bg-gradient-to-r ${data.color} text-white px-8`}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Создать с AI
                </Button>
              </Link>
              <Link href="/create">
                <Button size="lg" variant="outline" className="px-8">
                  Классический редактор
                </Button>
              </Link>
            </div>
          </div>

          {/* Важное объяснение */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 mb-12">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-2">Это НЕ PDF и НЕ картинка!</h2>
                  <p className="text-muted-foreground">
                    Это <strong>интерактивный сайт по ссылке</strong>. Вы отправляете гостям ссылку, и они:
                  </p>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span><strong>Подтверждают участие</strong> (RSVP) — вы видите кто придёт</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span><strong>Резервируют подарки</strong> — никаких дубликатов</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span><strong>Оставляют пожелания</strong> — тёплые слова в одном месте</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Playfair_Display']">
            Что включено в приглашение
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${data.color} flex items-center justify-center flex-shrink-0`}>
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-medium">{feature}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Playfair_Display']">
            Подходит для
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            {data.useCases.map((useCase, index) => (
              <span 
                key={index}
                className={`px-6 py-3 rounded-full bg-gradient-to-r ${data.color} text-white font-medium`}
              >
                {useCase}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Playfair_Display']">
            Как это работает
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Создайте", desc: "Опишите событие AI или используйте классический редактор" },
              { step: "2", title: "Настройте", desc: "Добавьте RSVP, wishlist, пожелания, фото и музыку" },
              { step: "3", title: "Отправьте", desc: "Поделитесь ссылкой с гостями в мессенджерах" },
              { step: "4", title: "Отслеживайте", desc: "Смотрите ответы гостей в личном кабинете" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${data.color} flex items-center justify-center text-white text-2xl font-bold mb-4`}>
                  {item.step}
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Event Types */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Playfair_Display']">
            Другие типы мероприятий
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(EVENT_TYPES)
              .filter(([key]) => key !== eventType)
              .map(([key, value]) => (
                <Link key={key} href={`/online-invitation/${key}`}>
                  <Card className="hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-6 flex items-center gap-4">
                      <span className="text-3xl">{value.icon}</span>
                      <div>
                        <h3 className="font-bold">{value.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{value.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-['Playfair_Display']">
            Создайте приглашение прямо сейчас
          </h2>
          <p className="text-xl opacity-90 mb-8">
            За 2 минуты с AI или в классическом редакторе
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-ai">
              <Button size="lg" variant="secondary" className="px-8">
                <Sparkles className="w-5 h-5 mr-2" />
                Создать с AI
              </Button>
            </Link>
            <Link href="/create">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 px-8">
                Классический редактор
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


