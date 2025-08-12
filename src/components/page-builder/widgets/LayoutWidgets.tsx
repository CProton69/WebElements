import React from "react";
import { PageElement } from "../PageBuilder1";
import {
  WidgetComponentProps,
  WidgetPropertiesPanelProps,
} from "../WidgetRegistry";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  Settings,
  Layout,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  MoveVertical,
  MoveHorizontal,
} from "lucide-react";

// Section Widget
export const SectionWidget: React.FC<WidgetComponentProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
  renderChild,
}) => {
  const handleAddColumn = () => {
    const newColumn: PageElement = {
      id: `column-${Date.now()}`,
      type: "column",
      children: [],
      content: {},
      styles: {},
      props: { width: 6 },
    };

    onUpdate(element.id, {
      children: [...element.children, newColumn],
    });
  };

  return (
    <section
      className={cn(
        "relative min-h-[100px] transition-all w-full",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      <div className="grid grid-cols-12 gap-4 min-h-[50px] w-full">
        {element.children && element.children.length > 0 ? (
          element.children.map((child, index) => (
            <div
              key={child.id}
              className="col-span-12"
              style={{
                gridColumn: `span ${child.props?.width || 12}`,
                padding: child.styles?.padding || "20px",
              }}
            >
              {/* Render child using renderChild function */}
              {renderChild && renderChild({ element: child, depth: 1 })}
            </div>
          ))
        ) : (
          <div className="col-span-12 flex items-center justify-center border-2 border-dashed border-[#92003b]/30 rounded-lg p-8 text-gray-500">
            <div className="text-center">
              <p className="mb-2">No columns in section</p>
              <button
                className="bg-[#92003b] text-white px-3 py-1 rounded text-sm hover:bg-[#b8004a] transition-colors"
                onClick={handleAddColumn}
              >
                Add Column
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

SectionWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: WidgetPropertiesPanelProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Background Type
        </label>
        <select
          value={element.props?.backgroundType || "classic"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, backgroundType: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="classic">Classic</option>
          <option value="gradient">Gradient</option>
          <option value="video">Video</option>
          <option value="slideshow">Slideshow</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Background Color
        </label>
        <input
          type="color"
          value={element.styles?.backgroundColor || "#ffffff"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, backgroundColor: e.target.value },
            })
          }
          className="w-full p-1 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Padding</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Top"
            value={element.styles?.paddingTop || "60px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingTop: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Bottom"
            value={element.styles?.paddingBottom || "60px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingBottom: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Left"
            value={element.styles?.paddingLeft || "20px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingLeft: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Right"
            value={element.styles?.paddingRight || "20px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingRight: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Margin</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Top"
            value={element.styles?.marginTop || "0"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, marginTop: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Bottom"
            value={element.styles?.marginBottom || "0"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, marginBottom: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.fullWidth || true}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, fullWidth: e.target.checked },
              })
            }
          />
          <span className="text-sm">Full Width</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.stretchSection || true}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, stretchSection: e.target.checked },
              })
            }
          />
          <span className="text-sm">Stretch Section</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Min Height</label>
        <input
          type="text"
          value={element.styles?.minHeight || "100px"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, minHeight: e.target.value },
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

