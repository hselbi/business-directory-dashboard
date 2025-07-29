"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Zap,
  Wrench,
  TrendingUp,
  Building2,
  X,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { BusinessData } from "@/types/business";

interface BusinessDetailModalProps {
  business: BusinessData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessDetailModal({
  business,
  isOpen,
  onClose,
}: BusinessDetailModalProps) {
  if (!business) return null;

  const imageCount = business.images?.length || 0;
  const logoImage = business.images?.find((img) => img.type === "logo");
  const hasLogo = !!logoImage;

  const getContractorTypeColor = (type?: string) => {
    if (!type) return "bg-slate-500/10 text-slate-600 border-slate-200";

    switch (type.toLowerCase()) {
      case "general contractor":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      case "specialized contractor":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
      case "service provider":
        return "bg-purple-500/10 text-purple-600 border-purple-200";
      case "technology provider":
        return "bg-indigo-500/10 text-indigo-600 border-indigo-200";
      case "technology contractor":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-200";
      case "healthcare provider":
        return "bg-rose-500/10 text-rose-600 border-rose-200";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-200";
    }
  };

  const getSizeColor = (size?: string) => {
    if (!size) return "bg-slate-500/10 text-slate-600 border-slate-200";

    if (size.includes("Small"))
      return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    if (size.includes("Medium"))
      return "bg-orange-500/10 text-orange-700 border-orange-200";
    if (size.includes("Large"))
      return "bg-red-500/10 text-red-700 border-red-200";
    return "bg-slate-500/10 text-slate-600 border-slate-200";
  };

  const getServiceIcon = (services?: string) => {
    const iconClass = "h-6 w-6";
    if (!services) return <Building2 className={iconClass} />;

    if (
      services.toLowerCase().includes("tech") ||
      services.toLowerCase().includes("web") ||
      services.toLowerCase().includes("cloud")
    ) {
      return <Zap className={iconClass} />;
    }
    if (
      services.toLowerCase().includes("construction") ||
      services.toLowerCase().includes("build")
    ) {
      return <Wrench className={iconClass} />;
    }
    if (services.toLowerCase().includes("marketing")) {
      return <TrendingUp className={iconClass} />;
    }
    return <Building2 className={iconClass} />;
  };

  const defaultLogo =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f1f5f9'/%3E%3Ctext x='50' y='55' text-anchor='middle' font-family='Arial, sans-serif' font-size='14' fill='%2364748b'%3ENo Logo%3C/text%3E%3C/svg%3E";

  // ✅ FIXED: Smart image component with working URL formats
  const SmartImage = ({
    driveId,
    alt,
    className,
    onClick,
  }: {
    driveId: string;
    alt: string;
    className: string;
    onClick?: () => void;
  }) => {
    const [currentUrlIndex, setCurrentUrlIndex] = React.useState(0);
    const [hasError, setHasError] = React.useState(false);

    // ✅ Use working URL formats in order of preference
    const workingUrls = [
      `https://lh3.googleusercontent.com/d/${driveId}=w1000`, // Best quality
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w800`, // Large thumbnail
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w400`, // Medium thumbnail
      `https://drive.google.com/thumbnail?id=${driveId}&sz=w200`, // Small thumbnail
    ];

    const handleError = () => {
      console.log(`❌ Image failed: ${workingUrls[currentUrlIndex]}`);
      if (currentUrlIndex < workingUrls.length - 1) {
        setCurrentUrlIndex(currentUrlIndex + 1);
        console.log(`🔄 Trying: ${workingUrls[currentUrlIndex + 1]}`);
      } else {
        setHasError(true);
        console.log(`❌ All URLs failed for ${driveId}`);
      }
    };

    const handleLoad = () => {
      console.log(`✅ Image loaded: ${workingUrls[currentUrlIndex]}`);
    };

    if (hasError) {
      return (
        <div
          className={`bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center ${className}`}
        >
          <ImageIcon className="h-8 w-8 text-slate-400" />
        </div>
      );
    }

    return (
      <img
        src={workingUrls[currentUrlIndex]}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        onClick={onClick}
        loading="lazy"
      />
    );
  };

  React.useEffect(() => {
    if (business?.images && business.images.length > 0) {
      console.log(`🖼️ Testing URLs for ${business.name}:`);

      business.images.forEach((image, index) => {
        const urls = {
          publicUrl: `https://lh3.googleusercontent.com/d/${image.driveId}=w1000`,
          thumbnail: `https://drive.google.com/thumbnail?id=${image.driveId}&sz=w400`,
          largeThumb: `https://drive.google.com/thumbnail?id=${image.driveId}&sz=w800`,
        };

        console.log(`Image ${index + 1}: ${image.name} (${image.type})`);
        console.log(`  📁 Drive ID: ${image.driveId}`);
        console.log(`  🌐 Public URL: ${urls.publicUrl}`);
        console.log(`  🖼️ Thumbnail: ${urls.thumbnail}`);
        console.log(`  📏 Large Thumb: ${urls.largeThumb}`);
        console.log("  ---");

        // Test if URLs are accessible (you can see results in Network tab)
        const testImg = new Image();
        testImg.onload = () =>
          console.log(`✅ ${image.name}: Public URL works`);
        testImg.onerror = () =>
          console.log(`❌ ${image.name}: Public URL failed`);
        testImg.src = urls.publicUrl;
      });
    }
  }, [business]);

  // ✅ ALTERNATIVE: Quick URL format checker
  const getWorkingImageUrl = (
    driveId: string,
    size: "small" | "medium" | "large" | "full" = "medium"
  ) => {
    const sizeMap = {
      small: "w200",
      medium: "w400",
      large: "w800",
      full: "w1000",
    };

    return {
      public: `https://lh3.googleusercontent.com/d/${driveId}=${sizeMap[size]}`,
      thumbnail: `https://drive.google.com/thumbnail?id=${driveId}&sz=${sizeMap[size]}`,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50/30">
          <DialogHeader className="p-6 pb-4 border-b border-slate-200/60">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-lg border border-slate-200/60">
                    {hasLogo ? (
                      <SmartImage
                        driveId={logoImage.driveId}
                        alt={`${business.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={defaultLogo}
                        alt={`${business.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  {!hasLogo && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-100 border border-amber-200 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-3 w-3 text-amber-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
                    {business.name}
                  </DialogTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge
                      className={`${getContractorTypeColor(
                        business.contractorType
                      )} font-medium px-3 py-1`}
                    >
                      {business.contractorType || "Unknown"}
                    </Badge>
                    <Badge
                      className={`${getSizeColor(
                        business.size
                      )} font-medium px-3 py-1`}
                    >
                      {business.size || "Unknown"}
                    </Badge>
                    {business.founded && (
                      <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-medium px-3 py-1">
                        Est. {business.founded}
                      </Badge>
                    )}
                    {imageCount > 0 && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200 font-medium px-3 py-1">
                        {imageCount} Image{imageCount !== 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    {business.description || "No description available"}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-slate-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-700">
                          Address
                        </div>
                        <div className="text-sm text-slate-600">
                          {business.address || "No address available"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-700">
                          Phone
                        </div>
                        {business.phone ? (
                          <a
                            href={`tel:${business.phone}`}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {business.phone}
                          </a>
                        ) : (
                          <span className="text-sm text-slate-500">
                            No phone available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {business.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-slate-700">
                            Email
                          </div>
                          <a
                            href={`mailto:${business.email}`}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            {business.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {business.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-slate-500 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-slate-700">
                            Website
                          </div>
                          <a
                            href={
                              business.website.startsWith("http")
                                ? business.website
                                : `https://${business.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                          >
                            {business.website.replace(/^https?:\/\//, "")}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            {(business.services || business.otherServices) && (
              <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    {getServiceIcon(business.services)}
                    Services & Capabilities
                  </h3>
                  <div className="space-y-4">
                    {business.services && (
                      <div>
                        <div className="text-sm font-medium text-slate-700 mb-2">
                          Primary Services
                        </div>
                        <div className="text-slate-600">
                          {business.services}
                        </div>
                      </div>
                    )}
                    {business.otherServices && (
                      <div>
                        <div className="text-sm font-medium text-slate-700 mb-2">
                          Additional Services
                        </div>
                        <div className="text-slate-600">
                          {business.otherServices}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ✅ FIXED: Images Gallery with working URLs */}
            {business.images && business.images.length > 0 ? (
              <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-slate-600" />
                    Business Gallery ({business.images.length} images)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {business.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200/60 cursor-pointer group"
                      >
                        <SmartImage
                          driveId={image.driveId}
                          alt={`${business.name} - ${
                            image.name || `Image ${index + 1}`
                          }`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onClick={() => {
                            // ✅ Open the best quality URL when clicked
                            const fullQualityUrl = `https://lh3.googleusercontent.com/d/${image.driveId}=w2000`;
                            window.open(fullQualityUrl, "_blank");
                          }}
                        />
                        {/* Image type badge */}
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-black/60 text-white text-xs border-0 capitalize">
                            {image.type}
                          </Badge>
                        </div>
                        {/* Image name overlay */}
                        <div className="absolute bottom-2 left-2 right-2">
                          <Badge className="bg-black/60 text-white text-xs border-0 truncate max-w-full">
                            {image.name}
                          </Badge>
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ExternalLink className="h-6 w-6 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200/60 bg-white/70 backdrop-blur-sm border-dashed">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <div className="text-slate-500 font-medium">
                      No images available
                    </div>
                    <div className="text-sm text-slate-400">
                      Business gallery images will appear here
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
