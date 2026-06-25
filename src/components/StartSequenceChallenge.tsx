import React, { useState, useRef } from 'react';
import { AlertTriangle, CheckCircle2, Play } from 'lucide-react';
import { useSound } from '@/context/SoundContext';

interface StartSequenceChallengeProps {
  user: any;
  updateUserMetadata: (data: any) => void;
  setLeaderboardScores: React.Dispatch<React.SetStateAction<any[]>>;
  setLiveSpeed: (speed: number) => void;
  setLiveGear: (gear: string) => void;
}

export const StartSequenceChallenge: React.FC<StartSequenceChallengeProps> = ({
  user,
  updateUserMetadata,
  setLeaderboardScores,
  setLiveSpeed,
  setLiveGear,
}) => {
  const { playSound } = useSound();
  const [startLightsState, setStartLightsState] = useState<number>(0);
  const [startStatus, setStartStatus] = useState<'idle' | 'arming' | 'ready' | 'dropped' | 'penalty' | 'success'>('idle');
  const [reactionTimeMs, setReactionTimeMs] = useState<number | null>(null);
  
  const sequenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimestampRef = useRef<number>(0);

  const initiateStartSequence = () => {
    playSound('engine-rev');
    setStartStatus('arming');
    setStartLightsState(0);
    setReactionTimeMs(null);
    setLiveSpeed(0);
    setLiveGear('1');

    // Sequential lighting routine
    let currentLight = 0;
    const interval = setInterval(() => {
      currentLight++;
      setStartLightsState(currentLight);
      playSound('click');

      if (currentLight >= 5) {
        clearInterval(interval);
        // Random wait timer mapping professional FIA standard starter routines
        const randomHold = 600 + Math.random() * 2000;
        sequenceTimerRef.current = setTimeout(() => {
          setStartLightsState(0); // LIGHTS OUT!
          setStartStatus('dropped');
          startTimestampRef.current = performance.now();
          playSound('gear-shift');
        }, randomHold);
      }
    }, 800);
  };

  const executeClutchDrop = () => {
    const clickTime = performance.now();

    if (startStatus === 'arming') {
      // Jumped start! Trigger penalty logic
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
      setStartStatus('penalty');
      playSound('pit-stop');
    } else if (startStatus === 'dropped') {
      // Successful reaction strike
      const reactMs = Math.round(clickTime - startTimestampRef.current);
      setReactionTimeMs(reactMs);
      setStartStatus('success');
      setLiveSpeed(312);
      setLiveGear('8');
      playSound('engine-rev');

      updateUserMetadata({ best_drs_time: `${reactMs} ms` });

      // Append score directly to active custom dynamic sectors list
      setLeaderboardScores(prev => [
        { id: user?.user_metadata?.full_name?.substring(0,8)?.toUpperCase() || 'YOU-P1', type: 'Reaction Launch', score: `${reactMs} ms`, time: 'Sector 1 / Golden' },
        ...prev.slice(0, 4)
      ]);
    }
  };

  return (
    <div className="space-y-6 flex-1 flex flex-col justify-between">
      <div className="text-center space-y-1">
        <span className="font-orbitron text-[9px] font-bold text-white/40 tracking-widest uppercase block">
          REACTION LAUNCH INITIATION SEQUENCE
        </span>
        <p className="text-xs font-mono text-white/60 max-w-md mx-auto">
          Wait for all 5 red grid lights to arm. Strike the launcher button the absolute millisecond the lights extinguish!
        </p>
      </div>

      {/* 5 Classic Red Lights Visualizer base */}
      <div className="glass p-4 rounded-xl border border-white/5 flex justify-center items-center gap-3 sm:gap-6 max-w-md mx-auto w-full bg-black/80">
        {Array.from({ length: 5 }).map((_, idx) => {
          const isLit = startLightsState > idx;
          return (
            <div key={idx} className="space-y-2 text-center">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white/10 mx-auto transition-all duration-75 relative flex items-center justify-center"
                style={{
                  backgroundColor: isLit ? '#E10600' : '#111',
                  boxShadow: isLit ? '0 0 25px #E10600, inset 0 0 10px #ffaaaa' : 'none'
                }}
              >
                <div className="w-1/2 h-1/2 rounded-full bg-white/10 top-1 absolute" />
              </div>
              <span className="font-mono text-[8px] text-white/30 block">G{idx+1}</span>
            </div>
          );
        })}
      </div>

      {/* Status feedback announcements */}
      <div className="text-center h-8 flex items-center justify-center">
        {startStatus === 'arming' && <span className="font-orbitron text-xs font-bold text-pit-yellow tracking-widest uppercase animate-pulse">ARMING GRID LIGHTS... DO NOT JUMP</span>}
        {startStatus === 'dropped' && <span className="font-orbitron text-sm font-black text-green-400 tracking-[0.3em] uppercase animate-bounce">✦✦ STRIKE CLUTCH NOW ✦✦</span>}
        {startStatus === 'penalty' && <span className="font-orbitron text-xs font-black text-racing-red tracking-widest uppercase flex items-center gap-1"><AlertTriangle size={12} /> FALSE START PENALTY RECORDED</span>}
        {startStatus === 'success' && (
          <span className="font-orbitron text-sm font-black text-white tracking-wider flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-400" /> 
            REACTION SPEED: <span className="text-green-400">{reactionTimeMs} MS</span>
          </span>
        )}
      </div>

      {/* Main Action Controllers */}
      <div className="flex gap-3 max-w-md mx-auto w-full">
        {startStatus === 'idle' || startStatus === 'penalty' || startStatus === 'success' ? (
          <button onClick={initiateStartSequence} className="btn-racing w-full !py-3 flex items-center justify-center gap-2 text-xs tracking-widest">
            <Play size={14} /> <span>ARM FIVE RED LIGHTS</span>
          </button>
        ) : (
          <button 
            onClick={executeClutchDrop} 
            className={`w-full py-4 rounded-xl font-orbitron font-black text-xs tracking-widest uppercase transition-all shadow-2xl ${
              startStatus === 'dropped' 
                ? 'bg-green-500 hover:bg-green-400 text-black scale-105 shadow-[0_0_30px_rgba(34,197,94,0.5)]' 
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <span>DROP CLUTCH / LAUNCH CHASSIS</span>
          </button>
        )}
      </div>
    </div>
  );
};
