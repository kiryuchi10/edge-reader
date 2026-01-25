import React, { useState } from 'react'
import { Brain, Loader, CheckCircle, TrendingUp } from 'lucide-react'

interface Algorithm {
  id: string
  name: string
}

interface TrainedModel {
  algorithm: string
  accuracy: number
  f1Score: number
  precision?: number
  recall?: number
}

const algorithms: Algorithm[] = [
  { id: 'random_forest', name: 'Random Forest' },
  { id: 'logistic', name: 'Logistic Regression' },
  { id: 'xgboost', name: 'XGBoost' },
  { id: 'linear', name: 'Linear Regression' },
  { id: 'svm', name: 'Support Vector Machine' },
  { id: 'neural_network', name: 'Neural Network' },
]

interface ModelTrainingProps {
  onTrainingComplete?: (model: TrainedModel) => void
}

export const ModelTraining: React.FC<ModelTrainingProps> = ({ onTrainingComplete }) => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('random_forest')
  const [training, setTraining] = useState(false)
  const [trainedModel, setTrainedModel] = useState<TrainedModel | null>(null)

  const handleTrain = async () => {
    setTraining(true)
    setTrainedModel(null)

    // Simulate training process
    setTimeout(() => {
      const model: TrainedModel = {
        algorithm: selectedAlgorithm,
        accuracy: 0.92,
        f1Score: 0.89,
        precision: 0.91,
        recall: 0.87,
      }
      setTrainedModel(model)
      setTraining(false)
      onTrainingComplete?.(model)
    }, 3000)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Train ML Model</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Model Configuration</h2>

          <div className="mb-4">
            <label className="block text-sm mb-2">Select Algorithm</label>
            <select
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              disabled={training}
            >
              {algorithms.map((alg) => (
                <option key={alg.id} value={alg.id}>
                  {alg.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 rounded py-3 font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleTrain}
            disabled={training}
          >
            {training ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Training Model...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Train Model
              </>
            )}
          </button>
        </div>

        {trainedModel && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
              Model Performance
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Accuracy</span>
                  <span className="font-semibold">
                    {(trainedModel.accuracy * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${trainedModel.accuracy * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">F1 Score</span>
                  <span className="font-semibold">
                    {(trainedModel.f1Score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${trainedModel.f1Score * 100}%` }}
                  />
                </div>
              </div>

              {trainedModel.precision && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Precision</span>
                    <span className="font-semibold">
                      {(trainedModel.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${trainedModel.precision * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {trainedModel.recall && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Recall</span>
                    <span className="font-semibold">
                      {(trainedModel.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${trainedModel.recall * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-700">
                <button className="w-full bg-green-600 hover:bg-green-700 rounded py-2 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Deploy Model
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
