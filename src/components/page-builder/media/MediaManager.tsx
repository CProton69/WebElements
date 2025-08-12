"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload,
  X,
  Image,
  Video,
  FileText,
  Search,
  Grid,
  List,
  Download,
  Trash2,
  Eye,
  Loader2,
  Plus,
} from "lucide-react";
import { useDropzone } from "react-dropzone";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "document";
  url: string;
  size: number;
  createdAt: string;
}

interface MediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: MediaItem) => void;
}

export function MediaManager({
  isOpen,
  onClose,
  onSelectMedia,
}: MediaManagerProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load media items when component opens
  useEffect(() => {
    if (isOpen) {
      loadMediaItems();
    }
  }, [isOpen]);

  const loadMediaItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/media");
      if (response.ok) {
        const data = await response.json();
        setMediaItems(data.media || []);
      } else {
        toast.error("Failed to load media items");
      }
    } catch (error) {
      console.error("Error loading media:", error);
      toast.error("Failed to load media items");
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const newMedia = await response.json();
          setMediaItems((prev) => [newMedia, ...prev]);
          toast.success(`Uploaded ${file.name}`);
        } else {
          const errorData = await response.json();
          toast.error(`Failed to upload ${file.name}: ${errorData.error}`);
        }

        // Update progress
        setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
      }

      toast.success("All files uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
      "video/*": [".mp4", ".mov", ".avi"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: true,
  });

  const filteredMedia = mediaItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteMedia = async (mediaId: string, fileName: string) => {
    try {
      // In a real implementation, you would call a delete API endpoint
      // For now, just remove from the local state
      setMediaItems((prev) => prev.filter((m) => m.id !== mediaId));
      toast.success(`Deleted ${fileName}`);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete media");
    }
  };

  const handleInsertMedia = (media: MediaItem) => {
    onSelectMedia(media);
    toast.success(`Selected ${media.name}`);
    onClose();
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-6 h-6" alt="" />;
      case "video":
        return <Video className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Image className="w-6 h-6 text-[#92003b]" alt="" />; Media Library
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
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-[#92003b] bg-[#92003b]/5"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            {isDragActive ? (
              <p className="text-lg font-medium text-[#92003b]">
                Drop files here...
              </p>
            ) : uploading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#92003b]" />
                  <span className="ml-2 text-lg font-medium">Uploading...</span>
                </div>
                {uploadProgress > 0 && (
                  <div className="w-full max-w-xs mx-auto">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#92003b] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop files here
                </p>
                <p className="text-gray-600 mb-4">or click to browse</p>
                <Button
                  disabled={uploading}
                  className="bg-[#92003b] hover:bg-[#b8004a]"
                >
                  {uploading ? "Uploading..." : "Choose Files"}
                </Button>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Supports: Images, Videos, PDFs, Documents (Max 10MB)
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#92003b]" />
              <span className="ml-2 text-lg font-medium">Loading media...</span>
            </div>
          ) : filteredMedia.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "space-y-2"
              }
            >
              {filteredMedia.map((item) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedMedia?.id === item.id ? "ring-2 ring-[#92003b]" : ""
                  }`}
                  onClick={() => setSelectedMedia(item)}
                >
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-gray-400">
                          {getMediaIcon(item.type)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <Badge variant="secondary" className="text-xs">
                          {item.type}
                        </Badge>
                        <span>{formatFileSize(item.size)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsertMedia(item);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Insert
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(item.url, "_blank");
                          }}
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedia(item.id, item.name);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="w-16 h-16 mx-auto mb-4 text-gray-400" alt="" />;
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No media files yet
              </h3>
              <p className="text-gray-500">
                Upload your first media file to get started
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
