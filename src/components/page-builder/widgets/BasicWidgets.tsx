import React from "react";
import { PageElement } from "../PageBuilder1";
import { cn } from "@/lib/utils";

interface WidgetProps {
  element: PageElement;
  isSelected: boolean;
  onSelect: (element: PageElement) => void;
  onUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  isPreviewMode: boolean;
}

// Heading Widget
export const HeadingWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(element.content?.text || "");

  const handleDoubleClick = () => {
    if (!isPreviewMode) {
      setIsEditing(true);
      setEditText(element.content?.text || "");
    }
  };

  const handleSave = () => {
    onUpdate(element.id, {
      content: { ...element.content, text: editText },
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const level = element.content?.level || 2;
  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;

  if (isEditing) {
    return (
      <HeadingTag
        className={cn(
          "outline-none ring-2 ring-[#92003b] rounded p-1",
          isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
        )}
        style={element.styles}
      >
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full outline-none bg-transparent"
          autoFocus
        />
      </HeadingTag>
    );
  }

  return (
    <HeadingTag
      className={cn(
        "cursor-pointer select-none",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
      onDoubleClick={handleDoubleClick}
    >
      {element.content?.text || "Heading"}
    </HeadingTag>
  );
};

HeadingWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Heading Text</label>
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
        <label className="block text-sm font-medium mb-2">Heading Level</label>
        <select
          value={element.content?.level || 2}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, level: parseInt(e.target.value) },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
          <option value={5}>H5</option>
          <option value={6}>H6</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Text Alignment</label>
        <select
          value={element.styles?.textAlign || "left"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, textAlign: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Font Size</label>
        <input
          type="text"
          value={element.styles?.fontSize || "32px"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, fontSize: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Color</label>
        <input
          type="color"
          value={element.styles?.color || "#1f2937"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, color: e.target.value },
            })
          }
          className="w-full p-1 border rounded"
        />
      </div>
    </div>
  );
};

// Text Widget
export const TextWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(element.content?.text || "");

  const handleDoubleClick = () => {
    if (!isPreviewMode) {
      setIsEditing(true);
      setEditText(element.content?.text || "");
    }
  };

  const handleSave = () => {
    onUpdate(element.id, {
      content: { ...element.content, text: editText },
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div
        className={cn(
          "outline-none ring-2 ring-[#92003b] rounded p-1",
          isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
        )}
        style={element.styles}
      >
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full outline-none bg-transparent resize-none"
          autoFocus
          rows={4}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "cursor-pointer select-none",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
      onDoubleClick={handleDoubleClick}
      dangerouslySetInnerHTML={{
        __html: element.content?.text || "Text content",
      }}
    />
  );
};

TextWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Text Content</label>
        <textarea
          value={element.content?.text || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, text: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Text Alignment</label>
        <select
          value={element.styles?.textAlign || "left"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, textAlign: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Font Size</label>
        <input
          type="text"
          value={element.styles?.fontSize || "16px"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, fontSize: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Line Height</label>
        <input
          type="text"
          value={element.styles?.lineHeight || "1.6"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, lineHeight: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Color</label>
        <input
          type="color"
          value={element.styles?.color || "#4b5563"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, color: e.target.value },
            })
          }
          className="w-full p-1 border rounded"
        />
      </div>
    </div>
  );
};

