import { useState } from 'react';
import { motion } from 'framer-motion';
import FilePreview from './file-preview';

interface Attachment {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  url: string;
  previewUrl?: string;
}

interface MessageAttachmentsProps {
  attachments: Attachment[];
  isCurrentUser: boolean;
}

export default function MessageAttachments({ 
  attachments, 
  isCurrentUser 
}: MessageAttachmentsProps) {
  const [expandGrid, setExpandGrid] = useState(false);
  
  if (!attachments || attachments.length === 0) return null;
  
  // Create File objects from attachment data
  const attachmentFiles = attachments.map(attachment => {
    // Create a File-like object from the attachment data
    const file = new File(
      [new Blob([], { type: attachment.fileType })], 
      attachment.fileName, 
      { type: attachment.fileType }
    );
    
    // Add size property using Object.defineProperty
    Object.defineProperty(file, 'size', {
      value: attachment.fileSize,
      writable: false
    });
    
    return {
      file,
      url: attachment.url,
      previewUrl: attachment.previewUrl || attachment.url
    };
  });
  
  // Determine grid layout based on number of attachments
  const getGridLayout = () => {
    if (attachments.length === 1) return 'grid-cols-1';
    if (attachments.length === 2) return 'grid-cols-2';
    if (attachments.length >= 3 && attachments.length <= 4) return expandGrid ? 'grid-cols-2' : 'grid-cols-2';
    return expandGrid ? 'grid-cols-3' : 'grid-cols-2';
  };
  
  // Limit the number of attachments shown if not expanded
  const visibleAttachments = expandGrid 
    ? attachmentFiles 
    : attachmentFiles.slice(0, 4);
  
  // Count of hidden attachments
  const hiddenCount = attachmentFiles.length - 4;
  
  return (
    <div className={`mt-1 mb-1 max-w-[260px] sm:max-w-md ${isCurrentUser ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`grid ${getGridLayout()} gap-1`}>
        {visibleAttachments.map((attachment, i) => (
          <div key={i} className="relative">
            <FilePreview
              file={attachment.file}
              downloadUrl={attachment.url}
              inChat={true}
            />
          </div>
        ))}
        
        {!expandGrid && hiddenCount > 0 && (
          <motion.div 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setExpandGrid(true)}
            className="flex items-center justify-center bg-amber-50 border border-amber-200 rounded-lg cursor-pointer p-4"
          >
            <span className="text-sm font-medium text-amber-700">
              +{hiddenCount} mais
            </span>
          </motion.div>
        )}
      </div>
      
      {expandGrid && attachments.length > 4 && (
        <button
          onClick={() => setExpandGrid(false)}
          className="mt-2 text-xs text-amber-600 hover:text-amber-700"
        >
          Mostrar menos
        </button>
      )}
    </div>
  );
}