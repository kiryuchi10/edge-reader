import { DocumentUpload } from '../../components/common/DocumentUpload'

export default function DocumentUploadPage() {
  const handleUploadComplete = (files: any[]) => {
    console.log('Upload complete:', files)
    // TODO: Navigate to document viewer or show success message
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Upload & Processing</h1>
        <p className="text-slate-400">
          Upload PDFs, images, or videos for OCR extraction and analysis
        </p>
      </div>

      <DocumentUpload onUploadComplete={handleUploadComplete} />
    </div>
  )
}
