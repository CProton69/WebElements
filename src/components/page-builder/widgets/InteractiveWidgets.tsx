import React from "react";
import { PageElement } from "../PageBuilder1";
import { cn } from "@/lib/utils";

interface WidgetProps {
  element: PageElement;
  isSelected: boolean;
  onSelect: (element: PageElement) => void;
  onUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  isPreviewMode: boolean;
}

// Tabs Widget
export const TabsWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [activeTab, setActiveTab] = React.useState(
    element.content?.activeTab || 0
  );

  const handleTabClick = (index: number) => {
    if (!isPreviewMode) return;
    setActiveTab(index);
  };

  const tabs = element.content?.tabs || [];

  return (
    <div
      className={cn(
        "relative",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab: any, index: number) => (
          <button
            key={index}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeTab === index
                ? "text-[#92003b] border-b-2 border-[#92003b]"
                : "text-gray-500 hover:text-gray-700"
            )}
            onClick={() => handleTabClick(index)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {tabs[activeTab] && <div>{tabs[activeTab].content}</div>}
      </div>
    </div>
  );
};

TabsWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  const tabs = element.content?.tabs || [];

  const addTab = () => {
    const newTabs = [
      ...tabs,
      { title: `Tab ${tabs.length + 1}`, content: "New tab content" },
    ];
    onUpdate(element.id, {
      content: { ...element.content, tabs: newTabs },
    });
  };

  const updateTab = (index: number, field: string, value: string) => {
    const newTabs = [...tabs];
    newTabs[index] = { ...newTabs[index], [field]: value };
    onUpdate(element.id, {
      content: { ...element.content, tabs: newTabs },
    });
  };

  const removeTab = (index: number) => {
    const newTabs = tabs.filter((_, i) => i !== index);
    onUpdate(element.id, {
      content: { ...element.content, tabs: newTabs },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Tabs</label>
        <div className="space-y-2">
          {tabs.map((tab: any, index: number) => (
            <div key={index} className="border rounded p-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tab {index + 1}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={() => removeTab(index)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Tab title"
                value={tab.title}
                onChange={(e) => updateTab(index, "title", e.target.value)}
                className="w-full p-2 border rounded text-sm"
              />
              <textarea
                placeholder="Tab content"
                value={tab.content}
                onChange={(e) => updateTab(index, "content", e.target.value)}
                className="w-full p-2 border rounded text-sm"
                rows={3}
              />
            </div>
          ))}
        </div>
        <button
          onClick={addTab}
          className="mt-2 bg-[#92003b] text-white px-3 py-1 rounded text-sm"
        >
          Add Tab
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Animation</label>
        <select
          value={element.props?.animation || "fade"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, animation: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="fade">Fade</option>
          <option value="slide">Slide</option>
          <option value="none">None</option>
        </select>
      </div>
    </div>
  );
};

// Accordion Widget
export const AccordionWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [openItems, setOpenItems] = React.useState<Set<number>>(
    new Set(
      element.content?.items
        ?.map((item: any, index: number) => (item.open ? index : -1))
        .filter((i: number) => i >= 0) || []
    )
  );

  const toggleItem = (index: number) => {
    if (!isPreviewMode) return;

    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      if (!element.props?.multipleOpen) {
        newOpenItems.clear();
      }
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const items = element.content?.items || [];

  return (
    <div
      className={cn(
        "relative",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {items.map((item: any, index: number) => (
        <div key={index} className="border-b border-gray-200 last:border-b-0">
          <button
            className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
            onClick={() => toggleItem(index)}
          >
            <span className="font-medium">{item.title}</span>
            <svg
              className={cn(
                "w-4 h-4 transition-transform",
                openItems.has(index) && "rotate-180"
              )}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {openItems.has(index) && (
            <div className="px-4 py-3 bg-gray-50">{item.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

AccordionWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  const items = element.content?.items || [];

  const addItem = () => {
    const newItems = [
      ...items,
      {
        title: `Item ${items.length + 1}`,
        content: "New item content",
        open: false,
      },
    ];
    onUpdate(element.id, {
      content: { ...element.content, items: newItems },
    });
  };

  const updateItem = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    onUpdate(element.id, {
      content: { ...element.content, items: newItems },
    });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onUpdate(element.id, {
      content: { ...element.content, items: newItems },
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Accordion Items
        </label>
        <div className="space-y-2">
          {items.map((item: any, index: number) => (
            <div key={index} className="border rounded p-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Item {index + 1}</span>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="Item title"
                value={item.title}
                onChange={(e) => updateItem(index, "title", e.target.value)}
                className="w-full p-2 border rounded text-sm"
              />
              <textarea
                placeholder="Item content"
                value={item.content}
                onChange={(e) => updateItem(index, "content", e.target.value)}
                className="w-full p-2 border rounded text-sm"
                rows={3}
              />
            </div>
          ))}
        </div>
        <button
          onClick={addItem}
          className="mt-2 bg-[#92003b] text-white px-3 py-1 rounded text-sm"
        >
          Add Item
        </button>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.multipleOpen || false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, multipleOpen: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Allow multiple items open</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Animation</label>
        <select
          value={element.props?.animation || "slide"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, animation: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="slide">Slide</option>
          <option value="fade">Fade</option>
          <option value="none">None</option>
        </select>
      </div>
    </div>
  );
};

// Toggle Widget
export const ToggleWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [isChecked, setIsChecked] = React.useState(
    element.content?.checked || false
  );

  const handleToggle = () => {
    if (!isPreviewMode) return;
    const newValue = !isChecked;
    setIsChecked(newValue);
    onUpdate(element.id, {
      content: { ...element.content, checked: newValue },
    });
  };

  return (
    <div
      className={cn(
        "relative flex items-center space-x-3",
        isSelected &&
          !isPreviewMode &&
          "ring-2 ring-[#92003b] bg-[#92003b]/5 rounded p-2"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      <button
        onClick={handleToggle}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          isChecked ? "bg-[#92003b]" : "bg-gray-200"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            isChecked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>

      <span className="text-sm font-medium">
        {element.content?.label || "Toggle"}
      </span>
    </div>
  );
};

ToggleWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Label</label>
        <input
          type="text"
          value={element.content?.label || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, label: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Default State</label>
        <select
          value={element.content?.checked ? "checked" : "unchecked"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                checked: e.target.value === "checked",
              },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="unchecked">Unchecked</option>
          <option value="checked">Checked</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Size</label>
        <select
          value={element.props?.size || "medium"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, size: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </div>
    </div>
  );
};
