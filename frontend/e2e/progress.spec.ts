import { test, expect } from '@playwright/test';

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
  const metric = page.getByLabel('Показатель календаря');
  const mixedDay = Object.keys(days)[2];
  const mixedCell = page.locator(`button[data-day="${mixedDay}"]:visible`);
  await expect(metric).toHaveValue('all');
  await expect(mixedCell).toHaveAttribute('data-level', '2');
  await metric.selectOption('drills');
  await expect(mixedCell).toHaveAttribute('data-level', '1');
  await metric.selectOption('done');
  await expect(mixedCell).toHaveAttribute('data-level', '1');
  await metric.selectOption('all');
  await expect(mixedCell).toHaveAttribute('data-level', '2');
  // Index 4 has four translations and no drills; it must stay visible by default.
  const translationDay = Object.keys(days)[4];
  const translationCell = page.locator(
    `button[data-day="${translationDay}"]:visible`,
  );
  await expect(translationCell).toHaveAttribute('data-level', '2');
  await metric.selectOption('drills');
  await expect(translationCell).toHaveAttribute('data-level', '0');
  await metric.selectOption('done');
  await expect(translationCell).toHaveAttribute('data-level', '2');
  await metric.selectOption('all');
  await expect(translationCell).toHaveAttribute('data-level', '2');
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
