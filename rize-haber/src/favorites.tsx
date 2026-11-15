/** Favoriler: uygulama genelinde paylaşılan durum + telefonda kalıcı kayıt. */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { NewsItem } from './rss';
import { loadFavorites, saveFavorites } from './storage';

type FavoritesValue = {
  favorites: NewsItem[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: NewsItem) => void;
};

const FavoritesContext = createContext<FavoritesValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<NewsItem[]>([]);
  const loaded = useRef(false);

  useEffect(() => {
    loadFavorites().then((items) => {
      // Yükleme sürerken kullanıcı bir şey kaydettiyse onu kaybetme.
      setFavorites((current) => {
        const ids = new Set(current.map((i) => i.id));
        return [...current, ...items.filter((i) => !ids.has(i.id))];
      });
      loaded.current = true;
    });
  }, []);

  useEffect(() => {
    if (loaded.current) saveFavorites(favorites);
  }, [favorites]);

  const ids = useMemo(() => new Set(favorites.map((i) => i.id)), [favorites]);

  const toggleFavorite = useCallback((item: NewsItem) => {
    loaded.current = true;
    setFavorites((current) =>
      current.some((i) => i.id === item.id)
        ? current.filter((i) => i.id !== item.id)
        : [item, ...current],
    );
  }, []);

  const value = useMemo(
    () => ({ favorites, isFavorite: (id: string) => ids.has(id), toggleFavorite }),
    [favorites, ids, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesValue {
  const value = useContext(FavoritesContext);
  if (!value) throw new Error('useFavorites, FavoritesProvider içinde kullanılmalı.');
  return value;
}
