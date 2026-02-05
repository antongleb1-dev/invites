import { Link } from "wouter";
import { Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  const eventTypes = [
    { slug: "wedding", name: "Свадьба" },
    { slug: "birthday", name: "День рождения" },
    { slug: "corporate", name: "Корпоратив" },
    { slug: "anniversary", name: "Юбилей" },
    { slug: "sundettoi", name: "Сүндет той" },
  ];

  return (
    <footer className="border-t border-border bg-card/30 py-12">
      <div className="container">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-primary fill-primary" />
              <span className="text-lg font-bold font-['Playfair_Display']">invites.kz</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Онлайн-приглашения на любое событие. Интерактивный сайт с RSVP, wishlist и пожеланиями.
            </p>
          </div>

          {/* Event Types */}
          <div>
            <h4 className="font-bold mb-4">Приглашения</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {eventTypes.map((event) => (
                <li key={event.slug}>
                  <Link href={`/online-invitation/${event.slug}`} className="hover:text-primary hover:underline">
                    {event.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold mb-4">Продукт</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/features" className="hover:text-primary hover:underline">
                  Функционал
                </Link>
              </li>
              <li>
                <Link href="/create-ai" className="hover:text-primary hover:underline">
                  Создать с AI
                </Link>
              </li>
              <li>
                <Link href="/create" className="hover:text-primary hover:underline">
                  Классический редактор
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary hover:underline">
                  Блог
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold mb-4">Поддержка</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://t.me/bookmekz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline"
                >
                  Telegram: @bookmekz
                </a>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary hover:underline">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary hover:underline">
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>{t("footer.copyright")}</p>
          <p className="mt-2">
            Это <strong>не PDF</strong> и <strong>не картинка</strong>. Это интерактивный сайт-приглашение.
          </p>
        </div>
      </div>
    </footer>
  );
}

