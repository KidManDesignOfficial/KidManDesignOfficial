/**
 * Yağmurlu havada isteğe bağlı yağmur sesi.
 *
 * - Varsayılan olarak KAPALIDIR; kullanıcı Hava ekranındaki düğmeyle açar, tercih cihazda saklanır.
 * - Yalnızca Hava ekranı görünürken ve uygulama ön plandayken çalar; başka sekmeye geçince,
 *   uygulama arka plana alınınca ya da hava yağmurlu değilse durur.
 * - Diğer uygulamaların sesini (müzik, podcast) kesmez, onlarla birlikte çalar.
 * - Ses dosyası özgündür: design/make-rain-sound.py ile sentezlenir (telifli kayıt yok).
 */
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

const STORAGE_KEY = 'rizehaber:rainSound:v1';
const RAIN_SOURCE = require('../assets/sounds/rain.m4a');
const TARGET_VOLUME = 0.7;
const FADE_STEPS = 15;
const FADE_STEP_MS = 100;

/** Kullanıcının yağmur sesi tercihi (yüklenene kadar false). */
export function useRainSoundPreference(): [boolean, (on: boolean) => void] {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => setEnabled(v === '1'))
      .catch(() => {});
  }, []);
  const update = useCallback((on: boolean) => {
    setEnabled(on);
    AsyncStorage.setItem(STORAGE_KEY, on ? '1' : '0').catch(() => {});
  }, []);
  return [enabled, update];
}

function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}

/** `playing` doğruyken sesi yumuşakça açar (fade-in) ve döngüde çalar; yanlışken duraklatır. */
export function useRainSound(playing: boolean) {
  const player = useAudioPlayer(RAIN_SOURCE);
  const appActive = useAppActive();
  const shouldPlay = playing && appActive;

  useEffect(() => {
    // Ses çalar nesnesi bir yerel (native) kaynaktır; özellikleri doğrudan ayarlanır.
    /* eslint-disable react-hooks/immutability */
    player.loop = true;
    if (!shouldPlay) {
      player.pause();
      return;
    }
    setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    }).catch(() => {});
    player.volume = 0;
    player.play();
    let step = 0;
    const fade = setInterval(() => {
      step += 1;
      player.volume = (TARGET_VOLUME * Math.min(step, FADE_STEPS)) / FADE_STEPS;
      if (step >= FADE_STEPS) clearInterval(fade);
    }, FADE_STEP_MS);
    /* eslint-enable react-hooks/immutability */
    return () => clearInterval(fade);
  }, [player, shouldPlay]);
}
