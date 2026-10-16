import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const channel = process.env.VITE_APP_CHANNEL ?? 'app';
const v1Key = `tenselab:${channel}:progress:v1`;
const key = `tenselab:${channel}:progress:v2`;
const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

test('migrates existing progress, records a complete drill and survives reload', async ({
  page,
}) => {
  const old = {
    done: 83,
    right: 61,
    streak: 4,
    today: localDate(),
    todayCount: 12,
  };
  await page.goto('./');
  await page.evaluate(
    ({ v1Key, old }) => localStorage.setItem(v1Key, JSON.stringify(old)),
    { v1Key, old },
  );
  await page.reload();
  await page
    .getByLabel('Таблица', { exact: true })
    .selectOption('presentPerfect');
  const advance = page.getByRole('button', {
    name: 'Следующая форма',
    exact: true,
  });
  await advance.click();
  await advance.click();
  await advance.click();
  await page.getByRole('link', { name: 'Мой прогресс' }).click();
  const lifetime = page.getByRole('region', { name: 'За всё время' });
  await expect(lifetime.getByText('83', { exact: true })).toBeVisible();
  await expect(lifetime.getByText('1', { exact: true })).toBeVisible();
  await expect(
    page.getByText(/В старой версии сохранено переводов за этот день: 12/),
  ).toBeVisible();
  await page.reload();
  const stored = await page.evaluate(
    ({ key, v1Key }) => ({
      data: JSON.parse(localStorage.getItem(key)!),
      old: JSON.parse(localStorage.getItem(v1Key)!),
      backups: Object.keys(localStorage).filter((k) => k.includes(':backup:')),
    }),
    { key, v1Key },
  );
  expect(stored.old).toEqual(old);
  expect(stored.data.totals).toEqual({
    done: 83,
    right: 61,
    streak: 4,
    drills: 1,
  });
  expect(stored.backups.length).toBe(1);
});

test('exports, previews, cancels and replaces backups without duplicate results', async ({
  page,
}) => {
  await page.goto('./#translation');
  await page.getByRole('button', { name: 'Показать ответ' }).click();
  await page.getByRole('button', { name: 'Получилось', exact: true }).click();
  await page.getByRole('link', { name: 'Мой прогресс' }).click();
  const download = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Скачать резервную копию', exact: true })
    .click();
  const file = await download;
  const payload = await readFile((await file.path())!, 'utf8');
  const exported = JSON.parse(payload);
  expect(exported.data.totals.done).toBe(1);
  const input = page.getByLabel('Импортировать JSON');
  const candidate = {
    ...exported,
    data: {
      ...exported.data,
      totals: { ...exported.data.totals, done: 7, right: 6 },
    },
  };
  await input.setInputFiles({
    name: 'progress.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(candidate)),
  });
  await expect(
    page.getByRole('group', { name: 'Проверка перед заменой' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Отмена', exact: true }).click();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).totals.done,
      key,
    ),
  ).toBe(1);
  for (let attempt = 0; attempt < 2; attempt++) {
    await input.setInputFiles({
      name: 'progress.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(candidate)),
    });
    await page
      .getByRole('button', { name: 'Заменить статистику', exact: true })
      .click();
  }
  await page.reload();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).totals.done,
      key,
    ),
  ).toBe(7);
  await page
    .getByRole('button', { name: 'Локальные резервные копии', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Проверить копию' }),
  ).toBeVisible();
  await input.setInputFiles({
    name: 'bad.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.getByText(/Не удалось прочитать копию:/)).toBeVisible();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).totals.done,
      key,
    ),
  ).toBe(7);
});

test('protects unknown stored versions while practising', async ({ page }) => {
  await page.goto('./');
  const raw = '{"version":99,"important":"preserve"}';
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key,
    raw,
  });
  await page.reload();
  await page.getByRole('link', { name: 'Перевод', exact: true }).click();
  await page.getByRole('button', { name: 'Показать ответ' }).click();
  await page.getByRole('button', { name: 'Получилось', exact: true }).click();
  await page.getByRole('link', { name: 'Мой прогресс' }).click();
  await expect(page.getByRole('alert')).toContainText('Она не перезаписана');
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(
    raw,
  );
  const original = page.waitForEvent('download');
  await page
    .getByRole('button', { name: 'Скачать исходную запись', exact: true })
    .click();
  expect(await readFile((await (await original).path())!, 'utf8')).toBe(raw);
});

test('selects historical days with keyboard and shows an accessible calendar in both themes', async ({
  page,
}, testInfo) => {
  await page.goto('./#progress');
  const today = localDate();
  const days: Record<
    string,
    { done: number; right: number; unknown: number; drills: number }
  > = {};
  let done = 0,
    right = 0,
    drills = 0;
  for (let index = 0; index < 100; index++) {
    const date = new Date(`${today}T12:00:00`);
    date.setDate(date.getDate() - index);
    const day = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const item = {
      done: index % 7 ? index % 17 : 0,
      right: index % 7 ? index % 11 : 0,
      unknown: 0,
      drills: index % 4,
    };
    item.right = Math.min(item.right, item.done);
    days[day] = item;
    done += item.done;
    right += item.right;
    drills += item.drills;
  }
  const data = {
    version: 2,
    totals: { done, right, drills, streak: 3 },
    days,
    historySince: Object.keys(days).sort()[0],
    legacyRecovered: false,
  };
  await page.evaluate(
    ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
    { key, data },
  );
  await page.reload();
  const cell = page.locator(`button[data-day="${today}"]:visible`);
  await cell.focus();
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Enter');
  const chosen = await page.getByLabel('Дата', { exact: true }).inputValue();
  expect(chosen < today).toBe(true);
  await page.getByLabel('Дата', { exact: true }).fill(today);
  await expect(
    page.getByRole('heading', { name: 'Сегодня', exact: true }),
  ).toBeVisible();
  for (const locale of ['Русский', 'English', 'Deutsch']) {
    await page.getByRole('button', { name: locale, exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Русский', exact: true }).click();
  await page.screenshot({
    path: testInfo.outputPath('progress-light.png'),
    fullPage: true,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Переключить цветовую тему' }).click();
  await page.screenshot({
    path: testInfo.outputPath('progress-dark.png'),
    fullPage: true,
    animations: 'disabled',
  });
});
