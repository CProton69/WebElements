"use client";

import { useEffect, useState } from "react";
import { PageElement } from "@/components/page-builder/PageBuilder1";

export default function DirectPreviewPage() {
  const [elements, setElements] = useState<PageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>("");

  useEffect(() => {
    const loadPreviewData = async () => {
      try {
        setIsLoading(true);

        // Strategy 1: Try URL parameters first
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get("data");

        if (dataParam) {
          try {
            const decodedData = decodeURIComponent(atob(dataParam));
            const parsed = JSON.parse(decodedData);
            setElements(Array.isArray(parsed) ? parsed : [parsed]);
            setDataSource("URL parameter");
            console.log("Loaded data from URL parameter");
            return;
          } catch (e) {
            console.warn("Failed to parse URL parameter data:", e);
          }
        }

        // Strategy 2: Try localStorage
        try {
          const localData = localStorage.getItem("pagebuilder-preview");
          if (localData) {
            const parsed = JSON.parse(localData);
            const elementsArray = parsed.elements || parsed;
            setElements(
              Array.isArray(elementsArray) ? elementsArray : [elementsArray]
            );
            setDataSource("localStorage");
            console.log("Loaded data from localStorage");
            return;
          }
        } catch (e) {
          console.warn("Failed to load from localStorage:", e);
        }

        // Strategy 3: Try window.opener communication
        if (window.opener) {
          try {
            // Send message to opener requesting data
            window.opener.postMessage({ type: "request-preview-data" }, "*");

            // Set up listener for response
            const handleMessage = (event: MessageEvent) => {
              if (event.data && event.data.type === "preview-data-response") {
                if (event.data.elements) {
                  setElements(
                    Array.isArray(event.data.elements)
                      ? event.data.elements
                      : [event.data.elements]
                  );
                  setDataSource("window.opener");
                  console.log("Loaded data from window.opener");
                  window.removeEventListener("message", handleMessage);
                }
              }
            };

            window.addEventListener("message", handleMessage);

            // Timeout after 2 seconds
            setTimeout(() => {
              window.removeEventListener("message", handleMessage);
              if (elements.length === 0) {
                // Fall back to default content
                setDefaultContent();
              }
            }, 2000);

            return;
          } catch (e) {
            console.warn("Failed to communicate with window.opener:", e);
          }
        }

        // Strategy 4: Default content
        setDefaultContent();
      } catch (error) {
        console.error("Error loading preview data:", error);
        setError("Failed to load preview data");
        setDefaultContent();
      } finally {
        setIsLoading(false);
      }
    };

    const setDefaultContent = () => {
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
                  content: { text: "WebElements Preview" },
                  styles: {
                    fontSize: "32px",
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#92003b",
                  },
                  props: {},
                },
                {
                  id: "default-text",
                  type: "widget",
                  widgetType: "text-editor",
                  children: [],
                  content: {
                    html: "<p>This is the default preview content. If you're seeing this, the preview system is working but no custom content was found.</p><p>To test with custom content:</p><ol><li>Go to the main editor</li><li>Add some widgets</li><li>Click the preview button</li></ol>",
                  },
                  styles: {
                    fontSize: "16px",
                    lineHeight: "1.6",
                    textAlign: "center",
                  },
                  props: {},
                },
                {
                  id: "default-button",
                  type: "widget",
                  widgetType: "button",
                  children: [],
                  content: { text: "Preview Working!" },
                  styles: {
                    backgroundColor: "#92003b",
                    color: "white",
                    padding: "12px 24px",
                    borderRadius: "4px",
                    border: "none",
                    fontSize: "16px",
                    cursor: "pointer",
                    margin: "20px auto",
                    display: "block",
                  },
                  props: {},
                },
              ],
              content: {},
              styles: { padding: "40px 20px", backgroundColor: "#ffffff" },
              props: { width: 12 },
            },
          ],
          content: {},
          styles: { padding: "60px 0px", backgroundColor: "#f8f9fa" },
          props: {},
        },
      ];
      setElements(defaultElements);
      setDataSource("default content");
      console.log("Set default content");
    };

    loadPreviewData();

    // Listen for real-time updates
    const handleUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.elements) {
        setElements(
          Array.isArray(event.detail.elements)
            ? event.detail.elements
            : [event.detail.elements]
        );
        setDataSource("real-time update");
        console.log("Received real-time update");
      }
    };

    window.addEventListener(
      "pagebuilder-update",
      handleUpdate as EventListener
    );

    // Listen for messages from parent window
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "preview-data-update") {
        if (event.data.elements) {
          setElements(
            Array.isArray(event.data.elements)
              ? event.data.elements
              : [event.data.elements]
          );
          setDataSource("message from parent");
          console.log("Received data update from parent window");
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener(
        "pagebuilder-update",
        handleUpdate as EventListener
      );
      window.removeEventListener("message", handleMessage);
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
            const HeadingTag = content.level || "h2";
            return (
              <HeadingTag key={id} style={elementStyles}>
                {content.text || "Heading Text"}
              </HeadingTag>
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
            Data source: {dataSource || "determining..."}
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
            Data source: {dataSource}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
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
          <span className="text-xs text-gray-500">({dataSource})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
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
