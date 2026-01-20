'use client'

import { useQuery } from '@tanstack/react-query'
import { LeadCard } from '@/components/LeadCard'
import { DashboardStats } from '@/components/DashboardStats'
import { api } from '@/lib/api'

export default function Dashboard() {
  const { data: leads, isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const res = await api.get('/api/leads')
      return res.data
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-500">Error loading leads</p>
        </div>
      </div>
    )
  }

  const hotLeads = leads?.filter((l: any) => l.status === 'hot') || []
  const warmLeads = leads?.filter((l: any) => l.status === 'warm') || []
  const coldLeads = leads?.filter((l: any) => l.status === 'cold') || []

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sales Dashboard</h1>
        
        <DashboardStats leads={leads || []} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div>
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Hot Leads ({hotLeads.length})
            </h2>
            <div className="space-y-4">
              {hotLeads.map((lead: any) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
              {hotLeads.length === 0 && (
                <p className="text-gray-500">No hot leads</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-yellow-600 mb-4">
              Warm Leads ({warmLeads.length})
            </h2>
            <div className="space-y-4">
              {warmLeads.map((lead: any) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
              {warmLeads.length === 0 && (
                <p className="text-gray-500">No warm leads</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-blue-600 mb-4">
              Cold Leads ({coldLeads.length})
            </h2>
            <div className="space-y-4">
              {coldLeads.map((lead: any) => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
              {coldLeads.length === 0 && (
                <p className="text-gray-500">No cold leads</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

