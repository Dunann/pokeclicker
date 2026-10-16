export const PRODUCERS = [
  { id: 'pikachu', name: 'Pikachu', type: 'ELECTRIC', color: '#f5c841', cost: 15, rate: 1, description: 'A little spark. A lot of potential.' },
  { id: 'bulbasaur', name: 'Bulbasaur', type: 'GRASS', color: '#73b896', cost: 100, rate: 6, description: 'Growing your fortune, naturally.' },
  { id: 'charmander', name: 'Charmander', type: 'FIRE', color: '#ec9867', cost: 550, rate: 25, description: 'Putting a little fire in your hustle.' },
  { id: 'squirtle', name: 'Squirtle', type: 'WATER', color: '#7ab7d1', cost: 2500, rate: 100, description: 'A steady stream of Pokécoins.' },
  { id: 'eevee', name: 'Eevee', type: 'NORMAL', color: '#bd9873', cost: 12000, rate: 450, description: 'Small paws. Endless possibilities.' },
  { id: 'dragonite', name: 'Dragonite', type: 'DRAGON', color: '#dfb467', cost: 60000, rate: 2000, description: 'Taking your earnings to new heights.' },
];
export const UPGRADES = [
  { id: 'gloves', name: 'Trainer gloves', description: '+1 coin per click', cost: 30, icon: '✦' },
  { id: 'berry', name: 'Lucky berries', description: '+25% team production', cost: 150, icon: '♧' },
  { id: 'ball', name: 'Great Ball training', description: '+100% click power', cost: 500, icon: '◉' },
];
export const SAVE_KEY = 'poke-clicker-v1';
export const fresh = (now = Date.now()) => ({ version: 1, coins: 0, earned: 0, clicks: 0, team: Object.fromEntries(PRODUCERS.map(p => [p.id, 0])), upgrades: { gloves: 0, berry: 0, ball: 0 }, savedAt: now });
export const cost = (item, owned) => Math.ceil(item.cost * Math.pow(PRODUCERS.includes(item) ? 1.15 : 2.2, owned));
export const clickPower = s => (1 + s.upgrades.gloves) * (1 + s.upgrades.ball);
export const production = s => PRODUCERS.reduce((sum, p) => sum + p.rate * s.team[p.id], 0) * (1 + s.upgrades.berry * .25);
export function earn(s, amount) { if (Number.isFinite(amount) && amount > 0) { s.coins += amount; s.earned += amount; } }
export function click(s) { s.clicks++; const amount = clickPower(s); earn(s, amount); return amount; }
export function buy(s, id) {
  const item = [...PRODUCERS, ...UPGRADES].find(p => p.id === id);
  if (!item) return false;
  const group = PRODUCERS.includes(item) ? s.team : s.upgrades;
  const price = cost(item, group[id]);
  if (!Number.isFinite(price) || s.coins < price || group[id] >= 1000) return false;
  s.coins -= price; group[id]++; return true;
}
export function restore(raw, now = Date.now()) {
  const data = JSON.parse(raw);
  if (!data || data.version !== 1) throw new Error('Unsupported save');
  const s = fresh(now);
  for (const key of ['coins', 'earned', 'clicks', 'savedAt']) {
    if (!Number.isFinite(data[key]) || data[key] < 0 || data[key] > Number.MAX_SAFE_INTEGER) throw new Error('Invalid save');
    s[key] = data[key];
  }
  for (const group of ['team', 'upgrades']) for (const key in s[group]) {
    const n = data[group]?.[key];
    if (!Number.isInteger(n) || n < 0 || n > 1000) throw new Error('Invalid save');
    s[group][key] = n;
  }
  const seconds = Math.min(8 * 3600, Math.max(0, (now - s.savedAt) / 1000));
  const offline = production(s) * seconds;
  earn(s, offline); s.savedAt = now;
  return { state: s, offline, seconds };
}
