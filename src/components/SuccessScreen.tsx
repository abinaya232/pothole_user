import { CheckCircle, Home } from 'lucide-react';

interface SuccessScreenProps {
  onBackToHome: () => void;
}

export function SuccessScreen({ onBackToHome }: SuccessScreenProps) {
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-green-50 to-white">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        
        {/* Success Icon */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl">
            <CheckCircle className="w-20 h-20 text-white" />
          </div>
          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25" />
        </div>

        {/* Message */}
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-gray-900">Complaint submitted successfully</h1>
          
          <p className="text-gray-600 leading-relaxed">
            Report has been sent to the government dashboard
          </p>

          {/* Additional Info */}
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <span>Your report is anonymous and secure</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <span>Authorities will review the data for road maintenance</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                <span>Thank you for helping improve road safety</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action */}
      <div className="bg-white border-t border-gray-200 px-6 py-6">
        <button
          onClick={onBackToHome}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}
