#!/usr/bin/env python3
"""
Bande-son ORIGINALE (synthèse par code, aucun échantillon externe → libre de droits).
120 BPM : chaque coupe de scène tombe sur un temps. Les effets sont déclenchés par
src/timeline.json (le même fichier que la vidéo) donc musique / image / effets restent synchrones.

  python3 tools/make_audio.py            -> public/audio/soundtrack.wav (stéréo 48 kHz, 90 s)

Pour utiliser votre propre musique : déposez public/audio/music.wav (ou .mp3) ;
src/config.ts la prendra à la place de la musique générée (les effets restent).
"""
import json, os, wave
import numpy as np

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
DUR = TL["duration"]
BEAT = 60.0 / TL["bpm"]
N = int(SR * (DUR + 1.0))          # 1 s de queue
rng = np.random.default_rng(221)

def t_arr(d): return np.arange(int(SR * d)) / SR
def env_ad(n, a, d, curve=3.0):
    x = np.arange(n) / SR
    e = np.minimum(1, x / max(a, 1e-4)) * np.exp(-x / max(d, 1e-4) * curve / 3)
    return e
def lp(x, fc):                      # filtre passe-bas 1 pôle (rapide, suffisant ici)
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def lp_fast(x, fc):
    # version vectorisée approximative : moyenne glissante pour grands signaux
    k = max(1, int(SR / (2 * np.pi * fc)))
    if k <= 1: return x
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k
    return np.concatenate([np.full(k - 1, y[0]), y])
def hp(x, fc): return x - lp_fast(x, fc)
def saw(f, t): return 2 * ((f * t) % 1.0) - 1
def stereo(x, pan=0.0):
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    return np.stack([x * l, x * r], axis=1)

mix = np.zeros((N, 2)); music = np.zeros((N, 2)); sfx = np.zeros((N, 2))
def add(buf, x, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= buf.shape[0]: return
    s = stereo(x * gain, pan); e = min(buf.shape[0], i + len(s))
    buf[i:e] += s[: e - i]

# ---------------------------------------------------------------- instruments
def kick():
    t = t_arr(0.45); f = 120 * np.exp(-t * 18) + 42
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 7.5) + 0.25 * hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 90)
def snare():
    t = t_arr(0.3); n = hp(rng.standard_normal(len(t)), 1800) * np.exp(-t * 20)
    return 0.8 * n + 0.4 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 28)
def hat(open_=False):
    t = t_arr(0.25 if open_ else 0.06); return hp(rng.standard_normal(len(t)), 6500) * np.exp(-t * (14 if open_ else 70))
def bass(f, d):
    t = t_arr(d); x = lp_fast(saw(f, t) + 0.5 * saw(f * 1.005, t), 420)
    return x * env_ad(len(t), 0.005, d * 0.9) * 0.6 + 0.5 * np.sin(2 * np.pi * f * t) * env_ad(len(t), 0.005, d)
def pad(freqs, d):
    t = t_arr(d); x = np.zeros_like(t)
    for f in freqs:
        for det in (0.996, 1.0, 1.004):
            x += saw(f * det, t) * 0.12
    x = lp_fast(x, 1400)
    a = np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.6)
    return x * a
def pluck(f, d=0.35):
    t = t_arr(d); x = (np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sin(2 * np.pi * f * 2 * t) * 0.3)
    return lp_fast(x, 3200) * np.exp(-t * 14) * 0.5

# ---------------------------------------------------------------- musique (A mineur, 120 BPM)
A = lambda n: 440.0 * 2 ** ((n - 69) / 12)       # n = numéro MIDI
prog = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (43, [50, 55, 59])]   # Am, F, C, G
scenes = TL["scenes"]
def energy(t):               # 0 = vide, 1 = plein (déduit des scènes de timeline.json)
    sc = TL["scenes"]
    if t < sc["intro"][0] + 4: return 0.0
    if t < sc["intro"][1]: return 0.35
    if t < sc["reveal"][1]: return 0.7
    if sc["responsive"][0] <= t < sc["responsive"][1]: return 0.55     # respiration
    if sc["value"][0] <= t < sc["value"][1]: return 0.85
    return 1.0
