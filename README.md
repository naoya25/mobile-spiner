# mobile spiner

3D fidget spinner PWA built with Vite, React, TypeScript, and `@react-three/fiber`.

## Features

- 3D spinner rendered with `@react-three/fiber`
- Two-finger mobile gesture: hold the center with one finger, flick with another
- Mouse drag fallback for desktop testing
- Inertia and friction-based spin
- PWA manifest and offline precache
- Light, dark, and system theme modes
- Japanese and English i18n foundation
- GitHub Pages deployment workflow

## Development

```bash
npm install
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```

## GitHub Pages

The Vite `base` is `/mobile-spiner/` when `GITHUB_REPOSITORY` is present, so the default workflow works for a repository named `mobile-spiner`.

If the repository name changes, update `base` in `vite.config.ts`.
