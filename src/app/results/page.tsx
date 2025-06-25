'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type ResultRow = {
  id: string
  candidate_id: string
  filter_id: string
  score: number
  matched_keywords: { word: string; score: number }[]
  created_at: string
}

type Candidate = { id: string; name: string }
type Filter = { id: string; name: string }

export default function ResultsPage() {
  const [results, setResults] = useState<ResultRow[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filters, setFilters] = useState<Filter[]>([])

  useEffect(() => {
    // Ambil hasil proses CV
    supabase.from('results').select('*').order('created_at', { ascending: false })
    .then(({ data }) => { // (, error)
      setResults(data || [])
      // console.log("HASIL FETCH:", { data, error });
    })
    // Ambil semua kandidat
    supabase.from('candidates').select('id, name')
      .then(({ data }) => setCandidates(data || []))

    // Ambil semua filter
    supabase.from('filters').select('id, name')
      .then(({ data }) => setFilters(data || []))
  }, [])

  // ambil nama kandidat & filter berdasarkan id
  function getCandidateName(id: string) {
    return candidates.find(c => c.id === id)?.name || '-'
  }
  function getFilterName(id: string) {
    return filters.find(f => f.id === id)?.name || '-'
  }
  function getStatus(score: number) {
    if (score >= 80) return "Sesuai"
    if (score >= 40) return "Potensial"
    return "Tidak Sesuai"
  }

  return (
    <div className="p-6"> 
      <h1 className="text-2xl font-bold mb-4">Hasil Skoring CV</h1>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 border">Nama Kandidat</th>
            <th className="p-2 border">Filter</th>
            <th className="p-2 border">Skor</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Keyword Cocok</th>
            <th className="p-2 border">Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {results.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center p-4 text-gray-400">
                Belum ada data hasil pemfilteran.
              </td>
            </tr>
          ) : (
            results.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 border">{getCandidateName(r.candidate_id)}</td>
                <td className="p-2 border">{getFilterName(r.filter_id)}</td>
                <td className="p-2 border">{r.score}</td>
                <td className="p-2 border">{getStatus(r.score)}</td>
                <td className="p-2 border">
                  {r.matched_keywords.map((kw) => kw.word).join(', ')}
                </td>
                <td className="p-2 border">
                  {new Date(r.created_at).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>

      </table>
    </div>
  )
}
