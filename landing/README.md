# Лендинг TenseLab и GitHub Pages

Исходники находятся отдельно в `landing/`. При публикации упаковщик копирует **содержимое** этой папки в корень GitHub Pages. Адрес не содержит `/landing/`.

Страница статическая: HTML, CSS, JavaScript и локальные WebP. Ей не нужны npm-сборка, внешние шрифты и серверный API. Кнопка «Начать практику» ведёт в `./app/#drill`.

## Публикация

1. Отправь `landing/`, изменения `scripts/package-pages.mjs` и документацию в ветку `main` на GitHub. Упаковщик и лендинг workflow всегда берёт из `main`.
2. Открой **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. В **Settings → Environments → github-pages** разреши deployment из `main` и `develop`, если на environment включены ограничения веток.
4. В **Actions → Frontend checks and Pages** дождись успешных проверок и задач `build-pages`, `package-pages`, `deploy`. При необходимости выбери **Run workflow** для `main`.
5. Открой адрес из Settings → Pages или результата job `deploy`.

Существующий workflow собирает две ветки, поэтому `main` и `develop` должны существовать на GitHub, содержать приложение с поддержкой `VITE_APP_CHANNEL` и успешно проходить проверки. Настройку двух окружений смотри также в `docs/deployment.md`.

При имени репозитория `TenseLab` адреса будут такими:

| Страница | Адрес |
| --- | --- |
| Лендинг | `https://USERNAME.github.io/TenseLab/` |
| Основное приложение из main | `https://USERNAME.github.io/TenseLab/app/` |
| Приложение из develop | `https://USERNAME.github.io/TenseLab/demo/` |
| Исходный HTML-тренажёр | `https://USERNAME.github.io/TenseLab/old/` |

Замени `USERNAME` на GitHub-логин или организацию. Для приватного репозитория проверь доступность Pages на своём тарифе.

Source должен быть **GitHub Actions**: публикуется подготовленный артефакт `dist/pages`, а не непосредственно папка исходников из ветки.

## Что делает упаковщик

```text
landing/index.html   → dist/pages/index.html
landing/styles.css   → dist/pages/styles.css
landing/script.js    → dist/pages/script.js
landing/assets/      → dist/pages/assets/
сборка main          → dist/pages/app/
сборка develop       → dist/pages/demo/
old/                 → dist/pages/old/
```

Документы `.md` из `landing/` в публикацию не попадают. Также создаётся `.nojekyll`. Корневой исходный `index.html` репозитория не используется для итоговой главной: источником служит `landing/index.html`.

## Собственный адрес

Префикс `/TenseLab/` — имя репозитория проектного сайта. Лендинг расположен в корне этого сайта. При переименовании репозитория исправь префикс в `frontend/vite.config.ts` и URL в `frontend/playwright.config.ts`; у лендинга все пути относительные.

Для сайта без имени репозитория в URL нужен репозиторий `USERNAME.github.io`. Тогда лендинг будет по адресу `https://USERNAME.github.io/`, приложение — `/app/`, demo — `/demo/`. В Vite измени base на `/${channel}/` вместо `/TenseLab/${channel}/`, затем аналогично обнови URL в Playwright.

Собственный домен настраивается в **Settings → Pages → Custom domain** и DNS. Если сайт должен работать в корне собственного домена, также убери префикс репозитория из base приложения и URL тестов.

## Локальный просмотр

Только дизайн: открой `landing/index.html` двойным кликом или запусти из корня:

```powershell
python -m http.server 8080
```

Затем открой `http://localhost:8080/landing/`. Упражнение и FAQ работают; ссылки в приложение рассчитаны на итоговую структуру публикации.

Для полной проверки после получения двух сборок:

```powershell
node scripts/package-pages.mjs dist/builds/app dist/builds/demo
python -m http.server 8080 --directory dist/pages
```

Лендинг будет на `http://localhost:8080/`. Для полноценной загрузки React-приложений с текущим base размести `dist/pages` под префиксом `/TenseLab/` локального сервера. Без этого префикса простой сервер позволяет проверить лендинг, но абсолютные пути ресурсов приложения будут отличаться от Pages.

В CI папки двух сборок готовятся автоматически. Не требуется вручную создавать `dist/pages` или коммитить её.

## Скриншоты и контент

Четыре WebP в `assets/` — настоящие экраны React-приложения TenseLab в светлой и тёмной темах. Они подписаны на странице. Сторонних фотографий, вымышленных отзывов и статистики эффективности нет. Пример первого экрана показывает девять сочетаний времени и формы и не записывает прогресс.

Для новых снимков запусти Vite preview и из корня `node scripts/capture-landing.mjs`. По умолчанию используются Edge и адрес `http://127.0.0.1:4173/TenseLab/app/`. Для другого адреса задай `CAPTURE_URL`, для браузера — `PLAYWRIGHT_CHANNEL`. Скрипт создаёт PNG: конвертируй их в WebP либо поменяй расширения в HTML. Для demo-сборки preview запускается с `VITE_APP_CHANNEL=demo` и соответствующим URL.

Дизайн и результаты проверок — в `DESIGN-REPORT.md` рядом с этим файлом.

## Официальная документация

- [Источник публикации и GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Создание GitHub Pages и структура адресов](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
