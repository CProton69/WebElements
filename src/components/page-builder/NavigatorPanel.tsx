"use client";

import { useState } from "react";
import { PageElement } from "./PageBuilder1";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
  Section,
  Layout,
  Type,
  Image,
  Square,
  Hash,
  FileText,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";

interface NavigatorPanelProps {
  elements: PageElement[];
  selectedElement: PageElement | null;
  onElementSelect: (element: PageElement) => void;
  onElementReorder?: (
    elementId: string,
    newParentId: string | null,
    index: number
  ) => void;
}

interface NavigatorItemProps {
  element: PageElement;
  level: number;
  isSelected: boolean;
  onSelect: (element: PageElement) => void;
  isExpanded: boolean;
  onToggleExpand: (elementId: string) => void;
}

function getElementIcon(element: PageElement) {
  switch (element.type) {
    case "section":
      return <Section className="w-4 h-4" />;
    case "column":
      return <Layout className="w-4 h-4" />;
    case "widget":
      switch (element.widgetType) {
        case "heading":
          return <Hash className="w-4 h-4" />;
        case "text":
          return <FileText className="w-4 h-4" />;
        case "image":
          return <Image className="w-4 h-4" alt="" />;
        case "button":
          return <Square className="w-4 h-4" />;
        default:
          return <Type className="w-4 h-4" />;
      }
    default:
      return <Type className="w-4 h-4" />;
  }
}

function getElementName(element: PageElement) {
  if (element.type === "section") {
    return "Section";
  } else if (element.type === "column") {
    return `Column (${element.props?.width || 12}/12)`;
  } else if (element.type === "widget") {
    if (element.widgetType === "heading") {
      return `Heading: ${
        element.content?.text?.substring(0, 20) || "Untitled"
      }${element.content?.text?.length > 20 ? "..." : ""}`;
    } else if (element.widgetType === "text") {
      return `Text: ${element.content?.text?.substring(0, 20) || "Untitled"}${
        element.content?.text?.length > 20 ? "..." : ""
      }`;
    } else if (element.widgetType === "button") {
      return `Button: ${element.content?.text || "Untitled"}`;
    } else if (element.widgetType === "image") {
      return `Image: ${element.content?.alt || "Untitled"}`;
    }
    return `${
      element.widgetType?.charAt(0).toUpperCase() +
        (element.widgetType?.slice(1) || "") || "Widget"
    }`;
  }
  return "Element";
}

function getVisibilityBadges(
  element: PageElement
): Array<{ icon: React.ReactNode; label: string }> {
  const badges: Array<{ icon: React.ReactNode; label: string }> = [];

  if (element.props?.hideDesktop)
    badges.push({ icon: <Monitor className="w-3 h-3" />, label: "Desktop" });
  if (element.props?.hideTablet)
    badges.push({ icon: <Tablet className="w-3 h-3" />, label: "Tablet" });
  if (element.props?.hideMobile)
    badges.push({ icon: <Smartphone className="w-3 h-3" />, label: "Mobile" });

  return badges;
}

function NavigatorItem({
  element,
  level,
  isSelected,
  onSelect,
  isExpanded,
  onToggleExpand,
}: NavigatorItemProps) {
  const hasChildren = element.children && element.children.length > 0;
  const visibilityBadges = getVisibilityBadges(element);

  return (
    <div className="w-full">
      <div
        className={`flex items-center gap-2 w-full p-2 rounded-md cursor-pointer transition-colors hover:bg-accent/50 ${
          isSelected ? "bg-accent text-accent-foreground" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(element)}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="w-4 h-4 p-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand(element.id);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>
        )}

        {!hasChildren && <div className="w-4" />}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getElementIcon(element)}
          <span className="text-sm truncate flex-1">
            {getElementName(element)}
          </span>
        </div>

        {visibilityBadges.length > 0 && (
          <div className="flex gap-1">
            {visibilityBadges.slice(0, 2).map((badge, index) => (
              <div
                key={index}
                className="w-4 h-4 bg-muted rounded flex items-center justify-center"
                title={`Hidden on ${badge.label}`}
              >
                {badge.icon}
              </div>
            ))}
            {visibilityBadges.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                +{visibilityBadges.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {element.children.map((child) => (
            <NavigatorItem
              key={child.id}
              element={child}
              level={level + 1}
              isSelected={isSelected}
              onSelect={onSelect}
              isExpanded={isExpanded}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function NavigatorPanel({
  elements,
  selectedElement,
  onElementSelect,
  onElementReorder,
}: NavigatorPanelProps) {
  const [expandedElements, setExpandedElements] = useState<Set<string>>(
    new Set()
  );

  const toggleExpand = (elementId: string) => {
    setExpandedElements((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(elementId)) {
        newSet.delete(elementId);
      } else {
        newSet.add(elementId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    const getAllElementIds = (elements: PageElement[]): string[] => {
      return elements.reduce((ids, element) => {
        ids.push(element.id);
        if (element.children && element.children.length > 0) {
          ids.push(...getAllElementIds(element.children));
        }
        return ids;
      }, [] as string[]);
    };

    setExpandedElements(new Set(getAllElementIds(elements)));
  };

  const collapseAll = () => {
    setExpandedElements(new Set());
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Navigator</span>
          <Badge variant="secondary" className="text-xs">
            {elements.length}
          </Badge>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={expandAll}
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={collapseAll}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Tree View */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {elements.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                <Layout className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No elements yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add elements to see the page structure
              </p>
            </div>
          ) : (
            elements.map((element) => (
              <NavigatorItem
                key={element.id}
                element={element}
                level={0}
                isSelected={selectedElement?.id === element.id}
                onSelect={onElementSelect}
                isExpanded={expandedElements.has(element.id)}
                onToggleExpand={toggleExpand}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer with legend */}
      <div className="border-t p-3 bg-muted/20">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              <Tablet className="w-3 h-3" />
              <Smartphone className="w-3 h-3" />
            </div>
            <span>Hidden on devices</span>
          </div>
          <div className="flex items-center gap-2">
            <Section className="w-3 h-3" />
            <span>Section</span>
          </div>
          <div className="flex items-center gap-2">
            <Layout className="w-3 h-3" />
            <span>Column</span>
          </div>
          <div className="flex items-center gap-2">
            <Type className="w-3 h-3" />
            <span>Widget</span>
          </div>
        </div>
      </div>
    </div>
  );
}
