import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(request: NextRequest) {
  try {
    const { accessToken, businessNames, mainFolderId } = await request.json();

    if (!accessToken || !businessNames || !mainFolderId) {
      return NextResponse.json(
        { error: "Access token, business names, and main folder ID required" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    const businessImages: {
      [key: string]: { logo?: string; images: string[] };
    } = {};
    const errors: string[] = [];

    // Process each business folder
    for (const businessName of businessNames) {
      try {
        // Find business folder
        const folderResponse = await drive.files.list({
          q: `'${mainFolderId}' in parents and name='${businessName}' and mimeType='application/vnd.google-apps.folder'`,
          fields: "files(id,name)",
        });

        if (
          !folderResponse.data.files ||
          folderResponse.data.files.length === 0
        ) {
          errors.push(`No folder found for business: ${businessName}`);
          continue;
        }

        const businessFolderId = folderResponse.data.files[0].id;

        // Get all images in business folder
        const imagesResponse = await drive.files.list({
          q: `'${businessFolderId}' in parents and (mimeType contains 'image/')`,
          fields: "files(id,name,mimeType)",
        });

        if (imagesResponse.data.files && imagesResponse.data.files.length > 0) {
          // Find logo (file with "logo" in name)
          const logo = imagesResponse.data.files.find((file) =>
            file.name?.toLowerCase().includes("logo")
          );

          // Get other images
          const images = imagesResponse.data.files
            .filter((file) => !file.name?.toLowerCase().includes("logo"))
            .map((file) => `https://drive.google.com/uc?id=${file.id}`);

          businessImages[businessName] = {
            logo: logo
              ? `https://drive.google.com/uc?id=${logo.id}`
              : undefined,
            images: images,
          };
        } else {
          errors.push(`No images found for business: ${businessName}`);
        }

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err: any) {
        errors.push(`Error processing ${businessName}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      businessImages,
      errors,
      processedCount: businessNames.length,
      successCount: Object.keys(businessImages).length,
    });
  } catch (error) {
    console.error("Business images error:", error);
    return NextResponse.json(
      { error: "Failed to process business images" },
      { status: 500 }
    );
  }
}
