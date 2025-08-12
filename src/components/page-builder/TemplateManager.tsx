"use client";

import { useState } from "react";
import { PageElement } from "./PageBuilder1";

// Function to safely serialize page elements for templates
const safeSerializeElements = (elements: PageElement[]): string => {
  const cleanElement = (element: PageElement): any => {
    const cleaned: any = {
      id: element.id,
      type: element.type,
      widgetType: element.widgetType,
      children: element.children.map(cleanElement),
      content: {},
      styles: {},
      props: {},
    };

    // Clean content - only keep serializable data
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
          // Handle nested objects recursively
          try {
            cleaned.content[key] = JSON.parse(JSON.stringify(value));
          } catch (e) {
            // Skip non-serializable objects
            console.warn("Skipping non-serializable content:", key, value);
          }
        }
      });
    }

    // Clean styles - only keep serializable data
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

    // Clean props - only keep serializable data
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

  return JSON.stringify(elements.map(cleanElement));
};
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Save,
  FolderOpen,
  Download,
  Upload,
  Trash2,
  Copy,
  Star,
  Grid,
  List,
  Search,
  Plus,
  FileText,
  Layout,
  Type,
  Image,
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  type: "section" | "page" | "widget";
  category: string;
  elements: PageElement[];
  thumbnail?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TemplateManagerProps {
  elements: PageElement[];
  selectedElement: PageElement | null;
  onTemplateLoad: (elements: PageElement[]) => void;
  onElementAdd: (elements: PageElement[], description: string) => void;
}

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "Hero Section",
    description: "Modern hero section with call-to-action",
    type: "section",
    category: "sections",
    elements: [
      {
        id: "section-1",
        type: "section",
        children: [
          {
            id: "column-1",
            type: "column",
            children: [
              {
                id: "widget-1",
                type: "widget",
                widgetType: "heading",
                children: [],
                content: { text: "Welcome to Our Website", level: "h1" },
                styles: {},
                props: {},
              },
              {
                id: "widget-2",
                type: "widget",
                widgetType: "text",
                children: [],
                content: {
                  text: "Create stunning websites with our powerful page builder. Drag, drop, and customize with ease.",
                },
                styles: {},
                props: {},
              },
              {
                id: "widget-3",
                type: "widget",
                widgetType: "button",
                children: [],
                content: { text: "Get Started", link: "#" },
                styles: {},
                props: {},
              },
            ],
            content: {},
            styles: {},
            props: { width: 12 },
          },
        ],
        content: {},
        styles: {},
        props: {},
      },
    ],
    tags: ["hero", "landing", "modern"],
    isFavorite: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Features Grid",
    description: "Three-column feature showcase",
    type: "section",
    category: "sections",
    elements: [
      {
        id: "section-2",
        type: "section",
        children: [
          {
            id: "column-1",
            type: "column",
            children: [
              {
                id: "widget-1",
                type: "widget",
                widgetType: "icon-box",
                children: [],
                content: {
                  icon: "⚡",
                  title: "Fast Performance",
                  description: "Lightning-fast loading times",
                },
                styles: {},
                props: {},
              },
            ],
            content: {},
            styles: {},
            props: { width: 4 },
          },
          {
            id: "column-2",
            type: "column",
            children: [
              {
                id: "widget-2",
                type: "widget",
                widgetType: "icon-box",
                children: [],
                content: {
                  icon: "🎨",
                  title: "Beautiful Design",
                  description: "Stunning visual appeal",
                },
                styles: {},
                props: {},
              },
            ],
            content: {},
            styles: {},
            props: { width: 4 },
          },
          {
            id: "column-3",
            type: "column",
            children: [
              {
                id: "widget-3",
                type: "widget",
                widgetType: "icon-box",
                children: [],
                content: {
                  icon: "📱",
                  title: "Responsive",
                  description: "Perfect on all devices",
                },
                styles: {},
                props: {},
              },
            ],
            content: {},
            styles: {},
            props: { width: 4 },
          },
        ],
        content: {},
        styles: {},
        props: {},
      },
    ],
    tags: ["features", "grid", "responsive"],
    isFavorite: false,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
  {
    id: "3",
    name: "Contact Form",
    description: "Complete contact form with validation",
    type: "section",
    category: "forms",
    elements: [
      {
        id: "section-3",
        type: "section",
        children: [
          {
            id: "column-1",
            type: "column",
            children: [
              {
                id: "widget-1",
                type: "widget",
                widgetType: "heading",
                children: [],
                content: { text: "Get In Touch", level: "h2" },
                styles: {},
                props: {},
              },
              {
                id: "widget-2",
                type: "widget",
                widgetType: "text",
                children: [],
                content: {
                  text: "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
                },
                styles: {},
                props: {},
              },
              {
                id: "widget-3",
                type: "widget",
                widgetType: "input",
                children: [],
                content: { label: "Name", placeholder: "Enter your name" },
                styles: {},
                props: {},
              },
              {
                id: "widget-4",
                type: "widget",
                widgetType: "input",
                children: [],
                content: {
                  label: "Email",
                  placeholder: "Enter your email",
                  inputType: "email",
                },
                styles: {},
                props: {},
              },
              {
                id: "widget-5",
                type: "widget",
                widgetType: "textarea",
                children: [],
                content: {
                  label: "Message",
                  placeholder: "Enter your message",
                  rows: 4,
                },
                styles: {},
                props: {},
              },
              {
                id: "widget-6",
                type: "widget",
                widgetType: "button",
                children: [],
                content: { text: "Send Message", link: "#" },
                styles: {},
                props: {},
              },
            ],
            content: {},
            styles: {},
            props: { width: 12 },
          },
        ],
        content: {},
        styles: {},
        props: {},
      },
    ],
    tags: ["contact", "form", "validation"],
    isFavorite: true,
    createdAt: "2024-01-01",
    updatedAt: "2024-01-01",
  },
];

