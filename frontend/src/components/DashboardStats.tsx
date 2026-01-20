'use client'

interface Lead {
  id: string
  score: number
  status: string
}

export function DashboardStats({ leads }: { leads: Lead[] }) {
  const totalLeads = leads.length
  const hotLeads = leads.filter((l) => l.status === 'hot').length
  const warmLeads = leads.filter((l) => l.status === 'warm').length
  const coldLeads = leads.filter((l) => l.status === 'cold').length
  const avgScore =
    leads.length > 0
      ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length)
      : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="p-4 bg-white border rounded-lg">
        <p className="text-sm text-gray-600">Total Leads</p>
        <p className="text-2xl font-bold">{totalLeads}</p>
      </div>
      <div className="p-4 bg-white border rounded-lg">
        <p className="text-sm text-gray-600">Hot Leads</p>
        <p className="text-2xl font-bold text-red-600">{hotLeads}</p>
      </div>
      <div className="p-4 bg-white border rounded-lg">
        <p className="text-sm text-gray-600">Warm Leads</p>
        <p className="text-2xl font-bold text-yellow-600">{warmLeads}</p>
      </div>
      <div className="p-4 bg-white border rounded-lg">
        <p className="text-sm text-gray-600">Avg Score</p>
        <p className="text-2xl font-bold">{avgScore}</p>
      </div>
    </div>
  )
}

