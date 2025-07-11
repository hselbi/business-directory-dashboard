"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Building2, 
  Download,
  Eye,
  Grid3X3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import our components
import { DashboardHeader } from "@/components/DashboardHeader";
import { DataImportForm } from "@/components/DataImportForm";
import { ImageUploadDialog } from "@/components/ImageUploadDialog";
import { BusinessDataTable } from "@/components/BusinessDataTable";
import BusinessCard from "@/components/BusinessCard";
import { useAuth } from "@/contexts/AuthContext";

interface BusinessData {
  name: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  founded: string;
  services: string;
  otherServices: string;
  size: string;
  serviceArea: string;
  description: string;
  contractorType: string;
  logo?: string;
  images?: string[];
}

interface SheetData {
  headers: string[];
  rows: Record<string, string>[];
}

export default function Dashboard() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [businessData, setBusinessData] = useState<BusinessData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
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


  const parseTransposedData = (data: SheetData): BusinessData[] => {
    if (!data.rows || data.rows.length === 0) return [];

    const businesses: BusinessData[] = [];
    const businessColumns = data.headers.slice(1).filter(header => header && header.trim());
    
    businessColumns.forEach((businessName) => {
      if (!businessName.trim()) return;
      
      const business: BusinessData = {
        name: businessName,
        address: '',
        phone: '',
        website: '',
        email: '',
        founded: '',
        services: '',
        otherServices: '',
        size: '',
        serviceArea: '',
        description: '',
        contractorType: '',
        logo: '',
        images: []
      };

      data.rows.forEach(row => {
        const fieldName = row[data.headers[0]]?.toLowerCase() || '';
        const value = row[businessName] || '';

        if (fieldName.includes('address')) business.address = value;
        else if (fieldName.includes('phone')) business.phone = value;
        else if (fieldName.includes('website')) business.website = value;
        else if (fieldName.includes('email')) business.email = value;
        else if (fieldName.includes('founded') || fieldName.includes('year')) business.founded = value;
        else if (fieldName.includes('main services')) business.services = value;
        else if (fieldName.includes('other') && fieldName.includes('services')) business.otherServices = value;
        else if (fieldName.includes('size')) business.size = value;
        else if (fieldName.includes('service area') || fieldName.includes('radius')) business.serviceArea = value;
        else if (fieldName.includes('description')) business.description = value;
        else if (fieldName.includes('contractor') && fieldName.includes('type')) business.contractorType = value;
      });

      businesses.push(business);
    });

    return businesses;
  };

  const handleFetchData = async () => {
    if (!sheetUrl.trim()) {
      setError("Please enter a Google Sheets URL");
      return;
    }

    setIsLoading(true);
    setError("");
    setSheetData(null);
    setBusinessData([]);

    try {
      const response = await fetch(`/api/fetch-sheet?url=${encodeURIComponent(sheetUrl)}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch sheet data");
      }

      const data: SheetData = await response.json();
      setSheetData(data);
      
      const businesses = parseTransposedData(data);
      setBusinessData(businesses);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadJSON = () => {
    if (!businessData.length) return;
    
    const jsonContent = JSON.stringify(businessData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business_data.json';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCardClick = (business: BusinessData) => {
    setSelectedBusiness(business);
    setDialogOpen(true);
  };

  const handleLogoUpload = (file: File) => {
    if (!selectedBusiness) return;

    setUploading(true);
    const fileUrl = URL.createObjectURL(file);
    
    const updatedBusinessData = businessData.map(business => {
      if (business.name === selectedBusiness.name) {
        return { ...business, logo: fileUrl };
      }
      return business;
    });
    
    setBusinessData(updatedBusinessData);
    const updatedBusiness = updatedBusinessData.find(b => b.name === selectedBusiness.name);
    if (updatedBusiness) {
      setSelectedBusiness(updatedBusiness);
    }
    
    setUploading(false);
  };

  const handleImagesUpload = (files: File[]) => {
    if (!selectedBusiness) return;

    setUploading(true);
    const fileUrls = files.map(file => URL.createObjectURL(file));
    
    const updatedBusinessData = businessData.map(business => {
      if (business.name === selectedBusiness.name) {
        const currentImages = business.images || [];
        return { ...business, images: [...currentImages, ...fileUrls] };
      }
      return business;
    });
    
    setBusinessData(updatedBusinessData);
    const updatedBusiness = updatedBusinessData.find(b => b.name === selectedBusiness.name);
    if (updatedBusiness) {
      setSelectedBusiness(updatedBusiness);
    }
    
    setUploading(false);
  };

  const handleRemoveLogo = () => {
    if (!selectedBusiness) return;
    
    const updatedBusinessData = businessData.map(business => {
      if (business.name === selectedBusiness.name) {
        if (business.logo) {
          URL.revokeObjectURL(business.logo);
        }
        return { ...business, logo: '' };
      }
      return business;
    });
    
    setBusinessData(updatedBusinessData);
    const updatedBusiness = updatedBusinessData.find(b => b.name === selectedBusiness.name);
    if (updatedBusiness) {
      setSelectedBusiness(updatedBusiness);
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    if (!selectedBusiness) return;
    
    const updatedBusinessData = businessData.map(business => {
      if (business.name === selectedBusiness.name) {
        const filteredImages = (business.images || []).filter(img => img !== imageUrl);
        return { ...business, images: filteredImages };
      }
      return business;
    });
    
    setBusinessData(updatedBusinessData);
    const updatedBusiness = updatedBusinessData.find(b => b.name === selectedBusiness.name);
    if (updatedBusiness) {
      setSelectedBusiness(updatedBusiness);
    }
    
    URL.revokeObjectURL(imageUrl);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50"
    >
      <DashboardHeader 
        userEmail={user.email}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <DataImportForm
          sheetUrl={sheetUrl}
          setSheetUrl={setSheetUrl}
          onFetchData={handleFetchData}
          isLoading={isLoading}
          error={error}
        />

        {businessData.length > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Stats & Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  <Building2 className="h-3 w-3 mr-1" />
                  {businessData.length} {businessData.length === 1 ? 'Business' : 'Businesses'} Found
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'cards' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('cards')}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Cards
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="gap-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                  Table
                </Button>
                <Button
                  onClick={downloadJSON}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
              </div>
            </div>

            {/* Business Cards View */}
            {viewMode === 'cards' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {businessData.map((business, index) => (
                    <BusinessCard
                      key={index}
                      business={business}
                      index={index}
                      onClick={() => handleCardClick(business)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && sheetData && (
              <BusinessDataTable sheetData={sheetData} />
            )}
          </motion.div>
        )}

        <ImageUploadDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          business={selectedBusiness}
          onLogoUpload={handleLogoUpload}
          onImagesUpload={handleImagesUpload}
          onRemoveLogo={handleRemoveLogo}
          onRemoveImage={handleRemoveImage}
          uploading={uploading}
        />
      </main>
    </motion.div>
  );
}