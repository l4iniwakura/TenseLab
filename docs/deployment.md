# GitHub Pages: app и demo

Workflow хранится в `.github/workflows/frontend.yml`. Это YAML-конфигурация GitHub Actions, версионируемая вместе с исходниками. `on` задаёт события запуска, `jobs` — задачи, `steps` — команды и готовые Actions.

## Публикация

- `main` → `/TenseLab/app/`.
- `develop` → `/TenseLab/demo/`.
- Лендинг из `landing/` в ветке `main` публикуется в `/TenseLab/landing/`. Корневой `index.html` содержит выбор версии, а `old/` — исходный HTML. Эти файлы также берутся из `main`.
- Push в любую из двух веток запускает проверки и сборку обеих веток. Обе сборки проходят unit-тесты и Playwright на desktop/mobile, включая offline reload.
- `scripts/package-pages.mjs` копирует лендинг в `dist/pages/landing/`, а сборки — в `dist/pages/app/` и `dist/pages/demo/`. Только полный пакет загружается через `upload-pages-artifact` и публикуется через `deploy-pages`.
- Публикации используют общую concurrency-группу; параллельные запуски не перезаписывают сайт одновременно. При ошибке любой сборки существующий сайт остаётся опубликованным.
- Pull request запускает проверки без публикации. Ручная публикация разрешена workflow только из `main` или `develop`.

## Первый запуск

1. Добавить изменения frontend, скрипт упаковки и workflow в `main`, затем перенести их в `develop`. Обе ветки должны существовать на GitHub и содержать приложение с поддержкой `VITE_APP_CHANNEL`.
2. В Settings → Pages → Build and deployment выбрать Source: GitHub Actions.
3. В Settings → Environments → github-pages разрешить deployment из `main` и `develop`. Если остаётся правило «только default branch», запуск из `develop` будет заблокирован.
4. Запустить workflow из main либо отправить push. В Actions можно смотреть этапы, логи и причины ошибок.

В текущем локальном checkout ветки `develop` пока нет. Этот набор изменений сам по себе не создаёт удалённую ветку и не переключает настройки GitHub.

## Изоляция данных

`VITE_APP_CHANNEL=app` или `demo` задаётся при сборке. Без переменной используется app. Vite проверяет допустимые значения и формирует base и scope `/TenseLab/<channel>/`.

- localStorage: `tenselab:app:progress:v1`, `tenselab:app:theme`; для demo — `tenselab:demo:progress:v1`, `tenselab:demo:theme`.
- Workbox cacheId: `tenselab-app` и `tenselab-demo`. Регистрация service worker ограничена каталогом соответствующей версии. Очистка устаревших precache ограничена scope регистрации.
- Старые общие ключи `tenselab-progress-v1` и `tenselab-theme` не удаляются и не подхватываются автоматически. Обе версии начинают со своего сохранения.
- Это разделение данных приложения на одном origin, а не защита от произвольного JS-кода: доступ к localStorage и Cache Storage технически общий для домена.

Локально в PowerShell:

```powershell
cd frontend
$env:VITE_APP_CHANNEL = 'demo' # либо app
npm run build
npx playwright test --project=desktop --project=mobile
```

Для локальной упаковки готовых сборок из корня репозитория:

```powershell
node scripts/package-pages.mjs dist/builds/app dist/builds/demo
```
