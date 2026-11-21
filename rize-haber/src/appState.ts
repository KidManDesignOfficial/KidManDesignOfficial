import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** Uygulama ön plandayken true (otomatik yenilemeler arka planda durur). */
export function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}