// Button Widget
export const ButtonWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(element.content?.text || "");

  const handleDoubleClick = () => {
    if (!isPreviewMode) {
      setIsEditing(true);
      setEditText(element.content?.text || "");
    }
  };

  const handleSave = () => {
    onUpdate(element.id, {
      content: { ...element.content, text: editText },
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleClick = () => {
    if (element.content?.link?.url && isPreviewMode) {
      window.open(
        element.content.link.url,
        element.content.link.target || "_blank"
      );
    }
  };

  if (isEditing) {
    return (
      <button
        className={cn(
          "outline-none ring-2 ring-[#92003b] rounded p-1",
          isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
        )}
        style={element.styles}
      >
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="w-full outline-none bg-transparent text-center"
          autoFocus
        />
      </button>
    );
  }

  return (
    <button
      className={cn(
        "cursor-pointer select-none",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={(e) => {
        if (!isPreviewMode) {
          e.preventDefault();
          onSelect(element);
        } else {
          handleClick();
        }
      }}
      onDoubleClick={handleDoubleClick}
    >
      {element.content?.text || "Button"}
    </button>
  );
};

ButtonWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Button Text</label>
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
        <label className="block text-sm font-medium mb-2">Link URL</label>
        <input
          type="text"
          value={element.content?.link?.url || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                link: { ...element.content.link, url: e.target.value },
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Link Target</label>
        <select
          value={element.content?.link?.target || "_blank"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                link: { ...element.content.link, target: e.target.value },
              },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="_blank">New Window</option>
          <option value="_self">Same Window</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Background Color
        </label>
        <input
          type="color"
          value={element.styles?.backgroundColor || "#92003b"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, backgroundColor: e.target.value },
            })
          }
          className="w-full p-1 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Text Color</label>
        <input
          type="color"
          value={element.styles?.color || "#ffffff"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, color: e.target.value },
            })
          }
          className="w-full p-1 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Border Radius</label>
        <input
          type="text"
          value={element.styles?.borderRadius || "6px"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, borderRadius: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
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

// Image Widget
export const ImageWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        onUpdate(element.id, {
          content: { ...element.content, url },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={cn(
        "relative inline-block",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {element.content?.url ? (
        <img
          src={element.content.url}
          alt={element.content?.alt || "Image"}
          className="max-w-full h-auto"
          style={element.styles}
        />
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No image selected</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id={`image-upload-${element.id}`}
          />
          <label
            htmlFor={`image-upload-${element.id}`}
            className="bg-[#92003b] text-white px-4 py-2 rounded cursor-pointer inline-block"
          >
            Upload Image
          </label>
        </div>
      )}

      {element.content?.caption && (
        <div className="text-sm text-gray-600 mt-2 text-center">
          {element.content.caption}
        </div>
      )}
    </div>
  );
};

ImageWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        onUpdate(element.id, {
          content: { ...element.content, url },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Image URL</label>
        <input
          type="text"
          value={element.content?.url || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, url: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
          placeholder="Enter image URL or upload"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Alt Text</label>
        <input
          type="text"
          value={element.content?.alt || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, alt: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Caption</label>
        <input
          type="text"
          value={element.content?.caption || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, caption: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Max Width</label>
        <input
          type="text"
          value={element.styles?.maxWidth || "100%"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, maxWidth: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Border Radius</label>
        <input
          type="text"
          value={element.styles?.borderRadius || "0"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, borderRadius: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Box Shadow</label>
        <input
          type="text"
          value={element.styles?.boxShadow || "none"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, boxShadow: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
};

// Video Widget
export const VideoWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const getVideoEmbedUrl = () => {
    const url = element.content?.url || "";
    const source = element.content?.source || "youtube";

    if (!url) return "";

    if (source === "youtube") {
      const videoId = url.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
      )?.[1];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    } else if (source === "vimeo") {
      const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : "";
    }

    return url;
  };

  return (
    <div
      className={cn(
        "relative",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {element.content?.url ? (
        <iframe
          src={getVideoEmbedUrl()}
          className="w-full h-full"
          style={element.styles}
          frameBorder="0"
          allowFullScreen
          allow={element.content?.autoplay ? "autoplay" : ""}
        />
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No video selected</p>
          <input
            type="text"
            value={element.content?.url || ""}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, url: e.target.value },
              })
            }
            className="w-full p-2 border rounded mb-2"
            placeholder="Enter YouTube or Vimeo URL"
          />
        </div>
      )}
    </div>
  );
};

VideoWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Video URL</label>
        <input
          type="text"
          value={element.content?.url || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, url: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
          placeholder="Enter YouTube or Vimeo URL"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Video Source</label>
        <select
          value={element.content?.source || "youtube"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, source: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="youtube">YouTube</option>
          <option value="vimeo">Vimeo</option>
          <option value="custom">Custom URL</option>
        </select>
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
          />
          <span className="text-sm">Autoplay</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.controls || true}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, controls: e.target.checked },
              })
            }
          />
          <span className="text-sm">Show Controls</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.loop || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, loop: e.target.checked },
              })
            }
          />
          <span className="text-sm">Loop</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.muted || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, muted: e.target.checked },
              })
            }
          />
          <span className="text-sm">Muted</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Width</label>
        <input
          type="text"
          value={element.styles?.width || "100%"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, width: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Height</label>
        <input
          type="text"
          value={element.styles?.height || "400px"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, height: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
};

// Divider Widget
export const DividerWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  return (
    <hr
      className={cn(
        "cursor-pointer",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    />
  );
};

DividerWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Style</label>
        <select
          value={element.props?.style || "solid"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, style: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Thickness</label>
        <input
          type="text"
          value={element.props?.thickness || "1px"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, thickness: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Color</label>
        <input
          type="color"
          value={element.props?.color || "#e5e7eb"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, color: e.target.value },
            })
          }
          className="w-full p-1 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Margin Top</label>
        <input
          type="text"
          value={element.styles?.marginTop || "24px"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, marginTop: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Margin Bottom</label>
        <input
          type="text"
          value={element.styles?.marginBottom || "24px"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, marginBottom: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
};

// Icon Widget
export const IconWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [iconComponent, setIconComponent] =
    React.useState<React.ReactNode>(null);

  React.useEffect(() => {
    // This would normally load the actual icon component
    // For now, we'll use a simple placeholder
    setIconComponent(
      <div
        className="inline-flex items-center justify-center"
        style={{
          width: element.content?.size || 24,
          height: element.content?.size || 24,
          color: element.content?.color || "#1f2937",
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>
    );
  }, [element.content]);

  return (
    <div
      className={cn(
        "inline-block cursor-pointer",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {iconComponent}
    </div>
  );
};

IconWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Icon Name</label>
        <input
          type="text"
          value={element.content?.name || "star"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, name: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Icon Library</label>
        <select
          value={element.content?.library || "lucide"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, library: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="lucide">Lucide</option>
          <option value="fontawesome">Font Awesome</option>
          <option value="heroicons">Heroicons</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Size</label>
        <input
          type="number"
          value={element.content?.size || 24}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, size: parseInt(e.target.value) },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Color</label>
        <input
          type="color"
          value={element.content?.color || "#1f2937"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, color: e.target.value },
            })
          }
          className="w-full p-1 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Link URL</label>
        <input
          type="text"
          value={element.content?.link?.url || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                link: { ...element.content.link, url: e.target.value },
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
};

// Spacer Widget
export const SpacerWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  return (
    <div
      className={cn(
        "cursor-pointer",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        Spacer
      </div>
    </div>
  );
};

SpacerWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Orientation</label>
        <select
          value={element.props?.orientation || "vertical"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, orientation: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Size (px)</label>
        <input
          type="number"
          value={element.props?.size || 50}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, size: parseInt(e.target.value) },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      {element.props?.orientation === "vertical" ? (
        <div>
          <label className="block text-sm font-medium mb-2">Height</label>
          <input
            type="text"
            value={element.styles?.height || "50px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, height: e.target.value },
              })
            }
            className="w-full p-2 border rounded"
          />
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium mb-2">Width</label>
          <input
            type="text"
            value={element.styles?.width || "50px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, width: e.target.value },
              })
            }
            className="w-full p-2 border rounded"
          />
        </div>
      )}
    </div>
  );
};

