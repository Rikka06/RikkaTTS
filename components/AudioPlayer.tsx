import React, { useRef, useState } from 'react';
import { Play, Pause, Download, Coins } from 'lucide-react';
import { formatTime, formatCost } from '../utils/audioUtils';

interface AudioPlayerProps {
  audioUrl: string;
  text: string;
  cost?: number;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl, text, cost }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      const d = audioRef.current.duration;
      if (!isNaN(d) && d !== Infinity) {
        setDuration(d);
      }
    }
  };

  const onEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if(audioRef.current) audioRef.current.currentTime = 0;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `rikka-tts-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-purple-200/50 transition-all duration-300">
      
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl group-hover:bg-purple-300/40 transition-colors"></div>

      <div className="p-5 relative z-10">
        {/* Text Content */}
        <div className="mb-5">
           <p className="text-gray-700 text-sm font-medium leading-relaxed font-sans opacity-90">
             {text}
           </p>
           {/* Metadata / Cost Tag */}
           <div className="flex items-center gap-3 mt-3">
             {cost !== undefined && (
               <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100/50 text-xs font-semibold text-purple-700 shadow-sm">
                 <Coins className="w-3 h-3" />
                 {formatCost(cost)}
               </div>
             )}
             <div className="text-[10px] text-gray-400 font-mono tracking-wide">
                UTF-8 PAYLOAD
             </div>
           </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-4 select-none">
          <button 
            onClick={togglePlay}
            className="w-10 h-10 flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-200 hover:scale-105 active:scale-95 transition-all focus:outline-none"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Progress Bar Area */}
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="relative h-2 flex items-center w-full group/slider cursor-pointer">
              {/* Native Input for interaction */}
              <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  step="0.01"
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute w-full h-full opacity-0 z-20 cursor-pointer"
              />
              
              {/* Background Track */}
              <div className="absolute w-full h-1.5 bg-gray-200/70 rounded-full overflow-hidden z-10">
                  {/* Fill */}
                  <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-100 ease-out"
                      style={{ width: `${progressPercent}%` }}
                  ></div>
              </div>
              
              {/* Thumb (only visible on hover/active) */}
              <div 
                  className="absolute h-3 w-3 bg-white border-2 border-purple-500 rounded-full z-10 shadow-sm transform -translate-x-1.5 opacity-0 group-hover/slider:opacity-100 transition-opacity pointer-events-none"
                  style={{ left: `${progressPercent}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-[10px] font-mono text-gray-400 px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="w-px h-6 bg-gray-200/60 mx-1"></div>

          <button 
            onClick={handleDownload}
            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Download Audio"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <audio 
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        className="hidden"
      />
    </div>
  );
};