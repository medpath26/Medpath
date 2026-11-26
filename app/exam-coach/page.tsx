"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { daysBetween, makeStudyBlocks } from "@/lib/exam-plan";
import { examOptionsForPathway, getExamResource } from "@/lib/exam-resources";

const DEFAULT_TOPICS = ["Foundations and terminology", "Anatomy and physiology", "Patient safety and infection prevention", "Pathway-specific clinical knowledge", "Practice questions and explanations", "Timed exam review"];
type Attempt = { topic: string; score: number };
type Block = { start: string; topic: string };
type Plan = { exam_date: string; exam_name: string; weekly_hours: number; blocks: Block[]; completed_weeks: number[] };
function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
export default function ExamCoachPage() {
  const [examDate, setExamDate] = useState("");
  const [goal, setGoal] = useState("");
  const [hours, setHours] = useState(5);
  const [userId, setUserId] = useState("");
  const [pathway, setPathway] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "signed-out" | "error">("loading");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { if (active) setStatus("error"); return; }
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError) { setStatus("error"); return; }
      if (!auth.user) { setStatus("signed-out"); return; }
      const { data: profile, error: profileError } = await supabase.from("profiles").select("healthcare_program").eq("id", auth.user.id).maybeSingle();
      if (!active) return;
      if (profileError) { setStatus("error"); return; }
      const selectedPathway = profile?.healthcare_program?.trim() ?? "";
      const [quizzes, saved] = await Promise.all([
        supabase.from("quiz_attempts").select("topic,score").eq("user_id", auth.user.id).eq("pathway", selectedPathway).order("created_at", { ascending: false }).limit(100),
        supabase.from("exam_coach_plans").select("exam_date,exam_name,weekly_hours,blocks,completed_weeks").eq("user_id", auth.user.id).eq("pathway", selectedPathway).maybeSingle()
      ]);
      if (!active) return;
      if (quizzes.error || saved.error) { setStatus("error"); return; }
      const existing = saved.data as Plan | null;
      setUserId(auth.user.id); setPathway(selectedPathway); setPlan(existing);
      setExamDate(existing?.exam_date ?? "");
      setGoal(existing?.exam_name ?? "");
      setHours(existing?.weekly_hours ?? 5); setAttempts((quizzes.data ?? []) as Attempt[]); setStatus("ready");
    }
    void load();
    return () => { active = false; };
  }, []);
  const examResource = getExamResource(pathway, goal);
  const topics = useMemo(() => {
    const scores = new Map<string, number[]>();
    for (const a of attempts) {
      if (typeof a.topic !== "string" || !a.topic.trim() || !Number.isFinite(a.score) || a.score < 0 || a.score > 100) continue;
      scores.set(a.topic, [...(scores.get(a.topic) ?? []), a.score]);
    }
    const ranked = [...scores].map(([topic, values]) => ({ topic, score: values.reduce((a,b)=>a+b,0)/values.length })).sort((a,b)=>a.score-b.score).map(x=>x.topic);
    const starter = examResource?.topics.length ? examResource.topics : DEFAULT_TOPICS;
    return [...ranked, ...starter.filter(topic => !ranked.includes(topic))];
  }, [attempts, examResource]);
  async function savePlan() {
    const today = localToday();
    const days = daysBetween(today, examDate);
    if (!supabase || !userId || !pathway || !goal.trim() || goal.trim().length > 200 || !Number.isFinite(days) || days <= 0 || days > 3650) {
      setMessage("Choose a pathway, name your exam, and enter a future exam date within 10 years."); return;
    }
    const blocks = makeStudyBlocks(today, examDate, topics);
    const next: Plan = { exam_date: examDate, exam_name: goal.trim(), weekly_hours: hours, blocks, completed_weeks: [] };
    setSaving(true); setMessage("");
    const { error } = await supabase.from("exam_coach_plans").upsert({ ...next, user_id: userId, pathway, updated_at: new Date().toISOString() }, { onConflict: "user_id,pathway" });
    setSaving(false);
    if (error) { setMessage("Could not save your plan. Please try again."); return; }
    setPlan(next); setMessage("Plan saved. Your exam tracker was not changed.");
  }
  async function setWeek(index: number, checked: boolean) {
    if (!supabase || !plan || saving) return;
    const next = checked ? [...new Set([...plan.completed_weeks, index])] : plan.completed_weeks.filter(i => i !== index);
    setSaving(true); setMessage("");
    const { data, error } = await supabase.from("exam_coach_plans").update({completed_weeks: next, updated_at: new Date().toISOString()}).eq("user_id", userId).eq("pathway", pathway).select("completed_weeks").maybeSingle();
    setSaving(false);
    if (error || !data) { setMessage("Could not save progress. Your plan may have changed; reload and try again."); return; }
    setPlan({ ...plan, completed_weeks: next }); setMessage("Progress saved.");
  }
  return <main className="mx-auto max-w-5xl px-5 py-10">
    <a href="/" className="text-sm underline">← Back to MedPath</a>
    <h1 className="mt-6 text-3xl font-bold">Atlas Exam Coach</h1>
    <p className="mt-2 opacity-75">Create a study outline using your exam date and recorded practice results. This planner uses scheduling rules, not AI-generated guidance or an official exam blueprint.</p>
    {status === "loading" && <p role="status" className="mt-6">Loading your study profile…</p>}
    {status === "signed-out" && <p className="mt-6">Sign in to create a study plan.</p>}
    {status === "error" && <p role="alert" className="mt-6">We couldn't load your study data. Try again later.</p>}
    {status === "ready" && <section className="mt-6">
      {!pathway && <p role="alert">Choose a healthcare pathway in your profile before saving a plan.</p>}
      <div className="rounded-xl border border-slate-300 p-5">
        <label htmlFor="exam-name" className="block text-sm font-semibold">Exam name</label>
        <input id="exam-name" list="exam-options" value={goal} onChange={e=>setGoal(e.target.value)} maxLength={200} className="mt-2 w-full rounded-lg border border-slate-400 bg-transparent p-2" />
        <datalist id="exam-options">{examOptionsForPathway(pathway).map(name=><option key={name} value={name} />)}</datalist>
        <p className="mt-2 text-xs opacity-70">Choose a suggested exam or enter another. Use the credentialing organization’s current materials to verify your plan.</p>
        <label htmlFor="exam-date" className="mt-4 block text-sm font-semibold">Exam date</label>
        <input id="exam-date" type="date" value={examDate} onChange={e=>setExamDate(e.target.value)} className="mt-2 rounded-lg border border-slate-400 bg-transparent p-2" />
        <label htmlFor="weekly-hours" className="mt-4 block text-sm font-semibold">Study hours per week: {hours}</label>
        <input id="weekly-hours" type="range" min="1" max="30" value={hours} onChange={e=>setHours(Number(e.target.value))} className="mt-2 w-full" />
        {examResource ? <p className="mt-3 text-sm">Recognized {examResource.name}. <a className="underline" href={examResource.url} target="_blank" rel="noopener noreferrer">Check the official preparation resource</a>. {examResource.topics.length ? "The plan can include introductory topics based on that resource." : "This plan uses general study topics; use the official resource for exam-specific guidance."}</p> : <p className="mt-3 text-sm">This plan uses general topics. Verify exam-specific topics with your credentialing organization.</p>}
        <p className="mt-3 text-sm opacity-75">Saving a new plan replaces this pathway’s previous plan and resets its completed weeks. It does not change your exam tracker.</p>
        <button type="button" disabled={saving || !pathway} onClick={() => void savePlan()} className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-white disabled:opacity-50">{plan ? "Replace plan" : "Create plan"}</button>
        {message && <p role="status" className="mt-3">{message}</p>}
      </div>
      {plan ? <>
        <h2 className="mt-8 text-2xl font-semibold">{plan.exam_name} study plan</h2>
        <p className="mt-2 text-sm">Exam date: {plan.exam_date} · {plan.completed_weeks.length} of {plan.blocks.length} weeks marked complete</p>
        <p className="mt-2 text-sm opacity-75">These are saved weekly suggestions for up to the first 12 weeks. Check each week when you finish; the plan is not a measure of readiness.</p>
        <ol className="mt-5 grid gap-4 md:grid-cols-2">{plan.blocks.map((block,i)=><li key={`${block.start}-${i}`} className="rounded-xl border border-slate-300 p-5">
          <h3 className="font-semibold">Week {i+1}: {block.topic}</h3>
          <p className="mt-2 text-sm">Starting {block.start} · Up to {plan.weekly_hours} hours</p>
          <label className="mt-3 flex items-center gap-2"><input type="checkbox" disabled={saving} checked={plan.completed_weeks.includes(i)} onChange={e=>void setWeek(i,e.target.checked)} /> Mark week complete</label>
        </li>)}</ol>
      </> : <p className="mt-5">Create a plan to see your weekly study outline.</p>}
    </section>}
    <p className="mt-8 text-xs opacity-70">Verify exam topics with the official exam provider. This planner does not verify eligibility, registration, or certification requirements.</p>
  </main>;
}
