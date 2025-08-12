"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { WidgetsPanel } from "./WidgetsPanel";
import { Canvas } from "./Canvas";
import { PropertiesPanelEnhanced } from "./PropertiesPanelEnhanced";
import { NavigatorPanel } from "./NavigatorPanel";
import { TopToolbar, DeviceType } from "./TopToolbar";
import { useHistoryManager, useKeyboardShortcuts } from "./HistoryManager";
import { widgetRegistry } from "./WidgetRegistry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Undo, Redo } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TemplateManager as OriginalTemplateManager } from "./TemplateManager";
import { GlobalSettings } from "./GlobalSettings";
import { PagesManagerEnhanced } from "./PagesManagerEnhanced";
import { MenusManager } from "./MenusManager";
import { GridSettingsPanel } from "./GridSettings";
import { GridOverlay } from "./GridOverlay";
import { NewOptionsModal } from "./NewOptionsModal";
import { MediaManagerEnhanced } from "./media/MediaManagerEnhanced";
import { TemplateManagerEnhanced } from "./templates/TemplateManagerEnhanced";
import { LandingPageCreator } from "./landing/LandingPageCreator";
import { setStorageItem, optimizePageElements } from "@/lib/storage-utils";
import "./widgets";
import { v4 as uuidv4 } from "uuid";

// Function to safely serialize page elements for localStorage
const safeSerializeElements = (elements: PageElement[]): string => {
  const optimizedElements = optimizePageElements(elements);
  const cleanElement = (element: any): any => {
    const cleaned: any = {
      id: element.id,
      type: element.type,
      widgetType: element.widgetType,
      children: element.children ? element.children.map(cleanElement) : [],
      content: {},
      styles: {},
      props: {},
    };

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
          try {
            cleaned.content[key] = JSON.parse(JSON.stringify(value));
          } catch (e) {
            console.warn("Skipping non-serializable content:", key, value);
          }
        }
      });
    }

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

  return JSON.stringify(optimizedElements.map(cleanElement));
};

export interface PageElement {
  id: string;
  type: "section" | "column" | "widget" | "flex-container";
  widgetType?: string;
  children: PageElement[];
  content: any;
  styles: any;
  props: any;
}

