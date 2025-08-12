import React from "react";
import { PageElement } from "../PageBuilder1";
import { cn } from "@/lib/utils";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

interface WidgetProps {
  element: PageElement;
  isSelected: boolean;
  onSelect: (element: PageElement) => void;
  onUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  isPreviewMode: boolean;
}

// Social Icons Widget
export const SocialIconsWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const icons = element.content?.icons || [];
  const size = element.props?.size || 24;
  const shape = element.props?.shape || "circle";
  const hoverEffect = element.props?.hoverEffect || "scale";

  const getIconComponent = (platform: string) => {
    switch (platform) {
      case "facebook":
        return Facebook;
      case "twitter":
        return Twitter;
      case "instagram":
        return Instagram;
      case "linkedin":
        return Linkedin;
      case "youtube":
        return Youtube;
      case "github":
        return Github;
      case "email":
        return Mail;
      case "phone":
        return Phone;
      case "location":
        return MapPin;
      case "website":
        return Globe;
      default:
        return Globe;
    }
  };

  const getIconStyles = (icon: any) => {
    const baseClasses = cn(
      "flex items-center justify-center transition-all duration-300",
      hoverEffect === "scale" && "hover:scale-110",
      hoverEffect === "fade" && "hover:opacity-75",
      hoverEffect === "lift" && "hover:-translate-y-1"
    );

    if (shape === "circle") {
      return cn(baseClasses, "rounded-full");
    } else if (shape === "square") {
      return cn(baseClasses, "rounded-lg");
    }
    return baseClasses;
  };

  const iconSizeStyle = {
    width: size,
    height: size,
    fontSize: size * 0.6,
  };

  return (
    <div
      className={cn(
        "relative flex",
        isSelected &&
          !isPreviewMode &&
          "ring-2 ring-[#92003b] bg-[#92003b]/5 rounded p-2"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {icons.map((icon: any, index: number) => {
        const IconComponent = getIconComponent(icon.platform);
        return (
          <a
            key={index}
            href={icon.url}
            target="_blank"
            rel="noopener noreferrer"
            className={getIconStyles(icon)}
            style={{
              ...iconSizeStyle,
              backgroundColor: icon.color || "#6b7280",
              color: "#ffffff",
              marginRight: index < icons.length - 1 ? "0.5rem" : "0",
            }}
            title={icon.platform}
          >
            <IconComponent size={size * 0.6} />
          </a>
        );
      })}
    </div>
  );
};

SocialIconsWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  const icons = element.content?.icons || [];

  const addIcon = () => {
    const newIcons = [
      ...icons,
      {
        platform: "facebook",
        url: "https://facebook.com",
        color: "#1877f2",
      },
    ];
    onUpdate(element.id, {
      content: { ...element.content, icons: newIcons },
    });
  };

  const updateIcon = (index: number, field: string, value: string) => {
    const newIcons = [...icons];
    newIcons[index] = { ...newIcons[index], [field]: value };
    onUpdate(element.id, {
      content: { ...element.content, icons: newIcons },
    });
  };

  const removeIcon = (index: number) => {
    const newIcons = icons.filter((_, i) => i !== index);
    onUpdate(element.id, {
      content: { ...element.content, icons: newIcons },
    });
  };

  const platformOptions = [
    { value: "facebook", label: "Facebook", defaultColor: "#1877f2" },
    { value: "twitter", label: "Twitter", defaultColor: "#1da1f2" },
    { value: "instagram", label: "Instagram", defaultColor: "#e4405f" },
    { value: "linkedin", label: "LinkedIn", defaultColor: "#0077b5" },
    { value: "youtube", label: "YouTube", defaultColor: "#ff0000" },
    { value: "github", label: "GitHub", defaultColor: "#333333" },
    { value: "email", label: "Email", defaultColor: "#ea4335" },
    { value: "phone", label: "Phone", defaultColor: "#34a853" },
    { value: "location", label: "Location", defaultColor: "#4285f4" },
    { value: "website", label: "Website", defaultColor: "#6b7280" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Social Icons</label>
        <div className="space-y-2">
          {icons.map((icon: any, index: number) => (
            <div key={index} className="border rounded p-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Icon {index + 1}</span>
                <button
                  onClick={() => removeIcon(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>

              <div>
                <label className="block text-xs mb-1">Platform</label>
                <select
                  value={icon.platform}
                  onChange={(e) => {
                    const selectedPlatform = platformOptions.find(
                      (p) => p.value === e.target.value
                    );
                    updateIcon(index, "platform", e.target.value);
                    if (selectedPlatform) {
                      updateIcon(index, "color", selectedPlatform.defaultColor);
                    }
                  }}
                  className="w-full p-1 border rounded text-sm"
                >
                  {platformOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1">URL</label>
                <input
                  type="url"
                  value={icon.url}
                  onChange={(e) => updateIcon(index, "url", e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>

              <div>
                <label className="block text-xs mb-1">Color</label>
                <input
                  type="color"
                  value={icon.color}
                  onChange={(e) => updateIcon(index, "color", e.target.value)}
                  className="w-full p-1 border rounded text-sm h-8"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addIcon}
          className="mt-2 bg-[#92003b] text-white px-3 py-1 rounded text-sm"
        >
          Add Icon
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Size (px)</label>
        <input
          type="number"
          min="16"
          max="64"
          value={element.props?.size || 24}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, size: parseInt(e.target.value) || 24 },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Shape</label>
        <select
          value={element.props?.shape || "circle"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, shape: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="circle">Circle</option>
          <option value="square">Square</option>
          <option value="none">None</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Hover Effect</label>
        <select
          value={element.props?.hoverEffect || "scale"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, hoverEffect: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="none">None</option>
          <option value="scale">Scale</option>
          <option value="fade">Fade</option>
          <option value="lift">Lift</option>
        </select>
      </div>
    </div>
  );
};
