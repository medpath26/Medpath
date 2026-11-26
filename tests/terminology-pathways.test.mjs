import { test } from 'node:test';
import assert from 'node:assert/strict';
import { healthcarePathways } from '../lib/healthcare-pathways.ts';
import { pathwayTermSelections } from '../lib/terminology-pathways.ts';
const glossary = new Set(['Tachycardia','Bradycardia','Hypoglycemia','Hyperglycemia','Nephrology','Dermatitis','Arthroscopy','Hematology']);
test('every pathway has a nonempty selection of real glossary terms', () => {
  assert.equal(Object.keys(pathwayTermSelections).length, healthcarePathways.length);
  for (const path of healthcarePathways) {
    const terms = pathwayTermSelections[path.id];
    assert.ok(terms?.length > 0, path.label);
    assert.equal(new Set(terms).size, terms.length, path.label);
    for (const term of terms) assert.ok(glossary.has(term), `${path.label}: ${term}`);
  }
});
