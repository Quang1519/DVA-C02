import { API_CONFIG } from './api-config'

interface ApiResponse {
  content: string;
  citations: string[];
}

export async function callPerplexityApi(
  input: string, 
  model: string
): Promise<ApiResponse> {
  const response = await fetch(API_CONFIG.BASE_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'content-type': 'application/json',
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
  })

  const data = await response.json()
  return {
    content: data.choices[0].message.content,
    citations: data.citations || []
  }
} 