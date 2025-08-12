"use client";

import { useEffect, useState } from "react";
import { PageElement } from "@/components/page-builder/PageBuilder1";

export default function PreviewPage() {
  const [elements, setElements] = useState<PageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load elements from storage with multiple fallback strategies
    const loadElements = async () => {
      try {
        console.log("Preview page - Loading from storage...");

        // Strategy 1: Try localStorage first (most compatible)
        let savedElements = null;
        try {
          savedElements = localStorage.getItem("pagebuilder-preview");
          console.log(
            "Preview page - localStorage:",
            savedElements ? "Found data" : "No data"
          );
        } catch (e) {
          console.log("Preview page - localStorage access failed:", e);
        }

        // Strategy 2: Try storage utility if localStorage failed
        if (!savedElements) {
          try {
            const { getStorageItem } = await import("@/lib/storage-utils");
            savedElements = await getStorageItem("pagebuilder-preview");
            console.log(
              "Preview page - Storage utility:",
              savedElements ? "Found data" : "No data"
            );
          } catch (e) {
            console.log("Preview page - Storage utility failed:", e);
          }
        }

        // Strategy 3: Try fallback data
        if (!savedElements) {
          try {
            savedElements = localStorage.getItem("pagebuilder-data");
            console.log(
              "Preview page - Fallback data:",
              savedElements ? "Found data" : "No data"
            );
          } catch (e) {
            console.log("Preview page - Fallback access failed:", e);
          }
        }

        // Strategy 4: Try storage utility for fallback
        if (!savedElements) {
          try {
            const { getStorageItem } = await import("@/lib/storage-utils");
            savedElements = await getStorageItem("pagebuilder-data");
            console.log(
              "Preview page - Storage utility fallback:",
              savedElements ? "Found data" : "No data"
            );
          } catch (e) {
            console.log("Preview page - Storage utility fallback failed:", e);
          }
        }

        if (savedElements) {
          const parsed = JSON.parse(savedElements);
          console.log(
            "Preview page - Parsed elements:",
            parsed.length,
            "elements"
          );
          setElements(parsed);
        } else {
          console.log("Preview page - No saved elements found in any storage");
          // Create default content for testing
          const defaultElements = [
            {
              id: "default-section",
              type: "section",
              children: [
                {
                  id: "default-column",
                  type: "column",
                  children: [
                    {
                      id: "default-heading",
                      type: "widget",
                      widgetType: "heading",
                      children: [],
                      content: { text: "Welcome to WebElements Preview" },
                      styles: {
                        fontSize: "32px",
                        fontWeight: "bold",
                        textAlign: "center",
                      },
                      props: {},
                    },
                    {
                      id: "default-text",
                      type: "widget",
                      widgetType: "text-editor",
                      children: [],
                      content: {
                        html: "<p>This is a preview of your WebElements page. If you see this message, it means no page data was found in storage. Try creating some content in the builder first.</p>",
                      },
                      styles: { fontSize: "16px", lineHeight: "1.6" },
                      props: {},
                    },
                  ],
                  content: {},
                  styles: { padding: "40px 20px" },
                  props: { width: 12 },
                },
              ],
              content: {},
              styles: { padding: "60px 0px", backgroundColor: "#f8f9fa" },
              props: {},
            },
          ];
          setElements(defaultElements);
          console.log("Preview page - Using default content");
        }
      } catch (error) {
        console.error("Error loading preview data:", error);
        setError("Failed to load preview data");
      }
      setIsLoading(false);
    };

    // Initial load
    loadElements();

    // Listen for custom events from the same window
    const handleCustomUpdate = (event: CustomEvent) => {
      console.log(
        "Preview page - Custom update event detected, updating preview"
      );
      if (event.detail?.elements) {
        setElements(event.detail.elements);
      }
    };

    // Add event listeners
    window.addEventListener(
      "pagebuilder-update",
      handleCustomUpdate as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "pagebuilder-update",
        handleCustomUpdate as EventListener
      );
    };
  }, []);

  const renderElement = (element: PageElement) => {
    const { id, type, widgetType, children, content, styles, props } = element;

    const elementStyles = {
      ...styles,
      position: "relative" as const,
    };

    switch (type) {
      case "section":
        return (
          <section key={id} style={elementStyles} className="w-full">
            <div className="container mx-auto">
              {children.map(renderElement)}
            </div>
          </section>
        );

      case "column":
        return (
          <div
            key={id}
            style={{
              ...elementStyles,
              width: `${((props.width || 12) / 12) * 100}%`,
              display: "inline-block",
              verticalAlign: "top",
            }}
            className="min-h-[50px]"
          >
            {children.map(renderElement)}
          </div>
        );

      case "flex-container":
        return (
          <div
            key={id}
            style={{
              ...elementStyles,
              display: "flex",
              flexDirection: props.direction || "row",
              justifyContent: props.justifyContent || "flex-start",
              alignItems: props.alignItems || "stretch",
              gap: props.gap || "0px",
            }}
            className="min-h-[50px]"
          >
            {children.map(renderElement)}
          </div>
        );

      case "widget":
        if (!widgetType) return null;

        switch (widgetType) {
          case "heading":
            return (
              <h2
                key={id}
                style={elementStyles}
                className={`font-${props.fontFamily || "sans"} text-${
                  props.fontSize || "2xl"
                } font-${props.fontWeight || "bold"}`}
              >
                {content.text || "Heading Text"}
              </h2>
            );

          case "text-editor":
            return (
              <div
                key={id}
                style={elementStyles}
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: content.html || "<p>Text content</p>",
                }}
              />
            );

          case "button":
            return (
              <button
                key={id}
                style={elementStyles}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  props.variant === "outline"
                    ? "border-2 border-current bg-transparent"
                    : ""
                }`}
              >
                {content.text || "Button Text"}
              </button>
            );

          case "image":
            return (
              <img
                key={id}
                src={content.url || "https://via.placeholder.com/300x200"}
                alt={content.alt || "Image"}
                style={elementStyles}
                className="max-w-full h-auto"
              />
            );

          case "spacer":
            return (
              <div
                key={id}
                style={{
                  ...elementStyles,
                  height: props.height || "20px",
                }}
                className="w-full"
              />
            );

          case "divider":
            return (
              <hr key={id} style={elementStyles} className="w-full border-t" />
            );

          case "icon":
            return (
              <div key={id} style={elementStyles} className="inline-block">
                <span className="text-2xl">{content.icon || "⭐"}</span>
              </div>
            );

          default:
            return (
              <div
                key={id}
                style={elementStyles}
                className="p-4 border border-dashed border-gray-300 rounded"
              >
                <p className="text-sm text-gray-500">
                  {widgetType} widget (preview mode)
                </p>
              </div>
            );
        }

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading WebElements preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Preview Error
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close Preview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Preview header */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#92003b] rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <span className="font-medium text-gray-700">WebElements Preview</span>
        </div>
        <button
          onClick={() => window.close()}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Close Preview
        </button>
      </div>

      {/* Preview content */}
      <div className="p-8">
        {elements.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              No content to preview
            </h2>
            <p className="text-gray-500">
              Add some elements to your page in the builder first.
            </p>
          </div>
        ) : (
          <div className="space-y-8">{elements.map(renderElement)}</div>
        )}
      </div>
    </div>
  );
}
