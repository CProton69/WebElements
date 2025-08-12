"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertiesPanelProps {
  selectedElement: PageElement | null;
  onElementUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  selectedDevice: DeviceType;
}

export function PropertiesPanel({
  selectedElement,
  onElementUpdate,
  selectedDevice,
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState("content");
  const [widgetDefinition, setWidgetDefinition] = useState<any>(null);

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

  const updateContent = (path: string, value: any) => {
    if (!selectedElement) return;

    console.log("updateContent called:", path, "=", value);
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

    console.log("Calling onElementUpdate with content:", newContent);
    onElementUpdate(selectedElement.id, { content: newContent });
  };

  const updateStyles = (path: string, value: any) => {
    if (!selectedElement) return;

    console.log("updateStyles called:", path, "=", value);
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

    console.log("Calling onElementUpdate with styles:", newStyles);
    onElementUpdate(selectedElement.id, { styles: newStyles });
  };

  const updateProps = (path: string, value: any) => {
    if (!selectedElement) return;

    console.log("updateProps called:", path, "=", value);
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

    console.log("Calling onElementUpdate with props:", newProps);
    onElementUpdate(selectedElement.id, { props: newProps });
  };

  const duplicateElement = () => {
    if (!selectedElement) return;
    // This would be handled by the parent component
    console.log("Duplicate element:", selectedElement.id);
  };

  const deleteElement = () => {
    if (!selectedElement) return;
    // This would be handled by the parent component
    console.log("Delete element:", selectedElement.id);
  };

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
      {/* Header */}
      <div className="p-4 border-b border-[#34495e]">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Properties
          </h2>

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
                      onValueChange={(value) => {
                        console.log("Font family changed to:", value);
                        updateStyles("fontFamily", value);
                      }}
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
                          console.log("Font size changed to:", e.target.value);
                          updateStyles("fontSize", e.target.value);
                        }}
                        className="bg-[#2c3e50] border-[#4a5568] text-white"
                      />
                      <Select
                        value={
                          selectedElement.styles?.fontSize?.includes("px")
                            ? "px"
                            : "rem"
                        }
                        onValueChange={(unit) => {
                          const currentValue =
                            selectedElement.styles?.fontSize || "16";
                          const numericValue = parseFloat(currentValue);
                          console.log(
                            "Font size unit changed to:",
                            unit,
                            "value:",
                            numericValue
                          );
                          updateStyles("fontSize", `${numericValue}${unit}`);
                        }}
                      >
                        <SelectTrigger className="w-20 bg-[#2c3e50] border-[#4a5568] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#2c3e50] border-[#4a5568]">
                          <SelectItem value="px">px</SelectItem>
                          <SelectItem value="rem">rem</SelectItem>
                          <SelectItem value="em">em</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Font Weight</Label>
                    <Select
                      value={selectedElement.styles?.fontWeight || "400"}
                      onValueChange={(value) => {
                        console.log("Font weight changed to:", value);
                        updateStyles("fontWeight", value);
                      }}
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
                        console.log("Text alignment changed to:", value);
                        updateStyles("textAlign", value);
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
                      onChange={(e) => {
                        console.log("Line height changed to:", e.target.value);
                        updateStyles("lineHeight", e.target.value);
                      }}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Letter Spacing</Label>
                    <Input
                      type="text"
                      value={selectedElement.styles?.letterSpacing || "0"}
                      onChange={(e) => {
                        console.log(
                          "Letter spacing changed to:",
                          e.target.value
                        );
                        updateStyles("letterSpacing", e.target.value);
                      }}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Text Color</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="color"
                        value={selectedElement.styles?.color || "#1f2937"}
                        onChange={(e) => {
                          console.log("Text color changed to:", e.target.value);
                          updateStyles("color", e.target.value);
                        }}
                        className="w-12 h-8 p-1 bg-[#2c3e50] border-[#4a5568]"
                      />
                      <Input
                        type="text"
                        value={selectedElement.styles?.color || "#1f2937"}
                        onChange={(e) => {
                          console.log("Text color changed to:", e.target.value);
                          updateStyles("color", e.target.value);
                        }}
                        className="flex-1 bg-[#2c3e50] border-[#4a5568] text-white"
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
                      onValueChange={(value) => {
                        console.log("Background type changed to:", value);
                        updateStyles("backgroundType", value);
                      }}
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
                          onChange={(e) => {
                            console.log(
                              "Background color changed to:",
                              e.target.value
                            );
                            updateStyles("backgroundColor", e.target.value);
                          }}
                          className="w-12 h-8 p-1 bg-[#2c3e50] border-[#4a5568]"
                        />
                        <Input
                          type="text"
                          value={
                            selectedElement.styles?.backgroundColor || "#ffffff"
                          }
                          onChange={(e) => {
                            console.log(
                              "Background color changed to:",
                              e.target.value
                            );
                            updateStyles("backgroundColor", e.target.value);
                          }}
                          className="flex-1 bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                    </div>
                  )}

                  {selectedElement.styles?.backgroundType === "gradient" && (
                    <>
                      <div>
                        <Label className="text-gray-300">
                          Gradient Start Color
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="color"
                            value={
                              selectedElement.styles?.gradientStart || "#92003b"
                            }
                            onChange={(e) => {
                              console.log(
                                "Gradient start color changed to:",
                                e.target.value
                              );
                              updateStyles("gradientStart", e.target.value);
                            }}
                            className="w-12 h-8 p-1 bg-[#2c3e50] border-[#4a5568]"
                          />
                          <Input
                            type="text"
                            value={
                              selectedElement.styles?.gradientStart || "#92003b"
                            }
                            onChange={(e) => {
                              console.log(
                                "Gradient start color changed to:",
                                e.target.value
                              );
                              updateStyles("gradientStart", e.target.value);
                            }}
                            className="flex-1 bg-[#2c3e50] border-[#4a5568] text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-300">
                          Gradient End Color
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="color"
                            value={
                              selectedElement.styles?.gradientEnd || "#b8004a"
                            }
                            onChange={(e) => {
                              console.log(
                                "Gradient end color changed to:",
                                e.target.value
                              );
                              updateStyles("gradientEnd", e.target.value);
                            }}
                            className="w-12 h-8 p-1 bg-[#2c3e50] border-[#4a5568]"
                          />
                          <Input
                            type="text"
                            value={
                              selectedElement.styles?.gradientEnd || "#b8004a"
                            }
                            onChange={(e) => {
                              console.log(
                                "Gradient end color changed to:",
                                e.target.value
                              );
                              updateStyles("gradientEnd", e.target.value);
                            }}
                            className="flex-1 bg-[#2c3e50] border-[#4a5568] text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-300">Gradient Angle</Label>
                        <div className="flex items-center space-x-2">
                          <Slider
                            value={[
                              selectedElement.styles?.gradientAngle || 45,
                            ]}
                            onValueChange={(value) => {
                              console.log(
                                "Gradient angle changed to:",
                                value[0]
                              );
                              updateStyles("gradientAngle", value[0]);
                            }}
                            max={360}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-gray-300 w-12">
                            {selectedElement.styles?.gradientAngle || 45}°
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Border */}
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Layout className="w-4 h-4 mr-2" />
                    Border
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Border Type</Label>
                    <Select
                      value={selectedElement.styles?.borderType || "solid"}
                      onValueChange={(value) => {
                        console.log("Border type changed to:", value);
                        updateStyles("borderType", value);
                      }}
                    >
                      <SelectTrigger className="bg-[#2c3e50] border-[#4a5568] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c3e50] border-[#4a5568]">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedElement.styles?.borderType !== "none" && (
                    <>
                      <div>
                        <Label className="text-gray-300">Border Width</Label>
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <Label className="text-xs text-gray-400">Top</Label>
                            <Input
                              type="text"
                              value={
                                selectedElement.styles?.borderTopWidth || "1px"
                              }
                              onChange={(e) => {
                                console.log(
                                  "Border top width changed to:",
                                  e.target.value
                                );
                                updateStyles("borderTopWidth", e.target.value);
                              }}
                              className="bg-[#2c3e50] border-[#4a5568] text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400">
                              Right
                            </Label>
                            <Input
                              type="text"
                              value={
                                selectedElement.styles?.borderRightWidth ||
                                "1px"
                              }
                              onChange={(e) => {
                                console.log(
                                  "Border right width changed to:",
                                  e.target.value
                                );
                                updateStyles(
                                  "borderRightWidth",
                                  e.target.value
                                );
                              }}
                              className="bg-[#2c3e50] border-[#4a5568] text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400">
                              Bottom
                            </Label>
                            <Input
                              type="text"
                              value={
                                selectedElement.styles?.borderBottomWidth ||
                                "1px"
                              }
                              onChange={(e) => {
                                console.log(
                                  "Border bottom width changed to:",
                                  e.target.value
                                );
                                updateStyles(
                                  "borderBottomWidth",
                                  e.target.value
                                );
                              }}
                              className="bg-[#2c3e50] border-[#4a5568] text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-400">
                              Left
                            </Label>
                            <Input
                              type="text"
                              value={
                                selectedElement.styles?.borderLeftWidth || "1px"
                              }
                              onChange={(e) => {
                                console.log(
                                  "Border left width changed to:",
                                  e.target.value
                                );
                                updateStyles("borderLeftWidth", e.target.value);
                              }}
                              className="bg-[#2c3e50] border-[#4a5568] text-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-gray-300">Border Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="color"
                            value={
                              selectedElement.styles?.borderColor || "#e5e7eb"
                            }
                            onChange={(e) => {
                              console.log(
                                "Border color changed to:",
                                e.target.value
                              );
                              updateStyles("borderColor", e.target.value);
                            }}
                            className="w-12 h-8 p-1 bg-[#2c3e50] border-[#4a5568]"
                          />
                          <Input
                            type="text"
                            value={
                              selectedElement.styles?.borderColor || "#e5e7eb"
                            }
                            onChange={(e) => {
                              console.log(
                                "Border color changed to:",
                                e.target.value
                              );
                              updateStyles("borderColor", e.target.value);
                            }}
                            className="flex-1 bg-[#2c3e50] border-[#4a5568] text-white"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label className="text-gray-300">Border Radius</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs text-gray-400">
                          Top Left
                        </Label>
                        <Input
                          type="text"
                          value={
                            selectedElement.styles?.borderTopLeftRadius || "0"
                          }
                          onChange={(e) => {
                            console.log(
                              "Border top left radius changed to:",
                              e.target.value
                            );
                            updateStyles("borderTopLeftRadius", e.target.value);
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">
                          Top Right
                        </Label>
                        <Input
                          type="text"
                          value={
                            selectedElement.styles?.borderTopRightRadius || "0"
                          }
                          onChange={(e) => {
                            console.log(
                              "Border top right radius changed to:",
                              e.target.value
                            );
                            updateStyles(
                              "borderTopRightRadius",
                              e.target.value
                            );
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">
                          Bottom Right
                        </Label>
                        <Input
                          type="text"
                          value={
                            selectedElement.styles?.borderBottomRightRadius ||
                            "0"
                          }
                          onChange={(e) => {
                            console.log(
                              "Border bottom right radius changed to:",
                              e.target.value
                            );
                            updateStyles(
                              "borderBottomRightRadius",
                              e.target.value
                            );
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">
                          Bottom Left
                        </Label>
                        <Input
                          type="text"
                          value={
                            selectedElement.styles?.borderBottomLeftRadius ||
                            "0"
                          }
                          onChange={(e) => {
                            console.log(
                              "Border bottom left radius changed to:",
                              e.target.value
                            );
                            updateStyles(
                              "borderBottomLeftRadius",
                              e.target.value
                            );
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Spacing */}
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Move className="w-4 h-4 mr-2" />
                    Spacing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Margin</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs text-gray-400">Top</Label>
                        <Input
                          type="text"
                          value={selectedElement.styles?.marginTop || "0"}
                          onChange={(e) => {
                            console.log(
                              "Margin top changed to:",
                              e.target.value
                            );
                            updateStyles("marginTop", e.target.value);
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Right</Label>
                        <Input
                          type="text"
                          value={selectedElement.styles?.marginRight || "0"}
                          onChange={(e) => {
                            console.log(
                              "Margin right changed to:",
                              e.target.value
                            );
                            updateStyles("marginRight", e.target.value);
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Bottom</Label>
                        <Input
                          type="text"
                          value={selectedElement.styles?.marginBottom || "0"}
                          onChange={(e) => {
                            console.log(
                              "Margin bottom changed to:",
                              e.target.value
                            );
                            updateStyles("marginBottom", e.target.value);
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Left</Label>
                        <Input
                          type="text"
                          value={selectedElement.styles?.marginLeft || "0"}
                          onChange={(e) => {
                            console.log(
                              "Margin left changed to:",
                              e.target.value
                            );
                            updateStyles("marginLeft", e.target.value);
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Padding</Label>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <Label className="text-xs text-gray-400">Top</Label>
                        <Input
                          type="text"
                          value={selectedElement.styles?.paddingTop || "0"}
                          onChange={(e) => {
                            console.log(
                              "Padding top changed to:",
                              e.target.value
                            );
                            updateStyles("paddingTop", e.target.value);
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Right</Label>
                        <Input
                          type="text"
                          value={selectedElement.styles?.paddingRight || "0"}
                          onChange={(e) => {
                            console.log(
                              "Padding right changed to:",
                              e.target.value
                            );
                            updateStyles("paddingRight", e.target.value);
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Bottom</Label>
                        <Input
                          type="text"
                          value={selectedElement.styles?.paddingBottom || "0"}
                          onChange={(e) => {
                            console.log(
                              "Padding bottom changed to:",
                              e.target.value
                            );
                            updateStyles("paddingBottom", e.target.value);
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400">Left</Label>
                        <Input
                          type="text"
                          value={selectedElement.styles?.paddingLeft || "0"}
                          onChange={(e) => {
                            console.log(
                              "Padding left changed to:",
                              e.target.value
                            );
                            updateStyles("paddingLeft", e.target.value);
                          }}
                          className="bg-[#2c3e50] border-[#4a5568] text-white"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-6">
              {/* Custom CSS */}
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    Custom CSS
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Custom CSS Classes</Label>
                    <Input
                      type="text"
                      value={selectedElement.props?.cssClasses || ""}
                      onChange={(e) => {
                        console.log("CSS classes changed to:", e.target.value);
                        updateProps("cssClasses", e.target.value);
                      }}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                      placeholder="my-custom-class another-class"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Custom CSS</Label>
                    <Textarea
                      value={selectedElement.props?.customCss || ""}
                      onChange={(e) => {
                        console.log("Custom CSS changed to:", e.target.value);
                        updateProps("customCss", e.target.value);
                      }}
                      className="bg-[#2c3e50] border-[#4a5568] text-white font-mono text-sm"
                      rows={6}
                      placeholder=".my-custom-class { color: red; }"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Attributes */}
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Attributes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Element ID</Label>
                    <Input
                      type="text"
                      value={selectedElement.props?.elementId || ""}
                      onChange={(e) => {
                        console.log("Element ID changed to:", e.target.value);
                        updateProps("elementId", e.target.value);
                      }}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                      placeholder="my-element-id"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Data Attributes</Label>
                    <Textarea
                      value={selectedElement.props?.dataAttributes || ""}
                      onChange={(e) => {
                        console.log(
                          "Data attributes changed to:",
                          e.target.value
                        );
                        updateProps("dataAttributes", e.target.value);
                      }}
                      className="bg-[#2c3e50] border-[#4a5568] text-white font-mono text-sm"
                      rows={4}
                      placeholder='{"key": "value"}'
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Motion Effects */}
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Motion Effects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Animation</Label>
                    <Select
                      value={selectedElement.props?.animation || "none"}
                      onValueChange={(value) => {
                        console.log("Animation changed to:", value);
                        updateProps("animation", value);
                      }}
                    >
                      <SelectTrigger className="bg-[#2c3e50] border-[#4a5568] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c3e50] border-[#4a5568]">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="fade">Fade</SelectItem>
                        <SelectItem value="slide">Slide</SelectItem>
                        <SelectItem value="zoom">Zoom</SelectItem>
                        <SelectItem value="bounce">Bounce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Animation Duration</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[
                          selectedElement.props?.animationDuration || 0.5,
                        ]}
                        onValueChange={(value) => {
                          console.log(
                            "Animation duration changed to:",
                            value[0]
                          );
                          updateProps("animationDuration", value[0]);
                        }}
                        max={3}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-300 w-12">
                        {selectedElement.props?.animationDuration || 0.5}s
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Animation Delay</Label>
                    <div className="flex items-center space-x-2">
                      <Slider
                        value={[selectedElement.props?.animationDelay || 0]}
                        onValueChange={(value) => {
                          console.log("Animation delay changed to:", value[0]);
                          updateProps("animationDelay", value[0]);
                        }}
                        max={5}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-300 w-12">
                        {selectedElement.props?.animationDelay || 0}s
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Hover Effects</Label>
                    <Select
                      value={selectedElement.props?.hoverEffect || "none"}
                      onValueChange={(value) => {
                        console.log("Hover effect changed to:", value);
                        updateProps("hoverEffect", value);
                      }}
                    >
                      <SelectTrigger className="bg-[#2c3e50] border-[#4a5568] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c3e50] border-[#4a5568]">
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="scale">Scale</SelectItem>
                        <SelectItem value="lift">Lift</SelectItem>
                        <SelectItem value="glow">Glow</SelectItem>
                        <SelectItem value="rotate">Rotate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "responsive" && (
            <div className="space-y-6">
              {/* Device Visibility */}
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Eye className="w-4 h-4 mr-2" />
                    Device Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Hide on Desktop</Label>
                    <Switch
                      checked={selectedElement.props?.hideDesktop || false}
                      onCheckedChange={(checked) => {
                        console.log("Hide on desktop changed to:", checked);
                        updateProps("hideDesktop", checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Hide on Tablet</Label>
                    <Switch
                      checked={selectedElement.props?.hideTablet || false}
                      onCheckedChange={(checked) => {
                        console.log("Hide on tablet changed to:", checked);
                        updateProps("hideTablet", checked);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-gray-300">Hide on Mobile</Label>
                    <Switch
                      checked={selectedElement.props?.hideMobile || false}
                      onCheckedChange={(checked) => {
                        console.log("Hide on mobile changed to:", checked);
                        updateProps("hideMobile", checked);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Responsive Settings */}
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <Layout className="w-4 h-4 mr-2" />
                    Responsive Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">
                      Current Device: {selectedDevice}
                    </Label>
                    <p className="text-xs text-gray-400 mt-1">
                      Changes made here will apply to the {selectedDevice} view
                      only.
                    </p>
                  </div>

                  <div>
                    <Label className="text-gray-300">
                      Device-Specific Font Size
                    </Label>
                    <Input
                      type="text"
                      value={
                        selectedElement.styles?.[`${selectedDevice}FontSize`] ||
                        ""
                      }
                      onChange={(e) => {
                        console.log(
                          "Device-specific font size changed to:",
                          e.target.value
                        );
                        updateStyles(
                          `${selectedDevice}FontSize`,
                          e.target.value
                        );
                      }}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                      placeholder="Override font size for this device"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">
                      Device-Specific Padding
                    </Label>
                    <Input
                      type="text"
                      value={
                        selectedElement.styles?.[`${selectedDevice}Padding`] ||
                        ""
                      }
                      onChange={(e) => {
                        console.log(
                          "Device-specific padding changed to:",
                          e.target.value
                        );
                        updateStyles(
                          `${selectedDevice}Padding`,
                          e.target.value
                        );
                      }}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                      placeholder="Override padding for this device"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">
                      Device-Specific Margin
                    </Label>
                    <Input
                      type="text"
                      value={
                        selectedElement.styles?.[`${selectedDevice}Margin`] ||
                        ""
                      }
                      onChange={(e) => {
                        console.log(
                          "Device-specific margin changed to:",
                          e.target.value
                        );
                        updateStyles(`${selectedDevice}Margin`, e.target.value);
                      }}
                      className="bg-[#2c3e50] border-[#4a5568] text-white"
                      placeholder="Override margin for this device"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">
                      Device-Specific Alignment
                    </Label>
                    <Select
                      value={
                        selectedElement.styles?.[`${selectedDevice}Align`] || ""
                      }
                      onValueChange={(value) => {
                        console.log(
                          "Device-specific alignment changed to:",
                          value
                        );
                        updateStyles(`${selectedDevice}Align`, value);
                      }}
                    >
                      <SelectTrigger className="bg-[#2c3e50] border-[#4a5568] text-white">
                        <SelectValue placeholder="Override alignment" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c3e50] border-[#4a5568]">
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="justify">Justify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Layout Overrides */}
              <Card className="bg-[#34495e] border-[#4a5568]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center">
                    <GripVertical className="w-4 h-4 mr-2" />
                    Layout Overrides
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">
                      Column Order (Mobile)
                    </Label>
                    <Select
                      value={
                        selectedElement.props?.mobileColumnOrder || "normal"
                      }
                      onValueChange={(value) => {
                        console.log("Mobile column order changed to:", value);
                        updateProps("mobileColumnOrder", value);
                      }}
                    >
                      <SelectTrigger className="bg-[#2c3e50] border-[#4a5568] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2c3e50] border-[#4a5568]">
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="reverse">Reverse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-gray-300">Stack on Mobile</Label>
                    <Switch
                      checked={selectedElement.props?.stackOnMobile || false}
                      onCheckedChange={(checked) => {
                        console.log("Stack on mobile changed to:", checked);
                        updateProps("stackOnMobile", checked);
                      }}
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">
                      Full Width on Mobile
                    </Label>
                    <Switch
                      checked={
                        selectedElement.props?.fullWidthOnMobile || false
                      }
                      onCheckedChange={(checked) => {
                        console.log(
                          "Full width on mobile changed to:",
                          checked
                        );
                        updateProps("fullWidthOnMobile", checked);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <ScrollBar className="w-2 bg-[#34495e]" />
      </ScrollArea>
    </div>
  );
}
