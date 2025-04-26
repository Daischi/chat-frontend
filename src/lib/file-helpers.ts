/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Gets a generic file type from a mime type or file extension
 * @param fileType The file's MIME type or extension
 * @returns A simplified file type category
 */
export function getFileType(
  fileType: string,
  fileName: string
): "image" | "video" | "audio" | "document" | "archive" | "other" {
  const type = fileType.toLowerCase();
  const name = fileName.toLowerCase();

  if (type.startsWith("image/")) return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";

  // Check for documents
  if (
    type.includes("pdf") ||
    type.includes("word") ||
    type.includes("document") ||
    type.includes("spreadsheet") ||
    type.includes("presentation") ||
    name.endsWith(".pdf") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx") ||
    name.endsWith(".xls") ||
    name.endsWith(".xlsx") ||
    name.endsWith(".ppt") ||
    name.endsWith(".pptx") ||
    name.endsWith(".txt")
  ) {
    return "document";
  }

  // Check for archives
  if (
    type.includes("zip") ||
    type.includes("rar") ||
    type.includes("compressed") ||
    type.includes("archive") ||
    name.endsWith(".zip") ||
    name.endsWith(".rar") ||
    name.endsWith(".7z") ||
    name.endsWith(".tar") ||
    name.endsWith(".gz")
  ) {
    return "archive";
  }

  return "other";
}

/**
 * Validates a file's type against a list of accepted types
 * @param file The file to validate
 * @param acceptedTypes Array of accepted MIME types or extensions
 * @returns Boolean indicating if the file is valid
 */
export function validateFileType(file: File, acceptedTypes: string[]): boolean {
  if (!acceptedTypes || acceptedTypes.length === 0) return true;

  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split(".").pop() || "";

  return acceptedTypes.some(
    (type) =>
      fileType.includes(type.toLowerCase()) ||
      `.${fileExtension}` === type.toLowerCase()
  );
}

/**
 * Creates a mock download URL for demonstration purposes
 * In a real application, this would be replaced with actual file URLs
 * @param file The file object
 * @returns A fake download URL
 */
export function createMockDownloadUrl(file: File): string {
  // In a real application, this would be a server URL
  return URL.createObjectURL(file);
}
