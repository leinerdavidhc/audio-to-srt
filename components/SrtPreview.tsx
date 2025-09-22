
import React from 'react';

interface SrtPreviewProps {
  srtContent: string;
}

const SrtPreview: React.FC<SrtPreviewProps> = ({ srtContent }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl shadow-lg p-4 sm:p-6 h-[60vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-200 sticky top-0 bg-gray-800/50 pb-2 -mt-4 pt-4 z-10">SRT Preview</h2>
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
            <code>
                {srtContent}
            </code>
        </pre>
    </div>
  );
};

export default SrtPreview;
