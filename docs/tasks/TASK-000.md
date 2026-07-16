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
- @base-ui-components/react
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
