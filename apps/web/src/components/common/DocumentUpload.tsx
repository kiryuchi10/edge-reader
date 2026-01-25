import React, { useState, useCallback } from 'react'
import { Upload, File, FileImage, Video, CheckCircle, Loader, AlertCircle } from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'completed' | 'error'
  progress?: number
}

interface DocumentUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void
  accept?: string
  maxSize?: number // in MB
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
  accept = '.pdf,.jpg,.jpeg,.png,.mp4,.avi',
  maxSize = 500,
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }, [])

  const handleFiles = async (fileList: File[]) => {
    setError(null)
    setUploading(true)

    const newFiles: UploadedFile[] = []

    for (const file of fileList) {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} exceeds maximum size of ${maxSize}MB`)
        continue
      }

      const fileId = `${Date.now()}-${Math.random()}`
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0,
      }

      newFiles.push(uploadedFile)
      setFiles((prev) => [...prev, uploadedFile])

      // Simulate upload progress
      try {
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          setUploadProgress((prev) => ({ ...prev, [fileId]: i }))
        }

        // Mark as completed
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
          )
        )
      } catch (error) {
        console.error('Upload failed:', error)
        setFiles((prev) =>
          prev.map((f) => (f.id === fileId ? { ...f, status: 'error' } : f))
        )
        setError(`Failed to upload ${file.name}`)
      }
    }

    setUploading(false)
    setUploadProgress({})
    onUploadComplete?.(newFiles.filter((f) => f.status === 'completed'))
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <File className="w-5 h-5 text-red-400" />
    if (type.includes('image')) return <FileImage className="w-5 h-5 text-blue-400" />
    if (type.includes('video')) return <Video className="w-5 h-5 text-purple-400" />
    return <File className="w-5 h-5 text-slate-400" />
  }

  return (
    <div className="space-y-6">
      <div
        className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-blue-500 transition-colors relative cursor-pointer"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          accept={accept}
        />

        <Upload className="w-16 h-16 mx-auto mb-4 text-slate-400" />
        <h3 className="text-xl font-semibold mb-2">Drop files here or click to browse</h3>
        <p className="text-sm text-slate-400 mb-4">
          Supports PDF, JPG, PNG, MP4, AVI (max {maxSize}MB per file)
        </p>

        <div className="flex items-center justify-center space-x-6 text-xs text-slate-500">
          <span className="flex items-center">
            <File className="w-4 h-4 mr-1" />PDF
          </span>
          <span className="flex items-center">
            <FileImage className="w-4 h-4 mr-1" />Images
          </span>
          <span className="flex items-center">
            <Video className="w-4 h-4 mr-1" />Videos
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {uploading && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="font-semibold mb-4 flex items-center">
            <Loader className="w-5 h-5 mr-2 animate-spin text-blue-400" />
            Uploading files...
          </h3>
          {Object.entries(uploadProgress).map(([fileId, progress]) => {
            const file = files.find((f) => f.id === fileId)
            if (!file) return null

            return (
              <div key={fileId} className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-300">{file.name}</span>
                  <span className="text-blue-400">{progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {files.length > 0 && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-slate-700">
            <h3 className="font-semibold">Uploaded Documents ({files.length})</h3>
          </div>
          <div className="divide-y divide-slate-700">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-4 flex items-center justify-between hover:bg-slate-700/30"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {file.status === 'uploading' && (
                    <Loader className="w-5 h-5 animate-spin text-blue-400" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
