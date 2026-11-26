"use client";

import { useEffect, useState } from "react";
import { recommendTopics, type QuizAttempt } from "@/lib/adaptive-learning";
import { supabase } from "@/lib/supabase-client";

export default function AdaptiveLearningPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "signed-out" | "locked" | "error">("loading");
  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { if (active) setStatus("error"); return; }
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!active) return;
        if (error) { setStatus("error"); return; }
        if (!data.session) { setStatus("signed-out"); return; }
        const response = await fetch("/api/adaptive-learning", {
          headers: { Authorization: `Bearer ${data.session.access_token}` }, cache: "no-store"
        });
        if (!active) return;
        if (response.status === 401) { setStatus("signed-out"); return; }
        if (response.status === 403) { setStatus("locked"); return; }
        if (!response.ok) { setStatus("error"); return; }
        const payload = await response.json();
        if (!active) return;
        setAttempts(payload.attempts as QuizAttempt[]);
        setStatus("ready");
      } catch { if (active) setStatus("error"); }
    }
    void load();
    return () => { active = false; };
  }, []);
  const recommendations = recommendTopics(attempts);
  return <main className="smart-learning">
    <a href="/" className="text-sm underline">← Back to MedPath</a>
    <h1 className="mt-6 text-3xl font-bold">Adaptive Learning</h1>
    <p className="mt-2 opacity-75">Your study priorities, based on your recorded quiz attempts. These are learning suggestions, not clinical competency assessments.</p>
    {status === "loading" && <p role="status" className="mt-6">Loading your quiz history…</p>}
    {status === "signed-out" && <p className="mt-6">Sign in to see personalized recommendations based on your quiz results.</p>}
    {status === "locked" && <p className="mt-6">Adaptive Learning is available with an eligible plan. Visit your account’s plan options to learn more.</p>}
    {status === "error" && <p role="alert" className="mt-6">Unable to load quiz history right now. Please try again later.</p>}
    {status === "ready" && recommendations.length === 0 && <section className="mt-6 rounded-xl border p-5"><h2 className="font-semibold">No quiz history yet</h2><p className="mt-2">No recorded quiz attempts are available for your current pathway. Complete a PathPrep practice exam to build recommendations.</p></section>}
    {status === "ready" && recommendations.length > 0 && <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Topic recommendations">
      {recommendations.map(item => <article key={item.topic} className="rounded-xl border border-slate-300 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide">{item.priority === "review" ? "Review first" : item.priority === "practice" ? "Keep practicing" : "Maintain knowledge"}</p>
        <h2 className="mt-2 text-xl font-semibold">{item.topic}</h2>
        <p className="mt-2 text-sm">Average score: {item.averageScore}% · Latest: {item.latestScore}% · {item.attempts} attempt{item.attempts === 1 ? "" : "s"}</p>
        <p className="mt-3 text-sm opacity-80">{item.reason}</p>
        <a className="mt-4 inline-block underline" href="/?view=practice">Practice this subject in PathPrep →</a>
      </article>)}
    </section>}
    <p className="mt-8 text-xs opacity-70">Based on up to 250 most recent recorded attempts. Scores are descriptive and may not reflect full subject mastery.</p>
  </main>;
}
