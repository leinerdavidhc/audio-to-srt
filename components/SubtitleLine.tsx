import React, { forwardRef } from 'react';
import { SubtitleLine as SubtitleLineType } from '../types';
import { formatTime, parseTime } from '../utils/time';
import { PlusIcon, TrashIcon, ClockIcon } from './Icons';

interface SubtitleLineProps {
  index: number;
  subtitle: SubtitleLineType;
  isActive: boolean;
  onUpdate: (id: number, newSubtitle: Partial<SubtitleLineType>) => void;
  onAdd: (afterId: number) => void;
  onDelete: (id: number) => void;
  onClick: () => void;
  maxCharsPerLine: number;
  charsPerSecond: number;
}

const SubtitleLine = forwardRef<HTMLDivElement, SubtitleLineProps>(({ index, subtitle, isActive, onUpdate, onAdd, onDelete, onClick, maxCharsPerLine, charsPerSecond }, ref) => {
    
    const handleTimeChange = (field: 'start' | 'end', value: string) => {
        onUpdate(subtitle.id, { [field]: parseTime(value) });
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdate(subtitle.id, { text: e.target.value });
    };

    const isCharLimitExceeded = subtitle.text.length > maxCharsPerLine && maxCharsPerLine > 0;

    const requiredDuration = Math.ceil((subtitle.text.length / charsPerSecond) * 1000);
    const currentDuration = subtitle.end - subtitle.start;
    const isTimingIssue = currentDuration > 0 && currentDuration < requiredDuration && subtitle.text.length > 0;

    const handleAutoAdjustTiming = () => {
        const newEnd = subtitle.start + requiredDuration;
        onUpdate(subtitle.id, { end: newEnd });
    };

  return (
    <div 
        ref={ref}
        onClick={onClick}
        className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${isActive ? 'bg-blue-900/50 ring-2 ring-blue-500' : 'bg-gray-700/50 hover:bg-gray-700'}`}
    >
      <div className="flex items-start sm:items-center justify-between mb-2 flex-col sm:flex-row gap-2">
        <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-sm font-semibold text-gray-400 w-6 text-center">{index}</span>
            <input
                type="text"
                value={formatTime(subtitle.start)}
                onChange={(e) => handleTimeChange('start', e.target.value)}
                className={`bg-gray-800 text-gray-200 text-sm rounded-md px-2 py-1 w-28 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isTimingIssue ? 'border-yellow-500' : 'border-gray-600'}`}
                title={isTimingIssue ? 'Warning: Duration may be too short for the text.' : 'Start time'}
            />
            <span className="text-gray-500">→</span>
            <div className="relative flex items-center">
                <input
                    type="text"
                    value={formatTime(subtitle.end)}
                    onChange={(e) => handleTimeChange('end', e.target.value)}
                    className={`bg-gray-800 text-gray-200 text-sm rounded-md px-2 py-1 w-28 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isTimingIssue ? 'border-yellow-500' : 'border-gray-600'}`}
                    title={isTimingIssue ? `Warning: Duration may be too short. Recommended end time is approx. ${formatTime(subtitle.start + requiredDuration)}` : 'End time'}
                />
                {isTimingIssue && (
                    <button 
                        onClick={handleAutoAdjustTiming} 
                        className="absolute right-1 p-0.5 text-yellow-400 hover:text-yellow-200 bg-gray-800 rounded-full" 
                        title={`Auto-adjust end time to ${formatTime(subtitle.start + requiredDuration)}`}
                    >
                        <ClockIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
        <div className="flex items-center space-x-2 self-end sm:self-center">
             {maxCharsPerLine > 0 && (
                <span className={`text-xs font-mono ${isCharLimitExceeded ? 'text-red-400' : 'text-gray-400'}`}>
                    {subtitle.text.length}/{maxCharsPerLine}
                </span>
            )}
            <button onClick={(e) => { e.stopPropagation(); onAdd(subtitle.id); }} className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-gray-600 rounded-full transition-colors" title="Add subtitle after this">
                <PlusIcon className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(subtitle.id); }} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded-full transition-colors" title="Delete this subtitle">
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
      <textarea
        value={subtitle.text}
        onChange={handleTextChange}
        rows={2}
        className={`w-full bg-gray-800 text-gray-100 rounded-md p-2 mt-1 border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isCharLimitExceeded ? 'border-red-500' : 'border-gray-600'}`}
      />
    </div>
  );
});

export default SubtitleLine;