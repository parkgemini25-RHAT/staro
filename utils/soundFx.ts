// Self-hosted sound effects synthesized with the Web Audio API.
// Replaces hotlinked mixkit preview mp3s — no assets, no licensing, works offline.

let audioCtx: AudioContext | null = null;
let muted = false;

const ctx = (): AudioContext => {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
};

export const setSfxMuted = (value: boolean) => { muted = value; };

// Short white-noise buffer, shared by the percussive card sounds
let noiseBuffer: AudioBuffer | null = null;
const getNoiseBuffer = (ac: AudioContext): AudioBuffer => {
  if (noiseBuffer) return noiseBuffer;
  const buffer = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
};

// Filtered noise burst — the "snap" of a card being flicked
const playNoiseBurst = (ac: AudioContext, time: number, duration: number, freq: number, gainValue: number) => {
  const source = ac.createBufferSource();
  source.buffer = getNoiseBuffer(ac);
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 1.2;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(gainValue, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  source.connect(filter).connect(gain).connect(ac.destination);
  source.start(time);
  source.stop(time + duration);
};

// Soft bell tone for the mystical start chime
const playTone = (ac: AudioContext, time: number, freq: number, duration: number, gainValue: number) => {
  const osc = ac.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = freq;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(gainValue, time + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(time);
  osc.stop(time + duration);
};

// Reading start: ascending mystical chime (A5 → C#6 → E6 with shimmer)
export const playStartChime = () => {
  if (muted) return;
  try {
    const ac = ctx();
    const t = ac.currentTime;
    playTone(ac, t, 880, 1.2, 0.12);
    playTone(ac, t + 0.12, 1108.7, 1.1, 0.1);
    playTone(ac, t + 0.26, 1318.5, 1.4, 0.09);
    playTone(ac, t + 0.26, 2637, 1.2, 0.03); // sparkle overtone
  } catch { /* audio unavailable — stay silent */ }
};

// Card pick: crisp flick
export const playCardFlick = () => {
  if (muted) return;
  try {
    const ac = ctx();
    const t = ac.currentTime;
    playNoiseBurst(ac, t, 0.09, 2600, 0.5);
    playNoiseBurst(ac, t + 0.02, 0.07, 900, 0.25);
  } catch { /* noop */ }
};

// Shuffle: rapid riffle of noise ticks
export const playShuffleRiffle = () => {
  if (muted) return;
  try {
    const ac = ctx();
    const t = ac.currentTime;
    for (let i = 0; i < 9; i++) {
      const jitter = Math.random() * 0.015;
      playNoiseBurst(ac, t + i * 0.055 + jitter, 0.05, 1500 + Math.random() * 1400, 0.28);
    }
  } catch { /* noop */ }
};
