"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PageElement } from "./PageBuilder1";
import { DeviceType } from "./TopToolbar";
import { widgetRegistry } from "./WidgetRegistry";
import { cn } from "@/lib/utils";
import {
  Move,
  Copy,
  Trash2,
  Settings,
  GripVertical,
  Plus,
  X,
  MoreVertical,
  Monitor,
  Tablet,
  Smartphone,
  Edit3,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  ChevronDown,
} from "lucide-react";

interface EditHandlesProps {
  element: PageElement;
  isSelected: boolean;
  onSelect: (element: PageElement) => void;
  onUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  onDuplicate: (element: PageElement) => void;
  onDelete: (element: PageElement) => void;
  onAddElement: (
    parentElement: PageElement,
    widgetType: string,
    position: "before" | "after" | "inside"
  ) => void;
  isPreviewMode: boolean;
  selectedDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  gridConfig?: {
    snapToGrid: boolean;
    showGrid: boolean;
    columns: number;
    gutterWidth: number;
    rowHeight: number;
  };
  containerWidth?: number;
  children: React.ReactNode;
  className?: string;
}

interface ResizeHandle {
  position:
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-right"
    | "bottom-right"
    | "bottom-left"
    | "top-left";
  type: "width" | "height" | "both";
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
}

interface ResizeState {
  isResizing: boolean;
  handle: ResizeHandle | null;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
}

