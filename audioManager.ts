

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlayingBGM: boolean = false;
  private bgmTimeout: number | null = null;

  constructor() {
    try {
      // @ts-ignore - Handle Safari prefix
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.2; // Global volume
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn("Web Audio API not supported");
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(e => console.error(e));
    }
  }

  // --- Sound Effects ---

  playJump() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    // Classic Jump: Square wave slide up
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playBump() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    // Bump: Low frequency short square
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.08);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  playCoin() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    const t = this.ctx.currentTime;
    
    const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.4, startTime);
        gain.gain.linearRampToValueAtTime(0, startTime + duration);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    };

    // B5 -> E6
    playTone(987.77, t, 0.08); 
    playTone(1318.51, t + 0.08, 0.2); 
  }

  playPowerup() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    const t = this.ctx.currentTime;
    const notes = [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66]; // G Major arpeggio
    
    notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.08);
        gain.gain.setValueAtTime(0.3, t + i * 0.08);
        gain.gain.linearRampToValueAtTime(0, t + i * 0.08 + 0.08);
        
        osc.start(t + i * 0.08);
        osc.stop(t + i * 0.08 + 0.08);
    });
  }

  playShoot() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playStomp() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    
    // Noise buffer for "crunch"
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    noise.connect(gain);
    gain.connect(this.masterGain);
    noise.start();
  }

  playDie() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    this.stopBGM();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    // Descending slide
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.5);
    
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.5);
    
    osc.start();
    osc.stop(t + 0.5);
  }

  playWin() {
    if (!this.ctx || !this.masterGain) return;
    this.resume();
    this.stopBGM();

    const t = this.ctx.currentTime;
    
    // Fanfare: G3, C4, E4, G4, C5, E5, G5, C6
    const notes = [196.00, 261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.connect(gain);
        gain.connect(this.masterGain!);
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t + i * 0.1);
        
        gain.gain.setValueAtTime(0.3, t + i * 0.1);
        gain.gain.linearRampToValueAtTime(0, t + i * 0.1 + 0.4);
        
        osc.start(t + i * 0.1);
        osc.stop(t + i * 0.1 + 0.4);
    });
  }

  // --- Background Music (Melodic Loop) ---
  
  startBGM() {
    if (!this.ctx || !this.masterGain || this.isPlayingBGM) return;
    this.resume();
    this.isPlayingBGM = true;

    // Pleasant I-vi-IV-V Arpeggio Progression
    // C Major 7 -> A Minor 7 -> F Major 7 -> G Dominant 7
    const sequence = [
        // C Maj 7
        261.63, 329.63, 392.00, 493.88,
        // A Min 7
        220.00, 261.63, 329.63, 392.00,
        // F Maj 7
        174.61, 220.00, 261.63, 329.63,
        // G Dom 7
        196.00, 246.94, 293.66, 349.23
    ];

    let noteIndex = 0;
    // Tempo control
    const noteDuration = 0.3; // Seconds per note (Moderately relaxing tempo)
    let nextNoteTime = this.ctx.currentTime;

    const scheduler = () => {
        if (!this.isPlayingBGM || !this.ctx || !this.masterGain) return;

        // Schedule notes ahead of time to avoid jitter
        while (nextNoteTime < this.ctx.currentTime + 0.1) {
            this.playBGMNote(sequence[noteIndex], nextNoteTime, noteDuration);
            nextNoteTime += noteDuration;
            noteIndex = (noteIndex + 1) % sequence.length;
        }
        
        // Check schedule again soon
        this.bgmTimeout = window.setTimeout(scheduler, 50);
    };

    scheduler();
  }

  private playBGMNote(freq: number, time: number, duration: number) {
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.masterGain);

      // Triangle wave provides a softer, flute-like tone than square waves
      osc.type = 'triangle';
      osc.frequency.value = freq;

      // Soft Envelope (ADSR)
      const volume = 0.15;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.05); // Attack
      gain.gain.setValueAtTime(volume, time + duration - 0.05); // Sustain
      gain.gain.linearRampToValueAtTime(0, time + duration); // Release

      osc.start(time);
      osc.stop(time + duration);
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimeout) {
        clearTimeout(this.bgmTimeout);
        this.bgmTimeout = null;
    }
  }
}

export const audioManager = new AudioManager();
