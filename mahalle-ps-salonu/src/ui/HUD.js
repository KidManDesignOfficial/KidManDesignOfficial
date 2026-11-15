import { PLAYER } from '../config.js';

const $ = (id) => document.getElementById(id);
const fmt = (n) => `${n < 0 ? '−' : ''}₺${Math.abs(Math.round(n)).toLocaleString('tr-TR')}`;

/** Ekran üstü bilgi katmanı (DOM). Oyun mantığı içermez, yalnızca gösterir. */
export class HUD {
  constructor(bus) {
    this.el = {
      day: $('hud-day'), time: $('hud-time'), phase: $('hud-phase'),
      money: $('hud-money'), rep: $('hud-rep'), stations: $('hud-stations'),
      prompt: $('prompt'), held: $('held'), toasts: $('toasts'), crosshair: $('crosshair'),
    };
    this._last = {};
    bus.on('toast', (t) => this.toast(t.text, t.tone));
  }

  #set(key, el, value, prop = 'textContent') {
    if (this._last[key] === value) return;
    this._last[key] = value; el[prop] = value;
  }

  update({ clock, economy, stations, manager, interaction, inventory, prompt }) {
    this.#set('day', this.el.day, `Gün ${clock.day}`);
    this.#set('time', this.el.time, clock.timeString);
    this.#set('phase', this.el.phase, clock.closeFired ? 'Kapanış · Kepenk iniyor' : clock.phase?.label ?? '');
    this.#set('money', this.el.money, fmt(economy.money));
    this.#set('rep', this.el.rep, `İtibar ${economy.reputation}`);

    const rows = stations.map((st) => {
      const s = manager.stationStatus(st);
      const disc = st.loadedGame ? inventory.game(st.loadedGame).short : '—';
      const bar = s.patience !== undefined
        ? `<div class="bar"><i style="width:${Math.round(s.patience * 100)}%;background:${s.patience > 0.6 ? 'var(--ok)' : s.patience > 0.3 ? 'var(--warn)' : 'var(--bad)'}"></i></div>`
        : s.progress !== undefined ? `<div class="bar"><i style="width:${Math.round(Math.min(1, s.progress) * 100)}%;background:var(--accent)"></i></div>` : '';
      return `<div class="st ${s.tone}"><b>Masa ${st.id}</b><span>${s.text}</span><small>Disk: ${disc}</small>${bar}</div>`;
    }).join('');
    const queue = manager.queue.length ? `<div class="st idle"><b>Tezgah</b><span>${manager.queue.length} grup sırada</span></div>` : '';
    this.#set('stations', this.el.stations, rows + queue, 'innerHTML');

    const p = prompt;
    const ptxt = p ? `${p.key ? `<kbd>${p.key}</kbd> ` : ''}${p.text}` : '';
    this.#set('prompt', this.el.prompt, ptxt, 'innerHTML');
    this.el.prompt.classList.toggle('dim', !!p && !p.ok);
    this.el.crosshair.classList.toggle('on', !!p && p.ok);

    const held = interaction.held ? `Elinde: <b>${inventory.game(interaction.held).short}</b> <kbd>Q</kbd> bırak` : '';
    const bag = interaction.trashBag ? ` · Çöp poşeti ${interaction.trashBag}/${PLAYER.trashCapacity}` : '';
    this.#set('held', this.el.held, held + bag, 'innerHTML');
  }

  toast(text, tone = 'info') {
    const d = document.createElement('div');
    d.className = `toast ${tone}`;
    d.textContent = text;
    this.el.toasts.prepend(d);
    while (this.el.toasts.children.length > 5) this.el.toasts.lastChild.remove();
    setTimeout(() => d.classList.add('out'), 3800);
    setTimeout(() => d.remove(), 4400);
  }
}

/** Tezgah diyaloğu: 1–4 tuşlarıyla seçim (fare kilidi bozulmaz). */
export class DialogUI {
  constructor(bus, manager, player) {
    this.bus = bus; this.manager = manager; this.player = player;
    this.el = $('dialog');
    this.party = null;
    addEventListener('keydown', (e) => {
      if (!this.party) return;
      const n = Number(e.key);
      if (n >= 1 && n <= this.options.length) { e.preventDefault(); this.choose(n - 1); }
      if (e.code === 'KeyX') this.close();
    });
  }

  get isOpen() { return !!this.party; }

  open(party) {
    this.party = party;
    this.manager.dialogParty = party;
    this.render();
    this.el.classList.add('open');
    this.bus.emit('sfx', 'click');
  }

  render() {
    this.options = this.manager.dialogOptions(this.party);
    const quote = this.party.profile.intro(this.party.members.length);
    this.el.innerHTML = `<div class="who">${this.party.profile.label} · ${this.party.members.length} kişi</div>
      <div class="quote">“${quote}”</div>
      <ol>${this.options.map((o, i) => `<li class="${o.enabled ? '' : 'off'}"><kbd>${i + 1}</kbd> ${o.label}</li>`).join('')}</ol>
      <div class="hint"><kbd>X</kbd> kapat</div>`;
  }

  choose(i) {
    const o = this.options[i];
    if (!o || !o.enabled) { this.bus.emit('sfx', 'deny'); return; }
    o.action();
    this.close();
  }

  close() {
    if (this.manager.dialogParty === this.party) this.manager.dialogParty = null;
    this.party = null;
    this.el.classList.remove('open');
  }

  /** Oyuncu uzaklaşırsa ya da grup artık konuşulabilir değilse kapan. */
  update() {
    if (!this.party) return;
    const m = this.party.members[0];
    const d = Math.hypot(m.position.x - this.player.position.x, m.position.z - this.player.position.z);
    if (d > 3.6 || !this.manager.canTalk(this.party)) this.close();
  }
}

/** Gün sonu bilançosu ekranı (GDD §4.4). */
export function showSummary(report, onNext) {
  const el = $('summary');
  const row = (k, v, cls = '') => `<tr class="${cls}"><td>${k}</td><td>${v}</td></tr>`;
  const next = report.next
    ? `<p class="next">Sıradaki hedef: <b>Seviye ${report.next.level} · ${report.next.name}</b> — ${fmt(report.next.needMoney)} kasa & ${report.next.needRep} itibar <span>(${fmt(report.money)} / ${report.reputation})</span></p>`
    : '';
  el.innerHTML = `<div class="card">
    <h2>Gün ${report.day} · Kepenk indi</h2>
    <table>
      ${row('Oyun geliri', fmt(report.revenue))}
      ${row('Bahşiş', fmt(report.tips))}
      ${row(`Elektrik (${report.stationHours.toFixed(1)} masa-saat)`, '−' + fmt(report.electricity), 'neg')}
      ${row('Kira', '−' + fmt(report.rent), 'neg')}
      ${row('Net kâr', fmt(report.net), report.net >= 0 ? 'pos total' : 'neg total')}
      ${row('Hizmet verilen grup', report.served)}
      ${row('Kızıp giden grup', report.lost)}
      ${row('Kasa', fmt(report.money), 'total')}
    </table>
    ${next}
    <button id="next-day">Ertesi güne başla</button>
  </div>`;
  el.classList.add('open');
  $('next-day').onclick = () => { el.classList.remove('open'); onNext(); };
}