export function TemplateManager({
  elements,
  selectedElement,
  onTemplateLoad,
  onElementAdd,
}: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>(defaultTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    type: "section" as "section" | "page" | "widget",
    category: "custom",
    tags: "",
  });

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    const matchesType =
      selectedType === "all" || template.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const handleSaveTemplate = () => {
    const templateData: Template = {
      id: `template-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      type: newTemplate.type,
      category: newTemplate.category,
      elements:
        newTemplate.type === "widget" && selectedElement
          ? [selectedElement]
          : elements,
      tags: newTemplate.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTemplates((prev) => [...prev, templateData]);
    setShowSaveDialog(false);
    setNewTemplate({
      name: "",
      description: "",
      type: "section",
      category: "custom",
      tags: "",
    });
  };

  const handleLoadTemplate = (template: Template) => {
    if (template.type === "page") {
      onTemplateLoad(template.elements);
    } else {
      onElementAdd(template.elements, `Load template: ${template.name}`);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((prev) =>
      prev.filter((template) => template.id !== templateId)
    );
  };

  const handleToggleFavorite = (templateId: string) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? { ...template, isFavorite: !template.isFavorite }
          : template
      )
    );
  };

  const handleExportTemplate = (template: Template) => {
    try {
      // Create a clean template with serialized elements
      const cleanTemplate = {
        ...template,
        elements: JSON.parse(safeSerializeElements(template.elements)),
      };
      const dataStr = JSON.stringify(cleanTemplate, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${template.name.replace(/\s+/g, "-")}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting template:", error);
      alert("Error exporting template. Please check the console for details.");
    }
  };

  const categories = Array.from(new Set(templates.map((t) => t.category)));
  const types = Array.from(new Set(templates.map((t) => t.type)));

  const TemplateCard = ({ template }: { template: Template }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm font-medium">
              {template.name}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {template.description}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleFavorite(template.id);
            }}
          >
            <Star
              className={`w-3 h-3 ${
                template.isFavorite ? "fill-yellow-400 text-yellow-400" : ""
              }`}
            />
          </Button>
        </div>
        <div className="flex gap-1 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {template.type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground">
            {template.elements.length} elements
          </div>
          <div className="flex gap-1 flex-wrap">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => handleLoadTemplate(template)}
            >
              <FolderOpen className="w-3 h-3 mr-1" />
              Load
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleExportTemplate(template)}
            >
              <Download className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleDeleteTemplate(template.id)}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TemplateListItem = ({ template }: { template: Template }) => (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-sm">{template.name}</h4>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={() => handleToggleFavorite(template.id)}
          >
            <Star
              className={`w-3 h-3 ${
                template.isFavorite ? "fill-yellow-400 text-yellow-400" : ""
              }`}
            />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {template.description}
        </p>
        <div className="flex gap-1 mt-2">
          <Badge variant="secondary" className="text-xs">
            {template.type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {template.category}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {template.elements.length} elements
          </span>
        </div>
      </div>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleLoadTemplate(template)}
        >
          <FolderOpen className="w-3 h-3 mr-1" />
          Load
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleExportTemplate(template)}
        >
          <Download className="w-3 h-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleDeleteTemplate(template.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Template Manager</span>
          <Badge variant="secondary" className="text-xs">
            {templates.length}
          </Badge>
        </div>
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8">
              <Save className="w-3 h-3 mr-1" />
              Save Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Template</DialogTitle>
              <DialogDescription>
                Save your current design as a reusable template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter template name..."
                />
              </div>
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Enter template description..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-type">Type</Label>
                  <Select
                    value={newTemplate.type}
                    onValueChange={(value: "section" | "page" | "widget") =>
                      setNewTemplate((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="section">Section</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="widget">Widget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template-category">Category</Label>
                  <Select
                    value={newTemplate.category}
                    onValueChange={(value) =>
                      setNewTemplate((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="sections">Sections</SelectItem>
                      <SelectItem value="forms">Forms</SelectItem>
                      <SelectItem value="layouts">Layouts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="template-tags">Tags (comma-separated)</Label>
                <Input
                  id="template-tags"
                  value={newTemplate.tags}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      tags: e.target.value,
                    }))
                  }
                  placeholder="hero, modern, responsive..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  disabled={!newTemplate.name}
                >
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="p-4 border-b space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Templates List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No templates found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button onClick={() => setShowSaveDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-2"
              }
            >
              {filteredTemplates.map((template) =>
                viewMode === "grid" ? (
                  <TemplateCard key={template.id} template={template} />
                ) : (
                  <TemplateListItem key={template.id} template={template} />
                )
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
