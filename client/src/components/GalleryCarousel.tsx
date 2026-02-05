import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import type { GalleryImage } from "../../../drizzle/schema";

interface GalleryCarouselProps {
  gallery: GalleryImage[];
  language: "ru" | "kz";
  customFont?: string;
  customColor?: string;
  themeColor?: string;
}

export default function GalleryCarousel({ gallery, language, customFont, customColor, themeColor }: GalleryCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section 
      className="py-16"
      style={{
        backgroundColor: themeColor ? `${themeColor}10` : undefined,
      }}
    >
      <div className="container">
        <h2 
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          style={{
            fontFamily: customFont || undefined,
            color: customColor || undefined,
          }}
        >
          {language === "kz" ? "Фотогалерея" : "Галерея"}
        </h2>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {gallery.map((image) => (
                <div key={image.id} className="flex-[0_0_100%] min-w-0 px-4">
                  <div className="relative">
                    <img
                      src={image.imageUrl}
                      alt={image.caption || ""}
                      className="w-full h-[400px] md:h-[500px] object-cover rounded-lg"
                    />
                    {(image.caption || image.captionKz) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg">
                        <p className="text-white text-center text-lg">
                          {language === "kz" && image.captionKz ? image.captionKz : image.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          {gallery.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-8 md:left-12 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={scrollPrev}
                style={themeColor ? {
                  borderColor: themeColor,
                  color: themeColor,
                } : {}}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-8 md:right-12 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={scrollNext}
                style={themeColor ? {
                  borderColor: themeColor,
                  color: themeColor,
                } : {}}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Dots */}
          {gallery.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {gallery.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === selectedIndex
                      ? "w-8"
                      : ""
                  }`}
                  style={{
                    backgroundColor: index === selectedIndex && themeColor 
                      ? themeColor 
                      : index === selectedIndex 
                      ? '#D4A574' 
                      : '#9ca3af50',
                  }}
                  onClick={() => emblaApi?.scrollTo(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

