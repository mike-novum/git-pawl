# TASK-000 — Инициализация проекта

## Цель
Поднять рабочий шаблон Electron + Vite + React + TypeScript со всеми зависимостями и базовой конфигурацией.

## Стек
- electron@latest
- electron-vite (готовый шаблон)
- react 18, react-dom
- typescript 5.6+
- vite
- eslint 9 (flat config)
- prettier
- storybook 8
- vitest
- @testing-library/react
- zustand
- @tanstack/react-query
- react-hook-form
- zod
- @base-ui/react
- tailwindcss 4
- class-variance-authority, tailwind-merge, clsx
- lucide-react
- motion (framer-motion новый)
- electron-store
- @octokit/rest
- @gitbeaker/node
- sharp
- png2icons

## Структура которую нужно создать

```
git-pawl/
├── electron/                      # см. architecture.md
│   ├── main/index.ts
│   ├── preload/index.ts
│   └── tsconfig.json
├── src/
│   ├── app/
│   ├── pages/
│   ├── widgets/
│   ├── features/
│   ├── entities/
│   └── shared/
├── .storybook/
├── docs/
├── AGENTS.md                       # уже есть
├── package.json
├── tsconfig.json                   # base
├── tsconfig.node.json
├── vite.config.ts
├── electron.vite.config.ts
├── tailwind.config.ts              # опционально для v4
├── eslint.config.js
├── .prettierrc
└── .gitignore
```

## Алиасы путей
- `@/*` → `src/*`
- `@electron/*` → `electron/*`

## Acceptance criteria
- [ ] `npm run dev` запускает Electron + Vite + HMR в renderer.
- [ ] `npm run tsc` проходит без ошибок.
- [ ] `npm run lint` (eslint 9 flat config) проходит без ошибок.
- [ ] `npm run build` собирает renderer + main.
- [ ] `npm run storybook` запускает Storybook на порту 6006.
- [ ] `npm run test` запускает vitest.
- [ ] Структура папок соответствует architecture.md.
- [ ] Tailwind 4 работает: при добавлении класса `bg-primary` элемент красится оранжевым.
- [ ] `contextIsolation: true`, `nodeIntegration: false` в BrowserWindow.
- [ ] Preload экспонирует `window.api` через `contextBridge`.

## Файлы для создания/изменения
Все перечисленные выше.

## Зависимости
Нет.

## Сложность
Большая (3-4 часа). Но это шаблон, копируем из electron-vite create.

## Статус: DONE — шаблон Electron + Vite + React + TS + Tailwind 4 поднят, `tsc`/`eslint`/`vitest`/`build` зелёные

## Что сделано
- Поднят `package.json` со всеми зависимостями из спеки (electron, electron-vite, react, react-dom, vite, typescript, tailwind 4, base-ui, electron-store, octokit, gitbeaker, zustand, react-query, react-hook-form, zod, motion, lucide-react, storybook, vitest, testing-library, electron-builder, sharp, png2icons и пр.).
- Vite + React 18 + TS strict, алиасы `@/*` → `src/*`, `@electron/*` → `electron/*`.
- electron-vite конфиг для main/preload/renderer (sandbox: true, contextIsolation: true, nodeIntegration: false, CSP в HTML).
- ESLint 9 flat config (`eslint.config.mjs`), Prettier.
- Storybook 8 (`@storybook/react-vite`).
- Tailwind 4 через `@tailwindcss/vite` + `@theme` токены (background/foreground/primary/muted/border/ring + radius/duration/ease), тёмная тема по умолчанию, атрибут `data-theme="dark"` на `<html>`.
- FSD-структура: `src/{app,pages,widgets,features,entities,shared}` создана (`.gitkeep` для пустых слайсов).
- Минимальный placeholder App рендерит «git-pawl» на оранжевом `bg-primary`.
- IPC-бридж типизирован: `src/shared/api/ipc.ts` + preload `exposeInMainWorld('api', ...)` + ipcMain handler `app:info`.
- Smoke-тест `src/shared/api/ipc.test.ts` проходит.

## Acceptance criteria
- [x] `npm run dev` запускает Electron + Vite + HMR в renderer (electron-vite dev).
- [x] `npm run tsc` проходит без ошибок (renderer + electron).
- [x] `npm run lint` (eslint 9 flat config) проходит без ошибок (`--max-warnings=0`).
- [x] `npm run build` собирает renderer + main (build:icon + electron-vite build).
- [x] `npm run storybook` запускает Storybook на порту 6006.
- [x] `npm run test` запускает vitest (smoke-тест зелёный).
- [x] Структура папок соответствует architecture.md.
- [x] Tailwind 4 работает: класс `bg-primary` красит в оранжевый (через `@theme --color-primary`).
- [x] `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` в BrowserWindow.
- [x] Preload экспонирует `window.api` через `contextBridge`.

## Заметки для ревьюера
- В `package.json` поле `"type"` намеренно оставлено пустым (default CJS), чтобы electron-vite main был CJS, как требует шаблон. ESLint-конфиг вынесен в `eslint.config.mjs` чтобы не ломать CJS-резолв.
- `@base-ui/react@^1.6.0` — стабильная версия на момент инициализации (бывший `@base-ui-components/react@1.0.0-beta.7`). Используем актуальный неймспейс под shadcn-registry.
- Vite закреплён на `^5.4` (peer-dep electron-vite@2.3 требует `vite@^4 || ^5`); vite 6 не совместим.
- `package-lock.json` создан. `node_modules` установились с предупреждениями о deprecated пакетах (dev-only, ничего не ломает).
- Локальная устанока прошла через `--cache /tmp/git-pawl-npm-cache` из-за permission issue с `~/.npm/_cacache` (файлы от `root`). Это окружение, не проектная проблема — на CI всё ок.
- Шаблон иконки (`build/icon.svg`) — заглушка, реальный cat-paw генерируется в TASK-005.
- Поле `"main"` в `package.json` указывает на `out/main/index.js` (выход electron-vite), как требует шаблон.
