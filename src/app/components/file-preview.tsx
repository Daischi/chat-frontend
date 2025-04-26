/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import {
  File,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  X,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/file-helpers";

interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
  isUploading?: boolean;
  progress?: number;
  uploadComplete?: boolean;
  downloadUrl?: string;
  inChat?: boolean;
}

export default function FilePreview({
  file,
  onRemove,
  isUploading = false,
  progress = 0,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  uploadComplete = false,
  downloadUrl,
  inChat = false,
}: FilePreviewProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Generate preview for image files
  useState(() => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  });

  const getFileIcon = () => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else if (fileType.startsWith("video/")) {
      return <VideoIcon className="h-6 w-6 text-red-500" />;
    } else if (fileType.startsWith("audio/")) {
      return <Music className="h-6 w-6 text-purple-500" />;
    } else if (fileType.includes("pdf") || fileName.endsWith(".pdf")) {
      return <FileText className="h-6 w-6 text-red-600" />;
    } else if (
      fileType.includes("word") ||
      fileType.includes("document") ||
      fileName.endsWith(".doc") ||
      fileName.endsWith(".docx")
    ) {
      return <FileText className="h-6 w-6 text-blue-600" />;
    } else if (
      fileType.includes("zip") ||
      fileType.includes("rar") ||
      fileType.includes("compressed") ||
      fileName.endsWith(".zip") ||
      fileName.endsWith(".rar")
    ) {
      return <File className="h-6 w-6 text-amber-600" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  const isAudio = file.type.startsWith("audio/");

  const handlePreviewClick = () => {
    if (isImage || isVideo || isAudio) {
      setShowPreview(true);
    }
  };

  return (
    <>
      <div
        className={`group relative ${
          inChat ? "max-w-xs" : "w-full"
        } bg-white rounded-lg border border-amber-200 overflow-hidden shadow-sm ${
          isUploading ? "animate-pulse" : ""
        }`}
      >
        <div className="flex items-start p-3">
          <div className="flex-shrink-0 mr-3">
            {isImage && preview ? (
              <div
                className="w-12 h-12 rounded bg-gray-100 overflow-hidden cursor-pointer"
                onClick={handlePreviewClick}
              >
                <img
                  src={preview}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded bg-amber-50 flex items-center justify-center">
                {getFileIcon()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium text-gray-800 truncate"
              title={file.name}
            >
              {file.name}
            </p>
            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                <div
                  className="bg-amber-500 h-1.5 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>

          {onRemove && !inChat && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {inChat && downloadUrl && (
            <a
              href={downloadUrl}
              download={file.name}
              className="flex-shrink-0 ml-2 text-amber-500 hover:text-amber-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-4 w-4" />
            </a>
          )}

          {(isImage || isVideo || isAudio) && inChat && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePreviewClick();
              }}
              className="flex-shrink-0 ml-2 text-amber-500 hover:text-amber-600 transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {showPreview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full overflow-auto">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowPreview(false);
              }}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 text-white bg-black/40 hover:bg-black/60 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>

            {isImage && preview && (
              <img
                src={preview}
                alt={file.name}
                className="max-w-full max-h-[80vh] object-contain mx-auto rounded-lg"
              />
            )}

            {isVideo && (
              <video
                src={URL.createObjectURL(file)}
                controls
                className="max-w-full max-h-[80vh] mx-auto rounded-lg"
              />
            )}

            {isAudio && (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="font-medium text-lg mb-3 text-gray-800">
                  {file.name}
                </h3>
                <audio
                  src={URL.createObjectURL(file)}
                  controls
                  className="w-full"
                />
              </div>
            )}

            <div className="mt-4 flex justify-center">
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={file.name}
                  className="px-4 py-2 bg-amber-500 text-white rounded-md flex items-center space-x-2 hover:bg-amber-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
