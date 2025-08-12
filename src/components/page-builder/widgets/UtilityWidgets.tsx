import React from "react";
import { PageElement } from "../PageBuilder1";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface WidgetProps {
  element: PageElement;
  isSelected: boolean;
  onSelect: (element: PageElement) => void;
  onUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  isPreviewMode: boolean;
}

// Alert Widget
export const AlertWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);
  const message = element.content?.message || "This is an alert message";
  const type = element.content?.type || "info";
  const dismissible = element.content?.dismissible || false;

  const getAlertStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "relative border rounded-lg p-4 flex items-start space-x-3",
        getAlertStyles(),
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b]"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {element.props?.icon !== false && (
        <div className="flex-shrink-0">{getIcon()}</div>
      )}

      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>

      {dismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 ml-4"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

AlertWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea
          value={element.content?.message || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, message: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Type</label>
        <select
          value={element.content?.type || "info"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, type: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.dismissible || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, dismissible: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Dismissible</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.icon !== false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, icon: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show icon</span>
        </label>
      </div>
    </div>
  );
};

// Badge Widget
export const BadgeWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const text = element.content?.text || "Badge";
  const variant = element.content?.variant || "default";

  const getBadgeStyles = () => {
    switch (variant) {
      case "primary":
        return "bg-[#92003b] text-white";
      case "secondary":
        return "bg-gray-200 text-gray-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        getBadgeStyles(),
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b]"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {text}
    </span>
  );
};

BadgeWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Text</label>
        <input
          type="text"
          value={element.content?.text || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, text: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Variant</label>
        <select
          value={element.content?.variant || "default"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, variant: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="default">Default</option>
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>
    </div>
  );
};

// Testimonial Widget
export const TestimonialWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const quote = element.content?.quote || "This is an amazing product!";
  const author = element.content?.author || "John Doe";
  const role = element.content?.role || "CEO, Company";
  const image = element.content?.image || "";
  const rating = element.content?.rating || 5;

  const renderStars = () => {
    if (!element.props?.showRating) return null;

    return (
      <div className="flex justify-center mb-4">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={cn(
              "w-5 h-5",
              i < rating ? "text-yellow-400" : "text-gray-300"
            )}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "relative text-center p-6",
        isSelected &&
          !isPreviewMode &&
          "ring-2 ring-[#92003b] bg-[#92003b]/5 rounded"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {renderStars()}

      <blockquote className="text-lg italic text-gray-600 mb-4">
        "{quote}"
      </blockquote>

      {element.props?.showImage && image && (
        <div className="mb-4">
          <img
            src={image}
            alt={author}
            className="w-16 h-16 rounded-full mx-auto object-cover"
          />
        </div>
      )}

      <div>
        <div className="font-semibold text-gray-900">{author}</div>
        {role && <div className="text-sm text-gray-600">{role}</div>}
      </div>
    </div>
  );
};

TestimonialWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        onUpdate(element.id, {
          content: { ...element.content, image: url },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Quote</label>
        <textarea
          value={element.content?.quote || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, quote: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Author</label>
        <input
          type="text"
          value={element.content?.author || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, author: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Role</label>
        <input
          type="text"
          value={element.content?.role || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, role: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Author Image</label>
        <div className="space-y-2">
          {element.content?.image ? (
            <div className="relative">
              <img
                src={element.content.image}
                alt="Author"
                className="w-16 h-16 rounded-full object-cover"
              />
              <button
                onClick={() =>
                  onUpdate(element.id, {
                    content: { ...element.content, image: "" },
                  })
                }
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ×
              </button>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id={`testimonial-image-${element.id}`}
              />
              <label
                htmlFor={`testimonial-image-${element.id}`}
                className="bg-[#92003b] text-white px-3 py-1 rounded text-sm cursor-pointer inline-block"
              >
                Upload Image
              </label>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <select
          value={element.content?.rating || 5}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                rating: parseInt(e.target.value) || 5,
              },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value={1}>1 Star</option>
          <option value={2}>2 Stars</option>
          <option value={3}>3 Stars</option>
          <option value={4}>4 Stars</option>
          <option value={5}>5 Stars</option>
        </select>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.showImage !== false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, showImage: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show author image</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.showRating !== false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, showRating: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show rating</span>
        </label>
      </div>
    </div>
  );
};
