"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertTriangle,
  XCircle,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react";
import { BusinessData } from "@/types/business";
import { BusinessValidator } from "@/lib/business-validator";
import BusinessDetailModal from "@/components/BusinessDetailModal";
import BusinessCard from "@/components/BusinessCard";
import AutomationPage from "@/components/AutomationPage";

export default function BusinessFilteredDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [businessCount, setBusinessCount] = useState<number | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<BusinessData[]>([]);
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
  const [activeTab, setActiveTab] = useState<"complete" | "incomplete">(
    "complete"
  );

  // ✅ Filter businesses based on completeness
  const filteredData = useMemo(() => {
    if (allBusinesses.length === 0) {
      return {
        complete: [],
        incomplete: [],
        statistics: { total: 0, complete: 0, incomplete: 0, completionRate: 0 },
      };
    }

    return BusinessValidator.filterCompleteBusinesses(allBusinesses);
  }, [allBusinesses]);

  // ✅ Get missing fields summary
  const missingFieldsSummary = useMemo(() => {
    return BusinessValidator.getMissingFieldsSummary(allBusinesses);
  }, [allBusinesses]);

  // Main analysis function
  const handleStartAnalysis = async () => {
    setIsLoading(true);
    setError("");
    setProcessingErrors([]);
    setLoadingStage("Initializing connection...");

    try {
      setLoadingStage("Connecting to Google Drive with service account...");

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

      setLoadingStage("Processing and filtering business data...");

      console.log(result)

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
          images: business.images || [],

          // Keep original fields for validation
          yearFounded: business.yearFounded,
          mainServices: business.mainServices,
          companySize: business.companySize,
          typeContractor: business.typeContractor,
          gmail: business.gmail,
          gmailAppPassword: business.gmailAppPassword,
        })
      );

      setAllBusinesses(transformedBusinesses);
      setBusinessCount(result.count);
      setSheetName("Business_Directory_Analysis");
      setIsConnected(true);
      setLoadingStage("Analysis complete!");

      // Only proceed to automation with complete businesses
      const filtered = BusinessValidator.filterCompleteBusinesses(
        transformedBusinesses
      );
      setCanProceedToAutomation(filtered.complete.length > 0);

      setAnalysisMetadata({
        source: "service-account",
        ...result.metadata,
        filtering: filtered.statistics,
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

  // Show automation page (only with complete businesses)
  if (currentView === "automation") {
    return (
      <AutomationPage
        businesses={filteredData.complete}
        accessToken=""
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
                Automated business directory analysis with data completeness
                filtering
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
                Direct access to your Google Drive business directory with
                automated completeness filtering
              </CardDescription>
            </CardHeader>
            <CardContent className="relative pt-0">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <Database className="h-4 w-4 text-blue-600" />
                    <span>Uses service-account.json credentials</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <Filter className="h-4 w-4 text-green-600" />
                    <span>Filters complete business data only</span>
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
                      Analyze & Filter Business Directory
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
                {analysisMetadata?.filtering && (
                  <div className="text-sm space-y-1">
                    <div>Authentication: Service Account</div>
                    <div>
                      Complete Businesses: {analysisMetadata.filtering.complete}
                      /{analysisMetadata.filtering.total} (
                      {analysisMetadata.filtering.completionRate}%)
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Results Section */}
          {businessCount !== null && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
              {/* Filtering Statistics */}
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="p-2 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-xl shadow-lg">
                      <Filter className="h-6 w-6 text-white" />
                    </div>
                    Data Completeness Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {filteredData.statistics.total}
                      </div>
                      <div className="text-sm text-blue-600">Total Found</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {filteredData.statistics.complete}
                      </div>
                      <div className="text-sm text-green-600">Complete</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {filteredData.statistics.incomplete}
                      </div>
                      <div className="text-sm text-orange-600">Incomplete</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {filteredData.statistics.completionRate}%
                      </div>
                      <div className="text-sm text-purple-600">
                        Completion Rate
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Tabs */}
              <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl shadow-lg">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    Business Directory
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) =>
                      setActiveTab(value as "complete" | "incomplete")
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="complete"
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Complete ({filteredData.statistics.complete})
                      </TabsTrigger>
                      <TabsTrigger
                        value="incomplete"
                        className="flex items-center gap-2"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        Incomplete ({filteredData.statistics.incomplete})
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="complete" className="space-y-4 mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-800 font-medium">
                          Ready for automation - All required fields completed
                        </span>
                      </div>

                      {filteredData.complete.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <XCircle className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                          <div className="font-medium">
                            No complete businesses found
                          </div>
                          <div className="text-sm">
                            All businesses are missing required fields
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredData.complete.map((business, index) => (
                            <BusinessCard
                              key={index}
                              business={business}
                              index={index}
                              onViewDetails={handleViewDetails}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="incomplete" className="space-y-4 mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <span className="text-orange-800 font-medium">
                          Missing required fields - Will be skipped in
                          automation
                        </span>
                      </div>

                      {filteredData.incomplete.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                          <div className="font-medium">
                            All businesses are complete!
                          </div>
                          <div className="text-sm">
                            No businesses are missing required fields
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredData.incomplete.map((business, index) => (
                            <div key={index} className="relative">
                              <BusinessCard
                                business={business}
                                index={index}
                                onViewDetails={handleViewDetails}
                              />
                              {/* Missing fields overlay */}
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                                  {business._validation.missing.length} missing
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Missing Fields Summary */}
              {missingFieldsSummary.length > 0 && (
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Most Common Missing Fields
                    </CardTitle>
                    <CardDescription>
                      Fields that are missing most frequently across businesses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {missingFieldsSummary.slice(0, 10).map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-orange-50 rounded-lg"
                        >
                          <span className="text-orange-900 font-medium">
                            {item.field}
                          </span>
                          <Badge className="bg-orange-200 text-orange-800">
                            {item.count} ({item.percentage}%)
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Proceed to Automation Button */}
              {canProceedToAutomation &&
                filteredData.statistics.complete > 0 && (
                  <Card className="border-0 shadow-xl shadow-emerald-200/50 bg-gradient-to-r from-emerald-50 to-green-50 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-6 text-center">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-emerald-900 mb-2">
                            Ready for Automation
                          </h3>
                          <p className="text-emerald-700">
                            {filteredData.statistics.complete} complete
                            businesses ready for processing.
                            {filteredData.statistics.incomplete > 0 &&
                              ` ${filteredData.statistics.incomplete} incomplete businesses will be skipped.`}
                          </p>
                        </div>
                        <Button
                          onClick={handleProceedToAutomation}
                          size="lg"
                          className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105"
                        >
                          <Zap className="mr-2 h-5 w-5" />
                          Proceed with {filteredData.statistics.complete}{" "}
                          Complete Businesses
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
