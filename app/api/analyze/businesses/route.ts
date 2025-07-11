import { NextRequest, NextResponse } from 'next/server'

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
    const { accessToken, folderName = 'Business Directory' } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Step 1: Find folders and sheets
    const foldersResponse = await fetch(`${baseUrl}/api/drive/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, folderName })
    })

    if (!foldersResponse.ok) {
      const error = await foldersResponse.json()
      throw new Error(error.error || 'Failed to find business folders')
    }

    const foldersData = await foldersResponse.json()

    // Step 2: Read business data from sheet
    const sheetsResponse = await fetch(`${baseUrl}/api/sheets/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        accessToken, 
        sheetId: foldersData.sheet.id 
      })
    })

    if (!sheetsResponse.ok) {
      const error = await sheetsResponse.json()
      throw new Error(error.error || 'Failed to read business data')
    }

    const sheetsData = await sheetsResponse.json()

    // Step 3: Get business images
    const businessNames = sheetsData.businesses.map((b: BusinessData) => b.name)
    
    const imagesResponse = await fetch(`${baseUrl}/api/drive/business-images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        accessToken, 
        businessNames,
        mainFolderId: foldersData.folderId
      })
    })

    if (!imagesResponse.ok) {
      const error = await imagesResponse.json()
      throw new Error(error.error || 'Failed to process business images')
    }

    const imagesData = await imagesResponse.json()

    // Step 4: Merge data with images
    const enrichedBusinesses: BusinessData[] = sheetsData.businesses.map((business: BusinessData) => ({
      ...business,
      logo: imagesData.businessImages[business.name]?.logo,
      images: imagesData.businessImages[business.name]?.images || []
    }))

    // Step 5: Generate analytics
    const analytics = {
      totalBusinesses: enrichedBusinesses.length,
      contractorTypes: new Set(enrichedBusinesses.map(b => b.contractorType)).size,
      serviceAreas: new Set(enrichedBusinesses.map(b => b.serviceArea)).size,
      averageYearsActive: Math.round(
        enrichedBusinesses.reduce((acc, b) => acc + (new Date().getFullYear() - parseInt(b.founded)), 0) / enrichedBusinesses.length
      ),
      businessesWithLogos: enrichedBusinesses.filter(b => b.logo).length,
      businessesWithImages: enrichedBusinesses.filter(b => b.images && b.images.length > 0).length
    }

    return NextResponse.json({
      success: true,
      businesses: enrichedBusinesses,
      analytics,
      metadata: {
        sheetName: foldersData.sheet.name,
        folderName: foldersData.folderName,
        processingErrors: imagesData.errors,
        processedCount: imagesData.processedCount,
        successCount: imagesData.successCount
      }
    })

  } catch (error: any) {
    console.error('Business analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze businesses' },
      { status: 500 }
    )
  }
}