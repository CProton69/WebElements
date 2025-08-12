import React, { useState, useRef } from "react";
import { PageElement } from "../PageBuilder1";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star, Plus, Upload, X, Edit, Trash2 } from "lucide-react";

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

// Single Product Widget
export const ProductWidget: React.FC<WidgetProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  isPreviewMode,
}) => {
  const product = element.content || {
    name: "Sample Product",
    price: "$29.99",
    image: "",
    description: "This is a sample product description.",
    onSale: false,
    salePrice: "",
    rating: 4.5,
    reviews: 12,
  };

  const handleAddToCart = () => {
    // Placeholder for add to cart functionality
    alert(`${product.name} added to cart!`);
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md overflow-hidden max-w-sm",
        isSelected && !isPreviewMode && "ring-2 ring-[#92003b] bg-[#92003b]/5"
      )}
      style={element.styles}
      onClick={() => !isPreviewMode && onSelect(element)}
    >
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ShoppingBag className="w-16 h-16" />
          </div>
        )}

        {/* Sale Badge */}
        {product.onSale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            Sale
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(product.rating)
                    ? "text-yellow-400 fill-current"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.rating} ({product.reviews} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center mb-3">
          {product.onSale && product.salePrice ? (
            <>
              <span className="text-lg font-bold text-[#92003b]">
                {product.salePrice}
              </span>
              <span className="text-sm text-gray-500 line-through ml-2">
                {product.price}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {product.price}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">{product.description}</p>

        {/* Add to Cart Button */}
        {isPreviewMode && (
          <Button
            onClick={handleAddToCart}
            className="w-full bg-[#92003b] hover:bg-[#b8004a]"
          >
            Add to Cart
          </Button>
        )}
      </div>
    </div>
  );
};

// Properties Panel for Product Widget
const ProductWidgetPropertiesPanel = ({
  element,
  onUpdate,
  selectedDevice,
}: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (key: string, value: any) => {
    onUpdate(element.id, {
      content: { ...element.content, [key]: value },
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        handleContentChange("image", imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    handleContentChange("image", "");
  };

  return (
    <div className="space-y-4">
      {/* Product Image */}
      <div>
        <label className="block text-sm font-medium mb-2">Product Image</label>
        <div className="space-y-2">
          {element.content?.image ? (
            <div className="relative">
              <img
                src={element.content.image}
                alt="Product preview"
                className="w-full h-32 object-cover rounded border"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload image</p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Product Name</label>
        <input
          type="text"
          value={element.content?.name || ""}
          onChange={(e) => handleContentChange("name", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Product name"
        />
      </div>

      {/* Product Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={element.content?.description || ""}
          onChange={(e) => handleContentChange("description", e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
          rows={3}
          placeholder="Product description"
        />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">
            Regular Price
          </label>
          <input
            type="text"
            value={element.content?.price || ""}
            onChange={(e) => handleContentChange("price", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="$29.99"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Sale Price</label>
          <input
            type="text"
            value={element.content?.salePrice || ""}
            onChange={(e) => handleContentChange("salePrice", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="$19.99"
          />
        </div>
      </div>

      {/* Sale Status */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={element.content?.onSale || false}
            onChange={(e) => handleContentChange("onSale", e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm">On Sale</span>
        </label>
      </div>

      {/* Rating */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Rating (1-5)</label>
          <input
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={element.content?.rating || 4.5}
            onChange={(e) =>
              handleContentChange("rating", parseFloat(e.target.value) || 4.5)
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Reviews Count
          </label>
          <input
            type="number"
            min="0"
            value={element.content?.reviews || 0}
            onChange={(e) =>
              handleContentChange("reviews", parseInt(e.target.value) || 0)
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

ProductWidget.PropertiesPanel = ProductWidgetPropertiesPanel;
