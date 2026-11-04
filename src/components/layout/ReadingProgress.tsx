import React, { useEffect, useState } from 'react';

export const ReadingProgress: React.FC = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-[#EBE6D6]">
      <div
        className="h-full bg-gradient-to-r from-[#256B3A] via-[#32864A] to-[#BFDC28] transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

