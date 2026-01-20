'use client'

import { EmailInput } from '@/components/EmailInput'

export default function EmailInputPage() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Process Email</h1>
        <EmailInput />
      </div>
    </div>
  )
}

