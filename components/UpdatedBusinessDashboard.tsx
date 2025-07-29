"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import StandaloneAutomation from "./StandaloneAutomation";
import { useAuth } from "@/contexts/AuthContext";

export default function UpdatedBusinessDashboard() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
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
  const [canProceedToAutomation, setCanProceedToAutomation] = useState(false);
  const [accessToken, setAccessToken] = useState<string>("");
  const [currentView, setCurrentView] = useState<"dashboard" | "automation">(
    "dashboard"
  );
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Mock data for MVP demonstration
  const mockBusinessData: BusinessData[] = [
    {
      name: "Elite Roofing Solutions",
      address: "1245 Construction Blvd, Phoenix, AZ 85034",
      phone: "(602) 555-0123",
      website: "https://eliteroofingsolutions.com",
      email: "info@eliteroofingsolutions.com",
      founded: "2018",
      services:
        "Residential Roofing, Commercial Roofing, Roof Repair, Emergency Roof Services",
      otherServices:
        "Gutter Installation, Solar Panel Integration, Roof Inspection",
      size: "Medium (25-50 employees)",
      serviceArea: "Phoenix Metro Area",
      description:
        "Premier roofing contractor specializing in high-quality residential and commercial roofing solutions with 24/7 emergency services.",
      contractorType: "Specialized Contractor",
      logo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&h=100&fit=crop&crop=center",
      images: [
        {
          name: "Elite Roofing Logo",
          type: "logo",
          driveId: "1234567890abcdef",
          url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&h=100&fit=crop&crop=center",
        },
        {
          name: "Roof Installation Example",
          type: "image",
          driveId: "abcdef1234567890",
          url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
        },
      ],
    },
    {
      name: "TechFlow Digital Solutions",
      address: "789 Innovation Drive, Austin, TX 78701",
      phone: "(512) 555-0198",
      website: "https://techflowdigital.com",
      email: "contact@techflowdigital.com",
      founded: "2020",
      services:
        "Web Development, Mobile Apps, E-commerce Solutions, Digital Marketing",
      otherServices:
        "SEO Optimization, Social Media Management, Brand Development",
      size: "Small (15-25 employees)",
      serviceArea: "Texas and Southwest US",
      description:
        "Cutting-edge digital solutions provider helping businesses transform their online presence with modern web technologies and strategic digital marketing.",
      contractorType: "Technology Provider",
      logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center",
      images: [
        {
          name: "TechFlow Logo",
          type: "logo",
          driveId: "abcdef1234567890",
          url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=100&h=100&fit=crop&crop=center",
        },
        {
          name: "Web Development Example",
          type: "image",
          driveId: "1234567890abcdef",
          url: "https://images.unsplash.com/photo-1521790988038-8c1e4c5a9e6f?w=400&h=300&fit=crop",
        },
      ],
    },
    {
      name: "GreenBuild Sustainable Construction",
      address: "456 Eco Street, Portland, OR 97201",
      phone: "(503) 555-0287",
      website: "https://greenbuildconstruction.com",
      email: "projects@greenbuildconstruction.com",
      founded: "2015",
      services:
        "Sustainable Construction, LEED Certification, Green Renovations, Energy Audits",
      otherServices:
        "Solar Installation, Eco-friendly Materials, Green Consulting",
      size: "Large (75+ employees)",
      serviceArea: "Pacific Northwest",
      description:
        "Leading sustainable construction company focused on environmentally responsible building practices and LEED-certified green construction projects.",
      contractorType: "General Contractor",
      logo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&h=100&fit=crop&crop=center",
      images: [
        {
          name: "GreenBuild Logo",
          type: "logo",
          driveId: "abcdef1234567890",
          url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=100&h=100&fit=crop&crop=center",
        },
      ],
    },
    {
      name: "Metropolitan HVAC Services",
      address: "892 Industrial Way, Denver, CO 80202",
      phone: "(303) 555-0456",
      website: "https://metrohvacservices.com",
      email: "service@metrohovac.com",
      founded: "2012",
      services:
        "HVAC Installation, AC Repair, Heating Systems, Commercial HVAC",
      otherServices:
        "Duct Cleaning, Energy Efficiency Audits, Maintenance Contracts",
      size: "Medium (35-60 employees)",
      serviceArea: "Denver Metro Area",
      description:
        "Full-service HVAC contractor providing reliable heating, ventilation, and air conditioning solutions for residential and commercial properties.",
      contractorType: "Specialized Contractor",
      logo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop&crop=center",
      images: [
        {
          name: "Metropolitan HVAC Logo",
          type: "logo",
          driveId: "1234567890abcdef",
          url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop&crop=center",
        },
        {
          name: "HVAC Installation Example",
          type: "image",
          driveId: "abcdef1234567890",
          url: "https://images.unsplash.com/photo-1594736797933-d0401ba871ff?w=400&h=300&fit=crop",
        },
      ],
    },
    {
      name: "Precision Plumbing Professionals",
      address: "321 Service Road, Miami, FL 33101",
      phone: "(305) 555-0789",
      website: "https://precisionplumbingpro.com",
      email: "emergency@precisionplumbing.com",
      founded: "2019",
      services:
        "Emergency Plumbing, Pipe Installation, Water Heater Service, Drain Cleaning",
      otherServices: "Bathroom Remodeling, Leak Detection, Sewer Line Repair",
      size: "Small (10-20 employees)",
      serviceArea: "South Florida",
      description:
        "Reliable 24/7 plumbing services with expert technicians specializing in emergency repairs and comprehensive plumbing solutions.",
      contractorType: "Service Provider",
      logo: "https://images.unsplash.com/photo-1594736797933-d0401ba871ff?w=100&h=100&fit=crop&crop=center",
      images: [],
    },
    {
      name: "Advanced Security Systems Inc",
      address: "567 Tech Boulevard, Seattle, WA 98101",
      phone: "(206) 555-0321",
      website: "https://advancedsecuritysystems.com",
      email: "info@advancedsecurity.com",
      founded: "2017",
      services:
        "Security System Installation, Video Surveillance, Access Control, Alarm Systems",
      otherServices:
        "Smart Home Integration, Monitoring Services, Security Consulting",
      size: "Medium (30-45 employees)",
      serviceArea: "Washington State",
      description:
        "State-of-the-art security solutions provider offering comprehensive protection systems for residential and commercial properties.",
      contractorType: "Technology Contractor",
      logo: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&h=100&fit=crop&crop=center",
      images: [
        {
          name: "Advanced Security Logo",
          type: "logo",
          driveId: "1234567890abcdef",
          url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop",
          thumbnailUrl:
            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&h=100&fit=crop&crop=center",
        },
      ],
    },
  ];

  // MVP: Simulate loading business data
  const handleStartAnalysis = async () => {
    setIsLoading(true);
    setError("");
    setProcessingErrors([]);
    setLoadingStage("Loading business data...");

    try {
      // Simulate data loading
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setLoadingStage("Analyzing business information...");

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLoadingStage("Validating contact details...");

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoadingStage("Preparing automation data...");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Load mock data
      setBusinesses(mockBusinessData);
      setBusinessCount(mockBusinessData.length);
      setSheetName("Business_Directory_Demo.xlsx");
      setCanProceedToAutomation(true);
      setLoadingStage("Analysis complete!");

      // Simulate some processing warnings for realism
      setProcessingErrors([
        "1 business missing website information",
        "2 businesses require phone number verification",
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to load business data");
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
      <StandaloneAutomation
        businesses={businesses}
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
                Comprehensive business directory analysis with automated
                submission capabilities
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
                Business Data Analysis
              </CardTitle>
              <CardDescription className="text-lg text-slate-600 mt-2">
                Load and analyze business directory data to prepare for
                automated submissions
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
                    Load Business Data
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

          {/* Processing Warnings */}
          {processingErrors.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50/80 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
              <AlertDescription className="text-amber-800">
                <div className="font-semibold mb-2">Data Quality Notes:</div>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {processingErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
                <div className="mt-2 text-sm">
                  These issues can be addressed during automation setup.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Authentication Status */}
          {isAuthenticated && (
            <Alert className="border-green-200 bg-green-50/80 backdrop-blur-sm animate-in slide-in-from-top-2 duration-300">
              <AlertDescription className="text-green-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Business data loaded successfully and ready for automation
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
                    Business Analytics
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-600 mt-2">
                    Data source:{" "}
                    <span className="font-semibold text-slate-800">
                      {sheetName}
                    </span>
                    {processingErrors.length > 0 && (
                      <span className="block text-amber-600 text-sm mt-1">
                        {processingErrors.length} data quality notes identified
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
                      Business Types
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
                    Review business information and click "More Details" for
                    comprehensive profiles
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
                          Ready for Automation Demo
                        </h3>
                        <p className="text-emerald-700">
                          Successfully loaded {businesses.length} businesses.
                          Click below to see the automation process in action.
                          {processingErrors.length > 0 && (
                            <span className="block text-emerald-600 text-sm mt-1">
                              Note: {processingErrors.length} minor data quality
                              issues can be addressed during automation.
                            </span>
                          )}
                        </p>
                      </div>
                      <Button
                        onClick={handleProceedToAutomation}
                        size="lg"
                        className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-105"
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        Start Automation Demo
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
