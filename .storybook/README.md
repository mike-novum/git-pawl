# Storybook

Storybook для UI-кита и виджетов `git-pawl`.

## Запуск

```bash
npm run storybook          # dev server на http://localhost:6006
npm run build-storybook    # статическая сборка в storybook-static/
```

## Конфигурация

- `main.ts` — регистрирует истории из `src/**/*.stories.@(ts|tsx)`.
- `preview.tsx` — глобальные декораторы и параметры:
  - `ThemeProvider` оборачивает каждую историю.
  - Глобальная переменная `theme` (dark/light) управляется из toolbar и
    выставляет `document.documentElement[data-theme]`.
  - `parameters.backgrounds.disable = false` — фоны Storybook активны
    (для корректной работы требуется `@storybook/addon-essentials`).
  - По умолчанию тема — `dark`.

## Где размещать истории

Истории лежат рядом с компонентом по FSD-конвенции:

```
src/shared/ui/button/Button.tsx
src/shared/ui/button/Button.stories.tsx
```

`title` лучше выбирать в формате слоя:

- `UI/Button`, `UI/Dialog` — для `shared/ui/<name>`.
- `shared/ui/ThemeToggle` — допустимо для legacy-историй.
- `shared/lib/theme` — для сервисных историй.
- `Pages/<Name>` — для страниц из `src/pages/`.

## Как писать историю

```tsx
import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Click me'
  }
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true }
};
```

### Когда нужны свои декораторы

Глобально уже подключён `ThemeProvider`. Дополнительные декораторы
добавляйте точечно — например, `MemoryRouter` для страниц:

```tsx
const meta: Meta<typeof RepositoryPage> = {
  title: 'Pages/Repository',
  component: RepositoryPage,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/repo/sample']}>
        <Story />
      </MemoryRouter>
    )
  ]
};
```

### Когда нужны мок-данные или стор

Используйте локальные `decorators` истории или прямо `render`-функцию —
не тяните глобальный стор в Storybook, если этого можно избежать.

## Переключение темы

В toolbar Storybook выберите `Theme` → `Dark` / `Light`.
Глобальная переменная `theme` прокинется в `ThemeProvider` и применится
через `document.documentElement[data-theme]`. CSS-переменные из
`src/app/styles/theme.css` и `light.css` переключатся автоматически.
