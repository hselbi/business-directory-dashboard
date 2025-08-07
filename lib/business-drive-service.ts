import Papa from "papaparse";
import { GoogleDriveClient } from "./google-drive-client";
import fs from "fs";
import path from "path";

export interface BusinessData {
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone: string;
  website?: string;
  email?: string;
  yearFounded?: number;
  mainServices: string[];
  otherServices: string[];
  companySize?: number;
  serviceArea?: string;
  description?: string;
  typeContractor?: string;
  gmail?: string;
  gmailAppPassword?: string;
}

export interface BusinessImage {
  name: string;
  type: "logo" | "banner" | "image";
  driveId: string;
  url: string;
  thumbnailUrl?: string;
}

export interface EnhancedBusinessData extends BusinessData {
  images: BusinessImage[];
  imageFolder: {
    id: string;
    name: string;
    found: boolean;
  };
}

export class BusinessDriveService {
  private driveClient: GoogleDriveClient;
  private mainFolderId?: string;
  private csvFileId?: string;

  constructor(
    encodedKey: string,
    private mainFolderName: string = "Business Directory",
    private csvFileName: string = "businesses"
  ) {
    this.driveClient = new GoogleDriveClient(encodedKey);
  }

  async initialize(): Promise<void> {
    console.log("🔍 Initializing Business Drive Service...");

    const connected = await this.driveClient.testConnection();
    if (!connected) {
      throw new Error("Failed to connect to Google Drive");
    }

    await this.findMainFolder();
    await this.findCsvFile();

    console.log("✅ Business Drive Service initialized");
  }

  private async findMainFolder(): Promise<void> {
    console.log(`🔍 Looking for main folder: "${this.mainFolderName}"`);

    const searchResults = await this.driveClient.searchFiles({
      query: this.mainFolderName,
      mimeType: "application/vnd.google-apps.folder",
      maxResults: 10,
    });

    let mainFolder = searchResults.files.find(
      (folder: any) =>
        folder.name.toLowerCase() === this.mainFolderName.toLowerCase()
    );

    if (!mainFolder) {
      mainFolder = searchResults.files.find(
        (folder: any) =>
          folder.name
            .toLowerCase()
            .includes(this.mainFolderName.toLowerCase()) ||
          folder.name.toLowerCase().includes("business") ||
          folder.name.toLowerCase().includes("directory")
      );
    }

    if (!mainFolder) {
      throw new Error(
        `Main folder "${this.mainFolderName}" not found in Google Drive`
      );
    }

    this.mainFolderId = mainFolder.id;
    console.log(
      `✅ Found main folder: "${mainFolder.name}" (ID: ${mainFolder.id})`
    );
  }

  private async findCsvFile(): Promise<void> {
    if (!this.mainFolderId) {
      throw new Error("Main folder not found. Call initialize() first.");
    }

    console.log(`🔍 Looking for data file containing: "${this.csvFileName}"`);

    const searchResults = await this.driveClient.searchFiles({
      folderId: this.mainFolderId,
      maxResults: 20,
    });

    let csvFile = searchResults.files.find((file: any) => {
      const nameWithoutExt = file.name
        .toLowerCase()
        .replace(/\.(csv|xlsx?)$/, "");
      const searchNameWithoutExt = this.csvFileName
        .toLowerCase()
        .replace(/\.(csv|xlsx?)$/, "");
      return (
        nameWithoutExt === searchNameWithoutExt ||
        file.name.toLowerCase() === this.csvFileName.toLowerCase() ||
        file.name.toLowerCase() === `${this.csvFileName}.csv`
      );
    });

    if (!csvFile) {
      csvFile = searchResults.files.find(
        (file: any) =>
          file.mimeType === "application/vnd.google-apps.spreadsheet" &&
          file.name.toLowerCase().includes(this.csvFileName.toLowerCase())
      );

      if (!csvFile) {
        csvFile = searchResults.files.find(
          (file: any) =>
            (file.name.toLowerCase().endsWith(".csv") ||
              file.mimeType === "text/csv") &&
            file.name.toLowerCase().includes(this.csvFileName.toLowerCase())
        );
      }

      if (!csvFile) {
        csvFile = searchResults.files.find(
          (file: any) =>
            file.mimeType === "application/vnd.google-apps.spreadsheet" ||
            file.name.toLowerCase().endsWith(".csv") ||
            file.mimeType === "text/csv"
        );
      }
    }

    if (!csvFile) {
      console.log("❌ Available files in main folder:");
      searchResults.files.forEach((file: any) => {
        console.log(`   📄 ${file.name} (${file.mimeType})`);
      });
      throw new Error(
        `No CSV or Google Sheets file found in main folder. Looking for: "${this.csvFileName}"`
      );
    }

    this.csvFileId = csvFile.id;
    console.log(`✅ Found data file: "${csvFile.name}" (ID: ${csvFile.id})`);
  }

