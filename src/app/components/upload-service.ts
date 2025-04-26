interface UploadProgressCallback {
  (progress: number): void;
}

interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  error?: string;
}

export default class UploadService {
  static async uploadFile(
    file: File,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onProgress?: UploadProgressCallback
  ): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/upload_file.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        return {
          success: true,
          fileUrl: `http://localhost:8000/${data.file_url}`,
          fileName: data.file_name,
          fileType: data.file_type,
          fileSize: data.file_size,
        };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error uploading file",
      };
    }
  }

  static async uploadMultipleFiles(
    files: File[],
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const result = await this.uploadFile(files[i], (progress) => {
        if (onProgress) {
          onProgress(i, progress);
        }
      });

      results.push(result);
    }

    return results;
  }
}
