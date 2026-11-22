"""
Rize Haber – yağmur sesi üreticisi (özgün, tamamen sentez; dış kayıt kullanılmaz).

Çalıştırma:  python3 design/make-rain-sound.py
Çıktı:       assets/sounds/rain.m4a  (24 sn, stereo, kusursuz döngü)

Döngü dikişsizdir: arka plan gürültüsü FFT ile doğrudan frekans alanında üretilir (dairesel),
rüzgâr dalgalanmaları döngü süresine tam bölünen frekanslardadır ve damlalar sona taşarsa başa
sarılır. Böylece son örnek ile ilk örnek arasında hiçbir sıçrama olmaz.
"""
import os
import subprocess
import tempfile
import wave

import numpy as np

SR = 44100
SECONDS = 24
N = SR * SECONDS
rng = np.random.default_rng(1453)  # sabit tohum: her çalıştırmada aynı dosya


def shaped_noise(shape):
    """Verilen genlik eğrisine sahip, dairesel (dikişsiz) gürültü."""
    freqs = np.fft.rfftfreq(N, 1 / SR)
    spectrum = shape(freqs) * np.exp(2j * np.pi * rng.random(freqs.size))
    spectrum[0] = 0
    x = np.fft.irfft(spectrum, N)
    return x / np.max(np.abs(x))


def rain_bed(f):
    f = np.maximum(f, 1.0)
    pink = 1 / np.sqrt(f)
    band = 1 / (1 + (300 / f) ** 4) * 1 / (1 + (f / 9000) ** 4)  # 300 Hz – 9 kHz
    hiss = 1 + 0.8 * np.exp(-((np.log(f / 3200)) ** 2) / 0.35)  # yağmurun "şşş" bölgesi
    return pink * band * hiss


def rumble(f):
    f = np.maximum(f, 1.0)
    return 1 / (1 + (f / 180) ** 4) * 1 / (1 + (40 / f) ** 2)


def periodic_lfo(cycles_and_depths):
    t = np.arange(N) / N
    out = np.ones(N)
    for cycles, depth in cycles_and_depths:
        out += depth * np.sin(2 * np.pi * cycles * t + rng.random() * 2 * np.pi)
    return out


def drops(count, f_lo, f_hi, gain):
    """Tek tek damla 'tıpırtıları': hızlı sönen kısa tınılar + çıtırtı, dairesel yerleştirilir."""
    out = np.zeros((2, N))
    for _ in range(count):
        start = rng.integers(0, N)
        length = int(SR * rng.uniform(0.006, 0.03))
        t = np.arange(length) / SR
        freq = rng.uniform(f_lo, f_hi) * np.exp(-t * rng.uniform(5, 30))  # hafif aşağı kayan perde
        env = np.exp(-t / rng.uniform(0.002, 0.008))
        tone = np.sin(2 * np.pi * np.cumsum(freq) / SR) * env
        click = rng.standard_normal(length) * np.exp(-t / 0.0012) * 0.5
        drop = (tone + click) * gain * rng.uniform(0.2, 1.0) ** 2
        pan = rng.uniform(0.15, 0.85)
        idx = (start + np.arange(length)) % N
        out[0, idx] += drop * np.sqrt(1 - pan)
        out[1, idx] += drop * np.sqrt(pan)
    return out


bed_l, bed_r = shaped_noise(rain_bed), shaped_noise(rain_bed)
common = shaped_noise(rain_bed)
gust = periodic_lfo([(1, 0.10), (3, 0.06), (7, 0.03)])
low = shaped_noise(rumble) * periodic_lfo([(2, 0.2)])

left = (0.55 * bed_l + 0.45 * common) * gust * 0.55 + 0.18 * low
right = (0.55 * bed_r + 0.45 * common) * gust * 0.55 + 0.18 * low
near = drops(SECONDS * 22, 1800, 5200, 0.35)  # yakındaki iri damlalar
far = drops(SECONDS * 90, 3000, 8000, 0.10)  # uzaktaki ince tıpırtılar
stereo = np.stack([left, right]) + near + far

stereo = np.tanh(stereo * 1.2) / np.tanh(1.2)  # yumuşak sınırlama
stereo *= 10 ** (-4 / 20) / np.max(np.abs(stereo))  # tepe −4 dBFS
pcm = (stereo.T * 32767).astype('<i2')

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'assets', 'sounds', 'rain.m4a')
with tempfile.TemporaryDirectory() as tmp:
    wav = os.path.join(tmp, 'rain.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    subprocess.run(
        ['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', out],
        check=True,
    )
print('yazıldı:', out, os.path.getsize(out) // 1024, 'KB')
