import Link from 'next/link'

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard SigTalent</h1>
      <ul className="space-y-2">
        <li><Link href="/upload" className="underline text-blue-600">Upload CV</Link></li>
        <li><Link href="/filter" className="underline text-blue-600">Buat Filter CV</Link></li>
        <li><Link href="/candidates" className="underline text-blue-600">Lihat Daftar CV</Link></li>
        <li><Link href="/results" className="underline text-blue-600">Lihat Hasil Skoring</Link></li>

        {/* Tambah link lainnya nanti */}
      </ul>
    </main>
  )
}