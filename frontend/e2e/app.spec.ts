import { test, expect } from '@playwright/test';

test('builds a custom drill from the tense map and keeps the selection when editing', async ({
  page,
}) => {
  await page.goto('./#reference');
  const start = page.getByRole('button', { name: 'Начать дрилл', exact: true });
  await expect(start).toBeDisabled();
  await expect(page.getByRole('checkbox')).toHaveCount(0);
  const present = page.getByRole('button', {
    name: 'Present Simple',
    exact: true,
  });
  await present.click();
  await expect(present).toHaveAttribute('aria-pressed', 'true');
  await present.press('Space');
  await expect(present).toHaveAttribute('aria-pressed', 'false');
  await expect(page).toHaveURL(/#reference$/);
  await page
    .getByRole('button', { name: 'Present Simple', exact: true })
    .click();
  await page.getByRole('button', { name: 'Past Perfect', exact: true }).click();
  await page.getByRole('button', { name: '? Вопрос', exact: true }).click();
  await expect(page.getByRole('status')).toContainText(
    'Выбрано времён: 2 из 12 · форм в раунде: 6',
  );
  await start.click();
  await expect(page).toHaveURL(/#drill$/);
  await expect(page.getByLabel('Таблица', { exact: true })).toHaveValue(
    'custom',
  );
  const round = page.getByRole('complementary');
  await expect(round.getByRole('button')).toHaveCount(7);
  await expect(round).not.toContainText('Future');
  await page.getByLabel('Порядок').selectOption('random');
  await page.getByRole('button', { name: 'Новая фраза', exact: true }).click();
  await expect(round.getByRole('button')).toHaveCount(7);
  await page.getByRole('link', { name: 'Выбрать времена в карте' }).click();
  await expect(
    page.getByRole('button', { name: 'Past Perfect', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Выбрать все', exact: true }).click();
  await expect(
    page
      .getByRole('region', { name: 'Карта двенадцати времён' })
      .getByRole('button', { pressed: true }),
  ).toHaveCount(12);
  await page.getByRole('button', { name: 'Снять выбор', exact: true }).click();
  await expect(start).toBeDisabled();
  await page
    .getByRole('button', { name: 'Future Continuous', exact: true })
    .click();
  await start.click();
  await expect(round.getByRole('button')).toHaveCount(4);
  await page.getByLabel('Таблица', { exact: true }).selectOption('simple');
  await expect(round.getByRole('button')).toHaveCount(10);
});

test('formulas stay visible before answers and follow tense and form selection', async ({
  page,
}) => {
  await page.goto('./#drill');
  const stage = page
    .locator('[aria-live="polite"]')
    .filter({ has: page.locator('[aria-label^="Формула:"]') });
  await expect(stage.locator('[aria-label^="Формула:"]')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Показать ответ' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Present Simple, Отрицание', exact: true })
    .click();
  await expect(stage).toContainText('not');
  await expect(stage).toContainText('V1');
  await page
    .getByRole('button', { name: 'Past Simple, Вопрос', exact: true })
    .click();
  await expect(stage.locator('[aria-label^="Формула:"]')).toHaveAttribute(
    'aria-label',
    'Формула: did + S + V1 ?',
  );
  await page.getByRole('link', { name: 'Карта времён' }).click();
  const map = page.getByRole('region', { name: 'Карта двенадцати времён' });
  await expect(map.locator('[aria-label^="Формула:"]')).toHaveCount(12);
  await page.getByRole('button', { name: '? Вопрос', exact: true }).click();
  await expect(map.locator('[aria-label^="Формула:"]')).toHaveCount(12);
  await expect(
    map.locator('[aria-label="Формула: will + S + have + been + V-ing ?"]'),
  ).toBeVisible();
  const matrix = page.getByRole('region', {
    name: 'Подробная таблица конструкций',
  });
  await page.getByLabel('Таблица', { exact: true }).selectOption('all');
  await expect(matrix.locator('[aria-label^="Формула:"]')).toHaveCount(36);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test('drill navigation, keyboard controls, theme and table selection', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('./');
  await expect(
    page.getByRole('heading', { name: 'От правила — к автоматизму.' }),
  ).toBeVisible();
  await page.locator('body').click({ position: { x: 1, y: 1 } });
  await page.keyboard.press('Space');
  await expect(
    page.getByRole('button', { name: 'Скрыть ответ' }),
  ).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('button', {
      name: 'Present Simple, Отрицание',
      exact: true,
    }),
  ).toHaveAttribute('aria-current', 'step');
  await page.getByLabel('Таблица', { exact: true }).selectOption('all');
  await expect(page.getByRole('complementary').getByRole('button')).toHaveCount(
    37,
  );
  await page.getByRole('button', { name: 'Переключить цветовую тему' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test('saved progress, translation filters and reference links', async ({
  page,
}) => {
  await page.addInitScript(
    (channel) =>
      localStorage.setItem(
        `tenselab:${channel}:progress:v1`,
        JSON.stringify({
          done: 8,
          right: 6,
          streak: 2,
          today: '',
          todayCount: 0,
        }),
      ),
    process.env.VITE_APP_CHANNEL ?? 'app',
  );
  await page.goto('./#progress');
  await expect(page.getByText('75 %', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Перевод', exact: true }).click();
  await page.getByLabel('Таблица', { exact: true }).selectOption('perfect');
  await page.getByLabel('Время', { exact: true }).selectOption('pastPerfect');
  await page.getByLabel('Тип предложения').selectOption('q');
  await page.getByLabel('Местоимение').selectOption('3');
  await expect(
    page.getByText('Past Perfect · Вопрос', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Твой вариант').fill('My own answer');
  await page.getByRole('button', { name: 'Показать ответ' }).click();
  await expect(page.getByText(/Твой ответ: My own answer/)).toBeVisible();
  // Keep the failed exercise queued rather than randomly retrying it immediately.
  await page.evaluate(() => {
    Math.random = () => 0.9;
  });
  await page.getByRole('button', { name: 'Нужно повторить' }).click();
  await expect(
    page.getByText(/На повторение в этой сессии: [01]/),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Карта времён' }).click();
  await page
    .getByRole('button', { name: 'Future Continuous', exact: true })
    .click();
  await expect(page).toHaveURL(/#reference$/);
  await page.getByRole('button', { name: 'Начать дрилл', exact: true }).click();
  await page.goBack();
  await expect(
    page.getByRole('heading', { name: 'Вся система перед глазами.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Мой прогресс' }).click();
  await expect(page.getByText('67 %', { exact: true })).toBeVisible();
});

test('speech synthesis is user initiated and scoped to the current activity', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const utterances: { text: string; lang: string; rate: number }[] = [];
    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        cancel() {},
        speak(utterance: SpeechSynthesisUtterance) {
          utterances.push({
            text: utterance.text,
            lang: utterance.lang,
            rate: utterance.rate,
          });
        },
      },
      configurable: true,
    });
    Object.assign(window, { testUtterances: utterances });
  });
  await page.goto('./');
  await page.getByRole('button', { name: 'Озвучить', exact: true }).click();
  const utterances = await page.evaluate(
    () =>
      (
        window as unknown as {
          testUtterances: { text: string; lang: string; rate: number }[];
        }
      ).testUtterances,
  );
  expect(utterances).toHaveLength(1);
  expect(utterances[0].lang).toBe('en-GB');
  expect(utterances[0].rate).toBeCloseTo(0.85);
  expect(utterances[0].text).toContain('every day');
});

test('preview reloads use the network and never register an offline service worker', async ({
  page,
}) => {
  test.skip(!process.env.VITE_APP_CHANNEL?.startsWith('pr-'));
  await page.goto('./');
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'От правила — к автоматизму.' }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      async () => (await navigator.serviceWorker.getRegistrations()).length,
    ),
  ).toBe(0);
});

test('production cache supports offline reload within the React subpath', async ({
  page,
  context,
  baseURL,
}) => {
  test.skip(
    process.env.VITE_APP_CHANNEL?.startsWith('pr-') === true,
    'MR previews use the network instead of an offline service worker',
  );
  await page.goto('./');
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => Boolean(navigator.serviceWorker.controller)),
    )
    .toBe(true);
  const scope = await page.evaluate(
    async () => (await navigator.serviceWorker.ready).scope,
  );
  expect(scope).toBe(baseURL);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'От правила — к автоматизму.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Перевод', exact: true }).click();
  await page.getByRole('button', { name: 'Показать ответ' }).click();
  await expect(
    page.getByRole('button', { name: 'Получилось', exact: true }),
  ).toBeVisible();
});
