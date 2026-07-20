# TASK-212 — WorkspaceHero: компактный info-блок

## Баг
В `src/pages/workspace/ui/WorkspaceHero.tsx` блок с информацией по репозиторию (путь, количество репозиториев, modified count, размер, иконка) занимает слишком много вертикального места и выглядит громоздко. Нужно сделать его компактнее — перенести path/repoCount/modified/size в более плотный layout (горизонтальная группа meta-чипов или одна строка с разделителями).

## Что сделать
1. Открыть `src/pages/workspace/ui/WorkspaceHero.tsx`.
2. Переработать layout:
   - Уменьшить иконку воркспейса (например, `size-10` вместо `size-14`).
   - Объединить meta-инфо в один компактный ряд под заголовком: `{repoCount} repos · {modifiedCount} modified · {formatBytes(sizeBytes)} · {path}` с `text-xs text-muted-foreground`, mono-шрифтом для path.
   - Либо вынести path в тултип/трейл.
3. Сохранить доступность: `title={workspace.path}` на path.

## Acceptance criteria
- [x] Hero выглядит заметно компактнее (высота уменьшена).
- [x] Вся информация (путь, счётчики, размер) по-прежнему видна и доступна.
- [x] `npm run tsc` + `eslint` проходят без ошибок.

## Зависит от
—

## Статус: DONE — компактный info-блок в шапке воркспейса

### Что сделано
- Иконка-контейнер уменьшена с `size-14` до `size-10`, иконка — с `size-7` до `size-5`, скругление с `rounded-xl` до `rounded-lg`.
- Внешний отступ между иконкой и текстовым блоком уменьшен с `gap-4` до `gap-3`, внутренний отступ между строками — с `gap-1` до `gap-0.5`.
- `path` перенесён в компактную mono-строку под заголовком с `text-muted-foreground/70 truncate font-mono text-xs` и сохранённым `title={workspace.path}` для тултипа.
- Meta-инфо (repoCount/modifiedCount/size) объединено в одну строку под path с `text-xs text-muted-foreground`.
- Кнопка Settings на правой стороне сохранена без изменений.

### Acceptance criteria (отметить выполненные)
- [x] Hero выглядит заметно компактнее (высота уменьшена).
- [x] Вся информация (путь, счётчики, размер) по-прежнему видна и доступна.
- [x] `npm run tsc` + `eslint` проходят без ошибок.

### Заметки для ревьюера
- Props и типы не изменялись — компонент использует существующий `WorkspaceHeroProps` из `src/pages/workspace/types.ts`.
- Кнопка Settings сохранена в исходном виде с тем же onClick.