"use client";

import { useEffect, useState } from "react";
import { PageElement } from "@/components/page-builder/PageBuilder1";

export default function SimplePreviewPage() {
  const [elements, setElements] = useState<PageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const log = (message: string) => {
    console.log(message);
    setDebugInfo((prev) => prev + "\n" + message);
  };

  useEffect(() => {
    log("Preview page useEffect started");

    const loadElements = async () => {
      try {
        log("Starting to load elements...");

        // Simple localStorage test first
        log("Testing localStorage access...");
        let data: string | null = null;

        try {
          data = localStorage.getItem("pagebuilder-preview");
          log(`localStorage result: ${data ? "Found data" : "No data"}`);
          if (data) {
            log(`Data length: ${data.length} characters`);
          }
        } catch (e) {
          log(`localStorage error: ${e}`);
        }

        if (!data) {
          log("No data found, creating default content...");
          // Create simple default content
          const defaultElements: PageElement[] = [
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
                      content: { text: "Simple Preview Test" },
                      styles: {
                        fontSize: "32px",
                        fontWeight: "bold",
                        textAlign: "center",
                      },
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
          log("Set default elements");
        } else {
          log("Parsing data...");
          try {
            const parsed = JSON.parse(data);
            log(
              `Parsed successfully: ${
                Array.isArray(parsed) ? parsed.length : "Not an array"
              } elements`
            );
            setElements(Array.isArray(parsed) ? parsed : [parsed]);
          } catch (parseError) {
            log(`Parse error: ${parseError}`);
            setError("Failed to parse preview data");
          }
        }
      } catch (error) {
        log(`General error: ${error}`);
        setError("Failed to load preview data");
      } finally {
        log("Setting isLoading to false");
        setIsLoading(false);
      }
    };

    log("Calling loadElements...");
    loadElements();

    // Simple event listener test
    const handleCustomUpdate = (event: CustomEvent) => {
      log(
        `Custom event received: ${event.detail?.elements?.length || 0} elements`
      );
      if (event.detail?.elements) {
        setElements(event.detail.elements);
      }
    };

    log("Adding event listener...");
    window.addEventListener(
      "pagebuilder-update",
      handleCustomUpdate as EventListener
    );

    return () => {
      log("Cleaning up event listener...");
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

      case "widget":
        if (!widgetType) return null;

        switch (widgetType) {
          case "heading":
            return (
              <h2 key={id} style={elementStyles}>
                {content.text || "Heading Text"}
              </h2>
            );

          case "text-editor":
            return (
              <div key={id} style={elementStyles}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: content.html || "<p>Text content</p>",
                  }}
                />
              </div>
            );

          case "button":
            return (
              <button key={id} style={elementStyles}>
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
          <div className="mt-4 text-sm text-gray-500">
            Debug Info:
            <pre className="text-left bg-gray-100 p-2 rounded mt-2 text-xs">
              {debugInfo || "No debug info yet"}
            </pre>
          </div>
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
          <div className="mb-4 text-sm text-gray-500">
            Debug Info:
            <pre className="text-left bg-gray-100 p-2 rounded mt-2 text-xs">
              {debugInfo}
            </pre>
          </div>
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
          <span className="font-medium text-gray-700">
            WebElements Simple Preview
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              log("Manual refresh clicked");
              window.location.reload();
            }}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Refresh
          </button>
          <button
            onClick={() => window.close()}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>

      {/* Debug info */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
        <details>
          <summary className="text-sm font-medium text-yellow-800 cursor-pointer">
            Debug Information
          </summary>
          <pre className="text-xs text-yellow-700 mt-2 whitespace-pre-wrap">
            {debugInfo}
          </pre>
        </details>
      </div>

      {/* Preview content */}
      <div className="p-8">
        {elements.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              No content to preview
            </h2>
            <p className="text-gray-500">No elements found to display.</p>
          </div>
        ) : (
          <div className="space-y-8">{elements.map(renderElement)}</div>
        )}
      </div>
    </div>
  );
}
