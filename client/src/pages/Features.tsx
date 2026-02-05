import { useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { 
  Users, Gift, MessageCircle, Music, Globe, Calendar, 
  MapPin, Image, Bell, Smartphone, Sparkles, CheckCircle,
  Clock, Share2, Lock, Star, Heart, Zap
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "RSVP — подтверждение участия",
    titleKz: "RSVP — қатысуды растау",
    description: "Гости подтверждают участие онлайн. Вы видите количество гостей, диетические предпочтения и комментарии в личном кабинете.",
    benefits: [
      "Узнайте точное количество гостей",
      "Соберите контакты (телефон, email)",
      "Получите комментарии и пожелания",
      "Экспорт списка гостей"
    ],
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Gift,
    title: "Wishlist — список подарков",
    titleKz: "Wishlist — сыйлықтар тізімі",
    description: "Создайте список желаемых подарков. Гости резервируют подарки онлайн — никаких дубликатов!",
    benefits: [
      "Добавьте ссылки на товары",
      "Гости видят что уже забронировано",
      "Избежите одинаковых подарков",
      "Добавьте описания и фото"
    ],
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: MessageCircle,
    title: "Пожелания гостей",
    titleKz: "Қонақтардың тілектері",
    description: "Гости оставляют тёплые слова и поздравления. Все пожелания собраны в одном месте.",
    benefits: [
      "Модерация перед публикацией",
      "Отображение на странице приглашения",
      "Сохранение на память",
      "Уведомления о новых пожеланиях"
    ],
    color: "from-rose-500 to-red-500"
  },
  {
    icon: Music,
    title: "Фоновая музыка",
    titleKz: "Фондық музыка",
    description: "Добавьте атмосферную музыку к приглашению. Гости слышат её при открытии страницы.",
    benefits: [
      "Загрузите свою музыку",
      "Автоматическое воспроизведение",
      "Кнопка включения/выключения",
      "Поддержка MP3 формата"
    ],
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: Globe,
    title: "Мультиязычность",
    titleKz: "Көптілділік",
    description: "Приглашение на русском и казахском языках. Переключатель языка для гостей.",
    benefits: [
      "Русский и казахский",
      "Переключатель языка",
      "Все тексты на 2 языках",
      "Автоматический перевод UI"
    ],
    color: "from-emerald-500 to-green-500"
  },
  {
    icon: Calendar,
    title: "Таймер обратного отсчёта",
    titleKz: "Кері санақ таймері",
    description: "Красивый таймер до события. Создаёт ощущение ожидания и волнения.",
    benefits: [
      "Дни, часы, минуты, секунды",
      "Автоматическое обновление",
      "Красивая анимация",
      "Настраиваемый дизайн"
    ],
    color: "from-indigo-500 to-violet-500"
  },
  {
    icon: MapPin,
    title: "Карта места",
    titleKz: "Орын картасы",
    description: "Интерактивная карта с местом проведения. Гости легко найдут локацию.",
    benefits: [
      "Ссылка на Google Maps / Яндекс.Карты",
      "Адрес и ориентиры",
      "Кнопка 'Построить маршрут'",
      "Фото места"
    ],
    color: "from-sky-500 to-blue-500"
  },
  {
    icon: Image,
    title: "Фотогалерея",
    titleKz: "Фотогалерея",
    description: "Добавьте ваши лучшие фотографии. Галерея с просмотром в полный экран.",
    benefits: [
      "Загрузка до 20 фото",
      "Полноэкранный просмотр",
      "Красивая анимация",
      "Подписи к фото"
    ],
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Clock,
    title: "Программа мероприятия",
    titleKz: "Шара бағдарламасы",
    description: "Расписание события по времени. Гости знают что и когда будет происходить.",
    benefits: [
      "Timeline с иконками",
      "Время и описание",
      "Красивое оформление",
      "Неограниченное количество пунктов"
    ],
    color: "from-teal-500 to-cyan-500"
  },
  {
    icon: Sparkles,
    title: "AI-генерация",
    titleKz: "AI-генерация",
    description: "Создайте приглашение с помощью AI за 2 минуты. Просто опишите событие!",
    benefits: [
      "Уникальный дизайн",
      "Генерация за секунды",
      "Редактирование через чат",
      "Профессиональный результат"
    ],
    color: "from-violet-500 to-purple-600"
  },
  {
    icon: Smartphone,
    title: "Мобильная адаптация",
    titleKz: "Мобильді бейімделу",
    description: "Идеально выглядит на телефонах, планшетах и компьютерах.",
    benefits: [
      "Responsive дизайн",
      "Быстрая загрузка",
      "Оптимизация изображений",
      "Touch-friendly интерфейс"
    ],
    color: "from-gray-600 to-gray-800"
  },
  {
    icon: Share2,
    title: "Простой шаринг",
    titleKz: "Оңай бөлісу",
    description: "Поделитесь ссылкой в любом мессенджере. WhatsApp, Telegram, Instagram и др.",
    benefits: [
      "Короткая ссылка",
      "Красивый превью",
      "QR-код для печати",
      "Копирование в 1 клик"
    ],
    color: "from-green-500 to-emerald-500"
  }
];

