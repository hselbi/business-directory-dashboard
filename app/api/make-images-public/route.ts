import { NextRequest, NextResponse } from "next/server";
import { GoogleDriveClient } from "../../../lib/google-drive-client";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { fileIds } = await request.json();

    if (!fileIds || !Array.isArray(fileIds)) {
      return NextResponse.json(
        { error: "File IDs array required" },
        { status: 400 }
      );
    }

    const credentialsPath = path.join(
      process.cwd(),
      "credentials",
      "service-account.json"
    );
    const driveClient = new GoogleDriveClient(credentialsPath);

    const results = [];

    for (const fileId of fileIds) {
      try {
        console.log(`🔍 Processing file: ${fileId}`);

        // Check current status
        const isPublic = await driveClient.isFilePublic(fileId);
        console.log(
          `📋 File ${fileId} is ${isPublic ? "already public" : "private"}`
        );

        let madePublic = isPublic;

        // Make public if needed
        if (!isPublic) {
          madePublic = await driveClient.makeFilePublic(fileId);
        }

        // Test URLs
        const urls = {
          public: `https://lh3.googleusercontent.com/d/${fileId}=w1000`,
          thumbnail: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
        };

        results.push({
          fileId,
          wasPublic: isPublic,
          madePublic,
          urls,
          status: madePublic ? "success" : "failed",
        });

        console.log(
          `${madePublic ? "✅" : "❌"} File ${fileId}: ${
            madePublic ? "accessible" : "failed"
          }`
        );
      } catch (error) {
        console.error(`❌ Error processing ${fileId}:`, error);
        results.push({
          fileId,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: fileIds.length,
        successful: results.filter((r) => r.status === "success").length,
        failed: results.filter((r) => r.status !== "success").length,
      },
    });
  } catch (error) {
    console.error("Error making files public:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
