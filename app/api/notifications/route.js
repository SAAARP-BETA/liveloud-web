import { NextResponse } from 'next/server';

// Use local backend for development, production backend for production
const isDevelopment = process.env.NODE_ENV === 'development';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 
  (isDevelopment ? 'http://localhost:3009' : 'https://backend-4iko.onrender.com');

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}