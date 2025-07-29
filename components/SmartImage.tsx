"use client";

import React, { useState } from "react";
import { ImageIcon } from "lucide-react";

interface SmartImageProps {
  driveId: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

export default function SmartImage({
  driveId,
  alt,
  className = "",
  fallbackIcon,
  onLoad,
  onError,
}: SmartImageProps) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [hasError, setHasError] = useState(false);

  // ✅ URL formats in order of preference (working ones first)
  const urlFormats = [
    `https://lh3.googleusercontent.com/d/${driveId}=w1000`, // Public URL (best quality)
    `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`, // Large thumbnail
    `https://drive.google.com/thumbnail?id=${driveId}&sz=w400`, // Medium thumbnail
    `https://drive.google.com/thumbnail?id=${driveId}&sz=w200`, // Small thumbnail
  ];

  const handleImageError = () => {
    console.log(`❌ Image failed to load: ${urlFormats[currentUrlIndex]}`);

    // Try next URL format
    if (currentUrlIndex < urlFormats.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1);
      console.log(
        `🔄 Trying next URL format: ${urlFormats[currentUrlIndex + 1]}`
      );
    } else {
      // All formats failed
      setHasError(true);
      onError?.();
      console.log(`❌ All URL formats failed for file ID: ${driveId}`);
    }
  };

  const handleImageLoad = () => {
    console.log(`✅ Image loaded successfully: ${urlFormats[currentUrlIndex]}`);
    onLoad?.();
  };

  if (hasError) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center ${className}`}
      >
        {fallbackIcon || <ImageIcon className="h-8 w-8 text-slate-400" />}
      </div>
    );
  }

  return (
    <img
      src={urlFormats[currentUrlIndex]}
      alt={alt}
      className={className}
      onLoad={handleImageLoad}
      onError={handleImageError}
      loading="lazy"
    />
  );
}
