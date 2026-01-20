'use client'

import { AudioRecorder } from '@/components/AudioRecorder'

export default function CallRecorder() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Record Sales Call</h1>
        <AudioRecorder />
      </div>
    </div>
  )
}

