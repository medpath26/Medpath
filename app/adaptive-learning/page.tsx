"use client";

import { useEffect, useState } from "react";
import { recommendTopics, type QuizAttempt } from "@/lib/adaptive-learning";
import { supabase } from "@/lib/supabase-client";

export default function AdaptiveLearningPage() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "signed-out" | "error">("loading");
  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { if (active) setStatus("error"); return; }
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError) { setStatus("error"); return; }
      if (!auth.user) { setStatus("signed-out"); return; }
      const { data, error } = await supabase.from("quiz_attempts")
        .select("topic,score,total_questions,correct_answers,created_at")
        .eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(250);
      if (!active) return;
      if (error) { setStatus("error"); return; }
      setAttempts((data ?? []) as QuizAttempt[]);
      setStatus("ready");
    }
    void load();
    return () => { active = false; };
  }, []);
  const recommendations = recommendTopics(attempts);
  return <main className="mx-auto max-w-5xl px-5 py-10">
    <a href="/" className="text-sm underline">← Back to MedPath</a>
    <h1 className="mt-6 text-3xl font-bold">Adaptive Learning</h1>
    <p className="mt-2 opacity-75">Your study priorities, based on your recorded quiz attempts. These are learning suggestions, not clinical competency assessments.</p>
    {status === "loading" && <p role="status" className="mt-6">Loading your quiz history…</p>}
    {status === "signed-out" && <p className="mt-6">Sign in to see personalized recommendations based on your quiz results.</p>}
    {status === "error" && <p role="alert" className="mt-6">Unable to load quiz history right now. Please try again later.</p>}
    {status === "ready" && recommendations.length === 0 && <section className="mt-6 rounded-xl border p-5"><h2 className="font-semibold">No quiz history yet</h2><p className="mt-2">Complete practice questions in PathPrep to start building your study recommendations.</p></section>}
    {status === "ready" && recommendations.length > 0 && <section className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Topic recommendations">
      {recommendations.map(item => <article key={item.topic} className="rounded-xl border border-slate-300 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide">{item.priority === "review" ? "Review first" : item.priority === "practice" ? "Keep practicing" : "Maintain knowledge"}</p>
        <h2 className="mt-2 text-xl font-semibold">{item.topic}</h2>
        <p className="mt-2 text-sm">Average score: {item.averageScore}% · Latest: {item.latestScore}% · {item.attempts} attempt{item.attempts === 1 ? "" : "s"}</p>
        <p className="mt-3 text-sm opacity-80">{item.reason}</p>
        <a className="mt-4 inline-block underline" href="/practice">Practice this subject in PathPrep →</a>
      </article>)}
    </section>}
    <p className="mt-8 text-xs opacity-70">Based on up to 250 most recent recorded attempts. Scores are descriptive and may not reflect full subject mastery.</p>
  </main>;
}
