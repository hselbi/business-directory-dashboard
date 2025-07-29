import { BusinessDriveService } from '@/lib/business-drive-service'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

export async function GET() {
  try {
    console.log('🚀 Starting business data analysis...')
    
    const credentialsPath = path.join(process.cwd(), 'credentials', 'service-account.json')
    
    console.log('📁 Looking for credentials at:', credentialsPath)
    
    const fs = require('fs')
    if (!fs.existsSync(credentialsPath)) {
      console.error('❌ Service account credentials not found at:', credentialsPath)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Service account credentials not found. Please place your service-account.json file in the credentials/ directory.' 
        },
        { status: 500 }
      )
    }

    const businessService = new BusinessDriveService(
      credentialsPath,
      'Business Directory',
      'businesses'
    )

    console.log('🔧 Initializing Google Drive service...')
    await businessService.initialize()
    
    console.log('📊 Fetching business data with images...')
    const businessData = await businessService.getBusinessDataWithImages()

    console.log(`✅ Successfully processed ${businessData.length} businesses`)
    
    const businessesWithImages = businessData.filter(b => b.images.length > 0)
    const totalImages = businessData.reduce((acc, b) => acc + b.images.length, 0)

    return NextResponse.json({
      success: true,
      data: businessData,
      count: businessData.length,
      metadata: {
        businessesWithImages: businessesWithImages.length,
        totalImages: totalImages,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Error in business data API:', error)
    
    let errorMessage = 'Unknown error occurred'
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      if (errorMessage.includes('Main folder') && errorMessage.includes('not found')) {
        errorMessage = 'Google Drive folder "Business Directory" not found. Please check the folder name and permissions.'
      } else if (errorMessage.includes('Failed to connect to Google Drive')) {
        errorMessage = 'Failed to connect to Google Drive. Please check your service account credentials and permissions.'
      } else if (errorMessage.includes('credentials')) {
        errorMessage = 'Invalid service account credentials. Please check your JSON file format and permissions.'
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    )
  }
}