import React from 'react';

interface SettingsProps {
  maxCharsPerLine: number;
  setMaxCharsPerLine: (value: number) => void;
}

const Settings: React.FC<SettingsProps> = ({ maxCharsPerLine, setMaxCharsPerLine }) => {
  return (
    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-200 border-b border-gray-700 pb-3">Subtitle Settings</h2>
      <div className="pt-4">
        <div>
          <label htmlFor="maxChars" className="block text-sm font-medium text-gray-300 mb-2">
            Max Characters per Line: <span className="font-bold text-blue-400">{maxCharsPerLine}</span>
          </label>
          <input
            id="maxChars"
            type="range"
            min="0"
            max="100"
            value={maxCharsPerLine}
            onChange={(e) => setMaxCharsPerLine(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            aria-label="Set maximum characters per line"
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