  async getBusinessDataWithImages(): Promise<EnhancedBusinessData[]> {
    if (!this.csvFileId || !this.mainFolderId) {
      throw new Error("Service not initialized. Call initialize() first.");
    }

    console.log("📊 Fetching business data from Google Drive...");

    const businesses = await this.downloadAndParseCsv();
    console.log(`✅ Found ${businesses.length} businesses in CSV`);

    const enhancedBusinesses: EnhancedBusinessData[] = [];

    for (const business of businesses) {
      console.log(`🏢 Processing images for: ${business.name}`);

      try {
        const businessWithImages = await this.addImagesToBusiness(business);
        console.log(
          businessWithImages.name,
          "images:",
          businessWithImages.images.length
        );
        enhancedBusinesses.push(businessWithImages);
      } catch (error) {
        console.warn(`⚠️ Failed to get images for ${business.name}:`, error);
        enhancedBusinesses.push({
          ...business,
          images: [],
          imageFolder: { id: "", name: "", found: false },
        });
      }
    }

    return enhancedBusinesses;
  }

  private async downloadAndParseCsv(): Promise<BusinessData[]> {
    if (!this.csvFileId) {
      throw new Error("CSV file not found");
    }

    console.log("📥 Downloading CSV file...");

    let csvContent: string;

    try {
      const fileMetadata = await this.driveClient.getFileMetadata(
        this.csvFileId
      );

      if (fileMetadata.mimeType === "application/vnd.google-apps.spreadsheet") {
        console.log("📊 Detected Google Sheets file, exporting as CSV...");
        csvContent = await this.driveClient.exportGoogleSheetsAsCsv(
          this.csvFileId
        );
      } else if (
        fileMetadata.mimeType === "text/csv" ||
        fileMetadata.name.endsWith(".csv")
      ) {
        console.log("📄 Detected CSV file, downloading directly...");
        const csvBuffer = await this.driveClient.getFileAsBuffer(
          this.csvFileId
        );
        csvContent = csvBuffer.toString("utf8");
      } else {
        throw new Error(`Unsupported file type: ${fileMetadata.mimeType}`);
      }
    } catch (error) {
      console.error("❌ Failed to download file:", error);
      throw error;
    }

    const parsed = Papa.parse(csvContent, {
      header: false,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    const csvRows = parsed.data as string[][];
    return this.parseTransposedCSVData(csvRows);
  }

  private parseTransposedCSVData(csvRows: string[][]): BusinessData[] {
    if (!csvRows || csvRows.length === 0) {
      throw new Error("No CSV data to parse");
    }

    const maxColumns = Math.max(
      ...csvRows.map((row) => (row ? row.length : 0))
    );
    const businesses: BusinessData[] = [];

    for (let businessIndex = 1; businessIndex < maxColumns; businessIndex++) {
      try {
        const business = this.extractBusinessFromColumn(csvRows, businessIndex);
        if (business) {
          businesses.push(business);
        }
      } catch (error) {
        console.warn(
          `⚠️ Error parsing business column ${businessIndex}:`,
          error
        );
      }
    }

    return businesses;
  }

  private extractBusinessFromColumn(
    csvRows: string[][],
    columnIndex: number
  ): BusinessData | null {
    const businessData = new Map<string, string>();

    for (let rowIndex = 0; rowIndex < csvRows.length; rowIndex++) {
      const row = csvRows[rowIndex];
      if (!row) continue;

      const fieldName = row[0] ? row[0].toString().trim() : "";
      const value = row[columnIndex]
        ? row[columnIndex].toString().trim().replace(/^"|"$/g, "")
        : "";

      if (fieldName && value) {
        businessData.set(fieldName, value);
      }
    }

    const getValue = (fieldName: string): string => {
      return businessData.get(fieldName) || "";
    };

    let businessName = getValue("Business Name");
    if (!businessName) {
      const nameVariations = [
        "Business Name",
        "Company Name",
        "Name",
        "business name",
      ];
      for (const variation of nameVariations) {
        businessName = getValue(variation);
        if (businessName) break;
      }
      if (!businessName) return null;
    }

    const business: BusinessData = {
      name: businessName,
      address: getValue("Address"),
      phone: getValue("Phone Number"),
      website: getValue("Website"),
      email: getValue("Email"),
      yearFounded: getValue("Year Company Was Founded")
        ? parseInt(getValue("Year Company Was Founded"), 10)
        : undefined,
      mainServices: getValue("Main Services")
        ? getValue("Main Services")
            .split(",")
            .map((s) => s.trim())
        : [],
      otherServices: getValue("Other Main Services")
        ? getValue("Other Main Services")
            .split(",")
            .map((s) => s.trim())
        : [],
      companySize: parseInt(getValue("Company Size"), 10) || undefined,
      serviceArea: getValue("Service Areas (Radius)"),
      description: getValue("Description"),
      typeContractor: getValue("Contractor type"),
      gmail: getValue("Gmail"),
      gmailAppPassword: getValue("Gmail App Password"),
    };

    if (!business.name || (!business.phone && !business.email)) {
      return null;
    }

    return business;
  }

  private async addImagesToBusiness(
    business: BusinessData
  ): Promise<EnhancedBusinessData> {
    const businessFolder = await this.findBusinessFolder(business.name);

    if (!businessFolder) {
      return {
        ...business,
        images: [],
        imageFolder: { id: "", name: business.name, found: false },
      };
    }

    const images = await this.downloadBusinessImages(
      businessFolder.id,
      business.name
    );

    return {
      ...business,
      images: images,
      imageFolder: {
        id: businessFolder.id,
        name: businessFolder.name,
        found: true,
      },
    };
  }

  private async findBusinessFolder(
    businessName: string
  ): Promise<{ id: string; name: string } | null> {
    if (!this.mainFolderId) return null;

    const searchResults = await this.driveClient.searchFiles({
      folderId: this.mainFolderId,
      mimeType: "application/vnd.google-apps.folder",
      maxResults: 50,
    });

    let businessFolder = searchResults.files.find(
      (folder: any) => folder.name.toLowerCase() === businessName.toLowerCase()
    );

    if (!businessFolder) {
      const cleanBusinessName = businessName
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      businessFolder = searchResults.files.find((folder: any) => {
        const cleanFolderName = folder.name
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .replace(/\s+/g, " ")
          .trim();
        return (
          cleanFolderName.includes(cleanBusinessName) ||
          cleanBusinessName.includes(cleanFolderName)
        );
      });
    }

    return businessFolder
      ? { id: businessFolder.id, name: businessFolder.name }
      : null;
  }
  private async downloadBusinessImages(
    folderId: string,
    businessName: string
  ): Promise<BusinessImage[]> {
    const searchResults = await this.driveClient.searchFiles({
      folderId: folderId,
      maxResults: 20,
    });

    const imageFiles = searchResults.files.filter(
      (file: any) =>
        file.mimeType?.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)
    );

    if (imageFiles.length === 0) {
      return [];
    }

    const downloadedImages: BusinessImage[] = [];
    const prioritizedImages = this.prioritizeImages(imageFiles);

    console.log(
      `📸 Found ${imageFiles.length} images for ${businessName}, processing ${prioritizedImages.length}`
    );

    for (const imageFile of prioritizedImages) {
      try {
        console.log(
          `🔍 Processing image: ${imageFile.name} (ID: ${imageFile.id})`
        );

        // ✅ STEP 1: Check if file is already public
        const isPublic = await this.driveClient.isFilePublic(imageFile.id);
        console.log(
          `📋 File ${imageFile.name} is ${
            isPublic ? "already public" : "private"
          }`
        );

        // ✅ STEP 2: Make file public if it isn't already
        if (!isPublic) {
          console.log(`🔓 Making ${imageFile.name} publicly accessible...`);
          const madePublic = await this.driveClient.makeFilePublic(
            imageFile.id
          );

          if (madePublic) {
            console.log(`✅ Successfully made ${imageFile.name} public`);
          } else {
            console.warn(
              `⚠️ Could not make ${imageFile.name} public - images may not display`
            );
          }
        }

        // ✅ STEP 3: Generate working URLs
        const publicUrl = `https://lh3.googleusercontent.com/d/${imageFile.id}=w1000`;
        const thumbnailUrl = `https://drive.google.com/thumbnail?id=${imageFile.id}&sz=w400`;

        downloadedImages.push({
          name: imageFile.name,
          type: this.determineImageType(imageFile.name),
          driveId: imageFile.id,
          url: publicUrl,
          thumbnailUrl: thumbnailUrl,
        });

        console.log(`✅ Generated URLs for: ${imageFile.name}`);
        console.log(`   Public URL: ${publicUrl}`);
        console.log(`   Thumbnail URL: ${thumbnailUrl}`);
      } catch (error) {
        console.error(`❌ Failed to process ${imageFile.name}:`, error);
      }
    }

    console.log(
      `✅ Generated ${downloadedImages.length} image URLs for: ${businessName}`
    );
    return downloadedImages;
  }

  private prioritizeImages(imageFiles: any[]): any[] {
    const logo = imageFiles.find((file) => /logo/i.test(file.name));
    const banner = imageFiles.find((file) => /banner/i.test(file.name));
    const others = imageFiles.filter((file) => !/logo|banner/i.test(file.name));

    const prioritized = [];
    if (logo) prioritized.push(logo);
    if (banner) prioritized.push(banner);
    prioritized.push(...others);

    return prioritized;
  }

  private determineImageType(filename: string): "logo" | "banner" | "image" {
    const name = filename.toLowerCase();
    if (name.includes("logo")) return "logo";
    if (name.includes("banner")) return "banner";
    return "image";
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "_");
  }
}
