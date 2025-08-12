"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImportExport } from "./ImportExport";
import {
  Undo,
  Redo,
  Save,
  Eye,
  MonitorSmartphone,
  Tablet,
  Smartphone,
  Search,
  Plus,
  Settings,
  RotateCcw,
  Menu,
  History,
  Keyboard,
  FolderOpen,
  ExternalLink,
  FileText,
  LayoutList,
  Grid,
} from "lucide-react";

import { PageElement } from "./PageBuilder1";

// Function to safely serialize page elements for localStorage
const safeSerializeElements = (elements: PageElement[]): string => {
  const cleanElement = (element: PageElement): any => {
    const cleaned: any = {
      id: element.id,
      type: element.type,
      widgetType: element.widgetType,
      children: element.children.map(cleanElement),
      content: {},
      styles: {},
      props: {},
    };

    // Clean content - only keep serializable data
    if (element.content && typeof element.content === "object") {
      Object.keys(element.content).forEach((key) => {
        const value = element.content[key];
        if (
          value === null ||
          value === undefined ||
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          cleaned.content[key] = value;
        } else if (typeof value === "object" && !Array.isArray(value)) {
          // Handle nested objects recursively
          cleaned.content[key] = JSON.parse(JSON.stringify(value));
        }
      });
    }

    // Clean styles - only keep serializable data
    if (element.styles && typeof element.styles === "object") {
      Object.keys(element.styles).forEach((key) => {
        const value = element.styles[key];
        if (
          value === null ||
          value === undefined ||
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          cleaned.styles[key] = value;
        }
      });
    }

    // Clean props - only keep serializable data
    if (element.props && typeof element.props === "object") {
      Object.keys(element.props).forEach((key) => {
        const value = element.props[key];
        if (
          value === null ||
          value === undefined ||
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          cleaned.props[key] = value;
        }
      });
    }

    return cleaned;
  };

  return JSON.stringify(elements.map(cleanElement));
};

export type DeviceType = "desktop" | "tablet" | "mobile";

interface TopToolbarProps {
  selectedDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  onPreviewMode: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undoDescription: string;
  redoDescription: string;
  elements: PageElement[];
  onElementsUpdate: (elements: PageElement[]) => void;
  onElementAdd: (elements: PageElement[], description: string) => void;
  onShowNavigator?: () => void;
  onShowHistory?: () => void;
  onShowKeyboardShortcuts?: () => void;
  onShowTemplates?: () => void;
  onShowGlobalSettings?: () => void;
  onShowPagesManager?: () => void;
  onShowMenusManager?: () => void;
  onShowGridSettings?: () => void;
  onShowNewOptions?: () => void;
}

