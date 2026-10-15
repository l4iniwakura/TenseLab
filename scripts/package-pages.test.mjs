import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packagePages } from './package-pages.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'tenselab-package-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (directory, text) => {
    mkdirSync(join(root, directory), { recursive: true });
    writeFileSync(join(root, directory, 'index.html'), text);
  };
  for (const name of ['app-build', 'demo-build', 'landing', 'old']) write(name, name);
  writeFileSync(join(root, 'index.html'), 'selection');
  writeFileSync(join(root, 'landing', 'README.md'), 'not public');
  return {
    root, write,
    options: { appBuild: join(root, 'app-build'), demoBuild: join(root, 'demo-build'), previewsDir: join(root, 'previews'), contentRoot: root, destination: join(root, 'published') },
  };
}

test('publishes multiple previews alongside app/demo and preserves main content', (t) => {
  const { root, write, options } = fixture(t);
  write('previews/preview-pr-3', 'commit-a');
  write('previews/preview-pr-8', 'commit-b');
  assert.deepEqual(packagePages(options), [3, 8]);
  for (const directory of ['app', 'demo', 'landing', 'old', 'pr-3', 'pr-8']) {
    assert.ok(existsSync(join(root, 'published', directory, 'index.html')));
  }
  assert.equal(readFileSync(join(root, 'published/pr-3/index.html'), 'utf8'), 'commit-a');
  assert.equal(existsSync(join(root, 'published/landing/README.md')), false);
});

test('updates new commits and removes a closed PR without deleting other versions', (t) => {
  const { root, write, options } = fixture(t);
  write('previews/preview-pr-3', 'old commit');
  write('previews/preview-pr-8', 'other PR');
  packagePages(options);
  write('previews/preview-pr-3', 'new commit');
  packagePages(options);
  assert.equal(readFileSync(join(root, 'published/pr-3/index.html'), 'utf8'), 'new commit');
  rmSync(join(root, 'previews/preview-pr-3'), { recursive: true });
  packagePages(options);
  assert.equal(existsSync(join(root, 'published/pr-3')), false);
  assert.equal(readFileSync(join(root, 'published/pr-8/index.html'), 'utf8'), 'other PR');
  rmSync(options.previewsDir, { recursive: true });
  assert.deepEqual(packagePages(options), []);
  assert.ok(existsSync(join(root, 'published/app/index.html')));
  assert.equal(existsSync(join(root, 'published/pr-8')), false);
});

test('validates all builds before replacing an existing publication', (t) => {
  const { root, write, options } = fixture(t);
  packagePages(options);
  write('previews/app', 'must not replace app');
  assert.throws(() => packagePages(options), /Invalid preview build/);
  assert.equal(readFileSync(join(root, 'published/app/index.html'), 'utf8'), 'app-build');
  assert.throws(() => packagePages({ ...options, demoBuild: join(root, 'missing') }), /Missing build/);
  assert.ok(existsSync(join(root, 'published/app/index.html')));
});
