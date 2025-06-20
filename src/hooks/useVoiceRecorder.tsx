import { useState, useRef, useEffect } from 'react';

const useVoiceRecorder = () => {
  const [isRecorderReady, setIsRecorderReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Initialize the media recorder
    const initializeRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;
        mediaRecorderRef.current = new MediaRecorder(stream);
        setIsRecorderReady(true);

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setRecordedBlob(blob);
          chunksRef.current = [];
        };
      } catch (error) {
        console.error('Error initializing voice recorder:', error);
        setIsRecorderReady(false);
      }
    };

    initializeRecorder();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = () => {
    if (mediaRecorderRef.current && isRecorderReady && !isRecording) {
      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetRecorder = () => {
    setRecordedBlob(null);
    chunksRef.current = [];
  };

  return {
    isRecorderReady,
    isRecording,
    recordedBlob,
    startRecording,
    stopRecording,
    resetRecorder,
  };
};

export default useVoiceRecorder;
