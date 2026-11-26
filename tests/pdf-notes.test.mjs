import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { extractPdfNotes, MAX_PDF_BYTES } from '../lib/pdf-notes.ts';
const worker = pathToFileURL(`${process.cwd()}/node_modules/pdfjs-dist/legacy/build/pdf.worker.min.mjs`).href;
const fixture = async name => new Uint8Array(await readFile(`tests/fixtures/${name}`));
test('extracts selectable text from a PDF', async () => {
  assert.match(await extractPdfNotes(await fixture('notes.pdf'), worker), /Asepsis: prevention of contamination/);
});
test('rejects invalid, oversized, empty and too-long PDFs', async () => {
  await assert.rejects(extractPdfNotes(new Uint8Array(MAX_PDF_BYTES + 1), worker), /PDF_TOO_LARGE/);
  await assert.rejects(extractPdfNotes(new TextEncoder().encode('not a pdf'), worker), /INVALID_PDF/);
  await assert.rejects(extractPdfNotes(await fixture('blank.pdf'), worker), /NO_TEXT/);
  await assert.rejects(extractPdfNotes(await fixture('too-many-pages.pdf'), worker), /TOO_MANY_PAGES/);
});
