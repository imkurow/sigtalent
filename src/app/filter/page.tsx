'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function FilterPage() {
  const [name, setName] = useState('')
  const [rawKeywords, setRawKeywords] = useState('')
  const [status, setStatus] = useState('')

  const handleSave = async () => {
    const keywords = rawKeywords.split('\n').map((line) => {
      const [word, score] = line.split(':')
      return { word: word.trim(), score: parseInt(score) || 1 }
    })

    const { error } = await supabase.from('filters').insert([
      {
        name,
        keywords,
      },
    ])

    setStatus(error ? `❌ Gagal: ${error.message}` : '✅ Filter berhasil disimpan')
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Buat Filter CV</h1>
      <Input placeholder="Nama Filter (contoh: Frontend Developer)" value={name} onChange={(e) => setName(e.target.value)} />
      <Textarea
        placeholder="Masukkan keyword dan skor. Contoh: React:5, ..  "
        rows={6}
        value={rawKeywords}
        onChange={(e) => setRawKeywords(e.target.value)}
      />
      <Button onClick={handleSave}>Simpan Filter</Button>
      <p>{status}</p>
    </div>
  )
}