// HTML Widget
export const HTMLWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  return (
    <div
      className={cn(
        "cursor-pointer",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
      dangerouslySetInnerHTML={{
        __html: element.content?.html || "<div>Custom HTML content</div>",
      }}
    />
  );
};

HTMLWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">HTML Content</label>
        <textarea
          value={element.content?.html || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, html: e.target.value },
            })
          }
          className="w-full p-2 border rounded font-mono text-sm"
          rows={8}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Custom CSS</label>
        <textarea
          value={element.content?.css || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, css: e.target.value },
            })
          }
          className="w-full p-2 border rounded font-mono text-sm"
          rows={4}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Custom JavaScript
        </label>
        <textarea
          value={element.content?.js || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, js: e.target.value },
            })
          }
          className="w-full p-2 border rounded font-mono text-sm"
          rows={4}
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.executeJS || false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, executeJS: e.target.checked },
              })
            }
          />
          <span className="text-sm">Execute JavaScript</span>
        </label>
      </div>
    </div>
  );
};

// Pro Widgets

// Star Rating Widget (Pro)
export const StarRatingWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const rating = element.content?.rating || 0;
  const maxRating = element.content?.maxRating || 5;

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
      <div className="flex space-x-1">
        {[...Array(maxRating)].map((_, index) => (
          <span
            key={index}
            className={cn(
              "text-2xl",
              index < rating ? "text-yellow-400" : "text-gray-300"
            )}
          >
            ★
          </span>
        ))}
      </div>
      {element.content?.showValue && (
        <div className="text-sm text-gray-600 mt-1">
          {rating} out of {maxRating}
        </div>
      )}
    </div>
  );
};

StarRatingWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <input
          type="number"
          min="0"
          max={element.content?.maxRating || 5}
          value={element.content?.rating || 0}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                rating: parseInt(e.target.value) || 0,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Max Rating</label>
        <input
          type="number"
          min="1"
          max="10"
          value={element.content?.maxRating || 5}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                maxRating: parseInt(e.target.value) || 5,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.showValue || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, showValue: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show rating value</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Star Size</label>
        <select
          value={element.props?.starSize || "medium"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, starSize: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  );
};

// Price Table Widget (Pro)
export const PriceTableWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const plans = element.content?.plans || [
    {
      name: "Basic",
      price: "$9",
      period: "/month",
      features: ["Feature 1", "Feature 2", "Feature 3"],
      highlighted: false,
      buttonText: "Get Started",
      buttonLink: "",
    },
    {
      name: "Pro",
      price: "$29",
      period: "/month",
      features: [
        "All Basic Features",
        "Pro Feature 1",
        "Pro Feature 2",
        "Priority Support",
      ],
      highlighted: true,
      buttonText: "Get Started",
      buttonLink: "",
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      features: [
        "All Pro Features",
        "Enterprise Features",
        "24/7 Support",
        "Custom Integration",
      ],
      highlighted: false,
      buttonText: "Contact Us",
      buttonLink: "",
    },
  ];

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: any, index: number) => (
          <div
            key={index}
            className={cn(
              "border rounded-lg p-6 text-center",
              plan.highlighted && "border-[#92003b] ring-2 ring-[#92003b]/20"
            )}
          >
            {plan.highlighted && (
              <div className="bg-[#92003b] text-white text-xs px-2 py-1 rounded-full inline-block mb-4">
                POPULAR
              </div>
            )}
            <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold mb-4">
              {plan.price}
              <span className="text-base font-normal text-gray-600">
                {plan.period}
              </span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature: string, featureIndex: number) => (
                <li key={featureIndex} className="text-sm text-gray-600">
                  ✓ {feature}
                </li>
              ))}
            </ul>
            <button
              className={cn(
                "w-full py-2 px-4 rounded font-medium",
                plan.highlighted
                  ? "bg-[#92003b] text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              )}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

PriceTableWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          type="text"
          value={element.content?.title || "Pricing Plans"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, title: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Subtitle</label>
        <input
          type="text"
          value={
            element.content?.subtitle ||
            "Choose the perfect plan for your needs"
          }
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, subtitle: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Columns</label>
        <select
          value={element.props?.columns || 3}
          onChange={(e) =>
            onUpdate(element.id, {
              props: {
                ...element.props,
                columns: parseInt(e.target.value) || 3,
              },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.showFeaturedPlan !== false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, showFeaturedPlan: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show featured plan highlight</span>
        </label>
      </div>
    </div>
  );
};

// Theme Widgets

// Site Logo Widget (Theme)
export const SiteLogoWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const logoUrl = element.content?.logoUrl || "";
  const siteTitle = element.content?.siteTitle || "My Website";

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
      <div className="flex items-center space-x-3">
        {logoUrl ? (
          <img src={logoUrl} alt={siteTitle} className="h-8 w-auto" />
        ) : (
          <div className="h-8 w-8 bg-[#92003b] rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {siteTitle.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <span className="font-semibold text-lg">{siteTitle}</span>
      </div>
    </div>
  );
};

SiteLogoWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        onUpdate(element.id, {
          content: { ...element.content, logoUrl: url },
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Site Title</label>
        <input
          type="text"
          value={element.content?.siteTitle || "My Website"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, siteTitle: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Logo Image</label>
        {element.content?.logoUrl ? (
          <div className="space-y-2">
            <img
              src={element.content.logoUrl}
              alt="Logo preview"
              className="h-16 w-auto border rounded"
            />
            <button
              onClick={() =>
                onUpdate(element.id, {
                  content: { ...element.content, logoUrl: "" },
                })
              }
              className="text-red-500 text-sm"
            >
              Remove Logo
            </button>
          </div>
        ) : (
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              id={`logo-upload-${element.id}`}
            />
            <label
              htmlFor={`logo-upload-${element.id}`}
              className="bg-[#92003b] text-white px-3 py-2 rounded text-sm cursor-pointer inline-block"
            >
              Upload Logo
            </label>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Logo Size</label>
        <select
          value={element.props?.logoSize || "medium"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, logoSize: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="small">Small (24px)</option>
          <option value="medium">Medium (32px)</option>
          <option value="large">Large (48px)</option>
        </select>
      </div>
    </div>
  );
};

// Breadcrumbs Widget (Theme)
export const BreadcrumbsWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const breadcrumbs = element.content?.breadcrumbs || [
    { label: "Home", url: "/" },
    { label: "Products", url: "/products" },
    { label: "Current Page", url: "", active: true },
  ];

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
      <nav className="flex items-center space-x-2 text-sm">
        {breadcrumbs.map((crumb: any, index: number) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400">/</span>}
            {crumb.active ? (
              <span className="text-gray-600 font-medium">{crumb.label}</span>
            ) : (
              <a href={crumb.url} className="text-[#92003b] hover:underline">
                {crumb.label}
              </a>
            )}
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};

BreadcrumbsWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Separator</label>
        <input
          type="text"
          value={element.props?.separator || "/"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, separator: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
          placeholder="e.g., /, >, →"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Home Label</label>
        <input
          type="text"
          value={element.props?.homeLabel || "Home"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, homeLabel: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.showCurrentPage !== false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, showCurrentPage: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show current page</span>
        </label>
      </div>
    </div>
  );
};

// WooCommerce Widgets

// Product Grid Widget (WooCommerce)
export const ProductGridWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const products = element.content?.products || [
    {
      id: 1,
      name: "Sample Product 1",
      price: "$29.99",
      image: "",
      description: "This is a sample product description",
      onSale: false,
      salePrice: "",
    },
    {
      id: 2,
      name: "Sample Product 2",
      price: "$49.99",
      image: "",
      description: "Another sample product",
      onSale: true,
      salePrice: "$39.99",
    },
    {
      id: 3,
      name: "Sample Product 3",
      price: "$19.99",
      image: "",
      description: "Third sample product",
      onSale: false,
      salePrice: "",
    },
  ];

  const columns = element.props?.columns || 3;

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
      <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
        {products.map((product: any) => (
          <div key={product.id} className="border rounded-lg overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-2"></div>
                  <span className="text-sm">Product Image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  {product.onSale ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-[#92003b]">
                        {product.salePrice}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {product.price}
                      </span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-[#92003b]">
                      {product.price}
                    </span>
                  )}
                </div>
                <button className="bg-[#92003b] text-white px-3 py-1 rounded text-sm hover:bg-[#b8004a]">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ProductGridWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Columns</label>
        <select
          value={element.props?.columns || 3}
          onChange={(e) =>
            onUpdate(element.id, {
              props: {
                ...element.props,
                columns: parseInt(e.target.value) || 3,
              },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value={1}>1 Column</option>
          <option value={2}>2 Columns</option>
          <option value={3}>3 Columns</option>
          <option value={4}>4 Columns</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Products to Show
        </label>
        <input
          type="number"
          min="1"
          max="20"
          value={element.props?.productCount || 6}
          onChange={(e) =>
            onUpdate(element.id, {
              props: {
                ...element.props,
                productCount: parseInt(e.target.value) || 6,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.showSaleBadge !== false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, showSaleBadge: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show sale badges</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.showAddToCart !== false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, showAddToCart: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show "Add to Cart" buttons</span>
        </label>
      </div>
    </div>
  );
};
