
// Converts milliseconds to HH:MM:SS,ms format
export const formatTime = (totalMilliseconds: number): string => {
  if (isNaN(totalMilliseconds) || totalMilliseconds < 0) {
    return '00:00:00,000';
  }

  const hours = Math.floor(totalMilliseconds / 3600000);
  const minutes = Math.floor((totalMilliseconds % 3600000) / 60000);
  const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
  const milliseconds = Math.floor(totalMilliseconds % 1000);

  const pad = (num: number, size = 2) => num.toString().padStart(size, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`;
};

// Converts HH:MM:SS,ms format string to milliseconds
export const parseTime = (timeString: string): number => {
  const parts = timeString.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
  if (!parts) return 0;

  const [, hours, minutes, seconds, milliseconds] = parts.map(Number);
  
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
};
