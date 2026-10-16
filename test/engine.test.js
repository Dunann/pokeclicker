import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, click, buy, production, clickPower, earn, restore, cost, PRODUCERS, UPGRADES } from '../dist/engine.js';
test('clicks earn coins; purchases debit balance and increase price', () => {
  const s = fresh(); for(let i=0;i<15;i++) click(s);
  assert.equal(s.coins,15); assert.equal(s.clicks,15);
  assert.equal(buy(s,'pikachu'),true); assert.equal(s.coins,0); assert.equal(s.team.pikachu,1);
  assert.equal(cost(PRODUCERS[0],1),18); assert.equal(buy(s,'pikachu'),false);
  assert.equal(production(s),1); earn(s,production(s)*10); assert.equal(s.coins,10);
});
test('all producers and upgrades apply their benefits with escalating costs', () => {
  const s=fresh(); earn(s,1000000);
  for (const p of PRODUCERS) { assert.ok(buy(s,p.id)); assert.ok(cost(p,1)>cost(p,0)); }
  assert.equal(production(s),2582);
  for (const u of UPGRADES) { assert.ok(buy(s,u.id)); assert.ok(cost(u,1)>cost(u,0)); }
  assert.equal(production(s),3227.5); assert.equal(clickPower(s),4); assert.equal(click(s),4);
});
test('save round-trip awards offline earnings once and caps them at eight hours', () => {
  const s=fresh(1000); s.team.pikachu=2;
  const restored=restore(JSON.stringify(s),61000);
  assert.equal(restored.offline,120); assert.equal(restored.state.coins,120);
  assert.equal(restore(JSON.stringify(restored.state),61000).offline,0);
  assert.equal(restore(JSON.stringify(s),1000+24*3600000).offline,57600);
  assert.equal(restore(JSON.stringify(s),0).offline,0);
});
test('malformed saves are rejected without altering current state', () => {
  assert.throws(()=>restore('bad json')); assert.throws(()=>restore('null'));
  const s=fresh(); s.team.pikachu=-1; assert.throws(()=>restore(JSON.stringify(s)));
  s.team.pikachu=1; s.coins='100'; assert.throws(()=>restore(JSON.stringify(s)));
  assert.equal(buy(fresh(),'not-a-pokemon'),false);
});
