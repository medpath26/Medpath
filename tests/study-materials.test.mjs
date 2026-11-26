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

test('rejects refusals, incomplete generations, and ambiguous output', async () => {
  const { extractStudyMaterials } = await import('../lib/study-materials.ts');
  const output = {type:'output_text',text:JSON.stringify(valid)};
  assert.deepEqual(extractStudyMaterials({status:'completed',output:[{type:'message',content:[output]}]}), valid);
  assert.equal(extractStudyMaterials({status:'incomplete',output:[{type:'message',content:[output]}]}), null);
  assert.equal(extractStudyMaterials({status:'completed',output:[{type:'message',content:[{type:'refusal',refusal:'No'}]}]}), null);
  assert.equal(extractStudyMaterials({status:'completed',output:[{type:'message',content:[output,output]}]}), null);
});
