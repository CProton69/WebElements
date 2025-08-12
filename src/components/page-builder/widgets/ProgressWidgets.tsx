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

// Progress Bar Widget
export const ProgressWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const value = element.content?.value || 0;
  const max = element.content?.max || 100;
  const showPercentage = element.content?.showPercentage || false;
  const label = element.content?.label || "";

  const percentage = Math.round((value / max) * 100);

  return (
    <div
      className={cn(
        "relative",
        isSelected &&
          !isPreviewMode &&
          "ring-2 ring-[#92003b] bg-[#92003b]/5 rounded p-2"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {label && <div className="text-sm font-medium mb-2">{label}</div>}

      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full bg-[#92003b] transition-all duration-500",
            element.props?.striped && "bg-stripes",
            element.props?.animated && "animate-pulse"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showPercentage && (
        <div className="text-sm text-gray-600 mt-1 text-right">
          {percentage}%
        </div>
      )}
    </div>
  );
};

ProgressWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
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
        <label className="block text-sm font-medium mb-2">Value</label>
        <input
          type="number"
          min="0"
          max={element.content?.max || 100}
          value={element.content?.value || 0}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                value: parseInt(e.target.value) || 0,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Maximum Value</label>
        <input
          type="number"
          min="1"
          value={element.content?.max || 100}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                max: parseInt(e.target.value) || 100,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.showPercentage || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: {
                  ...element.content,
                  showPercentage: e.target.checked,
                },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Show percentage</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.animated || false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, animated: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Animated</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.striped || false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, striped: e.target.checked },
              })
            }
            className="rounded"
          />
          <span className="text-sm">Striped</span>
        </label>
      </div>
    </div>
  );
};

// Counter Widget
export const CounterWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const [count, setCount] = React.useState(0);
  const targetValue = element.content?.value || 1000;
  const duration = element.content?.duration || 2000;
  const prefix = element.content?.prefix || "";
  const suffix = element.content?.suffix || "";
  const label = element.content?.label || "";

  React.useEffect(() => {
    if (!isPreviewMode) return;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentValue = Math.floor(progress * targetValue);
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [targetValue, duration, isPreviewMode]);

  const formatNumber = (num: number) => {
    const decimals = element.props?.decimals || 0;
    return num.toFixed(decimals);
  };

  return (
    <div
      className={cn(
        "relative text-center",
        isSelected &&
          !isPreviewMode &&
          "ring-2 ring-[#92003b] bg-[#92003b]/5 rounded p-2"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      <div className="text-4xl font-bold text-[#92003b] mb-2">
        {prefix}
        {formatNumber(count)}
        {suffix}
      </div>

      {label && <div className="text-lg text-gray-600">{label}</div>}
    </div>
  );
};

CounterWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Target Value</label>
        <input
          type="number"
          min="0"
          value={element.content?.value || 1000}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                value: parseInt(e.target.value) || 1000,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Prefix</label>
        <input
          type="text"
          value={element.content?.prefix || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, prefix: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Suffix</label>
        <input
          type="text"
          value={element.content?.suffix || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, suffix: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

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
        <label className="block text-sm font-medium mb-2">
          Animation Duration (ms)
        </label>
        <input
          type="number"
          min="100"
          step="100"
          value={element.content?.duration || 2000}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                duration: parseInt(e.target.value) || 2000,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Decimal Places</label>
        <input
          type="number"
          min="0"
          max="10"
          value={element.props?.decimals || 0}
          onChange={(e) =>
            onUpdate(element.id, {
              props: {
                ...element.props,
                decimals: parseInt(e.target.value) || 0,
              },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
};
