import React from 'react';
import { useReadingProgress } from '@/hooks/useReadingProgress';

export const ReadingProgressBar: React.FC = () => {
  const progress = useReadingProgress();

  return (
    <div
      className="fixed top-0 left-0 z-50 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400"
      style={{ width: `${progress}%` }}
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    />
  );
};
