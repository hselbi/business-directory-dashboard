// app/api/auth/google/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      // Generate auth URL
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/drive.readonly',
          'https://www.googleapis.com/auth/spreadsheets.readonly',
          'https://www.googleapis.com/auth/drive.file'
        ],
        include_granted_scopes: true
      })

      return NextResponse.json({ authUrl })
    }

    // Exchange code for tokens - FIXED METHOD
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    return NextResponse.json({ 
      success: true,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token
    })

  } catch (error) {
    console.error('Google auth error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()

    oauth2Client.setCredentials({
      refresh_token: refreshToken
    })

    const { credentials } = await oauth2Client.refreshAccessToken()
    
    return NextResponse.json({
      success: true,
      accessToken: credentials.access_token
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    )
  }
}