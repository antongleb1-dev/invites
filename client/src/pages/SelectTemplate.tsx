import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { Loader2, Check, Crown } from "lucide-react";
import { toast } from "sonner";
import { getAllTemplates } from "@shared/templates";
import {
  GoldenKoshkar,
  FloralPattern,
  GeometricKazakh,
  SilkRoadPattern,
  NomadicSymbol,
} from "@/components/ornaments/KazakhOrnaments";

export default function SelectTemplate() {
  const [, params] = useRoute("/select-template/:id");
  const [, setLocation] = useLocation();
  const weddingId = parseInt(params?.id || "0");

  const { data: wedding, isLoading } = trpc.wedding.getById.useQuery({ id: weddingId });
  const updateMutation = trpc.wedding.update.useMutation({
    onSuccess: () => {
      toast.success("Шаблон успешно применен!");
      setLocation(`/classic-editor/${weddingId}`);
    },
    onError: (error) => {
      toast.error(`Ошибка: ${error.message}`);
    },
  });

  const templates = getAllTemplates();

  const handleSelectTemplate = (templateId: string, isPremium: boolean) => {
    // All templates are now available for all users
    // Payment is only required for publication
    updateMutation.mutate({
      id: weddingId,
      templateId,
    });
  };

  const getTemplatePreviewImage = (templateId: string) => {
    const imageMap: Record<string, string> = {
      'kazakh_gold_ornament': '/templates/kazakh-ornament-vertical.jpg',
      'kazakh_swirl_elegance': '/templates/kazakh-swirl-pattern.jpg',
      'islamic_arch_gold': '/templates/islamic-arch.jpg',
      'mandala_golden_dream': '/templates/mandala-golden.jpg',
      'magnolia_garden': '/templates/magnolia-floral.jpg',
      'starry_night_blue': '/templates/starry-night.jpg',
      'cloud_frame_chinese': '/templates/cloud-frame.jpg',
      'minimal_vine_border': '/templates/vine-border.jpg',
    };
    return imageMap[templateId] || null;
  };

  const renderOrnamentPreview = (template: any) => {
    // First check if template has previewImage property
    const previewImage = template.previewImage || getTemplatePreviewImage(template.id);
    
    if (previewImage) {
      return (
        <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
          <img 
            src={previewImage} 
            alt="Template preview" 
            className="w-full h-full object-cover"
          />
        </div>
      );
    }
    
    const { ornamentStyle, colors } = template;
    const color = colors?.ornament || colors?.accent || '#D4AF37';
    
    const className = "w-20 h-20";
    switch (ornamentStyle) {
      case 'golden':
        return <GoldenKoshkar className={className} color={color} />;
      case 'floral':
        return <FloralPattern className={className} color={color} />;
      case 'geometric':
        return <GeometricKazakh className={className} color={color} />;
      case 'silk':
        return <SilkRoadPattern className={className} color={color} />;
      case 'nomadic':
        return <NomadicSymbol className={className} color={color} />;
      case 'islamic':
      case 'starry':
      case 'cloud':
        return <GeometricKazakh className={className} color={color} />;
      default:
        return <div className="w-20 h-20 bg-gray-200 rounded-lg" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Свадьба не найдена</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 py-12">
      <div className="container max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Выберите шаблон</h1>
          <p className="text-xl text-muted-foreground">
            Выберите дизайн для вашего свадебного приглашения
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const isSelected = wedding.templateId === template.id;
            const canUse = true; // All templates available for all users

            return (
              <Card
                key={template.id}
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  isSelected ? "ring-2 ring-primary" : ""
                } ${!canUse ? "opacity-75" : ""}`}
              >
                {/* All templates are now available for all users */}

                {isSelected && (
                  <Badge className="absolute top-4 left-4 bg-green-500">
                    <Check className="w-3 h-3 mr-1" />
                    Выбран
                  </Badge>
                )}

                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {renderOrnamentPreview(template)}
                  </div>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  {/* Color palette preview */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Цветовая палитра:</p>
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: template.colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: template.colors.secondary }}
                        title="Secondary"
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-border"
                        style={{ backgroundColor: template.colors.accent }}
                        title="Accent"
                      />
                    </div>
                  </div>

                  {/* Font preview */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Шрифты:</p>
                    <p className="text-xs text-muted-foreground">
                      {template.fonts.heading} / {template.fonts.body}
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => handleSelectTemplate(template.id, template.isPremium)}
                    disabled={updateMutation.isPending || isSelected}
                    variant={isSelected ? "outline" : "default"}
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Применение...
                      </>
                    ) : isSelected ? (
                      "Текущий шаблон"
                    ) : !canUse ? (
                      "Выбрать шаблон"
                    ) : (
                      "Выбрать шаблон"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => setLocation(`/classic-editor/${weddingId}`)}>
            Вернуться к редактированию
          </Button>
        </div>
      </div>
    </div>
  );
}

