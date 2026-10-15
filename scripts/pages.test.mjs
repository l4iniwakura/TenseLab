import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../dist/pages/', import.meta.url));
test('Pages publishes every entry point', () => {
  for (const entry of ['', 'app/', 'demo/', 'old/', 'landing/']) {
    assert.ok(existsSync(resolve(root, entry, 'index.html')), entry);
  }
});
test('landing links and local assets resolve within the project site', () => {
  const html = readFileSync(resolve(root, 'landing/index.html'), 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = new URL(match[1], 'https://example.org/TenseLab/landing/');
    if (target.origin !== 'https://example.org') continue;
    assert.ok(target.pathname.startsWith('/TenseLab/'), target.href);
    const relative = target.pathname.slice('/TenseLab/'.length);
    assert.ok(existsSync(resolve(root, relative, relative.endsWith('/') ? 'index.html' : '')), target.href);
  }
});
test('React builds reference independent app/demo asset paths', () => {
  assert.match(readFileSync(resolve(root, 'app/index.html'), 'utf8'), /\/TenseLab\/app\/assets\//);
  assert.match(readFileSync(resolve(root, 'demo/index.html'), 'utf8'), /\/TenseLab\/demo\/assets\//);
});
