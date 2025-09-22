import React, { useEffect, useRef } from 'react';
import { SubtitleLine as SubtitleLineType } from '../types';
import SubtitleLine from './SubtitleLine';

interface SubtitleEditorProps {
  subtitles: SubtitleLineType[];
  currentTime: number;
  onUpdate: (id: number, newSubtitle: Partial<SubtitleLineType>) => void;
  onAdd: (afterId: number) => void;
  onDelete: (id: number) => void;
  onLineClick: (subtitle: SubtitleLineType) => void;
  maxCharsPerLine: number;
  charsPerSecond: number;
}

const SubtitleEditor: React.FC<SubtitleEditorProps> = ({ subtitles, currentTime, onUpdate, onAdd, onDelete, onLineClick, maxCharsPerLine, charsPerSecond }) => {
  const activeLineRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const activeSubtitle = subtitles.find(sub => currentTime >= sub.start && currentTime <= sub.end);

  useEffect(() => {
    if (activeLineRef.current && editorRef.current) {
        const editor = editorRef.current;
        const activeLine = activeLineRef.current;
        
        const editorRect = editor.getBoundingClientRect();
        const lineRect = activeLine.getBoundingClientRect();
        
        // Check if the active line is not fully visible
        if (lineRect.top < editorRect.top || lineRect.bottom > editorRect.bottom) {
             activeLine.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }
    }
  }, [activeSubtitle]);


  return (
    <div ref={editorRef} className="bg-gray-800/50 rounded-xl shadow-lg p-4 sm:p-6 h-[60vh] overflow-y-auto scroll-smooth">
        <h2 className="text-xl font-bold mb-4 text-gray-200 sticky top-0 bg-gray-800/50 pb-2 -mt-4 pt-4 z-10">Edit Subtitles</h2>
        <div className="space-y-4">
            {subtitles.map((sub, index) => {
                const isActive = activeSubtitle ? sub.id === activeSubtitle.id : false;
                return (
                    <SubtitleLine
                        ref={isActive ? activeLineRef : null}
                        key={sub.id}
                        index={index + 1}
                        subtitle={sub}
                        isActive={isActive}
                        onUpdate={onUpdate}
                        onAdd={onAdd}
                        onDelete={onDelete}
                        onClick={() => onLineClick(sub)}
                        maxCharsPerLine={maxCharsPerLine}
                        charsPerSecond={charsPerSecond}
                    />
                );
            })}
        </div>
    </div>
  );
};

export default SubtitleEditor;