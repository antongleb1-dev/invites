import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TimelineItem {
  time: string;
  title: string;
  titleKz?: string;
  description?: string;
  descriptionKz?: string;
}

interface MenuItem {
  name: string;
  nameKz?: string;
  description?: string;
  descriptionKz?: string;
  isHalal?: boolean;
  category?: string;
}

export default function PremiumBlocks() {
  const { id } = useParams<{ id: string }>();
  const weddingId = parseInt(id || "0");
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: wedding, isLoading } = trpc.wedding.getById.useQuery(
    { id: weddingId },
    { enabled: !!weddingId }
  );

  const utils = trpc.useUtils();
  const updateMutation = trpc.wedding.update.useMutation({
    onSuccess: () => {
      toast.success("Блоки успешно сохранены");
      // utils.wedding.getById.invalidate({ id: weddingId }); // Temporarily disabled
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка при сохранении");
    },
  });

  // Timeline state
  const [showTimeline, setShowTimeline] = useState(false);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  // Menu state
  const [showMenu, setShowMenu] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>([]);

  // Dress code state
  const [showDressCode, setShowDressCode] = useState(false);
  const [dressCode, setDressCode] = useState("");
  const [dressCodeKz, setDressCodeKz] = useState("");

  // Coordinator state
  const [showCoordinator, setShowCoordinator] = useState(false);
  const [coordinatorName, setCoordinatorName] = useState("");
  const [coordinatorPhone, setCoordinatorPhone] = useState("");
  const [coordinatorEmail, setCoordinatorEmail] = useState("");

  // QR Code state
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState("");

  // Location details state
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [locationDetails, setLocationDetails] = useState("");
  const [locationDetailsKz, setLocationDetailsKz] = useState("");

  // Flag to prevent data overwrite when switching browser tabs
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  useEffect(() => {
    if (wedding && !isDataLoaded) {
      console.log("📥 Загружаем данные из API (только один раз)");
      setShowTimeline(wedding.showTimeline || false);
      setShowMenu(wedding.showMenu || false);
      setShowDressCode(wedding.showDressCode || false);
      setDressCode(wedding.dressCode || "");
      setDressCodeKz(wedding.dressCodeKz || "");
      
      setShowCoordinator(wedding.showCoordinator || false);
      setCoordinatorName(wedding.coordinatorName || "");
      setCoordinatorPhone(wedding.coordinatorPhone || "");
      setCoordinatorEmail(wedding.coordinatorEmail || "");
      
      setShowQrCode(wedding.showQrCode || false);
      setQrCodeData(wedding.qrCodeData || "");
      
      setShowLocationDetails(wedding.showLocationDetails || false);
      setLocationDetails(wedding.locationDetails || "");
      setLocationDetailsKz(wedding.locationDetailsKz || "");

      if (wedding.timelineData) {
        try {
          setTimeline(JSON.parse(wedding.timelineData));
        } catch (e) {
          console.error("Failed to parse timeline data");
        }
      }

      if (wedding.menuData) {
        try {
          setMenu(JSON.parse(wedding.menuData));
        } catch (e) {
          console.error("Failed to parse menu data");
        }
      }
      
      setIsDataLoaded(true);
    }
  }, [wedding, isDataLoaded]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Требуется авторизация</CardTitle>
            <CardDescription>Войдите, чтобы управлять блоками</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Свадьба не найдена</CardTitle>
            <CardDescription>Проверьте правильность ссылки</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Allow preview mode - users can configure premium blocks before payment

  const addTimelineItem = () => {
    setTimeline([...timeline, { time: "", title: "", titleKz: "", description: "", descriptionKz: "" }]);
  };

  const removeTimelineItem = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
  };

  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: string) => {
    const updated = [...timeline];
    updated[index] = { ...updated[index], [field]: value };
    setTimeline(updated);
  };

  const addMenuItem = () => {
    setMenu([...menu, { name: "", nameKz: "", description: "", descriptionKz: "", isHalal: false, category: "main" }]);
  };

  const removeMenuItem = (index: number) => {
    setMenu(menu.filter((_, i) => i !== index));
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string | boolean) => {
    const updated = [...menu];
    updated[index] = { ...updated[index], [field]: value };
    setMenu(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateMutation.mutate({
      id: weddingId,
      showTimeline,
      timelineData: timeline.length > 0 ? JSON.stringify(timeline) : null,
      showMenu,
      menuData: menu.length > 0 ? JSON.stringify(menu) : null,
      showDressCode,
      dressCode: dressCode || null,
      dressCodeKz: dressCodeKz || null,
      showCoordinator,
      coordinatorName: coordinatorName || null,
      coordinatorPhone: coordinatorPhone || null,
      coordinatorEmail: coordinatorEmail || null,
      showQrCode,
      qrCodeData: qrCodeData || null,
      showLocationDetails,
      locationDetails: locationDetails || null,
      locationDetailsKz: locationDetailsKz || null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <div className="container py-8 max-w-4xl">
        <Link href={`/classic-editor/${weddingId}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к редактированию
          </Button>
        </Link>

        {/* All premium blocks are now available for all users */}

        <Card>
          <CardHeader>
            <CardTitle>Дополнительные блоки конструктора</CardTitle>
            <CardDescription>
              Настройте дополнительные блоки для вашего приглашения
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Timeline Block */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showTimeline"
                      checked={showTimeline}
                      onCheckedChange={(checked) => setShowTimeline(checked as boolean)}
                    />
                    <Label htmlFor="showTimeline" className="text-lg font-semibold">
                      Программа мероприятия
                    </Label>
                  </div>
                  {showTimeline && (
                    <Button type="button" size="sm" onClick={addTimelineItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить событие
                    </Button>
                  )}
                </div>

                {showTimeline && timeline.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Событие {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimelineItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Время</Label>
                          <Input
                            value={item.time}
                            onChange={(e) => updateTimelineItem(index, "time", e.target.value)}
                            placeholder="18:00"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Название (рус)</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => updateTimelineItem(index, "title", e.target.value)}
                            placeholder="Регистрация гостей"
                          />
                        </div>
                        <div>
                          <Label>Название (каз)</Label>
                          <Input
                            value={item.titleKz || ""}
                            onChange={(e) => updateTimelineItem(index, "titleKz", e.target.value)}
                            placeholder="Қонақтарды тіркеу"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Описание (рус)</Label>
                          <Textarea
                            value={item.description || ""}
                            onChange={(e) => updateTimelineItem(index, "description", e.target.value)}
                            placeholder="Встреча гостей у входа"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Описание (каз)</Label>
                          <Textarea
                            value={item.descriptionKz || ""}
                            onChange={(e) => updateTimelineItem(index, "descriptionKz", e.target.value)}
                            placeholder="Кіреберісте қонақтарды қарсы алу"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Menu Block */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showMenu"
                      checked={showMenu}
                      onCheckedChange={(checked) => setShowMenu(checked as boolean)}
                    />
                    <Label htmlFor="showMenu" className="text-lg font-semibold">
                      Меню
                    </Label>
                  </div>
                  {showMenu && (
                    <Button type="button" size="sm" onClick={addMenuItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить блюдо
                    </Button>
                  )}
                </div>

                {showMenu && menu.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label>Блюдо {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMenuItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Категория</Label>
                          <Select
                            value={item.category || "main"}
                            onValueChange={(value) => updateMenuItem(index, "category", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="appetizer">Закуски</SelectItem>
                              <SelectItem value="main">Основные блюда</SelectItem>
                              <SelectItem value="dessert">Десерты</SelectItem>
                              <SelectItem value="beverage">Напитки</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                          <Checkbox
                            id={`halal-${index}`}
                            checked={item.isHalal || false}
                            onCheckedChange={(checked) => updateMenuItem(index, "isHalal", checked as boolean)}
                          />
                          <Label htmlFor={`halal-${index}`}>Халяль</Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Название (рус)</Label>
                          <Input
                            value={item.name}
                            onChange={(e) => updateMenuItem(index, "name", e.target.value)}
                            placeholder="Бешбармак"
                          />
                        </div>
                        <div>
                          <Label>Название (каз)</Label>
                          <Input
                            value={item.nameKz || ""}
                            onChange={(e) => updateMenuItem(index, "nameKz", e.target.value)}
                            placeholder="Бесбармақ"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Описание (рус)</Label>
                          <Textarea
                            value={item.description || ""}
                            onChange={(e) => updateMenuItem(index, "description", e.target.value)}
                            placeholder="Традиционное казахское блюдо"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Описание (каз)</Label>
                          <Textarea
                            value={item.descriptionKz || ""}
                            onChange={(e) => updateMenuItem(index, "descriptionKz", e.target.value)}
                            placeholder="Дәстүрлі қазақ тағамы"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Dress Code Block */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showDressCode"
                    checked={showDressCode}
                    onCheckedChange={(checked) => setShowDressCode(checked as boolean)}
                  />
                  <Label htmlFor="showDressCode" className="text-lg font-semibold">
                    Dress Code
                  </Label>
                </div>

                {showDressCode && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="dressCode">Dress Code (рус)</Label>
                      <Textarea
                        id="dressCode"
                        value={dressCode}
                        onChange={(e) => setDressCode(e.target.value)}
                        placeholder="Формальный стиль. Рекомендуем оттенки золотого и бежевого."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dressCodeKz">Dress Code (каз)</Label>
                      <Textarea
                        id="dressCodeKz"
                        value={dressCodeKz}
                        onChange={(e) => setDressCodeKz(e.target.value)}
                        placeholder="Ресми стиль. Алтын және бежевый түстерді ұсынамыз."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Coordinator Block */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showCoordinator"
                    checked={showCoordinator}
                    onCheckedChange={(checked) => setShowCoordinator(checked as boolean)}
                  />
                  <Label htmlFor="showCoordinator" className="text-lg font-semibold">
                    Контакты координатора
                  </Label>
                </div>

                {showCoordinator && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="coordinatorName">Имя координатора</Label>
                      <Input
                        id="coordinatorName"
                        value={coordinatorName}
                        onChange={(e) => setCoordinatorName(e.target.value)}
                        placeholder="Айгуль Сабитова"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coordinatorPhone">Телефон</Label>
                      <Input
                        id="coordinatorPhone"
                        value={coordinatorPhone}
                        onChange={(e) => setCoordinatorPhone(e.target.value)}
                        placeholder="+7 777 123 45 67"
                      />
                    </div>
                    <div>
                      <Label htmlFor="coordinatorEmail">Email</Label>
                      <Input
                        id="coordinatorEmail"
                        type="email"
                        value={coordinatorEmail}
                        onChange={(e) => setCoordinatorEmail(e.target.value)}
                        placeholder="coordinator@example.com"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Block */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showQrCode"
                    checked={showQrCode}
                    onCheckedChange={(checked) => setShowQrCode(checked as boolean)}
                  />
                  <Label htmlFor="showQrCode" className="text-lg font-semibold">
                    QR-код для гостей
                  </Label>
                </div>

                {showQrCode && (
                  <div>
                    <Label htmlFor="qrCodeData">Данные для QR-кода (URL приглашения)</Label>
                    <Input
                      id="qrCodeData"
                      value={qrCodeData}
                      onChange={(e) => setQrCodeData(e.target.value)}
                      placeholder="https://invites.kz/your-wedding"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Обычно это ссылка на ваше приглашение
                    </p>
                  </div>
                )}
              </div>

              {/* Location Details Block */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showLocationDetails"
                    checked={showLocationDetails}
                    onCheckedChange={(checked) => setShowLocationDetails(checked as boolean)}
                  />
                  <Label htmlFor="showLocationDetails" className="text-lg font-semibold">
                    Информация о локации
                  </Label>
                </div>

                {showLocationDetails && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="locationDetails">Детальное описание (рус)</Label>
                      <Textarea
                        id="locationDetails"
                        value={locationDetails}
                        onChange={(e) => setLocationDetails(e.target.value)}
                        placeholder="Банкетный зал находится на 3 этаже. Парковка доступна с задней стороны здания. При входе сообщите администратору о вашем приглашении."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="locationDetailsKz">Детальное описание (каз)</Label>
                      <Textarea
                        id="locationDetailsKz"
                        value={locationDetailsKz}
                        onChange={(e) => setLocationDetailsKz(e.target.value)}
                        placeholder="Банкет залы 3-қабатта орналасқан. Паркинг ғимараттың артқы жағынан қолжетімді. Кіргенде әкімшіге шақыруыңыз туралы хабарлаңыз."
                        rows={4}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить блоки
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

