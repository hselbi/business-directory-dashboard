import { BusinessDriveService } from "@/lib/business-drive-service";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    console.log("🚀 Starting business data analysis...");

    const encodedKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;

    if (!encodedKey) {
      console.error(
        "❌ GOOGLE_SERVICE_ACCOUNT_KEY not set in environment variables"
      );
      return NextResponse.json(
        {
          success: false,
          error: "GOOGLE_SERVICE_ACCOUNT_KEY environment variable is not set.",
        },
        { status: 500 }
      );
    }
    console.log("🔑 Decoding service account credentials...");

    const businessService = new BusinessDriveService(
      encodedKey,
      "Business Directory",
      "businesses"
    );

    console.log("🔧 Initializing Google Drive service...");
    await businessService.initialize();

    console.log("📊 Fetching business data with images...");
    const businessData = await businessService.getBusinessDataWithImages();

    console.log(`✅ Successfully processed ${businessData.length} businesses`);

    const businessesWithImages = businessData.filter(
      (b) => b.images.length > 0
    );
    const totalImages = businessData.reduce(
      (acc, b) => acc + b.images.length,
      0
    );

    return NextResponse.json({
      success: true,
      data: businessData,
      count: businessData.length,
      metadata: {
        businessesWithImages: businessesWithImages.length,
        totalImages: totalImages,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Error in business data API:", error);

    let errorMessage = "Unknown error occurred";

    if (error instanceof Error) {
      errorMessage = error.message;

      if (
        errorMessage.includes("Main folder") &&
        errorMessage.includes("not found")
      ) {
        errorMessage =
          'Google Drive folder "Business Directory" not found. Please check the folder name and permissions.';
      } else if (errorMessage.includes("Failed to connect to Google Drive")) {
        errorMessage =
          "Failed to connect to Google Drive. Please check your service account credentials and permissions.";
      } else if (errorMessage.includes("credentials")) {
        errorMessage =
          "Invalid service account credentials. Please check your JSON file format and permissions.";
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details:
          error instanceof Error ? error.stack : "No stack trace available",
      },
      { status: 500 }
    );
  }
}
