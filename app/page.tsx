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

export default function Home() {
  const [view, setView] = useState<ViewKey>("landing");
  const [darkMode, setDarkMode] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login" | "forgot" | null>(null);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress>(studentProgressSeed);
  const [authName, setAuthName] = useState("");
  const [authProgram, setAuthProgram] = useState("");
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [lockedFeature, setLockedFeature] = useState<FeatureKey | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [mentorAnswer, setMentorAnswer] = useState(mentorReplies.default);
  const [guestAtlasInput, setGuestAtlasInput] = useState("");
  const [guestAtlasQuestionCount, setGuestAtlasQuestionCount] = useState(0);
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
    if (!supabase) return;

    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) return;
      const session = data.session ?? null;
      setAuthSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        setWorkspaceReady(false);
        const loaded = await loadUserWorkspace(session.user);
        if (loaded) {
          setWorkspaceReady(true);
          setView("dashboard");
        }
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuthSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        setWorkspaceReady(false);
        const loaded = await loadUserWorkspace(session.user);
        setWorkspaceReady(loaded);
      } else {
        setWorkspaceReady(false);
        setProfile(null);
        setStudentProgress(studentProgressSeed);
        setView("landing");
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
      throw writeError;
    }

    return true;
  }

  async function loadUserWorkspace(user: User) {
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
      healthcare_program: defaultProgram,
      role: "explorer"
    };

    const { data: existingProfile, error: profileReadError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<ProfileRecord>();

    if (profileReadError) {
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
        setAuthError("We couldn't initialize your MedPath progress yet. Please try again in a moment.");
        return false;
      }

      activeProgress = data;
    }

    try {
      await seedDashboardCollections(user.id);
    } catch {
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
      setAuthError("We couldn't load all of your MedPath dashboard records yet. Please try again in a moment.");
      return false;
    }

    if (!goals.data?.length || !activity.data?.length || !modules.data?.length) {
      setAuthError("Your MedPath dashboard is still being initialized. Please try again in a moment.");
      return false;
    }

    setProfile(activeProfile);
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

  function goTo(nextView: ViewKey, feature?: FeatureKey) {
    const publicViews: ViewKey[] = ["landing", "career", "atlas", "billing"];

    if (!signedIn && !publicViews.includes(nextView)) {
      setAuthMode("login");
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
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthError("");
    setAuthNotice("");

    if (!supabase || !isSupabaseConfigured) {
      setAuthError(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setIsAuthLoading(true);

    try {
      if (authMode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: getAuthCallbackUrl("/")
        });

        if (error) throw error;

        setAuthNotice("Password reset instructions were sent to your email.");
        return;
      }

      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getAuthCallbackUrl("/"),
            data: {
              full_name: authName.trim(),
              healthcare_program: authProgram
            }
          }
        });

        if (error) throw error;

        if (data.session?.user) {
          setAuthSession(data.session);
          setAuthUser(data.session.user);
          setWorkspaceReady(false);
          const loaded = await loadUserWorkspace(data.session.user);
          if (loaded) {
            setWorkspaceReady(true);
            setAuthMode(null);
            setView("dashboard");
          }
        }

        if (!data.session) {
          setAuthNotice("Check your email to confirm your account, then log in to MedPath.");
        }

        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      if (data.session?.user) {
        setAuthSession(data.session);
        setAuthUser(data.session.user);
        setWorkspaceReady(false);
        const loaded = await loadUserWorkspace(data.session.user);
        if (loaded) {
          setWorkspaceReady(true);
          setAuthMode(null);
          setView("dashboard");
        }
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed.");
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
    setAuthName("");
    setAuthProgram("");
    setView("landing");
  }

  async function updatePlan(nextPlan: PlanKey) {
    if (!supabase || !authUser || !profile) {
      return;
    }

    const nextProfile = { ...profile, role: nextPlan };
    setProfile(nextProfile);

    const { error } = await supabase
      .from("profiles")
      .update({ role: nextPlan })
      .eq("id", authUser.id);

    if (error) {
      setAuthError(error.message);
      setProfile(profile);
    }
  }

  function askAtlas(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMentorAnswer(getAtlasReply(chatInput));
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
        onAuth={setAuthMode}
        onLogout={handleLogout}
        onDark={() => setDarkMode((value) => !value)}
      />

      {view === "landing" && (
        <Landing
          onStart={() => setAuthMode("signup")}
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
            setPlan={() => setAuthMode("signup")}
            onLock={() => setAuthMode("signup")}
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
              <Billing plan={plan} setPlan={updatePlan} onLock={setLockedFeature} isSignedIn />
            )}
            {view === "admin" && isAdmin && (
              <Admin
                users={filteredUsers}
                search={adminSearch}
                setSearch={setAdminSearch}
                setPlan={updatePlan}
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
          isLoading={isAuthLoading}
          setName={setAuthName}
          setProgram={setAuthProgram}
          setMode={setAuthMode}
          onClose={() => setAuthMode(null)}
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
            setAuthMode("signup");
          }}
          onClose={() => setShowGuestAtlasModal(false)}
        />
      )}

      <Footer />
    </main>
  );
}
