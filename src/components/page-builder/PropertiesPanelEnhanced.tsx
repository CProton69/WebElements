"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PageElement } from "./PageBuilder1";
import { DeviceType } from "./TopToolbar";
import { widgetRegistry } from "./WidgetRegistry";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Type,
  Palette,
  Layout,
  Settings,
  Link,
  Image as ImageIcon,
  Video,
  Code,
  Eye,
  EyeOff,
  Move,
  RotateCcw,
  Copy,
  Trash2,
  MoreHorizontal,
  GripVertical,
  Maximize,
  Minimize,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertiesPanelProps {
  selectedElement: PageElement | null;
  onElementUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  selectedDevice: DeviceType;
}

// Debounce utility function
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export function PropertiesPanelEnhanced({
  selectedElement,
  onElementUpdate,
  selectedDevice,
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState("content");
  const [widgetDefinition, setWidgetDefinition] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{
    type: string;
    value: any;
  } | null>(null);

  // Memoize element data to prevent unnecessary re-renders
  const elementData = useMemo(() => {
    if (!selectedElement) return null;
    return {
      id: selectedElement.id,
      type: selectedElement.type,
      widgetType: selectedElement.widgetType,
      content: selectedElement.content,
      styles: selectedElement.styles,
      props: selectedElement.props,
    };
  }, [selectedElement]);

  useEffect(() => {
    if (selectedElement) {
      const widget = widgetRegistry.get(
        selectedElement.widgetType || selectedElement.type
      );
      setWidgetDefinition(widget);
    } else {
      setWidgetDefinition(null);
    }
  }, [selectedElement]);

  // Enhanced update functions with immediate feedback and debouncing
  const updateContent = useCallback(
    (path: string, value: any, immediate = false) => {
      if (!selectedElement) return;

      setIsUpdating(true);
      setLastUpdate({ type: "content", value });

      const newContent = { ...selectedElement.content };
      const keys = path.split(".");
      let current = newContent;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      // Show feedback for important changes
      if (path === "text" && typeof value === "string" && value.length > 0) {
        toast.success("Text updated", { duration: 1000 });
      }

      // Immediate update without delay
      onElementUpdate(selectedElement.id, { content: newContent });

      // Reset updating state after a short delay
      setTimeout(() => {
        setIsUpdating(false);
        setLastUpdate(null);
      }, 200);
    },
    [selectedElement, onElementUpdate]
  );

  const updateStyles = useCallback(
    (path: string, value: any, immediate = false) => {
      if (!selectedElement) return;

      setIsUpdating(true);
      setLastUpdate({ type: "styles", value });

      const newStyles = { ...selectedElement.styles };
      const keys = path.split(".");
      let current = newStyles;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      // Show feedback for visual changes
      if (
        path.includes("color") ||
        path.includes("background") ||
        path.includes("fontSize")
      ) {
        toast.success("Style updated", { duration: 1000 });
      }

      // Immediate update without delay
      onElementUpdate(selectedElement.id, { styles: newStyles });

      // Reset updating state after a short delay
      setTimeout(() => {
        setIsUpdating(false);
        setLastUpdate(null);
      }, 200);
    },
    [selectedElement, onElementUpdate]
  );

  const updateProps = useCallback(
    (path: string, value: any, immediate = false) => {
      if (!selectedElement) return;

      setIsUpdating(true);
      setLastUpdate({ type: "props", value });

      const newProps = { ...selectedElement.props };
      const keys = path.split(".");
      let current = newProps;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;

      // Immediate update without delay
      onElementUpdate(selectedElement.id, { props: newProps });

      // Reset updating state after a short delay
      setTimeout(() => {
        setIsUpdating(false);
        setLastUpdate(null);
      }, 200);
    },
    [selectedElement, onElementUpdate]
  );

  // Enhanced input handlers with real-time validation and immediate updates
  const handleInputChange = useCallback(
    (
      updater: (path: string, value: any, immediate?: boolean) => void,
      path: string,
      validate?: (value: string) => string | null
    ) => {
      return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;

        if (validate) {
          const error = validate(value);
          if (error) {
            toast.error(error, { duration: 2000 });
            return;
          }
        }

        // Immediate update for better responsiveness
        updater(path, value, true);
      };
    },
    []
  );

  const handleSelectChange = useCallback(
    (
      updater: (path: string, value: any, immediate?: boolean) => void,
      path: string
    ) => {
      return (value: string) => {
        // Immediate update for better responsiveness
        updater(path, value, true);
      };
    },
    []
  );

  const handleSliderChange = useCallback(
    (
      updater: (path: string, value: any, immediate?: boolean) => void,
      path: string
    ) => {
      return (value: number[]) => {
        // Immediate update for better responsiveness
        updater(path, value[0], true);
      };
    },
    []
  );

  const duplicateElement = useCallback(() => {
    if (!selectedElement) return;
    toast.success("Element duplicated", { duration: 2000 });
    console.log("Duplicate element:", selectedElement.id);
  }, [selectedElement]);

  const deleteElement = useCallback(() => {
    if (!selectedElement) return;
    toast.success("Element deleted", { duration: 2000 });
    console.log("Delete element:", selectedElement.id);
  }, [selectedElement]);

  if (!selectedElement) {
    return (
      <div className="h-full flex flex-col bg-[#2c3e50] text-white">
        <div className="p-4 border-b border-[#34495e]">
          <h2 className="text-lg font-semibold flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Properties
          </h2>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#34495e] rounded-lg flex items-center justify-center">
              <Move className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-400 mb-2">No element selected</p>
            <p className="text-sm text-gray-500">
              Select an element to edit its properties
            </p>
          </div>
        </div>
      </div>
    );
  }

  const WidgetPropertiesPanel = widgetDefinition?.propertiesPanel;

  return (
    <div
      data-properties-panel
      className="h-full flex flex-col bg-[#2c3e50] text-white"
    >
      {/* Header with enhanced feedback */}
      <div className="p-4 border-b border-[#34495e]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Properties
              {isUpdating && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </h2>
            {lastUpdate && <Check className="w-4 h-4 text-green-400" />}
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-[#34495e]"
              onClick={duplicateElement}
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-400 hover:bg-[#34495e]"
              onClick={deleteElement}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="border-[#4a5568] text-gray-300">
            {widgetDefinition?.name || selectedElement.type}
          </Badge>
          <Badge variant="outline" className="border-[#4a5568] text-gray-300">
            ID: {selectedElement.id.slice(-8)}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#34495e]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#34495e]">
            <TabsTrigger
              value="content"
              className="data-[state=active]:bg-[#92003b] data-[state=active]:text-white text-xs"
            >
              <Type className="w-4 h-4 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger
              value="style"
              className="data-[state=active]:bg-[#92003b] data-[state=active]:text-white text-xs"
            >
              <Palette className="w-4 h-4 mr-1" />
              Style
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="data-[state=active]:bg-[#92003b] data-[state=active]:text-white text-xs"
            >
              <Settings className="w-4 h-4 mr-1" />
              Advanced
            </TabsTrigger>
            <TabsTrigger
              value="responsive"
              className="data-[state=active]:bg-[#92003b] data-[state=active]:text-white text-xs"
            >
              <Layout className="w-4 h-4 mr-1" />
              Responsive
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 overflow-y-auto webeditor-scrollbar">
        <div className="p-4 min-h-0">
          {activeTab === "content" && WidgetPropertiesPanel && (
            <WidgetPropertiesPanel
              element={selectedElement}
              onUpdate={onElementUpdate}
              selectedDevice={selectedDevice}
            />
          )}

          {activeTab === "style" && (
            <div className="space-y-6">
              {/* Typography */}
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Type className="w-4 h-4 mr-2" />
                    Typography
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Font Family</Label>
                    <Select
                      value={selectedElement.styles?.fontFamily || "Inter"}
                      onValueChange={handleSelectChange(
                        updateStyles,
                        "fontFamily"
                      )}
                    >
                      <SelectTrigger className="bg-[#2c3e50] border-[#4a5568] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c3e50] border-[#4a5568]">
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Font Size</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        value={selectedElement.styles?.fontSize || "16px"}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty value during typing
                          if (value === "") {
                            updateStyles("fontSize", "16px", true);
                            return;
                          }
                          // Validate format
                          if (/^\d+(px|rem|em|%)?$/.test(value)) {
                            // If no unit, add px
                            const finalValue = /^\d+$/.test(value)
                              ? `${value}px`
                              : value;
                            updateStyles("fontSize", finalValue, true);
                          }
                        }}
                        onBlur={(e) => {
                          // Final validation on blur
                          const value = e.target.value;
                          if (!value) {
                            updateStyles("fontSize", "16px", true);
                            return;
                          }
                          if (!/^\d+(px|rem|em|%)$/.test(value)) {
                            toast.error(
                              "Please enter a valid size (e.g., 16px, 1.2rem, 1.5em, 100%)",
                              { duration: 2000 }
                            );
                            updateStyles("fontSize", "16px", true);
                          }
                        }}
                        className="bg-[#2c3e50] border-[#4a5568] text-white"
                        placeholder="e.g., 16px"
                      />
                      <Select
                        value={
                          selectedElement.styles?.fontSize?.includes("px")
                            ? "px"
                            : selectedElement.styles?.fontSize?.includes("rem")
                            ? "rem"
                            : selectedElement.styles?.fontSize?.includes("em")
                            ? "em"
                            : "px"
                        }
                        onValueChange={(unit) => {
                          const currentValue =
                            selectedElement.styles?.fontSize || "16";
                          const numericValue = parseFloat(currentValue) || 16;
                          updateStyles(
                            "fontSize",
                            `${numericValue}${unit}`,
                            true
                          );
                        }}
                      >
                        <SelectTrigger className="w-20 bg-[#2c3e50] border-[#4a5568] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2c3e50] border-[#4a5568]">
                          <SelectItem value="px">px</SelectItem>
                          <SelectItem value="rem">rem</SelectItem>
                          <SelectItem value="em">em</SelectItem>
                          <SelectItem value="%">%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Font Weight</Label>
                    <Select
                      value={selectedElement.styles?.fontWeight || "400"}
                      onValueChange={handleSelectChange(
                        updateStyles,
                        "fontWeight"
                      )}
                    >
                      <SelectTrigger className="bg-[#2c3e50] border-[#4a5568] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c3e50] border-[#4a5568]">
                        <SelectItem value="100">Thin (100)</SelectItem>
                        <SelectItem value="300">Light (300)</SelectItem>
                        <SelectItem value="400">Regular (400)</SelectItem>
                        <SelectItem value="500">Medium (500)</SelectItem>
                        <SelectItem value="600">Semi Bold (600)</SelectItem>
                        <SelectItem value="700">Bold (700)</SelectItem>
                        <SelectItem value="800">Extra Bold (800)</SelectItem>
                        <SelectItem value="900">Black (900)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Text Alignment</Label>
                    <Select
                      value={selectedElement.styles?.textAlign || "left"}
                      onValueChange={(value) => {
                        updateStyles("textAlign", value, true);
                        // Additional alignment adjustments for better visual feedback
                        if (value === "center") {
                          // Also update margin for center alignment
                          const currentStyles = selectedElement.styles || {};
                          const updatedStyles = {
                            ...currentStyles,
                            textAlign: value,
                            marginLeft: "auto",
                            marginRight: "auto",
                          };
                          onElementUpdate(selectedElement.id, {
                            styles: updatedStyles,
                          });
                        } else if (value === "right") {
                          // Adjust for right alignment
                          const currentStyles = selectedElement.styles || {};
                          const updatedStyles = {
                            ...currentStyles,
                            textAlign: value,
                            marginLeft: "auto",
                            marginRight: "0",
                          };
                          onElementUpdate(selectedElement.id, {
                            styles: updatedStyles,
                          });
                        } else {
                          // Reset margins for left alignment
                          const currentStyles = selectedElement.styles || {};
                          const updatedStyles = {
                            ...currentStyles,
                            textAlign: value,
                            marginLeft: "0",
                            marginRight: "0",
                          };
                          onElementUpdate(selectedElement.id, {
                            styles: updatedStyles,
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-[#2c3e50] border-[#4a5568] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c3e50] border-[#4a5568]">
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="justify">Justify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Line Height</Label>
                    <Input
                      type="text"
                      value={selectedElement.styles?.lineHeight || "1.6"}
                      onChange={handleInputChange(
                        updateStyles,
                        "lineHeight",
                        (value) => {
                          if (!value) return "Line height cannot be empty";
                          if (isNaN(parseFloat(value))) {
                            return "Please enter a valid number";
                          }
                          return null;
                        }
                      )}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                      placeholder="e.g., 1.6"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Letter Spacing</Label>
                    <Input
                      type="text"
                      value={selectedElement.styles?.letterSpacing || "0"}
                      onChange={handleInputChange(
                        updateStyles,
                        "letterSpacing",
                        (value) => {
                          if (!value) return "Letter spacing cannot be empty";
                          if (!/^-?\d+(px|rem|em)?$/.test(value)) {
                            return "Please enter a valid spacing (e.g., 0, 2px, 0.1em)";
                          }
                          return null;
                        }
                      )}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                      placeholder="e.g., 0, 2px, 0.1em"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Text Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={selectedElement.styles?.color || "#1f2937"}
                        onChange={(e) =>
                          updateStyles("color", e.target.value, true)
                        }
                        className="w-12 h-8 p-1 bg-[#2c3e50] border-[#4a5568]"
                      />
                      <Input
                        type="text"
                        value={selectedElement.styles?.color || "#1f2937"}
                        onChange={handleInputChange(
                          updateStyles,
                          "color",
                          (value) => {
                            if (!value) return "Color cannot be empty";
                            if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                              return "Please enter a valid hex color (e.g., #1f2937)";
                            }
                            return null;
                          }
                        )}
                        className="flex-1 bg-[#2c3e50] border-[#4a5568] text-white"
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Background */}
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Palette className="w-4 h-4 mr-2" />
                    Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Background Type</Label>
                    <Select
                      value={selectedElement.styles?.backgroundType || "solid"}
                      onValueChange={handleSelectChange(
                        updateStyles,
                        "backgroundType"
                      )}
                    >
                      <SelectTrigger className="bg-[#2c3e50] border-[#4a5568] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c3e50] border-[#4a5568]">
                        <SelectItem value="solid">Solid Color</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(selectedElement.styles?.backgroundType === "solid" ||
                    !selectedElement.styles?.backgroundType) && (
                    <div>
                      <Label className="text-gray-300">Background Color</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={
                            selectedElement.styles?.backgroundColor || "#ffffff"
                          }
                          onChange={(e) =>
                            updateStyles(
                              "backgroundColor",
                              e.target.value,
                              true
                            )
                          }
                          className="w-12 h-8 p-1 bg-[#2c3e50] border-[#4a5568]"
                        />
                        <Input
                          type="text"
                          value={
                            selectedElement.styles?.backgroundColor || "#ffffff"
                          }
                          onChange={handleInputChange(
                            updateStyles,
                            "backgroundColor",
                            (value) => {
                              if (!value)
                                return "Background color cannot be empty";
                              if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                                return "Please enter a valid hex color (e.g., #ffffff)";
                              }
                              return null;
                            }
                          )}
                          className="flex-1 bg-[#2c3e50] border-[#4a5568] text-white"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Spacing */}
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Layout className="w-4 h-4 mr-2" />
                    Spacing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Padding</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {["top", "right", "bottom", "left"].map((side) => (
                        <Input
                          key={side}
                          type="text"
                          value={
                            selectedElement.styles?.[
                              `padding${
                                side.charAt(0).toUpperCase() + side.slice(1)
                              }`
                            ] || "0"
                          }
                          onChange={handleInputChange(
                            updateStyles,
                            `padding${
                              side.charAt(0).toUpperCase() + side.slice(1)
                            }`,
                            (value) => {
                              if (!value) return "Padding cannot be empty";
                              if (!/^\d+(px|rem|em|%)$/.test(value)) {
                                return "Please enter a valid padding (e.g., 20px, 1rem, 2em, 5%)";
                              }
                              return null;
                            }
                          )}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                          placeholder={side.charAt(0).toUpperCase()}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Margin</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {["top", "right", "bottom", "left"].map((side) => (
                        <Input
                          key={side}
                          type="text"
                          value={
                            selectedElement.styles?.[
                              `margin${
                                side.charAt(0).toUpperCase() + side.slice(1)
                              }`
                            ] || "0"
                          }
                          onChange={handleInputChange(
                            updateStyles,
                            `margin${
                              side.charAt(0).toUpperCase() + side.slice(1)
                            }`,
                            (value) => {
                              if (!value) return "Margin cannot be empty";
                              if (!/^\d+(px|rem|em|%)$/.test(value)) {
                                return "Please enter a valid margin (e.g., 20px, 1rem, 2em, 5%)";
                              }
                              return null;
                            }
                          )}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                          placeholder={side.charAt(0).toUpperCase()}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-6">
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Custom CSS Classes</Label>
                    <Input
                      type="text"
                      value={selectedElement.props?.className || ""}
                      onChange={handleInputChange(updateProps, "className")}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                      placeholder="custom-class-1 another-class"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Custom ID</Label>
                    <Input
                      type="text"
                      value={selectedElement.props?.id || ""}
                      onChange={handleInputChange(
                        updateProps,
                        "id",
                        (value) => {
                          if (
                            value &&
                            !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(value)
                          ) {
                            return "ID must start with a letter and contain only letters, numbers, hyphens, and underscores";
                          }
                          return null;
                        }
                      )}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                      placeholder="custom-element-id"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Z-Index</Label>
                    <Input
                      type="number"
                      value={selectedElement.styles?.zIndex || ""}
                      onChange={handleInputChange(
                        updateStyles,
                        "zIndex",
                        (value) => {
                          if (
                            value &&
                            (isNaN(parseInt(value)) || parseInt(value) < 0)
                          ) {
                            return "Z-index must be a positive number";
                          }
                          return null;
                        }
                      )}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                      placeholder="1"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "responsive" && (
            <div className="space-y-6">
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Layout className="w-4 h-4 mr-2" />
                    Responsive Settings ({selectedDevice})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">
                      Hide on {selectedDevice}
                    </Label>
                    <Switch
                      checked={
                        selectedElement.styles?.[
                          `hideOn${
                            selectedDevice.charAt(0).toUpperCase() +
                            selectedDevice.slice(1)
                          }`
                        ] || false
                      }
                      onCheckedChange={(checked) =>
                        updateStyles(
                          `hideOn${
                            selectedDevice.charAt(0).toUpperCase() +
                            selectedDevice.slice(1)
                          }`,
                          checked,
                          true
                        )
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">
                      Device-specific Font Size
                    </Label>
                    <Input
                      type="text"
                      value={
                        selectedElement.styles?.[`${selectedDevice}FontSize`] ||
                        ""
                      }
                      onChange={handleInputChange(
                        updateStyles,
                        `${selectedDevice}FontSize`,
                        (value) => {
                          if (value && !/^\d+(px|rem|em|%)$/.test(value)) {
                            return "Please enter a valid size (e.g., 14px, 1rem, 1.2em, 90%)";
                          }
                          return null;
                        }
                      )}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                      placeholder={`Override font size for ${selectedDevice}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
