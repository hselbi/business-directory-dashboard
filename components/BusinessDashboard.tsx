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
  FolderOpen,
  Play,
  TrendingUp,
  Building2,
  Zap,
} from "lucide-react";
import { BusinessData } from "@/types/business";
import BusinessDetailModal from "./BusinessDetailModal";
import BusinessCard from "./BusinessCard";
import AutomationPage from "./AutomationPage";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [canProceedToAutomation, setCanProceedToAutomation] = useState(false);
  const [accessToken, setAccessToken] = useState<string>("");
  const [currentView, setCurrentView] = useState<"dashboard" | "automation">(
    "dashboard"
  );

  // Mock data for testing
  const mockBusinessData: BusinessData[] = [
    {
      name: "TechFlow Solutions",
      address: "123 Innovation Drive, San Francisco, CA 94105",
      phone: "+1 (555) 123-4567",
      website: "https://techflowsolutions.com",
      email: "contact@techflowsolutions.com",
      founded: "2018",
      services: "Web Development, Mobile Apps, Cloud Solutions",
      otherServices: "DevOps, Technical Consulting, UI/UX Design",
      size: "Medium (25-50 employees)",
      serviceArea: "San Francisco Bay Area",
      description:
        "Leading technology solutions provider specializing in scalable web and mobile applications for enterprise clients.",
      contractorType: "Technology Provider",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center",
      images: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
      ],
    },
    {
      name: "GreenBuild Construction",
      address: "789 Eco Street, Portland, OR 97201",
      phone: "+1 (555) 987-6543",
      website: "https://greenbuildconstruction.com",
      email: "info@greenbuildconstruction.com",
      founded: "2015",
      services:
        "Sustainable Construction, LEED Certification, Green Renovations",
      otherServices:
        "Energy Audits, Solar Installation, Eco-friendly Materials",
      size: "Large (100+ employees)",
      serviceArea: "Pacific Northwest",
      description:
        "Pioneering sustainable construction company focused on environmentally responsible building practices.",
      contractorType: "Specialized Contractor",
      logo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&h=100&fit=crop&crop=center",
      images: [
        "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
      ],
    },
    {
      name: "Digital Marketing Hub",
      address: "456 Commerce Blvd, Austin, TX 78701",
      phone: "+1 (555) 555-0123",
      website: "https://digitalmarketinghub.com",
      email: "hello@digitalmarketinghub.com",
      founded: "2020",
      services: "SEO, Social Media Marketing, PPC Advertising",
      otherServices: "Content Creation, Brand Strategy, Analytics",
      size: "Small (5-25 employees)",
      serviceArea: "Texas and Southwest US",
      description:
        "Full-service digital marketing agency helping businesses grow their online presence and drive conversions.",
      contractorType: "Service Provider",
    },
  ];

  // API-based authentication flow
  const handleStartAnalysis = async () => {
    setIsLoading(true);
    setError("");
    setProcessingErrors([]);
    setLoadingStage("Initializing authentication...");

    try {
      // Check if Google credentials are configured
      if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        // Use mock data for testing
        setLoadingStage("Using mock data for demonstration...");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setBusinesses(mockBusinessData);
        setBusinessCount(mockBusinessData.length);
        setSheetName("Mock_Business_Directory_2024.xlsx");
        setIsAuthenticated(true);
        setCanProceedToAutomation(true);
        setLoadingStage("Mock analysis complete!");
        return;
      }

      // Step 1: Get Google Auth URL
      setLoadingStage("Connecting to Google Drive...");
      const authResponse = await fetch("/api/auth/google");
      const authData = await authResponse.json();

      if (!authResponse.ok) {
        throw new Error(
          authData.error || "Failed to initialize authentication"
        );
      }

      // Step 2: Redirect to Google OAuth
      if (authData.authUrl) {
        setLoadingStage("Redirecting to Google authentication...");
        const popup = window.open(
          authData.authUrl,
          "google-auth",
          "width=500,height=600,scrollbars=yes,resizable=yes"
        );

        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsLoading(false);
            setLoadingStage("");
          }
        }, 1000);

        const handleMessage = async (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "GOOGLE_AUTH_SUCCESS") {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener("message", handleMessage);
            const authCode = event.data.code;
            await handleAuthSuccess(authCode);
          } else if (event.data.type === "GOOGLE_AUTH_ERROR") {
            clearInterval(checkClosed);
            popup?.close();
            window.removeEventListener("message", handleMessage);
            throw new Error("Authentication failed");
          }
        };

        window.addEventListener("message", handleMessage);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setIsAuthenticated(false);
      setCanProceedToAutomation(false);
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  const handleAuthSuccess = async (authCode: string) => {
    try {
      setLoadingStage("Processing authentication...");

      const tokenResponse = await fetch(`/api/auth/google?code=${authCode}`);
      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error || "Failed to get access token");
      }

      setAccessToken(tokenData.accessToken);
      setIsAuthenticated(true);
      await performBusinessAnalysis(tokenData.accessToken);
    } catch (err: any) {
      setError(err.message || "Failed to process authentication");
      setIsAuthenticated(false);
      setCanProceedToAutomation(false);
      setIsLoading(false);
      setLoadingStage("");
    }
  };

  const performBusinessAnalysis = async (token: string) => {
    try {
      setLoadingStage("Analyzing business directory...");

      const analysisResponse = await fetch("/api/analyze/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: token,
          folderName: "Business Directory",
        }),
      });

      const analysisData = await analysisResponse.json();

      if (!analysisResponse.ok) {
        throw new Error(analysisData.error || "Failed to analyze businesses");
      }

      setBusinesses(analysisData.businesses);
      setBusinessCount(analysisData.analytics.totalBusinesses);
      setSheetName(analysisData.metadata.sheetName);
      setProcessingErrors(analysisData.metadata.processingErrors || []);
      setCanProceedToAutomation(true);
      setLoadingStage("Analysis complete!");
    } catch (err: any) {
      setError(err.message || "Failed to analyze businesses");
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
        accessToken={accessToken}
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
                Comprehensive business directory analysis with detailed company
                profiles and market insights
              </p>
            </div>
          </div>

          {/* Hero Start Button Card */}
          <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-2xl hover:shadow-slate-200/60 transition-all duration-500 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-emerald-600/5"></div>
            <CardHeader className="relative pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl shadow-lg">
                  <FolderOpen className="h-6 w-6 text-white" />
                </div>
                Google Drive Integration
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 mt-2">
                Connect seamlessly to your Google Drive and unlock comprehensive
                business analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="relative pt-0">
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
                    Connect to Google Drive
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert
              variant="destructive"
              className="border-red-200 bg-red-50/80 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300"
            >
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Processing Errors */}
          {processingErrors.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50/80 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
              <AlertDescription className="text-amber-800">
                <div className="font-semibold mb-2">
                  Some businesses had issues during processing:
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

          {/* Authentication Status */}
          {isAuthenticated && (
            <Alert className="border-green-200 bg-green-50/80 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
              <AlertDescription className="text-green-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Successfully connected to Google Drive
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
                      {new Set(businesses.map((b) => b.contractorType)).size}
                    </div>
                    <div className="text-emerald-600 font-medium">
                      Contractor Types
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg shadow-purple-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-200/60 transition-all duration-300 group">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-purple-700 mb-2 group-hover:scale-110 transition-transform duration-200">
                      {new Set(businesses.map((b) => b.serviceArea)).size}
                    </div>
                    <div className="text-purple-600 font-medium">
                      Service Areas
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
                                  parseInt(b.founded)),
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
                    Click "More Details" to view comprehensive business
                    information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {businesses.map((business, index) => (
                    <BusinessCard
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
                          Successfully processed {businesses.length} businesses.
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
