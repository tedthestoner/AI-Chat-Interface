import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
  try {
    // Check if API key exists
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      console.error("GOOGLE_API_KEY is not set in environment variables")
      return NextResponse.json(
        { error: "API key not configured. Please set GOOGLE_API_KEY in .env.local" },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { messages, message } = body

    // Format messages for the chat
    let prompt = message
    if (!prompt && messages && messages.length > 0) {
      // Convert messages array to a single prompt
      prompt = messages
        .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n')
      prompt += '\nAssistant:'
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      )
    }

    // Initialize the Google Generative AI with the API key
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Use the latest stable Gemini Flash model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
    })

    // Generate content using Gemini
    console.log("Generating response for prompt length:", prompt.length)
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    console.log("Generated response length:", text.length)

    return NextResponse.json({ 
      content: text,
      role: "assistant"
    })
  } catch (error: any) {
    console.error("Chat API error:", error)
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    let errorMessage = "Failed to generate response"
    
    // Provide more specific error messages
    if (error.message?.includes('API key')) {
      errorMessage = "Invalid API key. Please check your Google API key in Google Cloud Console."
    } else if (error.message?.includes('quota')) {
      errorMessage = "API quota exceeded. Please check your Google Cloud Console."
    } else if (error.message?.includes('404') || error.message?.includes('not found')) {
      errorMessage = "Model not available. Please enable the Generative Language API in Google Cloud Console and ensure your API key has access to Gemini models."
    } else if (error.message?.includes('network')) {
      errorMessage = "Network error. Please check your internet connection."
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
