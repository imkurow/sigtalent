import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import * as pdfjsLib from 'pdfjs-dist'

// Konfigurasi worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

export async function POST(req: NextRequest) {
  try {
    const { candidateId, cvUrl, filterId } = await req.json()

    console.log('✅ Menerima request:', { candidateId, cvUrl, filterId })

    if (!candidateId || !cvUrl || !filterId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const { data: filterData, error: filterError } = await supabase
      .from('filters')
      .select('*')
      .eq('id', filterId)
      .single()

    if (filterError || !filterData) {
      return NextResponse.json({ error: 'Filter tidak ditemukan' }, { status: 404 })
    }

    const keywords: { word: string; score: number }[] = filterData.keywords

    const res = await fetch(cvUrl)
    const buffer = await res.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise

    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const strings = (content.items as Array<{ str: string }>).map(item => item.str)
      fullText += strings.join(' ') + '\n'
    }
    
    const text = fullText.toLowerCase()
    let score = 0
    const matched = keywords.filter((kw) => {
      if (text.includes(kw.word.toLowerCase())) {
        score += kw.score
        return true
      }
      return false
    })
    
    const { error: insertError } = await supabase.from('results').insert([
      {
        candidate_id: candidateId,
        filter_id: filterId,
        score,
        matched_keywords: matched,
      },
    ])

    if (insertError) {
      return NextResponse.json({ error: 'Gagal menyimpan hasil' }, { status: 500 })
    }

    return NextResponse.json({ score, matched })
  } catch (err) {
    console.error('❌ Error umum:', err)
    return NextResponse.json({ error: 'Server crash' }, { status: 500 })
  }
}
