import { useState, useRef } from "react";
import { useReactMediaRecorder } from "react-media-recorder";
import { Mic, Square, Truck as Duck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
}

export default function AudioRecorder({ onAudioReady }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  const { status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      onStop: (blobUrl, blob) => {
        if (blob) {
          onAudioReady(blob);
        }
        clearBlobUrl();
      },
    });

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    startRecording();

    timerRef.current = setInterval(() => {
      setRecordingDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    stopRecording();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-amber-200 p-3 flex items-center space-x-3"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-red-500"
            />
            <span className="text-sm font-medium text-amber-900">
              {formatDuration(recordingDuration)}
            </span>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Duck className="h-4 w-4 text-amber-500" />
            </motion.div>
            <button
              onClick={handleStopRecording}
              className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
            >
              <Square className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!isRecording ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleStartRecording}
          className="p-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
          disabled={status === "recording"}
        >
          <Mic className="h-5 w-5" />
        </motion.button>
      ) : null}
    </div>
  );
}
