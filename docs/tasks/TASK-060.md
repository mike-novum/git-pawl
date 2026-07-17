# TASK-060 — Widget: terminal-output

## Цель
Виджет отображения stdout/stderr от git-команд.

## Что сделать
1. `src/widgets/terminal-output/ui/TerminalOutput.tsx`:
   - Список строк (ANSI-rendering через `ansi-to-react` или вручную).
   - Цветной вывод (stdout — серый, stderr — красный, info — синий).
   - Auto-scroll к последней строке.
2. Хранит последние ~5000 строк.

## Acceptance criteria
- [x] Корректно отображает progress (`Cloning into 'foo'...`).
- [x] ANSI-коды рендерятся цветом.

## Зависит от
- TASK-002

## Статус: DONE — terminal-output widget реализован

### Что сделано
- Создан слайс `src/widgets/terminal-output/` со структурой `ui/{TerminalOutput.tsx, types.ts, ansi.ts, index.ts}` + корневой `index.ts` (public API).
- Вручную реализован ANSI-парсер (`ui/ansi.ts`): поддерживает `\x1b[31m` (red), `\x1b[32m` (green), `\x1b[33m` (yellow), `\x1b[0m` (reset).
- Виджет рендерит каждую строку в `pre/code` с цветом по `kind`: stderr → red, stdout → muted-foreground (серый), info → blue.
- Auto-scroll к низу через `useEffect`+`useRef` при появлении новых строк.
- Буфер ограничен ~5000 строками через `slice(-maxLines)` в `useMemo` (дефолт `5000`).
- Стиль: стрелочные функции, `FC<TerminalOutputProps>`, типы в `types.ts`, literal types, без комментариев, импорты только из `shared/lib`.
- Проверено: `npm run tsc` clean, `eslint src/widgets/terminal-output` clean.

### Acceptance criteria (отметить выполненные)
- [x] Корректно отображает progress (`Cloning into 'foo'...`).
- [x] ANSI-коды рендерятся цветом.

### Заметки для ревьюера
- ANSI-коды ищем посимвольно (`charCodeAt(i) === 0x1b`), чтобы избежать regex-typing нюансов; поддерживается только однозначная форма `[<digits>m` (как и просили).
- Auto-scroll на каждое изменение `rendered` (новый контент = новый ref после `useMemo`), без throttling — для терминала достаточно.
- `parsedLines` кэшируются в `useMemo` совместно со слайсом буфера, чтобы не парсить заново на каждом ререндере.
- Виджет не импортирует из entities: `TerminalLine` живёт локально в `types.ts`, потому что entity для terminal-вывода в архитектуре пока не предусмотрено.
