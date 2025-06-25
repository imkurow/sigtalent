'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [status] = useState('')
  const router = useRouter()

  const handleUpload = async () => {
    if (!file || !name) {
      alert('Nama dan file wajib diisi.')
      return
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `${Date.now()}.${fileExt}`

    // Upload ke Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('cvs')
      .upload(filePath, file)

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      alert('Upload file gagal.')
      return
    }

    // Ambil URL publik
    const { data } = supabase.storage.from('cvs').getPublicUrl(filePath)
    const cvUrl = data?.publicUrl

    // Simpan ke tabel "candidates"
    const { error: insertError } = await supabase
      .from('candidates')
      .insert([{ name, cv_url: cvUrl }])

    if (insertError) {
      console.error('❌ Gagal simpan ke tabel candidates:', insertError)
      alert('Upload berhasil tapi gagal menyimpan data.')
      return
    }

    alert('✅ Upload dan simpan berhasil!')
    router.push('/candidates')
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Upload CV Kandidat</h1>

      <Input
        type="text"
        placeholder="Nama Kandidat"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4"
      />

      <Input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="mb-4"
      />

      <Button onClick={handleUpload}>Upload CV</Button>

      {status && <p className="mt-4 text-sm text-red-500">{status}</p>}
    </div>
  )
}
