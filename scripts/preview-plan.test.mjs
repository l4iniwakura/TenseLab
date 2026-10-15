import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPlan, loadPlan } from './preview-plan.mjs';

const repository = 'owner/TenseLab';
const sha = 'a'.repeat(40);
const pull = (number, headSha = sha, repo = repository, state = 'open') => ({
  number, state, head: { sha: headSha, repo: repo && { full_name: repo } },
});

test('plans every open repository PR by immutable head SHA, excluding forks and closed PRs', () => {
  const plan = createPlan(repository, 'main-sha', 'develop-sha', [pull(8), pull(3), pull(4, sha, 'other/fork'), pull(5, sha, repository, 'closed'), pull(6, sha, null)]);
  assert.deepEqual(plan.previews.include, [
    { channel: 'pr-3', ref: sha, number: 3 },
    { channel: 'pr-8', ref: sha, number: 8 },
  ]);
  assert.equal(plan.hasPreviews, true);
  assert.deepEqual(plan.stable.include, [{ channel: 'app', ref: 'main-sha' }, { channel: 'demo', ref: 'develop-sha' }]);
});

test('new commits replace the preview revision and closing the last PR empties the plan', () => {
  const updated = createPlan(repository, '', '', [pull(3, 'b'.repeat(40))]);
  assert.equal(updated.previews.include[0].ref, 'b'.repeat(40));
  const closed = createPlan(repository, '', '', [pull(3, sha, repository, 'closed')]);
  assert.deepEqual(closed.previews.include, []);
  assert.equal(closed.hasPreviews, false);
});

test('rejects unsafe channels and non-commit refs', () => {
  assert.throws(() => createPlan(repository, '', '', [pull('../app')]));
  assert.throws(() => createPlan(repository, '', '', [pull(3, 'some-branch')]));
});

test('loads all API pages instead of stopping at the first hundred PRs', async () => {
  const paths = [];
  const plan = await loadPlan(repository, async (path) => {
    paths.push(path);
    if (path.includes('/commits/')) return { sha };
    return path.endsWith('page=1') ? Array.from({ length: 100 }, (_, i) => pull(i + 1)) : [pull(101)];
  });
  assert.equal(plan.previews.include.length, 101);
  assert.ok(paths.some((path) => path.endsWith('page=2')));
});
