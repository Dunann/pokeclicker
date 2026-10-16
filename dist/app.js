import { PRODUCERS, UPGRADES, SAVE_KEY, fresh, cost, clickPower, production, click, buy, earn, restore } from './engine.js';
const $ = id => document.getElementById(id);
let state = fresh(), lastTick = Date.now(), toastTimer;
const format = n => n < 1000 ? Math.floor(n).toLocaleString() : Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
const decimal = n => Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(n);
function toast(message) { $('toast').textContent = message; $('toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 4500); }
function save(notify = false) { try { state.savedAt = Date.now(); localStorage.setItem(SAVE_KEY, JSON.stringify(state)); $('save-status').innerHTML = '<i></i> Saved locally'; if (notify) toast('Adventure saved. Your team is in good hands.'); } catch { $('save-status').textContent = 'Save unavailable'; if (notify) toast('Browser storage is unavailable. Export a backup instead.'); } }
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) { const loaded = restore(raw); state = loaded.state; if (loaded.offline >= 1 && loaded.seconds >= 10) setTimeout(() => toast(`Welcome back! Your team collected ${format(loaded.offline)} coins while you were away.`), 500); } } catch { setTimeout(() => toast('Your save could not be loaded. A fresh adventure is ready.'), 500); }
function portrait(p) {
  const ears = p.id === 'pikachu' ? '<path d="M20 29 13 3 26 9 30 29M43 28 48 3 57 9 51 33" fill="#f1ce52"/><path d="m13 3 3 11 8-5ZM48 3l-2 11 11-5Z" fill="#4f4c3d"/>' : p.id === 'eevee' ? '<path d="M20 31 8 4Q31 6 30 30M39 29Q44 8 58 4L50 33" fill="#b58a5d"/><path d="m16 12 6 14 2-10M48 15l-5 12 8-15" stroke="#674e39" stroke-width="4"/>' : p.id === 'bulbasaur' ? '<path d="M17 31Q7 8 30 9Q44-2 47 23L40 38" fill="#6c9e68"/><path d="m30 12-4 21m4-21 9 18" stroke="#4d8256" fill="none"/>' : p.id === 'dragonite' ? '<path d="m19 39-15-17 1 29 19-3m22-7 15-17-2 28-17-4" fill="#8cb5a2" stroke="#c99c57" stroke-width="3"/><path d="m25 23-4-16m20 16 4-16" stroke="#c99c57" stroke-width="3"/>' : '';
  const extra = p.id === 'charmander' ? '<path d="M45 51Q66 54 56 36" fill="none" stroke="#dc9058" stroke-width="8"/><path d="M55 38q-9-8 2-19 0 9 5 11 3 7-7 8" fill="#e7af43"/>' : p.id === 'squirtle' ? '<ellipse cx="39" cy="45" rx="17" ry="16" fill="#ab9064" stroke="#f1dfb2" stroke-width="3"/>' : '';
  return `<svg viewBox="0 0 64 64" aria-hidden="true">${ears}${extra}<ellipse cx="32" cy="48" rx="16" ry="14" fill="${p.color}"/><ellipse cx="32" cy="50" rx="9" ry="10" fill="#fff2ce" opacity=".7"/><ellipse cx="20" cy="57" rx="7" ry="4" fill="${p.color}"/><ellipse cx="44" cy="57" rx="7" ry="4" fill="${p.color}"/><ellipse cx="32" cy="32" rx="19" ry="17" fill="${p.color}"/><ellipse cx="24" cy="31" rx="2.3" ry="3.5" fill="#36463b"/><ellipse cx="40" cy="31" rx="2.3" ry="3.5" fill="#36463b"/><circle cx="24.5" cy="30" r=".8" fill="white"/><circle cx="40.5" cy="30" r=".8" fill="white"/><path d="M29 39q3 3 6 0" stroke="#615541" stroke-width="1.5" fill="none"/>${p.id === 'pikachu' ? '<circle cx="18" cy="38" r="4" fill="#d9755e"/><circle cx="46" cy="38" r="4" fill="#d9755e"/>' : ''}</svg>`;
}
for (const p of PRODUCERS) {
  const card = document.createElement('article'); card.className = 'shop-card'; card.id = `card-${p.id}`;
  card.innerHTML = `<div class="portrait" style="--pokemon-color:${p.color}">${portrait(p)}</div><div class="pokemon-info"><div class="pokemon-title"><h3>${p.name}</h3><span class="type">${p.type}</span></div><p>${p.description}</p><span class="production">+<b id="rate-${p.id}">${p.rate}</b> / sec <span class="owned">Owned <b id="owned-${p.id}">0</b></span></span></div><button class="buy" id="buy-${p.id}"></button>`;
  $('team-panel').append(card);
}
for (const u of UPGRADES) {
  const card = document.createElement('article'); card.className = 'shop-card'; card.id = `card-${u.id}`;
  card.innerHTML = `<div class="portrait" style="--pokemon-color:#a9bc7b;font-size:32px;color:#728a51">${u.icon}</div><div class="pokemon-info"><div class="pokemon-title"><h3>${u.name}</h3></div><p>${u.description}</p><span class="production">Level <b id="owned-${u.id}">0</b></span></div><button class="buy" id="buy-${u.id}"></button>`;
  $('upgrades-panel').append(card);
}
for (const item of [...PRODUCERS, ...UPGRADES]) $(`buy-${item.id}`).addEventListener('click', () => { tick(); if (buy(state, item.id)) { render(); save(); toast(`${item.name} ${PRODUCERS.includes(item) ? 'joined your team!' : 'upgraded!'}`); } });
const milestones = [{ target: 100, name: 'The first of many', description: 'Earn 100 Pokécoins to begin your trainer journey.' }, { target: 1000, name: 'Finding your stride', description: 'Earn 1,000 Pokécoins. Your adventure is taking shape.' }, { target: 10000, name: 'A rising trainer', description: 'Earn 10,000 Pokécoins with a little help from your friends.' }, { target: 100000, name: 'On the road to greatness', description: 'Earn 100,000 Pokécoins and leave your mark on Kanto.' }, { target: 1000000, name: 'A Kanto legend', description: 'Earn 1 million Pokécoins. This is what legends are made of.' }];
function render() {
  for (const [id, n] of Object.entries({ coins: state.coins, earned: state.earned, clicks: state.clicks, members: Object.values(state.team).reduce((a,b) => a+b,0), power: clickPower(state) })) $(id).textContent = format(n);
  $('rate').textContent = decimal(production(state));
  $('species-count').textContent = `${Object.values(state.team).filter(n => n > 0).length} / 6`;
  for (const p of [...PRODUCERS, ...UPGRADES]) {
    const owned = (PRODUCERS.includes(p) ? state.team : state.upgrades)[p.id], price = cost(p, owned), affordable = state.coins >= price && owned < 1000 && Number.isFinite(price);
    $(`owned-${p.id}`).textContent = owned; const button = $(`buy-${p.id}`);
    button.textContent = owned >= 1000 ? 'MAX' : `₽ ${format(price)}`; button.disabled = !affordable;
    button.setAttribute('aria-label', `Buy ${p.name} for ${decimal(price)} coins`);
    $(`card-${p.id}`).classList.toggle('affordable', affordable);
    if (p.rate) $(`rate-${p.id}`).textContent = decimal(p.rate * (1 + state.upgrades.berry * .25));
  }
  const m = milestones.find(m => state.earned < m.target) || milestones.at(-1);
  $('milestone-title').textContent = m.name; $('milestone-description').textContent = state.earned >= 1000000 ? 'Legend status achieved. Keep growing your dream team!' : m.description;
  $('milestone-count').textContent = `${format(Math.min(state.earned, m.target))} / ${format(m.target)}`;
  $('milestone-progress').style.width = `${Math.min(100, state.earned / m.target * 100)}%`;
}
function tick() { const now = Date.now(); earn(state, production(state) * Math.min(28800, Math.max(0, (now-lastTick)/1000))); lastTick = now; }
function handleClick() { tick(); const amount = click(state); render(); const floating = document.createElement('span'); floating.className = 'floating-coin'; floating.textContent = `+${format(amount)}`; floating.style.setProperty('--drift', `${Math.random()*70-35}px`); document.querySelector('.ball-zone').append(floating); setTimeout(() => floating.remove(), 850); }
$('pokeball').addEventListener('click', handleClick);
document.addEventListener('keydown', e => { if (e.code === 'Space' && !e.repeat && !['BUTTON','INPUT','TEXTAREA'].includes(document.activeElement.tagName) && !$('settings-dialog').open) { e.preventDefault(); handleClick(); } });
for (const name of ['team','upgrades']) $(`${name}-tab`).addEventListener('click', () => { for (const other of ['team','upgrades']) { $(`${other}-tab`).setAttribute('aria-selected', String(name === other)); $(`${other}-panel`).hidden = name !== other; } $('shop-description').textContent = name === 'team' ? 'Little companions. Big earning potential.' : 'Give every click and companion a little boost.'; });
$('settings').onclick = () => $('settings-dialog').showModal();
$('close-settings').onclick = () => $('settings-dialog').close();
$('save-now').onclick = () => { tick(); save(true); };
$('export-save').onclick = () => { tick(); state.savedAt = Date.now(); const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type:'application/json' })); const a = document.createElement('a'); a.href=url; a.download='poke-clicker-save.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Save exported. Keep it somewhere safe.'); };
$('import-save').onchange = async e => { const file=e.target.files[0]; if (!file) return; try { if (file.size > 100000) throw new Error(); const loaded = restore(await file.text()); state=loaded.state; lastTick=Date.now(); render(); save(); toast(`Adventure restored! ${format(loaded.offline)} offline coins collected.`); } catch { toast('That save is invalid. Your current adventure is unchanged.'); } e.target.value=''; };
$('reset').onclick = () => { $('reset-confirm').hidden=false; $('reset').hidden=true; };
$('cancel-reset').onclick = () => { $('reset-confirm').hidden=true; $('reset').hidden=false; };
$('confirm-reset').onclick = () => { state=fresh(); lastTick=Date.now(); save(); render(); $('cancel-reset').click(); $('settings-dialog').close(); toast('A new adventure begins. Make your first click!'); };
setInterval(() => { tick(); render(); }, 100);
setInterval(() => save(), 5000);
document.addEventListener('visibilitychange', () => { tick(); if (document.hidden) save(); else render(); });
window.addEventListener('pagehide', () => { tick(); save(); });
window.addEventListener('storage', e => { if (e.key === SAVE_KEY && e.newValue) { try { state = restore(e.newValue).state; lastTick=Date.now(); render(); } catch {} } });
render(); save();

