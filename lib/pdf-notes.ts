export const MAX_PDF_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_PAGES = 25;
export const MAX_NOTE_CHARS = 20000;

/** Extract selectable text locally; image-only PDFs require separate OCR. */
export async function extractPdfNotes(data: Uint8Array, workerSrc?: string): Promise<string> {
  if (data.byteLength > MAX_PDF_BYTES) throw new Error("PDF_TOO_LARGE");
  const header = new TextDecoder().decode(data.slice(0, 5));
  if (header !== "%PDF-") throw new Error("INVALID_PDF");
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc ?? new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  const task = pdfjs.getDocument({ data, enableXfa: false, stopAtErrors: true, useWorkerFetch: false });
  try {
    const pdf = await task.promise;
    if (pdf.numPages > MAX_PDF_PAGES) throw new Error("TOO_MANY_PAGES");
    let text = "";
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo++) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      for (const item of content.items) {
        if ("str" in item) text += item.str + (item.hasEOL ? "\n" : " ");
        if (text.length > MAX_NOTE_CHARS) throw new Error("TOO_MUCH_TEXT");
      }
      text += "\n";
      page.cleanup();
    }
    if (!text.trim()) throw new Error("NO_TEXT");
    return text.trim();
  } finally { await task.destroy(); }
}
