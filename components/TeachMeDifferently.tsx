"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import type { TeachingExplanation } from "@/lib/study-materials";

export function TeachMeDifferently({ isMember, onUsageChanged }: { isMember: boolean; onUsageChanged?: () => void }) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [answer, setAnswer] = useState<TeachingExplanation | null>(null);
  async function submit() {
    if (!supabase) { setError("This feature is unavailable right now."); return; }
    setBusy(true); setError(""); setAnswer(null);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { setError("Sign in to use this feature."); return; }
      const response = await fetch("/api/atlas/study-materials", {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ mode: "explain", level, notes: topic, confirmed })
      });
      const payload = await response.json();
      if (!response.ok) { setError(typeof payload.error === "string" ? payload.error : "Could not generate an explanation."); return; }
      setAnswer(payload.explanation as TeachingExplanation);
    } catch { setError("Could not generate an explanation. Please try again."); }
    finally { setBusy(false); onUsageChanged?.(); }
  }
  return <section className="panel" aria-labelledby="teach-differently-heading">
    <h3 id="teach-differently-heading">Teach Me Differently</h3>
    <p>Get an explanation, an example, and an analogy at your chosen level. AI can make mistakes; check the answer against trusted course materials.</p>
    {!isMember ? <p>Sign in to use this feature.</p> : <>
      <label htmlFor="teach-topic">What would you like to understand?</label>
      <textarea id="teach-topic" rows={3} maxLength={2000} value={topic} disabled={busy} onChange={e=>{setTopic(e.target.value);setConfirmed(false);setAnswer(null);}} placeholder="Describe a study concept, without patient or personal information." />
      <label htmlFor="teach-level">Explanation level</label>
      <select id="teach-level" value={level} disabled={busy} onChange={e=>{setLevel(e.target.value);setAnswer(null);}}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
      <p>Your topic is sent to OpenAI when you submit. Do not include identifiable patient or other sensitive information. Attempts count toward Atlas usage limits even if generation fails.</p>
      <label><input type="checkbox" checked={confirmed} disabled={busy} onChange={e=>setConfirmed(e.target.checked)} /> I confirm this topic contains no patient or other sensitive information and I want to send it for an explanation.</label>
      <div><button type="button" className="primary" disabled={!confirmed || topic.trim().length < 3 || busy} onClick={()=>void submit()}>{busy ? "Preparing explanation…" : "Explain this concept"}</button></div>
      {error && <p role="status">{error}</p>}
      {answer && <div aria-live="polite"><h4>Explanation</h4><p>{answer.explanation}</p><h4>Example</h4><p>{answer.example}</p><h4>Analogy</h4><p>{answer.analogy}</p><h4>Keep in mind</h4><p>{answer.caution}</p></div>}
    </>}
  </section>;
}
