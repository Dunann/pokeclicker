# Poké Clicker

A small Pokémon-inspired idle game built with plain HTML, CSS and JavaScript. No build step or package installation required. The Node server uses only built-in modules.

## Run

Requires Node.js 20 or newer. From this folder:

```sh
npm start
```

Open **http://localhost:3000**. Stop the server with Ctrl+C.

```sh
npm test
```

## Play

- Click or tap the Pokéball to earn Pokécoins. Space also clicks when no other control is focused.
- Recruit six Pokémon that generate coins automatically. Every purchase increases that species' price by 15% (rounded up).
- Open Upgrades for trainer gloves (+1 base click power), lucky berries (+25% base team production), and Great Ball training (+100% base click power). Upgrade prices multiply by 2.2 per level. Bonuses within each upgrade are additive; gloves and Great Ball bonuses multiply together.
- Follow lifetime-earning milestones up to one million coins.
- Progress saves locally every five seconds, after purchases, and when leaving. Reopening the same browser and origin restores your game and awards up to eight hours of offline production.
- The gear menu provides manual save, JSON export/import, and a confirmed reset. Import replaces current progress. Use an export to transfer between browsers or devices. Clearing browser site data removes the local save.

The responsive interface uses original SVG character illustrations and CSS scenery. Google Fonts is optional; fallback fonts work without a network connection. All gameplay and artwork are local. This unofficial fan project is not affiliated with Nintendo, Game Freak, or The Pokémon Company.

## Publish later

Upload the contents of `dist/` to any static web host. No Node server or build step is needed in production. Local saves belong to the browser and site origin, so export your local game and import it on the hosted site to transfer progress. Accounts and cross-device synchronization would require a backend.

## Verification

Four automated tests cover clicking, purchases and rising prices, every producer and upgrade, save restoration, offline earnings and its eight-hour cap, and malformed-save rejection. Chrome interaction checks verified clicking, a Pokémon purchase, automatic earnings, an upgrade purchase, manual save, persistence after reload, and a 390px mobile viewport without horizontal overflow. No JavaScript errors were reported during those checks.