// Column Widget
export const ColumnWidget: React.FC<WidgetComponentProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
  renderChild,
}) => {
  return (
    <div
      className={cn(
        "relative min-h-[50px] transition-all w-full",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={{
        ...element.styles,
        gridColumn: `span ${element.props?.width || 12}`,
      }}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      <div className="h-full w-full">
        {element.children && element.children.length > 0 ? (
          element.children.map((child) => (
            <div key={child.id} className="mb-4">
              {/* Render child using renderChild function */}
              {renderChild && renderChild({ element: child, depth: 2 })}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full w-full border-2 border-dashed border-[#92003b]/30 rounded-lg p-4 text-gray-500 text-sm">
            Drop widgets here
          </div>
        )}
      </div>
    </div>
  );
};

ColumnWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: WidgetPropertiesPanelProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Column Width</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="1"
            max="12"
            value={element.props?.width || 6}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, width: parseInt(e.target.value) },
              })
            }
            className="flex-1"
          />
          <span className="text-sm font-medium w-12 text-center">
            {element.props?.width || 6}/12
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Column Gap</label>
        <input
          type="text"
          value={element.props?.gap || 20}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, gap: parseInt(e.target.value) },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Padding</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Top"
            value={element.styles?.paddingTop || "20px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingTop: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Bottom"
            value={element.styles?.paddingBottom || "20px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingBottom: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Left"
            value={element.styles?.paddingLeft || "20px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingLeft: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Right"
            value={element.styles?.paddingRight || "20px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingRight: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Background Color
        </label>
        <input
          type="color"
          value={element.styles?.backgroundColor || "transparent"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, backgroundColor: e.target.value },
            })
          }
          className="w-full p-1 border rounded"
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
        <label className="block text-sm font-medium mb-2">Border</label>
        <input
          type="text"
          value={element.styles?.border || "none"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, border: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Vertical Alignment
        </label>
        <select
          value={element.styles?.alignItems || "stretch"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, alignItems: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="stretch">Stretch</option>
          <option value="flex-start">Top</option>
          <option value="center">Center</option>
          <option value="flex-end">Bottom</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Horizontal Alignment
        </label>
        <select
          value={element.styles?.justifyContent || "flex-start"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, justifyContent: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="flex-start">Left</option>
          <option value="center">Center</option>
          <option value="flex-end">Right</option>
          <option value="space-between">Space Between</option>
          <option value="space-around">Space Around</option>
        </select>
      </div>
    </div>
  );
};

// Container Widget
export const ContainerWidget: React.FC<WidgetComponentProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
  renderChild,
}) => {
  const [isResizing, setIsResizing] = React.useState(false);
  const [resizeStart, setResizeStart] = React.useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = React.useState({
    width: 0,
    height: 0,
  });

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({ x: e.clientX, y: e.clientY });
    setResizeStartSize({
      width: parseInt(element.styles?.width || "100%"),
      height: parseInt(element.styles?.height || "auto"),
    });
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;

    const newWidth = Math.max(100, resizeStartSize.width + deltaX);
    const newHeight = Math.max(50, resizeStartSize.height + deltaY);

    onUpdate(element.id, {
      styles: {
        ...element.styles,
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      },
    });
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleResize);
      document.addEventListener("mouseup", handleResizeEnd);
      return () => {
        document.removeEventListener("mousemove", handleResize);
        document.removeEventListener("mouseup", handleResizeEnd);
      };
    }
  }, [isResizing]);

  return (
    <div
      className={cn(
        "relative min-h-[50px] transition-all",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {!isPreviewMode && isSelected && (
        <>
          <div className="absolute -top-2 -left-2 bg-[#92003b] text-white text-xs px-2 py-1 rounded z-10">
            Container
          </div>

          {/* Resize handles */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-[#92003b] rounded-tl"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
        </>
      )}

      <div className="h-full w-full">
        {element.children && element.children.length > 0 ? (
          element.children.map((child) => (
            <div key={child.id} className="mb-4">
              {/* Render child using renderChild function */}
              {renderChild && renderChild({ element: child, depth: 1 })}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full w-full border-2 border-dashed border-[#92003b]/30 rounded-lg p-4 text-gray-500 text-sm">
            Drop widgets here
          </div>
        )}
      </div>
    </div>
  );
};

ContainerWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: WidgetPropertiesPanelProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Layout Type</label>
        <select
          value={element.props?.layout || "block"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, layout: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="block">Block</option>
          <option value="flex">Flex</option>
          <option value="grid">Grid</option>
        </select>
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
          value={element.styles?.height || "auto"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, height: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Padding</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Top"
            value={element.styles?.paddingTop || "20px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingTop: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Bottom"
            value={element.styles?.paddingBottom || "20px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingBottom: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Left"
            value={element.styles?.paddingLeft || "20px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingLeft: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Right"
            value={element.styles?.paddingRight || "20px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingRight: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Margin</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Top"
            value={element.styles?.marginTop || "0"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, marginTop: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Bottom"
            value={element.styles?.marginBottom || "0"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, marginBottom: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Left"
            value={element.styles?.marginLeft || "0"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, marginLeft: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Right"
            value={element.styles?.marginRight || "0"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, marginRight: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Background Color
        </label>
        <input
          type="color"
          value={element.styles?.backgroundColor || "#f9fafb"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, backgroundColor: e.target.value },
            })
          }
          className="w-full p-1 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Border</label>
        <input
          type="text"
          value={element.styles?.border || "1px solid #e5e7eb"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, border: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Border Radius</label>
        <input
          type="text"
          value={element.styles?.borderRadius || "8px"}
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
          value={element.styles?.boxShadow || "0 4px 6px rgba(0, 0, 0, 0.1)"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, boxShadow: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      {element.props?.layout === "flex" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              Flex Direction
            </label>
            <select
              value={element.styles?.flexDirection || "row"}
              onChange={(e) =>
                onUpdate(element.id, {
                  styles: { ...element.styles, flexDirection: e.target.value },
                })
              }
              className="w-full p-2 border rounded"
            >
              <option value="row">Row</option>
              <option value="column">Column</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column-reverse">Column Reverse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Flex Wrap</label>
            <select
              value={element.styles?.flexWrap || "nowrap"}
              onChange={(e) =>
                onUpdate(element.id, {
                  styles: { ...element.styles, flexWrap: e.target.value },
                })
              }
              className="w-full p-2 border rounded"
            >
              <option value="nowrap">No Wrap</option>
              <option value="wrap">Wrap</option>
              <option value="wrap-reverse">Wrap Reverse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Justify Content
            </label>
            <select
              value={element.styles?.justifyContent || "flex-start"}
              onChange={(e) =>
                onUpdate(element.id, {
                  styles: { ...element.styles, justifyContent: e.target.value },
                })
              }
              className="w-full p-2 border rounded"
            >
              <option value="flex-start">Start</option>
              <option value="center">Center</option>
              <option value="flex-end">End</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Align Items
            </label>
            <select
              value={element.styles?.alignItems || "stretch"}
              onChange={(e) =>
                onUpdate(element.id, {
                  styles: { ...element.styles, alignItems: e.target.value },
                })
              }
              className="w-full p-2 border rounded"
            >
              <option value="stretch">Stretch</option>
              <option value="flex-start">Start</option>
              <option value="center">Center</option>
              <option value="flex-end">End</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>
        </>
      )}

      {element.props?.layout === "grid" && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">
              Grid Columns
            </label>
            <input
              type="text"
              value={
                element.styles?.gridTemplateColumns ||
                "repeat(auto-fit, minmax(250px, 1fr))"
              }
              onChange={(e) =>
                onUpdate(element.id, {
                  styles: {
                    ...element.styles,
                    gridTemplateColumns: e.target.value,
                  },
                })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Grid Rows</label>
            <input
              type="text"
              value={element.styles?.gridTemplateRows || "auto"}
              onChange={(e) =>
                onUpdate(element.id, {
                  styles: {
                    ...element.styles,
                    gridTemplateRows: e.target.value,
                  },
                })
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Grid Gap</label>
            <input
              type="text"
              value={element.styles?.gap || "16px"}
              onChange={(e) =>
                onUpdate(element.id, {
                  styles: { ...element.styles, gap: e.target.value },
                })
              }
              className="w-full p-2 border rounded"
            />
          </div>
        </>
      )}
    </div>
  );
};

// Flex Container Widget
export const FlexContainerWidget: React.FC<WidgetComponentProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
  selectedDevice = "desktop",
  renderChild,
}) => {
  const getFlexStyles = React.useMemo(() => {
    const baseStyles = {
      display: "flex",
      flexDirection: element.props?.flexDirection || "row",
      flexWrap: element.props?.flexWrap || "nowrap",
      justifyContent: element.props?.justifyContent || "flex-start",
      alignItems: element.props?.alignItems || "stretch",
      alignContent: element.props?.alignContent || "stretch",
      gap: element.props?.gap || "0px",
      ...element.styles,
    };

    // Apply responsive styles
    if (selectedDevice !== "desktop") {
      const responsiveProps = element.props?.responsive?.[selectedDevice];
      if (responsiveProps) {
        Object.assign(baseStyles, {
          flexDirection:
            responsiveProps.flexDirection || baseStyles.flexDirection,
          flexWrap: responsiveProps.flexWrap || baseStyles.flexWrap,
          justifyContent:
            responsiveProps.justifyContent || baseStyles.justifyContent,
          alignItems: responsiveProps.alignItems || baseStyles.alignItems,
          alignContent: responsiveProps.alignContent || baseStyles.alignContent,
          gap: responsiveProps.gap || baseStyles.gap,
        });
      }
    }

    return baseStyles;
  }, [element.props, element.styles, selectedDevice]);

  const handleAddWidget = () => {
    // Select the container so the user can use the toolbar to add widgets
    onSelect(element);
  };

  return (
    <div
      className={cn(
        "relative min-h-[100px] transition-all w-full",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={getFlexStyles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {!isPreviewMode && isSelected && (
        <>
          <div className="absolute -top-2 -left-2 bg-[#92003b] text-white text-xs px-2 py-1 rounded z-10 flex items-center gap-1">
            <Layout className="w-3 h-3" />
            Flex Container
          </div>

          <div className="absolute -top-2 -right-2 flex gap-1 z-10">
            <button
              className="w-6 h-6 bg-[#92003b] text-white rounded text-xs hover:bg-[#b8004a] transition-colors"
              onClick={handleAddWidget}
              title="Add Widget"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </>
      )}

      <div className="flex-1 min-w-0 w-full">
        {element.children && element.children.length > 0 ? (
          element.children.map((child, index) => (
            <div key={child.id} className="flex-shrink-0">
              {/* Render child using renderChild function */}
              {renderChild && renderChild({ element: child, depth: 1 })}
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center w-full h-full border-2 border-dashed border-[#92003b]/30 rounded-lg p-8 text-gray-500">
            <div className="text-center">
              <Layout className="w-8 h-8 mx-auto mb-2 text-[#92003b]" />
              <p className="mb-2">Flex Container</p>
              <p className="text-xs mb-2">
                Drag widgets here or use the + button
              </p>
              <button
                className="bg-[#92003b] text-white px-3 py-1 rounded text-sm hover:bg-[#b8004a] transition-colors"
                onClick={handleAddWidget}
              >
                Add Widget
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Flex Container Properties Panel
const FlexContainerPropertiesPanel: React.FC<WidgetPropertiesPanelProps> = ({
  element,
  onUpdate,
  selectedDevice,
}) => {
  const currentProps =
    selectedDevice === "desktop"
      ? element.props
      : {
          ...element.props,
          ...(element.props?.responsive?.[selectedDevice] || {}),
        };

  const updateProp = (key: string, value: any) => {
    if (selectedDevice === "desktop") {
      onUpdate(element.id, {
        props: { ...element.props, [key]: value },
      });
    } else {
      const responsive = {
        ...(element.props?.responsive || {}),
        [selectedDevice]: {
          ...(element.props?.responsive?.[selectedDevice] || {}),
          [key]: value,
        },
      };
      onUpdate(element.id, {
        props: { ...element.props, responsive },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Device Indicator */}
      {selectedDevice !== "desktop" && (
        <div className="p-2 bg-blue-50 text-blue-700 rounded text-sm font-medium">
          Editing for:{" "}
          {selectedDevice.charAt(0).toUpperCase() + selectedDevice.slice(1)}
        </div>
      )}

      {/* Flex Direction */}
      <div>
        <label className="block text-sm font-medium mb-2">Flex Direction</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            className={`p-2 border rounded flex items-center justify-center gap-1 text-sm ${
              currentProps?.flexDirection === "row"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("flexDirection", "row")}
          >
            <MoveHorizontal className="w-4 h-4" />
            Row
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center gap-1 text-sm ${
              currentProps?.flexDirection === "column"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("flexDirection", "column")}
          >
            <MoveVertical className="w-4 h-4" />
            Column
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center gap-1 text-sm ${
              currentProps?.flexDirection === "row-reverse"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("flexDirection", "row-reverse")}
          >
            <MoveHorizontal className="w-4 h-4 rotate-180" />
            Row Reverse
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center gap-1 text-sm ${
              currentProps?.flexDirection === "column-reverse"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("flexDirection", "column-reverse")}
          >
            <MoveVertical className="w-4 h-4 rotate-180" />
            Column Reverse
          </button>
        </div>
      </div>

      {/* Flex Wrap */}
      <div>
        <label className="block text-sm font-medium mb-2">Flex Wrap</label>
        <select
          value={currentProps?.flexWrap || "nowrap"}
          onChange={(e) => updateProp("flexWrap", e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="nowrap">No Wrap</option>
          <option value="wrap">Wrap</option>
          <option value="wrap-reverse">Wrap Reverse</option>
        </select>
      </div>

      {/* Justify Content */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Justify Content
        </label>
        <div className="grid grid-cols-3 gap-1">
          <button
            className={`p-2 border rounded flex items-center justify-center text-xs ${
              currentProps?.justifyContent === "flex-start"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("justifyContent", "flex-start")}
            title="Flex Start"
          >
            <AlignLeft className="w-3 h-3" />
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center text-xs ${
              currentProps?.justifyContent === "center"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("justifyContent", "center")}
            title="Center"
          >
            <AlignCenter className="w-3 h-3" />
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center text-xs ${
              currentProps?.justifyContent === "flex-end"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("justifyContent", "flex-end")}
            title="Flex End"
          >
            <AlignRight className="w-3 h-3" />
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center text-xs ${
              currentProps?.justifyContent === "space-between"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("justifyContent", "space-between")}
            title="Space Between"
          >
            <AlignJustify className="w-3 h-3" />
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center text-xs ${
              currentProps?.justifyContent === "space-around"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("justifyContent", "space-around")}
            title="Space Around"
          >
            <AlignJustify className="w-3 h-3 scale-75" />
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center text-xs ${
              currentProps?.justifyContent === "space-evenly"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("justifyContent", "space-evenly")}
            title="Space Evenly"
          >
            <AlignJustify className="w-3 h-3 scale-50" />
          </button>
        </div>
      </div>

      {/* Align Items */}
      <div>
        <label className="block text-sm font-medium mb-2">Align Items</label>
        <div className="grid grid-cols-3 gap-1">
          <button
            className={`p-2 border rounded flex items-center justify-center text-xs ${
              currentProps?.alignItems === "flex-start"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("alignItems", "flex-start")}
            title="Flex Start"
          >
            <AlignLeft className="w-3 h-3 rotate-90" />
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center text-xs ${
              currentProps?.alignItems === "center"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("alignItems", "center")}
            title="Center"
          >
            <AlignCenter className="w-3 h-3 rotate-90" />
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center text-xs ${
              currentProps?.alignItems === "flex-end"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("alignItems", "flex-end")}
            title="Flex End"
          >
            <AlignRight className="w-3 h-3 rotate-90" />
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center text-xs ${
              currentProps?.alignItems === "stretch"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("alignItems", "stretch")}
            title="Stretch"
          >
            <MoveVertical className="w-3 h-3" />
          </button>
          <button
            className={`p-2 border rounded flex items-center justify-center text-xs ${
              currentProps?.alignItems === "baseline"
                ? "bg-[#92003b] text-white border-[#92003b]"
                : "border-gray-300"
            }`}
            onClick={() => updateProp("alignItems", "baseline")}
            title="Baseline"
          >
            <AlignLeft className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Align Content */}
      <div>
        <label className="block text-sm font-medium mb-2">Align Content</label>
        <select
          value={currentProps?.alignContent || "stretch"}
          onChange={(e) => updateProp("alignContent", e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="stretch">Stretch</option>
          <option value="flex-start">Flex Start</option>
          <option value="center">Center</option>
          <option value="flex-end">Flex End</option>
          <option value="space-between">Space Between</option>
          <option value="space-around">Space Around</option>
        </select>
      </div>

      {/* Gap */}
      <div>
        <label className="block text-sm font-medium mb-2">Gap</label>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="50"
            value={parseInt(currentProps?.gap || "0")}
            onChange={(e) => updateProp("gap", `${e.target.value}px`)}
            className="flex-1"
          />
          <input
            type="text"
            value={currentProps?.gap || "0px"}
            onChange={(e) => updateProp("gap", e.target.value)}
            className="w-16 p-1 border rounded text-sm"
            placeholder="0px"
          />
        </div>
      </div>

      {/* Layout Styles */}
      <div>
        <label className="block text-sm font-medium mb-2">Layout Styles</label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={currentProps?.fullWidth || false}
              onChange={(e) => updateProp("fullWidth", e.target.checked)}
            />
            <span className="text-sm">Full Width</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={currentProps?.allowOverflow || false}
              onChange={(e) => updateProp("allowOverflow", e.target.checked)}
            />
            <span className="text-sm">Allow Overflow</span>
          </label>
        </div>
      </div>

      {/* Responsive Settings */}
      {selectedDevice === "desktop" && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Responsive Settings
          </label>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              • Switch to tablet/mobile view to set device-specific properties
            </p>
            <p>
              • Properties set for specific devices will override desktop
              settings
            </p>
          </div>
        </div>
      )}

      {/* Background Color */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Background Color
        </label>
        <input
          type="color"
          value={element.styles?.backgroundColor || "transparent"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, backgroundColor: e.target.value },
            })
          }
          className="w-full p-1 border rounded"
        />
      </div>

      {/* Padding */}
      <div>
        <label className="block text-sm font-medium mb-2">Padding</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Top"
            value={element.styles?.paddingTop || "16px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingTop: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Bottom"
            value={element.styles?.paddingBottom || "16px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingBottom: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Left"
            value={element.styles?.paddingLeft || "16px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingLeft: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Right"
            value={element.styles?.paddingRight || "16px"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, paddingRight: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Margin */}
      <div>
        <label className="block text-sm font-medium mb-2">Margin</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Top"
            value={element.styles?.marginTop || "0"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, marginTop: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Bottom"
            value={element.styles?.marginBottom || "0"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, marginBottom: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Left"
            value={element.styles?.marginLeft || "0"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, marginLeft: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Right"
            value={element.styles?.marginRight || "0"}
            onChange={(e) =>
              onUpdate(element.id, {
                styles: { ...element.styles, marginRight: e.target.value },
              })
            }
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Border Radius */}
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

      {/* Box Shadow */}
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

      {/* Min Height */}
      <div>
        <label className="block text-sm font-medium mb-2">Min Height</label>
        <input
          type="text"
          value={element.styles?.minHeight || "auto"}
          onChange={(e) =>
            onUpdate(element.id, {
              styles: { ...element.styles, minHeight: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
};

// Assign PropertiesPanel to FlexContainerWidget
FlexContainerWidget.PropertiesPanel = FlexContainerPropertiesPanel;
