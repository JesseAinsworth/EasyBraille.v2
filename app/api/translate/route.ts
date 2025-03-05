import { NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import Translation from "../../../models/Translation"
import axios from "axios" // Import axios for API calls

export async function POST(req: Request) {
  await dbConnect()

  const { braille, userId } = await req.json()

  // Call the AI translation service
  const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
    prompt: `Translate the following Braille to Spanish: ${braille}`,
    max_tokens: 60,
    temperature: 0.5,
    headers: {
      'Authorization': `Bearer YOUR_API_KEY`, // Replace with your actual API key
      'Content-Type': 'application/json'
    }
  });

  const spanish = response.data.choices[0].text.trim(); // Get the translated text

  const translation = new Translation({ userId, braille, spanish })
  await translation.save()

  return NextResponse.json({ spanish })
}

export async function GET(req: Request) {
  await dbConnect()

  const url = new URL(req.url)
  const userId = url.searchParams.get("userId")

  if (!userId) {
    return NextResponse.json({ error: "UserId is required" }, { status: 400 })
  }

  const translations = await Translation.find({ userId }).sort({ createdAt: -1 }).limit(10)

  return NextResponse.json(translations)
}