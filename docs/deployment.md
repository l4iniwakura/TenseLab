# GitHub Pages: app, demo и предпросмотры MR

Workflow `.github/workflows/frontend.yml` публикует один полный пакет сайта:

- `main` → `/TenseLab/app/`.
- `develop` → `/TenseLab/demo/`.
- Каждый открытый MR из ветки этого репозитория → `/TenseLab/pr-<номер>/`.
- Корневой выбор версии, `/landing/` и `/old/` берутся из `main`.

## Жизненный цикл предпросмотра

Открытие MR, новые коммиты и повторное открытие запускают проверки и публикацию. Закрытие MR, включая слияние, запускает пересборку без закрытого предпросмотра. Открытый MR собирается по точному SHA его head-коммита, основная и тестовая версии — по снимкам текущих main/develop.

Все публикации используют одну concurrency-группу и не прерывают выполняющийся deploy. Каждый запуск заново запрашивает список открытых MR, поэтому события, объединённые очередью Actions, не теряют очистку. Пропущенный из-за ошибки запуск можно повторить из Actions; ручной запуск из main/develop также восстанавливает весь набор.

Основные версии проходят format, lint, unit и Playwright desktop/mobile. Предпросмотры проходят те же проверки; ошибка отдельного MR исключает только его предпросмотр из нового пакета. Если сам MR не проходит первоначальный check, публикация этого события не запускается: прежний сайт остаётся доступен. При ошибке main/develop новый пакет не публикуется. Ссылки на успешно опубликованные предпросмотры находятся в summary задачи deploy. По адресу `pr-<номер>/preview.json` можно проверить номер MR и SHA сборки.

Fork MR проходят обычный check, но не публикуются на общем origin. Никакие шаги сборки не получают права Pages или сохранённые Git credentials. Только отдельная задача deploy получает `pages: write` и `id-token: write`; она не запускает код приложения.

## Первоначальное включение

1. Workflow и скрипты должны быть перенесены в **обе** ветки main и develop. Старый workflow из main собирает только app/demo и при следующем релизе удалит предпросмотры. Поддержка `VITE_APP_CHANNEL=pr-<номер>` должна быть в ветках открытых MR: старую ветку следует обновить из develop.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. В Settings → Environments → github-pages → Deployment branches and tags разрешить ветки `main`, `develop` и `refs/pull/*/merge` для публикаций из открытых и закрытых без слияния MR.
4. Запустить workflow из main/develop или обновить открытый MR. Дождаться deploy и открыть ссылку из summary.

`pull_request` содержит типы opened, synchronize, reopened и closed. В случае конфликтов слияния GitHub не запускает pull_request workflow до разрешения конфликта; существующий предпросмотр в это время не обновляется. GitHub Pages отдаёт новый пакет после завершения deployment, поэтому удаление и обновление не мгновенны.

## Изоляция данных и кеша

`VITE_APP_CHANNEL=app`, `demo` или `pr-<положительный номер>` задаётся при сборке. Vite проверяет значение и формирует base `/TenseLab/<channel>/`.

- localStorage: `tenselab:<channel>:progress:v1` и `tenselab:<channel>:theme`. Каждый MR имеет свои ключи; закрытие MR не стирает данные из браузера пользователя.
- Для app/demo сохраняется offline-режим: отдельные Workbox cacheId и scope service worker в каталоге версии.
- Для предпросмотров service worker отключён, чтобы обычная перезагрузка запрашивала текущую сборку и закрытый MR не продолжал открываться из офлайн-кеша.
- Это разделение данных приложения на одном origin, а не изоляция произвольного JavaScript.
- Старые общие ключи `tenselab-progress-v1` и `tenselab-theme` не удаляются и не читаются автоматически.

## Локальная проверка

```powershell
cd frontend
$env:VITE_APP_CHANNEL = 'pr-3' # либо app / demo
npm run build
npx playwright test --project=desktop --project=mobile
```

Для предпросмотров offline-тест заменяется проверкой отсутствия service worker. Из корня репозитория:

```powershell
node --test scripts/preview-plan.test.mjs scripts/package-pages.test.mjs
node scripts/package-pages.mjs builds/app builds/demo builds/previews
node --test scripts/pages.test.mjs
```

В `builds/previews/` находятся каталоги `preview-pr-3`, `preview-pr-4` и т. п. Отсутствие каталога предпросмотров допустимо. Упаковщик проверяет входные сборки до замены выходного каталога и каждый раз создаёт `dist/pages/` заново.
