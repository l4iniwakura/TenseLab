import { appendFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));

export function packagePages({ appBuild, demoBuild, previewsDir, contentRoot = root, destination = resolve(root, 'dist/pages') }) {
  for (const build of [appBuild, demoBuild, resolve(contentRoot, 'landing'), resolve(contentRoot, 'old')]) {
    if (!existsSync(resolve(build, 'index.html'))) throw new Error(`Missing build: ${build}/index.html`);
  }
  const previews = previewsDir && existsSync(previewsDir)
    ? readdirSync(previewsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => ({ name: entry.name.replace(/^preview-/, ''), source: entry.name }))
    : [];
  for (const entry of previews) {
    if (!/^pr-[1-9]\d*$/.test(entry.name) || !existsSync(resolve(previewsDir, entry.source, 'index.html'))) {
      throw new Error(`Invalid preview build: ${entry.name}`);
    }
  }
  // Rebuild the complete site: closed PRs never survive in the next package.
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(destination, { recursive: true });
  cpSync(resolve(contentRoot, 'old'), resolve(destination, 'old'), { recursive: true });
  cpSync(appBuild, resolve(destination, 'app'), { recursive: true });
  cpSync(demoBuild, resolve(destination, 'demo'), { recursive: true });
  cpSync(resolve(contentRoot, 'index.html'), resolve(destination, 'index.html'));
  cpSync(resolve(contentRoot, 'landing'), resolve(destination, 'landing'), {
    recursive: true,
    filter: (source) => !source.endsWith('.md'),
  });
  for (const entry of previews) {
    cpSync(resolve(previewsDir, entry.source), resolve(destination, entry.name), { recursive: true });
  }
  writeFileSync(resolve(destination, '.nojekyll'), '');
  console.log(`Pages package: app, demo, landing, old; ${previews.length} previews`);
  return previews.map((entry) => Number(entry.name.slice(3))).sort((a, b) => a - b);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [appBuild, demoBuild, previewsDir, contentRoot] = process.argv.slice(2);
  if (!appBuild || !demoBuild) throw new Error('Usage: node scripts/package-pages.mjs <app-build> <demo-build> [previews-dir] [content-root]');
  const previews = packagePages({ appBuild: resolve(appBuild), demoBuild: resolve(demoBuild), previewsDir: previewsDir && resolve(previewsDir), contentRoot: contentRoot && resolve(contentRoot) });
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `previews=${JSON.stringify(previews)}\n`);
}
