'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import FilterDropdown from '@/components/FilterDropdown'
// Dynamic import agar aman dari error SSR
import dynamic from 'next/dynamic'

const ScoreCVClient = dynamic(
  () => import('@/components/ScoreCVClientOnlyClient'),
  { ssr: false }
)



type Candidate = {
  id: string
  name: string
  cv_url: string
  created_at: string
}

export default function CandidateList() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) setCandidates(data || [])
    }

    fetchData()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Daftar CV Kandidat</h1>

      <div className="mb-4">
        <label className="block font-semibold mb-1">Pilih Filter</label>
        <FilterDropdown onSelect={setSelectedFilter} />
      </div>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2 border">Nama</th>
            <th className="p-2 border">CV</th>
            <th className="p-2 border">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((cand) => (
            <tr key={cand.id} className="border-t">
              <td className="p-2 border">{cand.name}</td>
              <td className="p-2 border">
                <a
                  href={cand.cv_url}
                  target="_blank"
                  className="text-blue-600 underline"
                  rel="noopener noreferrer"
                >
                  Lihat CV
                </a>
              </td>
              <td className="p-2 border">
                {selectedFilter ? (
                  <ScoreCVClient
                    candidateId={cand.id}
                    cvUrl={cand.cv_url}
                    filterId={selectedFilter}
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Pilih filter dulu</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
