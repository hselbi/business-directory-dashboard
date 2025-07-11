import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
import Papa from "papaparse";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  
  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(`${url}/export?format=csv`, {
      timeout: 30000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Enhanced Papa Parse configuration to handle malformed quotes
    const parsed = Papa.parse(response.data, {
      header: false,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    // Check if parsing had critical errors that prevented data extraction
    const criticalErrors = parsed.errors.filter(error => 
      error.type === 'Delimiter' || error.type === 'FieldMismatch'
    );

    if (criticalErrors.length > 0) {
      console.error("Critical parsing errors:", criticalErrors);
      return NextResponse.json(
        { error: "Failed to parse CSV data due to structural issues" },
        { status: 500 }
      );
    }

    // Log quote errors but continue processing
    const quoteErrors = parsed.errors.filter(error => error.type === 'Quotes');
    if (quoteErrors.length > 0) {
      console.warn(`Found ${quoteErrors.length} quote formatting issues, but continuing with available data`);
    }

    if (!parsed.data) {
      return NextResponse.json(
        { error: "Sheet must have at least 2 rows (headers and data)" },
        { status: 400 }
      );
    }

    const headers = parsed.data[0] as string[];
    const rows = parsed.data.slice(1).map((row: any) => {
      const rowData: Record<string, string> = {};
      headers.forEach((header: any, index: number) => {
        // Handle potential undefined values and clean data
        const cellValue = row[index];
        rowData[header] = cellValue !== undefined ? String(cellValue).trim() : "";
      });
      return rowData;
    });

    const sheetData = { 
      headers, 
      rows,
      // Include metadata about parsing
      metadata: {
        totalRows: parsed.data.length,
        quoteErrors: quoteErrors.length,
        processedRows: rows.length
      }
    };

    return NextResponse.json(sheetData, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching sheet:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch sheet data. Make sure the URL is correct and the sheet is publicly accessible.",
      },
      { status: 500 }
    );
  }
}