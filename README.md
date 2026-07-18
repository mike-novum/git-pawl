# git-pawl

Десктопный GUI-клиент для Git и удалённых репозиториев под macOS. Позволяет
работать с локальными репозиториями и подключёнными GitHub/GitLab-аккаунтами
в едином приложении вместо терминала и веб-интерфейсов.

## Требования

- Node.js ≥ 20
- macOS — основная целевая платформа; запуск на Linux/Windows возможен,
  но не является основным сценарием

## Запуск в dev

```bash
npm install
npm run dev
```

После установки зависимостей команда `npm run dev` откроет приложение в
Electron-окне с hot-reload — изменения в коде подхватываются автоматически.

## Полезные команды для разработки

```bash
npm run tsc         # проверка типов
npm run lint        # линт по всему проекту
npm run lint:fix    # линт с авто-фиксами
npm run test        # одноразовый прогон тестов
npm run test:watch  # тесты в watch-режиме
npm run storybook   # UI-доки на http://localhost:6006
```

## Сборка дистрибутива

```bash
npm run build    # собрать main / preload / renderer в out/
npm run dist     # упаковать установщик под текущую ОС
npm run dist:mac # упаковать только .dmg для macOS
```

`npm run dist` собирает установщик под платформу, на которой запущен:
`.dmg` на macOS, `.exe` на Windows, `.AppImage` на Linux. Готовые артефакты
складываются в `dist/`. Сборка выходит unsigned — для подписи и нотаризации
нужно добавить сертификаты и параметры секции `build` в `package.json`
(см. документацию `electron-builder`).
