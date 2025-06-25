'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Filter = {
  id: string
  name: string
}

export default function FilterDropdown({ onSelect }: { onSelect: (id: string) => void }) {
  const [filters, setFilters] = useState<Filter[]>([])

  useEffect(() => {
    const fetchFilters = async () => {
      const { data } = await supabase.from('filters').select('id, name')
      if (data) setFilters(data)
    }
    fetchFilters()
  }, [])

  return (
    <select
      className="border px-2 py-1 rounded"
      onChange={(e) => onSelect(e.target.value)}
      defaultValue=""
    >
      <option value="" disabled>
        -- Pilih Filter --
      </option>
      {filters.map((f) => (
        <option key={f.id} value={f.id}>
          {f.name}
        </option>
      ))}
    </select>
  )
}
