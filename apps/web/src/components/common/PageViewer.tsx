import React, { useState } from 'react'
import { FileImage, Download, Eye, EyeOff, Database, BarChart3 } from 'lucide-react'

interface PageData {
  pageNumber: number
  confidence: number
  entities: {
    numbers: string[]
    dates: string[]
    tables: Array<{ rows: number; cols: number }>
  }
  rawText: string
}

interface PageViewerProps {
  documentId: string | number
  totalPages?: number
  initialPage?: number
}

export const PageViewer: React.FC<PageViewerProps> = ({
  documentId: _documentId,
  totalPages = 5,
  initialPage = 1,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [showOCR, setShowOCR] = useState(true)

  // Mock page data - replace with actual API call
  const mockPageData: PageData = {
    pageNumber: currentPage,
    confidence: 94.5,
    entities: {
      numbers: ['123.45', '67.8%', '2024'],
      dates: ['2024-01-15'],
      tables: [{ rows: 5, cols: 3 }],
    },
    rawText:
      'Sample extracted text from the document page showing experimental results and measurements...',
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">
                Page {currentPage} of {totalPages}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                    showOCR ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                  onClick={() => setShowOCR(!showOCR)}
                >
                  {showOCR ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showOCR ? 'Hide' : 'Show'} OCR</span>
                </button>
                <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded overflow-hidden aspect-[8.5/11] shadow-lg">
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <FileImage className="w-24 h-24 text-gray-400" />
                {showOCR && (
                  <div className="absolute inset-0 p-4 text-xs text-gray-600 opacity-50">
                    {mockPageData.rawText}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 mt-4">
              <button
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={handlePrevious}
              >
                Previous
              </button>
              <span className="px-4 text-sm text-slate-400">
                Page {currentPage} / {totalPages}
              </span>
              <button
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
              OCR Confidence
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${mockPageData.confidence}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{mockPageData.confidence}%</span>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Database className="w-5 h-5 mr-2 text-purple-400" />
              Extracted Entities
            </h3>

            <div className="mb-3">
              <p className="text-sm text-slate-400 mb-1">Numbers</p>
              <div className="flex flex-wrap gap-1">
                {mockPageData.entities.numbers.map((num, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-slate-400 mb-1">Dates</p>
              <div className="flex flex-wrap gap-1">
                {mockPageData.entities.dates.map((date, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded text-xs"
                  >
                    {date}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-1">Tables Detected</p>
              <p className="text-xl font-bold">{mockPageData.entities.tables.length}</p>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Raw Text</h3>
            <div className="bg-slate-900 rounded p-3 text-xs text-slate-300 max-h-64 overflow-y-auto">
              {mockPageData.rawText}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
