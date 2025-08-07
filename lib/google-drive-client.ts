import { google } from "googleapis";
import * as fs from "fs";
import * as path from "path";

interface GoogleCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

export class GoogleDriveClient {
  private auth: any;
  private drive: any;

  constructor(credentialsPath: string) {
    this.initializeAuth(credentialsPath);
  }

  private initializeAuth(credentialsPath: string) {
    try {
      const credentialsBuffer = fs.readFileSync(credentialsPath);
      const credentials: GoogleCredentials = JSON.parse(
        credentialsBuffer.toString()
      );

      this.auth = new google.auth.JWT({
        email: credentials.client_email,
        key: credentials.private_key,
        scopes: [
          "https://www.googleapis.com/auth/drive.readonly",
          "https://www.googleapis.com/auth/spreadsheets.readonly",
        ],
      });

      this.drive = google.drive({ version: "v3", auth: this.auth });

      console.log("✅ Google Drive client initialized with service account");
    } catch (error) {
      console.error("❌ Failed to initialize Google Drive client:", error);
      throw new Error(`Failed to read credentials from ${credentialsPath}`);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.drive.files.list({ pageSize: 1 });
      return true;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  async searchFiles({
    query,
    mimeType,
    folderId,
    maxResults = 10,
  }: {
    query?: string;
    mimeType?: string;
    folderId?: string;
    maxResults?: number;
  }) {
    let searchQuery = "";
    const conditions = [];

    if (query) {
      conditions.push(`name contains '${query}'`);
    }

    if (mimeType) {
      conditions.push(`mimeType='${mimeType}'`);
    }

    if (folderId) {
      conditions.push(`'${folderId}' in parents`);
    }

    searchQuery = conditions.join(" and ");

    const response = await this.drive.files.list({
      q: searchQuery,
      pageSize: maxResults,
      fields: "files(id, name, mimeType, parents)",
    });

    return { files: response.data.files || [] };
  }

  async getFileMetadata(fileId: string) {
    const response = await this.drive.files.get({
      fileId,
      fields: "id, name, mimeType, size",
    });
    return response.data;
  }

  async getFileAsBuffer(fileId: string): Promise<Buffer> {
    const response = await this.drive.files.get(
      {
        fileId,
        alt: "media",
      },
      { responseType: "arraybuffer" }
    );

    return Buffer.from(response.data as ArrayBuffer);
  }

  async makeFilePublic(fileId: string): Promise<boolean> {
    try {
      console.log(`🔓 Making file ${fileId} publicly accessible...`);

      await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      console.log(`✅ Successfully made file ${fileId} public`);
      return true;
    } catch (error) {
      console.error(`⚠️ Could not make file ${fileId} public:`, error.message);
      return false;
    }
  }

  // ✅ NEW: Check current file permissions
  async getFilePermissions(fileId: string): Promise<any[]> {
    try {
      const response = await this.drive.permissions.list({
        fileId: fileId,
        fields: "permissions(id,type,role,emailAddress)",
      });

      return response.data.permissions || [];
    } catch (error) {
      console.error(`❌ Could not get permissions for ${fileId}:`, error);
      return [];
    }
  }

  async isFilePublic(fileId: string): Promise<boolean> {
    try {
      const permissions = await this.getFilePermissions(fileId);
      return permissions.some(
        (permission) =>
          permission.type === "anyone" && permission.role === "reader"
      );
    } catch (error) {
      console.error(`❌ Could not check if file ${fileId} is public:`, error);
      return false;
    }
  }

  async exportGoogleSheetsAsCsv(fileId: string): Promise<string> {
    const response = await this.drive.files.export({
      fileId,
      mimeType: "text/csv",
    });
    return response.data as string;
  }

  async downloadFile(fileId: string, localPath: string): Promise<void> {
    const buffer = await this.getFileAsBuffer(fileId);
    fs.writeFileSync(localPath, buffer);
  }
}