export interface GlobalSettings {
  fonts: {
    primaryFont: string;
    secondaryFont: string;
    headingFont: string;
    baseFontSize: number;
    lineHeight: number;
    letterSpacing: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    textLight: string;
    background: string;
    surface: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  theme: {
    mode: "light" | "dark" | "auto";
    borderRadius: number;
    buttonStyle: "rounded" | "square" | "pill";
    shadowStyle: "none" | "subtle" | "medium" | "strong";
    animationStyle: "none" | "subtle" | "smooth" | "playful";
  };
  layout: {
    containerWidth: number;
    contentSpacing: number;
    sectionSpacing: number;
    columnGap: number;
    responsiveBreakpoints: {
      mobile: number;
      tablet: number;
      desktop: number;
    };
  };
  siteIdentity: {
    siteTitle: string;
    siteDescription: string;
    logoUrl: string;
    faviconUrl: string;
  };
}

// In PageBuilder component body
import { mutate as swrMutate } from "swr"; // optional if you use SWR in managers

const handleTogglePublish = async (pageId: string, publish: boolean) => {
  // optimistic update
  setPages((prev) =>
    prev.map((p) =>
      p.id === pageId ? { ...p, status: publish ? "published" : "draft" } : p
    )
  );
  try {
    const res = await fetch(`/api/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: publish ? "published" : "draft" }),
    });
    if (!res.ok) throw new Error(await res.text());
    const saved = await res.json();
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, ...saved } : p))
    );
    swrMutate?.("/api/pages");
    toast.success(`Page ${publish ? "published" : "unpublished"}`);
  } catch (err) {
    toast.error("Failed to update status"); // optional: revert optimistic change
  }
};

const handleDeletePage = async (pageId: string) => {
  const before = pages;
  setPages((prev) => prev.filter((p) => p.id !== pageId));
  try {
    const res = await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text());
    swrMutate?.("/api/pages");
    toast.success("Page deleted");
  } catch (err) {
    setPages(before); // revert
    toast.error("Failed to delete page");
  }
};

const handleDuplicatePage = async (pageId: string) => {
  const original = pages.find((p) => p.id === pageId);
  if (!original) return;
  const copyTitle = `${original.title} (Copy)`;
  const tempId = uuidv4();
  const tempCopy = {
    ...original,
    id: tempId,
    title: copyTitle,
    isTemporary: true,
  };
  setPages((prev) => [tempCopy, ...prev]);
  try {
    const res = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: copyTitle,
        // for Option B schema, content is string
        content:
          typeof original.elements === "string"
            ? original.elements
            : JSON.stringify(original.elements ?? []),
        status: original.status ?? "draft",
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    const saved = await res.json();
    setPages((prev) =>
      prev.map((p) =>
        p.id === tempId ? { ...p, ...saved, isTemporary: false } : p
      )
    );
    swrMutate?.("/api/pages");
    toast.success("Page duplicated");
  } catch (err) {
    toast.error("Failed to duplicate page (kept local temp)");
  }
};

// Slug editing (call on blur or save button)
const handleUpdateSlug = async (pageId: string, slugInput: string) => {
  const before = pages;
  setPages((prev) =>
    prev.map((p) => (p.id === pageId ? { ...p, slug: slugInput } : p))
  );
  try {
    const res = await fetch(`/api/pages/${pageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: slugInput }),
    });
    if (!res.ok) throw new Error(await res.text());
    const saved = await res.json();
    setPages((prev) =>
      prev.map((p) => (p.id === pageId ? { ...p, ...saved } : p))
    );
    swrMutate?.("/api/pages");
    toast.success(`Slug updated to "${saved.slug}"`);
  } catch (err) {
    setPages(before); // revert
    toast.error("Failed to update slug (possible conflict)");
  }
};

// New lightweight entities for instant creation
type PageMeta = {
  id: string;
  title: string;
  elements: PageElement[];
  isTemporary?: boolean;
  status?: "draft" | "published";
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
};

