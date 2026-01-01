import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-[3/4] rounded-xl bg-gray-200" />

      {/* Text Skeleton */}
      <div className="pt-3 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
