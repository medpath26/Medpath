"use client";

import { useMemo, useState } from "react";

type Term = { term: string; prefix: string; root: string; suffix: string; meaning: string; example: string };
const TERMS: Term[] = [
  { term: "Tachycardia", prefix: "tachy- (fast)", root: "cardi (heart)", suffix: "-ia (condition)", meaning: "An abnormally fast heart rate.", example: "A patient may develop tachycardia during exertion." },
  { term: "Bradycardia", prefix: "brady- (slow)", root: "cardi (heart)", suffix: "-ia (condition)", meaning: "An abnormally slow heart rate.", example: "Athletes may have resting bradycardia." },
  { term: "Hypoglycemia", prefix: "hypo- (low)", root: "glyc (sugar)", suffix: "-emia (blood condition)", meaning: "A lower-than-normal blood glucose level.", example: "Recognizing hypoglycemia is important in patient care." },
  { term: "Hyperglycemia", prefix: "hyper- (high)", root: "glyc (sugar)", suffix: "-emia (blood condition)", meaning: "A higher-than-normal blood glucose level.", example: "Hyperglycemia may require clinical assessment." },
  { term: "Nephrology", prefix: "—", root: "nephr (kidney)", suffix: "-logy (study of)", meaning: "The medical specialty focused on kidneys.", example: "Nephrology evaluates kidney-related disorders." },
  { term: "Dermatitis", prefix: "—", root: "dermat (skin)", suffix: "-itis (inflammation)", meaning: "Inflammation of the skin.", example: "Contact dermatitis can follow exposure to an irritant." },
  { term: "Arthroscopy", prefix: "—", root: "arthr (joint)", suffix: "-scopy (visual examination)", meaning: "Examination of a joint using an endoscope.", example: "Arthroscopy may be used to evaluate a knee joint." },
  { term: "Hematology", prefix: "—", root: "hemat (blood)", suffix: "-logy (study of)", meaning: "The medical specialty focused on blood.", example: "Hematology evaluates blood disorders." }
];

export default function TerminologyPage() {
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const filtered = useMemo(() => TERMS.filter(t => [t.term, t.meaning, t.root].some(v => v.toLowerCase().includes(search.toLowerCase().trim()))), [search]);
  const current = TERMS[index];
  const advance = () => { setIndex(i => (i + 1) % TERMS.length); setRevealed(false); setAnswered(false); };
  return <main className="mx-auto max-w-5xl px-5 py-10">
    <a href="/study" className="text-sm underline">← Back to Study Hub</a>
    <h1 className="mt-6 text-3xl font-bold">Medical Terminology Decoder</h1>
    <p className="mt-2 text-sm opacity-75">Break down clinical vocabulary into prefixes, roots, and suffixes. Educational reference only.</p>
    <label htmlFor="term-search" className="mt-8 block font-semibold">Search terminology</label>
    <input id="term-search" className="mt-2 w-full rounded-lg border border-slate-400 bg-transparent p-3" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search a term, meaning, or root" />
    <div className="mt-5 grid gap-4 md:grid-cols-2">{filtered.map(t => <article key={t.term} className="rounded-xl border border-slate-300 p-5">
      <h2 className="text-xl font-semibold">{t.term}</h2>
      <dl className="mt-3 grid gap-2 text-sm"><div><dt className="font-semibold">Prefix</dt><dd>{t.prefix}</dd></div><div><dt className="font-semibold">Root</dt><dd>{t.root}</dd></div><div><dt className="font-semibold">Suffix</dt><dd>{t.suffix}</dd></div></dl>
      <p className="mt-3">{t.meaning}</p><p className="mt-2 text-sm italic opacity-75">{t.example}</p>
    </article>)}</div>
    {filtered.length === 0 && <p role="status" className="mt-4">No matching terms. Try another search.</p>}
    <section aria-labelledby="practice-heading" className="mt-10 rounded-xl border border-slate-300 p-6">
      <h2 id="practice-heading" className="text-2xl font-bold">Practice mode</h2>
      <p className="mt-2 text-sm">Question {index + 1} of {TERMS.length} · Correct first attempts: {correct}</p>
      <p className="mt-5 text-lg font-semibold">What does “{current.term}” mean?</p>
      {revealed ? <p role="status" className="mt-3">{current.meaning}</p> : <p className="mt-3 text-sm opacity-75">Think of the answer, then reveal it.</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        {!revealed && <button type="button" className="rounded-lg bg-teal-700 px-4 py-2 text-white" onClick={() => setRevealed(true)}>Reveal answer</button>}
        {revealed && !answered && <><button type="button" className="rounded-lg bg-teal-700 px-4 py-2 text-white" onClick={() => {setCorrect(c => c + 1);setAnswered(true);}}>I got it right</button><button type="button" className="rounded-lg border border-slate-400 px-4 py-2" onClick={() => setAnswered(true)}>Review again</button></>}
        {answered && <button type="button" className="rounded-lg bg-teal-700 px-4 py-2 text-white" onClick={advance}>Next term</button>}
      </div>
      <p className="mt-3 text-xs opacity-70">Practice score is stored only in this page session; it is not certification or competency verification.</p>
    </section>
  </main>;
}
