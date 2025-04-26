import { useState, useEffect } from "react";
import { X, FilePlus, ImagePlus, VideoIcon, Music, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FileDropZone from "./file-drop-zone";
import FilePreview from "./file-preview";
import AudioRecorder from "./audio-recorder";

interface AttachmentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onAttach: (files: File[]) => void;
}

export default function AttachmentPanel({
  isOpen,
  onClose,
  onAttach,
}: AttachmentPanelProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setShowAudioRecorder(false);
    }
  }, [isOpen]);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttach = () => {
    if (selectedFiles.length > 0) {
      onAttach(selectedFiles);
      setSelectedFiles([]);
      onClose();
    }
  };

  const handleAudioReady = (audioBlob: Blob) => {
    const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, {
      type: "audio/webm",
    });
    setSelectedFiles((prev) => [...prev, audioFile]);
    setShowAudioRecorder(false);
  };

  const getFilteredFiles = () => {
    if (activeTab === "all") return selectedFiles;

    return selectedFiles.filter((file) => {
      if (activeTab === "images") return file.type.startsWith("image/");
      if (activeTab === "videos") return file.type.startsWith("video/");
      if (activeTab === "audio") return file.type.startsWith("audio/");
      if (activeTab === "documents") {
        return (
          !file.type.startsWith("image/") &&
          !file.type.startsWith("video/") &&
          !file.type.startsWith("audio/")
        );
      }
      return true;
    });
  };

  const filteredFiles = getFilteredFiles();

  const tabs = [
    { id: "all", label: "Todos", icon: FilePlus },
    { id: "images", label: "Imagens", icon: ImagePlus },
    { id: "videos", label: "Vídeos", icon: VideoIcon },
    { id: "audio", label: "Áudio", icon: Music },
    { id: "documents", label: "Documentos", icon: FilePlus },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg border border-amber-200 shadow-lg overflow-hidden z-50"
        >
          <div className="p-3 border-b border-amber-100 flex justify-between items-center">
            <h3 className="text-sm font-medium text-amber-800">
              Anexar arquivos
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            {!showAudioRecorder ? (
              <FileDropZone onDrop={handleFilesSelected} />
            ) : (
              <div className="p-6 bg-amber-50 border border-dashed border-amber-200 rounded-lg flex flex-col items-center">
                <AudioRecorder onAudioReady={handleAudioReady} />
                <p className="text-sm text-amber-700 mt-2">Gravando áudio...</p>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-b border-amber-100 pb-2">
              <div className="flex space-x-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-amber-500 text-white"
                        : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowAudioRecorder(!showAudioRecorder)}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center space-x-1 ${
                  showAudioRecorder
                    ? "bg-amber-500 text-white"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                <Mic className="h-3.5 w-3.5" />
                <span>Gravar</span>
              </button>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {filteredFiles.map((file, index) => (
                  <FilePreview
                    key={index}
                    file={file}
                    onRemove={() => handleRemoveFile(index)}
                  />
                ))}

                <div className="flex justify-end mt-4 pt-3 border-t border-amber-100">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors mr-2"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAttach}
                    className="px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                  >
                    Anexar {selectedFiles.length}{" "}
                    {selectedFiles.length === 1 ? "arquivo" : "arquivos"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
