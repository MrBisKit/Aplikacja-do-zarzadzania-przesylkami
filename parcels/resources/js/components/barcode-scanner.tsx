import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, QrCode, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
// Import the scanner as a default import
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BarcodeScanner({ isOpen, onClose }: BarcodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [debugData, setDebugData] = useState<{attempts: number; lastResult: string | null}>({ attempts: 0, lastResult: null });

  // Function to stop the camera stream
  const stopStream = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => {
        track.stop();
      });
      setStream(null);
      console.log('Camera stream stopped');
    }
  };

  useEffect(() => {
    // Reset states when modal opens
    if (isOpen) {
      setScanning(true);
      setError(null);
      
      // Check for camera permissions and start stream
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((mediaStream) => {
          setHasPermission(true);
          setStream(mediaStream);
        })
        .catch((err) => {
          console.error('Camera permission error:', err);
          setHasPermission(false);
          setError('Camera access denied. Please enable camera permissions and try again.');
        });
    } else {
      setScanning(false);
      stopStream();
    }
    
    // Cleanup function to stop stream when component unmounts
    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Handle scan results
  const handleUpdate = (err: any, result: any) => {
    // Increment attempt counter for debugging
    setDebugData(prev => ({ ...prev, attempts: prev.attempts + 1 }));
    
    // Only process successful scans
    if (result) {
      try {
        // Extract the text from the result
        // Different barcode formats might have different properties
        let scannedData = '';
        let resultType = 'unknown';
        
        if (typeof result === 'object') {
          if (result.getText && typeof result.getText === 'function') {
            scannedData = result.getText();
            resultType = 'getText()';
          } else if (result.text) {
            scannedData = result.text;
            resultType = 'text';
          } else if (result.rawValue) {
            scannedData = result.rawValue;
            resultType = 'rawValue';
          } else {
            // Try to stringify the result if we can't find a text property
            try {
              scannedData = JSON.stringify(result);
              resultType = 'stringify';
            } catch (e) {
              scannedData = '[Complex Object]';
              resultType = 'complex';
            }
          }
        } else {
          scannedData = String(result);
          resultType = typeof result;
        }
        
        console.log('Scanned barcode:', scannedData, 'Type:', resultType);
        
        // Update debug data
        setDebugData(prev => ({ ...prev, lastResult: `${resultType}: ${scannedData}` }));
        
        if (scannedData && scannedData.trim() !== '') {
          // Stop scanning
          setScanning(false);
          
          // Stop the camera stream
          stopStream();
          
          // Close the modal
          onClose();
          
          // Navigate to the parcel page using the correct route format
          router.visit(`/track-parcel/${encodeURIComponent(scannedData)}`);
        }
      } catch (error) {
        console.error('Error processing scan result:', error);
        // Update debug data with error
        setDebugData(prev => ({ ...prev, lastResult: `Error: ${error}` }));
        // Don't set error state here - just continue scanning
      }
    }
    
    // If there's an error, log it but continue scanning
    if (err) {
      console.error('Scan error:', err);
      // Update debug data with error
      setDebugData(prev => ({ ...prev, lastResult: `Error: ${err}` }));
      // Don't set error state for transient errors to allow continuous scanning
    }
  };

  const handleRetry = () => {
    // Stop any existing stream before retrying
    stopStream();
    
    setError(null);
    setScanning(true);
    
    // Try to get camera access again
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((mediaStream) => {
        setHasPermission(true);
        setStream(mediaStream);
      })
      .catch((err) => {
        console.error('Camera permission error on retry:', err);
        setHasPermission(false);
        setError('Camera access denied. Please enable camera permissions and try again.');
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan Parcel Barcode
          </DialogTitle>
          <DialogDescription>
            Position the barcode in the center of the camera view
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {hasPermission === false && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Camera access denied. Please enable camera permissions and try again.
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {hasPermission === true && scanning && (
            <div className="relative overflow-hidden rounded-md border border-gray-200 bg-black">
              <BarcodeScannerComponent
                key={isOpen ? 'scanner-active' : 'scanner-inactive'} // Force re-mount on open/close
                width={300}
                height={300}
                onUpdate={handleUpdate}
                facingMode="environment"
                delay={500} /* Standard delay, gives more processing time per frame */
                torch={false}
              />
              <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/50 m-8 rounded-md"></div>
            </div>
          )}
          
          {/* Debug information display */}
          {scanning && (
            <div className="w-full max-w-[300px] p-2 bg-gray-100 rounded-md text-xs font-mono overflow-hidden">
              <div className="flex justify-between">
                <span className="font-semibold">Attempts:</span>
                <span>{debugData.attempts}</span>
              </div>
              <div className="mt-1">
                <span className="font-semibold">Last result:</span>
                <div className="mt-1 p-1 bg-gray-200 rounded break-all">
                  {debugData.lastResult || 'No data yet'}
                </div>
              </div>
            </div>
          )}
          
          {!scanning && !error && (
            <div className="flex h-[300px] w-[300px] items-center justify-center bg-gray-100 rounded-md">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          
          <div className="flex justify-between w-full pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {error && (
              <Button onClick={handleRetry}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
