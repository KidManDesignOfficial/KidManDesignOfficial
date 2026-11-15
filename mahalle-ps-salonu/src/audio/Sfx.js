/**
 * Prosedürel ses efektleri (WebAudio) — ses dosyası gerektirmez.
 * Tarayıcı kuralı gereği ilk kullanıcı tıklamasından sonra unlock() çağrılır.
 */
export class Sfx {
  constructor(bus) {
    this.ctx = null;
    this.volume = 0.5;
    bus.on('sfx', (name) => this.play(name));
  }

  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  #tone(freq, start, dur, { type = 'sine', gain = 0.3, slideTo } = {}) {
    const c = this.ctx, t = c.currentTime + start;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  #noise(start, dur, { gain = 0.2, freq = 1200, q = 0.8 } = {}) {
    const c = this.ctx, t = c.currentTime + start;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    const g = c.createGain(); g.gain.value = gain;
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
  }

  play(name) {
    if (!this.ctx || this.ctx.state !== 'running') return;
    switch (name) {
      case 'bell': this.#tone(1568, 0, 0.9, { gain: 0.18 }); this.#tone(2093, 0.12, 1.0, { gain: 0.14 }); break;
      case 'pick': this.#noise(0, 0.06, { gain: 0.25, freq: 2500 }); break;
      case 'place': this.#noise(0, 0.08, { gain: 0.3, freq: 900 }); break;
      case 'disc': // tepsi + disk okuma vızıltısı
        this.#noise(0, 0.1, { gain: 0.3, freq: 700 });
        this.#tone(90, 0.12, 1.2, { type: 'sawtooth', gain: 0.05, slideTo: 260 });
        this.#noise(0.2, 1.0, { gain: 0.08, freq: 3000, q: 3 });
        break;
      case 'eject': this.#tone(220, 0, 0.35, { type: 'square', gain: 0.05, slideTo: 110 }); this.#noise(0.3, 0.08, { gain: 0.3, freq: 900 }); break;
      case 'boot': this.#tone(523, 0, 0.25, { gain: 0.12 }); this.#tone(784, 0.18, 0.5, { gain: 0.12 }); break;
      case 'coin': this.#tone(988, 0, 0.12, { type: 'square', gain: 0.08 }); this.#tone(1319, 0.09, 0.3, { type: 'square', gain: 0.08 }); break;
      case 'trash': this.#noise(0, 0.15, { gain: 0.35, freq: 1800, q: 0.5 }); break;
      case 'bin': this.#noise(0, 0.3, { gain: 0.4, freq: 500, q: 0.4 }); break;
      case 'buzz': this.#tone(140, 0, 0.35, { type: 'sawtooth', gain: 0.09 }); break;
      case 'deny': this.#tone(200, 0, 0.12, { type: 'square', gain: 0.05 }); break;
      case 'click': this.#tone(1200, 0, 0.05, { type: 'square', gain: 0.05 }); break;
      case 'shutter': this.#noise(0, 1.4, { gain: 0.35, freq: 400, q: 0.3 }); break;
    }
  }
}
