import { NextRequest, NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url) {
    return NextResponse.json({ error: 'Missing CV URL' }, { status: 400 })
  }

  try {
    // Download CV dari URL
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse PDF
    const data = await pdf(buffer)
    const text = data.text

    return NextResponse.json({ text })
  } catch (error) {
    console.error('❌ Error parsing PDF:', error)
    return NextResponse.json({ error: 'Failed to parse CV' }, { status: 500 })
  }
}
