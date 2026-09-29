"use client";

import { Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  FeatureKey,
  PlanKey,
  StudentProgress,
  canAccess,
  studentProgressSeed,
  users
} from "@/lib/medpath-data";
import {
  Admin,
  Atlas,
  AuthModal,
  Billing,
  CareerExplorer,
  Clinical,
  Dashboard,
  Footer,
  GuestAtlasUpgradeModal,
  Header,
  InterviewCoach,
  Landing,
  Practice,
  ResumeBuilder,
  Sidebar,
  StudyPlan,
  UpgradeOverlay
} from "@/components/MedPathComponents";
import type { AtlasChatMessage, ViewKey } from "@/components/Common/types";
import { getAuthCallbackUrl } from "@/lib/auth-redirects";
import {
  LearningModuleRecord,
  ProfileRecord,
  RecentActivityRecord,
  StudentProgressRecord,
  StudyGoalRecord,
  isSupabaseConfigured,
  supabase
} from "@/lib/supabase-client";

const mentorReplies: Record<string, string> = {
  overwhelmed:
    "I hear you. Feeling overwhelmed does not mean you are behind. Let us choose one small win: 20 minutes on sterile technique, then 5 questions with explanations. I will keep the next step simple.",
  failed:
    "This result shows where we will focus next. We will review the missed topics, rebuild confidence with easier questions first, and then retest. One exam result is feedback, not your future.",
  nervous:
    "Clinical nerves are normal because you care. Tonight, review the readiness checklist, practice one patient introduction out loud, and prepare your uniform and documents. Tomorrow, focus on professionalism first.",
  default:
    "Let us turn that into a clear path. I will explain the concept simply, give you one example, and suggest a focused practice set. Atlas guidance should be verified with your instructor and trusted course materials."
};

