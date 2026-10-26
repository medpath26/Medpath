"use client";

import { useMemo, useState } from "react";

const MAX_CHARS = 20000;
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
  const summary = useMemo(() => summarize(notes), [notes]);
  const cards = useMemo(() => prompts(notes), [notes]);
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); } catch { /* Clipboard may be unavailable in some browsers. */ }
  };
  return <main className="mx-auto max-w-5xl px-5 py-10">
    <a href="/" className="text-sm underline">← Back to MedPath</a>
    <h1 className="mt-6 text-3xl font-bold">Smart Notes Studio</h1>
    <p className="mt-2 opacity-75">Turn your own class notes into quick-review highlights and study prompts. This starter version processes text in your browser and does not upload or save it.</p>
    <p className="mt-3 rounded-lg border border-amber-400 p-3 text-sm"><strong>Privacy:</strong> Do not paste patient names, dates of birth, medical record numbers, or other identifiable health information. This tool is for educational notes only.</p>
    <label htmlFor="study-notes" className="mt-6 block font-semibold">Paste your lecture or study notes</label>
    <textarea id="study-notes" value={notes} onChange={e => setNotes(e.target.value.slice(0, MAX_CHARS))} maxLength={MAX_CHARS} rows={12} placeholder="Example: Tachycardia: an abnormally fast heart rate.\nBradycardia: an abnormally slow heart rate." className="mt-2 w-full rounded-lg border border-slate-400 bg-transparent p-3" />
    <p className="text-right text-xs opacity-70">{notes.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters</p>
    {notes.trim() ? <div className="mt-6 grid gap-5 md:grid-cols-2">
      <section className="rounded-xl border border-slate-300 p-5">
        <h2 className="text-xl font-semibold">Quick-review highlights</h2>
        <p className="mt-1 text-xs opacity-70">Extracted sentences, not AI-generated or fact-checked summaries.</p>
        <ul className="mt-4 list-disc space-y-3 pl-5">{summary.map((s, i) => <li key={i}>{s}</li>)}</ul>
        <button type="button" onClick={() => void copy(summary.join("\n"))} className="mt-4 rounded-lg border border-slate-400 px-4 py-2">Copy highlights</button>
      </section>
      <section className="rounded-xl border border-slate-300 p-5">
        <h2 className="text-xl font-semibold">Study flashcards</h2>
        <p className="mt-1 text-xs opacity-70">Create cards from lines written as “Term: definition”.</p>
        {cards.length ? <><button type="button" onClick={() => setShowAnswers(v => !v)} className="mt-4 rounded-lg border border-slate-400 px-4 py-2">{showAnswers ? "Hide answers" : "Reveal answers"}</button>
          <ul className="mt-4 space-y-3">{cards.map((card, i) => <li key={i} className="rounded-lg border p-3"><strong>{card.question}</strong>{showAnswers && <p className="mt-2">{card.answer}</p>}</li>)}</ul></>
          : <p className="mt-4 text-sm">Add lines such as “Asepsis: prevention of contamination” to generate flashcards.</p>}
      </section>
    </div> : <p className="mt-6 opacity-75">Your highlights and flashcards will appear here as you type.</p>}
    <p className="mt-8 text-xs opacity-70">This is an initial offline study aid. PDF upload, saved notes, Atlas summaries and generated quizzes are not yet available. Verify learning content against course materials.</p>
  </main>;
}
