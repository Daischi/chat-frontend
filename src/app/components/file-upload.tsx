import { useState, useRef, useCallback, DragEvent } from "react";
import { Upload, File } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  multiple?: boolean;
}

export default function FileUpload({
  onFilesSelected,
  maxFileSize = 50, // Default 50MB
  acceptedFileTypes,
  multiple = true,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFiles = (fileList: FileList) => {
    const validFiles: File[] = [];
    const fileArray = Array.from(fileList);

    for (const file of fileArray) {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        console.error(`File too large: ${file.name}`);
        alert(`${file.name} excede o tamanho máximo de ${maxFileSize}MB`);
        continue;
      }

      // Check file type if specified
      if (acceptedFileTypes && acceptedFileTypes.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fileType = file.type.split("/")[0];
        const fileExtension = file.name.split(".").pop()?.toLowerCase();

        if (
          !acceptedFileTypes.some(
            (type) =>
              file.type.includes(type) ||
              (fileExtension && type.includes(fileExtension))
          )
        ) {
          console.error(`Unsupported file type: ${file.name}`);
          alert(`Tipo de arquivo não suportado: ${file.name}`);
          continue;
        }
      }

      validFiles.push(file);
    }

    return validFiles;
  };

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const validFiles = validateFiles(e.dataTransfer.files);
        if (validFiles.length > 0) {
          onFilesSelected(validFiles);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onFilesSelected, maxFileSize, acceptedFileTypes]
  );

  const handleFileInputChange = useCallback(() => {
    if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
      const validFiles = validateFiles(fileInputRef.current.files);
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFilesSelected, maxFileSize, acceptedFileTypes]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative ${isDragging ? "cursor-copy" : "cursor-pointer"}`}
      onClick={triggerFileInput}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple={multiple}
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`absolute inset-0 z-30 transition-opacity duration-300 pointer-events-none ${
          isDragging ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-sm rounded-lg border-2 border-dashed border-amber-400 flex items-center justify-center">
          <div className="text-center p-4">
            <Upload className="mx-auto h-10 w-10 text-amber-600 mb-2" />
            <p className="text-amber-800 font-medium">Solte os arquivos aqui</p>
          </div>
        </div>
      </div>

      <div className="text-amber-500 hover:text-amber-600 transition-colors">
        <Upload className="h-5 w-5" />
      </div>
    </div>
  );
}
