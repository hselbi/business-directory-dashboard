"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  FileSpreadsheet,
  Key,
  Play,
  TrendingUp,
  Building2,
  Zap,
  Database,
  CheckCircle,
} from "lucide-react";
import { BusinessData } from "@/types/business";
import BusinessDetailModal from "@/components/BusinessDetailModal";
import BusinessCard from "@/components/BusinessCard";
import AutomationPage from "@/components/AutomationPage";
import EnhancedBusinessCard from "@/components/EnhancedBusinessCard";

export default function BusinessDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [businessCount, setBusinessCount] = useState<number | null>(null);
  const [businesses, setBusinesses] = useState<BusinessData[]>([]);
  const [sheetName, setSheetName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessData | null>(
    null
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [processingErrors, setProcessingErrors] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [canProceedToAutomation, setCanProceedToAutomation] = useState(false);
  const [currentView, setCurrentView] = useState<"dashboard" | "automation">(
    "dashboard"
  );
  const [analysisMetadata, setAnalysisMetadata] = useState<any>(null);

  // Main analysis function using service account
  const handleStartAnalysis = async () => {
    setIsLoading(true);
    setError("");
    setProcessingErrors([]);
    setLoadingStage("Initializing connection...");

    try {
      setLoadingStage("Connecting to Google Drive with service account...");

      // Call the new service account API endpoint
      const response = await fetch("/api/business-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze business data");
      }

      setLoadingStage("Processing business data...");

      // Transform the data to match your existing interface
      const transformedBusinesses: BusinessData[] = result.data.map(
        (business: any) => ({
          name: business.name,
          address: business.address,
          phone: business.phone,
          website: business.website || "",
          email: business.email || "",
          founded: business.yearFounded?.toString() || "Unknown",
          services: Array.isArray(business.mainServices)
            ? business.mainServices.join(", ")
            : business.mainServices || "",
          otherServices: Array.isArray(business.otherServices)
            ? business.otherServices.join(", ")
            : business.otherServices || "",
          size: business.companySize
            ? `${business.companySize} employees`
            : "Unknown",
          serviceArea: business.serviceArea || "",
          description: business.description || "",
          contractorType: business.typeContractor || "General Contractor",
          logo: business.images?.find((img: any) => img.type === "logo")?.url,
          images: business.images || [],
        })
      );

      console.log("Transformed businesses:", transformedBusinesses);

      setBusinesses(transformedBusinesses);
      setBusinessCount(result.count);
      setSheetName("Business_Directory_Analysis");
      setIsConnected(true);
      setCanProceedToAutomation(true);
      setLoadingStage("Analysis complete!");

      // Set metadata for display
      setAnalysisMetadata({
        source: "service-account",
        businessesWithImages: transformedBusinesses.filter(
          (b) => b.images && b.images.length > 0
        ).length,
        totalImages: transformedBusinesses.reduce(
          (acc, b) => acc + (b.images?.length || 0),
          0
        ),
        ...result.metadata,
      });
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to analyze business data");
      setIsConnected(false);
      setCanProceedToAutomation(false);
    } finally {
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  const handleProceedToAutomation = () => {
    setCurrentView("automation");
  };

  const handleViewDetails = (business: BusinessData) => {
    setSelectedBusiness(business);
    setIsDetailModalOpen(true);
  };

  // Show automation page
  if (currentView === "automation") {
    return (
      <AutomationPage
        businesses={businesses}
        accessToken={""} // Not needed for service account
        onBack={() => setCurrentView("dashboard")}
      />
    );
  }

  // Show dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Modern Header */}
          <div className="text-center space-y-6 py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
              <FileSpreadsheet className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
                Business Intelligence
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Automated business directory analysis with Google Drive
                integration using service account authentication
              </p>
            </div>
          </div>

          {/* Service Account Integration Card */}
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-emerald-600/5"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg">
                  <Key className="h-6 w-6 text-white" />
                </div>
                Service Account Integration
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 mt-2">
                Direct access to your Google Drive business directory using
                secure service account credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="relative pt-0">
              <div className="space-y-4">
                {/* Service Account Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span>Uses service-account.json credentials</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>No OAuth popup required</span>
                  </div>
                </div>

                <Button
                  onClick={handleStartAnalysis}
                  disabled={isLoading}
                  size="lg"
                  className="group h-14 px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.02] w-full md:w-auto"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      <span className="animate-pulse">
                        {loadingStage || "Processing..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      Analyze Business Directory
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="destructive"
              className="border-red-200 bg-red-50/80 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300"
            >
              <AlertDescription className="text-red-800">
                <div className="font-semibold mb-2">Error:</div>
                {error}
                {error.includes("credentials") && (
                  <div className="mt-3 text-sm">
                    <strong>Setup Required:</strong>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>
                        Create a Google Service Account in Google Cloud Console
                      </li>
                      <li>Download the JSON credentials file</li>
                      <li>
                        Place it at{" "}
                        <code className="bg-red-100 px-1 rounded">
                          credentials/service-account.json
                        </code>
                      </li>
                      <li>
                        Share your "Business Directory" folder with the service
                        account email
                      </li>
                      <li>
                        Ensure your CSV/Google Sheets file is named "businesses"
                      </li>
                    </ol>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Processing Errors */}
          {processingErrors.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50/80 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
              <AlertDescription className="text-amber-800">
                <div className="font-semibold mb-2">
                  Some businesses had processing issues:
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {processingErrors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {processingErrors.length > 5 && (
                    <li>... and {processingErrors.length - 5} more issues</li>
                  )}
                </ul>
                <div className="mt-2 text-sm">
                  These businesses were skipped but analysis continues.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Connection Status */}
          {isConnected && (
            <Alert className="border-green-200 bg-green-50/80 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
              <AlertDescription className="text-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-semibold">
                    Successfully connected to Google Drive
                  </span>
                </div>
                {analysisMetadata && (
                  <div className="text-sm space-y-1">
                    <div>Authentication: Service Account</div>
                    <div>Images Downloaded: {analysisMetadata.totalImages}</div>
                    <div>
                      Businesses with Images:{" "}
                      {analysisMetadata.businessesWithImages}
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Results Section */}
          {businessCount !== null && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
              {/* Analytics Header */}
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-blue-600/5 to-purple-600/5"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-xl shadow-lg">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    Analytics Dashboard
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-600 mt-2">
                    Data source:{" "}
                    <span className="font-semibold text-slate-800">
                      {sheetName}
                    </span>
                    {processingErrors.length > 0 && (
                      <span className="block text-amber-600 text-sm mt-1">
                        {processingErrors.length} businesses had processing
                        issues
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg shadow-blue-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50 backdrop-blur-sm hover:shadow-xl hover:shadow-blue-200/60 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-blue-700 mb-2 group-hover:scale-110 transition-transform duration-200">
                      {businessCount}
                    </div>
                    <div className="text-blue-600 font-medium">
                      Total Businesses
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-emerald-200/50 bg-gradient-to-br from-emerald-50 to-emerald-100/50 backdrop-blur-sm hover:shadow-xl hover:shadow-emerald-200/60 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-emerald-700 mb-2 group-hover:scale-110 transition-transform duration-200">
                      {
                        businesses.filter(
                          (b) => b.images && b.images.length > 0
                        ).length
                      }
                    </div>
                    <div className="text-emerald-600 font-medium">
                      With Images
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-200/60 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-purple-700 mb-2 group-hover:scale-110 transition-transform duration-200">
                      {businesses.reduce(
                        (acc, b) => acc + (b.images?.length || 0),
                        0
                      )}
                    </div>
                    <div className="text-purple-600 font-medium">
                      Total Images
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-100/50 backdrop-blur-sm hover:shadow-xl hover:shadow-amber-200/60 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-amber-700 mb-2 group-hover:scale-110 transition-transform duration-200">
                      {businesses.length > 0
                        ? Math.round(
                            businesses.reduce(
                              (acc, b) =>
                                acc +
                                (new Date().getFullYear() -
                                  parseInt(b.founded || "0")),
                              0
                            ) / businesses.length
                          )
                        : 0}
                    </div>
                    <div className="text-amber-600 font-medium">
                      Avg Years Active
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Directory */}
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl shadow-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    Business Directory
                  </CardTitle>
                  <CardDescription>
                    Complete business profiles with automated image processing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {businesses.map((business, index) => (
                    <EnhancedBusinessCard
                      key={index}
                      business={business}
                      index={index}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </CardContent>
              </Card>

              {/* Proceed to Automation Button */}
              {canProceedToAutomation && (
                <Card className="border-0 shadow-xl shadow-emerald-200/50 bg-gradient-to-r from-emerald-50 to-green-50 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-6 text-center">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-emerald-900 mb-2">
                          Ready for Automation
                        </h3>
                        <p className="text-emerald-700">
                          Successfully processed {businesses.length} businesses
                          with{" "}
                          {businesses.reduce(
                            (acc, b) => acc + (b.images?.length || 0),
                            0
                          )}{" "}
                          images.
                          {processingErrors.length > 0 &&
                            ` ${processingErrors.length} businesses were skipped due to errors.`}
                        </p>
                      </div>
                      <Button
                        onClick={handleProceedToAutomation}
                        size="lg"
                        className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105"
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        Proceed to Automation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Business Detail Modal */}
      <BusinessDetailModal
        business={selectedBusiness}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBusiness(null);
        }}
      />
    </div>
  );
}
