"use client";

import { useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import type { StudyMaterials } from "@/lib/study-materials";
import { extractPdfNotes, MAX_PDF_BYTES } from "@/lib/pdf-notes";

const MAX_CHARS = 20000;
const MAX_FILE_BYTES = 80000;
const sentenceSplit = (value: string) => value.match(/[^.!?\n]+[.!?]?/g)?.map(x => x.trim()).filter(Boolean) ?? [];
function summarize(value: string) {
  const sentences = sentenceSplit(value);
  const important = sentences.filter(x => /\b(important|define|means|because|causes|risk|must|should|prevent|function|indicate|symptom|treatment)\b/i.test(x));
  return (important.length ? important : sentences).slice(0, 6);
}
function prompts(value: string) {
  const lines = value.split(/\n/).map(x => x.trim()).filter(Boolean);
  return lines.filter(x => x.includes(":") && x.split(":")[0].length < 75).slice(0, 12).map(x => {
    const at = x.indexOf(":");
    return { question: "What is " + x.slice(0, at).trim() + "?", answer: x.slice(at + 1).trim() };
  }).filter(x => x.answer.length > 0);
}

export default function NotesPage() {
  const [notes, setNotes] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [fileStatus, setFileStatus] = useState("");
  const [reading, setReading] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const generatingRef = useRef(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [materials, setMaterials] = useState<StudyMaterials | null>(null);
  const [revealGenerated, setRevealGenerated] = useState(false);
  async function generate() {
    if (generatingRef.current) return;
    if (!supabase) { setGenerationStatus("Study generation is unavailable right now."); return; }
    generatingRef.current = true; setGenerating(true); setGenerationStatus(""); setMaterials(null); setRevealGenerated(false);
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) { setGenerationStatus("Sign in to generate study materials."); return; }
      const response = await fetch("/api/atlas/study-materials", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ notes, confirmed })
      });
      const payload = await response.json();
      if (!response.ok) { setGenerationStatus(typeof payload.error === "string" ? payload.error : "Generation failed. Please try again."); return; }
      setMaterials(payload.materials as StudyMaterials);
    } catch { setGenerationStatus("Generation is unavailable right now. Please try again."); }
    finally { generatingRef.current = false; setGenerating(false); }
  }
  async function importText(file: File | undefined) {
    if (!file) return;
    setFileStatus("");
    const isPdf = /\.pdf$/i.test(file.name);
    if (!isPdf && !/\.(txt|md)$/i.test(file.name)) { setFileStatus("Choose a PDF, .txt, or .md file."); return; }
    if (file.size > (isPdf ? MAX_PDF_BYTES : MAX_FILE_BYTES)) { setFileStatus(isPdf ? "The PDF exceeds 5 MB." : "The text file exceeds 80 KB."); return; }
    setReading(true);
    try {
      const text = isPdf ? await extractPdfNotes(new Uint8Array(await file.arrayBuffer())) : await file.text();
      if (text.includes("\0")) { setFileStatus("This file does not appear to be plain text."); return; }
      if (text.length > MAX_CHARS) { setFileStatus("These notes exceed 20,000 characters. Shorten the file and try again."); return; }
      setNotes(text); setMaterials(null); setConfirmed(false); setShowAnswers(false); setFileStatus("Notes loaded in this browser. They have not been uploaded or saved. Review the extracted text for accuracy.");
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      setFileStatus(code === "TOO_MANY_PAGES" ? "The PDF exceeds 25 pages." : code === "TOO_MUCH_TEXT" ? "The extracted text exceeds 20,000 characters." : code === "NO_TEXT" ? "No selectable text was found. Scanned PDFs require OCR, which is not available yet." : "Could not read this file. It may be invalid or password-protected.");
    } finally { setReading(false); }
  }
  const summary = useMemo(() => summarize(notes), [notes]);
  const cards = useMemo(() => prompts(notes), [notes]);
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); setCopyStatus("Highlights copied."); }
    catch { setCopyStatus("Copy is unavailable. Select and copy the highlights manually."); }
  };
  return <main className="mx-auto max-w-5xl px-5 py-10">
    <a href="/" className="text-sm underline">← Back to MedPath</a>
    <h1 className="mt-6 text-3xl font-bold">Smart Notes Studio</h1>
    <p className="mt-2 opacity-75">Turn your own class notes into quick-review highlights and study prompts. This starter version processes text in your browser and does not upload or save it.</p>
    <p className="mt-3 rounded-lg border border-amber-400 p-3 text-sm"><strong>Privacy:</strong> Do not paste patient names, dates of birth, medical record numbers, or other identifiable health information. This tool is for educational notes only.</p>
    <label htmlFor="notes-file" className="mt-6 block font-semibold">Import a notes file</label>
    <input id="notes-file" type="file" disabled={generating || reading} accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown" onChange={e => { void importText(e.target.files?.[0]); e.currentTarget.value = ""; }} className="mt-2 block w-full text-sm" />
    <p className="mt-2 text-xs opacity-70">PDF: up to 5 MB and 25 pages; text files: up to 80 KB. Both are limited to 20,000 extracted characters. The file stays on this device; importing replaces the text below.</p>
    {reading && <p role="status" className="mt-2 text-sm">Reading notes…</p>}
    {fileStatus && <p role="status" className="mt-2 text-sm">{fileStatus}</p>}
    <label htmlFor="study-notes" className="mt-6 block font-semibold">Paste your lecture or study notes</label>
    <textarea id="study-notes" disabled={generating || reading} value={notes} onChange={e => { setNotes(e.target.value.slice(0, MAX_CHARS)); setMaterials(null); setConfirmed(false); }} maxLength={MAX_CHARS} rows={12} placeholder="Example: Tachycardia: an abnormally fast heart rate.\nBradycardia: an abnormally slow heart rate." className="mt-2 w-full rounded-lg border border-slate-400 bg-transparent p-3" />
    <p className="text-right text-xs opacity-70">{notes.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters</p>
    {notes.trim() ? <div className="mt-6 grid gap-5 md:grid-cols-2">
      <section className="rounded-xl border border-slate-300 p-5">
        <h2 className="text-xl font-semibold">Quick-review highlights</h2>
        <p className="mt-1 text-xs opacity-70">Extracted sentences, not AI-generated or fact-checked summaries.</p>
        <ul className="mt-4 list-disc space-y-3 pl-5">{summary.map((s, i) => <li key={i}>{s}</li>)}</ul>
        <button type="button" onClick={() => void copy(summary.join("\n"))} className="mt-4 rounded-lg border border-slate-400 px-4 py-2">Copy highlights</button>
        {copyStatus && <p role="status" className="mt-2 text-sm">{copyStatus}</p>}
      </section>
      <section className="rounded-xl border border-slate-300 p-5">
        <h2 className="text-xl font-semibold">Study flashcards</h2>
        <p className="mt-1 text-xs opacity-70">Create cards from lines written as “Term: definition”.</p>
        {cards.length ? <><button type="button" onClick={() => setShowAnswers(v => !v)} className="mt-4 rounded-lg border border-slate-400 px-4 py-2">{showAnswers ? "Hide answers" : "Reveal answers"}</button>
          <ul className="mt-4 space-y-3">{cards.map((card, i) => <li key={i} className="rounded-lg border p-3"><strong>{card.question}</strong>{showAnswers && <p className="mt-2">{card.answer}</p>}</li>)}</ul></>
          : <p className="mt-4 text-sm">Add lines such as “Asepsis: prevention of contamination” to generate flashcards.</p>}
      </section>
    </div> : <p className="mt-6 opacity-75">Your highlights and flashcards will appear here as you type.</p>}
    <section className="mt-8 rounded-xl border border-slate-300 p-5" aria-labelledby="atlas-notes-heading">
      <h2 id="atlas-notes-heading" className="text-xl font-semibold">Generate with Atlas</h2>
      <p className="mt-2 text-sm">When enabled, your notes are sent to OpenAI to generate study materials. Do not include patient information or other sensitive details. Generated content may be inaccurate; check it against trusted course materials.</p>
      <label className="mt-4 flex items-start gap-2"><input type="checkbox" disabled={generating} checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /><span>I confirm these notes contain no identifiable patient information or other sensitive details, and I want to send them for generation.</span></label>
      <p className="mt-2 text-xs opacity-70">Generation uses Atlas access. A daily safeguard applies to paid accounts; attempts count even if generation fails.</p>
      <button type="button" disabled={!confirmed || notes.trim().length < 20 || generating || reading} onClick={() => void generate()} className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-white disabled:opacity-50">{generating ? "Generating…" : "Generate study materials"}</button>
      {generationStatus && <p role="status" className="mt-3">{generationStatus}</p>}
      {materials && <div className="mt-6 grid gap-5 md:grid-cols-2">
        <section><h3 className="font-semibold">Summary</h3><ul className="mt-2 list-disc pl-5">{materials.summary.map((item,i)=><li key={i}>{item}</li>)}</ul></section>
        <section><h3 className="font-semibold">Flashcards and quiz</h3><button type="button" onClick={() => setRevealGenerated(v=>!v)} className="mt-2 rounded-lg border px-3 py-2">{revealGenerated ? "Hide answers" : "Reveal answers"}</button>
          <ul className="mt-3 space-y-3">{materials.flashcards.map((card,i)=><li key={`f${i}`}><strong>{card.question}</strong>{revealGenerated && <p>{card.answer}</p>}</li>)}</ul>
          <h4 className="mt-4 font-semibold">Practice questions</h4><ol className="mt-2 list-decimal space-y-3 pl-5">{materials.quiz.map((q,i)=><li key={i}><strong>{q.question}</strong>{revealGenerated && <p>{q.answer} — {q.explanation}</p>}</li>)}</ol>
        </section>
      </div>}
    </section>
    <p className="mt-8 text-xs opacity-70">PDFs are read locally; scanned images are not supported. Saved notes are not yet available. Local highlights and cards do not use AI. Verify learning content against course materials.</p>
  </main>;
}
