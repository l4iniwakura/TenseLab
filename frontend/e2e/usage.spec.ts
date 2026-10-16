import { test, expect } from '@playwright/test';

const tenses = [
  'Present Simple',
  'Past Simple',
  'Future Simple',
  'Present Continuous',
  'Past Continuous',
  'Future Continuous',
  'Present Perfect',
  'Past Perfect',
  'Future Perfect',
  'Present Perfect Continuous',
  'Past Perfect Continuous',
  'Future Perfect Continuous',
];

test('all tense examples disclose in small portions and preserve the builder and running drill', async ({
  page,
}, testInfo) => {
  await page.goto('./#reference');
  const present = page.getByRole('button', {
    name: 'Present Simple',
    exact: true,
  });
  await present.click();
  await page.getByRole('button', { name: 'Начать дрилл', exact: true }).click();
  await page
    .getByRole('button', { name: 'Present Simple, Вопрос', exact: true })
    .click();
  await page
    .getByRole('link', { name: 'Выбрать времена в карте', exact: true })
    .click();
  const status = page.getByRole('status');
  await expect(status).toContainText(
    'Выбрано времён: 1 из 12 · форм в раунде: 3',
  );
  for (const tense of tenses) {
    const trigger = page.getByRole('button', {
      name: `Примеры: ${tense}`,
      exact: true,
    });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.focus();
    await trigger.press('Enter');
    const details = page.locator('#tense-usage');
    await expect(details).toBeFocused();
    await expect(details.getByRole('heading')).toContainText(tense);
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(details.getByRole('listitem')).toHaveCount(2);
    const situations = details
      .getByRole('group', { name: 'Ситуации применения' })
      .getByRole('button');
    await expect(situations).toHaveCount(2);
    const first = await details.locator('ol').textContent();
    await situations.nth(1).click();
    await expect(situations.nth(1)).toHaveAttribute('aria-pressed', 'true');
    expect(await details.locator('ol').textContent()).not.toBe(first);
    await details.getByText('Сравнить смысл', { exact: true }).click();
    await expect(details.locator('details')).toHaveAttribute('open', '');
    await expect(status).toContainText(
      'Выбрано времён: 1 из 12 · форм в раунде: 3',
    );
    await expect(present).toHaveAttribute('aria-pressed', 'true');
    expect(
      await details.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (tense === 'Future Perfect Continuous') {
      await details
        .locator('..')
        .screenshot({ path: testInfo.outputPath('map-with-examples.png') });
      await details.screenshot({ path: testInfo.outputPath('examples.png') });
      await details.getByRole('button', { name: 'Закрыть примеры' }).click();
    } else await details.press('Escape');
    await expect(details).toHaveCount(0);
    await expect(trigger).toBeFocused();
  }
  await page.getByRole('link', { name: 'Быстрый дрилл', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Present Simple, Вопрос', exact: true }),
  ).toHaveAttribute('aria-current', 'step');
});

test('switching example content and UI language keeps selection and shows one lesson', async ({
  page,
}) => {
  await page.goto('./#reference');
  await page.getByRole('button', { name: 'Past Perfect', exact: true }).click();
  await page
    .getByRole('button', { name: 'Примеры: Present Simple', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Примеры: Past Perfect', exact: true })
    .click();
  await expect(page.locator('#tense-usage')).toHaveCount(1);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('main')).not.toContainText(/[А-Яа-яЁё]/);
  await expect(
    page.getByRole('button', { name: 'Past Perfect', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Deutsch', exact: true }).click();
  await expect(page.locator('main')).not.toContainText(/[А-Яа-яЁё]/);
  await page
    .getByRole('button', { name: 'Beispiele schließen', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Beispiele: Past Perfect', exact: true }),
  ).toBeFocused();
  await page
    .getByRole('button', { name: 'Beispiele: Past Perfect', exact: true })
    .press('Space');
  await expect(page.locator('#tense-usage')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Past Perfect', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
});
