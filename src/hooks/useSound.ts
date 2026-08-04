import { plinkoConfig } from "@/lib/env";
import { useCallback, useRef } from "react";

type SoundType = "drop" | "bounce" | "land" | "win" | "jackpot";
const PLINKO_BOUNCE_SAMPLE_URL = "/sounds/9cccf879-280f-471f-ac82-f6b213e3dc34.mp3";
const PLINKO_BOUNCE_SOUND_MODE: "sample" | "synth" = plinkoConfig.bounceSoundMode === "synth" ? "synth" : "sample";

type SoundOptions = {
  volume?: number;
  playbackRate?: number;
  brightness?: number;
  transient?: number;
  accent?: number;
  detuneCents?: number;
};

const createOscillator = (
  audioContext: AudioContext,
  frequency: number,
  type: OscillatorType,
  duration: number,
  gain: number,
  output: AudioNode = audioContext.destination,
) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

  gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(output);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
};

const createNoiseBurst = (
  audioContext: AudioContext,
  duration: number,
  gain: number,
  bandpassHz: number,
  q: number,
  output: AudioNode = audioContext.destination,
) => {
  const length = Math.max(1, Math.floor(audioContext.sampleRate * duration));
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(bandpassHz, audioContext.currentTime);
  filter.Q.setValueAtTime(q, audioContext.currentTime);

  const gainNode = audioContext.createGain();
  const t0 = audioContext.currentTime;
  gainNode.gain.setValueAtTime(Math.max(0.0001, gain), t0);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(output);

  source.start(t0);
  source.stop(t0 + duration);
};

const createNoiseThud = (
  audioContext: AudioContext,
  duration: number,
  gain: number,
  lowpassHz: number,
  output: AudioNode = audioContext.destination,
) => {
  const length = Math.max(1, Math.floor(audioContext.sampleRate * duration));
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    const fade = 1 - i / length;
    data[i] = (Math.random() * 2 - 1) * fade * fade;
  }

  const source = audioContext.createBufferSource();
  source.buffer = buffer;

  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(lowpassHz, audioContext.currentTime);
  filter.Q.setValueAtTime(0.7, audioContext.currentTime);

  const gainNode = audioContext.createGain();
  const t0 = audioContext.currentTime;
  gainNode.gain.setValueAtTime(Math.max(0.0001, gain), t0);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(output);

  source.start(t0);
  source.stop(t0 + duration);
};

const playSample = (
  audioContext: AudioContext,
  buffer: AudioBuffer,
  gain: number,
  playbackRate: number,
  brightness: number = 0.5,
  accent: number = 0.5,
  detuneCents: number = 0,
  output: AudioNode = audioContext.destination,
) => {
  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gainNode = audioContext.createGain();
  const safeBrightness = Math.max(0, Math.min(1, brightness));
  const safeAccent = Math.max(0, Math.min(1, accent));
  source.buffer = buffer;
  source.playbackRate.setValueAtTime(playbackRate, audioContext.currentTime);
  source.detune.setValueAtTime(detuneCents, audioContext.currentTime);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2200 + safeBrightness * 5200, audioContext.currentTime);
  filter.Q.setValueAtTime(0.7 + safeAccent * 3.2, audioContext.currentTime);
  gainNode.gain.setValueAtTime(Math.max(0, gain) * (0.92 + safeAccent * 0.18), audioContext.currentTime);
  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(output);
  source.start();
};

const createPlinkoBounceBus = (audioContext: AudioContext, output: AudioNode = audioContext.destination) => {
  const input = audioContext.createGain();
  const dry = audioContext.createGain();
  const wet = audioContext.createGain();
  const delay = audioContext.createDelay(0.06);
  const feedback = audioContext.createGain();
  const tone = audioContext.createBiquadFilter();
  const mix = audioContext.createGain();

  dry.gain.setValueAtTime(0.9, audioContext.currentTime);
  wet.gain.setValueAtTime(0.55, audioContext.currentTime);

  delay.delayTime.setValueAtTime(0.012 + Math.random() * 0.01, audioContext.currentTime);
  feedback.gain.setValueAtTime(0.24 + Math.random() * 0.06, audioContext.currentTime);
  tone.type = "lowpass";
  tone.frequency.setValueAtTime(4800 + Math.random() * 1000, audioContext.currentTime);
  tone.Q.setValueAtTime(0.8, audioContext.currentTime);

  input.connect(dry);
  dry.connect(mix);

  input.connect(delay);
  delay.connect(wet);
  wet.connect(mix);

  delay.connect(feedback);
  feedback.connect(tone);
  tone.connect(delay);

  mix.connect(output);

  return { input, output: mix };
};

