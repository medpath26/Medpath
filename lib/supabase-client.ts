import { createClient } from "@supabase/supabase-js";

export type ProfileRecord = {
  id: string;
  full_name: string;
  healthcare_program: string;
  role: string;
  created_at?: string;
  updated_at?: string;
};

export type StudentProgressRecord = {
  user_id: string;
  certification_goal: string;
  exam_date: string;
  weekly_progress: number;
  path_progress: number;
  streak_days: number;
  xp: number;
  level: string;
  next_milestone: string;
  recommended_topic: string;
  updated_at?: string;
};

export type StudyGoalRecord = {
  id: string;
  user_id: string;
  title: string;
  due_label: string;
  minutes: number;
  status: "ready" | "in_progress" | "scheduled";
};

export type RecentActivityRecord = {
  id: string;
  user_id: string;
  title: string;
  detail: string;
  activity_time: string;
  score: number | null;
};

export type LearningModuleRecord = {
  id: string;
  user_id: string;
  title: string;
  category: "Quiz" | "Flashcards" | "Practice Exam" | "Atlas AI";
  progress: number;
  status: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
