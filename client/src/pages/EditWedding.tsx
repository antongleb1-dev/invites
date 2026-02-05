import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, MapPin, Save, Plus, Languages } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";

type LanguageMode = "ru" | "kz" | "both";

export default function EditWedding() {
  const [, params] = useRoute("/edit/:id");
  const weddingId = params?.id ? parseInt(params.id) : null;
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: wedding, isLoading } = trpc.wedding.getById.useQuery(
    { id: weddingId! },
    { enabled: !!weddingId }
  );

  const updateMutation = trpc.wedding.update.useMutation({
    onSuccess: () => {
      toast.success("Изменения сохранены!");
      console.log("✅ Wedding data successfully saved to server");
      // Redirect to manage page using the slug (either updated or original)
      const targetSlug = formData.slug || wedding?.slug;
      if (targetSlug) {
        setLocation(`/manage/${targetSlug}`);
      }
    },
    onError: (error) => {
      // Parse Zod validation errors
      let errorMessage = "Ошибка при сохранении";
      try {
        const parsed = JSON.parse(error.message);
        if (Array.isArray(parsed) && parsed.length > 0) {
          errorMessage = parsed[0].message || errorMessage;
        }
      } catch {
        errorMessage = error.message || errorMessage;
      }
      toast.error(errorMessage);
      console.error("❌ Error saving wedding data:", error);
    },
  });

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
    backgroundImage: "",
    showHeart: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  // ✅ Флаг для отслеживания что данные уже загружены из API
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (wedding && !isDataLoaded) {
      console.log("📥 Loading wedding data from API (only once)");
      setFormData({
        slug: wedding.slug,
        title: wedding.title,
        titleKz: wedding.titleKz || "",
        date: wedding.date ? new Date(wedding.date).toISOString().slice(0, 16) : "",
        location: wedding.location || "",
        locationKz: wedding.locationKz || "",
        mapUrl: wedding.mapUrl || "",
        description: wedding.description || "",
        descriptionKz: wedding.descriptionKz || "",
        backgroundImage: wedding.backgroundImage || "",
        showHeart: wedding.showHeart !== false,
      });
      setIsDataLoaded(true); // ✅ Отмечаем что данные загружены
      console.log("✅ Data loaded, user changes protected");
      if (wedding.backgroundImage) {
        setImagePreview(wedding.backgroundImage);
      }
    }
  }, [wedding, isDataLoaded]); // ✅ Зависимость от isDataLoaded предотвращает перезагрузку

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Требуется авторизация</CardTitle>
            <CardDescription>Войдите, чтобы редактировать свадьбу</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
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
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (wedding.userId !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Доступ запрещен</CardTitle>
            <CardDescription>Вы не можете редактировать эту свадьбу</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Get language mode from wedding
  const languageMode: LanguageMode = (wedding as any)?.languageMode || 'both';
  const showRussian = languageMode === 'ru' || languageMode === 'both';
  const showKazakh = languageMode === 'kz' || languageMode === 'both';
  
  const getLanguageLabel = () => {
    switch (languageMode) {
      case 'ru': return 'Русский';
      case 'kz': return 'Қазақша';
      case 'both': return 'RU + KZ';
      default: return 'RU + KZ';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let backgroundImageUrl = formData.backgroundImage;

    // Upload new image if selected
    if (imageFile) {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", imageFile);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });

        if (!response.ok) throw new Error("Ошибка загрузки изображения");

        const data = await response.json();
        backgroundImageUrl = data.url;
      } catch (error) {
        toast.error("Ошибка при загрузке изображения");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // If only Kazakh language, copy Kazakh values to Russian fields for DB compatibility
    const submitTitle = languageMode === 'kz' ? (formData.titleKz || formData.title) : formData.title;
    const submitLocation = languageMode === 'kz' ? (formData.locationKz || formData.location) : formData.location;
    const submitDescription = languageMode === 'kz' ? (formData.descriptionKz || formData.description) : formData.description;

    updateMutation.mutate({
      id: weddingId!,
      slug: formData.slug || undefined,
      title: submitTitle,
      titleKz: formData.titleKz || undefined,
      date: formData.date ? new Date(formData.date) : undefined,
      location: submitLocation || undefined,
      locationKz: formData.locationKz || undefined,
      mapUrl: formData.mapUrl || undefined,
      description: submitDescription || undefined,
      descriptionKz: formData.descriptionKz || undefined,
      backgroundImage: backgroundImageUrl || undefined,
      showHeart: formData.showHeart,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 py-8">
      <div className="container max-w-3xl">
        <Link href={`/manage/${wedding.slug}`}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к управлению
          </Button>
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-serif">Редактировать приглашение</CardTitle>
                <CardDescription>Измените основную информацию о вашем мероприятии</CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Languages className="w-3 h-3" />
                {getLanguageLabel()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* URL Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">URL адрес *</Label>
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
                  Используйте только латинские буквы и дефисы
                </p>
              </div>

              {/* Title (Russian) */}
              {showRussian && (
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {languageMode === 'both' ? 'Название (русский) *' : 'Название *'}
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Свадьба Султана и Айжан"
                    required={showRussian}
                  />
                </div>
              )}

              {/* Title (Kazakh) */}
              {showKazakh && (
                <div className="space-y-2">
                  <Label htmlFor="titleKz">
                    {languageMode === 'both' ? 'Атауы (қазақша)' : 'Атауы *'}
                  </Label>
                  <Input
                    id="titleKz"
                    value={formData.titleKz}
                    onChange={(e) => setFormData({ ...formData, titleKz: e.target.value })}
                    placeholder="Сұлтан мен Айжанның тойы"
                    required={languageMode === 'kz'}
                  />
                </div>
              )}

              {/* Date and Time */}
              <div className="space-y-2">
                <Label htmlFor="date">Дата и время свадьбы</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Location (Russian) */}
              {showRussian && (
                <div className="space-y-2">
                  <Label htmlFor="location">
                    {languageMode === 'both' ? 'Место проведения (русский)' : 'Место проведения'}
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ресторан 'Золотая роза', Алматы"
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Location (Kazakh) */}
              {showKazakh && (
                <div className="space-y-2">
                  <Label htmlFor="locationKz">
                    {languageMode === 'both' ? 'Өткізілетін орын (қазақша)' : 'Өткізілетін орын'}
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="locationKz"
                      value={formData.locationKz}
                      onChange={(e) => setFormData({ ...formData, locationKz: e.target.value })}
                      placeholder="'Алтын раухан' мейрамханасы, Алматы"
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              {/* Map URL */}
              <div className="space-y-2">
                <Label htmlFor="mapUrl">Ссылка на карту (необязательно)</Label>
                <Input
                  id="mapUrl"
                  value={formData.mapUrl}
                  onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                  placeholder="https://go.2gis.com/... или https://maps.google.com/..."
                />
                <p className="text-sm text-muted-foreground">
                  Вставьте ссылку из 2GIS, Google Maps или Yandex Карты
                </p>
              </div>

              {/* Description (Russian) */}
              {showRussian && (
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {languageMode === 'both' ? 'Описание (русский)' : 'Описание'}
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Приглашаем вас разделить с нами самый счастливый день..."
                    rows={4}
                  />
                </div>
              )}

              {/* Description (Kazakh) */}
              {showKazakh && (
                <div className="space-y-2">
                  <Label htmlFor="descriptionKz">
                    {languageMode === 'both' ? 'Сипаттама (қазақша)' : 'Сипаттама'}
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

              <div className="space-y-2">
                <Label htmlFor="backgroundImage">Фоновое изображение</Label>
                {imagePreview && (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                <Input
                  id="backgroundImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <p className="text-sm text-gray-500">
                  Рекомендуемый размер: 1920x1080px
                </p>
              </div>

              {/* Show Heart Toggle */}
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <Checkbox
                  id="showHeart"
                  checked={formData.showHeart}
                  onCheckedChange={(checked) => setFormData({ ...formData, showHeart: checked as boolean })}
                />
                <Label htmlFor="showHeart" className="text-base cursor-pointer">
                  Показывать сердечко на странице свадьбы
                </Label>
              </div>

              {/* All users now have access to premium features */}
              <Link href={`/premium-blocks/${weddingId}`}>
                <Button type="button" variant="outline" className="w-full mb-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Настроить дополнительные блоки
                </Button>
              </Link>
              <Link href={`/select-template/${weddingId}`}>
                <Button type="button" variant="outline" className="w-full mb-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Выбрать шаблон дизайна
                </Button>
              </Link>

              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending || uploading}
              >
                {uploading || updateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить изменения
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

