import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { code, state } = await request.json();

    if (!code) {
      return NextResponse.json(
        { message: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/google/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.json(
        { message: 'Failed to exchange authorization code' },
        { status: 400 }
      );
    }

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userResponse.json();

    if (!userResponse.ok) {
      console.error('Failed to get user info:', userInfo);
      return NextResponse.json(
        { message: 'Failed to get user information' },
        { status: 400 }
      );
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009/api';
    console.log('Calling backend at:', `${apiUrl}/auth/google`);
    console.log('Sending data:', { 
      hasTokenId: !!tokenData.id_token, 
      hasAccessToken: !!tokenData.access_token,
      userEmail: userInfo.email 
    });
    
    const backendResponse = await fetch(`${apiUrl}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tokenId: tokenData.id_token || tokenData.access_token, // Use ID token if available, otherwise access token
        userInfo, // Fallback user info
      }),
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('Backend authentication failed:', backendData);
      return NextResponse.json(
        { message: backendData.message || 'Authentication failed' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json({
      user: backendData.user,
      token: backendData.token,
      message: backendData.message || 'Authentication successful',
    });

  } catch (error) {
    console.error('Google OAuth callback error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
