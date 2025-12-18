import { useState } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { ReportPreview } from './components/ReportPreview';
import { SuccessScreen } from './components/SuccessScreen';

type Screen = 'home' | 'preview' | 'success';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [detectionData, setDetectionData] = useState<any>(null);

  const handleStopDetection = (data: any) => {
    setDetectionData(data);
    setCurrentScreen('preview');
  };

  const handleSubmit = () => {
    setCurrentScreen('success');
  };

  const handleCancel = () => {
    setDetectionData(null);
    setCurrentScreen('home');
  };

  const handleBackToHome = () => {
    setDetectionData(null);
    setCurrentScreen('home');
  };

  return (
    <div className="h-screen bg-white flex flex-col max-w-md mx-auto overflow-hidden">
      {currentScreen === 'home' && (
        <HomeScreen onStopDetection={handleStopDetection} />
      )}
      {currentScreen === 'preview' && (
        <ReportPreview 
          data={detectionData} 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
      {currentScreen === 'success' && (
        <SuccessScreen onBackToHome={handleBackToHome} />
      )}
    </div>
  );
}
