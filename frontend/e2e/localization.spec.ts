import { test, expect } from '@playwright/test';

const channel = process.env.VITE_APP_CHANNEL ?? 'app';

test('switches languages immediately in all sections without resetting exercises', async ({
  page,
}, testInfo) => {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'warning') warnings.push(message.text());
  });
  await page.goto('./#reference');
  await page.getByRole('button', { name: 'Past Perfect', exact: true }).click();
  await page.getByLabel('Язык интерфейса').selectOption('de');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(
    page.getByRole('button', { name: 'Past Perfect', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('button', { name: 'Drill starten', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Past Perfect, Frage', exact: true })
    .click();
  const source = await page.locator('p[lang="en"]').first().textContent();
  await page.getByLabel('Sprache der Oberfläche').selectOption('en');
  await expect(
    page.getByRole('button', { name: 'Past Perfect, Question', exact: true }),
  ).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('p[lang="en"]').first()).toHaveText(source!);
  await expect(page.getByLabel('Table', { exact: true })).toHaveValue('custom');
  await page.getByRole('link', { name: 'Translation', exact: true }).click();
  await page.getByLabel('Your answer —').fill('Keep this answer');
  const russian = await page.locator('p[lang="ru"]').first().textContent();
  await page.getByLabel('Interface language').selectOption('de');
  await expect(page.getByLabel('Deine Antwort —')).toHaveValue(
    'Keep this answer',
  );
  await expect(page.locator('p[lang="ru"]').first()).toHaveText(russian!);
  await page.getByRole('button', { name: 'Antwort anzeigen' }).click();
  await expect(page.getByText(/Deine Antwort: Keep this answer/)).toBeVisible();
  await page.evaluate(() => {
    Math.random = () => 0.9;
  });
  await page.getByRole('button', { name: 'Noch einmal üben' }).click();
  await expect(
    page.getByText('In dieser Sitzung zu wiederholen: 1'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Farbschema wechseln' }).click();
  for (const section of [
    'Zeitformenübersicht',
    'Mein Fortschritt',
    'Schnelldrill',
    'Übersetzen',
  ]) {
    await page.getByRole('link', { name: section, exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: testInfo.outputPath('german.png'),
    fullPage: true,
  });
  await page.getByLabel('Sprache der Oberfläche').selectOption('ru');
  await expect(page.getByText('На повторение в этой сессии: 1')).toBeVisible();
  await page.getByLabel('Язык интерфейса').selectOption('en');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: 'My progress', exact: true }).click();
  await expect(
    page.getByText('Total completed', { exact: true }).locator('..'),
  ).toContainText('1');
  expect(
    await page.evaluate(
      (key) => localStorage.getItem(key),
      `tenselab:${channel}:uiLocale`,
    ),
  ).toBe('en');
  expect(
    warnings.filter((message) => message.includes('Missing UI translation')),
  ).toEqual([]);
});

test('detects browser locale and works with inaccessible localStorage', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ locale: 'de-AT' });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage blocked');
      },
    });
  });
  await page.goto(baseURL!);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.getByLabel('Sprache der Oberfläche').selectOption('en');
  await expect(
    page.getByRole('heading', { name: 'From rules to fluent practice.' }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Translation', exact: true }).click();
  await page.getByRole('button', { name: 'Show answer' }).click();
  await page.getByRole('button', { name: 'Got it right', exact: true }).click();
  await expect(page.getByRole('status')).toContainText(
    'The browser could not save your progress',
  );
  await context.close();
});

test('all bundled UI locales are available after an offline reload', async ({
  page,
  context,
}) => {
  test.skip(channel.startsWith('pr-'));
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
  await context.setOffline(true);
  await page.reload();
  for (const [locale, heading] of [
    ['de', 'Von der Regel zur Routine.'],
    ['en', 'From rules to fluent practice.'],
    ['ru', 'От правила — к автоматизму.'],
  ]) {
    await page.locator('header select').selectOption(locale);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
  }
});
