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
- [ ] Корректно отображает progress (`Cloning into 'foo'...`).
- [ ] ANSI-коды рендерятся цветом.

## Зависит от
- TASK-002
