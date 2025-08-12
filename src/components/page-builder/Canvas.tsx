"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { PageElement } from "./PageBuilder";
import { DeviceType } from "./TopToolbar";
import { widgetRegistry } from "./WidgetRegistry";
import { EditHandles } from "./EditHandles";
import { cn } from "../../lib/utils";
import { Copy, Trash2, Settings, GripVertical, Plus } from "lucide-react";

export interface CanvasProps {
  elements: PageElement[];
  selectedElement: PageElement | null;
  onElementSelect: (element: PageElement | null) => void;
  onElementUpdate: (updatedElement: PageElement) => void;
  onElementAdd: (newElements: PageElement[], actionDescription: string) => void;
  selectedDevice: DeviceType;
  isPreviewMode: boolean;
  onDeviceChange: (device: DeviceType) => void;
  gridConfig?: {
    size: number;
    color: string;
    enabled: boolean;
  } | null;
  containerWidth?: number; // Optional, defaults to 1200px
}

interface DropZone {
  elementId: string;
  position: "before" | "after" | "inside";
}

interface ResizeHandle {
  elementId: string;
  type: "width" | "height" | "both";
  position:
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-right"
    | "bottom-right"
    | "bottom-left"
    | "top-left";
}

export function Canvas({
  elements,
  selectedElement,
  onElementSelect,
  onElementUpdate,
  onElementAdd,
  selectedDevice,
  isPreviewMode,
  onDeviceChange,
  gridConfig,
  containerWidth = 1200,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  // Local state
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [pageElements, setPageElements] = useState<PageElement[]>(elements);
  const [dragOverElement, setDragOverElement] = useState<string | null>(null);
  const [dropZone, setDropZone] = useState<DropZone | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    element: PageElement;
  } | null>(null);
  const [resizingElement, setResizingElement] = useState<ResizeHandle | null>(
    null
  );
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({
    width: 0,
    height: 0,
  });

  // Helper to safely access children
  const getChildren = (element: PageElement): PageElement[] =>
    element.children || [];

  // Sync with parent elements
  useEffect(() => {
    setPageElements(elements);
  }, [elements]);

  // Canvas-level DnD handlers
  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);

    // Identify nearest element under cursor to compute drop zone
    const target = e.target as HTMLElement;
    const el = target.closest("[data-element-id]");
    if (el) {
      const elementId = el.getAttribute("data-element-id");
      const rect = el.getBoundingClientRect();
      const y = e.clientY - rect.top;

      let position: "before" | "after" | "inside" = "inside";
      if (y < rect.height * 0.25) position = "before";
      else if (y > rect.height * 0.75) position = "after";

      setDropZone({ elementId: elementId!, position });
      setDragOverElement(elementId!);
    }
  }, []);

  const handleCanvasDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    setDropZone(null);
    setDragOverElement(null);
  }, []);

  // Reorder elements (used when dragging an existing element)
  const handleElementReorder = (
    sourceElementId: string,
    targetElementId?: string,
    position?: "before" | "after" | "inside"
  ) => {
    if (!targetElementId || !position) {
      // Move to root
      const moveToRoot = (arr: PageElement[]): PageElement[] => {
        const newElements: PageElement[] = [];
        let source: PageElement | null = null;

        const filtered = arr.filter((el) => {
          if (el.id === sourceElementId) {
            source = el;
            return false;
          }
          if (getChildren(el).length > 0) el.children = moveToRoot(el.children);
          return true;
        });

        if (source) newElements.push(...filtered, source);
        else newElements.push(...filtered);
        return newElements;
      };

      const updated = moveToRoot(pageElements);
      setPageElements(updated);
      onElementAdd(updated, "Move element to root");
      return;
    }

    // Find element helper
    const findElement = (
      arr: PageElement[],
      id: string
    ): PageElement | null => {
      for (const el of arr) {
        if (el.id === id) return el;
        if (getChildren(el).length > 0) {
          const found = findElement(el.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const source = findElement(pageElements, sourceElementId);
    const target = findElement(pageElements, targetElementId);
    if (!source || !target) return;

    const removeSource = (arr: PageElement[]): PageElement[] =>
      arr.filter((el) => {
        if (el.id === sourceElementId) return false;
        if (getChildren(el).length > 0) el.children = removeSource(el.children);
        return true;
      });

    const addToPosition = (arr: PageElement[]): PageElement[] =>
      arr
        .map((el) => {
          if (el.id === targetElementId) {
            if (position === "inside") {
              return { ...el, children: [...getChildren(el), source] };
            } else if (position === "before") {
              return [source, el];
            } else {
              return [el, source];
            }
          }
          if (getChildren(el).length > 0) {
            return { ...el, children: addToPosition(getChildren(el)) };
          }
          return el;
        })
        .flat();

    let updated = removeSource(pageElements);
    updated = addToPosition(updated);
    setPageElements(updated);
    onElementAdd(updated, `Move ${source.type} ${position} ${target.type}`);
  };

  // Canvas drop for new widgets or reordering
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      setDropZone(null);
      setDragOverElement(null);

      const widgetType = e.dataTransfer.getData("widgetType");
      const widgetName = e.dataTransfer.getData("widgetName");
      const widgetData = e.dataTransfer.getData("widgetData");
      const sourceElementId = e.dataTransfer.getData("sourceElementId");

      if (sourceElementId) {
        // Reordering
        handleElementReorder(
          sourceElementId,
          dropZone?.elementId,
          dropZone?.position
        );
        return;
      }

      if (widgetType && widgetData) {
        const widget = JSON.parse(widgetData);
        let newElement: PageElement;

        if (widget.type === "section") {
          newElement = {
            id: `section-${Date.now()}`,
            type: "section",
            children: [
              {
                id: `column-${Date.now()}-1`,
                type: "column",
                children: [],
                content: {},
                styles: widget.defaultStyles,
                props: { width: 12 },
              },
            ],
            content: widget.defaultContent,
            styles: widget.defaultStyles,
            props: widget.defaultProps,
          };
        } else if (widget.type === "column") {
          newElement = {
            id: `column-${Date.now()}`,
            type: "column",
            children: [],
            content: widget.defaultContent,
            styles: widget.defaultStyles,
            props: { ...widget.defaultProps, width: 6 },
          };
        } else if (widget.type === "flex-container") {
          newElement = {
            id: `flex-container-${Date.now()}`,
            type: "flex-container",
            children: [],
            content: widget.defaultContent,
            styles: widget.defaultStyles,
            props: widget.defaultProps,
          };
        } else {
          newElement = {
            id: `widget-${Date.now()}`,
            type: "widget",
            widgetType: widget.type,
            children: [],
            content: widget.defaultContent,
            styles: widget.defaultStyles,
            props: widget.defaultProps,
          };
        }

        if (dropZone) {
          // Inside target
          const addInside = (arr: PageElement[]): PageElement[] =>
            arr.map((el) => {
              if (el.id === dropZone.elementId) {
                if (dropZone.position === "inside") {
                  return { ...el, children: [...getChildren(el), newElement] };
                }
                // before/after handled below
                return el;
              }
              if (getChildren(el).length > 0) {
                return { ...el, children: addInside(getChildren(el)) };
              }
              return el;
            });

          if (dropZone.position === "before" || dropZone.position === "after") {
            const addBeforeAfter = (arr: PageElement[]): PageElement[] => {
              const result: PageElement[] = [];
              for (const el of arr) {
                if (el.id === dropZone.elementId) {
                  if (dropZone.position === "before") result.push(newElement);
                  result.push(el);
                  if (dropZone.position === "after") result.push(newElement);
                } else {
                  result.push({
                    ...el,
                    children: addBeforeAfter(getChildren(el)),
                  });
                }
              }
              return result;
            };

            setPageElements((prev) => {
              const next = addBeforeAfter(prev);
              onElementAdd(
                next,
                `Add ${widgetName} ${dropZone.position} ${dropZone.elementId}`
              );
              return next;
            });
          } else {
            setPageElements((prev) => {
              const next = addInside(prev);
              onElementAdd(
                next,
                `Add ${widgetName} inside ${dropZone.elementId}`
              );
              return next;
            });
          }
        } else {
          // Add to root
          setPageElements((prev) => {
            const next = [...prev, newElement];
            onElementAdd(next, `Add ${widgetName}`);
            return next;
          });
        }
      }
    },
    [dropZone, onElementAdd, handleElementReorder]
  );

  // Context menu
  const handleContextMenu = (e: React.MouseEvent, element: PageElement) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, element });
  };
  const closeContextMenu = () => setContextMenu(null);

  // Duplicate and delete
  const duplicateElement = (element: PageElement) => {
    const duplicateRecursive = (el: PageElement): PageElement => ({
      ...el,
      id: `${el.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      children: getChildren(el).map(duplicateRecursive),
    });

    const duplicated = duplicateRecursive(element);

    const addToParent = (arr: PageElement[]): PageElement[] =>
      arr.map((el) => {
        if (el.id === element.id) {
          return { ...el, children: [...getChildren(el), duplicated] };
        }
        if (getChildren(el).length > 0) {
          return { ...el, children: addToParent(getChildren(el)) };
        }
        return el;
      });

    setPageElements((prev) => {
      const next = addToParent(prev);
      onElementAdd(next, `Duplicate ${element.type}`);
      return next;
    });
    closeContextMenu();
  };

  const deleteElement = (element: PageElement) => {
    const removeFromParent = (arr: PageElement[]): PageElement[] =>
      arr.filter((el) => {
        if (el.id === element.id) return false;
        if (getChildren(el).length > 0)
          el.children = removeFromParent(el.children);
        return true;
      });

    setPageElements((prev) => {
      const next = removeFromParent(prev);
      onElementAdd(next, `Delete ${element.type}`);
      return next;
    });
    closeContextMenu();
  };

  // Add element (from EditHandles)
  const handleAddElement = (
    parentElement: PageElement,
    widgetType: string,
    position: "before" | "after" | "inside"
  ) => {
    const def = widgetRegistry.get(widgetType);
    if (!def) return;

    let newElement: PageElement;
    if (widgetType === "section") {
      newElement = {
        id: `section-${Date.now()}`,
        type: "section",
        children: [
          {
            id: `column-${Date.now()}-1`,
            type: "column",
            children: [],
            content: {},
            styles: def.defaultStyles,
            props: { width: 12 },
          },
        ],
        content: def.defaultContent,
        styles: def.defaultStyles,
        props: def.defaultProps,
      };
    } else if (widgetType === "column") {
      newElement = {
        id: `column-${Date.now()}`,
        type: "column",
        children: [],
        content: def.defaultContent,
        styles: def.defaultStyles,
        props: { ...def.defaultProps, width: 6 },
      };
    } else if (widgetType === "flex-container") {
      newElement = {
        id: `flex-container-${Date.now()}`,
        type: "flex-container",
        children: [],
        content: def.defaultContent,
        styles: def.defaultStyles,
        props: def.defaultProps,
      };
    } else {
      newElement = {
        id: `widget-${Date.now()}`,
        type: "widget",
        widgetType,
        children: [],
        content: def.defaultContent,
        styles: def.defaultStyles,
        props: def.defaultProps,
      };
    }

    const addToPosition = (arr: PageElement[]): PageElement[] =>
      arr.map((el) => {
        if (el.id === parentElement.id) {
          if (position === "inside") {
            return { ...el, children: [...getChildren(el), newElement] };
          }
          return el; // before/after handled below
        }
        if (getChildren(el).length > 0) {
          return { ...el, children: addToPosition(getChildren(el)) };
        }
        return el;
      });

    if (position === "before" || position === "after") {
      const addBeforeAfter = (arr: PageElement[]): PageElement[] => {
        const result: PageElement[] = [];
        for (const el of arr) {
          if (el.id === parentElement.id) {
            if (position === "before") result.push(newElement);
            result.push(el);
            if (position === "after") result.push(newElement);
          } else {
            result.push({ ...el, children: addBeforeAfter(getChildren(el)) });
          }
        }
        return result;
      };

      setPageElements((prev) => {
        const next = addBeforeAfter(prev);
        onElementAdd(next, `Add ${def.name} ${position} ${parentElement.type}`);
        return next;
      });
    } else {
      setPageElements((prev) => {
        const next = addToPosition(prev);
        onElementAdd(next, `Add ${def.name} inside ${parentElement.type}`);
        return next;
      });
    }
  };

  // Device helpers
  const getDeviceContainerClasses = () => {
    const base =
      "flex-1 bg-[#f5f5f5] overflow-auto flex items-center justify-center";
    if (isPreviewMode) {
      switch (selectedDevice) {
        case "desktop":
          return `${base} p-8`;
        case "tablet":
          return `${base} p-4`;
        case "mobile":
          return `${base} p-2`;
        default:
          return base;
      }
    }
    return base;
  };

  const getDeviceFrameClasses = () => {
    if (!isPreviewMode) return "w-full h-full bg-white min-h-full";
    switch (selectedDevice) {
      case "desktop":
        return "w-full max-w-6xl min-h-[600px] bg-white shadow-2xl rounded-lg overflow-hidden";
      case "tablet":
        return "w-full max-w-2xl min-h-[600px] bg-white shadow-2xl rounded-lg overflow-hidden";
      case "mobile":
        return "w-full max-w-sm min-h-[600px] bg-white shadow-2xl rounded-lg overflow-hidden";
      default:
        return "w-full h-full bg-white";
    }
  };

  const isElementVisible = (element: PageElement) => {
    if (isPreviewMode) {
      const hideOnDesktop = element.props?.hideDesktop;
      const hideOnTablet = element.props?.hideTablet;
      const hideOnMobile = element.props?.hideMobile;
      switch (selectedDevice) {
        case "desktop":
          return !hideOnDesktop;
        case "tablet":
          return !hideOnTablet;
        case "mobile":
          return !hideOnMobile;
        default:
          return true;
      }
    }
    return true;
  };

  // Render a single element
  const renderElement = (
    element: PageElement,
    depth: number = 0
  ): React.ReactNode => {
    const isSelected = selectedElement?.id === element.id;
    const widgetDefinition = widgetRegistry.get(
      element.widgetType || element.type
    );

    if (!isElementVisible(element)) return null;

    // DnD handlers for element
    const onElementDragStart = (e: React.DragEvent) => {
      e.dataTransfer.setData("sourceElementId", element.id);
      e.dataTransfer.setData("elementType", element.type);
    };
    const onElementDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverElement(element.id);
      e.dataTransfer.setData("targetElementId", element.id);
    };
    const onElementDragLeave = () => setDragOverElement(null);
    const onElementDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverElement(null);
      const sourceElementId = e.dataTransfer.getData("sourceElementId");
      if (sourceElementId && sourceElementId !== element.id) {
        const removeFromParent = (arr: PageElement[]): PageElement[] =>
          arr.filter((el) => {
            if (el.id === sourceElementId) return false;
            if (getChildren(el).length > 0)
              el.children = removeFromParent(el.children);
            return true;
          });

        const addToElement = (arr: PageElement[]): PageElement[] =>
          arr.map((el) => {
            if (el.id === element.id) {
              const findSource = (list: PageElement[]): PageElement | null => {
                for (const s of list) {
                  if (s.id === sourceElementId) return s;
                  if (getChildren(s).length > 0) {
                    const found = findSource(s.children);
                    if (found) return found;
                  }
                }
                return null;
              };
              const source = findSource(pageElements);
              if (source)
                return { ...el, children: [...getChildren(el), source] };
            }
            if (getChildren(el).length > 0) {
              return { ...el, children: addToElement(getChildren(el)) };
            }
            return el;
          });

        let updated = removeFromParent(pageElements);
        updated = addToElement(updated);
        setPageElements(updated);
        onElementAdd(updated, `Move element to ${element.type}`);
      }
    };

    // Widget content with fallback
    const WidgetComponent = widgetDefinition?.component;
    const widgetContent = WidgetComponent ? (
      <WidgetComponent
        element={element}
        isSelected={isSelected}
        onSelect={onElementSelect}
        onUpdate={onElementUpdate}
        isPreviewMode={isPreviewMode}
      />
    ) : (
      <div className="text-gray-500 text-sm">
        Unknown widget type: {element.widgetType || element.type}
      </div>
    );

    // Children block
    const childrenBlock =
      Array.isArray(element.children) && element.children.length > 0 ? (
        <div className="mt-2 space-y-2">
          {element.children.map((child) => (
            <React.Fragment key={child.id}>
              {renderElement(child, depth + 1)}
            </React.Fragment>
          ))}
        </div>
      ) : null;

    if (!isPreviewMode) {
      return (
        <div
          key={element.id}
          data-element-id={element.id}
          draggable={!isPreviewMode}
          onDragStart={onElementDragStart}
          onDragOver={onElementDragOver}
          onDragLeave={onElementDragLeave}
          onDrop={onElementDrop}
          onContextMenu={(e) => handleContextMenu(e, element)}
          className={cn(
            "relative",
            dragOverElement === element.id &&
              "ring-2 ring-[#92003b] bg-[#92003b]/10"
          )}
        >
          <EditHandles
            element={element}
            isSelected={isSelected}
            onSelect={onElementSelect}
            onUpdate={onElementUpdate}
            onDuplicate={duplicateElement}
            onDelete={deleteElement}
            onAddElement={handleAddElement}
            isPreviewMode={isPreviewMode}
            selectedDevice={selectedDevice}
            onDeviceChange={onDeviceChange}
            gridConfig={gridConfig}
            containerWidth={containerWidth}
          >
            {widgetContent}
            {childrenBlock}
          </EditHandles>
        </div>
      );
    }

    // Preview mode (no EditHandles)
    return (
      <div key={element.id} data-element-id={element.id} className="relative">
        {widgetContent}
        {childrenBlock}
      </div>
    );
  };

  // Main render
  return (
    <div className="h-full flex flex-col">
      {/* Canvas Toolbar */}
      {!isPreviewMode && (
        <div className="bg-white border-b p-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {pageElements.length} elements
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-gray-100 rounded"
              title="Grid Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              className="p-2 hover:bg-gray-100 rounded"
              title="Snap to Grid"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div
        ref={canvasRef}
        className={getDeviceContainerClasses()}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleDrop}
      >
        <div className={getDeviceFrameClasses()}>
          {isDraggingOver && !dragOverElement && (
            <div className="absolute inset-0 bg-[#92003b]/10 border-2 border-dashed border-[#92003b] rounded-lg flex items-center justify-center">
              <div className="text-[#92003b] font-medium">Drop widget here</div>
            </div>
          )}

          {pageElements.length > 0 ? (
            <div className="p-4 space-y-4">
              {pageElements.map((element) => (
                <React.Fragment key={element.id}>
                  {renderElement(element)}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Plus className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-600 mb-2">
                    Start Building Your Page
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Drag widgets from the left panel to get started
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
            onClick={() => {
              duplicateElement(contextMenu.element);
              closeContextMenu();
            }}
          >
            <Copy className="w-4 h-4" />
            <span>Duplicate</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2"
            onClick={() => {
              deleteElement(contextMenu.element);
              closeContextMenu();
            }}
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Click outside to close context menu */}
      {contextMenu && (
        <div className="fixed inset-0 z-40" onClick={closeContextMenu} />
      )}
    </div>
  );
}
