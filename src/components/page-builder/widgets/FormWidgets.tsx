"use client";

import React from "react";
import { PageElement } from "../PageBuilder1";
import { cn } from "@/lib/utils";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WidgetProps {
  element: PageElement;
  isSelected: boolean;
  onSelect: (element: PageElement) => void;
  onUpdate: (elementId: string, updates: Partial<PageElement>) => void;
  isPreviewMode: boolean;
}

// Form Widget
export const FormWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreviewMode) {
      // Handle form submission
      console.log("Form submitted:", element.content);
      // In a real app, this would send the form data to a server
    }
  };

  return (
    <form
      className={cn(
        "relative",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
      onSubmit={handleSubmit}
    >
      {!isPreviewMode && isSelected && (
        <div className="absolute -top-2 -left-2 bg-[#92003b] text-white text-xs px-2 py-1 rounded z-10">
          Form
        </div>
      )}

      {element.content?.title && (
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: element.styles?.color }}
        >
          {element.content.title}
        </h3>
      )}

      {element.content?.description && (
        <p className="text-sm text-gray-600 mb-4">
          {element.content.description}
        </p>
      )}

      <div className="space-y-4">
        {element.children.map((child) => (
          <div key={child.id}>
            {/* Form field children will be rendered by the parent component */}
          </div>
        ))}
      </div>

      <Button
        type="submit"
        className="w-full mt-4"
        style={{
          backgroundColor: element.styles?.backgroundColor || "#92003b",
          color: element.styles?.color || "#ffffff",
        }}
      >
        {element.content?.submitText || "Submit"}
      </Button>
    </form>
  );
};

FormWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Form Title</label>
        <input
          type="text"
          value={element.content?.title || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, title: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Form Description
        </label>
        <textarea
          value={element.content?.description || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, description: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Submit Button Text
        </label>
        <input
          type="text"
          value={element.content?.submitText || "Submit"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, submitText: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Form Action</label>
        <input
          type="text"
          value={element.content?.action || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, action: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
          placeholder="/submit-form"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Form Method</label>
        <select
          value={element.content?.method || "post"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, method: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="post">POST</option>
          <option value="get">GET</option>
        </select>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.multiStep || false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, multiStep: e.target.checked },
              })
            }
          />
          <span className="text-sm">Multi-step Form</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.conditionalLogic || false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, conditionalLogic: e.target.checked },
              })
            }
          />
          <span className="text-sm">Conditional Logic</span>
        </label>
      </div>
    </div>
  );
};

// Input Widget
export const InputWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  return (
    <div
      className={cn(
        "relative",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {!isPreviewMode && isSelected && (
        <div className="absolute -top-2 -left-2 bg-[#92003b] text-white text-xs px-2 py-1 rounded z-10">
          Input
        </div>
      )}

      <Label className="text-sm font-medium mb-2 block">
        {element.content?.label}
        {element.content?.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </Label>

      <Input
        type={element.content?.type || "text"}
        placeholder={element.content?.placeholder}
        required={element.content?.required}
        className="w-full"
        style={element.styles}
      />
    </div>
  );
};

InputWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Field Label</label>
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
        <label className="block text-sm font-medium mb-2">Placeholder</label>
        <input
          type="text"
          value={element.content?.placeholder || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, placeholder: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Input Type</label>
        <select
          value={element.content?.type || "text"}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, type: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="text">Text</option>
          <option value="email">Email</option>
          <option value="password">Password</option>
          <option value="number">Number</option>
          <option value="tel">Phone</option>
          <option value="url">URL</option>
          <option value="date">Date</option>
          <option value="time">Time</option>
          <option value="datetime-local">Date & Time</option>
        </select>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.required || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, required: e.target.checked },
              })
            }
          />
          <span className="text-sm">Required Field</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Default Value</label>
        <input
          type="text"
          value={element.content?.defaultValue || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, defaultValue: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
};

// Textarea Widget
export const TextareaWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  return (
    <div
      className={cn(
        "relative",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {!isPreviewMode && isSelected && (
        <div className="absolute -top-2 -left-2 bg-[#92003b] text-white text-xs px-2 py-1 rounded z-10">
          Textarea
        </div>
      )}

      <Label className="text-sm font-medium mb-2 block">
        {element.content?.label}
        {element.content?.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </Label>

      <Textarea
        placeholder={element.content?.placeholder}
        required={element.content?.required}
        rows={element.content?.rows || 4}
        className="w-full resize-none"
        style={element.styles}
      />
    </div>
  );
};

TextareaWidget.PropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Field Label</label>
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
        <label className="block text-sm font-medium mb-2">Placeholder</label>
        <textarea
          value={element.content?.placeholder || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, placeholder: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Rows</label>
        <input
          type="number"
          value={element.content?.rows || 4}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, rows: parseInt(e.target.value) },
            })
          }
          className="w-full p-2 border rounded"
          min="1"
          max="20"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.required || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, required: e.target.checked },
              })
            }
          />
          <span className="text-sm">Required Field</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Max Length</label>
        <input
          type="number"
          value={element.content?.maxLength || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: {
                ...element.content,
                maxLength: parseInt(e.target.value) || undefined,
              },
            })
          }
          className="w-full p-2 border rounded"
          min="1"
        />
      </div>
    </div>
  );
};