export function TopToolbar({
  selectedDevice,
  onDeviceChange,
  onPreviewMode,
  onUndo,
  onRedo,
  onSave,
  canUndo,
  canRedo,
  undoDescription,
  redoDescription,
  elements,
  onElementsUpdate,
  onElementAdd,
  onShowNavigator,
  onShowHistory,
  onShowKeyboardShortcuts,
  onShowTemplates,
  onShowGlobalSettings,
  onShowPagesManager,
  onShowMenusManager,
  onShowGridSettings,
  onShowNewOptions,
}: TopToolbarProps) {
  return (
    <div className="h-14 bg-[#2c3e50] border-b border-[#34495e] flex items-center justify-between px-4 webeditor-editor">
      {/* Left side - Logo and actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#92003b] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">W</span>
          </div>
          <span className="font-semibold text-white">WebElements</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title={`${undoDescription} (Ctrl+Z)`}
            className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title={`${redoDescription} (Ctrl+Y)`}
            className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <div className="w-px h-6 bg-[#34495e]" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            title="Save (Ctrl+S)"
            className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 px-3"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Center - Search and add section */}
      <div className="flex items-center gap-2 flex-1 max-w-md mx-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6b7280] w-4 h-4" />
          <Input
            placeholder="Search widgets..."
            className="pl-10 bg-[#34495e] border-[#34495e] text-white placeholder-[#6b7280] focus:border-[#92003b] focus:ring-[#92003b]"
          />
        </div>
        <Button
          size="sm"
          className="bg-[#92003b] hover:bg-[#b8004a] text-white h-9"
          onClick={() => {
            // Create a new section element
            const newSection: PageElement = {
              id: `section-${Date.now()}`,
              type: "section",
              children: [
                {
                  id: `column-${Date.now()}-1`,
                  type: "column",
                  children: [],
                  content: {},
                  styles: {
                    padding: "20px",
                    backgroundColor: "#ffffff",
                    borderRadius: "0px",
                    border: "none",
                  },
                  props: { width: 12 },
                },
              ],
              content: {},
              styles: {
                padding: "60px 0px",
                backgroundColor: "#ffffff",
                borderRadius: "0px",
                border: "none",
              },
              props: {},
            };
            console.log("Adding new section:", newSection);
            onElementAdd([newSection], "Add Section");
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="text-white border-white/20 hover:bg-white/10 hover:text-white h-9"
          onClick={onShowNewOptions}
          title="Create new content"
        >
          <Plus className="w-4 h-4 mr-2" />
          New
        </Button>
      </div>

      {/* Right side - Device preview and actions */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-[#34495e] rounded-lg p-1">
          <Button
            variant={selectedDevice === "desktop" ? "default" : "ghost"}
            size="sm"
            onClick={() => onDeviceChange("desktop")}
            className={`h-8 w-8 p-0 ${
              selectedDevice === "desktop"
                ? "bg-[#92003b] text-white"
                : "text-[#e0e0e0] hover:text-white hover:bg-[#2c3e50]"
            }`}
            title="Desktop view"
          >
            <MonitorSmartphone className="w-4 h-4" />
          </Button>
          <Button
            variant={selectedDevice === "tablet" ? "default" : "ghost"}
            size="sm"
            onClick={() => onDeviceChange("tablet")}
            className={`h-8 w-8 p-0 ${
              selectedDevice === "tablet"
                ? "bg-[#92003b] text-white"
                : "text-[#e0e0e0] hover:text-white hover:bg-[#2c3e50]"
            }`}
            title="Tablet view"
          >
            <Tablet className="w-4 h-4" />
          </Button>
          <Button
            variant={selectedDevice === "mobile" ? "default" : "ghost"}
            size="sm"
            onClick={() => onDeviceChange("mobile")}
            className={`h-8 w-8 p-0 ${
              selectedDevice === "mobile"
                ? "bg-[#92003b] text-white"
                : "text-[#e0e0e0] hover:text-white hover:bg-[#2c3e50]"
            }`}
            title="Mobile view"
          >
            <Smartphone className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px h-6 bg-[#34495e]" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onPreviewMode}
          title="Preview mode"
          className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
        >
          <Eye className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            // Use direct preview approach with URL parameters
            try {
              const serializedData = safeSerializeElements(elements);
              console.log(
                "Preview button - Serializing data:",
                serializedData.length,
                "characters"
              );

              // Strategy 1: Try URL parameter approach (most reliable)
              try {
                // Base64 encode the data for URL
                const encodedData = btoa(serializedData);
                const previewUrl = `/preview-direct?data=${encodedData}`;
                console.log("Preview button - Opening preview with URL data");

                // Open preview in new tab
                const previewWindow = window.open(previewUrl, "_blank");
                if (!previewWindow) {
                  alert("Please allow popups to open the preview");
                } else {
                  console.log(
                    "Preview button - Preview window opened with URL data"
                  );
                }
                return;
              } catch (e) {
                console.log("Preview button - URL approach failed:", e);
              }

              // Strategy 2: Fallback to localStorage
              try {
                localStorage.setItem("pagebuilder-preview", serializedData);
                console.log(
                  "Preview button - Saved to localStorage successfully"
                );

                // Open preview without URL data (will use localStorage)
                const previewWindow = window.open("/preview-direct", "_blank");
                if (!previewWindow) {
                  alert("Please allow popups to open the preview");
                } else {
                  console.log(
                    "Preview button - Preview window opened (localStorage fallback)"
                  );
                }
              } catch (e) {
                console.log("Preview button - localStorage failed:", e);

                // Strategy 3: Try storage utility
                try {
                  const { setStorageItem } = await import(
                    "@/lib/storage-utils"
                  );
                  const result = await setStorageItem(
                    "pagebuilder-preview",
                    serializedData,
                    {
                      compress: true,
                      useIndexedDB: true,
                      fallbackToMemory: true,
                    }
                  );

                  if (result.success) {
                    console.log(
                      `Preview button - Saved to storage using ${result.method}`
                    );
                    const previewWindow = window.open(
                      "/preview-direct",
                      "_blank"
                    );
                    if (!previewWindow) {
                      alert("Please allow popups to open the preview");
                    } else {
                      console.log(
                        "Preview button - Preview window opened (storage utility fallback)"
                      );
                    }
                  } else {
                    console.error(
                      "Preview button - Storage utility failed:",
                      result.error
                    );
                    alert(
                      "Error saving page data for preview. Please try again."
                    );
                  }
                } catch (storageError) {
                  console.error(
                    "Preview button - Storage utility error:",
                    storageError
                  );
                  alert(
                    "Error saving page data for preview. Please try again."
                  );
                }
              }

              // Dispatch custom event for real-time preview updates
              const updateEvent = new CustomEvent("pagebuilder-update", {
                detail: { elements: JSON.parse(serializedData) },
              });
              window.dispatchEvent(updateEvent);

              console.log("Preview button - Dispatched update event");
            } catch (error) {
              console.error("Preview button - Error:", error);
              alert(
                "Error saving page data for preview. Please check the console for details."
              );
            }
          }}
          title="Preview in browser"
          className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowNavigator}
          title="Navigator"
          className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
        >
          <Menu className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowHistory}
          title="History"
          className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
        >
          <History className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowKeyboardShortcuts}
          title="Keyboard Shortcuts"
          className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
        >
          <Keyboard className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowTemplates}
          title="Templates"
          className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
        >
          <FolderOpen className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowGlobalSettings}
          title="Global Settings"
          className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
        >
          <Settings className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowPagesManager}
          title="Pages Manager"
          className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
        >
          <FileText className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowMenusManager}
          title="Menus Manager"
          className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
        >
          <LayoutList className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onShowGridSettings}
          title="Grid Settings"
          className="text-[#e0e0e0] hover:text-white hover:bg-[#34495e] h-8 w-8 p-0"
        >
          <Grid className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-[#34495e]" />

        <ImportExport
          elements={elements}
          onElementsUpdate={onElementsUpdate}
          onElementAdd={onElementAdd}
        />
      </div>
    </div>
  );
}
