import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Play, Pause, Square, Headphones, Gauge } from 'lucide-react';

interface AudioArticlePlayerProps {
  title: string;
  content: string;
  audioUrl?: string;
  authorName?: string;
}

function extractSpokenSentences(text: string): string[] {
  const clean = (text || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#*`_~>[\]]/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split into manageable chunks by sentence delimiters
  const sentences = clean
    .split(/(?<=[.!?\n])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 3);

  return sentences;
}

export const AudioArticlePlayer: React.FC<AudioArticlePlayerProps> = ({
  title,
  content,
  audioUrl,
  authorName,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentences, setSentences] = useState<string[]>([]);
  const [isSupported, setIsSupported] = useState(true);

  // Native audio tag reference if custom audioUrl is used
  const audioTagRef = useRef<HTMLAudioElement | null>(null);

  // Speech synthesis tracking refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentencesRef = useRef<string[]>([]);
  const currentIndexRef = useRef(0);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!audioUrl && !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const list = [title, ...extractSpokenSentences(content)];
    setSentences(list);
    sentencesRef.current = list;

    return () => {
      stopPlayback();
    };
  }, [title, content, audioUrl]);

  const speakNextSentence = (index: number) => {
    if (!isPlayingRef.current) return;
    const list = sentencesRef.current;
    if (index >= list.length) {
      stopPlayback();
      return;
    }

    currentIndexRef.current = index;
    setCurrentSentenceIndex(index);

    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(list[index]);
    utteranceRef.current = utterance;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick best available English/Hindi or system voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred =
        voices.find(v => v.lang.startsWith('en-IN')) ||
        voices.find(v => v.lang.startsWith('en')) ||
        voices[0];
      if (preferred) utterance.voice = preferred;
    }

    utterance.onend = () => {
      if (isPlayingRef.current) {
        speakNextSentence(index + 1);
      }
    };

    utterance.onerror = (e) => {
      // Don't error out on intentional cancel
      if (e.error !== 'canceled' && isPlayingRef.current) {
        speakNextSentence(index + 1);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const startPlayback = () => {
    // 1. If custom MP3 audio URL exists, use HTML5 audio
    if (audioUrl && audioTagRef.current) {
      audioTagRef.current.playbackRate = rate;
      audioTagRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    // 2. Otherwise use SpeechSynthesis
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      isPlayingRef.current = true;
      return;
    }

    window.speechSynthesis.cancel();
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    speakNextSentence(currentIndexRef.current);
  };

  const pausePlayback = () => {
    if (audioUrl && audioTagRef.current) {
      audioTagRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
      return;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(true);
  };

  const stopPlayback = () => {
    if (audioUrl && audioTagRef.current) {
      audioTagRef.current.pause();
      audioTagRef.current.currentTime = 0;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isPlayingRef.current = false;
    currentIndexRef.current = 0;
    setCurrentSentenceIndex(0);
    setIsPlaying(false);
    setIsPaused(false);
  };

  const changeRate = (newRate: number) => {
    setRate(newRate);
    if (audioUrl && audioTagRef.current) {
      audioTagRef.current.playbackRate = newRate;
    }
    if (isPlaying && !audioUrl) {
      // Re-trigger current sentence at new speed
      speakNextSentence(currentIndexRef.current);
    }
  };

  if (!isSupported) return null;

  const total = sentences.length || 1;
  const progressPercent = Math.min(100, Math.round(((currentSentenceIndex + 1) / total) * 100));

  return (
    <div className="w-full bg-gradient-to-r from-[#143520] via-[#1A442A] to-[#143520] text-white p-4 sm:p-5 rounded-3xl border border-[#256B3A] shadow-md space-y-3.5 mb-8">
      {/* Hidden audio element if custom audio link is provided */}
      {audioUrl && (
        <audio
          ref={audioTagRef}
          src={audioUrl}
          onEnded={stopPlayback}
          onPause={() => {
            if (!audioTagRef.current?.ended) {
              setIsPlaying(false);
              setIsPaused(true);
            }
          }}
          onPlay={() => {
            setIsPlaying(true);
            setIsPaused(false);
          }}
        />
      )}

      {/* Header bar: Title & Live Equalizer / Status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#BFDC28] text-[#143520] flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-serif font-bold text-sm text-white flex items-center gap-2 leading-tight">
              <span>Aw Ngaithla Rawh</span>
              <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-[#1E542E] text-[#BFDC28] border border-[#256B3A]">
                {audioUrl ? 'Field Audio' : 'Narration'}
              </span>
            </h4>
            <p className="text-[11px] text-[#ADC6A7] truncate mt-0.5">
              {authorName ? `Ziaktu: ${authorName} — Aw chhiarna` : 'Thlai enkawl dan aw-in ngaithla rawh'}
            </p>
          </div>
        </div>

        {/* Animated equalizer waves when playing */}
        <div className="flex items-center gap-1 shrink-0 px-2 py-1 bg-black/20 rounded-full border border-white/10">
          <span className={`w-1 bg-[#BFDC28] rounded-full transition-all duration-200 ${isPlaying ? 'h-4 animate-bounce' : 'h-1.5'}`} />
          <span className={`w-1 bg-[#BFDC28] rounded-full transition-all duration-200 ${isPlaying ? 'h-5 animate-pulse' : 'h-2'}`} />
          <span className={`w-1 bg-[#BFDC28] rounded-full transition-all duration-200 ${isPlaying ? 'h-3 animate-bounce' : 'h-1.5'}`} />
          <span className="text-[10px] font-mono text-[#D7E3D5] ml-1.5 font-bold">
            {isPlaying ? 'PLAYING' : isPaused ? 'PAUSED' : 'READY'}
          </span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-black/30 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#86A838] to-[#BFDC28] h-full transition-all duration-300 rounded-full"
          style={{ width: `${isPlaying || isPaused ? progressPercent : 0}%` }}
        />
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              type="button"
              onClick={startPlayback}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#BFDC28] hover:bg-[#d5f33d] active:bg-[#a9c520] text-[#143520] font-bold text-xs transition-all shadow-xs hover:scale-102 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPaused ? 'Chhunzawm rawh' : 'Ngaithla rawh'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={pausePlayback}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#143520] font-bold text-xs transition-all shadow-xs hover:scale-102 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Chawlhtir rawh</span>
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              type="button"
              onClick={stopPlayback}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
              title="Stop audio playback"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#ADC6A7] font-mono ml-1">
            <Volume2 className="w-3.5 h-3.5 text-[#BFDC28]" />
            <span>{total > 1 ? `${progressPercent}%` : 'Voice Audio'}</span>
          </div>
        </div>

        {/* Speed Selector (0.8x, 1x, 1.2x) */}
        <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl border border-white/10 text-xs">
          <span className="text-[10px] text-[#ADC6A7] font-bold pl-2 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-[#BFDC28]" />
            <span className="hidden sm:inline">Chak zawng:</span>
          </span>
          {[0.8, 1.0, 1.2].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => changeRate(s)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                rate === s
                  ? 'bg-[#BFDC28] text-[#143520] shadow-xs'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
