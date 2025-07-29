export interface BusinessImage {
  name: string;
  type: "logo" | "banner" | "image";
  driveId: string;
  url: string;
  thumbnailUrl?: string;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "error" | "warning";
  business?: string;
  message: string;
  details?: any;
}

export interface BusinessData {
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
  images?: BusinessImage[];}

export interface BusinessAnalytics {
  totalBusinesses: number;
  contractorTypes: number;
  serviceAreas: number;
  averageYearsActive: number;
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  type: "info" | "success" | "error" | "warning";
  business?: string;
  message: string;
  details?: any;
}

export interface AutomationStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentBusiness?: string;
  status: "idle" | "running" | "paused" | "completed" | "error";
  startTime?: string;
  estimatedTimeRemaining?: number;
}


export interface EnhancedBusinessData extends BusinessData {
  images: BusinessImage[];  // This ensures images are always BusinessImage[]
  imageFolder: {
    id: string;
    name: string;
    found: boolean;
  };
}