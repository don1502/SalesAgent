'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'

interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  score: number
  status: string
  notes?: string
  calls: any[]
  emails: any[]
  interactions: any[]
  followUps: any[]
}

export function LeadDetails({ lead }: { lead: Lead }) {
  const { data: interactions } = useQuery({
    queryKey: ['interactions', lead.id],
    queryFn: async () => {
      const res = await api.get(`/api/leads/${lead.id}/interactions`)
      return res.data
    },
  })

  const statusColors: Record<string, string> = {
    hot: 'bg-red-100 text-red-800',
    warm: 'bg-yellow-100 text-yellow-800',
    cold: 'bg-blue-100 text-blue-800',
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-blue-500 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        
        <div className="bg-white border rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{lead.name}</h1>
              <p className="text-gray-600">{lead.email}</p>
              {lead.phone && <p className="text-gray-600">{lead.phone}</p>}
              {lead.company && <p className="text-gray-600">{lead.company}</p>}
            </div>
            <span
              className={`px-3 py-1 rounded ${
                statusColors[lead.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {lead.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold">{lead.score}/100</p>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">Interactions</p>
              <p className="text-2xl font-bold">{lead.interactions?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Interaction History</h2>
          <div className="space-y-4">
            {(interactions || lead.interactions || []).map((interaction: any) => (
              <div key={interaction.id} className="p-4 border rounded">
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {interaction.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(interaction.createdAt).toLocaleString()}
                  </span>
                </div>
                {interaction.intent && (
                  <p className="text-sm text-gray-600 mb-2">
                    Intent: <span className="font-medium">{interaction.intent}</span>
                  </p>
                )}
                <p className="text-gray-800">{interaction.content}</p>
                {interaction.suggestedAction && (
                  <p className="text-sm text-blue-600 mt-2">
                    Suggested: {interaction.suggestedAction}
                  </p>
                )}
              </div>
            ))}
            {(!interactions || interactions.length === 0) && 
             (!lead.interactions || lead.interactions.length === 0) && (
              <p className="text-gray-500">No interactions yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

