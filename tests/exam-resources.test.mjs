import { test } from 'node:test';
import assert from 'node:assert/strict';
import { examOptionsForPathway, getExamResource } from '../lib/exam-resources.ts';
test('recognized credentials are matched only to their relevant pathway', () => {
  assert.equal(getExamResource('Medical Assistant', 'NHA CCMA')?.name, 'NHA CCMA');
  assert.equal(getExamResource('Surgical Technologist', 'TS-C')?.name, 'NCCT TS-C');
  assert.equal(getExamResource('Sterile Processing Technician', 'CRCST')?.name, 'HSPA CRCST');
  assert.equal(getExamResource('Registered Nurse (RN)', 'CCMA'), null);
  assert.deepEqual(examOptionsForPathway('Medical Assistant'), ['NHA CCMA']);
  assert.deepEqual(examOptionsForPathway('Registered Nurse (RN)'), ['NCLEX-RN']);
  assert.equal(getExamResource('Physician Assistant / Associate (PA)', 'PANCE')?.name, 'NCCPA PANCE');
  assert.equal(getExamResource('Pharmacy Technician', 'PTCE')?.name, 'PTCB PTCE');
  assert.equal(getExamResource('Radiologic Technologist', 'ARRT Radiography')?.name, 'ARRT Radiography');
  assert.equal(getExamResource('Medical Assistant', 'some other exam'), null);
});
