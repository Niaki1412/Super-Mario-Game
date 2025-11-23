
export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmNodes: AudioNode[] = [];
  private isPlayingBGM: boolean = false;

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

  // --- Background Music (Simple Loop) ---
  
  startBGM() {
    if (!this.ctx || !this.masterGain || this.isPlayingBGM) return;
    this.resume();
    this.isPlayingBGM = true;

    // Simple bassline loop
    const bgmGain = this.ctx.createGain();
    bgmGain.connect(this.masterGain);
    bgmGain.gain.value = 0.3;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.connect(bgmGain);
    osc.start();
    
    // Sequencer using LFO for rhythm
    const lfo = this.ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 4; // Speed
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 1000; // Depth triggers on/off feel
    lfo.connect(bgmGain.gain);
    lfo.start();

    // Store nodes to stop them later
    this.bgmNodes = [osc, lfo, bgmGain, lfoGain];
  }

  stopBGM() {
    this.bgmNodes.forEach((node) => {
        try {
            if (node instanceof OscillatorNode) node.stop();
            node.disconnect();
        } catch(e) {}
    });
    this.bgmNodes = [];
    this.isPlayingBGM = false;
  }
}

export const audioManager = new AudioManager();
