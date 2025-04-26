import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Truck as Duck, Upload } from "lucide-react";
import { motion } from "framer-motion";

interface FileDropZoneProps {
  onDrop: (files: File[]) => void;
}

export default function FileDropZone({ onDrop }: FileDropZoneProps) {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: {
      "image/*": [],
      "video/*": [],
      "audio/*": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [],
      "application/zip": [],
      "application/x-rar-compressed": [],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`p-8 border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer
        ${
          isDragActive
            ? "border-amber-400 bg-amber-50"
            : "border-amber-200 hover:border-amber-300 hover:bg-amber-50/50"
        }`}
    >
      <input {...getInputProps()} />
      <motion.div
        animate={
          isDragActive
            ? {
                y: [0, -10, 0],
                rotate: [0, -5, 5, 0],
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{ duration: 1, repeat: isDragActive ? Infinity : 0 }}
        className="flex flex-col items-center gap-3"
      >
        {isDragActive ? (
          <Duck className="h-12 w-12 text-amber-500" />
        ) : (
          <Upload className="h-12 w-12 text-amber-400" />
        )}
        <div className="space-y-1">
          <p className="text-sm font-medium text-amber-900">
            {isDragActive
              ? "Quack! Solte seus arquivos aqui!"
              : "Arraste e solte seus arquivos aqui"}
          </p>
          <p className="text-xs text-amber-600">ou clique para selecionar</p>
        </div>
      </motion.div>
    </div>
  );
}
