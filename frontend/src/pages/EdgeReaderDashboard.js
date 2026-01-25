import React, { useState } from 'react';
import { Upload, FileText, Activity, BarChart3, Settings, Search, Filter, Download, AlertCircle, CheckCircle, Clock, Zap, TrendingUp, Database, Video, Image, FileSpreadsheet, Microscope, ChevronRight, RefreshCw } from 'lucide-react';

const EdgeReaderDashboard = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState([
    { id: '001', name: 'HPLC_Sample_A.jpg', type: 'chromatogram', status: 'completed', purity: 98.5, peaks: 4, time: '2 min ago' },
    { id: '002', name: 'Lab_Report_Q4.pdf', type: 'document', status: 'completed', tables: 5, pages: 12, time: '15 min ago' },
    { id: '003', name: 'NMR_Spectrum_B.png', type: 'spectrum', status: 'processing', progress: 67, time: 'Processing...' },
    { id: '004', name: 'Temperature_Panel.mp4', type: 'panel', status: 'completed', readings: 145, time: '1 hour ago' },
    { id: '005', name: 'Certificate_Analysis.pdf', type: 'document', status: 'completed', validated: true, time: '2 hours ago' }
  ]);

  const [stats] = useState({
    totalAnalyses: 1247,
    todayAnalyses: 23,
    avgProcessingTime: '1.2s',
    successRate: 98.7,
    activeStreams: 2
  });

  const contentTypes = [
    { type: 'chromatogram', icon: Activity, label: 'HPLC/GC', count: 342, color: 'bg-blue-500' },
    { type: 'spectrum', icon: Zap, label: 'Spectra', count: 218, color: 'bg-purple-500' },
    { type: 'document', icon: FileText, label: 'Documents', count: 524, color: 'bg-green-500' },
    { type: 'panel', icon: Microscope, label: 'Panels', count: 163, color: 'bg-orange-500' }
  ];

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      simulateAnalysis(file);
    }
  };

  const simulateAnalysis = (file) => {
    setIsProcessing(true);
    
    setTimeout(() => {
      const newAnalysis = {
        id: String(recentAnalyses.length + 1).padStart(3, '0'),
        name: file.name,
        type: detectFileType(file.name),
        status: 'completed',
        time: 'Just now',
        purity: Math.random() * 5 + 95,
        peaks: Math.floor(Math.random() * 8) + 2
      };
      
      setRecentAnalyses([newAnalysis, ...recentAnalyses]);
      setIsProcessing(false);
    }, 2000);
  };

  const detectFileType = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('hplc') || lower.includes('gc')) return 'chromatogram';
    if (lower.includes('nmr') || lower.includes('ir')) return 'spectrum';
    if (lower.includes('panel') || lower.includes('temp')) return 'panel';
    return 'document';
  };

  const getStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'processing') return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getTypeIcon = (type) => {
    const icons = {
      chromatogram: Activity,
      spectrum: Zap,
      document: FileText,
      panel: Microscope
    };
    const Icon = icons[type] || FileText;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Microscope className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Edge Reader
                </h1>
                <p className="text-xs text-slate-400">Intelligent Document & Data Analysis</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">{stats.activeStreams} Active Streams</span>
              </div>
              <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.totalAnalyses.toLocaleString()}</h3>
            <p className="text-sm text-slate-400">Total Analyses</p>
            <p className="text-xs text-blue-400 mt-2">+{stats.todayAnalyses} today</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-8 h-8 text-green-400" />
              <CheckCircle className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.successRate}%</h3>
            <p className="text-sm text-slate-400">Success Rate</p>
            <p className="text-xs text-green-400 mt-2">Last 30 days</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-400" />
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.avgProcessingTime}</h3>
            <p className="text-sm text-slate-400">Avg Processing</p>
            <p className="text-xs text-purple-400 mt-2">Per analysis</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-orange-400" />
              <TrendingUp className="w-4 h-4 text-orange-400" />
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.todayAnalyses}</h3>
            <p className="text-sm text-slate-400">Today's Activity</p>
            <p className="text-xs text-orange-400 mt-2">Real-time updates</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Upload className="w-6 h-6 mr-2 text-blue-400" />
            Quick Analysis
          </h2>
          
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*,video/*,.pdf,.csv,.xlsx"
            />
            
            {isProcessing ? (
              <div className="space-y-4">
                <RefreshCw className="w-12 h-12 mx-auto text-blue-400 animate-spin" />
                <p className="text-lg font-medium">Processing {selectedFile?.name}...</p>
                <div className="max-w-md mx-auto bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full w-2/3 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 mx-auto text-slate-400" />
                <div>
                  <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
                  <p className="text-sm text-slate-400">Supports: Images, Videos, PDFs, CSV, Excel</p>
                </div>
                <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
                  <span className="flex items-center"><Image className="w-4 h-4 mr-1" />Images</span>
                  <span className="flex items-center"><Video className="w-4 h-4 mr-1" />Videos</span>
                  <span className="flex items-center"><FileText className="w-4 h-4 mr-1" />PDFs</span>
                  <span className="flex items-center"><FileSpreadsheet className="w-4 h-4 mr-1" />Data</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Type Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {contentTypes.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.type}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold mb-1">{item.label}</h3>
                <p className="text-2xl font-bold text-slate-300">{item.count}</p>
                <p className="text-xs text-slate-500 mt-1">Total analyses</p>
              </button>
            );
          })}
        </div>

        {/* Recent Analyses */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-400" />
              Recent Analyses
            </h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <Search className="w-5 h-5 text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                <Filter className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/80">
                <tr className="text-left text-sm text-slate-400">
                  <th className="px-6 py-4 font-medium">ID</th>
                  <th className="px-6 py-4 font-medium">File Name</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Results</th>
                  <th className="px-6 py-4 font-medium">Time</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {recentAnalyses.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-slate-400">#{analysis.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(analysis.type)}
                        <span className="font-medium">{analysis.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-slate-700 rounded-full text-xs capitalize">
                        {analysis.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(analysis.status)}
                        <span className="text-sm capitalize">{analysis.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {analysis.type === 'chromatogram' && analysis.purity && (
                        <span className="text-green-400">Purity: {analysis.purity.toFixed(1)}%</span>
                      )}
                      {analysis.type === 'document' && analysis.tables && (
                        <span className="text-blue-400">{analysis.tables} tables, {analysis.pages} pages</span>
                      )}
                      {analysis.type === 'panel' && analysis.readings && (
                        <span className="text-orange-400">{analysis.readings} readings</span>
                      )}
                      {analysis.type === 'spectrum' && analysis.progress !== undefined && (
                        <span className="text-purple-400">{analysis.progress}% complete</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{analysis.time}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="View Details">
                          <FileText className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Download Report">
                          <Download className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EdgeReaderDashboard;
