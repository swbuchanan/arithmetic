# A customizable arithmetic speed drill

- Inspired by the classic https://arithmetic.zetamac.com/ but with more customization and a wider variety of problems.
- Save named settings presets in the browser and load them again later.
- Track completed scores on a separate history graph for each effective settings configuration.

Settings and attempt history stay in the current browser; no account or server is required.

## Run locally

From the repository root, run:

```bash
./src/build
```

Then open <http://localhost:8000>. Pass a different port as the first argument if needed, for example `./src/build 8080`.

## Test

```bash
npm test
tsc --noEmit --project src/tsconfig.json
```

## To do

- multiplayer????
