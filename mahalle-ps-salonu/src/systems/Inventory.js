import { GAMES } from '../config.js';

/**
 * Envanter modülü: her oyun kutusunun (kutu + disk tek parça) nerede olduğunu
 * tutan tek doğruluk kaynağı. 3D nesneye yalnızca referans tutar.
 *
 * location: 'rack' | 'hand' | 'console:<stationId>' | 'world'
 */
export class Inventory {
  constructor(bus) {
    this.bus = bus;
    this.discs = new Map(GAMES.map((g) => [g.id, { game: g, location: 'rack', mesh: null }]));
  }

  get(gameId) { return this.discs.get(gameId); }
  game(gameId) { return this.discs.get(gameId)?.game; }

  setLocation(gameId, location) {
    const d = this.discs.get(gameId);
    if (!d) return;
    const from = d.location;
    d.location = location;
    this.bus.emit('inventory:moved', { gameId, from, to: location });
  }

  /** Raf dışında kalan (unutulmuş) kutular — GDD §2.2 takibi için. */
  misplaced() { return [...this.discs.values()].filter((d) => d.location === 'world'); }
}