type AuthFieldErrors = Partial<Record<"name" | "program" | "email" | "password", string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function logAuthDiagnostics(label: string, payload: unknown) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[MedPath auth] ${label}`, payload);
  }
}

function getFriendlyAuthError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  const normalized = message.toLowerCase();

  if (normalized.includes("already registered") || normalized.includes("already exists") || normalized.includes("user already")) {
    return "An account with this email already exists.";
  }

  if (normalized.includes("invalid email") || normalized.includes("email address") && normalized.includes("invalid")) {
    return "Please enter a valid email address.";
  }

  if (normalized.includes("password") && (normalized.includes("weak") || normalized.includes("short") || normalized.includes("least"))) {
    return "Password must be at least 8 characters.";
  }

  if (normalized.includes("invalid login credentials")) {
    return "The email or password you entered is incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Please verify your email before logging in.";
  }

  if (normalized.includes("load failed") || normalized.includes("failed to fetch") || normalized.includes("network") || normalized.includes("fetch")) {
    return "Unable to connect. Check your internet connection.";
  }

  if (normalized.includes("database error") || normalized.includes("saving new user") || normalized.includes("row-level security") || normalized.includes("permission denied")) {
    return "We couldn't finish creating your MedPath workspace. Please try again, or contact support if it continues.";
  }

  return "Something went wrong. Please try again.";
}

function validateAuthForm(mode: "signup" | "login" | "forgot" | "reset", email: string, password: string, name: string, program: string) {
  const errors: AuthFieldErrors = {};

  if (mode === "signup" && !name.trim()) {
    errors.name = "Name is required.";
  }

  if (mode === "signup" && !program) {
    errors.program = "Please select your program.";
  }

  if (mode !== "reset" && !email) {
    errors.email = "Email is required.";
  } else if (mode !== "reset" && !emailPattern.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (mode !== "forgot") {
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
  }

  return errors;
}


function mapProgressRecord(
  record: StudentProgressRecord,
  profile: ProfileRecord,
  goals: StudyGoalRecord[],
  activity: RecentActivityRecord[],
  modules: LearningModuleRecord[]
): StudentProgress {
  return {
    userId: record.user_id,
    program: profile.healthcare_program || "Healthcare career",
    certificationGoal: record.certification_goal,
    examDate: record.exam_date,
    weeklyProgress: record.weekly_progress,
    pathProgress: record.path_progress,
    streakDays: record.streak_days,
    xp: record.xp,
    level: record.level,
    nextMilestone: record.next_milestone,
    recommendedTopic: record.recommended_topic,
    upcomingGoals: goals.map((goal) => ({
      id: goal.id,
      title: goal.title,
      due: goal.due_label,
      minutes: goal.minutes,
      status: goal.status
    })),
    recentActivity: activity.map((item) => ({
      id: item.id,
      title: item.title,
      detail: item.detail,
      time: item.activity_time,
      score: item.score ?? undefined
    })),
    learningModules: modules.map((module) => ({
      id: module.id,
      title: module.title,
      category: module.category,
      progress: module.progress,
      status: module.status
    }))
  };
}

function fallbackProgress(userId: string, profile: ProfileRecord): StudentProgress {
  return {
    ...studentProgressSeed,
    userId,
    program: profile.healthcare_program || "Healthcare career"
  };
}

function getAtlasReply(message: string) {
  const normalized = message.toLowerCase();
  const key = normalized.includes("overwhelmed")
    ? "overwhelmed"
    : normalized.includes("failed") || normalized.includes("exam")
      ? "failed"
      : normalized.includes("nervous") || normalized.includes("clinicals")
        ? "nervous"
        : "default";

  return mentorReplies[key];
}

function getBrowserView(): ViewKey | null {
  if (typeof window === "undefined") return null;
  const pathViews: Record<string, ViewKey> = {
    "/": "landing",
    "/atlas": "atlas",
    "/pathfinder": "career",
    "/pricing": "billing"
  };
  const queryView = new URLSearchParams(window.location.search).get("view") as ViewKey | null;
  return queryView ?? pathViews[window.location.pathname] ?? null;
}

export default function Home({ initialView = "landing" }: { initialView?: ViewKey }) {
  const [view, setView] = useState<ViewKey>(initialView);
  const [darkMode, setDarkMode] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login" | "forgot" | "reset" | null>(null);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress>(studentProgressSeed);
  const [examTrackerHidden, setExamTrackerHidden] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authProgram, setAuthProgram] = useState("");
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [authFieldErrors, setAuthFieldErrors] = useState<AuthFieldErrors>({});
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<FeatureKey | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [mentorAnswer, setMentorAnswer] = useState(mentorReplies.default);
  const [guestAtlasInput, setGuestAtlasInput] = useState("");
  const [guestAtlasQuestionCount, setGuestAtlasQuestionCount] = useState(0);
  const [memberAtlasQuestionCount, setMemberAtlasQuestionCount] = useState(0);
  const [showGuestAtlasModal, setShowGuestAtlasModal] = useState(false);
  const [practiceMode, setPracticeMode] = useState<"flashcards" | "practiceExams">("flashcards");
  const [guestAtlasHistory, setGuestAtlasHistory] = useState<AtlasChatMessage[]>([
    {
      id: "guest-welcome",
      role: "atlas",
      text: "Welcome to Atlas. Ask me about healthcare programs, clinical prep, study anxiety, certification exams, or choosing a career path."
    }
  ]);
  const [studyHours, setStudyHours] = useState(8);
  const [examDate, setExamDate] = useState("2026-08-14");
  const [adminSearch, setAdminSearch] = useState("");

  const signedIn = Boolean(authSession?.user);
  const name = profile?.full_name ?? "";
  const program = profile?.healthcare_program ?? "";
  const plan = (profile?.role as PlanKey | undefined) ?? "explorer";
  const isAdmin = plan === "administrator";
  const filteredUsers = users.filter((user) =>
    `${user.name} ${user.email} ${user.role}`.toLowerCase().includes(adminSearch.toLowerCase())
  );

  useEffect(() => {
    const readView = () => {
      const requested = getBrowserView();
      const publicViews: ViewKey[] = ["landing", "career", "atlas", "billing"];
      if (requested && (signedIn || publicViews.includes(requested))) setView(requested);
    };
    readView();
    window.addEventListener("popstate", readView);
    return () => window.removeEventListener("popstate", readView);
  }, [signedIn]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const savedTheme = window.localStorage.getItem("medpath-theme");
    setDarkMode(savedTheme ? savedTheme === "dark" : media.matches);

    const syncSystemTheme = (event: MediaQueryListEvent) => {
      if (!window.localStorage.getItem("medpath-theme")) setDarkMode(event.matches);
    };
    media.addEventListener("change", syncSystemTheme);
    return () => media.removeEventListener("change", syncSystemTheme);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        logAuthDiagnostics("session restore error", error);
        setAuthError("We couldn't restore your session. Please log in again.");
        return;
      }
      const session = data.session ?? null;
      setAuthSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        setExamTrackerHidden(false);
        setWorkspaceReady(false);
        const loaded = await loadUserWorkspace(session.user);
        if (loaded) {
          setWorkspaceReady(true);
          const search = new URLSearchParams(window.location.search);
          const requestedView = getBrowserView();
          if (search.get("reset") === "1") setAuthMode("reset");
          setView(requestedView === "billing" ? "billing" : "dashboard");
        }
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthSession(session);
      setAuthUser(session?.user ?? null);
      if (event === "PASSWORD_RECOVERY") setAuthMode("reset");
      if (session?.user) {
        setExamTrackerHidden(false);
        setWorkspaceReady(false);
        const loaded = await loadUserWorkspace(session.user);
        setWorkspaceReady(loaded);
      } else if (event === "SIGNED_OUT") {
        setWorkspaceReady(false);
        setProfile(null);
        setStudentProgress(studentProgressSeed);
        setExamTrackerHidden(false);
        const requested = getBrowserView();
        setView(requested && ["career", "atlas", "billing"].includes(requested) ? requested : "landing");
      }
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function seedDashboardCollections(userId: string) {
    if (!supabase) return false;

    const [goalResult, activityResult, moduleResult] = await Promise.all([
      supabase.from("study_goals").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("recent_activity").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("learning_modules").select("id", { count: "exact", head: true }).eq("user_id", userId)
    ]);

    const readError = goalResult.error ?? activityResult.error ?? moduleResult.error;
    if (readError) {
      logAuthDiagnostics("dashboard seed read error", readError);
      throw readError;
    }

    const writes = [];

    if (!goalResult.count) {
      writes.push(
        supabase.from("study_goals").insert(
          studentProgressSeed.upcomingGoals.map((goal, index) => ({
            user_id: userId,
            title: goal.title,
            due_label: goal.due,
            minutes: goal.minutes,
            status: goal.status,
            position: index
          }))
        )
      );
    }

    if (!activityResult.count) {
      writes.push(
        supabase.from("recent_activity").insert(
          studentProgressSeed.recentActivity.map((activity) => ({
            user_id: userId,
            title: activity.title,
            detail: activity.detail,
            activity_time: activity.time,
            score: activity.score ?? null
          }))
        )
      );
    }

    if (!moduleResult.count) {
      writes.push(
        supabase.from("learning_modules").insert(
          studentProgressSeed.learningModules.map((module, index) => ({
            user_id: userId,
            title: module.title,
            category: module.category,
            progress: module.progress,
            status: module.status,
            position: index
          }))
        )
      );
    }

    const results = await Promise.all(writes);
    const writeError = results.find((result) => result.error)?.error;

    if (writeError) {
      logAuthDiagnostics("dashboard seed write error", writeError);
      throw writeError;
    }

    return true;
  }

  async function loadUserWorkspaceOnce(user: User) {
    if (!supabase) return false;
    setWorkspaceReady(false);

    const metadata = user.user_metadata ?? {};
    const defaultName =
      typeof metadata.full_name === "string" && metadata.full_name.trim()
        ? metadata.full_name.trim()
        : user.email?.split("@")[0] ?? "";
    const defaultProgram =
      typeof metadata.healthcare_program === "string" ? metadata.healthcare_program : "";

    const profileUpsert = {
      id: user.id,
      full_name: defaultName,
      healthcare_program: defaultProgram
    };

    const { data: existingProfile, error: profileReadError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<ProfileRecord>();

    if (profileReadError) {
      logAuthDiagnostics("profile read error", profileReadError);
      setAuthError("We couldn't prepare your MedPath profile yet. Please try again in a moment.");
      return false;
    }

    let activeProfile = existingProfile;

    if (!activeProfile) {
      const { data, error } = await supabase
        .from("profiles")
        .insert(profileUpsert)
        .select("*")
        .single<ProfileRecord>();

      if (error) {
        logAuthDiagnostics("profile insert error", error);
        setAuthError("We couldn't create your MedPath profile yet. Please try again in a moment.");
        return false;
      }

      activeProfile = data;
    }

    const { data: progressRecord, error: progressError } = await supabase
      .from("student_progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle<StudentProgressRecord>();

    if (progressError) {
      logAuthDiagnostics("student progress read error", progressError);
      setAuthError("We couldn't load your MedPath progress yet. Please try again in a moment.");
      return false;
    }

    let activeProgress = progressRecord;

    if (!activeProgress) {
      const { data, error } = await supabase
        .from("student_progress")
        .insert({
          user_id: user.id,
          certification_goal: studentProgressSeed.certificationGoal,
          exam_date: studentProgressSeed.examDate,
          weekly_progress: studentProgressSeed.weeklyProgress,
          path_progress: studentProgressSeed.pathProgress,
          streak_days: studentProgressSeed.streakDays,
          xp: studentProgressSeed.xp,
          level: studentProgressSeed.level,
          next_milestone: studentProgressSeed.nextMilestone,
          recommended_topic: studentProgressSeed.recommendedTopic
        })
        .select("*")
        .single<StudentProgressRecord>();

      if (error) {
        logAuthDiagnostics("student progress insert error", error);
        setAuthError("We couldn't initialize your MedPath progress yet. Please try again in a moment.");
        return false;
      }

      activeProgress = data;
    }

    try {
      await seedDashboardCollections(user.id);
    } catch (error) {
      logAuthDiagnostics("dashboard initialization error", error);
      setAuthError("We couldn't finish setting up your MedPath dashboard yet. Please try again in a moment.");
      return false;
    }

    const [goals, activity, modules] = await Promise.all([
      supabase
        .from("study_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true })
        .returns<StudyGoalRecord[]>(),
      supabase
        .from("recent_activity")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .returns<RecentActivityRecord[]>(),
      supabase
        .from("learning_modules")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true })
        .returns<LearningModuleRecord[]>()
    ]);

    if (goals.error || activity.error || modules.error) {
      logAuthDiagnostics("dashboard collection load error", {
        goals: goals.error,
        activity: activity.error,
        modules: modules.error
      });
      setAuthError("We couldn't load all of your MedPath dashboard records yet. Please try again in a moment.");
      return false;
    }

    if (!goals.data?.length || !activity.data?.length || !modules.data?.length) {
      setAuthError("Your MedPath dashboard is still being initialized. Please try again in a moment.");
      return false;
    }

    setProfile(activeProfile);
    const { count: atlasCount, error: atlasUsageError } = await supabase
      .from("atlas_questions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    if (atlasUsageError && atlasUsageError.code !== "PGRST205") {
      logAuthDiagnostics("Atlas usage load error", atlasUsageError);
    }
    setMemberAtlasQuestionCount(atlasCount ?? 0);
    setStudentProgress(
      mapProgressRecord(
        activeProgress,
        activeProfile,
        goals.data ?? [],
        activity.data ?? [],
        modules.data ?? []
      )
    );
    setAuthError("");
    setWorkspaceReady(true);
    return true;
  }

  async function loadUserWorkspace(user: User) {
    if (!supabase) return false;

    const { error: recoveryError } = await supabase.rpc("ensure_medpath_workspace");
    if (recoveryError && recoveryError.code !== "PGRST202") {
      logAuthDiagnostics("workspace recovery function error", recoveryError);
    }

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      if (await loadUserWorkspaceOnce(user)) return true;
      if (attempt < 3) {
        await new Promise((resolve) => window.setTimeout(resolve, attempt * 500));
      }
    }

    setAuthError("We couldn't finish setting up your workspace. Retry now or sign out and try again.");
    return false;
  }

  const generatedSchedule = useMemo(() => {
    const topics = [
      "Medical terminology roots",
      "Sterile technique",
      "Vital signs",
      "EKG basics",
      "Pharmacology safety",
      "Patient communication"
    ];
    return topics.slice(0, Math.min(6, Math.max(3, Math.round(studyHours / 2))));
  }, [studyHours]);

  function openAuthMode(mode: "signup" | "login" | "forgot" | "reset") {
    setAuthError("");
    setAuthNotice("");
    setAuthFieldErrors({});
    setAuthMode(mode);
  }

  function goTo(nextView: ViewKey, feature?: FeatureKey) {
    const publicViews: ViewKey[] = ["landing", "career", "atlas", "billing"];

    if (!signedIn && !publicViews.includes(nextView)) {
      openAuthMode("login");
      setAuthNotice("Please log in to open your MedPath workspace.");
      return;
    }
    if (publicViews.includes(nextView)) {
      setAuthMode(null);
      setAuthNotice("");
      setLockedFeature(null);
    }
    if (signedIn && feature && !canAccess(plan, feature)) {
      setLockedFeature(feature);
      return;
    }
    if (nextView === "practice") {
      setPracticeMode(feature === "mockExams" ? "practiceExams" : "flashcards");
    }
    setView(nextView);
    const publicPaths: Partial<Record<ViewKey, string>> = {
      landing: "/",
      career: "/pathfinder",
      atlas: "/atlas",
      billing: "/pricing"
    };
    const nextPath = publicPaths[nextView] ?? `/?view=${nextView}`;
    window.history.pushState({}, "", nextPath);
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isAuthLoading) return;

    setAuthError("");
    setAuthNotice("");
    setAuthFieldErrors({});

    if (!supabase || !isSupabaseConfigured) {
      setAuthError(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const submittedName = String(form.get("name") ?? authName).trim();
    const submittedProgram = String(form.get("program") ?? authProgram);
    const fieldErrors = validateAuthForm(authMode ?? "login", email, password, submittedName, submittedProgram);

    if (Object.keys(fieldErrors).length) {
      setAuthFieldErrors(fieldErrors);
      setAuthError("Please complete all required fields.");
      return;
    }

    if (authMode === "signup") {
      setAuthName(submittedName);
      setAuthProgram(submittedProgram);
    }

    setIsAuthLoading(true);

    try {
      if (authMode === "forgot") {
        const resetResponse = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: getAuthCallbackUrl("/?reset=1")
        });
        logAuthDiagnostics("resetPasswordForEmail response", resetResponse);

        if (resetResponse.error) throw resetResponse.error;

        setAuthNotice("Password reset instructions were sent to your email.");
        return;
      }

      if (authMode === "reset") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setAuthMode(null);
        setAuthNotice("Your password has been updated.");
        setView("dashboard");
        return;
      }

      if (authMode === "signup") {
        const signUpResponse = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getAuthCallbackUrl("/"),
            data: {
              full_name: submittedName,
              healthcare_program: submittedProgram
            }
          }
        });
        logAuthDiagnostics("signUp response", signUpResponse);

        if (signUpResponse.error) throw signUpResponse.error;

        if (signUpResponse.data.session?.user) {
          setAuthSession(signUpResponse.data.session);
          setAuthUser(signUpResponse.data.session.user);
          setWorkspaceReady(false);
          const loaded = await loadUserWorkspace(signUpResponse.data.session.user);
          if (loaded) {
            setWorkspaceReady(true);
            setAuthMode(null);
            setView("dashboard");
          }
        }

        if (!signUpResponse.data.session) {
          setAuthNotice("🎉 Welcome to MedPath! Please verify your email to continue.");
        }

        return;
      }

      const signInResponse = await supabase.auth.signInWithPassword({ email, password });
      logAuthDiagnostics("signInWithPassword response", signInResponse);

      if (signInResponse.error) throw signInResponse.error;

      if (signInResponse.data.session?.user) {
        setAuthSession(signInResponse.data.session);
        setAuthUser(signInResponse.data.session.user);
        setWorkspaceReady(false);
        const loaded = await loadUserWorkspace(signInResponse.data.session.user);
        if (loaded) {
          setWorkspaceReady(true);
          setAuthMode(null);
          setView("dashboard");
        }
      }
    } catch (error) {
      logAuthDiagnostics("auth flow error", error);
      setAuthError(getFriendlyAuthError(error));
    } finally {
      setIsAuthLoading(false);
    }
  }

  async function handleLogout() {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setAuthSession(null);
    setAuthUser(null);
    setWorkspaceReady(false);
    setProfile(null);
    setStudentProgress(studentProgressSeed);
    setExamTrackerHidden(false);
    setAuthName("");
    setAuthProgram("");
    setView("landing");
  }

  async function startCheckout(nextPlan: PlanKey) {
    if (!supabase || !authUser) {
      openAuthMode("login");
      return;
    }
    if (nextPlan === "explorer" || nextPlan === plan) return;

    setAuthError("");
    const { data, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !data.session) {
      setAuthError("Your session expired. Please log in again before upgrading.");
      return;
    }

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`
        },
        body: JSON.stringify({ plan: nextPlan })
      });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Checkout could not be started.");
      window.location.assign(result.url);
    } catch (error) {
      logAuthDiagnostics("checkout error", error);
      setAuthError(error instanceof Error ? error.message : "Checkout could not be started.");
    }
  }

  async function openBillingPortal() {
    if (!supabase) return;
    setAuthError("");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setAuthError("Your session expired. Please log in again.");
      return;
    }
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${data.session.access_token}` }
      });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Billing could not be opened.");
      window.location.assign(result.url);
    } catch (error) {
      logAuthDiagnostics("billing portal error", error);
      setAuthError(error instanceof Error ? error.message : "Billing could not be opened.");
    }
  }

  async function saveExamTracker(certificationGoal: string, nextExamDate: string) {
    if (!supabase || !authUser) {
      setAuthError("Please log in before updating your exam tracker.");
      return false;
    }

    const trimmedGoal = certificationGoal.trim();
    if (!trimmedGoal || !nextExamDate) {
      setAuthError("Add both a certification name and exam date.");
      return false;
    }

    const previousProgress = studentProgress;
    const nextProgress = {
      ...studentProgress,
      certificationGoal: trimmedGoal,
      examDate: nextExamDate
    };

    setStudentProgress(nextProgress);
    setExamTrackerHidden(false);
    setAuthError("");

    const { error } = await supabase
      .from("student_progress")
      .update({
        certification_goal: trimmedGoal,
        exam_date: nextExamDate
      })
      .eq("user_id", authUser.id);

    if (error) {
      setStudentProgress(previousProgress);
      setAuthError(error.message);
      return false;
    }

    return true;
  }

  async function deleteExamTracker() {
    if (!supabase || !authUser) {
      setAuthError("Please log in before updating your exam tracker.");
      return false;
    }

    const previousProgress = studentProgress;
    const today = new Date().toISOString().slice(0, 10);
    const nextProgress = {
      ...studentProgress,
      certificationGoal: "",
      examDate: today
    };

    setStudentProgress(nextProgress);
    setExamTrackerHidden(false);
    setAuthError("");

    const { error } = await supabase
      .from("student_progress")
      .update({
        certification_goal: "",
        exam_date: today
      })
      .eq("user_id", authUser.id);

    if (error) {
      setStudentProgress(previousProgress);
      setAuthError(error.message);
      return false;
    }

    return true;
  }

  async function askAtlas(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question) return;
    if (plan === "explorer" && memberAtlasQuestionCount >= 3) {
      setLockedFeature("atlas");
      return;
    }
    if (plan === "explorer" && supabase && authUser) {
      const { error } = await supabase.from("atlas_questions").insert({
        user_id: authUser.id,
        question
      });
      if (error) {
        logAuthDiagnostics("Atlas usage save error", error);
        setAuthError("We couldn't save this Atlas question. Please try again.");
        return;
      }
      setMemberAtlasQuestionCount((count) => count + 1);
    }
    setMentorAnswer(getAtlasReply(question));
    setChatInput("");
  }

  function askGuestAtlas(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = guestAtlasInput.trim();

    if (!question || guestAtlasQuestionCount >= 3) {
      if (guestAtlasQuestionCount >= 3) {
        setShowGuestAtlasModal(true);
      }
      return;
    }

    const nextCount = guestAtlasQuestionCount + 1;
    setGuestAtlasHistory((history) => [
      ...history,
      {
        id: `guest-question-${nextCount}`,
        role: "user",
        text: question
      },
      {
        id: `guest-answer-${nextCount}`,
        role: "atlas",
        text: getAtlasReply(question)
      }
    ]);
    setGuestAtlasQuestionCount(nextCount);
    setGuestAtlasInput("");

    if (nextCount === 3) {
      setShowGuestAtlasModal(true);
    }
  }

  return (
    <main className={darkMode ? "app dark" : "app"}>
      <Header
        signedIn={signedIn}
        plan={plan}
        view={view}
        onNavigate={goTo}
        onAuth={openAuthMode}
        onLogout={handleLogout}
        onDark={() => setDarkMode((value) => {
          const next = !value;
          window.localStorage.setItem("medpath-theme", next ? "dark" : "light");
          return next;
        })}
      />

      {view === "landing" && (
        <Landing
          onStart={() => openAuthMode("signup")}
          onCareers={() => goTo("career", "careerExplorer")}
        />
      )}

      {view === "career" && !signedIn && (
        <section className="public-workspace">
          <CareerExplorer plan="explorer" />
        </section>
      )}

      {view === "atlas" && !signedIn && (
        <section className="public-workspace">
          <Atlas
            name="Guest"
            program="Healthcare career explorer"
            answer={mentorAnswer}
            input={guestAtlasInput}
            setInput={setGuestAtlasInput}
            onSubmit={askGuestAtlas}
            messages={guestAtlasHistory}
            freeQuestionsRemaining={Math.max(0, 3 - guestAtlasQuestionCount)}
            isChatDisabled={guestAtlasQuestionCount >= 3}
          />
        </section>
      )}

      {view === "billing" && !signedIn && (
        <section className="public-workspace">
          <Billing
            plan="explorer"
            setPlan={() => openAuthMode("signup")}
            onLock={() => openAuthMode("signup")}
            isSignedIn={false}
          />
        </section>
      )}

      {view === "billing" && signedIn && !workspaceReady && (
        <section className="public-workspace">
          <Billing
            plan={plan}
            setPlan={() => undefined}
            onLock={() => undefined}
            isSignedIn={false}
          />
        </section>
      )}

      {view !== "landing" && signedIn && workspaceReady && (
        <div className="shell">
          <Sidebar view={view} plan={plan} name={name} isAdmin={isAdmin} onNavigate={goTo} />
          <section className="workspace">
            {view === "dashboard" && (
              <Dashboard
                name={name}
                plan={plan}
                program={program}
                progress={studentProgress}
                examTrackerHidden={examTrackerHidden}
                onSaveExamTracker={saveExamTracker}
                onDeleteExamTracker={deleteExamTracker}
                onHideExamTracker={() => setExamTrackerHidden(true)}
                onNavigate={goTo}
              />
            )}
            {view === "atlas" && (
              <Atlas
                name={name}
                program={program}
                answer={mentorAnswer}
                input={chatInput}
                setInput={setChatInput}
                onSubmit={askAtlas}
                freeQuestionsRemaining={plan === "explorer" ? Math.max(0, 3 - memberAtlasQuestionCount) : undefined}
                isChatDisabled={plan === "explorer" && memberAtlasQuestionCount >= 3}
              />
            )}
            {view === "practice" && <Practice initialMode={practiceMode} />}
            {view === "study" && (
              <StudyPlan
                examDate={examDate}
                studyHours={studyHours}
                schedule={generatedSchedule}
                setExamDate={setExamDate}
                setStudyHours={setStudyHours}
              />
            )}
            {view === "clinical" && <Clinical />}
            {view === "career" && <CareerExplorer plan={plan} />}
            {view === "resume" && <ResumeBuilder name={name} program={program} />}
            {view === "interview" && <InterviewCoach />}
            {view === "billing" && (
              <Billing plan={plan} setPlan={startCheckout} onLock={setLockedFeature} isSignedIn error={authError} onManageBilling={openBillingPortal} />
            )}
            {view === "admin" && isAdmin && (
              <Admin
                users={filteredUsers}
                search={adminSearch}
                setSearch={setAdminSearch}
                setPlan={() => undefined}
              />
            )}
          </section>
        </div>
      )}

      {view !== "landing" && signedIn && !workspaceReady && (
        <div className="shell">
          <section className="workspace">
            <article className="panel setup-panel">
              <div className="card-head">
                <h3>Setting up your MedPath workspace</h3>
                <Sparkles />
              </div>
              <p>
                We are creating your profile, progress, study goals, learning modules, and recent
                activity. Your dashboard will stay locked until those records are ready.
              </p>
              {authError && <p className="form-message error-message">{authError}</p>}
              {authUser && (
                <button
                  className="primary compact"
                  onClick={async () => {
                    setAuthError("");
                    setWorkspaceReady(await loadUserWorkspace(authUser));
                  }}
                >
                  Retry setup
                </button>
              )}
            </article>
          </section>
        </div>
      )}

      {authMode && (
        <AuthModal
          mode={authMode}
          name={authName}
          program={authProgram}
          error={authError}
          notice={authNotice}
          fieldErrors={authFieldErrors}
          isLoading={isAuthLoading}
          setName={setAuthName}
          setProgram={setAuthProgram}
          setMode={openAuthMode}
          onClose={() => {
            setAuthMode(null);
            setAuthError("");
            setAuthNotice("");
            setAuthFieldErrors({});
          }}
          onSubmit={handleAuth}
        />
      )}

      {lockedFeature && (
        <UpgradeOverlay
          feature={lockedFeature}
          onClose={() => setLockedFeature(null)}
          onUpgrade={() => {
            setLockedFeature(null);
            goTo("billing");
          }}
        />
      )}

      {showGuestAtlasModal && (
        <GuestAtlasUpgradeModal
          onPlans={() => {
            setShowGuestAtlasModal(false);
            goTo("billing");
          }}
          onSignup={() => {
            setShowGuestAtlasModal(false);
            openAuthMode("signup");
          }}
          onClose={() => setShowGuestAtlasModal(false)}
        />
      )}

      <Footer />
    </main>
  );
}

