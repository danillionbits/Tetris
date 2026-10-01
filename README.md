# Tetris

Tetris, built with React.

**Play it: https://danillionbits.github.io/Tetris/**

Originally written in 2019 on Create React App and React 16. Revived in 2026 on
Vite and React 19 — see [UPGRADE.md](UPGRADE.md) for what changed and why.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in build/
npm run preview  # serve the built bundle
```

## Controls

| Key | Action |
| --- | --- |
| ← → | Move |
| ↑ | Rotate |
| ↓ | Soft drop (hold) |
| C / Space | Hard drop |

An outline of the falling piece shows where it will land, so you can line it up
without counting columns.

Keyboard only — there are no touch controls yet, so it needs a real keyboard.

Click **Start Game** to play. Clearing lines scores Nintendo-style points
(40 / 100 / 300 / 1200 for 1–4 rows), multiplied by the current level; every
ten rows raises the level and the speed.
