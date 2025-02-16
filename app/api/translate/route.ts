import { NextResponse } from "next/server"
import dbConnect from "../../../lib/mongodb"
import Translation from "../../../models/Translation"

const brailleToSpanish: { [key: string]: string } = {
  "⠁": "a",
  "⠃": "b",
  "⠉": "c",
  "⠙": "d",
  "⠑": "e",
  "⠋": "f",
  "⠛": "g",
  "⠓": "h",
  "⠊": "i",
  "⠚": "j",
  "⠅": "k",
  "⠇": "l",
  "⠍": "m",
  "⠝": "n",
  "⠕": "o",
  "⠏": "p",
  "⠟": "q",
  "⠗": "r",
  "⠎": "s",
  "⠞": "t",
  "⠥": "u",
  "⠧": "v",
  "⠺": "w",
  "⠭": "x",
  "⠽": "y",
  "⠵": "z",
  "⠀": " ",
}

export async function POST(req: Request) {
  await dbConnect()

  const { braille, userId } = await req.json()

  const spanish = braille
    .split("")
    .map((char: string) => brailleToSpanish[char] || char)
    .join("")

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

