// ✅ FILE: components/ScoreCVClientOnlyClient.tsx
'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
// @ts-expect-error: pdfjs-dist v5.x lacks type declarations for legacy/build/pdf, but runtime import works
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/build/pdf'
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

interface Props {
  candidateId: string
  cvUrl: string
  filterId: string
}

export default function ScoreCVClientOnlyClient({ candidateId, cvUrl, filterId }: Props) {
  const [status, setStatus] = useState('')

  const handleScore = async () => {
    // ... kode kamu persis sama ...
    try {
      setStatus('⏳ Memproses CV...')

      const { data: filterData, error: filterError } = await supabase
        .from('filters')
        .select('*')
        .eq('id', filterId)
        .single()

      if (filterError || !filterData) {
        setStatus('❌ Filter tidak ditemukan')
        return
      }

      const keywords: { word: string; score: number }[] = filterData.keywords

      const res = await fetch(cvUrl)
      const buffer = await res.arrayBuffer()
      const pdf = await getDocument({ data: buffer }).promise

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
        setStatus('❌ Gagal menyimpan hasil')
      } else {
        setStatus(`✅ Skor berhasil disimpan: ${score}`)
      }
    } catch (err) {
      console.error('❌ Error:', err)
      setStatus('❌ Error saat memproses CV')
    }
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleScore}
        className="bg-black text-white px-3 py-1 rounded"
      >
        Proses CV (Client)
      </button>
      <p className="text-sm mt-1 text-gray-600">{status}</p>
    </div>
  )
}
