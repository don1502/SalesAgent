import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Sales AI Agent</h1>
        <p className="text-xl mb-8 text-gray-600">
          Intelligent sales pipeline management powered by AI
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/dashboard"
            className="p-6 border rounded-lg hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
            <p className="text-gray-600">View and manage your leads</p>
          </Link>
          
          <Link
            href="/call-recorder"
            className="p-6 border rounded-lg hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-bold mb-2">Record Call</h2>
            <p className="text-gray-600">Record and analyze sales calls</p>
          </Link>
          
          <Link
            href="/email-input"
            className="p-6 border rounded-lg hover:bg-gray-50 transition"
          >
            <h2 className="text-2xl font-bold mb-2">Process Email</h2>
            <p className="text-gray-600">Analyze and respond to emails</p>
          </Link>
        </div>
      </div>
    </main>
  )
}