bar = BEAT * 4
for b in range(int(DUR / bar) + 1):
    t0 = b * bar
    root, chord = prog[b % 4]
    e = energy(t0)
    add(music, pad([A(n) for n in chord], bar + 0.2), t0, 0.5 * (0.35 + 0.65 * min(1, e + 0.2)), 0)
    if e > 0:
        for s in range(8):                              # basse en croches
            tt = t0 + s * BEAT / 2
            if tt < DUR: add(music, bass(A(root), BEAT / 2.2), tt, 0.55 * (0.6 + 0.4 * e), 0)
    for s in range(16):                                 # arpège
        tt = t0 + s * BEAT / 4
        if e >= 0.55 and tt < DUR:
            n = chord[[0, 1, 2, 1][s % 4]] + 12 * (1 if s % 8 >= 4 else 0)
            add(music, pluck(A(n)), tt, 0.16 * e, -0.4 if s % 2 else 0.4)
    if e >= 0.7:
        for beat in range(4):
            tt = t0 + beat * BEAT
            if tt < DUR: add(music, kick(), tt, 0.95 * (1 if e >= 0.85 else 0.8), 0)
            if tt < DUR and e >= 0.85 and beat in (1, 3): add(music, snare(), tt, 0.42, 0.05)
        for s in range(8):
            tt = t0 + s * BEAT / 2 + (BEAT / 4 if False else 0)
            if tt < DUR: add(music, hat(s % 4 == 3), tt, 0.16 * e, 0.35)
    elif e >= 0.35:
        for beat in (0, 2):
            tt = t0 + beat * BEAT
            if tt < DUR: add(music, kick(), tt, 0.55, 0)
# fin : tenue + fondu
fade_start, fade_end = DUR - 1.2, DUR + 0.9
tt = np.arange(N) / SR
fo = np.clip((fade_end - tt) / (fade_end - fade_start), 0, 1)[:, None]
fi = np.clip(tt / 1.0, 0, 1)[:, None]

# ---------------------------------------------------------------- effets
def whoosh(d=0.9):
    t = t_arr(d); n = rng.standard_normal(len(t))
    sweep = np.sin(np.pi * t / d) ** 2
    y = np.zeros_like(n)
    for k, fc in enumerate((400, 1200, 3500)):
        y += lp_fast(n, fc) * (sweep ** (k + 1)) * 0.6
    return hp(y, 150) * 1.3
def hit():
    t = t_arr(0.9); f = 70 * np.exp(-t * 6) + 38
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) * 0.9 + hp(rng.standard_normal(len(t)), 900) * np.exp(-t * 14) * 0.35
def boom():
    t = t_arr(2.6); f = 55 * np.exp(-t * 2) + 30
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.3) * 1.0 + lp_fast(rng.standard_normal(len(t)), 600) * np.exp(-t * 3) * 0.4
def click():
    t = t_arr(0.07); return (hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 120) * 0.6 + np.sin(2 * np.pi * 1700 * t) * np.exp(-t * 90) * 0.4)
def tick():
    t = t_arr(0.03); return hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 200) * 0.5
def pop():
    t = t_arr(0.22); f = 520 + 380 * np.exp(-t * 22)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 16) * 0.55
def success():
    out = np.zeros(int(SR * 0.7))
    for i, n in enumerate((76, 83)):
        t = t_arr(0.45); s = np.sin(2 * np.pi * A(n) * t) * np.exp(-t * 7) * 0.45 + np.sin(2 * np.pi * A(n) * 2 * t) * np.exp(-t * 10) * 0.12
        j = int(i * 0.09 * SR); out[j:j + len(s)] += s
    return out
def error():
    out = np.zeros(int(SR * 0.5))
    for i in range(2):
        t = t_arr(0.14); s = lp_fast(saw(165, t), 900) * np.exp(-t * 14) * 0.55
        j = int(i * 0.17 * SR); out[j:j + len(s)] += s
    return out
