import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Try to list available models using REST API
    const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    
    try {
      const response = await fetch(listModelsUrl)
      const data = await response.json()
      
      if (!response.ok) {
        return NextResponse.json({
          apiKeyConfigured: true,
          apiEnabled: false,
          error: data.error?.message || "API request failed",
          status: response.status,
          suggestion: "The Generative Language API is not enabled for this API key. Please enable it in Google Cloud Console.",
          instructions: [
            "1. Go to https://console.cloud.google.com/",
            "2. Select your project",
            "3. Go to 'APIs & Services' > 'Library'",
            "4. Search for 'Generative Language API'",
            "5. Click 'Enable'",
            "OR create a new API key at https://makersuite.google.com/app/apikey"
          ]
        })
      }

      // Filter models that support generateContent
      const availableModels = data.models
        ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => ({
          name: m.name,
          displayName: m.displayName,
          description: m.description
        })) || []

      return NextResponse.json({
        apiKeyConfigured: true,
        apiEnabled: true,
        availableModels,
        recommendedModel: availableModels[0]?.name || "No models available"
      })
    } catch (fetchError: any) {
      return NextResponse.json({
        apiKeyConfigured: true,
        apiEnabled: false,
        error: fetchError.message,
        suggestion: "Cannot reach Google's API. Check your API key and internet connection."
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
