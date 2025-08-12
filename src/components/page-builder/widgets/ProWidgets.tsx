import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { PageElement } from "../PageBuilder1";
import {
  WidgetComponentProps,
  WidgetPropertiesPanelProps,
} from "../WidgetRegistry";
import { cn } from "@/lib/utils";

// TwentyTwenty Slider Widget (Banner version) - FIXED
export const TwentyTwentySliderWidget: React.FC<WidgetComponentProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState<{
    before: boolean;
    after: boolean;
  }>({ before: false, after: false });
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize slider position from element content or default to 50
  const sliderPosition = useMemo(() => {
    return element.content?.initialPosition ?? 50;
  }, [element.content?.initialPosition]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isPreviewMode) return;
      e.preventDefault();
      setIsDragging(true);
      updateSliderPosition(e.clientX);
    },
    [isPreviewMode]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && isPreviewMode) {
        e.preventDefault();
        updateSliderPosition(e.clientX);
      }
    },
    [isDragging, isPreviewMode]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const updateSliderPosition = useCallback(
    (clientX: number) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

        // Update the element's stored position
        onUpdate(element.id, {
          content: {
            ...element.content,
            initialPosition: Math.round(percentage),
          },
        });
      }
    },
    [element.id, element.content, onUpdate]
  );

  // Handle keyboard accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isPreviewMode) return;

      const currentPosition = element.content?.initialPosition ?? 50;
      let newPosition = currentPosition;

      switch (e.key) {
        case "ArrowLeft":
          newPosition = Math.max(0, currentPosition - 5);
          break;
        case "ArrowRight":
          newPosition = Math.min(100, currentPosition + 5);
          break;
        case "Home":
          newPosition = 0;
          break;
        case "End":
          newPosition = 100;
          break;
        default:
          return;
      }

      e.preventDefault();
      onUpdate(element.id, {
        content: {
          ...element.content,
          initialPosition: newPosition,
        },
      });
    },
    [isPreviewMode, element.content, element.id, onUpdate]
  );

  const handleImageUpload = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      imageType: "before" | "after"
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be less than 10MB");
        return;
      }

      setIsUploading((prev) => ({ ...prev, [imageType]: true }));

      try {
        const url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            } else {
              reject(new Error("Failed to read image"));
            }
          };
          reader.onerror = () => reject(new Error("Failed to read image"));
          reader.readAsDataURL(file);
        });

        await onUpdate(element.id, {
          content: {
            ...element.content,
            [imageType === "before" ? "beforeImage" : "afterImage"]: url,
          },
        });
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploading((prev) => ({ ...prev, [imageType]: false }));
      }
    },
    [element.id, element.content, onUpdate]
  );

  // Effect for event listeners with proper cleanup
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Prevent text selection while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      return () => {
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
    }
  }, [isDragging]);

  const height = element.styles?.height || "384px";
  const showLabels = element.props?.showLabels !== false;

  return (
    <div
      className={cn(
        "relative cursor-pointer select-none overflow-hidden",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
      ref={containerRef}
      role="application"
      aria-label="Before and after image comparison slider"
    >
      <div
        className="relative w-full overflow-hidden rounded-lg"
        style={{ height }}
        tabIndex={isPreviewMode ? 0 : -1}
        onKeyDown={handleKeyDown}
      >
        {/* Before Image */}
        {element.content?.beforeImage ? (
          <img
            src={element.content.beforeImage}
            alt="Before"
            className="absolute inset-0 w-full h-full object-cover"
            draggable="false"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No before image</p>
              {isUploading.before ? (
                <div className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed inline-block">
                  Uploading...
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "before")}
                    className="hidden"
                    id={`before-upload-${element.id}`}
                    disabled={isUploading.before}
                  />
                  <label
                    htmlFor={`before-upload-${element.id}`}
                    className="bg-[#92003b] text-white px-4 py-2 rounded cursor-pointer inline-block hover:bg-[#7a0032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Before Image
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* After Image (clipped) */}
        {element.content?.afterImage ? (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={element.content.afterImage}
              alt="After"
              className="absolute inset-0 w-full h-full object-cover"
              draggable="false"
            />
          </div>
        ) : (
          <div
            className="absolute inset-0 overflow-hidden bg-gray-300 flex items-center justify-center"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <div className="text-center">
              <p className="text-gray-500 mb-4">No after image</p>
              {isUploading.after ? (
                <div className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed inline-block">
                  Uploading...
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "after")}
                    className="hidden"
                    id={`after-upload-${element.id}`}
                    disabled={isUploading.after}
                  />
                  <label
                    htmlFor={`after-upload-${element.id}`}
                    className="bg-[#92003b] text-white px-4 py-2 rounded cursor-pointer inline-block hover:bg-[#7a0032] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload After Image
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* Slider Handle */}
        <div
          className={cn(
            "absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-10 transition-opacity",
            isDragging ? "opacity-100" : "opacity-90 hover:opacity-100"
          )}
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          role="slider"
          aria-label="Drag to compare before and after images"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={sliderPosition}
          tabIndex={isPreviewMode ? 0 : -1}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-[#92003b]">
            <div className="w-4 h-4 bg-[#92003b] rounded-full"></div>
          </div>
        </div>

        {/* Labels */}
        {showLabels &&
          element.content?.beforeImage &&
          element.content?.afterImage && (
            <>
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-medium">
                Before
              </div>
              <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm font-medium">
                After
              </div>
            </>
          )}

        {/* Position indicator */}
        {isDragging && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {Math.round(sliderPosition)}%
          </div>
        )}
      </div>

      {/* Title */}
      {element.content?.title && (
        <div className="mt-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800">
            {element.content.title}
          </h3>
          {element.content?.subtitle && (
            <p className="text-gray-600 mt-1">{element.content.subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
};

function TwentyTwentySliderPropertiesPanel({
  element,
  onUpdate,
  selectedDevice,
}: WidgetPropertiesPanelProps) {
  const [isUploading, setIsUploading] = React.useState<{
    before: boolean;
    after: boolean;
  }>({ before: false, after: false });

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: "before" | "after"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image size must be less than 10MB");
      return;
    }

    setIsUploading((prev) => ({ ...prev, [imageType]: true }));

    try {
      const url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            resolve(event.target.result as string);
          } else {
            reject(new Error("Failed to read image"));
          }
        };
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(file);
      });

      onUpdate(element.id, {
        content: {
          ...element.content,
          [imageType === "before" ? "beforeImage" : "afterImage"]: url,
        },
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading((prev) => ({ ...prev, [imageType]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={element.content?.title || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, title: e.target.value },
            })
          }
          className="w-full p-2 border rounded focus:ring-2 focus:ring-[#92003b] focus:border-transparent"
          placeholder="Enter comparison title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Subtitle</label>
        <input
          type="text"
          value={element.content?.subtitle || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, subtitle: e.target.value },
            })
          }
          className="w-full p-2 border rounded focus:ring-2 focus:ring-[#92003b] focus:border-transparent"
          placeholder="Enter comparison subtitle"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Before Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, "before")}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-[#92003b] focus:border-transparent"
          disabled={isUploading.before}
        />
        {isUploading.before && (
          <div className="mt-2 text-sm text-gray-500">Uploading...</div>
        )}
        {element.content?.beforeImage && (
          <div className="mt-2">
            <img
              src={element.content.beforeImage}
              alt="Before preview"
              className="w-full h-32 object-cover rounded border"
            />
            <button
              onClick={() =>
                onUpdate(element.id, {
                  content: { ...element.content, beforeImage: "" },
                })
              }
              className="mt-1 text-sm text-red-600 hover:text-red-800"
            >
              Remove Image
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">After Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e, "after")}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-[#92003b] focus:border-transparent"
          disabled={isUploading.after}
        />
        {isUploading.after && (
          <div className="mt-2 text-sm text-gray-500">Uploading...</div>
        )}
        {element.content?.afterImage && (
          <div className="mt-2">
            <img
              src={element.content.afterImage}
              alt="After preview"
              className="w-full h-32 object-cover rounded border"
            />
            <button
              onClick={() =>
                onUpdate(element.id, {
                  content: { ...element.content, afterImage: "" },
                })
              }
              className="mt-1 text-sm text-red-600 hover:text-red-800"
            >
              Remove Image
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Initial Slider Position: {element.content?.initialPosition || 50}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={element.content?.initialPosition || 50}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                initialPosition: parseInt(e.target.value),
              },
            })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Height</label>
        <select
          value={element.styles?.height || "384px"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, height: e.target.value },
            })
          }
          className="w-full p-2 border rounded focus:ring-2 focus:ring-[#92003b] focus:border-transparent"
        >
          <option value="300px">Small (300px)</option>
          <option value="384px">Medium (384px)</option>
          <option value="480px">Large (480px)</option>
          <option value="600px">Extra Large (600px)</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`show-labels-${element.id}`}
          checked={element.props?.showLabels !== false}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, showLabels: e.target.checked },
            })
          }
          className="rounded border-gray-300 text-[#92003b] focus:ring-[#92003b]"
        />
        <label
          htmlFor={`show-labels-${element.id}`}
          className="text-sm font-medium"
        >
          Show Before/After Labels
        </label>
      </div>
    </div>
  );
}

