import React from 'react'
import { Database, BarChart3, AlertCircle, TrendingUp } from 'lucide-react'

interface Distribution {
  column: string
  mean: number
  median: number
  std: number
  min: number
  max: number
}

interface Correlation {
  var1: string
  var2: string
  correlation: number
}

interface EDAReportData {
  summary: {
    rows: number
    columns: number
    missingValues: number
  }
  distributions: Distribution[]
  correlations: Correlation[]
}

interface EDAReportProps {
  jobId?: string | number
  data?: EDAReportData
}

const defaultData: EDAReportData = {
  summary: {
    rows: 1000,
    columns: 15,
    missingValues: 23,
  },
  distributions: [
    {
      column: 'age',
      mean: 35.2,
      median: 33,
      std: 12.5,
      min: 18,
      max: 85,
    },
    {
      column: 'income',
      mean: 65000,
      median: 58000,
      std: 25000,
      min: 20000,
      max: 150000,
    },
  ],
  correlations: [
    { var1: 'age', var2: 'income', correlation: 0.65 },
    { var1: 'education', var2: 'income', correlation: 0.72 },
  ],
}

export const EDAReport: React.FC<EDAReportProps> = ({ jobId: _jobId, data = defaultData }) => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Exploratory Data Analysis Report</h1>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <Database className="w-8 h-8 text-blue-400 mb-3" />
          <p className="text-sm text-slate-400">Total Rows</p>
          <p className="text-3xl font-bold">{data.summary.rows.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <BarChart3 className="w-8 h-8 text-green-400 mb-3" />
          <p className="text-sm text-slate-400">Total Columns</p>
          <p className="text-3xl font-bold">{data.summary.columns}</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <AlertCircle className="w-8 h-8 text-orange-400 mb-3" />
          <p className="text-sm text-slate-400">Missing Values</p>
          <p className="text-3xl font-bold">{data.summary.missingValues}</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
          Column Statistics
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr className="text-left text-sm">
                <th className="px-4 py-3">Column</th>
                <th className="px-4 py-3">Mean</th>
                <th className="px-4 py-3">Median</th>
                <th className="px-4 py-3">Std Dev</th>
                <th className="px-4 py-3">Min</th>
                <th className="px-4 py-3">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {data.distributions.map((dist, idx) => (
                <tr key={idx} className="hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium">{dist.column}</td>
                  <td className="px-4 py-3">{dist.mean.toLocaleString()}</td>
                  <td className="px-4 py-3">{dist.median.toLocaleString()}</td>
                  <td className="px-4 py-3">{dist.std.toLocaleString()}</td>
                  <td className="px-4 py-3">{dist.min.toLocaleString()}</td>
                  <td className="px-4 py-3">{dist.max.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Top Correlations</h2>
        <div className="space-y-3">
          {data.correlations.map((corr, idx) => (
            <div key={idx} className="flex items-center">
              <span className="text-sm w-48">
                {corr.var1} ↔ {corr.var2}
              </span>
              <div className="flex-1 bg-slate-700 rounded-full h-2 mx-4">
                <div
                  className={`h-2 rounded-full ${
                    corr.correlation > 0.7 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold w-16 text-right">
                {corr.correlation.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