def logo():
    t = t_arr(1.8); x = np.zeros_like(t)
    for k, n in enumerate((69, 76, 81, 88)):
        d = 0.06 * k; tt = np.clip(t - d, 0, None)
        x += np.sin(2 * np.pi * A(n) * tt) * np.exp(-tt * 2.8) * (t > d) * (0.22 / (1 + 0.3 * k))
    h = hit(); x[: len(h)] += h[: len(x)] * 0.55
    return x
def riser(d):
    t = t_arr(d); n = rng.standard_normal(len(t)); y = hp(lp_fast(n, 5000), 600)
    return y * (t / d) ** 2.2 * 0.5

for c in TL["cues"]:
    ty, t0, d = c["type"], c["t"], c.get("dur", 0)
    if ty == "whoosh":   add(sfx, whoosh(), t0 - 0.0, 0.55, -0.1)
    elif ty == "hit":    add(sfx, hit(), t0, 0.55)
    elif ty == "boom":   add(sfx, boom(), t0, 0.7)
    elif ty == "click":  add(sfx, click(), t0, 0.7)
    elif ty == "pop":    add(sfx, pop(), t0, 0.55, 0.15)
    elif ty == "success":add(sfx, success(), t0, 0.5, 0.1)
    elif ty == "error":  add(sfx, error(), t0, 0.5, -0.1)
    elif ty == "logo":   add(sfx, logo(), t0, 0.6)
    elif ty == "riser":  add(sfx, riser(d), t0, 0.6)
    elif ty == "type":
        for k in range(int(d * 14)):
            add(sfx, tick(), t0 + k * (d / max(1, int(d * 14))) + rng.uniform(0, 0.02), 0.45, rng.uniform(-0.2, 0.2))
    elif ty == "count":
        for k in range(int(d * 16)):
            add(sfx, tick(), t0 + k * (d / int(d * 16)), 0.25 + 0.35 * k / (d * 16), 0.2)

# ---------------------------------------------------------------- mixage + sidechain léger sur les coups
duck = np.ones(N)
for c in TL["cues"]:
    if c["type"] in ("hit", "boom", "logo"):
        i = int(c["t"] * SR); L = int(0.28 * SR)
        shape = 1 - 0.45 * np.exp(-np.arange(L) / (0.09 * SR))
        duck[i:i + L] = np.minimum(duck[i:i + L], shape[: max(0, min(L, N - i))])
music = music * duck[:, None]

custom = os.path.join(ROOT, "public", "audio", "music.wav")
if os.path.exists(custom):
    print("Musique personnalisée détectée :", custom, "(elle remplace la musique générée)")
    with wave.open(custom, "rb") as w:
        ch, sw, sr, nf = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        raw = w.readframes(nf)
    assert sw == 2, "music.wav doit être en 16 bits PCM"
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768.0
    x = x.reshape(-1, ch)
    x = np.repeat(x, 2, axis=1) if ch == 1 else x[:, :2]
    if sr != SR:
        n_new = int(len(x) * SR / sr)
        x = np.stack([np.interp(np.linspace(0, len(x) - 1, n_new), np.arange(len(x)), x[:, c]) for c in range(2)], axis=1)
    music[:] = 0
    m = min(len(x), N)
    music[:m] = x[:m] * 0.8
out = (music * 0.9 + sfx * 1.0) * fo * fi
peak = np.max(np.abs(out)); out = out / peak * 0.84
out = np.tanh(out * 1.15) / np.tanh(1.15)         # limiteur doux
pcm = (out[: int(SR * DUR)] * 32767).astype(np.int16)
os.makedirs(os.path.join(ROOT, "public", "audio"), exist_ok=True)
dst = os.path.join(ROOT, "public", "audio", "soundtrack.wav")
with wave.open(dst, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print("OK", dst, "%.1f s" % (len(pcm) / SR))
