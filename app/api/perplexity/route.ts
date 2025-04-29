import { NextResponse } from 'next/server';

// We'll access environment variables directly in the handler function
// This ensures they're loaded at runtime

export async function POST(request: Request) {
  try {
    // Access environment variables directly inside the handler function
    const PPLX_URL = process.env.PPLX_URL;
    const PPLX_TOKEN = process.env.PPLX_TOKEN;
    
    // Log environment variable status for debugging
    console.log('Environment variables status:', { 
      PPLX_URL: PPLX_URL ? 'Available' : 'Missing', 
      PPLX_TOKEN: PPLX_TOKEN ? 'Available' : 'Missing' 
    });
    
    // Check if environment variables are available
    if (!PPLX_URL || !PPLX_TOKEN) {
      return NextResponse.json(
        { error: 'API configuration missing. Check server environment variables.' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { input, model } = body;

    // Call the Perplexity API
    const response = await fetch(PPLX_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PPLX_TOKEN}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: input
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API Error:', response.status, errorText);
      return NextResponse.json(
        { error: `Error ${response.status}: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      content: data.choices[0].message.content,
      citations: data.citations || []
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
