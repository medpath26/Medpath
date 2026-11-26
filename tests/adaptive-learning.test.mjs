import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommendTopics } from '../lib/adaptive-learning.ts';

const attempt = (topic, score, created_at) => ({ topic, score, created_at, total_questions: 10, correct_answers: score / 10 });

test('prioritizes weak recent or average scores and reports limited evidence', () => {
  const recommendations = recommendTopics([
    attempt('Anatomy', 95, '2026-01-02T00:00:00Z'),
    attempt('Safety', 90, '2026-01-01T00:00:00Z'),
    attempt('Safety', 50, '2026-01-03T00:00:00Z'),
    attempt('Terminology', 80, '2026-01-02T00:00:00Z'),
  ]);
  assert.deepEqual(recommendations.map(({topic, priority}) => [topic, priority]), [
    ['Safety', 'review'], ['Terminology', 'practice'], ['Anatomy', 'maintain']
  ]);
  assert.equal(recommendations[0].averageScore, 70);
  assert.equal(recommendations[0].latestScore, 50);
  assert.match(recommendations[0].reason, /Limited evidence/);
});

test('ignores invalid scores and empty topics without inventing recommendations', () => {
  assert.deepEqual(recommendTopics([
    attempt('Safety', -1, '2026-01-01T00:00:00Z'),
    attempt('Safety', 101, '2026-01-01T00:00:00Z'),
    attempt('  ', 90, '2026-01-01T00:00:00Z'),
    attempt('Safety', NaN, '2026-01-01T00:00:00Z')
  ]), []);
});
