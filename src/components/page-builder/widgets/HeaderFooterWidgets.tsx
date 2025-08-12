import React, { useState, useEffect } from "react";
import { PageElement } from "../PageBuilder1";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Layout,
  Menu,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  ExternalLink,
  FileText,
  Settings,
} from "lucide-react";

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

// Header Widget
export const HeaderWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      if (isPreviewMode) {
        try {
          const response = await fetch("/api/menus");
          if (response.ok) {
            const data = await response.json();
            setMenus(data.menus || []);
          }
        } catch (error) {
          console.error("Error fetching menus:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMenus();
  }, [isPreviewMode]);

  const getHeaderMenu = () => {
    const headerMenu = menus.find((menu) => menu.location === "header");
    return headerMenu ? JSON.parse(headerMenu.items || "[]") : [];
  };

  const renderMenuItems = (items: any[]) => {
    return (
      <ul className="flex space-x-6">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target={item.target === "_blank" ? "_blank" : undefined}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              className="text-gray-700 hover:text-[#92003b] transition-colors font-medium"
            >
              {item.title}
            </a>
            {item.children && item.children.length > 0 && (
              <div className="absolute top-full left-0 bg-white shadow-lg rounded-lg p-4 min-w-[200px] hidden group-hover:block">
                {renderDropdownItems(item.children)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  const renderDropdownItems = (items: any[]) => {
    return (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target={item.target === "_blank" ? "_blank" : undefined}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              className="text-gray-700 hover:text-[#92003b] transition-colors block py-1"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    );
  };

  const menuItems = getHeaderMenu();

  return (
    <header
      className={cn(
        "bg-white shadow-sm border-b",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            {element.content?.logoUrl ? (
              <img
                src={element.content.logoUrl}
                alt="Logo"
                className="h-8 w-auto"
              />
            ) : (
              <div className="text-xl font-bold text-[#92003b]">
                {element.content?.siteTitle || "Your Site"}
              </div>
            )}
          </div>

          {/* Navigation */}
          {isPreviewMode && (
            <nav className="hidden md:flex">
              {menuItems.length > 0 ? (
                renderMenuItems(menuItems)
              ) : (
                <div className="text-gray-500">No header menu configured</div>
              )}
            </nav>
          )}

          {/* Contact Info */}
          {isPreviewMode && element.content?.showContact && (
            <div className="hidden lg:flex items-center space-x-4 text-sm">
              {element.content?.phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{element.content.phone}</span>
                </div>
              )}
              {element.content?.email && (
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{element.content.email}</span>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          {isPreviewMode && (
            <button className="md:hidden p-2">
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// Properties Panel for Header Widget
const HeaderWidgetPropertiesPanel = ({
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
          Logo & Branding
        </label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Site Title
            </label>
            <input
              type="text"
              value={element.content?.siteTitle || ""}
              onChange={(e) => handleContentChange("siteTitle", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="Your Site Name"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Logo URL</label>
            <input
              type="text"
              value={element.content?.logoUrl || ""}
              onChange={(e) => handleContentChange("logoUrl", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="https://example.com/logo.png"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Contact Information
        </label>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={element.content?.showContact || false}
              onChange={(e) =>
                handleContentChange("showContact", e.target.checked)
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Show Contact Info</span>
          </label>
          {element.content?.showContact && (
            <>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={element.content?.phone || ""}
                  onChange={(e) => handleContentChange("phone", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="text"
                  value={element.content?.email || ""}
                  onChange={(e) => handleContentChange("email", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="info@example.com"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

HeaderWidget.PropertiesPanel = HeaderWidgetPropertiesPanel;

// Footer Widget
export const FooterWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenus = async () => {
      if (isPreviewMode) {
        try {
          const response = await fetch("/api/menus");
          if (response.ok) {
            const data = await response.json();
            setMenus(data.menus || []);
          }
        } catch (error) {
          console.error("Error fetching menus:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMenus();
  }, [isPreviewMode]);

  const getFooterMenu = () => {
    const footerMenu = menus.find((menu) => menu.location === "footer");
    return footerMenu ? JSON.parse(footerMenu.items || "[]") : [];
  };

  const menuItems = getFooterMenu();

  return (
    <footer
      className={cn(
        "bg-gray-900 text-white",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          {element.content?.showAbout && (
            <div>
              <h3 className="text-lg font-semibold mb-4">About</h3>
              <p className="text-gray-300 text-sm">
                {element.content?.aboutText ||
                  "Your company description goes here."}
              </p>
              {element.content?.socialLinks && (
                <div className="flex space-x-3 mt-4">
                  <a href="#" className="text-gray-400 hover:text-white">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Quick Links */}
          {menuItems.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.url}
                      className="text-gray-300 hover:text-white text-sm transition-colors"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          {element.content?.showContact && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-gray-300">
                {element.content?.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{element.content.address}</span>
                  </div>
                )}
                {element.content?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{element.content.phone}</span>
                  </div>
                )}
                {element.content?.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{element.content.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Newsletter */}
          {element.content?.showNewsletter && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-300 text-sm mb-4">
                Subscribe to our newsletter for updates.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-sm focus:outline-none focus:border-[#92003b]"
                />
                <button className="px-4 py-2 bg-[#92003b] text-white rounded-r-md hover:bg-[#b8004a] transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {element.content?.copyright || "Your Company"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Properties Panel for Footer Widget
const FooterWidgetPropertiesPanel = ({
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
        <label className="block text-sm font-medium mb-2">Footer Content</label>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Copyright Text
            </label>
            <input
              type="text"
              value={element.content?.copyright || ""}
              onChange={(e) => handleContentChange("copyright", e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="Your Company"
            />
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={element.content?.showAbout || false}
              onChange={(e) =>
                handleContentChange("showAbout", e.target.checked)
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Show About Section</span>
          </label>
          {element.content?.showAbout && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                About Text
              </label>
              <textarea
                value={element.content?.aboutText || ""}
                onChange={(e) =>
                  handleContentChange("aboutText", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                placeholder="Your company description goes here."
              />
            </div>
          )}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={element.content?.socialLinks || false}
              onChange={(e) =>
                handleContentChange("socialLinks", e.target.checked)
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Show Social Links</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Contact Information
        </label>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={element.content?.showContact || false}
              onChange={(e) =>
                handleContentChange("showContact", e.target.checked)
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm">Show Contact Info</span>
          </label>
          {element.content?.showContact && (
            <>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Address
                </label>
                <textarea
                  value={element.content?.address || ""}
                  onChange={(e) =>
                    handleContentChange("address", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  rows={2}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  value={element.content?.phone || ""}
                  onChange={(e) => handleContentChange("phone", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="text"
                  value={element.content?.email || ""}
                  onChange={(e) => handleContentChange("email", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  placeholder="info@example.com"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Newsletter</label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.showNewsletter || false}
            onChange={(e) =>
              handleContentChange("showNewsletter", e.target.checked)
            }
            className="rounded border-gray-300"
          />
          <span className="text-sm">Show Newsletter Signup</span>
        </label>
      </div>
    </div>
  );
};

FooterWidget.PropertiesPanel = FooterWidgetPropertiesPanel;