// Select Widget
export const SelectWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  return (
    <div
      className={cn(
        "relative",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {!isPreviewMode && isSelected && (
        <div className="absolute -top-2 -left-2 bg-[#92003b] text-white text-xs px-2 py-1 rounded z-10">
          Select
        </div>
      )}

      <Label className="text-sm font-medium mb-2 block">
        {element.content?.label}
        {element.content?.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </Label>

      <Select>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={element.content?.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {element.content?.options?.map((option: any, index: number) => (
            <SelectItem key={index} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

SelectWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  const options = element.content?.options || [];

  const updateOptions = (newOptions: any[]) => {
    onUpdate(element.id, {
      content: { ...element.content, options: newOptions },
    });
  };

  const addOption = () => {
    updateOptions([...options, { label: "", value: "" }]);
  };

  const updateOption = (
    index: number,
    field: "label" | "value",
    value: string
  ) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    updateOptions(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    updateOptions(newOptions);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Field Label</label>
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
        <label className="block text-sm font-medium mb-2">Placeholder</label>
        <input
          type="text"
          value={element.content?.placeholder || ""}
          onChange={(e) =>
            onUpdate(element.id, {
              content: { ...element.content, placeholder: e.target.value },
            })
          }
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Options</label>
        <div className="space-y-2">
          {options.map((option: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={option.label}
                onChange={(e) => updateOption(index, "label", e.target.value)}
                placeholder="Label"
                className="flex-1 p-2 border rounded"
              />
              <input
                type="text"
                value={option.value}
                onChange={(e) => updateOption(index, "value", e.target.value)}
                placeholder="Value"
                className="flex-1 p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-gray-400 hover:text-gray-600"
          >
            + Add Option
          </button>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.required || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, required: e.target.checked },
              })
            }
          />
          <span className="text-sm">Required Field</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.props?.multiple || false}
            onChange={(e) =>
              onUpdate(element.id, {
                props: { ...element.props, multiple: e.target.checked },
              })
            }
          />
          <span className="text-sm">Multiple Selection</span>
        </label>
      </div>
    </div>
  );
};

// Checkbox Widget
export const CheckboxWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  return (
    <div
      className={cn(
        "relative",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {!isPreviewMode && isSelected && (
        <div className="absolute -top-2 -left-2 bg-[#92003b] text-white text-xs px-2 py-1 rounded z-10">
          Checkbox
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Checkbox
          id={element.id}
          checked={element.content?.checked || false}
          onChange={(checked) =>
            onUpdate(element.id, {
              content: { ...element.content, checked },
            })
          }
        />
        <Label htmlFor={element.id} className="text-sm">
          {element.content?.label}
          {element.content?.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </Label>
      </div>
    </div>
  );
};

CheckboxWidget.PropertiesPanel = ({
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
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.checked || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, checked: e.target.checked },
              })
            }
          />
          <span className="text-sm">Checked by Default</span>
        </label>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.required || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, required: e.target.checked },
              })
            }
          />
          <span className="text-sm">Required Field</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Layout</label>
        <select
          value={element.props?.inline || false ? "inline" : "block"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, inline: e.target.value === "inline" },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="block">Block (new line)</option>
          <option value="inline">Inline (same line)</option>
        </select>
      </div>
    </div>
  );
};

// Radio Widget
export const RadioWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  return (
    <div
      className={cn(
        "relative",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {!isPreviewMode && isSelected && (
        <div className="absolute -top-2 -left-2 bg-[#92003b] text-white text-xs px-2 py-1 rounded z-10">
          Radio
        </div>
      )}

      <Label className="text-sm font-medium mb-2 block">
        {element.content?.label}
        {element.content?.required && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </Label>

      <RadioGroup
        defaultValue={element.content?.options?.[0]?.value}
        className="space-y-2"
      >
        {element.content?.options?.map((option: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${element.id}-${index}`}
            />
            <Label htmlFor={`${element.id}-${index}`}>{option.label}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

RadioWidget.PropertiesPanel = ({ element, onUpdate, selectedDevice }: any) => {
  const options = element.content?.options || [];

  const updateOptions = (newOptions: any[]) => {
    onUpdate(element.id, {
      content: { ...element.content, options: newOptions },
    });
  };

  const addOption = () => {
    updateOptions([...options, { label: "", value: "" }]);
  };

  const updateOption = (
    index: number,
    field: "label" | "value",
    value: string
  ) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    updateOptions(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    updateOptions(newOptions);
  };

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
        <label className="block text-sm font-medium mb-2">Options</label>
        <div className="space-y-2">
          {options.map((option: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={option.label}
                onChange={(e) => updateOption(index, "label", e.target.value)}
                placeholder="Label"
                className="flex-1 p-2 border rounded"
              />
              <input
                type="text"
                value={option.value}
                onChange={(e) => updateOption(index, "value", e.target.value)}
                placeholder="Value"
                className="flex-1 p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addOption}
            className="w-full p-2 border-2 border-dashed border-gray-300 rounded text-gray-500 hover:border-gray-400 hover:text-gray-600"
          >
            + Add Option
          </button>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.required || false}
            onChange={(e) =>
              onUpdate(element.id, {
                content: { ...element.content, required: e.target.checked },
              })
            }
          />
          <span className="text-sm">Required Field</span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Layout</label>
        <select
          value={element.props?.inline || false ? "inline" : "block"}
          onChange={(e) =>
            onUpdate(element.id, {
              props: { ...element.props, inline: e.target.value === "inline" },
            })
          }
          className="w-full p-2 border rounded"
        >
          <option value="block">Block (vertical)</option>
          <option value="inline">Inline (horizontal)</option>
        </select>
      </div>
    </div>
  );
};