type TemplateMeta = {
  id: string;
  name: string;
  elements: PageElement[];
  isTemporary?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type LandingPageMeta = {
  id: string;
  title: string;
  elements: PageElement[];
  isTemporary?: boolean;
  campaign?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function PageBuilder() {
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(
    null
  );

  // Active canvas elements
  const [pageElements, setPageElements] = useState<PageElement[]>([
    {
      id: "section-default",
      type: "section",
      children: [
        {
          id: "column-default",
          type: "column",
          children: [
            {
              id: "widget-default",
              type: "widget",
              widgetType: "heading",
              children: [],
              content: { text: "Welcome to WebElements" },
              styles: {
                fontSize: "32px",
                fontWeight: "bold",
                textAlign: "center",
              },
              props: {},
            },
          ],
          content: {},
          styles: { padding: "20px" },
          props: { width: 12 },
        },
      ],
      content: {},
      styles: { padding: "60px 0px", backgroundColor: "#f8f9fa" },
      props: {},
    },
  ]);

  // New: simple collections for instant creation
  const [pages, setPages] = useState<PageMeta[]>([]);
  const [templates, setTemplates] = useState<TemplateMeta[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPageMeta[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);

  const [selectedDevice, setSelectedDevice] = useState<DeviceType>("desktop");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [showPagesManager, setShowPagesManager] = useState(false);
  const [showPageCreationModal, setShowPageCreationModal] = useState(false); // kept for compatibility
  const [showMenusManager, setShowMenusManager] = useState(false);
  const [showGridSettings, setShowGridSettings] = useState(false);
  const [showNewOptionsModal, setShowNewOptionsModal] = useState(false);
  const [showMediaManager, setShowMediaManager] = useState(false);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showLandingPageCreator, setShowLandingPageCreator] = useState(false);

  // Grid configuration state
  const [gridConfig, setGridConfig] = useState({
    columns: 12,
    gutterWidth: 20,
    rowHeight: 20,
    snapToGrid: false,
    showGrid: false,
    responsive: {
      desktop: { columns: 12, gutterWidth: 20, rowHeight: 20 },
      tablet: { columns: 8, gutterWidth: 16, rowHeight: 16 },
      mobile: { columns: 4, gutterWidth: 12, rowHeight: 12 },
    },
  });

  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    fonts: {
      primaryFont: "Inter",
      secondaryFont: "Roboto",
      headingFont: "Montserrat",
      baseFontSize: 16,
      lineHeight: 1.6,
      letterSpacing: 0,
    },
    colors: {
      primary: "#92003b",
      secondary: "#b8004a",
      accent: "#e11d48",
      text: "#1f2937",
      textLight: "#6b7280",
      background: "#ffff",
      surface: "#f9fafb",
      border: "#e5e7eb",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },
    theme: {
      mode: "light",
      borderRadius: 8,
      buttonStyle: "rounded",
      shadowStyle: "medium",
      animationStyle: "smooth",
    },
    layout: {
      containerWidth: 1200,
      contentSpacing: 20,
      sectionSpacing: 60,
      columnGap: 20,
      responsiveBreakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200,
      },
    },
    siteIdentity: {
      siteTitle: "My Website",
      siteDescription: "Built with Elementor",
      logoUrl: "",
      faviconUrl: "",
    },
  });

  const {
    undo,
    redo,
    push,
    getCurrentElements,
    canUndo,
    canRedo,
    getUndoDescription,
    getRedoDescription,
    getHistorySize,
    getCurrentPosition,
  } = useHistoryManager(pageElements);

  // Update page elements and push to history
  const updatePageElements = useCallback(
    async (newElements: PageElement[], description?: string) => {
      setPageElements(newElements);
      push(newElements, description);

      try {
        const serializedData = safeSerializeElements(newElements);
        const storageResult = await setStorageItem(
          "pagebuilder-preview",
          serializedData,
          {
            compress: true,
            useIndexedDB: true,
            fallbackToMemory: true,
          }
        );

        if (storageResult.success) {
          const updateEvent = new CustomEvent("pagebuilder-update", {
            detail: { elements: JSON.parse(serializedData) },
          });
          window.dispatchEvent(updateEvent);
        } else {
          console.warn("Failed to store preview data:", storageResult.error);
          toast.warning(
            "Preview storage is full. Some features may be limited."
          );
        }
      } catch (error) {
        console.error("Error triggering real-time preview update:", error);
        toast.error(
          "Failed to update preview. Please try refreshing the page."
        );
      }
    },
    [push]
  );

  // Initialize widget registry
  useEffect(() => {
    console.log("Widget registry initialized");
  }, []);

  useEffect(() => {
    const handleOpenProperties = (event: CustomEvent) => {
      if (event.detail && event.detail.element) {
        setSelectedElement(event.detail.element);
        setTimeout(() => {
          const propertiesPanel = document.querySelector(
            "[data-properties-panel]"
          );
          if (propertiesPanel) {
            propertiesPanel.scrollIntoView({ behavior: "smooth" });
          }
        }, 150);
      }
    };

    document.addEventListener(
      "open-properties",
      handleOpenProperties as EventListener
    );
    return () => {
      document.removeEventListener(
        "open-properties",
        handleOpenProperties as EventListener
      );
    };
  }, []);

  const handleSave = () => {
    try {
      const serializedData = safeSerializeElements(pageElements);
      localStorage.setItem("pagebuilder-data", serializedData);
      toast.success("Page saved locally");
    } catch (error) {
      console.error("Error saving page:", error);
      toast.error(
        "Error saving page data. Please check the console for details."
      );
    }
  };

  useKeyboardShortcuts(
    () => {
      const result = undo();
      if (result) setPageElements(result.elements);
    },
    () => {
      const result = redo();
      if (result) setPageElements(result.elements);
    },
    handleSave
  );

  const handleElementSelect = (element: PageElement) =>
    setSelectedElement(element);

  const handleElementUpdate = async (
    elementId: string,
    updates: Partial<PageElement>
  ) => {
    const updateElement = (elements: PageElement[]): PageElement[] => {
      return elements.map((el) => {
        if (el.id === elementId) {
          const updatedElement = { ...el, ...updates };
          return updatedElement;
        }
        if (el.children && el.children.length > 0) {
          return { ...el, children: updateElement(el.children) };
        }
        return el;
      });
    };

    const newElements = updateElement(pageElements);
    await updatePageElements(
      newElements,
      `Update ${updates.content?.text || updates.widgetType || "element"}`
    );
  };

  const handleElementAdd = async (
    newElements: PageElement[],
    description: string
  ) => {
    await updatePageElements(newElements, description);
  };

  const handleDeviceChange = (device: DeviceType) => setSelectedDevice(device);
  const handlePreviewMode = () => setIsPreviewMode(!isPreviewMode);
  const handleUndo = () => {
    const result = undo();
    if (result) setPageElements(result.elements);
  };
  const handleRedo = () => {
    const result = redo();
    if (result) setPageElements(result.elements);
  };
  const handleShowNavigator = () => setShowNavigator(true);
  const handleShowHistory = () => setShowHistory(true);
  const handleShowKeyboardShortcuts = () => setShowKeyboardShortcuts(true);
  const handleShowTemplates = () => setShowTemplates(true);
  const handleShowGlobalSettings = () => setShowGlobalSettings(true);
  const handleShowPagesManager = () => setShowPagesManager(true);
  const handleShowPageCreationModal = () => setShowPageCreationModal(true);
  const handleShowMenusManager = () => setShowMenusManager(true);
  const handleShowGridSettings = () => setShowGridSettings(true);

  // Helper to create default page elements for a new page/template/landing
  const createDefaultPageElements = (title: string): PageElement[] => [
    {
      id: `section-${Date.now()}`,
      type: "section",
      children: [
        {
          id: `column-${Date.now()}-1`,
          type: "column",
          children: [
            {
              id: `widget-${Date.now()}-1`,
              type: "widget",
              widgetType: "heading",
              children: [],
              content: { text: title },
              styles: {
                fontSize: "32px",
                fontWeight: "bold",
                textAlign: "center",
              },
              props: {},
            },
          ],
          content: {},
          styles: { padding: "20px" },
          props: { width: 12 },
        },
      ],
      content: {},
      styles: { padding: "60px 0px", backgroundColor: "#f8f9fa" },
      props: {},
    },
  ];

  // INSTANT CREATE: Page
  const handleCreatePage = async (initial?: Partial<PageMeta>) => {
    const tempId = uuidv4();
    const title = initial?.title || "Untitled Page";
    const defaultElements = createDefaultPageElements(title);

    const newItem: PageMeta = {
      id: tempId,
      title,
      elements: defaultElements,
      status: "draft",
      isTemporary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistic UI
    setPages((prev) => [...prev, newItem]);
    setActivePageId(tempId);
    await updatePageElements(defaultElements, `Create page: ${title}`);

    // Persist in background
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content: JSON.stringify(defaultElements),
          status: "draft",
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create page");
      }
      const saved = await res.json();
      setPages((prev) =>
        prev.map((p) =>
          p.id === tempId ? { ...p, ...saved, isTemporary: false } : p
        )
      );
      setActivePageId(saved.id);
      toast.success(`Page "${title}" created`);
    } catch (err) {
      console.error("Failed to save Page to DB", err);
      toast.error("Page created locally. Sync failed.");
    }
  };

  // INSTANT CREATE: Template
  const handleCreateTemplate = async (initial?: Partial<TemplateMeta>) => {
    const tempId = uuidv4();
    const name = initial?.name || "Untitled Template";
    // Templates often created from current canvas elements or empty; choose empty structure here
    const defaultElements = createDefaultPageElements(name);

    const newItem: TemplateMeta = {
      id: tempId,
      name,
      elements: defaultElements,
      isTemporary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [...prev, newItem]);

    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          content: JSON.stringify(defaultElements),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create template");
      }
      const saved = await res.json();
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === tempId ? { ...t, ...saved, isTemporary: false } : t
        )
      );
      toast.success(`Template "${name}" created`);
    } catch (err) {
      console.error("Failed to save Template to DB", err);
      toast.error("Template created locally. Sync failed.");
    }
  };

  // INSTANT CREATE: Landing Page
  const handleCreateLandingPage = async (data?: Partial<LandingPageMeta>) => {
    const tempId = uuidv4();
    const title = data?.title || "Untitled Landing";
    const defaultElements = createDefaultPageElements(title);

    const newItem: LandingPageMeta = {
      id: tempId,
      title,
      campaign: data?.campaign,
      elements: defaultElements,
      isTemporary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setLandingPages((prev) => [...prev, newItem]);

    // Optionally load landing into canvas immediately
    await updatePageElements(defaultElements, `Create landing: ${title}`);

    try {
      const res = await fetch("/api/landings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          campaign: data?.campaign,
          content: JSON.stringify(defaultElements),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to create landing page");
      }
      const saved = await res.json();
      setLandingPages((prev) =>
        prev.map((l) =>
          l.id === tempId ? { ...l, ...saved, isTemporary: false } : l
        )
      );
      toast.success(`Landing "${title}" created`);
    } catch (err) {
      console.error("Failed to save Landing to DB", err);
      toast.error("Landing created locally. Sync failed.");
    }
  };

  const handleElementReorder = (
    elementId: string,
    newParentId: string | null,
    index: number
  ) => {
    console.log(
      "Reorder element:",
      elementId,
      "to parent:",
      newParentId,
      "at index:",
      index
    );
  };

  const handleTemplateLoad = async (templateElements: PageElement[]) => {
    setPageElements(templateElements);
    await updatePageElements(templateElements, "Load template");
    setShowTemplates(false);
  };

  const handleLandingPageCreate = async (landingPageData: any) => {
    // Use instant creator with provided data
    await handleCreateLandingPage({
      title: landingPageData?.title,
      campaign: landingPageData?.campaign,
    });
    setShowLandingPageCreator(false);
  };

  const handleGridConfigChange = (newConfig: typeof gridConfig) => {
    setGridConfig(newConfig);
    try {
      localStorage.setItem("grid-config", JSON.stringify(newConfig));
    } catch (error) {
      console.error("Error saving grid configuration:", error);
    }
  };

  const handlePageCreated = async (createdPage: any) => {
    // Keep for compatibility: load arbitrary page payloads into canvas
    try {
      let newElements: PageElement[] = [];

      if (createdPage.content) {
        try {
          const parsedContent = JSON.parse(createdPage.content);
          if (parsedContent && typeof parsedContent === "object") {
            newElements = Array.isArray(parsedContent)
              ? parsedContent
              : [parsedContent];
          }
        } catch (e) {
          newElements = createDefaultPageElements(
            createdPage.title || "New Page"
          );
        }
      } else {
        newElements = createDefaultPageElements(
          createdPage.title || "New Page"
        );
      }

      await updatePageElements(newElements, `Load page: ${createdPage.title}`);

      if (newElements.length > 0) {
        setTimeout(() => {
          setSelectedElement(newElements[0]);
          const event = new CustomEvent("open-properties", {
            detail: { element: newElements[0] },
          });
          document.dispatchEvent(event);
        }, 100);
      }

      setTimeout(() => {
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50";
        notification.textContent = `Page "${createdPage.title}" created and loaded successfully!`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }, 500);
    } catch (error) {
      console.error("Error loading page content into canvas:", error);
    }
  };

  const handleGlobalSettingsChange = (newSettings: GlobalSettings) => {
    setGlobalSettings(newSettings);
    try {
      localStorage.setItem("global-settings", JSON.stringify(newSettings));
    } catch (error) {
      console.error("Error saving global settings:", error);
    }
  };

  const handleGlobalSettingsReset = () => {
    const defaultSettings: GlobalSettings = {
      fonts: {
        primaryFont: "Inter",
        secondaryFont: "Roboto",
        headingFont: "Montserrat",
        baseFontSize: 16,
        lineHeight: 1.6,
        letterSpacing: 0,
      },
      colors: {
        primary: "#92003b",
        secondary: "#b8004a",
        accent: "#e11d48",
        text: "#1f2937",
        textLight: "#6b7280",
        background: "#ffff",
        surface: "#f9fafb",
        border: "#e5e7eb",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
      theme: {
        mode: "light",
        borderRadius: 8,
        buttonStyle: "rounded",
        shadowStyle: "medium",
        animationStyle: "smooth",
      },
      layout: {
        containerWidth: 1200,
        contentSpacing: 20,
        sectionSpacing: 60,
        columnGap: 20,
        responsiveBreakpoints: {
          mobile: 768,
          tablet: 1024,
          desktop: 1200,
        },
      },
      siteIdentity: {
        siteTitle: "My Website",
        siteDescription: "Built with Elementor",
        logoUrl: "",
        faviconUrl: "",
      },
    };
    setGlobalSettings(defaultSettings);
    localStorage.removeItem("global-settings");
  };

  // New Options: instant create
  const handleShowNewOptions = () => setShowNewOptionsModal(true);
  const handleNewOptionSelect = (option: string) => {
    switch (option) {
      case "media":
        setShowMediaManager(true);
        break;
      case "page":
        setShowNewOptionsModal(false);
        handleCreatePage();
        break;
      case "landing":
        setShowNewOptionsModal(false);
        // If you still want to collect extra fields, you can open the creator form
        // setShowLandingPageCreator(true)
        // Or create instantly with defaults:
        handleCreateLandingPage();
        break;
      case "template":
        setShowNewOptionsModal(false);
        handleCreateTemplate();
        break;
      default:
        break;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <TopToolbar
        selectedDevice={selectedDevice}
        onDeviceChange={handleDeviceChange}
        onPreviewMode={handlePreviewMode}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        canUndo={canUndo}
        canRedo={canRedo}
        undoDescription={getUndoDescription()}
        redoDescription={getRedoDescription()}
        elements={pageElements}
        onElementsUpdate={setPageElements}
        onElementAdd={handleElementAdd}
        onShowNavigator={handleShowNavigator}
        onShowHistory={handleShowHistory}
        onShowKeyboardShortcuts={handleShowKeyboardShortcuts}
        onShowTemplates={handleShowTemplates}
        onShowGlobalSettings={handleShowGlobalSettings}
        onShowPagesManager={handleShowPagesManager}
        onShowMenusManager={handleShowMenusManager}
        onShowGridSettings={handleShowGridSettings}
        onShowNewOptions={handleShowNewOptions}
      />

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Panel - Widgets */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <WidgetsPanel
            onWidgetAdd={async (widgetType, widgetData) => {
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
                      styles: widgetData.defaultStyles,
                      props: { width: 12 },
                    },
                  ],
                  content: widgetData.defaultContent,
                  styles: widgetData.defaultStyles,
                  props: widgetData.defaultProps,
                };
              } else if (widgetType === "column") {
                newElement = {
                  id: `column-${Date.now()}`,
                  type: "column",
                  children: [],
                  content: widgetData.defaultContent,
                  styles: widgetData.defaultStyles,
                  props: { ...widgetData.defaultProps, width: 6 },
                };
              } else if (widgetType === "flex-container") {
                newElement = {
                  id: `flex-container-${Date.now()}`,
                  type: "flex-container",
                  children: [],
                  content: widgetData.defaultContent,
                  styles: widgetData.defaultStyles,
                  props: widgetData.defaultProps,
                };
              } else {
                newElement = {
                  id: `widget-${Date.now()}`,
                  type: "widget",
                  widgetType: widgetType,
                  children: [],
                  content: widgetData.defaultContent,
                  styles: widgetData.defaultStyles,
                  props: widgetData.defaultProps,
                };
              }

              const newElements = [...pageElements, newElement];
              await updatePageElements(newElements, `Add ${widgetData.name}`);
            }}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main Canvas */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="relative h-full">
            <Canvas
              elements={pageElements}
              selectedElement={selectedElement}
              onElementSelect={handleElementSelect}
              onElementUpdate={handleElementUpdate}
              onElementAdd={handleElementAdd}
              selectedDevice={selectedDevice}
              isPreviewMode={isPreviewMode}
              onDeviceChange={handleDeviceChange}
              gridConfig={{
                snapToGrid: gridConfig.snapToGrid,
                showGrid: gridConfig.showGrid,
                columns: gridConfig.responsive[selectedDevice].columns,
                gutterWidth: gridConfig.responsive[selectedDevice].gutterWidth,
                rowHeight: gridConfig.responsive[selectedDevice].rowHeight,
              }}
              containerWidth={globalSettings.layout.containerWidth}
            />
            <GridOverlay
              showGrid={gridConfig.showGrid}
              gridConfig={{
                columns: gridConfig.responsive[selectedDevice].columns,
                gutterWidth: gridConfig.responsive[selectedDevice].gutterWidth,
                rowHeight: gridConfig.responsive[selectedDevice].rowHeight,
              }}
              containerWidth={globalSettings.layout.containerWidth}
              containerHeight={800}
              className="pointer-events-none"
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Properties */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <PropertiesPanelEnhanced
            selectedElement={selectedElement}
            onElementUpdate={handleElementUpdate}
            selectedDevice={selectedDevice}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Navigator Panel Sheet */}
      <Sheet open={showNavigator} onOpenChange={setShowNavigator}>
        <SheetContent side="left" className="w-80 sm:w-96">
          <SheetHeader>
            <SheetTitle>Page Navigator</SheetTitle>
            <SheetDescription>
              View and manage your page structure
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <NavigatorPanel
              elements={pageElements}
              selectedElement={selectedElement}
              onElementSelect={handleElementSelect}
              onElementReorder={handleElementReorder}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* History Panel Sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>History</SheetTitle>
            <SheetDescription>
              View your action history and undo/redo changes
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">History Size</span>
                <Badge variant="secondary">{getHistorySize()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Position</span>
                <Badge variant="secondary">{getCurrentPosition()}</Badge>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleUndo}
                  disabled={!canUndo}
                >
                  <Undo className="w-4 h-4 mr-2" />
                  Undo - {getUndoDescription()}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleRedo}
                  disabled={!canRedo}
                >
                  <Redo className="w-4 h-4 mr-2" />
                  Redo - {getRedoDescription()}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Keyboard Shortcuts Sheet */}
      <Sheet
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      >
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Keyboard Shortcuts</SheetTitle>
            <SheetDescription>
              Quick keyboard shortcuts for common actions
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Undo</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+Z</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Redo</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+Y</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Save</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+S</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Find</span>
                <kbd className="px-2 py-1 text-xs bg-muted rounded">Ctrl+E</kbd>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Template Manager Sheet */}
      <Sheet open={showTemplates} onOpenChange={setShowTemplates}>
        <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px]">
          <SheetHeader>
            <SheetTitle>Template Manager</SheetTitle>
            <SheetDescription>
              Save, load, and manage your page templates
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full">
            <OriginalTemplateManager
              elements={pageElements}
              selectedElement={selectedElement}
              onTemplateLoad={handleTemplateLoad}
              onElementAdd={handleElementAdd}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Global Settings Sheet */}
      <Sheet open={showGlobalSettings} onOpenChange={setShowGlobalSettings}>
        <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px]">
          <SheetHeader>
            <SheetTitle>Global Settings</SheetTitle>
            <SheetDescription>
              Configure global fonts, colors, theme, and layout settings
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full">
            <GlobalSettings
              settings={globalSettings}
              onSettingsChange={handleGlobalSettingsChange}
              onReset={handleGlobalSettingsReset}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Pages Manager Sheet */}
      <Sheet open={showPagesManager} onOpenChange={setShowPagesManager}>
        <SheetContent
          side="right"
          className="w-full sm:w-[800px] lg:w-[1000px]"
        >
          <SheetHeader>
            <SheetTitle>Pages Manager</SheetTitle>
            <SheetDescription>
              Create, edit, and manage your website pages
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full overflow-y-auto">
            <PagesManagerEnhanced
              onPageSelect={(page) => {
                // Load page content into the builder
                console.log("Loading page:", page);
                toast.success(`Page "${page.title}" loaded into builder`);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Menus Manager Sheet */}
      <Sheet open={showMenusManager} onOpenChange={setShowMenusManager}>
        <SheetContent
          side="right"
          className="w-full sm:w-[800px] lg:w-[1000px]"
        >
          <SheetHeader>
            <SheetTitle>Menus Manager</SheetTitle>
            <SheetDescription>
              Create, edit, and manage your website navigation menus
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full overflow-y-auto">
            <MenusManager />
          </div>
        </SheetContent>
      </Sheet>

      {/* Grid Settings Sheet */}
      <Sheet open={showGridSettings} onOpenChange={setShowGridSettings}>
        <SheetContent side="right" className="w-full sm:w-[600px] lg:w-[800px]">
          <SheetHeader>
            <SheetTitle>Grid Settings</SheetTitle>
            <SheetDescription>
              Configure grid layout and snap-to-grid functionality
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full overflow-y-auto">
            <GridSettingsPanel
              gridConfig={gridConfig}
              onGridConfigChange={handleGridConfigChange}
              selectedDevice={selectedDevice}
              onDeviceChange={handleDeviceChange}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* New Options Modal */}
      <NewOptionsModal
        isOpen={showNewOptionsModal}
        onClose={() => setShowNewOptionsModal(false)}
        onOptionSelect={handleNewOptionSelect}
      />

      {/* Media Manager */}
      <MediaManagerEnhanced
        isOpen={showMediaManager}
        onClose={() => setShowMediaManager(false)}
        onSelectMedia={async (media: any) => {
          if (media && media.url) {
            const newImageWidget: PageElement = {
              id: `widget-${Date.now()}`,
              type: "widget",
              widgetType: "image",
              children: [],
              content: {
                url: media.url,
                alt: media.name || "Image",
                caption: "",
              },
              styles: {
                maxWidth: "100%",
                height: "auto",
                borderRadius: "8px",
              },
              props: {},
            };
            const newElements = [...pageElements, newImageWidget];
            await updatePageElements(newElements, `Add image: ${media.name}`);
            setTimeout(() => {
              setSelectedElement(newImageWidget);
              const event = new CustomEvent("open-properties", {
                detail: { element: newImageWidget },
              });
              document.dispatchEvent(event);
            }, 100);
            toast.success(`Image "${media.name}" added to canvas`);
          }
        }}
      />

      {/* Template Manager */}
      <TemplateManagerEnhanced
        isOpen={showTemplateManager}
        onClose={() => setShowTemplateManager(false)}
        onSelectTemplate={async (template: any) => {
          if (template?.content) {
            try {
              const elements = Array.isArray(template.content)
                ? template.content
                : [template.content];
              await updatePageElements(elements, "Apply template");
            } catch (error) {
              console.error("Error applying template:", error);
            }
          }
        }}
      />

      {/* Landing Page Creator (optional form) */}
      <LandingPageCreator
        isOpen={showLandingPageCreator}
        onClose={() => setShowLandingPageCreator(false)}
        onCreateLandingPage={handleLandingPageCreate}
      />
    </div>
  );
}
