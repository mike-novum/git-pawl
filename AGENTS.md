# Comments

- Не добавляй комментарии в коде, если я тебя не просил
- Не удаляй JSDoc и комментарии, которые были оставлены другими людьми

# Tests

После окончания своей работы запускай следующие проверки:
 - `npm run tsc` 
 - `npm run lint:fix` или `eslint . --fix --cache` по тем файлам, с которыми работал
 - после окончания работы проверяй что приложение запускается через `npm run dev` и что оно не крашится на главном экране
 - для проверки работоспособности функционала используй mcp: playwright и chrome-dev-tools

# Javascript

- используй для описания функций стрелочные функции вместо function

# Typescript

- use literal Types, dont use enums
- Типы и интерфейсы компонента выноси в отдельный файл **`types.ts`** в папке компонента (рядом с `index.tsx` / основным модулем), не раздувай файл разметки.

# React

- все компоненты делай через стрелочные функции
- для типизации компонента используй FC (`const MyComponent:FC<MyComponentProps>= ()=>{...}`)
- старайся минимизировать использование useEffect, useLayoutEffect, используй только если действительно без них нельзя сделать
- используй useCallbak, useMemo если это действительно необходимо, не оборачивай в них все подряд
- используй memo() только для сложных больших компонентов
- типы и интерфейсы компонентов выносить в отдельный файл `types.ts`

# Общий стиль 

- код должен быть простым и понятным для другого разработчика
- добавляй отступы в коде между блоками кода, разделяй их логически (код не должен превращаться в кашу)
- при именовании файлов, компонентов, функций старайся не использовать слишком много слов, 4-5 слов в названии это максимум за который лучше не заходить


# Git 

- Для коммитов используй Convetional Commits Angular anotation https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines

- Сообщения коммитов пиши на русском
- действие в сообщении коммита описывай через страдательные причастия (исправлен компонент Х, добавлен новый раздел Y)
- не делай коммиты слишком мелкими (желательно 1 бизнес-фича - 1 коммит)

- ветки называй по паттерну  `тип-задачи/краткое-описание-сути`, например `feat/list-of-repos` (типы задачи полностью повторяют type из Convetional Commits - build, chore, ci, test, feat, fix, perf, refactor, docs, style)

Расшифровка типов:
build: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
ci: Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
docs: Documentation only changes
feat: A new feature
fix: A bug fix
perf: A code change that improves performance
refactor: A code change that neither fixes a bug nor adds a feature
style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
test: Adding missing tests or correcting existing tests


# Конвенция имен
 
Придерживайся этой конвенции при именовании 

## Элементы кода

Названия React-компонентов - `PascalCase`

Названия типов и интерфейсов в Typescript - `PascalCase`

Названия классов - `PascalCase`

Название функций - `camelCase`

Название констант - `UPPER_SNAKE_CASE`

## Файлы

Файлы React компонентов - `PascalCase`

Файлы функций и утилит  - `camelCase`

Файлы классов - `PascalCase`

## Директории

### Верхняя структура каталогов

Верхнеуровневая структура стоится по такому паттерну согласно FSD:

src/{layer}/{slice}/{subslice}/{segment}

или 

src/{layer}/{slice}/{segment}

layer,slice, subslice segment -  `kebab-case`

Дополнительные группирующие директории - `kebab-case`

Директория React-компонентов - `PascalCase`


### Общие правила

- Функции обработки кликов - называть с префиксом `handle` в `camelCase`

Пример: `const handleSave = ()=>{}`

- Все скриншоты, которые делаешь во время работы складывай в папку screenshots (не складывай их в корне проекта)




