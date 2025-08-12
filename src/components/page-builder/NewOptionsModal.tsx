"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Image,
  FileText,
  Layout,
  FolderOpen,
  Upload,
  Sparkles,
  Target,
  X,
} from "lucide-react";

interface NewOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOptionSelect: (option: string) => void;
}

interface NewOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
}

const newOptions: NewOption[] = [
  {
    id: "media",
    title: "Media",
    description: "Upload images, videos, and other media files",
    icon: <Image className="w-6 h-6" alt="" />,
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "page",
    title: "Page",
    description: "Create a new page with custom content",
    icon: <FileText className="w-6 h-6" />,
    color: "bg-green-500 hover:bg-green-600",
  },
  {
    id: "landing",
    title: "Landing Page",
    description: "Create a high-converting landing page",
    icon: <Target className="w-6 h-6" />,
    badge: "New",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    id: "template",
    title: "Template",
    description: "Choose from pre-designed templates",
    icon: <Layout className="w-6 h-6" />,
    color: "bg-orange-500 hover:bg-orange-600",
  },
];

export function NewOptionsModal({
  isOpen,
  onClose,
  onOptionSelect,
}: NewOptionsModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionClick = (optionId: string) => {
    setSelectedOption(optionId);
    // Small delay to show the selection feedback
    setTimeout(() => {
      onOptionSelect(optionId);
      setSelectedOption(null);
      onClose();
    }, 200);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Plus className="w-6 h-6 text-[#92003b]" />
              Create New
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-gray-600">
            Choose what you want to create. Each option provides a streamlined
            experience for building your website.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {newOptions.map((option) => (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                selectedOption === option.id ? "ring-2 ring-[#92003b]" : ""
              }`}
              onClick={() => handleOptionClick(option.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-lg ${option.color} flex items-center justify-center text-white`}
                  >
                    {option.icon}
                  </div>
                  {option.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {option.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg font-semibold">
                  {option.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center text-sm text-gray-500">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Click to create
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Quick Tips</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • <strong>Media</strong>: Upload and manage images, videos, and
              documents
            </li>
            <li>
              • <strong>Page</strong>: Create standard pages with full
              customization
            </li>
            <li>
              • <strong>Landing Page</strong>: Build conversion-focused pages
              with templates
            </li>
            <li>
              • <strong>Template</strong>: Start from pre-designed layouts for
              faster development
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
