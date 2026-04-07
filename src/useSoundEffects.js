import { useCallback, useRef } from "react";

// Sound generation using Web Audio API
export function useSoundEffects() {
  const audioContextRef = useRef(null);

  const getContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (frequency, duration, type = "sine", volume = 0.15) => {
      try {
        const ctx = getContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + duration
        );

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch (e) {
        // Audio not available
      }
    },
    [getContext]
  );

  const playDrop = useCallback(() => {
    playTone(523, 0.12, "sine", 0.12);
    setTimeout(() => playTone(659, 0.1, "sine", 0.1), 60);
  }, [playTone]);

  const playPickup = useCallback(() => {
    playTone(440, 0.08, "triangle", 0.1);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    playTone(523, 0.15, "sine", 0.12);
    setTimeout(() => playTone(659, 0.15, "sine", 0.12), 120);
    setTimeout(() => playTone(784, 0.2, "sine", 0.15), 240);
    setTimeout(() => playTone(1047, 0.3, "sine", 0.12), 380);
  }, [playTone]);

  const playRemove = useCallback(() => {
    playTone(350, 0.1, "triangle", 0.08);
  }, [playTone]);

  return { playDrop, playPickup, playSuccess, playRemove };
}
