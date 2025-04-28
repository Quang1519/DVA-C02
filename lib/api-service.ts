import { API_CONFIG } from './api-config'

interface ApiResponse {
  content: string;
  citations: string[];
}

export async function callPerplexityApi(
  input: string, 
  model: string
): Promise<ApiResponse> {
  try {
    console.log('Using model:', model);
    
    // Check if token is available
    if (!API_CONFIG.TOKEN) {
      console.error('API token is missing');
      return {
        content: 'Error: API token is missing. Please check your environment variables.',
        citations: []
      };
    }

    const response = await fetch(API_CONFIG.BASE_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.TOKEN}`
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
      console.error('API Error:', response.status, errorText);
      return {
        content: `Error ${response.status}: ${response.statusText}. Please try again later.`,
        citations: []
      };
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      citations: data.citations || []
    };
  } catch (error) {
    console.error('API call failed:', error);
    return {
      content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}. Please try again later.`,
      citations: []
    };
  }
}