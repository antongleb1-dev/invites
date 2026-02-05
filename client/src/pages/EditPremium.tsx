import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Heart, ArrowLeft, Loader2, Plus, Trash2, Save, Image as ImageIcon, Palette, Sparkles } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { useState, useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { toast } from "sonner";

export default function EditPremium() {
  const { isAuthenticated } = useAuth();
  const [, params] = useRoute("/edit-premium/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";

  const { data: wedding, isLoading } = trpc.wedding.getBySlug.useQuery({ slug });
  const { data: gallery } = trpc.gallery.list.useQuery(
    { weddingId: wedding?.id || 0 },
    { enabled: !!wedding }
  );

  const [formData, setFormData] = useState({
    customFont: "",
    customColor: "",
    themeColor: "",
    buttonColor: "",
    buttonTextColor: "",
    photoShape: "square" as "square" | "circle" | "heart" | "hexagon" | "diamond" | "arch" | "frame",
    customBackgroundUrl: "",
    musicUrl: "",
    videoUrl: "",
    loveStory: "",
    loveStoryKz: "",
  });

  const [galleryForm, setGalleryForm] = useState({
    imageUrl: "",
    caption: "",
    captionKz: "",
  });

  const [uploading, setUploading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const utils = trpc.useUtils();

  const updateMutation = trpc.wedding.update.useMutation({
    onSuccess: () => {
      toast.success("Изменения сохранены!");
      utils.wedding.getBySlug.invalidate({ slug });
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const addImageMutation = trpc.gallery.add.useMutation({
    onSuccess: () => {
      toast.success("Фото добавлено!");
      utils.gallery.list.invalidate();
      setGalleryForm({ imageUrl: "", caption: "", captionKz: "" });
      setFileInputKey(prev => prev + 1); // Reset file input
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteImageMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      toast.success("Фото удалено");
      utils.gallery.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  // Initialize form when wedding data loads (only once on mount)
  useEffect(() => {
    if (wedding && !initialized) {
      setFormData({
        customFont: wedding.customFont || "",
        customColor: wedding.customColor || "",
        themeColor: wedding.themeColor || "",
        buttonColor: wedding.buttonColor || "",
        buttonTextColor: wedding.buttonTextColor || "",
        photoShape: (wedding.photoShape as "square" | "circle" | "heart" | "hexagon" | "diamond" | "arch" | "frame") || "square",
        customBackgroundUrl: wedding.customBackgroundUrl || "",
        musicUrl: wedding.musicUrl || "",
        videoUrl: wedding.videoUrl || "",
        loveStory: wedding.loveStory || "",
        loveStoryKz: wedding.loveStoryKz || "",
      });
      setInitialized(true);
    }
  }, [wedding?.id, initialized]);



  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setGalleryForm({ ...galleryForm, imageUrl: data.url });
      toast.success("Фото загружено!");
    } catch (error) {
      toast.error("Ошибка загрузки фото");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!wedding) return;

    updateMutation.mutate({ id: wedding.id, ...formData });
  };

  const handleAddImage = () => {
    if (!wedding || !galleryForm.imageUrl) {
      toast.error("Загрузите фото");
      return;
    }
    if (gallery && gallery.length >= 8) {
      toast.error("Максимум 8 фотографий в галерее");
      return;
    }
    addImageMutation.mutate({ weddingId: wedding.id, ...galleryForm });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Нет доступа</CardTitle>
            <CardDescription>
              У вас нет прав для редактирования
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">Вернуться к списку</Button>
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
          <Link href={`/manage/${wedding.slug}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </Link>
        </div>
      </header>

      {/* All premium features are now available for all users */}

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Расширенные функции
            </h1>
            <p className="text-xl text-muted-foreground">
              Настройте дизайн и добавьте уникальный контент
            </p>
          </div>

          {/* Customization */}
          <Card>
            <CardHeader>
              <CardTitle>Кастомизация дизайна</CardTitle>
              <CardDescription>
                Измените шрифты и цветовую палитру
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Шрифт заголовков</Label>
                  <select
                    value={formData.customFont}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, customFont: e.target.value }));
                    }}
                    className="w-full px-3 py-2 pr-10 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3E%3Cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27m6 8 4 4 4-4%27/%3E%3C/svg%3E')] bg-[length:1.5em_1.5em] bg-[right_0.5rem_center] bg-no-repeat"
                  >
                    <option value="">По умолчанию (Playfair Display)</option>
                    <optgroup label="Элегантные шрифты">
                      <option value="Playfair Display">Playfair Display</option>
                      <option value="Lora">Lora</option>
                      <option value="Cormorant Garamond">Cormorant Garamond</option>
                      <option value="Cinzel">Cinzel</option>
                    </optgroup>
                    <optgroup label="Курсивные шрифты (кириллица)">
                      <option value="Great Vibes">Great Vibes</option>
                      <option value="Dancing Script">Dancing Script</option>
                      <option value="Marck Script">Marck Script</option>
                      <option value="Bad Script">Bad Script</option>
                      <option value="Caveat">Caveat</option>
                      <option value="Pacifico">Pacifico</option>
                      <option value="Amatic SC">Amatic SC</option>
                      <option value="Philosopher">Philosopher</option>
                    </optgroup>
                    <optgroup label="Современные шрифты">
                      <option value="Montserrat">Montserrat</option>
                      <option value="Raleway">Raleway</option>
                      <option value="Open Sans">Open Sans</option>
                      <option value="Jost">Jost</option>
                      <option value="Comfortaa">Comfortaa</option>
                    </optgroup>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Выберите шрифт для заголовков
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Цветовая палитра
                  </Label>
                  <div className="flex gap-3 items-start">
                    <HexColorPicker
                      color={formData.customColor || "#D4A574"}
                      onChange={(color) => setFormData(prev => ({ ...prev, customColor: color }))}
                      style={{ width: "100%", maxWidth: "200px" }}
                    />
                    <div className="flex-1 space-y-2">
                      <Input
                        value={formData.customColor || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, customColor: e.target.value }))}
                        placeholder="#D4A574"
                        maxLength={7}
                      />
                      <div
                        className="w-full h-12 rounded-md border border-input"
                        style={{ backgroundColor: formData.customColor || "#D4A574" }}
                      />
                  <p className="text-xs text-muted-foreground">
                    Цвет заголовков
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Форма фотографии
              </Label>
              <select
                className="w-full p-2 border border-input rounded-md bg-background"
                value={formData.photoShape}
                onChange={(e) => setFormData(prev => ({ ...prev, photoShape: e.target.value as any }))}
              >
                <option value="square">Квадрат</option>
                <option value="circle">Круг</option>
                <option value="heart">Сердце</option>
                <option value="hexagon">Шестиугольник</option>
                <option value="diamond">Ромб</option>
                <option value="arch">Арка</option>
                <option value="frame">Рамка</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Выберите форму для главной фотографии на странице приглашения
              </p>
            </div>
            <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Цвет темы
                  </Label>
                  <div className="flex gap-3 items-start">
                    <HexColorPicker
                      color={formData.themeColor || "#D4A574"}
                      onChange={(color) => setFormData(prev => ({ ...prev, themeColor: color }))}
                      style={{ width: "100%", maxWidth: "200px" }}
                    />
                    <div className="flex-1 space-y-2">
                      <Input
                        value={formData.themeColor || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, themeColor: e.target.value }))}
                        placeholder="#D4A574"
                        maxLength={7}
                      />
                      <div
                        className="w-full h-12 rounded-md border border-input"
                        style={{ backgroundColor: formData.themeColor || "#D4A574" }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Цвет кнопок, иконок и акцентов
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Цвет фона кнопок
                  </Label>
                  <div className="flex gap-3 items-start">
                    <HexColorPicker
                      color={formData.buttonColor || formData.themeColor || "#D4A574"}
                      onChange={(color) => setFormData(prev => ({ ...prev, buttonColor: color }))}
                      style={{ width: "100%", maxWidth: "200px" }}
                    />
                    <div className="flex-1 space-y-2">
                      <Input
                        value={formData.buttonColor || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, buttonColor: e.target.value }))}
                        placeholder={formData.themeColor || "#D4A574"}
                        maxLength={7}
                      />
                      <div
                        className="w-full h-12 rounded-md border border-input"
                        style={{ backgroundColor: formData.buttonColor || formData.themeColor || "#D4A574" }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Цвет фона кнопок (по умолчанию = цвет темы)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Цвет текста кнопок
                  </Label>
                  <div className="flex gap-3 items-start">
                    <HexColorPicker
                      color={formData.buttonTextColor || "#FFFFFF"}
                      onChange={(color) => setFormData(prev => ({ ...prev, buttonTextColor: color }))}
                      style={{ width: "100%", maxWidth: "200px" }}
                    />
                    <div className="flex-1 space-y-2">
                      <Input
                        value={formData.buttonTextColor || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, buttonTextColor: e.target.value }))}
                        placeholder="#FFFFFF"
                        maxLength={7}
                      />
                      <div
                        className="w-full h-12 rounded-md border border-input"
                        style={{ backgroundColor: formData.buttonTextColor || "#FFFFFF" }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Цвет текста на кнопках
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Медиа-контент</CardTitle>
              <CardDescription>
                Добавьте музыку и видео
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Фоновая музыка</Label>
                <Input
                  value={formData.musicUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, musicUrl: e.target.value }))}
                  placeholder="https://youtube.com/... или ссылка на MP3"
                />
                <p className="text-xs text-muted-foreground">
                  YouTube или прямая ссылка на аудиофайл
                </p>
              </div>
              <div className="space-y-2">
                <Label>Видео (URL)</Label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  placeholder="https://youtube.com/... или https://..."
                />
                <p className="text-xs text-muted-foreground">
                  YouTube или прямая ссылка на видео
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Custom Background */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Свой фон
              </CardTitle>
              <CardDescription>
                Загрузите собственное изображение для фона (переопределяет шаблон)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Загрузить фон</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    
                    setUploading(true);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      
                      const response = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });
                      
                      if (!response.ok) throw new Error("Upload failed");
                      
                      const data = await response.json();
                      setFormData(prev => ({ ...prev, customBackgroundUrl: data.url }));
                      toast.success("Фон загружен!");
                    } catch (error) {
                      toast.error("Ошибка загрузки фона");
                    } finally {
                      setUploading(false);
                    }
                  }}
                  disabled={uploading}
                />
                {formData.customBackgroundUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.customBackgroundUrl}
                      alt="Custom background"
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setFormData(prev => ({ ...prev, customBackgroundUrl: "" }))}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Удалить фон
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Рекомендуемый размер: 1920×1080px или больше. Формат: JPG, PNG
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Love Story */}
          <Card>
            <CardHeader>
              <CardTitle>Love Story</CardTitle>
              <CardDescription>
                Расскажите вашу историю любви
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>История (рус)</Label>
                <Textarea
                  value={formData.loveStory}
                  onChange={(e) => setFormData(prev => ({ ...prev, loveStory: e.target.value }))}
                  rows={6}
                  placeholder="Расскажите, как вы познакомились..."
                />
              </div>
              <div className="space-y-2">
                <Label>История (каз)</Label>
                <Textarea
                  value={formData.loveStoryKz}
                  onChange={(e) => setFormData(prev => ({ ...prev, loveStoryKz: e.target.value }))}
                  rows={6}
                  placeholder="Танысуыңыз туралы айтып беріңіз..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Галерея фотографий</CardTitle>
              <CardDescription>
                Добавьте фотографии в галерею
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Загрузить фото {gallery && `(${gallery.length}/8)`}</Label>
                  <Input
                    key={fileInputKey}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading || (gallery && gallery.length >= 8)}
                  />
                  {gallery && gallery.length >= 8 && (
                    <p className="text-sm text-muted-foreground">
                      Достигнут максимум. Удалите фото, чтобы добавить новое.
                    </p>
                  )}
                </div>
                {galleryForm.imageUrl && (
                  <>
                    <div className="space-y-2">
                      <Label>Подпись (рус)</Label>
                      <Input
                        value={galleryForm.caption}
                        onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                        placeholder="Описание фото..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Подпись (каз)</Label>
                      <Input
                        value={galleryForm.captionKz}
                        onChange={(e) => setGalleryForm({ ...galleryForm, captionKz: e.target.value })}
                        placeholder="Фото сипаттамасы..."
                      />
                    </div>
                    <Button onClick={handleAddImage} disabled={addImageMutation.isPending}>
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить в галерею
                    </Button>
                  </>
                )}
              </div>

              {gallery && gallery.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4">
                  {gallery.map((image) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.imageUrl}
                        alt={image.caption || ""}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {image.caption && (
                        <p className="text-sm text-muted-foreground mt-2">{image.caption}</p>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => deleteImageMutation.mutate({ id: image.id, weddingId: wedding.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="py-6">
              <Button
                size="lg"
                className="w-full"
                onClick={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Сохранить изменения
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