export function EditHandles({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDuplicate,
  onDelete,
  onAddElement,
  isPreviewMode,
  selectedDevice,
  onDeviceChange,
  gridConfig,
  containerWidth = 1200,
  children,
  className,
}: EditHandlesProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showActionToolbar, setShowActionToolbar] = useState(false);
  const [showFormatToolbar, setShowFormatToolbar] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [widgetSelectorPosition, setWidgetSelectorPosition] = useState<
    "before" | "after" | "inside"
  >("before");
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    elementStartX: 0,
    elementStartY: 0,
  });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    handle: null,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Grid snapping helper functions
  const snapToGrid = (value: number, gridSize: number) => {
    if (!gridConfig?.snapToGrid) return value;
    return Math.round(value / gridSize) * gridSize;
  };

  const snapPosition = (x: number, y: number) => {
    if (!gridConfig?.snapToGrid) return { x, y };

    const { columns, gutterWidth, rowHeight } = gridConfig;
    const totalGutterWidth = (columns - 1) * gutterWidth;
    const columnWidth = (containerWidth - totalGutterWidth) / columns;
    const columnGridSize = columnWidth + gutterWidth;

    return {
      x: snapToGrid(x, columnGridSize),
      y: snapToGrid(y, rowHeight),
    };
  };

  const snapSize = (width: number, height: number) => {
    if (!gridConfig?.snapToGrid) return { width, height };

    const { columns, gutterWidth, rowHeight } = gridConfig;
    const totalGutterWidth = (columns - 1) * gutterWidth;
    const columnWidth = (containerWidth - totalGutterWidth) / columns;
    const columnGridSize = columnWidth + gutterWidth;

    return {
      width: snapToGrid(width, columnGridSize),
      height: snapToGrid(height, rowHeight),
    };
  };

  // Check if element is resizable
  const isResizable =
    element.type === "section" ||
    element.type === "column" ||
    element.type === "flex-container";

  // Check if element has text content for formatting toolbar
  const hasTextContent =
    element.widgetType &&
    ["heading", "text", "button"].includes(element.widgetType);

  // Handle mouse enter/leave
  const handleMouseEnter = useCallback(() => {
    if (!isPreviewMode) {
      setIsHovered(true);
    }
  }, [isPreviewMode]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (!isSelected) {
      setShowActionToolbar(false);
      setShowFormatToolbar(false);
    }
  }, [isSelected]);

  // Close widget selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showWidgetSelector) {
        setShowWidgetSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showWidgetSelector]);

  // Render widget icon
  const renderWidgetIcon = (iconName: string) => {
    const iconMap: Record<string, string> = {
      Heading: "H",
      Type: "T",
      Square: "□",
      Image: "🖼️",
      Video: "🎬",
      Minus: "―",
      Star: "⭐",
      Space: "␣",
      Code: "</>",
      Layout: "⊞",
      Columns: "||",
      Box: "☐",
      FileText: "📄",
      Input: "📝",
      MessageSquare: "💬",
      ChevronDown: "▼",
      CheckSquare: "☑️",
      Circle: "○",
      Tabs: "📑",
      ToggleLeft: "🔘",
      BarChart: "📊",
      Hash: "#",
      Share2: "🔗",
      Images: "🖼️",
      Slideshow: "🎞️",
      Alert: "⚠️",
      Badge: "🏷️",
    };

    return iconMap[iconName] || iconName.charAt(0);
  };

  // Handle element selection
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isPreviewMode) {
        onSelect(element);
        setShowActionToolbar(true);
      }
    },
    [element, onSelect, isPreviewMode]
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (isPreviewMode || !elementRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = elementRef.current.getBoundingClientRect();
      setDragState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        elementStartX: rect.left,
        elementStartY: rect.top,
      });

      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    },
    [isPreviewMode]
  );

  // Handle drag move
  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !elementRef.current) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      // Calculate new position with grid snapping
      const newX = dragState.elementStartX + deltaX;
      const newY = dragState.elementStartY + deltaY;
      const snappedPos = snapPosition(newX, newY);

      // Update element position (this would need to be implemented in the parent)
      // For now, we'll just update the visual position
      elementRef.current.style.transform = `translate(${snappedPos.x}px, ${snappedPos.y}px)`;
    },
    [dragState, snapPosition]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return;

    setDragState((prev) => ({ ...prev, isDragging: false }));
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    // Reset transform and update actual position in parent
    if (elementRef.current) {
      elementRef.current.style.transform = "";
    }
  }, [dragState.isDragging]);

  // Handle resize start
  const handleResizeStart = useCallback(
    (handle: ResizeHandle, e: React.MouseEvent) => {
      if (isPreviewMode || !elementRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      const rect = elementRef.current.getBoundingClientRect();
      setResizeState({
        isResizing: true,
        handle,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: rect.width,
        startHeight: rect.height,
      });

      document.body.style.cursor = `${handle}-resize`;
      document.body.style.userSelect = "none";
    },
    [isPreviewMode]
  );

  // Handle resize move
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizeState.isResizing || !resizeState.handle || !elementRef.current)
        return;

      const deltaX = e.clientX - resizeState.startX;
      const deltaY = e.clientY - resizeState.startY;
      let newWidth = resizeState.startWidth;
      let newHeight = resizeState.startHeight;

      switch (resizeState.handle) {
        case "right":
        case "left":
          newWidth = Math.max(
            50,
            resizeState.startWidth +
              (resizeState.handle === "right" ? deltaX : -deltaX)
          );
          break;
        case "bottom":
        case "top":
          newHeight = Math.max(
            50,
            resizeState.startHeight +
              (resizeState.handle === "bottom" ? deltaY : -deltaY)
          );
          break;
        case "top-right":
        case "bottom-right":
        case "bottom-left":
        case "top-left":
          newWidth = Math.max(
            50,
            resizeState.startWidth +
              (resizeState.handle.includes("right") ? deltaX : -deltaX)
          );
          newHeight = Math.max(
            50,
            resizeState.startHeight +
              (resizeState.handle.includes("bottom") ? deltaY : -deltaY)
          );
          break;
      }

      // Apply grid snapping
      const snappedSize = snapSize(newWidth, newHeight);

      // Update element size
      elementRef.current.style.width = `${snappedSize.width}px`;
      elementRef.current.style.height = `${snappedSize.height}px`;
    },
    [resizeState, snapSize]
  );

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (!resizeState.isResizing) return;

    setResizeState((prev) => ({ ...prev, isResizing: false, handle: null }));
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    // Update actual element styles in parent
    if (elementRef.current) {
      const newStyles = {
        ...element.styles,
        width: elementRef.current.style.width,
        height: elementRef.current.style.height,
      };
      onUpdate(element.id, { styles: newStyles });
    }
  }, [resizeState.isResizing, element, onUpdate]);

  // Handle widget selection
  const handleWidgetSelect = useCallback(
    (widgetType: string) => {
      onAddElement(element, widgetType, widgetSelectorPosition);
      setShowWidgetSelector(false);
    },
    [element, widgetSelectorPosition, onAddElement]
  );

  // Handle text formatting
  const handleFormatText = useCallback(
    (format: string) => {
      const currentStyles = element.styles || {};
      let newStyles = { ...currentStyles };

      switch (format) {
        case "bold":
          newStyles.fontWeight =
            currentStyles.fontWeight === "bold" ? "normal" : "bold";
          break;
        case "italic":
          newStyles.fontStyle =
            currentStyles.fontStyle === "italic" ? "normal" : "italic";
          break;
        case "underline":
          newStyles.textDecoration =
            currentStyles.textDecoration === "underline" ? "none" : "underline";
          break;
        case "align-left":
          newStyles.textAlign = "left";
          break;
        case "align-center":
          newStyles.textAlign = "center";
          break;
        case "align-right":
          newStyles.textAlign = "right";
          break;
      }

      onUpdate(element.id, { styles: newStyles });
    },
    [element, onUpdate]
  );

  // Event listeners for drag and resize
  useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
    }

    if (resizeState.isResizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("mousemove", handleResizeMove);
      document.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [
    dragState.isDragging,
    resizeState.isResizing,
    handleDragMove,
    handleDragEnd,
    handleResizeMove,
    handleResizeEnd,
  ]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSelected || isPreviewMode) return;

      switch (e.key) {
        case "Delete":
        case "Backspace":
          if (e.shiftKey) {
            onDelete(element);
          }
          break;
        case "d":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            onDuplicate(element);
          }
          break;
        case "e":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowFormatToolbar((prev) => !prev);
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSelected, isPreviewMode, element, onDelete, onDuplicate]);

  // Render resize handles
  const renderResizeHandles = () => {
    if (!isResizable || !isSelected || isPreviewMode) return null;

    const handles: ResizeHandle[] = [
      { position: "top", type: "height" },
      { position: "right", type: "width" },
      { position: "bottom", type: "height" },
      { position: "left", type: "width" },
      { position: "top-right", type: "both" },
      { position: "bottom-right", type: "both" },
      { position: "bottom-left", type: "both" },
      { position: "top-left", type: "both" },
    ];

    return (
      <>
        {handles.map((handle) => (
          <div
            key={handle.position}
            className={cn(
              "absolute w-3 h-3 bg-[#92003b] border-2 border-white rounded-full cursor-pointer hover:bg-[#b8004a] transition-colors",
              {
                "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize":
                  handle.position === "top",
                "top-1/2 right-0 -translate-y-1/2 translate-x-1/2 cursor-e-resize":
                  handle.position === "right",
                "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize":
                  handle.position === "bottom",
                "top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 cursor-w-resize":
                  handle.position === "left",
                "top-0 right-0 -translate-y-1/2 translate-x-1/2 cursor-ne-resize":
                  handle.position === "top-right",
                "bottom-0 right-0 translate-y-1/2 translate-x-1/2 cursor-se-resize":
                  handle.position === "bottom-right",
                "bottom-0 left-0 translate-y-1/2 -translate-x-1/2 cursor-sw-resize":
                  handle.position === "bottom-left",
                "top-0 left-0 -translate-y-1/2 -translate-x-1/2 cursor-nw-resize":
                  handle.position === "top-left",
              }
            )}
            onMouseDown={(e) => handleResizeStart(handle, e)}
          />
        ))}
      </>
    );
  };

  // Render action toolbar
  const renderActionToolbar = () => {
    if (!isSelected || isPreviewMode) return null;

    return (
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg flex items-center gap-1 p-1 z-50">
        <div className="relative">
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
            onClick={() => {
              setWidgetSelectorPosition("before");
              setShowWidgetSelector(!showWidgetSelector);
            }}
            title="Add Before"
          >
            <Plus className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Widget Selector Dropdown */}
          {showWidgetSelector && widgetSelectorPosition === "before" && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-64 max-h-64 overflow-y-auto z-50">
              <div className="p-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">
                  Add Widget Before
                </h3>
              </div>
              <div className="p-1">
                {widgetRegistry.getAll().map((widget) => (
                  <button
                    key={widget.type}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
                    onClick={() => handleWidgetSelect(widget.type)}
                  >
                    <span className="w-4 h-4 flex items-center justify-center text-xs">
                      {renderWidgetIcon(widget.icon)}
                    </span>
                    <span>{widget.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
            onClick={() => {
              setWidgetSelectorPosition("after");
              setShowWidgetSelector(!showWidgetSelector);
            }}
            title="Add After"
          >
            <Plus className="w-4 h-4 rotate-90" />
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Widget Selector Dropdown */}
          {showWidgetSelector && widgetSelectorPosition === "after" && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-64 max-h-64 overflow-y-auto z-50">
              <div className="p-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">
                  Add Widget After
                </h3>
              </div>
              <div className="p-1">
                {widgetRegistry.getAll().map((widget) => (
                  <button
                    key={widget.type}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
                    onClick={() => handleWidgetSelect(widget.type)}
                  >
                    <span className="w-4 h-4 flex items-center justify-center text-xs">
                      {renderWidgetIcon(widget.icon)}
                    </span>
                    <span>{widget.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Inside button for containers */}
        {["section", "column", "flex-container", "container"].includes(
          element.type
        ) && (
          <div className="relative">
            <button
              className="p-2 hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
              onClick={() => {
                setWidgetSelectorPosition("inside");
                setShowWidgetSelector(!showWidgetSelector);
              }}
              title="Add Inside"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs">Inside</span>
            </button>

            {/* Widget Selector Dropdown */}
            {showWidgetSelector && widgetSelectorPosition === "inside" && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-64 max-h-64 overflow-y-auto z-50">
                <div className="p-2 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">
                    Add Widget Inside {element.type}
                  </h3>
                </div>
                <div className="p-1">
                  {widgetRegistry.getAll().map((widget) => (
                    <button
                      key={widget.type}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
                      onClick={() => handleWidgetSelect(widget.type)}
                    >
                      <span className="w-4 h-4 flex items-center justify-center text-xs">
                        {renderWidgetIcon(widget.icon)}
                      </span>
                      <span>{widget.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="w-px h-6 bg-gray-200" />
        <button
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          onClick={() => setShowFormatToolbar((prev) => !prev)}
          title="Format Text"
        >
          <Type className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          onClick={() => onDuplicate(element)}
          title="Duplicate (Ctrl+D)"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          onClick={() => onDelete(element)}
          title="Delete (Shift+Delete)"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <button
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          onClick={() => {
            // Directly call the onSelect callback to ensure the element is selected
            onSelect(element);
            // Then trigger the properties panel to open
            setTimeout(() => {
              const event = new CustomEvent("open-properties", {
                detail: { element },
              });
              document.dispatchEvent(event);
            }, 100);
          }}
          title="Edit Properties"
        >
          <Settings className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <div className="flex items-center gap-1 bg-gray-50 rounded px-1">
          <button
            className={cn(
              "p-1 rounded transition-colors",
              selectedDevice === "desktop"
                ? "bg-[#92003b] text-white"
                : "hover:bg-gray-200"
            )}
            onClick={() => onDeviceChange("desktop")}
            title="Desktop"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            className={cn(
              "p-1 rounded transition-colors",
              selectedDevice === "tablet"
                ? "bg-[#92003b] text-white"
                : "hover:bg-gray-200"
            )}
            onClick={() => onDeviceChange("tablet")}
            title="Tablet"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            className={cn(
              "p-1 rounded transition-colors",
              selectedDevice === "mobile"
                ? "bg-[#92003b] text-white"
                : "hover:bg-gray-200"
            )}
            onClick={() => onDeviceChange("mobile")}
            title="Mobile"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // Render format toolbar
  const renderFormatToolbar = () => {
    if (!showFormatToolbar || !hasTextContent || isPreviewMode) return null;

    return (
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg flex items-center gap-1 p-1 z-50">
        <button
          className={cn(
            "p-2 hover:bg-gray-100 rounded transition-colors",
            element.styles?.fontWeight === "bold" && "bg-gray-200"
          )}
          onClick={() => handleFormatText("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          className={cn(
            "p-2 hover:bg-gray-100 rounded transition-colors",
            element.styles?.fontStyle === "italic" && "bg-gray-200"
          )}
          onClick={() => handleFormatText("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          className={cn(
            "p-2 hover:bg-gray-100 rounded transition-colors",
            element.styles?.textDecoration === "underline" && "bg-gray-200"
          )}
          onClick={() => handleFormatText("underline")}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <button
          className={cn(
            "p-2 hover:bg-gray-100 rounded transition-colors",
            element.styles?.textAlign === "left" && "bg-gray-200"
          )}
          onClick={() => handleFormatText("align-left")}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          className={cn(
            "p-2 hover:bg-gray-100 rounded transition-colors",
            element.styles?.textAlign === "center" && "bg-gray-200"
          )}
          onClick={() => handleFormatText("align-center")}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          className={cn(
            "p-2 hover:bg-gray-100 rounded transition-colors",
            element.styles?.textAlign === "right" && "bg-gray-200"
          )}
          onClick={() => handleFormatText("align-right")}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  // Render drag handle
  const renderDragHandle = () => {
    if (!isSelected || isPreviewMode) return null;

    return (
      <div
        className="absolute -left-8 top-1/2 -translate-y-1/2 bg-[#92003b] text-white p-2 rounded-l-lg cursor-grab hover:bg-[#b8004a] transition-colors"
        onMouseDown={handleDragStart}
        title="Drag to move (Drag me)"
      >
        <GripVertical className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative group", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={elementRef}
        className={cn(
          "relative transition-all duration-200",
          (isSelected || isHovered) &&
            !isPreviewMode &&
            "ring-2 ring-[#92003b] ring-opacity-50",
          isSelected &&
            !isPreviewMode &&
            "ring-2 ring-[#92003b] bg-[#92003b]/5",
          dragState.isDragging && "ring-2 ring-blue-500 bg-blue-50 shadow-lg",
          resizeState.isResizing && "ring-2 ring-green-500 bg-green-50"
        )}
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-label={`Edit ${element.type} ${element.widgetType || ""}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(element);
          }
        }}
      >
        {children}

        {/* Selection outline */}
        {(isSelected || isHovered) && !isPreviewMode && (
          <div className="absolute inset-0 pointer-events-none border-2 border-[#92003b] border-dashed rounded" />
        )}

        {/* Drag handle */}
        {renderDragHandle()}

        {/* Resize handles */}
        {renderResizeHandles()}

        {/* Action toolbar */}
        {renderActionToolbar()}

        {/* Format toolbar */}
        {renderFormatToolbar()}
      </div>
    </div>
  );
}
