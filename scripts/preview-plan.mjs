import { appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function createPlan(repository, main, develop, pulls) {
  const previews = pulls
    .filter((pr) => pr.state === 'open' && pr.head.repo?.full_name === repository)
    .map((pr) => {
      if (!Number.isSafeInteger(pr.number) || pr.number < 1 || !/^[a-f0-9]{40}$/.test(pr.head.sha)) {
        throw new Error('Invalid pull request metadata');
      }
      return { channel: `pr-${pr.number}`, ref: pr.head.sha, number: pr.number };
    })
    .sort((a, b) => a.number - b.number);
  return {
    stable: { include: [{ channel: 'app', ref: main }, { channel: 'demo', ref: develop }] },
    previews: { include: previews },
    hasPreviews: previews.length > 0,
  };
}

export async function loadPlan(repository, request) {
  const [main, develop] = await Promise.all([
    request(`/repos/${repository}/commits/main`),
    request(`/repos/${repository}/commits/develop`),
  ]);
  const pulls = [];
  for (let page = 1; ; page++) {
    const batch = await request(`/repos/${repository}/pulls?state=open&per_page=100&page=${page}`);
    pulls.push(...batch);
    if (batch.length < 100) break;
  }
  return createPlan(repository, main.sha, develop.sha, pulls);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const request = async (path) => {
    const response = await fetch(`https://api.github.com${path}`, {
      headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json' },
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status}: ${path}`);
    return response.json();
  };
  const plan = await loadPlan(process.env.GITHUB_REPOSITORY, request);
  for (const [key, value] of Object.entries(plan)) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${JSON.stringify(value)}\n`);
  }
}
