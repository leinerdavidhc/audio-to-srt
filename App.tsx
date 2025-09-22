import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SubtitleLine } from './types';
import { transcribeAudioWithTimestamps } from './services/geminiService';
import { formatTime } from './utils/time';
import FileUpload from './components/FileUpload';
import AudioPlayer from './components/AudioPlayer';
import SubtitleEditor from './components/SubtitleEditor';
import SrtPreview from './components/SrtPreview';
import Settings from './components/Settings';
import { LoaderIcon, DownloadIcon, AlertTriangleIcon } from './components/Icons';

const App: React.FC = () => {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [audioDuration, setAudioDuration] = useState<number>(0); // in milliseconds
    const [subtitles, setSubtitles] = useState<SubtitleLine[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState<number>(0);

    // Subtitle settings
    const [maxCharsPerLine, setMaxCharsPerLine] = useState<number>(42);
    const charsPerSecond = 15; // Reading speed is now a fixed value.

    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        if (audioFile) {
            const url = URL.createObjectURL(audioFile);
            setAudioUrl(url);
            const audio = new Audio(url);
            audio.onloadedmetadata = () => {
                setAudioDuration(audio.duration * 1000); // convert to ms
            };
            return () => {
                URL.revokeObjectURL(url);
            };
        }
    }, [audioFile]);
    
    const handleFileChange = (file: File | null) => {
        if(file){
            setAudioFile(file);
            setSubtitles([]);
            setError(null);
            setCurrentTime(0);
        }
    };

    const handleTranscription = useCallback(async () => {
        if (!audioFile) {
            setError("Please select an audio file first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSubtitles([]);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioFile);
            reader.onload = async () => {
                const base64Audio = (reader.result as string).split(',')[1];
                const mimeType = audioFile.type;
                
                // Use the new service to get subtitles with timestamps directly
                const newSubtitles = await transcribeAudioWithTimestamps(base64Audio, mimeType, audioDuration / 1000);

                // Post-process to respect maxCharsPerLine if needed
                const finalSubtitles: SubtitleLine[] = [];
                newSubtitles.forEach(sub => {
                    if (sub.text.length <= maxCharsPerLine || maxCharsPerLine === 0) {
                        finalSubtitles.push(sub);
                    } else {
                        // Split the text, and distribute the duration
                        const words = sub.text.split(' ');
                        let currentLine = '';
                        const lines = [];
                        for (const word of words) {
                            if ((currentLine + ' ' + word).trim().length > maxCharsPerLine) {
                                lines.push(currentLine.trim());
                                currentLine = word;
                            } else {
                                currentLine = (currentLine + ' ' + word).trim();
                            }
                        }
                        lines.push(currentLine.trim());

                        const totalLength = sub.text.length;
                        const duration = sub.end - sub.start;
                        let timeOffset = 0;

                        lines.forEach((line, index) => {
                            const lineRatio = line.length / totalLength;
                            const lineDuration = Math.round(duration * lineRatio);
                            const newStart = sub.start + timeOffset;
                            const newEnd = newStart + lineDuration;
                            
                            finalSubtitles.push({
                                id: sub.id + index * 10000, // ensure unique id
                                start: newStart,
                                end: newEnd,
                                text: line
                            });
                            timeOffset += lineDuration;
                        });
                    }
                });


                setSubtitles(finalSubtitles);
                setIsLoading(false);
            };
            reader.onerror = () => {
                setError("Failed to read the audio file.");
                setIsLoading(false);
            };
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during transcription.");
            setIsLoading(false);
        }
    }, [audioFile, audioDuration, maxCharsPerLine]);

    const updateSubtitle = (id: number, newSubtitle: Partial<SubtitleLine>) => {
        setSubtitles(prev => prev.map(sub => sub.id === id ? { ...sub, ...newSubtitle } : sub));
    };

    const addSubtitle = (afterId: number) => {
        setSubtitles(prev => {
            const newSubtitles = [...prev];
            const index = newSubtitles.findIndex(sub => sub.id === afterId);
            if (index !== -1) {
                const prevSub = newSubtitles[index];
                const newSub = { id: Date.now(), start: prevSub.end + 1, end: prevSub.end + 1001, text: '' };
                newSubtitles.splice(index + 1, 0, newSub);
            }
            return newSubtitles;
        });
    };

    const deleteSubtitle = (id: number) => {
        setSubtitles(prev => prev.filter(sub => sub.id !== id));
    };

    const generateSrtContent = () => {
        return subtitles.map((sub, index) => 
            `${index + 1}\n${formatTime(sub.start)} --> ${formatTime(sub.end)}\n${sub.text}`
        ).join('\n\n');
    };

    const handleExport = () => {
        const srtContent = generateSrtContent();
        const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = audioFile?.name.replace(/\.[^/.]+$/, "") || 'subtitles';
        a.download = `${fileName}.srt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-600">
                        Audio to SRT Transcriber
                    </h1>
                    <p className="text-gray-400 mt-2">Upload, transcribe, edit, and export subtitles with ease.</p>
                </header>

                <main className="space-y-8">
                    <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                        <FileUpload onFileChange={handleFileChange} onTranscribe={handleTranscription} isLoading={isLoading} disabled={!audioFile} />
                        {error && (
                            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center">
                                <AlertTriangleIcon className="w-5 h-5 mr-2" />
                                <span>{error}</span>
                            </div>
                        )}
                        {audioUrl && <AudioPlayer src={audioUrl} audioRef={audioRef} onTimeUpdate={e => setCurrentTime(e.currentTarget.currentTime * 1000)} />}
                    </div>
                    
                    {(audioFile || subtitles.length > 0) && (
                        <Settings
                            maxCharsPerLine={maxCharsPerLine}
                            setMaxCharsPerLine={setMaxCharsPerLine}
                        />
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center p-10 bg-gray-800 rounded-xl shadow-lg">
                            <LoaderIcon className="w-12 h-12 animate-spin text-blue-400" />
                            <p className="mt-4 text-lg text-gray-300">Transcribing and syncing... this may take a moment.</p>
                        </div>
                    )}
                    
                    {subtitles.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <SubtitleEditor 
                                    subtitles={subtitles}
                                    currentTime={currentTime}
                                    onUpdate={updateSubtitle}
                                    onAdd={addSubtitle}
                                    onDelete={deleteSubtitle}
                                    onLineClick={(sub) => audioRef.current && (audioRef.current.currentTime = sub.start / 1000)}
                                    maxCharsPerLine={maxCharsPerLine}
                                    charsPerSecond={charsPerSecond}
                                />
                                <SrtPreview srtContent={generateSrtContent()} />
                            </div>
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={handleExport}
                                    className="flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                                >
                                    <DownloadIcon className="w-5 h-5 mr-2" />
                                    Export SRT File
                                </button>
                            </div>
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;