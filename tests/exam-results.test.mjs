import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTopicResults } from '../lib/exam-results.ts';

test('counts only presented questions and treats unanswered questions as incorrect', () => {
  const questions = [{topic:'Safety',answer:'A'}, {topic:'Safety',answer:'B'}, {topic:'Anatomy',answer:'C'}];
  assert.deepEqual(calculateTopicResults(questions, {0:'A', 1:'wrong'}), [
    {topic:'Safety',total:2,correct:1,percent:50},
    {topic:'Anatomy',total:1,correct:0,percent:0}
  ]);
});
test('does not invent scores for an empty exam', () => {
  assert.deepEqual(calculateTopicResults([], {}), []);
});
