import { test } from 'node:test';
import assert from 'node:assert/strict';
import { daysBetween, makeStudyBlocks } from '../lib/exam-plan.ts';

test('calendar days and weekly blocks remain stable across daylight-saving changes', () => {
  assert.equal(daysBetween('2027-03-07', '2027-03-21'), 14);
  assert.deepEqual(makeStudyBlocks('2027-03-07', '2027-03-21', ['A', 'B']), [
    { start:'2027-03-07', topic:'A' }, { start:'2027-03-14', topic:'B' }
  ]);
});
test('rejects past or invalid dates and caps plans at twelve weeks', () => {
  assert.deepEqual(makeStudyBlocks('2027-02-01', '2027-01-01', ['A']), []);
  assert.deepEqual(makeStudyBlocks('2027-02-01', '', ['A']), []);
  assert.equal(makeStudyBlocks('2027-02-01', '2028-02-01', ['A']).length, 12);
});
