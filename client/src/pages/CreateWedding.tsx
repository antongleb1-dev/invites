import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Heart, Upload, Loader2, ArrowLeft, Sparkles, Calendar, Gift, Users, Baby, Cake, Building2, Star, Globe, Languages } from "lucide-react";
import { EVENT_TYPES, EVENT_TYPE_LABELS, type EventType, getEventTexts } from "@shared/const";

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

type LanguageOption = "ru" | "kz" | "both";

export default function CreateWedding() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Step management: language selection first, then form
  const [step, setStep] = useState<"language" | "form">("language");
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption | null>(null);

  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    titleKz: "",
    date: "",
    location: "",
    locationKz: "",
    mapUrl: "",
    description: "",
    descriptionKz: "",
    eventType: "wedding" as EventType,
  });

  // Get localized texts based on event type
  const eventTexts = getEventTexts(formData.eventType, 'ru');

  // All weddings now have full access to premium features
  // Payment is required only before publishing

  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const createMutation = trpc.wedding.create.useMutation({
    onSuccess: (wedding) => {
      toast.success("Приглашение успешно создано!");
      utils.wedding.myWeddings.invalidate();
      
      // Redirect to new unified editor after creation
      setLocation(`/classic-editor/${wedding.id}`);
    },
    onError: (error) => {
      // Parse Zod validation errors
      let errorMessage = "Ошибка при создании приглашения";
      try {
        const parsed = JSON.parse(error.message);
        if (Array.isArray(parsed) && parsed.length > 0) {
          errorMessage = parsed[0].message || errorMessage;
        }
      } catch {
        errorMessage = error.message || errorMessage;
      }
      toast.error(errorMessage);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Размер файла не должен превышать 5 МБ");
        return;
      }
      setBackgroundImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Ошибка загрузки изображения");
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate based on selected language
    const needsRussian = selectedLanguage === 'ru' || selectedLanguage === 'both';
    const needsKazakh = selectedLanguage === 'kz' || selectedLanguage === 'both';

    if (!formData.slug || !formData.date) {
      toast.error("Пожалуйста, заполните URL и дату");
      return;
    }

    if (needsRussian && (!formData.title || !formData.location)) {
      toast.error("Пожалуйста, заполните название и место на русском");
      return;
    }

    if (needsKazakh && (!formData.titleKz || !formData.locationKz)) {
      toast.error("Атауы мен өткізілетін орынды толтырыңыз");
      return;
    }

    // If only Kazakh selected, copy Kazakh values to Russian fields (for DB compatibility)
    const submitData = { ...formData };
    if (selectedLanguage === 'kz') {
      submitData.title = formData.titleKz || formData.title;
      submitData.location = formData.locationKz || formData.location;
      submitData.description = formData.descriptionKz || formData.description;
    }

    try {
      setUploading(true);
      let imageUrl = "";

      if (backgroundImage) {
        imageUrl = await uploadImage(backgroundImage);
      }

      await createMutation.mutateAsync({
        ...submitData,
        date: new Date(submitData.date),
        backgroundImage: imageUrl || undefined,
        eventType: submitData.eventType,
        languageMode: selectedLanguage || 'both',
      });
    } catch (error) {
      console.error("Error creating wedding:", error);
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    // Транслитерация кириллицы
    const translitMap: Record<string, string> = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      'ә': 'a', 'ғ': 'g', 'қ': 'q', 'ң': 'n', 'ө': 'o', 'ұ': 'u', 'ү': 'u', 'һ': 'h', 'і': 'i'
    };
    
    return title
      .toLowerCase()
      .split('')
      .map(char => translitMap[char] || char)
      .join('')
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData({ ...formData, title: value });
    if (!formData.slug) {
      setFormData({ ...formData, title: value, slug: generateSlug(value) });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Требуется авторизация</CardTitle>
            <CardDescription>
              Пожалуйста, войдите в систему, чтобы создать приглашение
            </CardDescription>
          </CardHeader>
          <CardContent>
          <Link href="/">
            <Button className="w-full">Вернуться на главную</Button>
          </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2 text-2xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
              <Heart className="w-7 h-7 text-primary fill-primary" />
              <span className="font-['Playfair_Display']">Invites.kz</span>
            </span>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Мои приглашения
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-3xl mx-auto">
          {step === "language" ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Выберите язык приглашения
                </h1>
                <p className="text-xl text-muted-foreground">
                  На каком языке будет ваше приглашение?
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${selectedLanguage === 'ru' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedLanguage('ru')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">RU</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Только русский</h3>
                    <p className="text-sm text-muted-foreground">
                      Приглашение будет на русском языке
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${selectedLanguage === 'kz' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedLanguage('kz')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">KZ</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Тек қазақша</h3>
                    <p className="text-sm text-muted-foreground">
                      Шақыру қазақ тілінде болады
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${selectedLanguage === 'both' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedLanguage('both')}
                >
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <Languages className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Русский + Қазақша</h3>
                    <p className="text-sm text-muted-foreground">
                      Двуязычное приглашение
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 text-center">
                <Button 
                  size="lg" 
                  onClick={() => setStep("form")}
                  disabled={!selectedLanguage}
                  className="px-12"
                >
                  Продолжить
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Button>
              </div>
            </>
          ) : (
            <>
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" size="sm" onClick={() => setStep("language")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                {selectedLanguage === 'ru' ? 'Русский' : selectedLanguage === 'kz' ? 'Қазақша' : 'RU + KZ'}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Создать приглашение
            </h1>
            <p className="text-xl text-muted-foreground">
              Заполните информацию о вашем мероприятии
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="eventType">
                    Тип мероприятия <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.eventType}
                    onValueChange={(value: EventType) => setFormData({ ...formData, eventType: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите тип мероприятия" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wedding">
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          <span>Свадьба / Той</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="birthday">
                        <div className="flex items-center gap-2">
                          <Cake className="w-4 h-4" />
                          <span>День рождения / Туған күн</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="anniversary">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          <span>Юбилей / Мерейтой</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="corporate">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>Корпоратив</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="sundettoi">
                        <div className="flex items-center gap-2">
                          <Baby className="w-4 h-4" />
                          <span>Сүндет той</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="tusaukeser">
                        <div className="flex items-center gap-2">
                          <Baby className="w-4 h-4" />
                          <span>Тұсау кесер</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="kyz_uzatu">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Қыз ұзату</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="betashar">
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4" />
                          <span>Беташар</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="other">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Другое / Басқа</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* URL Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    URL адрес <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">invites.kz/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="vasya-i-masha"
                      required
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Это будет адрес вашего приглашения. Используйте только латинские буквы и дефисы.
                  </p>
                </div>

                {/* Title (Russian) */}
                {(selectedLanguage === 'ru' || selectedLanguage === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="title">
                      {selectedLanguage === 'both' ? 'Название (русский)' : eventTexts.eventTitle} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder={formData.eventType === 'wedding' ? "Свадьба Султана и Айжан" : 
                                  formData.eventType === 'birthday' ? "День рождения Ержана" :
                                  formData.eventType === 'anniversary' ? "Юбилей 50 лет" :
                                  "Название мероприятия"}
                      required
                    />
                  </div>
                )}

                {/* Title (Kazakh) */}
                {(selectedLanguage === 'kz' || selectedLanguage === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="titleKz">
                      {selectedLanguage === 'both' ? 'Атауы (қазақша)' : 'Іс-шараның атауы'} {selectedLanguage === 'kz' && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id="titleKz"
                      value={formData.titleKz}
                      onChange={(e) => setFormData({ ...formData, titleKz: e.target.value })}
                      placeholder="Сұлтан мен Айжанның тойы"
                      required={selectedLanguage === 'kz'}
                    />
                  </div>
                )}

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date">
                    {eventTexts.eventDate} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                {/* Location (Russian) */}
                {(selectedLanguage === 'ru' || selectedLanguage === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      {selectedLanguage === 'both' ? 'Место проведения (русский)' : 'Место проведения'} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ресторан 'Жибек Жолы', Алматы"
                      required
                    />
                  </div>
                )}

                {/* Location (Kazakh) */}
                {(selectedLanguage === 'kz' || selectedLanguage === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="locationKz">
                      {selectedLanguage === 'both' ? 'Өткізілетін орын (қазақша)' : 'Өткізілетін орын'} {selectedLanguage === 'kz' && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      id="locationKz"
                      value={formData.locationKz}
                      onChange={(e) => setFormData({ ...formData, locationKz: e.target.value })}
                      placeholder="'Жібек Жолы' мейрамханасы, Алматы"
                      required={selectedLanguage === 'kz'}
                    />
                  </div>
                )}

                {/* Map URL */}
                <div className="space-y-2">
                  <Label htmlFor="mapUrl">Ссылка на карту (необязательно)</Label>
                  <Input
                    id="mapUrl"
                    value={formData.mapUrl || ""}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    placeholder="https://go.2gis.com/... или https://maps.google.com/..."
                  />
                  <p className="text-sm text-muted-foreground">
                    Вставьте ссылку из 2GIS, Google Maps или Yandex Карты
                  </p>
                </div>

                {/* Description (Russian) */}
                {(selectedLanguage === 'ru' || selectedLanguage === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="description">
                      {selectedLanguage === 'both' ? 'Описание (русский)' : 'Описание'} <span className="text-muted-foreground text-xs">(необязательно)</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Приглашаем вас разделить с нами этот особенный день..."
                      rows={4}
                    />
                  </div>
                )}

                {/* Description (Kazakh) */}
                {(selectedLanguage === 'kz' || selectedLanguage === 'both') && (
                  <div className="space-y-2">
                    <Label htmlFor="descriptionKz">
                      {selectedLanguage === 'both' ? 'Сипаттама (қазақша)' : 'Сипаттама'} <span className="text-muted-foreground text-xs">(міндетті емес)</span>
                    </Label>
                    <Textarea
                      id="descriptionKz"
                      value={formData.descriptionKz}
                      onChange={(e) => setFormData({ ...formData, descriptionKz: e.target.value })}
                      placeholder="Сіздерді осы ерекше күнімізбен бөлісуге шақырамыз..."
                      rows={4}
                    />
                  </div>
                )}

                {/* Pricing model: Payment required for publication */}

                {/* Background Image */}
                <div className="space-y-2">
                  <Label htmlFor="backgroundImage">Фоновое изображение (необязательно)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      id="backgroundImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label htmlFor="backgroundImage" className="cursor-pointer">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="max-h-64 mx-auto rounded-lg object-cover"
                          />
                          <p className="text-sm text-muted-foreground">
                            Нажмите, чтобы изменить
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Нажмите, чтобы загрузить изображение
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Максимальный размер: 5 МБ
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Link href="/dashboard">
                    <Button type="button" variant="outline" className="w-full">
                      Отмена
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createMutation.isPending || uploading}
                  >
                    {createMutation.isPending || uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Создание...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Создать приглашение
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

