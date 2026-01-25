import { Routes, Route } from 'react-router-dom'
import DashboardPage from '../pages/dashboard/DashboardPage'
import JobsPage from '../pages/jobs/JobsPage'
import JobDetailPage from '../pages/jobs/JobDetailPage'
import EquipmentDashboard from '../pages/hardware/EquipmentDashboard'
import EquipmentPage from '../pages/equipment/EquipmentPage'
import EquipmentDetail from '../pages/hardware/EquipmentDetail'
import EquipmentLivePage from '../pages/equipment/EquipmentLivePage'
import Alarms from '../pages/hardware/Alarms'
import DocumentUploadPage from '../pages/documents/DocumentUploadPage'
import DocumentViewerPage from '../pages/documents/DocumentViewerPage'
import EDAReportPage from '../pages/analysis/EDAReportPage'
import ModelTrainingPage from '../pages/ml/ModelTrainingPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/jobs/:jobId" element={<JobDetailPage />} />
      <Route path="/equipment" element={<EquipmentPage />} />
      <Route path="/equipment/:id" element={<EquipmentDetail />} />
      <Route path="/equipment/:id/live" element={<EquipmentLivePage />} />
      {/* Legacy routes for backward compatibility */}
      <Route path="/hardware" element={<EquipmentDashboard />} />
      <Route path="/hardware/:id" element={<EquipmentDetail />} />
      <Route path="/alarms" element={<Alarms />} />
      <Route path="/documents/upload" element={<DocumentUploadPage />} />
      <Route path="/documents/:id" element={<DocumentViewerPage />} />
      <Route path="/analysis/eda/:id" element={<EDAReportPage />} />
      <Route path="/ml/train" element={<ModelTrainingPage />} />
    </Routes>
  )
}
