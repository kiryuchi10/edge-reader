import { ModelTraining } from '../../components/common/ModelTraining'

export default function ModelTrainingPage() {
  const handleTrainingComplete = (model: any) => {
    console.log('Model trained:', model)
    // TODO: Navigate to model detail page or show success message
  }

  return <ModelTraining onTrainingComplete={handleTrainingComplete} />
}
