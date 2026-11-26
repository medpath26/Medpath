import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStudyMaterials } from '../lib/study-materials.ts';
const valid = {summary:['A key point'],flashcards:[{question:'What is it?',answer:'A term'}],quiz:[{question:'Why?',answer:'Because',explanation:'A reason'}]};
test('accepts complete, bounded study material', () => assert.deepEqual(parseStudyMaterials(JSON.stringify(valid)), valid));
test('rejects missing content, invalid JSON, and oversized responses', () => {
  assert.equal(parseStudyMaterials('{'), null);
  assert.equal(parseStudyMaterials(JSON.stringify({...valid, quiz: []})), null);
  assert.equal(parseStudyMaterials(JSON.stringify({...valid, flashcards: [{question:' ',answer:'x'}]})), null);
  assert.equal(parseStudyMaterials(JSON.stringify({...valid, summary: ['x'.repeat(1201)]})), null);
  assert.equal(parseStudyMaterials('x'.repeat(40001)), null);
});
