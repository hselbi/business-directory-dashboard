import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, folderName = "Business Directory" } =
      await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token required" },
        { status: 401 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Find the main business folder
    const folderResponse = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`,
      fields: "files(id,name)",
    });

    if (!folderResponse.data.files || folderResponse.data.files.length === 0) {
      return NextResponse.json(
        { error: `Folder "${folderName}" not found in Google Drive` },
        { status: 404 }
      );
    }

    const folderId = folderResponse.data.files[0].id;

    // Find Google Sheets in the folder
    const sheetsResponse = await drive.files.list({
      q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
      fields: "files(id,name)",
    });

    if (!sheetsResponse.data.files || sheetsResponse.data.files.length === 0) {
      return NextResponse.json(
        { error: "No Google Sheets found in the business folder" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      folderId,
      folderName,
      sheet: sheetsResponse.data.files[0],
      businessFolders: [],
    });
  } catch (error) {
    console.error("Drive folders error:", error);
    return NextResponse.json(
      { error: "Failed to access Google Drive folders" },
      { status: 500 }
    );
  }
}
