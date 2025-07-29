
export interface BusinessRequirements {
    name: boolean;
    address: boolean;
    phone: boolean;
    website: boolean;
    yearFounded: boolean;
    email: boolean;
    mainServices: boolean;
    otherServices: boolean;
    companySize: boolean;
    serviceArea: boolean;
    description: boolean;
    typeContractor: boolean;
    gmail: boolean;
    gmailAppPassword: boolean;
    hasLogo: boolean;        // Must have logo image
    hasBanner: boolean;      // Must have banner image  
    hasAdditionalImages: boolean; // Must have at least 1 additional image (up to 4 total additional)
  }
  
  export interface BusinessValidationResult {
    isComplete: boolean;
    missing: string[];
    requirements: BusinessRequirements;
    completionPercentage: number;
    imageDetails: {
      total: number;
      hasLogo: boolean;
      hasBanner: boolean;
      additionalCount: number;
      logoImage?: any;
      bannerImage?: any;
      additionalImages: any[];
    };
  }
  
  export class BusinessValidator {
    
    // ✅ Check if business has all required fields including specific images
    static validateBusiness(business: any): BusinessValidationResult {
      // ✅ Analyze images
      const images = business.images || [];
      const logoImage = images.find((img: any) => 
        img.type === 'logo' || img.name?.toLowerCase().includes('logo')
      );
      const bannerImage = images.find((img: any) => 
        img.type === 'banner' || img.name?.toLowerCase().includes('banner')
      );
      const additionalImages = images.filter((img: any) => 
        img.type === 'image' || 
        (!img.name?.toLowerCase().includes('logo') && !img.name?.toLowerCase().includes('banner'))
      );
  
      const imageDetails = {
        total: images.length,
        hasLogo: !!logoImage,
        hasBanner: !!bannerImage,
        additionalCount: additionalImages.length,
        logoImage,
        bannerImage,
        additionalImages
      };
  
      const requirements: BusinessRequirements = {
        name: !!business.name?.trim(),
        address: !!business.address?.trim(),
        phone: !!business.phone?.trim(),
        website: !!business.website?.trim(),
        yearFounded: !!business.yearFounded || !!business.founded?.trim(),
        email: !!business.email?.trim(),
        mainServices: !!(business.mainServices?.length > 0 || business.services?.trim()),
        otherServices: !!(business.otherServices?.length > 0 || business.otherServices?.trim()),
        companySize: !!business.companySize || !!business.size?.trim(),
        serviceArea: !!business.serviceArea?.trim(),
        description: !!business.description?.trim(),
        typeContractor: !!business.typeContractor?.trim() || !!business.contractorType?.trim(),
        gmail: !!business.gmail?.trim(),
        gmailAppPassword: !!business.gmailAppPassword?.trim(),
        hasLogo: imageDetails.hasLogo,
        hasBanner: imageDetails.hasBanner,
        hasAdditionalImages: additionalImages.length >= 1 // At least 1 additional image
      };
  
      const missing: string[] = [];
      const fieldNames = {
        name: 'Business Name',
        address: 'Address',
        phone: 'Phone Number',
        website: 'Website',
        yearFounded: 'Year Founded',
        email: 'Email',
        mainServices: 'Main Services',
        otherServices: 'Other Services',
        companySize: 'Company Size',
        serviceArea: 'Service Area',
        description: 'Description',
        typeContractor: 'Contractor Type',
        gmail: 'Gmail Account',
        gmailAppPassword: 'Gmail App Password',
        hasLogo: 'Logo Image',
        hasBanner: 'Banner Image',
        hasAdditionalImages: 'At Least 1 Additional Image'
      };
  
      // Check which requirements are missing
      Object.entries(requirements).forEach(([key, value]) => {
        if (!value) {
          missing.push(fieldNames[key as keyof typeof fieldNames]);
        }
      });
  
      const totalRequirements = Object.keys(requirements).length;
      const completedRequirements = Object.values(requirements).filter(Boolean).length;
      const completionPercentage = Math.round((completedRequirements / totalRequirements) * 100);
  
      return {
        isComplete: missing.length === 0,
        missing,
        requirements,
        completionPercentage,
        imageDetails
      };
    }
  
    // ✅ Filter businesses to only show complete ones
    static filterCompleteBusinesses(businesses: any[]): {
      complete: any[];
      incomplete: any[];
      statistics: {
        total: number;
        complete: number;
        incomplete: number;
        completionRate: number;
        imageStats: {
          withLogo: number;
          withBanner: number;
          withBothLogoAndBanner: number;
          withAllRequiredImages: number;
        };
      };
    } {
      const complete: any[] = [];
      const incomplete: any[] = [];
      
      let withLogo = 0;
      let withBanner = 0; 
      let withBothLogoAndBanner = 0;
      let withAllRequiredImages = 0;
  
      businesses.forEach(business => {
        const validation = this.validateBusiness(business);
        
        // Count image statistics
        if (validation.imageDetails.hasLogo) withLogo++;
        if (validation.imageDetails.hasBanner) withBanner++;
        if (validation.imageDetails.hasLogo && validation.imageDetails.hasBanner) withBothLogoAndBanner++;
        if (validation.requirements.hasLogo && validation.requirements.hasBanner && validation.requirements.hasAdditionalImages) {
          withAllRequiredImages++;
        }
        
        if (validation.isComplete) {
          complete.push({
            ...business,
            _validation: validation
          });
        } else {
          incomplete.push({
            ...business,
            _validation: validation
          });
        }
      });
  
      return {
        complete,
        incomplete,
        statistics: {
          total: businesses.length,
          complete: complete.length,
          incomplete: incomplete.length,
          completionRate: businesses.length > 0 ? Math.round((complete.length / businesses.length) * 100) : 0,
          imageStats: {
            withLogo,
            withBanner,
            withBothLogoAndBanner,
            withAllRequiredImages
          }
        }
      };
    }
  
    // ✅ Get missing fields summary across all businesses
    static getMissingFieldsSummary(businesses: any[]): { field: string; count: number; percentage: number }[] {
      const fieldCounts: { [key: string]: number } = {};
  
      businesses.forEach(business => {
        const validation = this.validateBusiness(business);
        validation.missing.forEach(field => {
          fieldCounts[field] = (fieldCounts[field] || 0) + 1;
        });
      });
  
      return Object.entries(fieldCounts)
        .map(([field, count]) => ({
          field,
          count,
          percentage: Math.round((count / businesses.length) * 100)
        }))
        .sort((a, b) => b.count - a.count);
    }
  
    // ✅ Get image analysis across all businesses
    static getImageAnalysis(businesses: any[]): {
      totalBusinesses: number;
      businessesWithImages: number;
      businessesWithLogo: number;
      businessesWithBanner: number;
      businessesWithBoth: number;
      businessesWithAllRequired: number;
      averageImagesPerBusiness: number;
      imageTypeDistribution: {
        logos: number;
        banners: number;
        additional: number;
        total: number;
      };
    } {
      let businessesWithImages = 0;
      let businessesWithLogo = 0;
      let businessesWithBanner = 0;
      let businessesWithBoth = 0;
      let businessesWithAllRequired = 0;
      let totalImages = 0;
      let totalLogos = 0;
      let totalBanners = 0;
      let totalAdditional = 0;
  
      businesses.forEach(business => {
        const validation = this.validateBusiness(business);
        const { imageDetails } = validation;
  
        if (imageDetails.total > 0) businessesWithImages++;
        if (imageDetails.hasLogo) businessesWithLogo++;
        if (imageDetails.hasBanner) businessesWithBanner++;
        if (imageDetails.hasLogo && imageDetails.hasBanner) businessesWithBoth++;
        if (validation.requirements.hasLogo && validation.requirements.hasBanner && validation.requirements.hasAdditionalImages) {
          businessesWithAllRequired++;
        }
  
        totalImages += imageDetails.total;
        if (imageDetails.hasLogo) totalLogos++;
        if (imageDetails.hasBanner) totalBanners++;
        totalAdditional += imageDetails.additionalCount;
      });
  
      return {
        totalBusinesses: businesses.length,
        businessesWithImages,
        businessesWithLogo,
        businessesWithBanner,
        businessesWithBoth,
        businessesWithAllRequired,
        averageImagesPerBusiness: businesses.length > 0 ? Math.round((totalImages / businesses.length) * 10) / 10 : 0,
        imageTypeDistribution: {
          logos: totalLogos,
          banners: totalBanners,
          additional: totalAdditional,
          total: totalImages
        }
      };
    }
  }
  