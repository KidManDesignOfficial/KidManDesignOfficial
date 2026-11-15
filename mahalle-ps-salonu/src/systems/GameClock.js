import { CLOCK } from '../config.js';

/**
 * Gün döngüsü modülü (GDD §4). Yalnızca zamanı yönetir ve olay yayar:
 *  clock:phase {phase}   — faz değişti
 *  clock:lastEntry       — yeni müşteri kabulü bitti
 *  clock:close           — kepenk saati geldi
 */
export class GameClock {
  constructor(bus) {
    this.bus = bus;
    this.day = 1;
    this.timeScale = 1;
    this.reset();
  }

  reset() {
    this.minutes = CLOCK.openMinute;
    this.phaseId = this.#phaseAt(this.minutes);
    this.lastEntryFired = false;
    this.closeFired = false;
  }

  nextDay() { this.day += 1; this.reset(); this.bus.emit('clock:phase', { phase: this.phaseId }); }

  update(dt) {
    if (this.closeFired) return;
    this.minutes += (dt / CLOCK.realSecondsPerGameMinute) * this.timeScale;

    const p = this.#phaseAt(this.minutes);
    if (p !== this.phaseId) { this.phaseId = p; this.bus.emit('clock:phase', { phase: p }); }

    if (!this.lastEntryFired && this.minutes >= CLOCK.lastEntryMinute) {
      this.lastEntryFired = true; this.bus.emit('clock:lastEntry');
    }
    if (this.minutes >= CLOCK.closeMinute) {
      this.minutes = CLOCK.closeMinute;
      this.closeFired = true; this.bus.emit('clock:close');
    }
  }

  /** Gerçek saniyeyi oyun dakikasına çevirir (müşteri oyun süresi için). */
  gameMinutes(dtReal) { return (dtReal / CLOCK.realSecondsPerGameMinute) * this.timeScale; }

  get acceptingCustomers() { return !this.lastEntryFired; }
  get hour24() { return (this.minutes / 60) % 24; }
  get phase() { return CLOCK.phases.find((p) => p.id === this.phaseId); }

  get timeString() {
    const m = Math.floor(this.minutes) % (24 * 60);
    return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  }

  #phaseAt(min) {
    const p = CLOCK.phases.find((ph) => min >= ph.from && min < ph.to);
    return p ? p.id : 'GECE';
  }
}