const playPlinkoCollideSynth = (
  audioContext: AudioContext,
  output: AudioNode = audioContext.destination,
  intensity: number = 1,
  playbackRate: number = 1,
  brightness: number = 0.5,
  accent: number = 0.5,
) => {
  const t0 = audioContext.currentTime;
  const bus = createPlinkoBounceBus(audioContext, output);
  const safeIntensity = Math.max(0.2, Math.min(1.6, intensity));
  const safeRate = Math.max(0.85, Math.min(1.15, playbackRate));
  const safeBrightness = Math.max(0, Math.min(1, brightness));
  const safeAccent = Math.max(0, Math.min(1, accent));
  bus.input.gain.setValueAtTime(safeIntensity, t0);

  const clickBase = (760 + safeBrightness * 980 + Math.random() * 420) * safeRate;
  const ringDur = 0.014 + safeAccent * 0.026 + Math.random() * 0.01;
  const tick = 0.007 + safeAccent * 0.008 + Math.random() * 0.007;
  const thud = 0.008 + (1 - safeBrightness) * 0.02 + Math.random() * 0.01;

  createNoiseThud(
    audioContext,
    thud,
    0.025 + (1 - safeBrightness) * 0.03,
    (900 + (1 - safeBrightness) * 1200 + Math.random() * 600) * safeRate,
    bus.input,
  );
  createNoiseBurst(
    audioContext,
    tick,
    0.03 + safeIntensity * 0.03,
    (1500 + safeBrightness * 1800 + Math.random() * 800) * safeRate,
    2.6 + safeAccent,
    bus.input,
  );
  createNoiseBurst(
    audioContext,
    tick * 0.9,
    0.018 + safeAccent * 0.028,
    (2600 + safeBrightness * 2200 + Math.random() * 1200) * safeRate,
    2.0 + safeBrightness,
    bus.input,
  );

  {
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const f0 = clickBase * (0.95 + Math.random() * 0.1);
    const f1 = f0 * (0.7 + Math.random() * 0.08);
    osc.type = safeAccent > 0.58 ? "square" : "triangle";
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(f1, t0 + ringDur);
    gainNode.gain.setValueAtTime(0.022 + safeAccent * 0.03, t0);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t0 + ringDur);
    osc.connect(gainNode);
    gainNode.connect(bus.input);
    osc.start(t0);
    osc.stop(t0 + ringDur);
  }

  if (Math.random() < 0.16 + safeAccent * 0.26) {
    createOscillator(
      audioContext,
      (480 + safeBrightness * 380 + Math.random() * 260) * safeRate,
      "sine",
      0.014 + Math.random() * 0.02,
      0.006 + safeAccent * 0.008,
      bus.input,
    );
    createOscillator(
      audioContext,
      (320 + (1 - safeBrightness) * 260 + Math.random() * 180) * safeRate,
      "triangle",
      0.014 + Math.random() * 0.02,
      0.004 + safeAccent * 0.006,
      bus.input,
    );
  }
};

export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bounceBufferRef = useRef<AudioBuffer | null>(null);
  const bounceLoadingRef = useRef<Promise<AudioBuffer | null> | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const ensureBounceBuffer = useCallback(async (ctx: AudioContext) => {
    if (PLINKO_BOUNCE_SOUND_MODE !== "sample") return null;
    if (bounceBufferRef.current) return bounceBufferRef.current;
    if (bounceLoadingRef.current) return bounceLoadingRef.current;

    const task = (async () => {
      try {
        const response = await fetch(PLINKO_BOUNCE_SAMPLE_URL, { cache: "force-cache" });
        if (!response.ok) return null;
        const data = await response.arrayBuffer();
        const decoded = await ctx.decodeAudioData(data);
        bounceBufferRef.current = decoded;
        return decoded;
      } catch {
        return null;
      } finally {
        bounceLoadingRef.current = null;
      }
    })();

    bounceLoadingRef.current = task;
    return task;
  }, []);

  const playSound = useCallback(
    (type: SoundType, options?: SoundOptions) => {
      const playByType = (ctx: AudioContext) => {
        const volume = Math.max(0, Math.min(1.6, options?.volume ?? 1));
        const playbackRate = Math.max(0.85, Math.min(1.15, options?.playbackRate ?? 1));
        const brightness = Math.max(0, Math.min(1, options?.brightness ?? 0.5));
        const accent = Math.max(0, Math.min(1, options?.accent ?? 0.5));
        const detuneCents = Math.max(-240, Math.min(240, options?.detuneCents ?? 0));
        switch (type) {
          case "drop":
            createOscillator(ctx, 200, "sine", 0.1, 0.3 * volume);
            break;
          case "bounce":
            if (PLINKO_BOUNCE_SOUND_MODE === "synth") {
              playPlinkoCollideSynth(ctx, ctx.destination, volume, playbackRate, brightness, accent);
              return;
            }
            if (bounceBufferRef.current) {
              playSample(
                ctx,
                bounceBufferRef.current,
                0.72 * volume,
                playbackRate * (0.97 + Math.random() * 0.06),
                brightness,
                accent,
                detuneCents,
              );
              //createBounceTexture(ctx, ctx.destination, brightness, transient, accent, playbackRate);
              return;
            }
            playPlinkoCollideSynth(ctx, ctx.destination, volume, playbackRate, brightness, accent);
            void ensureBounceBuffer(ctx);
            break;
          case "land":
            createOscillator(ctx, 150, "triangle", 0.2, 0.4 * volume);
            break;
          case "win":
            createOscillator(ctx, 523, "sine", 0.1, 0.3 * volume);
            setTimeout(() => createOscillator(ctx, 659, "sine", 0.1, 0.3 * volume), 100);
            setTimeout(() => createOscillator(ctx, 784, "sine", 0.2, 0.3 * volume), 200);
            break;
          case "jackpot":
            [523, 659, 784, 1047].forEach((freq, i) => {
              setTimeout(() => createOscillator(ctx, freq, "sine", 0.3, 0.4 * volume), i * 100);
            });
            break;
        }
      };

      try {
        const ctx = getAudioContext();

        if (ctx.state === "suspended") {
          void ctx.resume().then(() => {
            playByType(ctx);
          });
          return;
        }

        playByType(ctx);
      } catch (e) {
        console.log("Sound unavailable");
      }
    },
    [ensureBounceBuffer, getAudioContext],
  );

  const unlockAudio = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        void ctx.resume().then(() => {
          void ensureBounceBuffer(ctx);
        });
        return;
      }
      void ensureBounceBuffer(ctx);
    } catch (e) {
      // Sound unavailable
    }
  }, [ensureBounceBuffer, getAudioContext]);

  return { playSound, unlockAudio };
};
