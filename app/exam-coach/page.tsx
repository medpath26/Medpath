"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-client";

const DEFAULT_TOPICS = ["Foundations and terminology", "Anatomy and physiology", "Patient safety and infection prevention", "Pathway-specific clinical knowledge", "Practice questions and explanations", "Timed exam review"];
type Attempt = { topic: string; score: number };
function daysUntil(date: string) {
  const target = new Date(date + "T12:00:00");
  const today = new Date(); today.setHours(12, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}
export default function ExamCoachPage() {
  const [examDate, setExamDate] = useState("");
  const [goal, setGoal] = useState("");
  const [hours, setHours] = useState(5);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "signed-out" | "error">("loading");
  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { if (active) setStatus("error"); return; }
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError) { setStatus("error"); return; }
      if (!auth.user) { setStatus("signed-out"); return; }
      const [progress, quizzes] = await Promise.all([
        supabase.from("student_progress").select("exam_date,certification_goal").eq("user_id", auth.user.id).maybeSingle(),
        supabase.from("quiz_attempts").select("topic,score").eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(100)
      ]);
      if (!active) return;
      if (progress.error || quizzes.error) { setStatus("error"); return; }
      setExamDate(progress.data?.exam_date ?? "");
      setGoal(progress.data?.certification_goal ?? "");
      setAttempts((quizzes.data ?? []) as Attempt[]);
      setStatus("ready");
    }
    void load();
    return () => { active = false; };
  }, []);
  const days = examDate ? daysUntil(examDate) : null;
  const topicScores = useMemo(() => {
    const scores = new Map<string, number[]>();
    for (const a of attempts) {
      if (!a.topic.trim() || !Number.isFinite(a.score)) continue;
      scores.set(a.topic, [...(scores.get(a.topic) ?? []), a.score]);
    }
    return [...scores].map(([topic, values]) => ({ topic, score: values.reduce((a,b)=>a+b,0)/values.length })).sort((a,b)=>a.score-b.score);
  }, [attempts]);
  const topics = topicScores.length ? [...topicScores.map(t=>t.topic), ...DEFAULT_TOPICS.filter(t=>!topicScores.some(s=>s.topic===t))] : DEFAULT_TOPICS;
  const weeks = days === null || days <= 0 ? 0 : Math.max(1, Math.ceil(days / 7));
  const sessions = Math.min(weeks, 12);
  return <main className="mx-auto max-w-5xl px-5 py-10">
    <a href="/" className="text-sm underline">← Back to MedPath</a>
    <h1 className="mt-6 text-3xl font-bold">Atlas Exam Coach</h1>
    <p className="mt-2 opacity-75">A practical study outline based on your saved exam date and recorded practice results. This initial version uses transparent scheduling rules, not AI-generated guidance.</p>
    {status === "loading" && <p role="status" className="mt-6">Loading your study profile…</p>}
    {status === "signed-out" && <p className="mt-6">Sign in to create a plan from your exam tracker.</p>}
    {status === "error" && <p role="alert" className="mt-6">We couldn't load your study data. Try again later.</p>}
    {status === "ready" && <section className="mt-6">
      <div className="rounded-xl border border-slate-300 p-5">
        <p className="font-semibold">{goal || "Certification preparation"}</p>
        <label htmlFor="exam-date" className="mt-4 block text-sm font-semibold">Exam date (preview only)</label>
        <input id="exam-date" type="date" value={examDate} onChange={e=>setExamDate(e.target.value)} className="mt-2 rounded-lg border border-slate-400 bg-transparent p-2" />
        <label htmlFor="weekly-hours" className="mt-4 block text-sm font-semibold">Study hours per week: {hours}</label>
        <input id="weekly-hours" type="range" min="1" max="30" value={hours} onChange={e=>setHours(Number(e.target.value))} className="mt-2 w-full" />
        <p className="mt-3 text-sm opacity-75">Changes here are a preview and do not update your saved exam tracker.</p>
      </div>
      {days === null ? <p className="mt-5">Choose an exam date to generate your plan.</p> : days <= 0 ? <p className="mt-5">Choose a future exam date to generate an upcoming study plan.</p> : <>
        <h2 className="mt-8 text-2xl font-semibold">{days} days until exam · {weeks} week{weeks===1?"":"s"} remaining</h2>
        <p className="mt-2 text-sm opacity-75">Showing the next {sessions} weeks. Topics with lower recorded quiz scores appear first. Recommended time is a planning estimate, not a performance guarantee.</p>
        <ol className="mt-5 grid gap-4 md:grid-cols-2">{Array.from({length:sessions},(_,i)=><li key={i} className="rounded-xl border border-slate-300 p-5">
          <h3 className="font-semibold">Week {i+1}: {topics[i % topics.length]}</h3>
          <p className="mt-2 text-sm">Plan for up to {hours} hours: review concepts, practice questions, and check explanations.</p>
          <p className="mt-2 text-xs opacity-70">{topicScores.length?"Priorities informed by recorded quiz scores.":"Starter schedule: no recorded quiz history yet."}</p>
        </li>)}</ol>
      </>}
    </section>}
    <p className="mt-8 text-xs opacity-70">This planner does not verify eligibility, accreditation, exam registration, or professional certification requirements.</p>
  </main>;
}
