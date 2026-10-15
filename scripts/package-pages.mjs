import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = resolve(root, 'dist/pages');
const [appBuild = 'frontend/dist', demoBuild] = process.argv.slice(2);
if (!demoBuild) throw new Error('Usage: node scripts/package-pages.mjs <app-build> <demo-build>');
for (const build of [appBuild, demoBuild, 'landing']) {
  if (!existsSync(resolve(root, build, 'index.html'))) {
    throw new Error(`Missing build: ${build}/index.html`);
  }
}
rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
if (existsSync(resolve(root, 'old'))) {
  cpSync(resolve(root, 'old'), resolve(destination, 'old'), { recursive: true });
}
cpSync(resolve(root, appBuild), resolve(destination, 'app'), { recursive: true });
cpSync(resolve(root, demoBuild), resolve(destination, 'demo'), { recursive: true });
cpSync(resolve(root, 'landing'), destination, {
  recursive: true,
  filter: (source) => !source.endsWith('.md'),
});
writeFileSync(resolve(destination, '.nojekyll'), '');
console.log('Pages package: landing at /, main at /app/, develop at /demo/, legacy at /old/');
