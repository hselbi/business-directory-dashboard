import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

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

export async function POST(request: NextRequest) {
  try {
    const { accessToken, sheetId } = await request.json();

    if (!accessToken || !sheetId) {
      return NextResponse.json(
        { error: "Access token and sheet ID required" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const sheets = google.sheets({ version: "v4", auth: oauth2Client });

    // Read all data from the sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A:Z", // Get more columns to be safe
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    if (!response.data.values || response.data.values.length < 2) {
      return NextResponse.json(
        { error: "No business data found in the spreadsheet" },
        { status: 404 }
      );
    }

    const allRows = response.data.values;

    // Extract headers from the first column (vertical layout)
    const headerLabels = allRows.map((row) => row[0]).filter(Boolean);

    // Find the row indices for each field
    const getRowIndex = (searchTerms: string[]): number => {
      return allRows.findIndex((row) => {
        if (!row[0]) return false;
        const header = row[0].toString().toLowerCase();
        return searchTerms.some((term) => header.includes(term.toLowerCase()));
      });
    };

    const rowMapping = {
      name: getRowIndex(["business name", "company name", "name"]),
      address: getRowIndex(["address"]),
      phone: getRowIndex(["phone"]),
      website: getRowIndex(["website", "web site", "url"]),
      email: getRowIndex(["email", "e-mail"]),
      founded: getRowIndex(["founded", "year", "established"]),
      services: getRowIndex(["main services", "primary services", "services"]),
      otherServices: getRowIndex([
        "other services",
        "additional services",
        "other main services",
      ]),
      size: getRowIndex(["company size", "size", "employees"]),
      serviceArea: getRowIndex(["service area", "radius", "coverage"]),
      description: getRowIndex(["description", "about"]),
      contractorType: getRowIndex(["contractor type", "business type", "type"]),
    };

    console.log("Row mapping:", rowMapping);

    // Extract business data from columns (starting from column 1, since column 0 has headers)
    const businesses: BusinessData[] = [];

    // Determine how many business columns we have (skip column 0 which has headers)
    const maxColumns = Math.max(...allRows.map((row) => row.length));
    console.log("Total columns found:", maxColumns);

    for (let colIndex = 1; colIndex < maxColumns; colIndex++) {
      // Safe function to get data from a specific row and column
      const safeGet = (rowIndex: number): string => {
        if (
          rowIndex === -1 ||
          !allRows[rowIndex] ||
          !allRows[rowIndex][colIndex]
        ) {
          return "";
        }
        return allRows[rowIndex][colIndex].toString().trim();
      };

      // Extract business name first to check if this column has data
      const businessName = safeGet(rowMapping.name);

      // Skip columns without a business name or with empty/duplicate data
      if (!businessName || businessName.length === 0) {
        continue;
      }

      // Check if this is a duplicate (same name as previous business)
      const isDuplicate = businesses.some((b) => b.name === businessName);
      if (isDuplicate) {
        continue;
      }

      const business: BusinessData = {
        name: businessName,
        address: safeGet(rowMapping.address),
        phone: safeGet(rowMapping.phone),
        website: safeGet(rowMapping.website),
        email: safeGet(rowMapping.email),
        founded: safeGet(rowMapping.founded),
        services: safeGet(rowMapping.services),
        otherServices: safeGet(rowMapping.otherServices),
        size: safeGet(rowMapping.size),
        serviceArea: safeGet(rowMapping.serviceArea),
        description: safeGet(rowMapping.description),
        contractorType: safeGet(rowMapping.contractorType),
        logo: undefined,
        images: [],
      };

      businesses.push(business);
      console.log(`Added business ${colIndex}: ${business.name}`);
    }

    console.log(`Total businesses processed: ${businesses.length}`);
    if (businesses.length > 0) {
      console.log("Sample business:", businesses[0]);
    }

    return NextResponse.json({
      success: true,
      businesses,
      totalCount: businesses.length,
      debug: {
        rowMapping,
        headerLabels,
        totalColumns: maxColumns,
      },
    });
  } catch (error: any) {
    console.error("Sheets data error:", error);
    return NextResponse.json(
      { error: `Failed to read business data: ${error.message}` },
      { status: 500 }
    );
  }
}
