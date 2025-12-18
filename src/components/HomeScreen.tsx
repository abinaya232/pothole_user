import { useState, useEffect } from 'react';
import { Activity, Satellite, MapPin, Gauge, AlertCircle } from 'lucide-react';

interface HomeScreenProps {
  onStopDetection: (data: any) => void;
}

interface AccelerometerReading {
  timestamp: number;
  zAxis: number;
}

export function HomeScreen({ onStopDetection }: HomeScreenProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [sensorActive, setSensorActive] = useState(false);
  const [detectionData, setDetectionData] = useState<any[]>([]);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentLocation, setCurrentLocation] = useState({ lat: 37.7749, lng: -122.4194 });
  const [accelerometerData, setAccelerometerData] = useState<AccelerometerReading[]>([]);
  const [showPotholePopup, setShowPotholePopup] = useState(false);
  const [lastDetectionSeverity, setLastDetectionSeverity] = useState('');
  const [lastDetectionTime, setLastDetectionTime] = useState(0);

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [intervalId]);

  const startDetection = () => {
    setIsDetecting(true);
    setSensorActive(true);
    setDetectionData([]);
    setAccelerometerData([]);
    setCurrentSpeed(0);

    // Simulate GPS activation after delay
    setTimeout(() => {
      setGpsActive(true);
    }, 1500);

    // Simulate pothole detection and live data updates
    const id = window.setInterval(() => {
      const timestamp = Date.now();
      
      // Simulate speed variation (30-70 km/h)
      const speed = 30 + Math.random() * 40;
      setCurrentSpeed(speed);

      // Simulate location updates
      setCurrentLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0001,
        lng: prev.lng + (Math.random() - 0.5) * 0.0001,
      }));

      // Generate Z-axis accelerometer reading
      const baseZ = 9.8;
      const noise = (Math.random() - 0.5) * 0.5;
      const isPothole = Math.random() < 0.03; // 3% chance
      const zAxis = isPothole ? baseZ + (5 + Math.random() * 10) : baseZ + noise;

      // Update accelerometer graph data
      setAccelerometerData(prev => {
        const newData = [...prev, { timestamp, zAxis }];
        // Keep only last 50 readings for graph
        return newData.slice(-50);
      });

      // Detect pothole based on conditions
      if (speed > 10 && isPothole && zAxis > 14) {
        // Check cooldown period (10-15 seconds between detections)
        const cooldownPeriod = 10000 + Math.random() * 5000; // 10-15 seconds
        const timeSinceLastDetection = timestamp - lastDetectionTime;
        
        if (timeSinceLastDetection >= cooldownPeriod || lastDetectionTime === 0) {
          const severity = getSeverity(zAxis);
          const detection = {
            latitude: currentLocation.lat,
            longitude: currentLocation.lng,
            severity,
            timestamp,
            speed,
            zAxisAcceleration: zAxis,
          };
          
          setDetectionData(prev => [...prev, detection]);
          
          // Show popup
          setLastDetectionSeverity(severity);
          setShowPotholePopup(true);
          setTimeout(() => setShowPotholePopup(false), 3000);
          setLastDetectionTime(timestamp);
        }
      }
    }, 200); // Update every 200ms for smooth graph

    setIntervalId(id);
  };

  const stopDetection = () => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
    setIsDetecting(false);
    setSensorActive(false);
    setGpsActive(false);
    setCurrentSpeed(0);
    setAccelerometerData([]);

    // Prepare data for report preview
    if (detectionData.length > 0) {
      // Select the most severe detection
      const sortedByTimestamp = [...detectionData].sort((a, b) => b.timestamp - a.timestamp);
      const mostRecent = sortedByTimestamp[0];
      
      onStopDetection({
        latitude: mostRecent.latitude,
        longitude: mostRecent.longitude,
        severity: mostRecent.severity,
        timestamp: mostRecent.timestamp,
        totalDetections: detectionData.length,
      });
    } else {
      // No detections during ride
      onStopDetection({
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        severity: 'low',
        timestamp: Date.now(),
        totalDetections: 0,
      });
    }
  };

  const getSeverity = (zAxis: number) => {
    if (zAxis > 18) return 'high';
    if (zAxis > 15) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 relative">
      {/* Pothole Detection Popup */}
      {showPotholePopup && (
        <div className="absolute top-4 left-4 right-4 z-50 animate-slide-down">
          <div className={`rounded-xl shadow-2xl p-4 border-2 ${
            lastDetectionSeverity === 'high' ? 'bg-red-50 border-red-500' :
            lastDetectionSeverity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
            'bg-green-50 border-green-500'
          }`}>
            <div className="flex items-center gap-3">
              <AlertCircle className={`w-6 h-6 ${
                lastDetectionSeverity === 'high' ? 'text-red-600' :
                lastDetectionSeverity === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }`} />
              <div className="flex-1">
                <h4 className="text-gray-900">Pothole Detected!</h4>
                <p className="text-sm text-gray-600">Severity: <span className="capitalize">{lastDetectionSeverity}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-6 py-6 text-center border-b border-gray-200">
        <h1 className="text-gray-900 mb-2">Pothole Detection</h1>
        <p className="text-gray-600">Automatic road damage detection</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-6 overflow-y-auto">
        
        {!isDetecting ? (
          // Initial State - Show Start Button
          <>
            {/* Status Indicators */}
            <div className="w-full max-w-xs mx-auto mb-12 space-y-3">
              <div className="flex items-center justify-between py-2 px-4 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-700">GPS</span>
                <div className="flex items-center gap-2">
                  <Satellite className={`w-4 h-4 ${gpsActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={gpsActive ? 'text-green-600' : 'text-gray-500'}>
                    {gpsActive ? 'Active' : 'Searching'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 px-4 bg-white rounded-lg border border-gray-200">
                <span className="text-gray-700">Sensors</span>
                <div className="flex items-center gap-2">
                  <Activity className={`w-4 h-4 ${sensorActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className={sensorActive ? 'text-green-600' : 'text-gray-500'}>
                    {sensorActive ? 'Running' : 'Idle'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Control Button */}
            <div className="flex-1 flex items-center justify-center">
              <button
                onClick={startDetection}
                className="w-64 h-64 rounded-full shadow-2xl flex items-center justify-center transition-all transform active:scale-95 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <div className="text-center text-white">
                  <Activity className="w-20 h-20 mx-auto mb-3" />
                  <span className="text-2xl">Start Detection</span>
                </div>
              </button>
            </div>

            {/* Instruction Text */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 text-sm leading-relaxed">
                Start detection before riding. Stop detection after completing the ride.
              </p>
            </div>
          </>
        ) : (
          // Live Detection State - Full Screen Data
          <>
            {/* Ride Status Banner */}
            <div className="mb-4 py-3 px-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
              <span className="text-blue-900">🔵 Ride in progress</span>
            </div>

            {/* Live Data Cards */}
            <div className="space-y-4 mb-4">
              {/* Speed */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Gauge className="w-5 h-5 text-blue-600" />
                  <h3 className="text-gray-900">Current Speed</h3>
                </div>
                <div className="text-4xl text-blue-600">{currentSpeed.toFixed(1)} <span className="text-xl text-gray-600">km/h</span></div>
              </div>

              {/* GPS Location */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h3 className="text-gray-900">GPS Location</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Latitude:</span>
                    <span className="text-gray-900">{currentLocation.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Longitude:</span>
                    <span className="text-gray-900">{currentLocation.lng.toFixed(6)}</span>
                  </div>
                </div>
              </div>

              {/* Real-time Accelerometer Graph */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <h3 className="text-gray-900">Z-Axis Accelerometer</h3>
                </div>
                
                {/* Graph */}
                <div className="relative h-32 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <svg className="w-full h-full" preserveAspectRatio="none">
                    {/* Baseline at 9.8 m/s² */}
                    <line
                      x1="0"
                      y1="50%"
                      x2="100%"
                      y2="50%"
                      stroke="#9CA3AF"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    
                    {/* Accelerometer data line */}
                    {accelerometerData.length > 1 && (
                      <polyline
                        points={accelerometerData.map((reading, index) => {
                          const x = (index / (accelerometerData.length - 1)) * 100;
                          const y = 100 - ((reading.zAxis - 5) / 20) * 100; // Scale: 5-25 m/s²
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                  
                  {/* Current value indicator */}
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded border border-gray-300 text-xs">
                    {accelerometerData.length > 0 
                      ? `${accelerometerData[accelerometerData.length - 1].zAxis.toFixed(2)} m/s²`
                      : '0.00 m/s²'
                    }
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-gray-600 flex justify-between">
                  <span>Baseline: 9.8 m/s²</span>
                  <span>Detection threshold: &gt;14 m/s²</span>
                </div>
              </div>
            </div>

            {/* Stop Button with Counter */}
            <div className="mt-auto pt-4 space-y-3">
              {/* Pothole Count Display */}
              <div className="bg-white rounded-xl shadow-sm border-2 border-gray-300 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertCircle className={`w-6 h-6 ${detectionData.length > 0 ? 'text-orange-600' : 'text-gray-400'}`} />
                    <span className="text-gray-700">Total Potholes Detected</span>
                  </div>
                  <div className={`text-3xl ${detectionData.length > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                    {detectionData.length}
                  </div>
                </div>
                {detectionData.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {detectionData.slice(-5).map((detection, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded text-xs text-white capitalize ${getSeverityColor(detection.severity)}`}
                      >
                        {detection.severity}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Stop Button */}
              <button
                onClick={stopDetection}
                className="w-full h-20 rounded-xl shadow-2xl flex items-center justify-center transition-all transform active:scale-95 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <div className="text-center text-white">
                  <span className="text-2xl">Stop Detection</span>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}