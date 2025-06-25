'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation' 
import { supabase } from '@/lib/supabase'

type Keyword = { word: string; score: number }
type Filter = { id: string; name: string; keywords: Keyword[] }

export default function EditFilter() {
  const params = useParams<{ id: string }>()
  const [filter, setFilter] = useState<Filter | null>(null)
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  // Fetch filter by id
  useEffect(() => {
    if (!params.id) return
    const fetchFilter = async () => {
      const { data, error } = await supabase
        .from('filters')
        .select('*')
        .eq('id', params.id)
        .single()
      if (!error && data) {
        setFilter(data)
        setKeywords(data.keywords || [])
      }
    }
    fetchFilter()
  }, [params.id])

  // Handle add keyword
  const addKeyword = () => setKeywords([...keywords, { word: '', score: 1 }])

  // Handle update keyword field
  const updateKeyword = (idx: number, key: keyof Keyword, value: string | number) => { // <-- ubah tipe value
    const updated = keywords.map((kw, i) => i === idx ? { ...kw, [key]: value } : kw)
    setKeywords(updated)
  }

  // Handle remove keyword
  const removeKeyword = (idx: number) => setKeywords(keywords.filter((_, i) => i !== idx))

  // Handle save
  const handleSave = async () => {
    setLoading(true)
    setStatus('')
    const { error } = await supabase
      .from('filters')
      .update({ keywords })
      .eq('id', filter?.id)
    setLoading(false)
    if (error) setStatus('❌ Gagal update filter')
    else setStatus('✅ Filter berhasil diupdate!')
  }

  if (!filter) return <div className="p-4">Loading...</div>

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-2">Edit Filter: {filter.name}</h1>
      <div className="space-y-4">
        {keywords.map((kw, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              className="border px-2 py-1 rounded w-48"
              value={kw.word}
              onChange={e => updateKeyword(i, 'word', e.target.value)}
              placeholder="Keyword"
            />
            <input
              type="number"
              className="border px-2 py-1 rounded w-16"
              value={kw.score}
              min={1}
              onChange={e => updateKeyword(i, 'score', parseInt(e.target.value))}
              placeholder="Score"
            />
            <button
              className="px-2 py-1 bg-red-500 text-white rounded"
              onClick={() => removeKeyword(i)}
              type="button"
            >Hapus</button>
          </div>
        ))}
        <button
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
          onClick={addKeyword}
          type="button"
        >+ Tambah Keyword</button>
        <div>
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
        <p className="text-sm mt-2">{status}</p>
      </div>
    </div>
  )
}
