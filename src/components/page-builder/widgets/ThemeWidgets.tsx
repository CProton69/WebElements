import React, { useState, useEffect } from "react";
import { PageElement } from "../PageBuilder1";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Menu,
  ChevronRight,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { realtimeManager } from "@/lib/realtime";

interface WidgetProps {
  element: PageElement;
  isSelected: boolean;
  onSelect: (element: PageElement) => void;
  onUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  isPreviewMode: boolean;
  selectedDevice?: string;
  renderChild?: (props: {
    element: PageElement;
    depth: number;
  }) => React.ReactNode;
}

// Page List Widget
export const PageListWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch("/api/pages");
        if (response.ok) {
          const data = await response.json();
          setPages(data.pages || []);
        }
      } catch (error) {
        console.error("Error fetching pages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isPreviewMode) {
      fetchPages();
    }
  }, [isPreviewMode]);

  const handlePageClick = (page: any) => {
    if (element.content?.openInNewTab) {
      window.open(`/${page.slug}`, "_blank");
    } else {
      window.location.href = `/${page.slug}`;
    }
  };

  if (loading) {
    return (
      <div
        className={cn(
          "p-4 bg-gray-50 rounded-lg",
          isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
        )}
        style={element.styles}
        onClick={() => !isPreviewMode && onSelect(element)}
      >
        <div className="animate-pulse">Loading pages...</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-2",
        isSelected &&
          !isPreviewMode &&
          "ring-2 ring-[#92003b] bg-[#92003b]/5 rounded-lg p-2"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {pages.length === 0 ? (
        <div className="text-gray-500 text-center py-4">No pages found</div>
      ) : (
        pages.map((page) => (
          <div
            key={page.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors",
              element.content?.showExcerpt && "flex-col items-start"
            )}
            onClick={() => handlePageClick(page)}
          >
            <div className="flex items-center space-x-3 flex-1">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <h3 className="font-medium text-gray-900">{page.title}</h3>
                {element.content?.showExcerpt && page.excerpt && (
                  <p className="text-sm text-gray-600 mt-1">{page.excerpt}</p>
                )}
                {element.content?.showDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {element.content?.showIcon && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        ))
      )}
    </div>
  );
};

// Properties Panel for Page List Widget
PageListWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  const handleContentChange = (key: string, value: any) => {
    onUpdate(element.id, {
      content: { ...element.content, [key]: value },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Display Options
        </label>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={element.content?.showExcerpt || false}
              onChange={(e) =>
                handleContentChange("showExcerpt", e.target.checked)
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Show Excerpt</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={element.content?.showDate || false}
              onChange={(e) =>
                handleContentChange("showDate", e.target.checked)
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Show Date</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={element.content?.showIcon || false}
              onChange={(e) =>
                handleContentChange("showIcon", e.target.checked)
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Show Navigation Icon</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={element.content?.openInNewTab || false}
              onChange={(e) =>
                handleContentChange("openInNewTab", e.target.checked)
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Open in New Tab</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Navigation Menu Widget
export const NavigationMenuWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [menus, setMenus] = useState<any[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch("/api/menus");
        if (response.ok) {
          const data = await response.json();
          setMenus(data.menus || []);
          console.log("NavigationMenuWidget loaded menus:", data.menus);

          // Auto-select first menu or use configured menu
          const menuId = element.content?.menuId;
          const menuToSelect = menuId
            ? data.menus.find((m: any) => m.id === menuId)
            : data.menus[0];
          setSelectedMenu(menuToSelect || null);
          console.log("Selected menu:", menuToSelect);
        }
      } catch (error) {
        console.error("Error fetching menus:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isPreviewMode) {
      fetchMenus();
    }
  }, [isPreviewMode, element.content?.menuId]);

  // Set up real-time updates
  useEffect(() => {
    if (!isPreviewMode) return;

    const handleRealtimeUpdate = (event: CustomEvent) => {
      const update = event.detail;
      if (update.type === "menu") {
        console.log(
          "NavigationMenuWidget received real-time menu update:",
          update
        );
        fetchMenus();
      }
    };

    const unsubscribe = realtimeManager.subscribe((update) => {
      if (update.type === "menu") {
        console.log(
          "NavigationMenuWidget received real-time menu update:",
          update
        );
        fetchMenus();
      }
    });

    // Also listen for custom events
    window.addEventListener(
      "realtime-update",
      handleRealtimeUpdate as EventListener
    );

    return () => {
      unsubscribe();
      window.removeEventListener(
        "realtime-update",
        handleRealtimeUpdate as EventListener
      );
    };
  }, [isPreviewMode, element.content?.menuId]);

  const renderMenuItems = (items: any[], depth = 0) => {
    return (
      <ul className={cn(depth === 0 ? "space-y-1" : "ml-4 space-y-1")}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target={item.target === "_blank" ? "_blank" : undefined}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              className={cn(
                "flex items-center justify-between p-2 rounded hover:bg-gray-100 transition-colors",
                depth === 0 ? "font-medium" : "text-sm"
              )}
            >
              <span>{item.label}</span>
              {item.target === "_blank" && (
                <ExternalLink className="w-3 h-3 text-gray-400" />
              )}
            </a>
            {item.children &&
              item.children.length > 0 &&
              renderMenuItems(item.children, depth + 1)}
          </li>
        ))}
      </ul>
    );
  };

  if (loading) {
    return (
      <div
        className={cn(
          "p-4 bg-gray-50 rounded-lg",
          isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
        )}
        style={element.styles}
        onClick={() => !isPreviewMode && onSelect(element)}
      >
        <div className="animate-pulse">Loading menu...</div>
      </div>
    );
  }

  return (
    <nav
      className={cn(
        isSelected &&
          !isPreviewMode &&
          "ring-2 ring-[#92003b] bg-[#92003b]/5 rounded-lg p-2"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {selectedMenu ? (
        <div className="space-y-2">
          {element.content?.showTitle && (
            <h3 className="font-semibold text-gray-900 mb-2">
              {selectedMenu.name}
            </h3>
          )}
          {renderMenuItems(JSON.parse(selectedMenu.items || "[]"))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-4">
          <Menu className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>No menu selected</p>
          {!isPreviewMode && (
            <p className="text-sm mt-1">
              Select a menu in the properties panel
            </p>
          )}
        </div>
      )}
    </nav>
  );
};

// Properties Panel for Navigation Menu Widget
const NavigationMenuWidgetPropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await fetch("/api/menus");
        if (response.ok) {
          const data = await response.json();
          setMenus(data.menus || []);
          console.log("Loaded menus:", data.menus);
        }
      } catch (error) {
        console.error("Error fetching menus:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenus();
  }, []);

  // Set up real-time updates
  useEffect(() => {
    const handleRealtimeUpdate = (event: CustomEvent) => {
      const update = event.detail;
      if (update.type === "menu") {
        console.log(
          "NavigationMenuWidgetPropertiesPanel received real-time menu update:",
          update
        );
        fetchMenus();
      }
    };

    const unsubscribe = realtimeManager.subscribe((update) => {
      if (update.type === "menu") {
        console.log(
          "NavigationMenuWidgetPropertiesPanel received real-time menu update:",
          update
        );
        fetchMenus();
      }
    });

    // Also listen for custom events
    window.addEventListener(
      "realtime-update",
      handleRealtimeUpdate as EventListener
    );

    return () => {
      unsubscribe();
      window.removeEventListener(
        "realtime-update",
        handleRealtimeUpdate as EventListener
      );
    };
  }, []);

  const handleContentChange = (key: string, value: any) => {
    console.log(
      "NavigationMenuWidgetPropertiesPanel handleContentChange:",
      key,
      "=",
      value
    );
    onUpdate(element.id, {
      content: { ...element.content, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Menu Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Select Menu</Label>
        {loading ? (
          <div className="flex items-center justify-center p-4 border border-gray-200 rounded-md">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span className="ml-2 text-sm text-gray-500">Loading menus...</span>
          </div>
        ) : (
          <Select
            value={element.content?.menuId || ""}
            onValueChange={(value) => {
              console.log("Menu selected:", value);
              handleContentChange("menuId", value);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a menu..." />
            </SelectTrigger>
            <SelectContent>
              {menus.length === 0 ? (
                <SelectItem value="" disabled>
                  No menus available
                </SelectItem>
              ) : (
                menus.map((menu) => (
                  <SelectItem key={menu.id} value={menu.id}>
                    {menu.name} {menu.location && `(${menu.location})`}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
        {menus.length === 0 && !loading && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              No menus found. Create a menu first in the menu manager.
            </p>
          </div>
        )}
      </div>

      {/* Display Options */}
      <div className="space-y-4">
        <Label className="text-sm font-medium">Display Options</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="showTitle"
              checked={element.content?.showTitle || false}
              onCheckedChange={(checked) =>
                handleContentChange("showTitle", checked)
              }
            />
            <Label htmlFor="showTitle" className="text-sm">
              Show Menu Title
            </Label>
          </div>
        </div>
      </div>

      {/* Menu Information */}
      {element.content?.menuId && (
        <div className="p-3 bg-gray-50 rounded-md">
          <Label className="text-sm font-medium text-gray-700">
            Menu Information
          </Label>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Selected Menu:</span>
              <span className="font-medium">
                {menus.find((m) => m.id === element.content?.menuId)?.name ||
                  "Unknown"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium">
                {menus.find((m) => m.id === element.content?.menuId)
                  ?.location || "Unassigned"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

NavigationMenuWidget.PropertiesPanel = NavigationMenuWidgetPropertiesPanel;

// Breadcrumb Widget
export const BreadcrumbWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [currentPage, setCurrentPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current page from URL
    const getCurrentPage = async () => {
      try {
        const path = window.location.pathname;
        if (path === "/") {
          // Home page
          setCurrentPage({ title: "Home", slug: "" });
        } else {
          // Find page by slug
          const slug = path.replace(/^\//, "");
          const response = await fetch("/api/pages");
          if (response.ok) {
            const data = await response.json();
            const page = data.pages.find((p: any) => p.slug === slug);
            setCurrentPage(page || { title: "Unknown Page", slug });
          }
        }
      } catch (error) {
        console.error("Error getting current page:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isPreviewMode) {
      getCurrentPage();
    }
  }, [isPreviewMode]);

  if (loading) {
    return (
      <div
        className={cn(
          "p-2 bg-gray-50 rounded",
          isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
        )}
        style={element.styles}
        onClick={() => !isPreviewMode && onSelect(element)}
      >
        <div className="animate-pulse text-sm">Loading...</div>
      </div>
    );
  }

  const breadcrumbItems = [
    { title: "Home", url: "/" },
    ...(currentPage && currentPage.slug
      ? [{ title: currentPage.title, url: `/${currentPage.slug}` }]
      : []),
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center space-x-2 text-sm",
        isSelected &&
          !isPreviewMode &&
          "ring-2 ring-[#92003b] bg-[#92003b]/5 rounded p-1"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={item.url}>
          {index > 0 && <span className="text-gray-400">/</span>}
          <a
            href={item.url}
            className={cn(
              "hover:text-[#92003b] transition-colors",
              index === breadcrumbItems.length - 1
                ? "text-gray-900 font-medium"
                : "text-gray-600"
            )}
          >
            {item.title}
          </a>
        </React.Fragment>
      ))}
    </nav>
  );
};

// Properties Panel for Breadcrumb Widget
BreadcrumbWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Breadcrumb Settings
        </label>
        <p className="text-sm text-gray-600">
          Breadcrumb automatically shows the current page navigation path.
        </p>
      </div>
    </div>
  );
};
