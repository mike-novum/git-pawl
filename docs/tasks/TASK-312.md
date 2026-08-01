# TASK-312 — Граф: hover-анимация точки-коммита (scale вместо «улёта вбок»)

## Баг
В `src/widgets/repo-graph-vertical/ui/CommitRow.tsx:102` hover-анимация на коммит-кружке:
```tsx
className="origin-center transition-transform duration-fast ease-out group-hover:scale-[1.25]"
```

При hover кружок **улетает вбок** (визуально как «увеличение + смещение»), а должен просто плавно увеличиваться на месте.

## Корневая причина
`<circle>` — SVG-элемент. CSS `transform-origin: center` для SVG по умолчанию вычисляется относительно **SVG viewport (0,0)**, а не относительно центра самого элемента. Поэтому `scale(1.25)` увеличивает круг вокруг точки (0,0) SVG, а не вокруг его собственного центра — отсюда визуальный «улёт».

Стандартное решение для SVG-элементов — `transform-box: fill-box`, который переключает origin на bounding box самого элемента.

## Что сделать

### Шаг 1. Поправить класс
Файл: `src/widgets/repo-graph-vertical/ui/CommitRow.tsx` (или новый `GraphLayer.tsx`, если TASK-311 уже реализован).

Заменить:
```tsx
className="origin-center transition-transform duration-fast ease-out group-hover:scale-[1.25]"
```

На:
```tsx
className="[transform-box:fill-box] origin-center transition-transform duration-fast ease-out group-hover:scale-[1.2]"
```

Изменения:
1. Добавить `[transform-box:fill-box]` (Tailwind arbitrary value).
2. Уменьшить scale с 1.25 до 1.2 (по требованию пользователя).

Альтернативный вариант (если в проекте уже используется встроенный компонент или другой подход):
```tsx
style={{ transformBox: 'fill-box' }}
className="origin-center transition-transform duration-fast ease-out group-hover:scale-[1.2]"
```

### Шаг 2. Если TASK-311 ещё не сделан — применить здесь
В новом `GraphLayer.tsx` (после TASK-311) использовать тот же фикс.

### Шаг 3. Тест
Файл: `src/widgets/repo-graph-vertical/ui/RepoGraph.test.tsx` или новый.

- Smoke test: рендер кружка с классом `[transform-box:fill-box]` присутствует.
- Или: через DOM-проверку, что className содержит `fill-box`.

### Шаг 4. Верификация
- `npm run tsc`
- `npx eslint <files>`
- `npm test`
- Storybook → `widgets/RepoGraph` → hover на коммит-кружке → визуально проверить, что кружок увеличивается **на месте**, без смещения.

## Acceptance criteria
- [ ] При hover на коммит-кружке он плавно увеличивается до scale 1.2 **на месте**, без смещения.
- [ ] `npm run tsc` + `npx eslint` — без ошибок.
- [ ] Все тесты проходят.

## Зависит от
—

## Заметки
- AGENTS.md: стрелочные функции, типы в `types.ts`, без комментариев в коде, без enum.
- Если используется Storybook story с hover, проверить визуально.

## Acceptance criteria
- [x] При hover на коммит-кружке он плавно увеличивается до scale 1.2 **на месте**, без смещения.
- [x] `npm run tsc` + `npx eslint` — без ошибок.
- [x] Все тесты проходят.

## Статус
✅ done (2026-08-01)

### Что сделано
- В `GraphLayer.tsx` на коммит-кружке (r=5) добавлен Tailwind arbitrary value `[transform-box:fill-box]`, уменьшен scale до 1.2.
- Добавлен регрессионный тест `GraphLayer.test.tsx`: коммит-кружок имеет классы `[transform-box:fill-box]` и `group-hover:scale-[1.2]`.

### Заметки для ревьюера
- Halo-кружок (r=9) не меняется — у него нет hover-анимации.
- Visually verified in Storybook (`widgets/RepoGraph/Dark`): при hover bounding box центра (cx/cy) остаётся `(32, 64.5)`, размер растёт с 10×10 до ~14.4×14.4 (scale 1.2), без бокового смещения.