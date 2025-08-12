import { PageElement } from "./PageBuilder1";
import React from "react";

export interface WidgetComponentProps {
  element: PageElement;
  isSelected: boolean;
  onSelect: (element: PageElement) => void;
  onUpdate: (elementId: string, updates: Partial<PageElement>) => Promise<void>;
  isPreviewMode: boolean;
  selectedDevice?: string;
  renderChild?: (props: {
    element: PageElement;
    depth: number;
  }) => React.ReactNode;
}

export interface WidgetPropertiesPanelProps {
  element: PageElement;
  onUpdate: (elementId: string, updates: Partial<PageElement>) => Promise<void>;
  selectedDevice: string;
}

export interface WidgetComponentType extends React.FC<WidgetComponentProps> {
  PropertiesPanel?: React.ComponentType<WidgetPropertiesPanelProps>;
}

export interface WidgetDefinition {
  type: string;
  name: string;
  icon: string;
  category:
    | "basic"
    | "pro"
    | "theme"
    | "woocommerce"
    | "forms"
    | "media"
    | "interactive";
  description: string;
  defaultContent: any;
  defaultStyles: any;
  defaultProps: any;
  component: WidgetComponentType;
  propertiesPanel: React.ComponentType<WidgetPropertiesPanelProps>;
}

export class WidgetRegistry {
  private widgets: Map<string, WidgetDefinition> = new Map();

  register(widget: WidgetDefinition) {
    this.widgets.set(widget.type, widget);
  }

  get(type: string): WidgetDefinition | undefined {
    return this.widgets.get(type);
  }

  getAll(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }

  getByCategory(category: string): WidgetDefinition[] {
    return this.getAll().filter((widget) => widget.category === category);
  }

  search(query: string): WidgetDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(
      (widget) =>
        widget.name.toLowerCase().includes(lowerQuery) ||
        widget.description.toLowerCase().includes(lowerQuery)
    );
  }
}

export const widgetRegistry = new WidgetRegistry();
