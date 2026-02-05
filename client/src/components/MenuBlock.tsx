import { UtensilsCrossed, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

interface MenuItem {
  name: string;
  nameKz?: string;
  description?: string;
  descriptionKz?: string;
  isHalal?: boolean;
  category?: string; // "appetizer", "main", "dessert", "beverage"
  categoryKz?: string;
}

interface MenuBlockProps {
  menuData: string; // JSON string
  language: "ru" | "kz";
  customFont?: string;
  customColor?: string;
  themeColor?: string;
}

const categoryLabels: Record<string, { ru: string; kz: string }> = {
  appetizer: { ru: "Закуски", kz: "Тағамдар" },
  main: { ru: "Основные блюда", kz: "Негізгі тағамдар" },
  dessert: { ru: "Десерты", kz: "Тәттілер" },
  beverage: { ru: "Напитки", kz: "Сусындар" },
};

export default function MenuBlock({ menuData, language, customFont, customColor, themeColor }: MenuBlockProps) {
  let menu: MenuItem[] = [];
  
  try {
    menu = JSON.parse(menuData);
  } catch (e) {
    console.error("Failed to parse menu data:", e);
    return null;
  }

  if (!menu || menu.length === 0) return null;

  // Group menu items by category
  const groupedMenu = menu.reduce((acc, item) => {
    const category = item.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: themeColor ? `${themeColor}10` : undefined,
      }}
    >
      <div className="container max-w-4xl">
        <h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          style={{
            fontFamily: customFont,
            color: customColor,
          }}
        >
          {language === "kz" ? "Мәзір" : "Меню"}
        </h2>
        
        <div className="space-y-8">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category}>
              {category !== "other" && (
                <h3 
                  className="text-2xl font-semibold mb-4"
                  style={{
                    fontFamily: customFont,
                    color: customColor,
                  }}
                >
                  {categoryLabels[category]?.[language] || category}
                </h3>
              )}
              
              <div className="grid gap-4">
                {items.map((item, index) => (
                  <Card 
                    key={index}
                    style={{
                      borderColor: themeColor ? `${themeColor}30` : undefined,
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="flex items-center justify-center w-10 h-10 rounded-full"
                            style={{
                              backgroundColor: themeColor ? `${themeColor}20` : undefined,
                              color: themeColor,
                            }}
                          >
                            <UtensilsCrossed className="w-5 h-5" />
                          </div>
                          <span style={{ color: customColor }}>
                            {language === "kz" && item.nameKz ? item.nameKz : item.name}
                          </span>
                        </div>
                        {item.isHalal && (
                          <Badge 
                            variant="outline"
                            className="flex items-center gap-1"
                            style={{
                              borderColor: themeColor,
                              color: themeColor,
                            }}
                          >
                            <Check className="w-3 h-3" />
                            {language === "kz" ? "Халал" : "Халяль"}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    {(item.description || item.descriptionKz) && (
                      <CardContent>
                        <p className="text-muted-foreground">
                          {language === "kz" && item.descriptionKz ? item.descriptionKz : item.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

