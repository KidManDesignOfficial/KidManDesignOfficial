import { ECONOMY, LEVELS } from '../config.js';

const SAVE_KEY = 'mahalle-ps-salonu:save:v1';

/**
 * Ekonomi & itibar modülü (GDD §4.4, §5). Sahne/3D bilgisi içermez.
 */
export class Economy {
  constructor(bus) {
    this.bus = bus;
    this.money = ECONOMY.startMoney;
    this.reputation = 0;
    this.level = 1;
    this.#load();
    this.resetLedger();
  }

  resetLedger() {
    this.ledger = { revenue: 0, tips: 0, served: 0, lost: 0, stationMinutes: 0 };
  }

  /** Bir grubun oyun ücretini hesaplar ve tahsil eder. */
  chargeSession({ minutesPlayed, mood, tipMult }) {
    const billable = Math.max(ECONOMY.minChargeMinutes, minutesPlayed);
    const fee = Math.round((ECONOMY.hourlyRate * billable) / 60);
    const tip = mood > 0.55 ? Math.round(fee * 0.15 * tipMult * mood) : 0;
    this.money += fee + tip;
    this.ledger.revenue += fee;
    this.ledger.tips += tip;
    this.ledger.served += 1;
    this.ledger.stationMinutes += minutesPlayed;
    this.bus.emit('economy:changed');
    return { fee, tip };
  }

  addReputation(delta, reason) {
    this.reputation += delta; // negatif olabilir: kötü şöhret de bir durumdur
    if (reason === 'lost') this.ledger.lost += 1;
    this.bus.emit('economy:changed');
  }

  /** Gün sonu bilançosu (kira + elektrik düşülür). */
  closeDay(day) {
    const stationHours = this.ledger.stationMinutes / 60;
    const electricity = Math.round(ECONOMY.electricityBase + stationHours * ECONOMY.electricityPerStationHour);
    const rent = ECONOMY.rentPerDay;
    const gross = this.ledger.revenue + this.ledger.tips;
    const net = gross - electricity - rent;
    this.money -= electricity + rent;
    const report = { day, ...this.ledger, stationHours, electricity, rent, gross, net, money: this.money, reputation: this.reputation, next: this.nextLevel };
    this.resetLedger();
    this.#save(day + 1);
    this.bus.emit('economy:changed');
    return report;
  }

  get nextLevel() { return LEVELS.find((l) => l.level === this.level + 1) || null; }

  #save(day) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ money: this.money, reputation: this.reputation, level: this.level, day })); } catch { /* depolama yoksa sessizce geç */ }
  }

  #load() {
    try {
      const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (s && Number.isFinite(s.money)) { this.money = s.money; this.reputation = s.reputation || 0; this.level = s.level || 1; this.savedDay = s.day; }
    } catch { /* yok say */ }
  }

  static clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch { /* yok say */ } }
}
