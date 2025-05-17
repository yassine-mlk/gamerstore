import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Check } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageFile: File) => void;
  onClose: () => void;
}

const CameraCapture = ({ onCapture, onClose }: CameraCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Demander l'accès à la caméra
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' } // Utiliser la caméra arrière si disponible
        });
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Erreur d\'accès à la caméra:', err);
        setError('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.');
      }
    };

    startCamera();

    // Nettoyer le stream à la fermeture
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Définir les dimensions du canvas pour correspondre à la vidéo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Dessiner l'image vidéo sur le canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convertir le canvas en data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const acceptImage = () => {
    if (capturedImage && canvasRef.current) {
      // Convertir dataURL en Blob puis en File
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `product-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        }
      }, 'image/jpeg', 0.95); // Qualité de compression
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex flex-col items-center justify-center">
      <div className="bg-card rounded-lg p-4 w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Prendre une photo</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {error ? (
          <div className="text-destructive p-4 text-center">{error}</div>
        ) : capturedImage ? (
          // Afficher l'image capturée
          <div className="flex flex-col items-center">
            <div className="relative w-full rounded-md overflow-hidden mb-4 bg-black">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full object-contain max-h-[300px]" 
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={retakePhoto}>
                Reprendre
              </Button>
              <Button onClick={acceptImage}>
                <Check className="mr-2 h-4 w-4" />
                Utiliser cette photo
              </Button>
            </div>
          </div>
        ) : (
          // Afficher le flux vidéo pour la capture
          <div className="flex flex-col items-center">
            <div className="relative w-full rounded-md overflow-hidden mb-4 bg-black">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full object-contain max-h-[300px]"
              />
            </div>
            <Button onClick={capturePhoto}>
              <Camera className="mr-2 h-4 w-4" />
              Prendre la photo
            </Button>
          </div>
        )}
        
        {/* Canvas caché pour le traitement des images */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default CameraCapture; 