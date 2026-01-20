'use client'

import Link from 'next/link'

interface Lead {
  id: string
  name: string
  email: string
  company?: string
  score: number
  status: string
}

export function LeadCard({ lead }: { lead: Lead }) {
  const statusColors: Record<string, string> = {
    hot: 'bg-red-100 text-red-800',
    warm: 'bg-yellow-100 text-yellow-800',
    cold: 'bg-blue-100 text-blue-800',
  }

  return (
    <Link href={`/leads/${lead.id}`}>
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{lead.name}</h3>
          <span
            className={`px-2 py-1 text-xs rounded ${
              statusColors[lead.status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {lead.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1">{lead.email}</p>
        {lead.company && (
          <p className="text-sm text-gray-500 mb-2">{lead.company}</p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Score:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${lead.score}%` }}
            ></div>
          </div>
          <span className="text-sm font-bold">{lead.score}</span>
        </div>
      </div>
    </Link>
  )
}

