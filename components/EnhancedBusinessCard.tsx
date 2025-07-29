// components/EnhancedBusinessCard.tsx

"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  MapPin,
  Zap,
  Wrench,
  TrendingUp,
  Building2,
  Eye,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { BusinessData } from "@/types/business";
import { BusinessValidator } from "@/lib/business-validator";

interface EnhancedBusinessCardProps {
  business: BusinessData & { _validation?: any };
  index: number;
  onViewDetails: (business: BusinessData) => void;
  showValidation?: boolean;
}

export default function EnhancedBusinessCard({
  business,
  index,
  onViewDetails,
  showValidation = true,
}: EnhancedBusinessCardProps) {
  // Get validation if not already attached
  const validation =
    business._validation || BusinessValidator.validateBusiness(business);
  const { imageDetails } = validation;

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
    const iconClass = "h-4 w-4";
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

  // Get completion status styling
  const getCardStyling = () => {
    if (!showValidation) return "border-slate-200/60";

    if (validation.isComplete) {
      return "border-green-200/60 bg-green-50/30";
    } else {
      return "border-orange-200/60 bg-orange-50/30";
    }
  };

  return (
    <Card
      className={`group ${getCardStyling()} backdrop-blur-sm hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:scale-[1.01] overflow-hidden`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Business Logo */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow border border-slate-200/60">
              {imageDetails.hasLogo ? (
                <img
                  src={imageDetails.logoImage?.url || defaultLogo}
                  alt={`${business.name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultLogo;
                  }}
                />
              ) : (
                <img
                  src={defaultLogo}
                  alt={`${business.name} logo`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Logo status indicator */}
            {showValidation && (
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center">
                {imageDetails.hasLogo ? (
                  <CheckCircle className="h-4 w-4 text-green-600 bg-white rounded-full" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 bg-white rounded-full" />
                )}
              </div>
            )}
          </div>

          {/* Business Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 truncate">
                    {business.name}
                  </h3>
                  {showValidation && (
                    <div className="flex items-center gap-1">
                      {validation.isComplete ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-slate-600 line-clamp-1">
                  {business.description || "No description available"}
                </p>
              </div>
            </div>

            {/* Essential Details */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span className="truncate">
                  {business.address
                    ? business.address.split(",")[0]
                    : "No address"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-500" />
                <span>{business.phone || "No phone"}</span>
              </div>
              <div className="flex items-center gap-1">
                {getServiceIcon(business.services)}
                <span className="truncate">
                  {business.services
                    ? business.services.split(",")[0]
                    : "No services"}
                </span>
              </div>
            </div>

            {/* Badges and Image Status */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={`${getContractorTypeColor(
                    business.contractorType
                  )} font-medium px-2 py-1 text-xs`}
                >
                  {business.contractorType || "Unknown"}
                </Badge>
                <Badge
                  className={`${getSizeColor(
                    business.size
                  )} font-medium px-2 py-1 text-xs`}
                >
                  {business.size ? business.size.split(" ")[0] : "Unknown"}
                </Badge>

                {/* ✅ Enhanced Image Status Badge */}
                {showValidation && (
                  <div className="flex gap-1">
                    {/* Logo Badge */}
                    <Badge
                      className={`text-xs flex items-center gap-1 ${
                        imageDetails.hasLogo
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {imageDetails.hasLogo ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      Logo
                    </Badge>

                    {/* Banner Badge */}
                    <Badge
                      className={`text-xs flex items-center gap-1 ${
                        imageDetails.hasBanner
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      {imageDetails.hasBanner ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      Banner
                    </Badge>

                    {/* Additional Images Badge */}
                    <Badge
                      className={`text-xs flex items-center gap-1 ${
                        imageDetails.additionalCount >= 1
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }`}
                    >
                      <ImageIcon className="h-3 w-3" />+
                      {imageDetails.additionalCount}
                    </Badge>
                  </div>
                )}

                {/* Total Images (if not showing validation) */}
                {!showValidation && imageDetails.total > 0 && (
                  <Badge className="bg-slate-100 text-slate-700 border-slate-200 font-medium px-2 py-1 text-xs flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {imageDetails.total}
                  </Badge>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(business)}
                className="ml-3 text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-slate-200 hover:border-slate-300 transition-all duration-200"
              >
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
            </div>

            {/* Validation Summary (for incomplete businesses) */}
            {showValidation &&
              !validation.isComplete &&
              validation.missing.length > 0 && (
                <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                  <div className="font-medium text-orange-800 mb-1">
                    Missing {validation.missing.length} field
                    {validation.missing.length !== 1 ? "s" : ""}:
                  </div>
                  <div className="text-orange-700 line-clamp-2">
                    {validation.missing.slice(0, 3).join(", ")}
                    {validation.missing.length > 3 &&
                      ` and ${validation.missing.length - 3} more...`}
                  </div>
                </div>
              )}

            {/* Completion Status (for complete businesses) */}
            {showValidation && validation.isComplete && (
              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs">
                <div className="font-medium text-green-800 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Ready for automation - All requirements met
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