TwentyTwentySliderWidget.PropertiesPanel = TwentyTwentySliderPropertiesPanel;

// TwentyTwenty Carousel Widget (with thumbnail carousel) - FIXED
export const TwentyTwentyCarouselWidget: React.FC<WidgetComponentProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeDragger, setActiveDragger] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize state from element content
  const slides = useMemo(
    () => element.content?.slides || [],
    [element.content?.slides]
  );
  const currentSlide = useMemo(
    () => element.content?.currentSlide || 0,
    [element.content?.currentSlide]
  );

  // Initialize slider positions from element content or defaults
  const sliderPositions = useMemo(() => {
    const savedPositions = element.content?.sliderPositions || {};
    const defaultPositions: { [key: number]: number } = {};

    // Ensure all slides have a position
    slides.forEach((_, index) => {
      defaultPositions[index] = savedPositions[index] ?? 50;
    });

    return defaultPositions;
  }, [slides, element.content?.sliderPositions]);

  const updateCurrentSlide = useCallback(
    (newIndex: number) => {
      if (newIndex >= 0 && newIndex < slides.length) {
        onUpdate(element.id, {
          content: {
            ...element.content,
            currentSlide: newIndex,
          },
        });
      }
    },
    [element.id, element.content, slides.length, onUpdate]
  );

  const updateSliderPosition = useCallback(
    (clientX: number, slideIndex: number) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
        const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

        // Update the element's stored slider positions
        const updatedSliderPositions = {
          ...element.content?.sliderPositions,
          [slideIndex]: Math.round(percentage),
        };

        onUpdate(element.id, {
          content: {
            ...element.content,
            sliderPositions: updatedSliderPositions,
          },
        });
      }
    },
    [element.id, element.content, onUpdate]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, slideIndex: number) => {
      if (!isPreviewMode) return;
      e.preventDefault();
      setIsDragging(true);
      setActiveDragger(slideIndex);
      updateSliderPosition(e.clientX, slideIndex);
    },
    [isPreviewMode, updateSliderPosition]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging && activeDragger !== null && isPreviewMode) {
        e.preventDefault();
        updateSliderPosition(e.clientX, activeDragger);
      }
    },
    [isDragging, activeDragger, isPreviewMode, updateSliderPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setActiveDragger(null);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isPreviewMode) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          updateCurrentSlide(
            currentSlide > 0 ? currentSlide - 1 : slides.length - 1
          );
          break;
        case "ArrowRight":
          e.preventDefault();
          updateCurrentSlide(
            currentSlide < slides.length - 1 ? currentSlide + 1 : 0
          );
          break;
        case "Home":
          e.preventDefault();
          updateCurrentSlide(0);
          break;
        case "End":
          e.preventDefault();
          updateCurrentSlide(slides.length - 1);
          break;
      }
    },
    [isPreviewMode, currentSlide, slides.length, updateCurrentSlide]
  );

  const handleImageUpload = useCallback(
    async (
      e: React.ChangeEvent<HTMLInputElement>,
      slideIndex: number,
      imageType: "before" | "after"
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be less than 10MB");
        return;
      }

      const uploadKey = `${slideIndex}-${imageType}`;
      setIsUploading((prev) => ({ ...prev, [uploadKey]: true }));

      try {
        const url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            } else {
              reject(new Error("Failed to read image"));
            }
          };
          reader.onerror = () => reject(new Error("Failed to read image"));
          reader.readAsDataURL(file);
        });

        const updatedSlides = [...slides];
        if (!updatedSlides[slideIndex]) {
          updatedSlides[slideIndex] = {};
        }
        updatedSlides[slideIndex][
          imageType === "before" ? "beforeImage" : "afterImage"
        ] = url;

        onUpdate(element.id, {
          content: { ...element.content, slides: updatedSlides },
        });
      } catch (error) {
        console.error("Image upload failed:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploading((prev) => ({ ...prev, [uploadKey]: false }));
      }
    },
    [element.id, element.content, slides, onUpdate]
  );

  const addNewSlide = useCallback(() => {
    const newSlides = [...slides, { title: `Slide ${slides.length + 1}` }];
    onUpdate(element.id, {
      content: { ...element.content, slides: newSlides },
    });
  }, [element.id, element.content, slides, onUpdate]);

  const removeSlide = useCallback(
    (index: number) => {
      if (slides.length <= 1) return; // Prevent removing last slide

      const newSlides = slides.filter((_, i) => i !== index);
      const newSliderPositions = { ...element.content?.sliderPositions };
      delete newSliderPositions[index];

      // Adjust positions for remaining slides
      Object.keys(newSliderPositions).forEach((key) => {
        const slideIndex = parseInt(key);
        if (slideIndex > index) {
          newSliderPositions[slideIndex - 1] = newSliderPositions[slideIndex];
          delete newSliderPositions[slideIndex];
        }
      });

      const newCurrentSlide =
        currentSlide >= newSlides.length && newSlides.length > 0
          ? newSlides.length - 1
          : currentSlide >= newSlides.length
          ? 0
          : currentSlide;

      onUpdate(element.id, {
        content: {
          ...element.content,
          slides: newSlides,
          currentSlide: newCurrentSlide,
          sliderPositions: newSliderPositions,
        },
      });
    },
    [element.id, element.content, slides, currentSlide, onUpdate]
  );

  // Effect for event listeners with proper cleanup
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Prevent text selection while dragging
  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      return () => {
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
    }
  }, [isDragging]);

  const height = element.styles?.height || "384px";
  const showThumbnails = element.props?.showThumbnails !== false;
  const showArrows = element.props?.showArrows !== false;

  return (
    <div
      className={cn(
        "relative cursor-pointer select-none",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      <div
        className="space-y-4"
        tabIndex={isPreviewMode ? 0 : -1}
        onKeyDown={handleKeyDown}
      >
        {/* Main Slider */}
        <div
          className="relative w-full overflow-hidden rounded-lg"
          style={{ height }}
          ref={containerRef}
        >
          {slides.length > 0 && slides[currentSlide] ? (
            <>
              {/* Before Image */}
              {slides[currentSlide].beforeImage ? (
                <img
                  src={slides[currentSlide].beforeImage}
                  alt="Before"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">No before image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, currentSlide, "before")
                      }
                      className="hidden"
                      id={`carousel-before-upload-${element.id}-${currentSlide}`}
                    />
                    <label
                      htmlFor={`carousel-before-upload-${element.id}-${currentSlide}`}
                      className="bg-[#92003b] text-white px-4 py-2 rounded cursor-pointer inline-block"
                    >
                      Upload Before Image
                    </label>
                  </div>
                </div>
              )}

              {/* After Image (clipped) */}
              {slides[currentSlide].afterImage ? (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    clipPath: `inset(0 ${
                      100 - (sliderPositions[currentSlide] || 50)
                    }% 0 0)`,
                  }}
                >
                  <img
                    src={slides[currentSlide].afterImage}
                    alt="After"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div
                  className="absolute inset-0 overflow-hidden bg-gray-300 flex items-center justify-center"
                  style={{
                    clipPath: `inset(0 ${
                      100 - (sliderPositions[currentSlide] || 50)
                    }% 0 0)`,
                  }}
                >
                  <div className="text-center">
                    <p className="text-gray-500 mb-4">No after image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload(e, currentSlide, "after")
                      }
                      className="hidden"
                      id={`carousel-after-upload-${element.id}-${currentSlide}`}
                    />
                    <label
                      htmlFor={`carousel-after-upload-${element.id}-${currentSlide}`}
                      className="bg-[#92003b] text-white px-4 py-2 rounded cursor-pointer inline-block"
                    >
                      Upload After Image
                    </label>
                  </div>
                </div>
              )}

              {/* Slider Handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-10"
                style={{ left: `${sliderPositions[currentSlide] || 50}%` }}
                onMouseDown={(e) => handleMouseDown(e, currentSlide)}
              >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-[#92003b] rounded-full"></div>
                </div>
              </div>

              {/* Labels */}
              {slides[currentSlide].beforeImage &&
                slides[currentSlide].afterImage && (
                  <>
                    <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                      Before
                    </div>
                    <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                      After
                    </div>
                  </>
                )}
            </>
          ) : (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500 mb-4">No slides available</p>
                <button
                  onClick={addNewSlide}
                  className="bg-[#92003b] text-white px-4 py-2 rounded cursor-pointer inline-block"
                >
                  Add First Slide
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Slide Title */}
        {slides[currentSlide]?.title && (
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              {slides[currentSlide].title}
            </h3>
            {slides[currentSlide]?.subtitle && (
              <p className="text-gray-600">{slides[currentSlide].subtitle}</p>
            )}
          </div>
        )}

        {/* Thumbnail Carousel */}
        {slides.length > 1 && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 ${
                  currentSlide === index
                    ? "border-[#92003b]"
                    : "border-gray-300"
                }`}
                onClick={() => updateCurrentSlide(index)}
              >
                {slide.beforeImage ? (
                  <img
                    src={slide.beforeImage}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">{index + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <div className="flex justify-between items-center">
            <button
              onClick={() =>
                updateCurrentSlide(
                  currentSlide > 0 ? currentSlide - 1 : slides.length - 1
                )
              }
              className="bg-[#92003b] text-white p-2 rounded-full hover:bg-[#7a0032] transition-colors"
              disabled={!isPreviewMode}
            >
              ←
            </button>
            <span className="text-sm text-gray-600">
              {currentSlide + 1} / {slides.length}
            </span>
            <button
              onClick={() =>
                updateCurrentSlide(
                  currentSlide < slides.length - 1 ? currentSlide + 1 : 0
                )
              }
              className="bg-[#92003b] text-white p-2 rounded-full hover:bg-[#7a0032] transition-colors"
              disabled={!isPreviewMode}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

TwentyTwentyCarouselWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  const slides = element.content?.slides || [];
  const currentSlide = element.content?.currentSlide || 0;

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    slideIndex: number,
    imageType: "before" | "after"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const updatedSlides = [...slides];
        if (!updatedSlides[slideIndex]) {
          updatedSlides[slideIndex] = {};
        }
        updatedSlides[slideIndex][
          imageType === "before" ? "beforeImage" : "afterImage"
        ] = url;

        onUpdate(element.id, {
          content: { ...element.content, slides: updatedSlides },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewSlide = () => {
    const newSlides = [...slides, {}];
    onUpdate(element.id, {
      content: { ...element.content, slides: newSlides },
    });
  };

  const removeSlide = (index: number) => {
    const newSlides = slides.filter((_, i) => i !== index);
    onUpdate(element.id, {
      content: { ...element.content, slides: newSlides },
    });
  };

  const updateSlideField = (slideIndex: number, field: string, value: any) => {
    const updatedSlides = [...slides];
    if (!updatedSlides[slideIndex]) {
      updatedSlides[slideIndex] = {};
    }
    updatedSlides[slideIndex][field] = value;

    onUpdate(element.id, {
      content: { ...element.content, slides: updatedSlides },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Slides</h3>
        <button
          onClick={addNewSlide}
          className="bg-[#92003b] text-white px-3 py-1 rounded text-sm"
        >
          Add Slide
        </button>
      </div>

      {/* Slide Selector */}
      {slides.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Select Slide to Edit
          </label>
          <select
            value={currentSlide}
            onChange={(e) =>
              onUpdate(element.id, {
                content: {
                  ...element.content,
                  currentSlide: parseInt(e.target.value),
                },
              })
            }
            className="w-full p-2 border rounded"
          >
            {slides.map((_, index) => (
              <option key={index} value={index}>
                Slide {index + 1}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Current Slide Editor */}
      {slides.length > 0 && slides[currentSlide] && (
        <div className="space-y-4 border-t pt-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Slide {currentSlide + 1}</h4>
            {slides.length > 1 && (
              <button
                onClick={() => removeSlide(currentSlide)}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Remove
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Slide Title
            </label>
            <input
              type="text"
              value={slides[currentSlide]?.title || ""}
              onChange={(e) =>
                updateSlideField(currentSlide, "title", e.target.value)
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Slide Subtitle
            </label>
            <input
              type="text"
              value={slides[currentSlide]?.subtitle || ""}
              onChange={(e) =>
                updateSlideField(currentSlide, "subtitle", e.target.value)
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Before Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, currentSlide, "before")}
              className="w-full p-2 border rounded"
            />
            {slides[currentSlide]?.beforeImage && (
              <div className="mt-2">
                <img
                  src={slides[currentSlide].beforeImage}
                  alt="Before preview"
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              After Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, currentSlide, "after")}
              className="w-full p-2 border rounded"
            />
            {slides[currentSlide]?.afterImage && (
              <div className="mt-2">
                <img
                  src={slides[currentSlide].afterImage}
                  alt="After preview"
                  className="w-full h-32 object-cover rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Settings */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="font-medium">Global Settings</h4>

        <div>
          <label className="block text-sm font-medium mb-2">
            Main Slider Height
          </label>
          <select
            value={element.styles?.height || "384px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, height: e.target.value },
              })
            }
            className="w-full p-2 border rounded"
          >
            <option value="300px">Small (300px)</option>
            <option value="384px">Medium (384px)</option>
            <option value="480px">Large (480px)</option>
            <option value="600px">Extra Large (600px)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Show Thumbnails
          </label>
          <select
            value={element.props?.showThumbnails !== false ? "true" : "false"}
            onChange={(e) =>
              onUpdate(element.id, {
                props: {
                  ...element.props,
                  showThumbnails: e.target.value === "true",
                },
              })
            }
            className="w-full p-2 border rounded"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Show Navigation Arrows
          </label>
          <select
            value={element.props?.showArrows !== false ? "true" : "false"}
            onChange={(e) =>
              onUpdate(element.id, {
                props: {
                  ...element.props,
                  showArrows: e.target.value === "true",
                },
              })
            }
            className="w-full p-2 border rounded"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>
    </div>
  );
};
