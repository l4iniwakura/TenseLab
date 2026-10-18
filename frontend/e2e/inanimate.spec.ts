import { test, expect } from '@playwright/test';

test('offers natural inanimate subjects through the existing translation filters', async ({
  page,
}) => {
  await page.goto('./#translation');
  await page.getByLabel('Таблица', { exact: true }).selectOption('all');
  await page
    .getByLabel('Время', { exact: true })
    .selectOption('presentPerfect');
  await page.getByLabel('Тип предложения', { exact: true }).selectOption('q');
  await page.getByLabel('Подлежащее', { exact: true }).selectOption('7');
  await expect(
    page.getByText('К настоящему моменту компьютер уже обработал данные?', {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: /^Показать ответ/ }).click();
  await expect(
    page.getByText('Has the computer processed data yet?', { exact: true }),
  ).toBeVisible();
  await page.getByLabel('Подлежащее', { exact: true }).selectOption('9');
  await page.getByRole('button', { name: /^Показать ответ/ }).click();
  await expect(
    page.getByText('Has the phone charged on the desk yet?', { exact: true }),
  ).toBeVisible();
});
