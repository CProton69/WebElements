"use client";

import { useState, useRef } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  Upload,
  FileText,
  Image,
  Video,
  Code,
  Copy,
  Save,
  FolderOpen,
  File,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { PageElement } from "./PageBuilder1";

// Function to safely serialize page elements for export
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
          try {
            cleaned.content[key] = JSON.parse(JSON.stringify(value));
          } catch (e) {
            // Skip non-serializable objects
            console.warn("Skipping non-serializable content:", key, value);
          }
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
import { cn } from "@/lib/utils";

interface ImportExportProps {
  elements: PageElement[];
  onElementsUpdate: (elements: PageElement[]) => void;
  onElementAdd: (elements: PageElement[], description: string) => void;
}

interface ExportOptions {
  format: "json" | "html" | "css" | "images";
  includeStyles: boolean;
  includeScripts: boolean;
  minify: boolean;
  prettyPrint: boolean;
}

interface ImportOptions {
  format: "json" | "html" | "css";
  replaceExisting: boolean;
  mergeWithExisting: boolean;
}

export function ImportExport({
  elements,
  onElementsUpdate,
  onElementAdd,
}: ImportExportProps) {
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "json",
    includeStyles: true,
    includeScripts: true,
    minify: false,
    prettyPrint: true,
  });
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    format: "json",
    replaceExisting: false,
    mergeWithExisting: true,
  });
  const [importData, setImportData] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportResult, setExportResult] = useState("");
  const [importResult, setImportResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateExportData = () => {
    switch (exportOptions.format) {
      case "json":
        return generateJSONExport();
      case "html":
        return generateHTMLExport();
      case "css":
        return generateCSSExport();
      case "images":
        return generateImagesExport();
      default:
        return "";
    }
  };

  const generateJSONExport = () => {
    const data = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      elements: JSON.parse(safeSerializeElements(elements)),
      globalSettings: {
        // Include global settings if needed
      },
    };

    const jsonString = JSON.stringify(
      data,
      null,
      exportOptions.prettyPrint ? 2 : 0
    );
    return jsonString;
  };

  const generateHTMLExport = () => {
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Page</title>
    ${exportOptions.includeStyles ? generateCSSExport() : ""}
</head>
<body>
    ${generateHTMLContent(elements)}
    ${exportOptions.includeScripts ? generateJavaScriptExport() : ""}
</body>
</html>`;

    if (exportOptions.minify) {
      html = html.replace(/\s+/g, " ").replace(/> </g, "><").trim();
    }

    return html;
  };

  const generateHTMLContent = (elements: PageElement[]): string => {
    return elements
      .map((element) => {
        switch (element.type) {
          case "section":
            return `
            <section class="webeditor-section" style="${generateInlineStyles(
              element.styles
            )}">
              <div class="webeditor-container">
                ${generateHTMLContent(element.children)}
              </div>
            </section>
          `;
          case "column":
            return `
            <div class="webeditor-column" style="${generateInlineStyles(
              element.styles
            )}; grid-column: span ${element.props?.width || 12};">
              ${generateHTMLContent(element.children)}
            </div>
          `;
          case "widget":
            return generateWidgetHTML(element);
          default:
            return "";
        }
      })
      .join("");
  };

  const generateWidgetHTML = (element: PageElement): string => {
    const styles = generateInlineStyles(element.styles);

    switch (element.widgetType) {
      case "heading":
        const level = element.content?.level || 2;
        return `<h${level} class="webeditor-heading" style="${styles}">${
          element.content?.text || "Heading"
        }</h${level}>`;

      case "text-editor":
        return `<div class="webeditor-text-editor" style="${styles}">${
          element.content?.text || "Text content"
        }</div>`;

      case "button":
        const target = element.content?.link?.isExternal
          ? ' target="_blank"'
          : "";
        const rel = element.content?.link?.nofollow ? ' rel="nofollow"' : "";
        return `<a href="${
          element.content?.link?.url || "#"
        }"${target}${rel} class="webeditor-button" style="${styles}">${
          element.content?.text || "Button"
        }</a>`;

      case "image":
        const imgTarget = element.content?.link?.url
          ? ` href="${element.content.link.url}"${
              element.content.link.isExternal ? ' target="_blank"' : ""
            }${element.content.link.nofollow ? ' rel="nofollow"' : ""}`
          : "";
        const imgTag = `<img src="${element.content?.url || ""}" alt="${
          element.content?.alt || ""
        }" title="${element.content?.title || ""}" style="${styles}" />`;
        return element.content?.link?.url
          ? `<a${imgTarget}>${imgTag}</a>`
          : imgTag;

      case "video":
        return `<div class="webeditor-video" style="${styles}">
          <video controls${element.content?.autoplay ? " autoplay" : ""}${
          element.content?.mute ? " muted" : ""
        }${element.content?.loop ? " loop" : ""}>
            <source src="${element.content?.url || ""}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>`;

      case "icon":
        return `<span class="webeditor-icon" style="${styles}">${
          element.content?.icon || "⭐"
        }</span>`;

      case "divider":
        return `<hr class="webeditor-divider" style="${styles}" />`;

      case "spacer":
        return `<div class="webeditor-spacer" style="${styles}; height: ${
          element.content?.space || 30
        }px;"></div>`;

      default:
        return `<div class="webeditor-widget webeditor-widget-${element.widgetType}" style="${styles}">
          ${element.widgetType} widget content
        </div>`;
    }
  };

  const generateInlineStyles = (styles: any): string => {
    if (!styles) return "";

    const styleRules: string[] = [];

    // Typography
    if (styles.typography) {
      if (styles.typography.fontFamily)
        styleRules.push(`font-family: ${styles.typography.fontFamily}`);
      if (styles.typography.fontSize)
        styleRules.push(`font-size: ${styles.typography.fontSize}px`);
      if (styles.typography.fontWeight)
        styleRules.push(`font-weight: ${styles.typography.fontWeight}`);
      if (styles.typography.lineHeight)
        styleRules.push(`line-height: ${styles.typography.lineHeight}`);
      if (styles.typography.letterSpacing)
        styleRules.push(`letter-spacing: ${styles.typography.letterSpacing}px`);
      if (styles.typography.textAlign)
        styleRules.push(`text-align: ${styles.typography.textAlign}`);
      if (styles.typography.color)
        styleRules.push(`color: ${styles.typography.color}`);
    }

    // Background
    if (styles.background) {
      if (styles.background.type === "solid" && styles.background.color) {
        styleRules.push(`background-color: ${styles.background.color}`);
      } else if (
        styles.background.type === "gradient" &&
        styles.background.gradient
      ) {
        styleRules.push(
          `background: linear-gradient(${styles.background.gradient.angle}deg, ${styles.background.gradient.start}, ${styles.background.gradient.end})`
        );
      }
    }

    // Border
    if (styles.border && styles.border.type !== "none") {
      if (styles.border.color)
        styleRules.push(`border-color: ${styles.border.color}`);
      if (styles.border.width) {
        const widths = [
          styles.border.width.top || 0,
          styles.border.width.right || 0,
          styles.border.width.bottom || 0,
          styles.border.width.left || 0,
        ];
        styleRules.push(`border-width: ${widths.join("px ")}px`);
      }
      if (styles.border.radius) {
        const radius = [
          styles.border.radius.top || 0,
          styles.border.radius.right || 0,
          styles.border.radius.bottom || 0,
          styles.border.radius.left || 0,
        ];
        styleRules.push(`border-radius: ${radius.join("px ")}px`);
      }
    }

    // Spacing
    if (styles.spacing) {
      if (styles.spacing.margin) {
        const margin = [
          styles.spacing.margin.top || 0,
          styles.spacing.margin.right || 0,
          styles.spacing.margin.bottom || 0,
          styles.spacing.margin.left || 0,
        ];
        styleRules.push(`margin: ${margin.join("px ")}px`);
      }
      if (styles.spacing.padding) {
        const padding = [
          styles.spacing.padding.top || 0,
          styles.spacing.padding.right || 0,
          styles.spacing.padding.bottom || 0,
          styles.spacing.padding.left || 0,
        ];
        styleRules.push(`padding: ${padding.join("px ")}px`);
      }
    }

    // Box Shadow
    if (styles.boxShadow && styles.boxShadow.enabled) {
      const shadow = `${styles.boxShadow.horizontal}px ${styles.boxShadow.vertical}px ${styles.boxShadow.blur}px ${styles.boxShadow.spread}px ${styles.boxShadow.color}`;
      styleRules.push(`box-shadow: ${shadow}`);
    }

    // Sizing
    if (styles.sizing) {
      if (styles.sizing.width)
        styleRules.push(`width: ${styles.sizing.width}px`);
      if (styles.sizing.height)
        styleRules.push(`height: ${styles.sizing.height}px`);
    }

    return styleRules.join("; ");
  };

  const generateCSSExport = () => {
    let css = `/* Exported CSS - Generated at ${new Date().toISOString()} */
    
/* Base Styles */
.webeditor-section {
  position: relative;
}

.webeditor-column {
  position: relative;
  min-height: 1px;
}

.webeditor-widget {
  position: relative;
}

/* Widget Styles */
`;

    elements.forEach((element) => {
      css += generateWidgetCSS(element);
    });

    return css;
  };

  const generateWidgetCSS = (
    element: PageElement,
    prefix: string = ""
  ): string => {
    let css = "";
    const elementClass = `webeditor-element-${element.id}`;

    if (element.type === "widget") {
      css += `.${elementClass} {\n`;
      css += generateCSSRules(element.styles);
      css += "}\n\n";
    }

    // Generate CSS for children
    element.children.forEach((child) => {
      css += generateWidgetCSS(child, `${prefix} > `);
    });

    return css;
  };

  const generateCSSRules = (styles: any): string => {
    if (!styles) return "";

    const rules: string[] = [];

    // Typography
    if (styles.typography) {
      if (styles.typography.fontFamily)
        rules.push(`  font-family: ${styles.typography.fontFamily};`);
      if (styles.typography.fontSize)
        rules.push(`  font-size: ${styles.typography.fontSize}px;`);
      if (styles.typography.fontWeight)
        rules.push(`  font-weight: ${styles.typography.fontWeight};`);
      if (styles.typography.lineHeight)
        rules.push(`  line-height: ${styles.typography.lineHeight};`);
      if (styles.typography.letterSpacing)
        rules.push(`  letter-spacing: ${styles.typography.letterSpacing}px;`);
      if (styles.typography.textAlign)
        rules.push(`  text-align: ${styles.typography.textAlign};`);
      if (styles.typography.color)
        rules.push(`  color: ${styles.typography.color};`);
    }

    // Background
    if (styles.background) {
      if (styles.background.type === "solid" && styles.background.color) {
        rules.push(`  background-color: ${styles.background.color};`);
      } else if (
        styles.background.type === "gradient" &&
        styles.background.gradient
      ) {
        rules.push(
          `  background: linear-gradient(${styles.background.gradient.angle}deg, ${styles.background.gradient.start}, ${styles.background.gradient.end});`
        );
      }
    }

    // Border
    if (styles.border && styles.border.type !== "none") {
      if (styles.border.color)
        rules.push(`  border-color: ${styles.border.color};`);
      if (styles.border.width) {
        const widths = [
          styles.border.width.top || 0,
          styles.border.width.right || 0,
          styles.border.width.bottom || 0,
          styles.border.width.left || 0,
        ];
        rules.push(`  border-width: ${widths.join("px ")}px;`);
      }
      if (styles.border.radius) {
        const radius = [
          styles.border.radius.top || 0,
          styles.border.radius.right || 0,
          styles.border.radius.bottom || 0,
          styles.border.radius.left || 0,
        ];
        rules.push(`  border-radius: ${radius.join("px ")}px;`);
      }
    }

    // Spacing
    if (styles.spacing) {
      if (styles.spacing.margin) {
        const margin = [
          styles.spacing.margin.top || 0,
          styles.spacing.margin.right || 0,
          styles.spacing.margin.bottom || 0,
          styles.spacing.margin.left || 0,
        ];
        rules.push(`  margin: ${margin.join("px ")}px;`);
      }
      if (styles.spacing.padding) {
        const padding = [
          styles.spacing.padding.top || 0,
          styles.spacing.padding.right || 0,
          styles.spacing.padding.bottom || 0,
          styles.spacing.padding.left || 0,
        ];
        rules.push(`  padding: ${padding.join("px ")}px;`);
      }
    }

    // Box Shadow
    if (styles.boxShadow && styles.boxShadow.enabled) {
      const shadow = `${styles.boxShadow.horizontal}px ${styles.boxShadow.vertical}px ${styles.boxShadow.blur}px ${styles.boxShadow.spread}px ${styles.boxShadow.color}`;
      rules.push(`  box-shadow: ${shadow};`);
    }

    // Sizing
    if (styles.sizing) {
      if (styles.sizing.width) rules.push(`  width: ${styles.sizing.width}px;`);
      if (styles.sizing.height)
        rules.push(`  height: ${styles.sizing.height}px;`);
    }

    return rules.join("\n");
  };

  const generateJavaScriptExport = () => {
    return `
<script>
// Basic interactivity scripts
document.addEventListener('DOMContentLoaded', function() {
  // Add any interactive functionality here
  console.log('Page loaded successfully');
});
</script>`;
  };

  const generateImagesExport = () => {
    // Extract all image URLs from the page
    const imageUrls: string[] = [];

    const extractImages = (elements: PageElement[]) => {
      elements.forEach((element) => {
        if (element.widgetType === "image" && element.content?.url) {
          imageUrls.push(element.content.url);
        }
        if (element.children && element.children.length > 0) {
          extractImages(element.children);
        }
      });
    };

    extractImages(elements);

    return imageUrls.join("\n");
  };

  const handleExport = () => {
    const data = generateExportData();
    setExportResult(data);
  };

  const handleDownload = () => {
    if (!exportResult) return;

    const mimeType =
      exportOptions.format === "json"
        ? "application/json"
        : exportOptions.format === "html"
        ? "text/html"
        : exportOptions.format === "css"
        ? "text/css"
        : "text/plain";

    const extension =
      exportOptions.format === "json"
        ? "json"
        : exportOptions.format === "html"
        ? "html"
        : exportOptions.format === "css"
        ? "css"
        : "txt";

    const blob = new Blob([exportResult], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `page-export.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    if (!exportResult) return;

    navigator.clipboard
      .writeText(exportResult)
      .then(() => {
        // Show success message
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard:", err);
      });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = () => {
    try {
      let importedElements: PageElement[] = [];

      if (importOptions.format === "json") {
        const data = JSON.parse(importData);
        if (data.elements) {
          importedElements = data.elements;
        } else {
          // Assume the data is directly the elements array
          importedElements = data;
        }
      } else if (importOptions.format === "html") {
        // Basic HTML parsing - convert HTML to page elements
        importedElements = parseHTMLToElements(importData);
      } else if (importOptions.format === "css") {
        setImportResult({
          type: "error",
          message: "CSS import is not yet implemented",
        });
        return;
      }

      if (importOptions.replaceExisting) {
        onElementsUpdate(importedElements);
      } else if (importOptions.mergeWithExisting) {
        onElementAdd([...elements, ...importedElements], "Import elements");
      }

      setImportResult({
        type: "success",
        message: `Successfully imported ${importedElements.length} elements`,
      });
      setShowImportDialog(false);
      setImportData("");
      setImportFile(null);
    } catch (error) {
      setImportResult({
        type: "error",
        message: `Failed to import: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      });
    }
  };

  const parseHTMLToElements = (html: string): PageElement[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const elements: PageElement[] = [];

    // Create a section to contain the imported HTML
    const sectionElement: PageElement = {
      id: `section-${Date.now()}`,
      type: "section",
      widgetType: "section",
      content: {},
      styles: {
        padding: "20px",
        backgroundColor: "#ffffff",
      },
      props: {},
      children: [],
    };

    // Process body content
    const body = doc.body;
    if (body) {
      Array.from(body.children).forEach((child, index) => {
        const widgetElement = createWidgetFromHTMLElement(child, index);
        if (widgetElement) {
          sectionElement.children.push(widgetElement);
        }
      });
    }

    if (sectionElement.children && sectionElement.children.length > 0) {
      elements.push(sectionElement);
    }

    return elements;
  };

  const createWidgetFromHTMLElement = (
    element: HTMLElement,
    index: number
  ): PageElement | null => {
    const widgetId = `widget-${Date.now()}-${index}`;

    switch (element.tagName.toLowerCase()) {
      case "h1":
      case "h2":
      case "h3":
      case "h4":
      case "h5":
      case "h6":
        return {
          id: widgetId,
          type: "widget",
          widgetType: "heading",
          content: {
            text: element.textContent || "",
            level: parseInt(element.tagName.substring(1)),
          },
          styles: {
            fontSize:
              element.tagName.toLowerCase() === "h1"
                ? "32px"
                : element.tagName.toLowerCase() === "h2"
                ? "24px"
                : element.tagName.toLowerCase() === "h3"
                ? "20px"
                : element.tagName.toLowerCase() === "h4"
                ? "18px"
                : element.tagName.toLowerCase() === "h5"
                ? "16px"
                : "14px",
            fontWeight: "bold",
            marginBottom: "16px",
          },
          props: {},
          children: [],
        };

      case "p":
        return {
          id: widgetId,
          type: "widget",
          widgetType: "text-editor",
          content: {
            text: element.textContent || "",
          },
          styles: {
            fontSize: "16px",
            lineHeight: "1.6",
            marginBottom: "16px",
          },
          props: {},
          children: [],
        };

      case "img":
        return {
          id: widgetId,
          type: "widget",
          widgetType: "image",
          content: {
            url: element.getAttribute("src") || "",
            alt: element.getAttribute("alt") || "",
            title: element.getAttribute("title") || "",
          },
          styles: {
            maxWidth: "100%",
            height: "auto",
          },
          props: {},
          children: [],
        };

      case "a":
        return {
          id: widgetId,
          type: "widget",
          widgetType: "button",
          content: {
            text: element.textContent || "Link",
            link: {
              url: element.getAttribute("href") || "#",
              isExternal: element.getAttribute("target") === "_blank",
              nofollow: element.getAttribute("rel") === "nofollow",
            },
          },
          styles: {
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#92003b",
            color: "#ffffff",
            textDecoration: "none",
            borderRadius: "4px",
          },
          props: {},
          children: [],
        };

      case "button":
        return {
          id: widgetId,
          type: "widget",
          widgetType: "button",
          content: {
            text: element.textContent || "Button",
            link: {
              url: element.getAttribute("onclick") ? "#" : "",
              isExternal: false,
              nofollow: false,
            },
          },
          styles: {
            padding: "10px 20px",
            backgroundColor: "#92003b",
            color: "#ffffff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          },
          props: {},
          children: [],
        };

      case "div":
      case "span":
        // Handle generic containers as text editor widgets
        return {
          id: widgetId,
          type: "widget",
          widgetType: "text-editor",
          content: {
            text: element.textContent || "",
          },
          styles: {
            fontSize: "16px",
            lineHeight: "1.6",
          },
          props: {},
          children: [],
        };

      default:
        // For unsupported elements, create a text editor widget
        return {
          id: widgetId,
          type: "widget",
          widgetType: "text-editor",
          content: {
            text: element.textContent || "",
          },
          styles: {
            fontSize: "16px",
            lineHeight: "1.6",
          },
          props: {},
          children: [],
        };
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex gap-2">
      {/* Export Button */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Export Page</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-full">
            {/* Export Options */}
            <div className="grid grid-cols-2 gap-4 p-4 border-b">
              <div>
                <Label htmlFor="export-format">Export Format</Label>
                <Select
                  value={exportOptions.format}
                  onValueChange={(value) =>
                    setExportOptions((prev) => ({
                      ...prev,
                      format: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON (Page Data)</SelectItem>
                    <SelectItem value="html">HTML (Complete Page)</SelectItem>
                    <SelectItem value="css">CSS (Styles Only)</SelectItem>
                    <SelectItem value="images">Images List</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-styles"
                    checked={exportOptions.includeStyles}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeStyles: e.target.checked,
                      }))
                    }
                    disabled={
                      exportOptions.format === "css" ||
                      exportOptions.format === "images"
                    }
                  />
                  <Label htmlFor="include-styles" className="text-sm">
                    Include Styles
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="include-scripts"
                    checked={exportOptions.includeScripts}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        includeScripts: e.target.checked,
                      }))
                    }
                    disabled={exportOptions.format !== "html"}
                  />
                  <Label htmlFor="include-scripts" className="text-sm">
                    Include Scripts
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="minify"
                    checked={exportOptions.minify}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        minify: e.target.checked,
                      }))
                    }
                    disabled={exportOptions.format === "json"}
                  />
                  <Label htmlFor="minify" className="text-sm">
                    Minify Output
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pretty-print"
                    checked={exportOptions.prettyPrint}
                    onChange={(e) =>
                      setExportOptions((prev) => ({
                        ...prev,
                        prettyPrint: e.target.checked,
                      }))
                    }
                  />
                  <Label htmlFor="pretty-print" className="text-sm">
                    Pretty Print
                  </Label>
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex gap-2">
                <Button onClick={handleExport}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Export
                </Button>
                <Button onClick={handleDownload} disabled={!exportResult}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleCopyToClipboard}
                  disabled={!exportResult}
                  variant="outline"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
              </div>

              {exportResult && (
                <div className="text-sm text-gray-600">
                  {formatFileSize(new Blob([exportResult]).size)}
                </div>
              )}
            </div>

            {/* Export Result */}
            <div className="flex-1 p-4">
              {exportResult ? (
                <Textarea
                  value={exportResult}
                  readOnly
                  className="h-full font-mono text-sm"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Click "Generate Export" to create your export</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Button */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Page</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Import Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="import-format">Import Format</Label>
                <Select
                  value={importOptions.format}
                  onValueChange={(value) =>
                    setImportOptions((prev) => ({
                      ...prev,
                      format: value as any,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON (Page Data)</SelectItem>
                    <SelectItem value="html">HTML (Complete Page)</SelectItem>
                    <SelectItem value="css">CSS (Styles Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="replace-existing"
                    name="import-mode"
                    checked={importOptions.replaceExisting}
                    onChange={(e) =>
                      setImportOptions((prev) => ({
                        ...prev,
                        replaceExisting: e.target.checked,
                        mergeWithExisting: !e.target.checked,
                      }))
                    }
                  />
                  <Label htmlFor="replace-existing" className="text-sm">
                    Replace Existing
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="merge-existing"
                    name="import-mode"
                    checked={importOptions.mergeWithExisting}
                    onChange={(e) =>
                      setImportOptions((prev) => ({
                        ...prev,
                        mergeWithExisting: e.target.checked,
                        replaceExisting: !e.target.checked,
                      }))
                    }
                  />
                  <Label htmlFor="merge-existing" className="text-sm">
                    Merge with Existing
                  </Label>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div>
              <Label htmlFor="import-file">Import File</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.html,.css"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {importFile && (
                  <div className="flex items-center space-x-2">
                    <File className="w-4 h-4" />
                    <span className="text-sm">{importFile.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Text Input */}
            <div>
              <Label htmlFor="import-data">Import Data</Label>
              <Textarea
                id="import-data"
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your import data here..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            {/* Import Result */}
            {importResult && (
              <div
                className={`flex items-center space-x-2 p-3 rounded-lg ${
                  importResult.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {importResult.type === "success" ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm">{importResult.message}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowImportDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!importData}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
