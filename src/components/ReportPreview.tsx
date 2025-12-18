import { MapPin, Clock, AlertTriangle } from 'lucide-react';

interface ReportPreviewProps {
  data: {
    latitude: number;
    longitude: number;
    severity: string;
    timestamp: number;
    totalDetections: number;
  };
  onSubmit: () => void;
  onCancel: () => void;
}

export function ReportPreview({ data, onSubmit, onCancel }: ReportPreviewProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-8 text-center border-b border-gray-200">
        <h1 className="text-gray-900 mb-2">Report Preview</h1>
        <p className="text-gray-600">Review detected data before submission</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-4">
          
          {/* Info Message */}
          {data.totalDetections > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-blue-900 text-sm">
                {data.totalDetections} pothole event{data.totalDetections !== 1 ? 's' : ''} detected during your ride
              </p>
            </div>
          )}

          {/* Latitude */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <label className="text-gray-600 text-sm mb-1 block">Latitude</label>
                <div className="text-gray-900">{data.latitude.toFixed(6)}</div>
              </div>
            </div>
          </div>

          {/* Longitude */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <label className="text-gray-600 text-sm mb-1 block">Longitude</label>
                <div className="text-gray-900">{data.longitude.toFixed(6)}</div>
              </div>
            </div>
          </div>

          {/* Severity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <label className="text-gray-600 text-sm mb-1 block">Severity</label>
                <div className="mt-2">
                  <span className={`inline-block px-4 py-2 rounded-lg border capitalize ${getSeverityColor(data.severity)}`}>
                    {data.severity}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamp */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <label className="text-gray-600 text-sm mb-1 block">Timestamp</label>
                <div className="text-gray-900">{formatTimestamp(data.timestamp)}</div>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-gray-600 text-sm">
              All values are auto-filled and read-only
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border-t border-gray-200 px-6 py-6 space-y-3">
        <button
          onClick={onSubmit}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl shadow-lg transition-all transform active:scale-98"
        >
          Submit Complaint
        </button>
        
        <button
          onClick={onCancel}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