export default function Features() {
  useEffect(() => {
    document.title = "Функционал онлайн-приглашения — RSVP, Wishlist, Пожелания | Invites.kz";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Что умеет онлайн-приглашение: RSVP подтверждение участия, wishlist подарков, пожелания гостей, музыка, карта, фотогалерея, мультиязычность, AI-генерация.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      
      {/* Hero */}
      <section className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-['Playfair_Display']">
            Что умеет онлайн-приглашение
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Это <strong>не PDF</strong> и <strong>не картинка</strong>. Это интерактивный сайт с RSVP, wishlist и пожеланиями гостей.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create-ai">
              <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8">
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
      </section>

      {/* Key Difference */}
      <section className="py-12 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-2">❌</div>
              <h3 className="font-bold text-lg">НЕ PDF</h3>
              <p className="opacity-80 text-sm">Статичный файл без интерактивности</p>
            </div>
            <div>
              <div className="text-4xl mb-2">❌</div>
              <h3 className="font-bold text-lg">НЕ Картинка</h3>
              <p className="opacity-80 text-sm">PNG/JPG нельзя кликать</p>
            </div>
            <div>
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-bold text-lg">Интерактивный САЙТ</h3>
              <p className="opacity-80 text-sm">Гости взаимодействуют!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Playfair_Display']">
            Все возможности
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12 font-['Playfair_Display']">
            Сравнение с аналогами
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-4 text-left font-bold">Функция</th>
                  <th className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <Heart className="w-6 h-6 text-pink-500 mb-1" />
                      <span className="font-bold">Invites.kz</span>
                    </div>
                  </th>
                  <th className="py-4 px-4 text-center text-muted-foreground">PDF</th>
                  <th className="py-4 px-4 text-center text-muted-foreground">Canva</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "RSVP онлайн", bookme: true, pdf: false, canva: false },
                  { feature: "Wishlist подарков", bookme: true, pdf: false, canva: false },
                  { feature: "Пожелания гостей", bookme: true, pdf: false, canva: false },
                  { feature: "Музыка", bookme: true, pdf: false, canva: false },
                  { feature: "Интерактивная карта", bookme: true, pdf: false, canva: false },
                  { feature: "Мультиязычность", bookme: true, pdf: false, canva: false },
                  { feature: "AI-генерация", bookme: true, pdf: false, canva: false },
                  { feature: "Таймер обратного отсчёта", bookme: true, pdf: false, canva: false },
                  { feature: "Статистика просмотров", bookme: true, pdf: false, canva: false },
                ].map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-4 px-4">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.bookme ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.pdf ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.canva ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-['Playfair_Display']">
            Попробуйте сами!
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Создайте интерактивное приглашение за 2 минуты
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


