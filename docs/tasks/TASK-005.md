# TASK-005 — Иконка приложения (cat paw)

## Цель
Сгенерировать иконку приложения — оранжевую лапу кота в сметане.

## Что сделать

1. Создать `assets/icon.svg` — лапа кота, оранжевая (близко к primary-токену), на белом (сметана) фоне.
2. Написать `scripts/build-icon.ts`:
   - читает `assets/icon.svg`
   - через `sharp` ресайзит в `assets/icon.png` (1024×1024 master)
   - генерирует `build/icon.png` (512×512 standard)
   - через `png2icons` создаёт `build/icon.icns`
3. Прописать `npm run build:icon` скрипт в `package.json`.
4. В `electron/main/index.ts`:
   - `BrowserWindow({ icon: path.join(__dirname, '../../build/icon.png') })`
   - на macOS `app.dock.setIcon(...)` тоже из этого файла.
5. История в Storybook `Icons / AppIcon` — отображает SVG.

## Acceptance criteria
- [ ] SVG-исходник читается человеком, цвета совпадают с primary-токеном.
- [ ] `npm run build:icon` создаёт `build/icon.png` и `build/icon.icns`.
- [ ] В окне Electron при запуске отображается иконка лапы.
- [ ] В Dock macOS тоже видна иконка.

## Зависит от
- TASK-000

## Файлы
- `assets/icon.svg`
- `scripts/build-icon.ts`
- `build/icon.png`, `build/icon.icns` (генерируются)
- `electron/main/index.ts` (изменение — setIcon)
