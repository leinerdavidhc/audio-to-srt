
import React, { useRef } from 'react';
import { UploadIcon, SparklesIcon } from './Icons';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  onTranscribe: () => void;
  isLoading: boolean;
  disabled: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange, onTranscribe, isLoading, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".mp3,.wav,.m4a,.ogg,.flac"
        className="hidden"
      />
      <button
        onClick={handleButtonClick}
        className="w-full sm:w-auto flex items-center justify-center px-5 py-3 border-2 border-dashed border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-all duration-300"
      >
        <UploadIcon className="w-5 h-5 mr-2" />
        {isLoading ? 'Processing...' : 'Select Audio File'}
      </button>
      <button
        onClick={onTranscribe}
        disabled={disabled || isLoading}
        className="w-full sm:w-auto flex items-center justify-center px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        <SparklesIcon className="w-5 h-5 mr-2" />
        {isLoading ? 'Transcribing...' : 'Transcribe Audio'}
      </button>
    </div>
  );
};

export default FileUpload;
