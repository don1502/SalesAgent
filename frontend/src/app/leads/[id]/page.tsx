'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { LeadDetails } from '@/components/LeadDetails'
import { api } from '@/lib/api'

export default function LeadDetailPage() {
  const params = useParams()
  const leadId = params.id as string

  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const res = await api.get(`/api/leads/${leadId}`)
      return res.data
    },
    enabled: !!leadId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <p>Lead not found</p>
        </div>
      </div>
    )
  }

  return <LeadDetails lead={lead} />
}

