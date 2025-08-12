"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  Filter,
  Calendar,
  SortAsc,
  SortDesc,
  Check,
  Star,
  FolderOpen,
  Link2,
  Edit3,
  Copy,
  Maximize2,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  name: string;
  type: "image" | "video" | "document";
  url: string;
  size: number;
  createdAt: string;
  alt?: string;
  title?: string;
  caption?: string;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
  folder?: string;
}

interface MediaManagerEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: MediaItem) => void;
}

const sortOptions = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "size-desc", label: "Largest First" },
  { value: "size-asc", label: "Smallest First" },
];

const filterOptions = [
  { value: "all", label: "All Media" },
  { value: "image", label: "Images" },
  { value: "video", label: "Videos" },
  { value: "document", label: "Documents" },
  { value: "favorite", label: "Favorites" },
];

export function MediaManagerEnhanced({
  isOpen,
  onClose,
  onSelectMedia,
}: MediaManagerEnhancedProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUpload, setCurrentUpload] = useState<string>("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterBy, setFilterBy] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [folders, setFolders] = useState<string[]>([]);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

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
        const media = data.media || [];
        setMediaItems(media);

        // Extract unique folders
        const uniqueFolders = Array.from(
          new Set(media.map((item: MediaItem) => item.folder).filter(Boolean))
        ) as string[];
        setFolders(uniqueFolders);
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
        setCurrentUpload(file.name);

        const formData = new FormData();
        formData.append("file", file);

        // Simulate progress tracking
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

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

      setUploadProgress(100);
      toast.success("All files uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setCurrentUpload("");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp", ".svg"],
      "video/*": [".mp4", ".mov", ".avi", ".webm", ".mkv"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        [".pptx"],
      "text/plain": [".txt"],
      "application/zip": [".zip"],
      "application/x-rar-compressed": [".rar"],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  // Filter and sort media items
  const filteredAndSortedMedia = useMemo(() => {
    let filtered = mediaItems.filter((item) => {
      // Search filter
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      // Type filter
      const matchesType =
        filterBy === "all" ||
        filterBy === item.type ||
        (filterBy === "favorite" && item.isFavorite);

      // Folder filter
      const matchesFolder =
        selectedFolder === "all" || item.folder === selectedFolder;

      return matchesSearch && matchesType && matchesFolder;
    });

    // Sort media
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "size-desc":
          return b.size - a.size;
        case "size-asc":
          return a.size - b.size;
        default:
          return 0;
      }
    });

    return filtered;
  }, [mediaItems, searchTerm, filterBy, sortBy, selectedFolder]);

  const handleDeleteMedia = async (mediaId: string, fileName: string) => {
    try {
      // In a real implementation, you would call a delete API endpoint
      setMediaItems((prev) => prev.filter((m) => m.id !== mediaId));
      toast.success(`Deleted ${fileName}`);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete media");
    }
  };

  const handleToggleFavorite = async (
    mediaId: string,
    currentState: boolean
  ) => {
    try {
      setMediaItems((prev) =>
        prev.map((m) =>
          m.id === mediaId ? { ...m, isFavorite: !currentState } : m
        )
      );
      toast.success(
        currentState ? "Removed from favorites" : "Added to favorites"
      );
    } catch (error) {
      console.error("Toggle favorite failed:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const handleInsertMedia = (media: MediaItem) => {
    onSelectMedia(media);
    toast.success(`Selected ${media.name}`);
    onClose();
  };

  const handleCopyMediaUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handleUpdateMedia = async (updatedMedia: MediaItem) => {
    try {
      setMediaItems((prev) =>
        prev.map((m) => (m.id === updatedMedia.id ? updatedMedia : m))
      );
      setEditingMedia(null);
      toast.success("Media updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update media");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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

  const MediaCard = ({ media }: { media: MediaItem }) => (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group relative",
        selectedMedia?.id === media.id ? "ring-2 ring-[#92003b]" : ""
      )}
      onClick={() => setSelectedMedia(media)}
    >
      <CardContent className="p-4">
        <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          {media.type === "image" ? (
            <img
              src={media.url}
              alt={media.alt || media.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-400">{getMediaIcon(media.type)}</div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4
              className="font-medium text-sm truncate flex-1 mr-2"
              title={media.name}
            >
              {media.name}
            </h4>
            <Button
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFavorite(media.id, media.isFavorite || false);
              }}
            >
              <Star
                className={cn(
                  "w-4 h-4",
                  media.isFavorite
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-400"
                )}
              />
            </Button>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <Badge variant="secondary" className="text-xs">
              {media.type}
            </Badge>
            <span>{formatFileSize(media.size)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{formatDate(media.createdAt)}</span>
            {media.folder && (
              <Badge variant="outline" className="text-xs">
                {media.folder}
              </Badge>
            )}
          </div>

          {media.tags && media.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {media.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {media.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{media.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleInsertMedia(media);
              }}
            >
              <Plus className="w-3 h-3 mr-1" />
              Insert
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setPreviewMedia(media);
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setEditingMedia(media);
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={(e) => {
                e.stopPropagation();
                handleCopyMediaUrl(media.url);
              }}
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMedia(media.id, media.name);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MediaListItem = ({ media }: { media: MediaItem }) => (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md",
        selectedMedia?.id === media.id ? "ring-2 ring-[#92003b]" : ""
      )}
      onClick={() => setSelectedMedia(media)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
            {media.type === "image" ? (
              <img
                src={media.url}
                alt={media.alt || media.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400">{getMediaIcon(media.type)}</div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-sm truncate">{media.name}</h4>
              <Button
                size="sm"
                variant="ghost"
                className="p-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(media.id, media.isFavorite || false);
                }}
              >
                <Star
                  className={cn(
                    "w-4 h-4",
                    media.isFavorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-400"
                  )}
                />
              </Button>
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
              <Badge variant="secondary" className="text-xs">
                {media.type}
              </Badge>
              <span>{formatFileSize(media.size)}</span>
              <span>{formatDate(media.createdAt)}</span>
              {media.folder && (
                <Badge variant="outline" className="text-xs">
                  {media.folder}
                </Badge>
              )}
            </div>

            {media.title && (
              <p className="text-sm text-gray-600 mb-1">{media.title}</p>
            )}

            {media.caption && (
              <p className="text-xs text-gray-500 truncate">{media.caption}</p>
            )}

            {media.tags && media.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {media.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {media.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{media.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleInsertMedia(media);
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
                setPreviewMedia(media);
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setEditingMedia(media);
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteMedia(media.id, media.name);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Image className="w-6 h-6 text-[#92003b]" alt="" />; Media
                Library
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
              Manage your media files - upload, organize, and insert into your
              pages
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                isDragActive
                  ? "border-[#92003b] bg-[#92003b]/5"
                  : "border-gray-300 hover:border-gray-400"
              )}
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
                    <span className="ml-2 text-lg font-medium">
                      Uploading {currentUpload}...
                    </span>
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
                Supports: Images, Videos, Documents, Archives (Max 50MB)
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

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

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

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Folder</Label>
                    <Select
                      value={selectedFolder}
                      onValueChange={setSelectedFolder}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Folders</SelectItem>
                        {folders.map((folder) => (
                          <SelectItem key={folder} value={folder}>
                            {folder}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Date Range</Label>
                    <Input type="date" className="mt-1" />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Size Range</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Any size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small (&lt; 1MB)</SelectItem>
                        <SelectItem value="medium">Medium (1-10MB)</SelectItem>
                        <SelectItem value="large">Large (&gt; 10MB)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}

            {/* Media Grid/List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#92003b]" />
                <span className="ml-2 text-lg font-medium">
                  Loading media...
                </span>
              </div>
            ) : filteredAndSortedMedia.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    : "space-y-2"
                }
              >
                {filteredAndSortedMedia.map((media) =>
                  viewMode === "grid" ? (
                    <MediaCard key={media.id} media={media} />
                  ) : (
                    <MediaListItem key={media.id} media={media} />
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Image
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  alt=""
                />
                ;
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No media files found
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterBy !== "all" || selectedFolder !== "all"
                    ? "Try adjusting your search or filters"
                    : "Upload your first media file to get started"}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Media Preview Modal */}
      {previewMedia && (
        <Dialog
          open={!!previewMedia}
          onOpenChange={() => setPreviewMedia(null)}
        >
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{previewMedia.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                {previewMedia.type === "image" ? (
                  <img
                    src={previewMedia.url}
                    alt={previewMedia.alt || previewMedia.name}
                    className="max-w-full max-h-[400px] object-contain"
                  />
                ) : (
                  <div className="text-center">
                    {getMediaIcon(previewMedia.type)}
                    <p className="mt-2 text-gray-600">
                      Preview not available for this file type
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {previewMedia.name}
                </div>
                <div>
                  <strong>Type:</strong> {previewMedia.type}
                </div>
                <div>
                  <strong>Size:</strong> {formatFileSize(previewMedia.size)}
                </div>
                <div>
                  <strong>Created:</strong> {formatDate(previewMedia.createdAt)}
                </div>
                {previewMedia.title && (
                  <div>
                    <strong>Title:</strong> {previewMedia.title}
                  </div>
                )}
                {previewMedia.alt && (
                  <div>
                    <strong>Alt Text:</strong> {previewMedia.alt}
                  </div>
                )}
              </div>

              {previewMedia.description && (
                <div>
                  <strong>Description:</strong>
                  <p className="mt-1 text-gray-600">
                    {previewMedia.description}
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Media Edit Modal */}
      {editingMedia && (
        <Dialog
          open={!!editingMedia}
          onOpenChange={() => setEditingMedia(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <Input
                  value={editingMedia.title || ""}
                  onChange={(e) =>
                    setEditingMedia({
                      ...editingMedia,
                      title: e.target.value,
                    })
                  }
                  placeholder="Add a title..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Alt Text</Label>
                <Input
                  value={editingMedia.alt || ""}
                  onChange={(e) =>
                    setEditingMedia({
                      ...editingMedia,
                      alt: e.target.value,
                    })
                  }
                  placeholder="Add alt text for accessibility..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Caption</Label>
                <Input
                  value={editingMedia.caption || ""}
                  onChange={(e) =>
                    setEditingMedia({
                      ...editingMedia,
                      caption: e.target.value,
                    })
                  }
                  placeholder="Add a caption..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  value={editingMedia.description || ""}
                  onChange={(e) =>
                    setEditingMedia({
                      ...editingMedia,
                      description: e.target.value,
                    })
                  }
                  placeholder="Add a description..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Tags (comma-separated)
                </Label>
                <Input
                  value={editingMedia.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingMedia({
                      ...editingMedia,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="tag1, tag2, tag3..."
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Folder</Label>
                <Input
                  value={editingMedia.folder || ""}
                  onChange={(e) =>
                    setEditingMedia({
                      ...editingMedia,
                      folder: e.target.value,
                    })
                  }
                  placeholder="Assign to folder..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingMedia(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateMedia(editingMedia)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
