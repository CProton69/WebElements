import React from "react";
import { PageElement } from "../PageBuilder1";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface WidgetProps {
  element: PageElement;
  isSelected: boolean;
  onSelect: (element: PageElement) => void;
  onUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  isPreviewMode: boolean;
}

// Gallery Widget
export const GalleryWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const images = element.content?.images || [];
  const layout = element.content?.layout || "grid";
  const columns = element.content?.columns || 3;
  const spacing = element.content?.spacing || 10;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newImages = [
          ...images,
          {
            id: Date.now() + Math.random(),
            url,
            alt: file.name,
            caption: "",
          },
        ];
        onUpdate(element.id, {
          content: { ...element.content, images: newImages },
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const getGridClasses = () => {
    const baseClasses = "grid gap-2";
    switch (columns) {
      case 2:
        return `${baseClasses} grid-cols-2`;
      case 3:
        return `${baseClasses} grid-cols-3`;
      case 4:
        return `${baseClasses} grid-cols-4`;
      default:
        return `${baseClasses} grid-cols-3`;
    }
  };

  return (
    <div
      className={cn(
        "relative",
        isSelected &&
          !isPreviewMode &&
          "ring-2 ring-[#92003b] bg-[#92003b]/5 rounded p-2"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {images.length > 0 ? (
        <div className={getGridClasses()}>
          {images.map((image: any) => (
            <div key={image.id} className="relative group">
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-48 object-cover rounded"
              />
              {image.caption && (
                <div className="text-sm text-gray-600 mt-1 text-center">
                  {image.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No images in gallery</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            id={`gallery-upload-${element.id}`}
          />
          <label
            htmlFor={`gallery-upload-${element.id}`}
            className="bg-[#92003b] text-white px-4 py-2 rounded cursor-pointer inline-block"
          >
            Upload Images
          </label>
        </div>
      )}
    </div>
  );
};

GalleryWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  const images = element.content?.images || [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newImages = [
          ...images,
          {
            id: Date.now() + Math.random(),
            url,
            alt: file.name,
            caption: "",
          },
        ];
        onUpdate(element.id, {
          content: { ...element.content, images: newImages },
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const updateImage = (index: number, field: string, value: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    onUpdate(element.id, {
      content: { ...element.content, images: newImages },
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onUpdate(element.id, {
      content: { ...element.content, images: newImages },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Images</label>
        <div className="space-y-2">
          {images.map((image: any, index: number) => (
            <div key={image.id} className="border rounded p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Image {index + 1}</span>
                <button
                  onClick={() => removeImage(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="Alt text"
                value={image.alt}
                onChange={(e) => updateImage(index, "alt", e.target.value)}
                className="w-full p-2 border rounded text-sm mb-1"
              />
              <input
                type="text"
                placeholder="Caption"
                value={image.caption}
                onChange={(e) => updateImage(index, "caption", e.target.value)}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          id={`gallery-upload-panel-${element.id}`}
        />
        <label
          htmlFor={`gallery-upload-panel-${element.id}`}
          className="mt-2 bg-[#92003b] text-white px-3 py-1 rounded text-sm cursor-pointer inline-block"
        >
          Add Images
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Layout</label>
        <select
          value={element.content?.layout || "grid"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, layout: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="grid">Grid</option>
          <option value="masonry">Masonry</option>
          <option value="justified">Justified</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Columns</label>
        <input
          type="number"
          min="1"
          max="6"
          value={element.content?.columns || 3}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                columns: parseInt(e.target.value) || 3,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Spacing (px)</label>
        <input
          type="number"
          min="0"
          value={element.content?.spacing || 10}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                spacing: parseInt(e.target.value) || 10,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
};

// Carousel Widget
export const CarouselWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const images = element.content?.images || [];
  const autoplay = element.content?.autoplay || false;
  const interval = element.content?.interval || 5000;

  React.useEffect(() => {
    if (!isPreviewMode || !autoplay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, images.length, isPreviewMode]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newImages = [
          ...images,
          {
            id: Date.now() + Math.random(),
            url,
            alt: file.name,
            caption: "",
          },
        ];
        onUpdate(element.id, {
          content: { ...element.content, images: newImages },
        });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        isSelected &&
          !isPreviewMode &&
          "ring-2 ring-[#92003b] bg-[#92003b]/5 rounded p-2"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {images.length > 0 ? (
        <>
          {/* Carousel Images */}
          <div className="relative h-64 bg-gray-100 rounded">
            {images.map((image: any, index: number) => (
              <div
                key={image.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  index === currentIndex ? "opacity-100" : "opacity-0"
                )}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                    {image.caption}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {element.content?.showArrows !== false && images.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Dots */}
          {element.content?.showDots !== false && images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    index === currentIndex
                      ? "bg-white"
                      : "bg-white bg-opacity-50"
                  )}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-64 flex items-center justify-center">
          <div>
            <p className="text-gray-500 mb-4">No images in carousel</p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              id={`carousel-upload-${element.id}`}
            />
            <label
              htmlFor={`carousel-upload-${element.id}`}
              className="bg-[#92003b] text-white px-4 py-2 rounded cursor-pointer inline-block"
            >
              Upload Images
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

CarouselWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  const images = element.content?.images || [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const newImages = [
          ...images,
          {
            id: Date.now() + Math.random(),
            url,
            alt: file.name,
            caption: "",
          },
        ];
        onUpdate(element.id, {
          content: { ...element.content, images: newImages },
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const updateImage = (index: number, field: string, value: string) => {
    const newImages = [...images];
    newImages[index] = { ...newImages[index], [field]: value };
    onUpdate(element.id, {
      content: { ...element.content, images: newImages },
    });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onUpdate(element.id, {
      content: { ...element.content, images: newImages },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Images</label>
        <div className="space-y-2">
          {images.map((image: any, index: number) => (
            <div key={image.id} className="border rounded p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Image {index + 1}</span>
                <button
                  onClick={() => removeImage(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="Alt text"
                value={image.alt}
                onChange={(e) => updateImage(index, "alt", e.target.value)}
                className="w-full p-2 border rounded text-sm mb-1"
              />
              <input
                type="text"
                placeholder="Caption"
                value={image.caption}
                onChange={(e) => updateImage(index, "caption", e.target.value)}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          id={`carousel-upload-panel-${element.id}`}
        />
        <label
          htmlFor={`carousel-upload-panel-${element.id}`}
          className="mt-2 bg-[#92003b] text-white px-3 py-1 rounded text-sm cursor-pointer inline-block"
        >
          Add Images
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.autoplay || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, autoplay: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Autoplay</span>
        </label>
      </div>

      {element.content?.autoplay && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Interval (ms)
          </label>
          <input
            type="number"
            min="1000"
            step="1000"
            value={element.content?.interval || 5000}
            onChange={(e) =>
              onUpdate(element.id, {
                content: {
                  ...element.content,
                  interval: parseInt(e.target.value) || 5000,
                },
              })
            }
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.showArrows !== false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, showArrows: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show arrows</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.showDots !== false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, showDots: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show dots</span>
        </label>
      </div>
    </div>
  );
};

// Map Widget
export const MapWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const address = element.content?.address || "";
  const latitude = element.content?.latitude || 40.7128;
  const longitude = element.content?.longitude || -74.006;
  const zoom = element.content?.zoom || 14;
  const markerTitle = element.content?.markerTitle || "Our Location";

  return (
    <div
      className={cn(
        "relative",
        isSelected &&
          !isPreviewMode &&
          "ring-2 ring-[#92003b] bg-[#92003b]/5 rounded p-2"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 mb-1">{markerTitle}</p>
          <p className="text-sm text-gray-500">
            {address || `${latitude}, ${longitude}`}
          </p>
          <p className="text-xs text-gray-400 mt-2">Google Maps Placeholder</p>
        </div>
      </div>
    </div>
  );
};

MapWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Address</label>
        <input
          type="text"
          value={element.content?.address || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, address: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
          placeholder="Enter address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Latitude</label>
        <input
          type="number"
          step="any"
          value={element.content?.latitude || 40.7128}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                latitude: parseFloat(e.target.value) || 40.7128,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Longitude</label>
        <input
          type="number"
          step="any"
          value={element.content?.longitude || -74.006}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                longitude: parseFloat(e.target.value) || -74.006,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Zoom Level</label>
        <input
          type="number"
          min="1"
          max="20"
          value={element.content?.zoom || 14}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                zoom: parseInt(e.target.value) || 14,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Marker Title</label>
        <input
          type="text"
          value={element.content?.markerTitle || "Our Location"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, markerTitle: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Map Type</label>
        <select
          value={element.props?.mapType || "roadmap"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, mapType: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="roadmap">Roadmap</option>
          <option value="satellite">Satellite</option>
          <option value="hybrid">Hybrid</option>
          <option value="terrain">Terrain</option>
        </select>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.showControls !== false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, showControls: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show controls</span>
        </label>
      </div>
    </div>
  );
};
