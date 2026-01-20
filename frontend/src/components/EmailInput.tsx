'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

export function EmailInput() {
  const [emailBody, setEmailBody] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [subject, setSubject] = useState('')
  const router = useRouter()

  const processMutation = useMutation({
    mutationFn: async (data: { email_body: string; from_email: string; subject?: string }) => {
      const res = await api.post('/api/emails', data)
      return res.data
    },
    onSuccess: (data) => {
      if (data.leadId) {
        router.push(`/leads/${data.leadId}`)
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailBody || !fromEmail) {
      alert('Please fill in email body and sender email')
      return
    }
    processMutation.mutate({
      email_body: emailBody,
      from_email: fromEmail,
      subject: subject || undefined,
    })
  }

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Parse Email</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">From Email</label>
          <input
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="sender@example.com"
            className="w-full p-3 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Subject (optional)</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject"
            className="w-full p-3 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Email Body</label>
          <textarea
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            placeholder="Paste email content here..."
            className="w-full h-40 p-3 border rounded"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={processMutation.isPending}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {processMutation.isPending ? 'Processing...' : 'Process Email'}
        </button>
      </form>

      {processMutation.isError && (
        <div className="mt-4 p-4 bg-red-50 rounded">
          <p className="text-red-700">Error processing email. Please try again.</p>
        </div>
      )}

      {processMutation.isSuccess && processMutation.data && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <p className="text-green-700 font-bold mb-2">Email processed successfully!</p>
          <p className="text-sm text-gray-600">
            Redirecting to lead details...
          </p>
        </div>
      )}
    </div>
  )
}

