import { test } from 'node:test';
import assert from 'node:assert/strict';
import { healthcarePathways } from '../lib/healthcare-pathways.ts';
import { practiceExamIds } from '../lib/practice-exam-access.ts';

test('each canonical pathway sees only its existing exam banks', () => {
  const expected = new Map([
    ['Surgical Technologist', ['ncct-tsc', 'cst']],
    ['Medical Assistant', ['medical-assistant']],
    ['Sterile Processing Technician', ['sterile-processing']]
  ]);
  for (const pathway of healthcarePathways) {
    assert.deepEqual(practiceExamIds(pathway.label), expected.get(pathway.label) ?? [], pathway.label);
  }
});
test('exploring learners can browse the existing banks', () => {
  assert.equal(practiceExamIds('Exploring Healthcare Careers').length, 4);
});
