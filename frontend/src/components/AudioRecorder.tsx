'use client'

import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

export function AudioRecorder() {
  const [recording, setRecording] = useState(false)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const router = useRouter()

  const processMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData()
      formData.append('audio_file', audioBlob, 'recording.wav')

      const res = await api.post('/api/calls', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return res.data
    },
    onSuccess: (data) => {
      if (data.leadId) {
        router.push(`/leads/${data.leadId}`)
      }
    },
  })

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorderRef.current = mediaRecorder

      const chunks: Blob[] = []
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        processMutation.mutate(audioBlob)
        setAudioChunks([])
      }

      mediaRecorder.start()
      setRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }
    }
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h2 className="text-2xl font-bold mb-4">Record Call</h2>
      
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={processMutation.isPending}
          className={`px-6 py-3 rounded-lg text-white font-bold transition ${
            recording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {recording ? '⏹ Stop Recording' : '🎤 Start Recording'}
        </button>
        
        {recording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Recording...</span>
          </div>
        )}
      </div>

      {processMutation.isPending && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <p className="text-blue-700">Processing call... This may take a minute.</p>
        </div>
      )}

      {processMutation.isError && (
        <div className="mt-4 p-4 bg-red-50 rounded">
          <p className="text-red-700">
            Error processing call. Please try again.
          </p>
        </div>
      )}

      {processMutation.isSuccess && processMutation.data && (
        <div className="mt-4 p-4 bg-green-50 rounded">
          <p className="text-green-700 font-bold mb-2">Call processed successfully!</p>
          <p className="text-sm text-gray-600">
            Redirecting to lead details...
          </p>
        </div>
      )}
    </div>
  )
}

