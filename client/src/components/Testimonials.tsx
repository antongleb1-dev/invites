import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const testimonials = [
  {
    id: 1,
    name: { ru: "Айгерім и Нұрлан", kk: "Айгерім және Нұрлан" },
    date: "Август 2024",
    text: {
      ru: "Создали приглашение за 10 минут! Все гости смогли подтвердить присутствие онлайн, очень удобно. Дизайн с казахскими орнаментами получился потрясающим!",
      kk: "10 минутта шақыру жасадық! Барлық қонақтар онлайн қатысуды растай алды, өте ыңғайлы. Қазақ ою-өрнектерімен дизайн керемет болды!"
    },
    rating: 5
  },
  {
    id: 2,
    name: { ru: "Анна и Дмитрий", kk: "Анна және Дмитрий" },
    date: "Сентябрь 2024",
    text: {
      ru: "Отличная платформа! Wishlist помог гостям выбрать подарки без дублирования. Техподдержка ответила на все вопросы очень быстро.",
      kk: "Тамаша платформа! Wishlist қонақтарға қайталанбайтын сыйлықтарды таңдауға көмектесті. Техникалық қолдау барлық сұрақтарға өте тез жауап берді."
    },
    rating: 5
  },
  {
    id: 3,
    name: { ru: "Асель и Ерлан", kk: "Әсел және Ерлан" },
    date: "Октябрь 2024",
    text: {
      ru: "Нам понравилось, что можно всё настроить до оплаты. Увидели результат и только потом заплатили. Очень честный подход!",
      kk: "Төлемге дейін бәрін баптауға болатыны ұнады. Нәтижені көріп, содан кейін ғана төледік. Өте адал тәсіл!"
    },
    rating: 5
  },
  {
    id: 4,
    name: { ru: "Мария и Александр", kk: "Мария және Александр" },
    date: "Ноябрь 2024",
    text: {
      ru: "Двуязычность — это то, что нам было нужно! Половина гостей говорит по-русски, половина по-казахски. Все довольны!",
      kk: "Екі тілділік — бізге керегі осы еді! Қонақтардың жартысы орысша, жартысы қазақша сөйлейді. Барлығы риза!"
    },
    rating: 5
  },
  {
    id: 5,
    name: { ru: "Дана и Арман", kk: "Дана және Арман" },
    date: "Декабрь 2024",
    text: {
      ru: "Галерея фотографий и фоновая музыка создали идеальную атмосферу. Гости до сих пор вспоминают нашу страницу!",
      kk: "Фотосуреттер галереясы мен фондық музыка тамаша атмосфера жасады. Қонақтар әлі де біздің бетті еске алады!"
    },
    rating: 5
  },
  {
    id: 6,
    name: { ru: "Жанна и Бауыржан", kk: "Жанна және Бауыржан" },
    date: "Январь 2025",
    text: {
      ru: "Простой интерфейс, красивые шаблоны, всё работает без сбоев. Рекомендуем всем друзьям!",
      kk: "Қарапайым интерфейс, әдемі үлгілер, бәрі ақаусыз жұмыс істейді. Барлық достарымызға ұсынамыз!"
    },
    rating: 5
  },
  {
    id: 7,
    name: { ru: "Гульнара и Ерболат", kk: "Гүлнара және Ерболат" },
    date: "Февраль 2025",
    text: {
      ru: "RSVP dashboard показал, кто придёт, кто нет — планировать банкет стало намного проще. Спасибо за удобство!",
      kk: "RSVP dashboard кім келетінін, кім келмейтінін көрсетті — банкет жоспарлау әлдеқайда оңай болды. Ыңғайлылық үшін рахмет!"
    },
    rating: 5
  },
  {
    id: 8,
    name: { ru: "Алия и Тимур", kk: "Әлия және Тимур" },
    date: "Март 2025",
    text: {
      ru: "Лучшее решение для любого торжества! Цена честная, функционал полный. Не пожалели ни разу!",
      kk: "Кез-келген мерекеге ең жақсы шешім! Баға адал, функционал толық. Бірде-бір рет өкінбедік!"
    },
    rating: 5
  }
];

export default function Testimonials() {
  const { t, language } = useLanguage();

  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Star className="w-4 h-4 fill-primary" />
            {t('testimonials.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className="group hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6">
                <div className="mb-4">
                  <Quote className="w-8 h-8 text-primary/30" />
                </div>

                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                  "{testimonial.text[language]}"
                </p>

                <div className="pt-4 border-t border-border/50">
                  <p className="font-semibold text-sm">{testimonial.name[language]}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.date}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            {t('testimonials.cta')}
          </p>
        </div>
      </div>
    </section>
  );
}

