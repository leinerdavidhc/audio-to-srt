
import React from 'react';

interface AudioPlayerProps {
  src: string;
  audioRef: React.RefObject<HTMLAudioElement>;
  onTimeUpdate: (event: React.SyntheticEvent<HTMLAudioElement, Event>) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, audioRef, onTimeUpdate }) => {
  return (
    <div className="mt-6 w-full">
        <audio
            ref={audioRef}
            src={src}
            controls
            onTimeUpdate={onTimeUpdate}
            className="w-full rounded-lg"
        >
            Your browser does not support the audio element.
        </audio>
    </div>
  );
};

export default AudioPlayer;
