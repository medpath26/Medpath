"use client";

import Image from "next/image";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  Download,
  GraduationCap,
  HeartHandshake,
  Lock,
  LogIn,
  MessageCircleHeart,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  Trophy,
  UserRound,
  UsersRound,
  WandSparkles,
  X
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  FeatureKey,
  PlanKey,
  StudentProgress,
  canAccess,
  careers,
  featureLabels,
  plans,
  roleBadges,
  studentProgressSeed,
  subscriptionEvents,
  users
} from "@/lib/medpath-data";
import {
  LearningModuleRecord,
  ProfileRecord,
  RecentActivityRecord,
  StudentProgressRecord,
  StudyGoalRecord,
  isSupabaseConfigured,
  supabase
} from "@/lib/supabase-client";

type ViewKey =
  | "landing"
  | "dashboard"
  | "atlas"
  | "practice"
  | "study"
  | "clinical"
  | "career"
  | "resume"
  | "interview"
  | "billing"
  | "admin";

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

type AtlasChatMessage = {
  id: string;
  role: "atlas" | "user";
  text: string;
};

const quickCards: Array<{
  key: ViewKey;
  feature: FeatureKey;
  title: string;
  copy: string;
  icon: ReactNode;
}> = [
  {
    key: "atlas",
    feature: "atlas",
    title: "Atlas",
    copy: "Guiding every step of your healthcare journey.",
    icon: <MessageCircleHeart />
  },
  {
    key: "practice",
    feature: "practice",
    title: "PathPrep",
    copy: "Adaptive practice questions with supportive explanations.",
    icon: <Brain />
  },
  {
    key: "study",
    feature: "studyPlans",
    title: "Study Plan",
    copy: "Build a schedule around your exam date and weekly hours.",
    icon: <CalendarClock />
  },
  {
    key: "career",
    feature: "careerExplorer",
    title: "PathFinder",
    copy: "Explore roles, salaries, certifications, and advancement.",
    icon: <Search />
  },
  {
    key: "clinical",
    feature: "clinicalPrep",
    title: "PathClinical",
    copy: "Clinical checklists, OR etiquette, and readiness routines.",
    icon: <ClipboardCheck />
  },
  {
    key: "resume",
    feature: "resumeBuilder",
    title: "Resume Builder",
    copy: "Create healthcare resumes and export polished PDFs.",
    icon: <BriefcaseBusiness />
  },
  {
    key: "interview",
    feature: "interviewCoach",
    title: "Interview Coach",
    copy: "Mock interviews, confidence scoring, and better answers.",
    icon: <UsersRound />
  }
];

const journey = [
  "Orientation",
  "Fundamentals",
  "Clinical Skills",
  "Clinical Rotations",
  "Certification",
  "First Job",
  "Career Growth"
];

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
    if (!signedIn && !["landing", "career", "atlas", "billing"].includes(nextView)) {
      setAuthMode("login");
      setAuthNotice("Please log in to open your MedPath workspace.");
      return;
    }
    if (signedIn && feature && !canAccess(plan, feature)) {
      setLockedFeature(feature);
      return;
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
          redirectTo: window.location.origin
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
            emailRedirectTo: window.location.origin,
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
            {view === "practice" && <Practice />}
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
            setView("billing");
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

function Header({
  signedIn,
  plan,
  view,
  onNavigate,
  onAuth,
  onLogout,
  onDark
}: {
  signedIn: boolean;
  plan: PlanKey;
  view: ViewKey;
  onNavigate: (view: ViewKey, feature?: FeatureKey) => void;
  onAuth: (mode: "signup" | "login") => void;
  onLogout: () => void;
  onDark: () => void;
}) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate("landing")} aria-label="MedPath home">
        {logoFailed ? (
          <strong>MedPath</strong>
        ) : (
          <Image
            src="/logo.png"
            width={1536}
            height={1024}
            alt="MedPath"
            className="brand-logo"
            priority
            onError={() => setLogoFailed(true)}
          />
        )}
      </button>
      <nav className="desktop-nav" aria-label="Primary">
        <button onClick={() => onNavigate("career", "careerExplorer")}>PathFinder</button>
        <button onClick={() => onNavigate("atlas", "atlas")}>Atlas</button>
        <button onClick={() => onNavigate("billing")}>Pricing</button>
      </nav>
      <div className="top-actions">
        {signedIn && <span className={`plan-pill ${plan}`}>{roleBadges[plan]}</span>}
        <button className="icon-button" onClick={onDark} aria-label="Toggle dark mode">
          <Moon size={18} />
        </button>
        {signedIn ? (
          <>
            <button className="primary compact" onClick={() => onNavigate(view === "dashboard" ? "billing" : "dashboard")}>
              {view === "dashboard" ? "Manage" : "My Path"}
            </button>
            <button className="ghost" onClick={onLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <button className="ghost" onClick={() => onAuth("login")}>
              <LogIn size={17} />
              Login
            </button>
            <button className="primary compact" onClick={() => onAuth("signup")}>
              Get Started
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function Landing({ onStart, onCareers }: { onStart: () => void; onCareers: () => void }) {
  const featureCards = [
    {
      title: "PathPrep",
      copy: "Practice questions, flashcards, and answer explanations built for healthcare certification prep.",
      icon: <BookOpen />
    },
    {
      title: "PathTrack",
      copy: "Track XP, streaks, weak topics, milestones, and weekly progress from one calm dashboard.",
      icon: <BarChart3 />
    },
    {
      title: "PathClinical",
      copy: "Prepare for clinicals with checklists, OR etiquette, patient communication, and readiness routines.",
      icon: <ClipboardCheck />
    },
    {
      title: "PathHire",
      copy: "Move from school to work with resume support, interview practice, and career confidence tools.",
      icon: <BriefcaseBusiness />
    }
  ];

  const learningPaths = [
    ["Explore", "Find healthcare careers, programs, salary ranges, and certification paths."],
    ["Prepare", "Study terminology, anatomy, sterile technique, EKG, pharmacology, and patient care."],
    ["Practice", "Build readiness with quizzes, flashcards, and mock certification exam workflows."],
    ["Launch", "Create resumes, practice interviews, and step into your first healthcare role."]
  ];

  const faqs = [
    ["Who is MedPath for?", "Medical Assistant, Surgical Technology, and healthcare career exploration students."],
    ["Does Atlas replace my instructor?", "No. Atlas supports learning, but students should verify guidance with instructors and trusted materials."],
    ["Can I start free?", "Yes. Explorer gives students a focused way to explore careers and begin learning."],
    ["What unlocks with Premium?", "Unlimited Atlas, study plans, practice questions, clinical prep, resume tools, and interview coaching."]
  ];

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} />
            Atlas, your personal learning guide
          </div>
          <h1>Learn. Practice. Pass.</h1>
          <p>
            MedPath helps future healthcare professionals study smarter, build confidence, prepare
            for clinicals, and move toward certification with a mentor-like learning system.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={onStart}>
              Start Your Path
              <ChevronRight size={18} />
            </button>
            <button className="secondary" onClick={onCareers}>
              Explore Careers
            </button>
          </div>
          <div className="trust-row" aria-label="Platform highlights">
            <span>Medical Assistant</span>
            <span>Surgical Technology</span>
            <span>Atlas AI Tutor</span>
          </div>
        </div>
        <div className="hero-art">
          <Image
            src="/medpath-hero.png"
            width={1100}
            height={760}
            alt="Healthcare students and a mentor studying together"
            priority
          />
          <div className="floating-card">
            <BadgeCheck />
            <span>21 days to NCCT exam</span>
            <strong>Today: instrumentation focus</strong>
          </div>
        </div>
      </section>

      <section className="proof-strip" aria-label="MedPath outcomes">
        {[
          ["24/7", "mentor-style support"],
          ["10+", "healthcare career paths"],
          ["7 days", "Student Plus trial"],
          ["1 path", "from class to career"]
        ].map(([value, label]) => (
          <div key={value}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <p className="eyebrow">Complete Learning System</p>
          <h2>Everything students need from first class to first job.</h2>
          <p>
            MedPath combines career exploration, adaptive study tools, clinical preparation, and
            hiring support in one polished healthcare education workspace.
          </p>
        </div>
        <div className="feature-card-grid">
          {featureCards.map((feature) => (
            <article className="feature-card" key={feature.title}>
              <span>{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="learning-path-section">
        <div className="section-heading">
          <p className="eyebrow">Learning Paths</p>
          <h2>A guided route through healthcare education.</h2>
        </div>
        <div className="learning-path-grid">
          {learningPaths.map(([title, copy], index) => (
            <article className="path-card" key={title}>
              <span>{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="atlas-showcase">
        <div>
          <p className="eyebrow">
            <MessageCircleHeart size={16} />
            Atlas Tutor
          </p>
          <h2>Your healthcare learning companion.</h2>
          <p>
            Atlas explains difficult concepts simply, helps students recover from setbacks, builds
            personalized study plans, and keeps each next step manageable.
          </p>
          <button className="primary" onClick={onStart}>
            Meet Atlas
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="atlas-chat-card">
          <div className="message atlas-message">
            <strong>Atlas</strong>
            <p>
              You are making steady progress. Today we will review sterile technique, then finish
              with five confidence-building questions.
            </p>
          </div>
          <div className="message user-message">
            <strong>Student</strong>
            <p>I am nervous about clinicals tomorrow.</p>
          </div>
          <div className="message atlas-message">
            <strong>Atlas</strong>
            <p>
              That makes sense. Let us prepare your checklist, practice one patient introduction,
              and choose one question to ask your preceptor.
            </p>
          </div>
        </div>
      </section>

      <section className="pricing-preview">
        <div className="section-heading">
          <p className="eyebrow">Plans</p>
          <h2>Start free, upgrade when you are ready.</h2>
        </div>
        <div className="pricing-preview-grid">
          {[
            ["Explorer", "Free", "Career exploration, daily motivation, limited Atlas, and starter practice."],
            ["Student Plus", "$14.99/mo", "Unlimited Atlas, practice questions, study plans, clinical prep, and hiring tools."],
            ["Pro Student", "$24.99/mo", "Adaptive lessons, mock exams, advanced analytics, and priority guidance."]
          ].map(([name, price, copy]) => (
            <article className="price-card" key={name}>
              <h3>{name}</h3>
              <strong className="price">{price}</strong>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="faq-section">
        <div className="section-heading">
          <p className="eyebrow">FAQ</p>
          <h2>Built for serious students, designed to feel supportive.</h2>
        </div>
        <div className="faq-grid">
          {faqs.map(([question, answer]) => (
            <article className="faq-item" key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <p className="eyebrow">Ready when you are</p>
          <h2>Build confidence one step at a time.</h2>
          <p>
            Start your MedPath workspace and let Atlas help organize the next study session,
            milestone, and career move.
          </p>
        </div>
        <button className="primary" onClick={onStart}>
          Get Started
          <ChevronRight size={18} />
        </button>
      </section>
    </div>
  );
}

function Sidebar({
  view,
  plan,
  name,
  isAdmin,
  onNavigate
}: {
  view: ViewKey;
  plan: PlanKey;
  name: string;
  isAdmin: boolean;
  onNavigate: (view: ViewKey, feature?: FeatureKey) => void;
}) {
  const items = [
    ["dashboard", "My Path", <Activity key="i" />, undefined],
    ["atlas", "Atlas", <MessageCircleHeart key="i" />, "atlas"],
    ["practice", "PathPrep", <Brain key="i" />, "practice"],
    ["study", "Study Plan", <CalendarClock key="i" />, "studyPlans"],
    ["clinical", "Clinical Prep", <ClipboardCheck key="i" />, "clinicalPrep"],
    ["career", "Careers", <Search key="i" />, "careerExplorer"],
    ["resume", "Resume", <BriefcaseBusiness key="i" />, "resumeBuilder"],
    ["interview", "Interview", <UsersRound key="i" />, "interviewCoach"],
    ["billing", "Billing", <CreditCard key="i" />, undefined]
  ] as const;

  return (
    <aside className="sidebar">
      <div className="mini-profile">
        <UserRound />
        <span>
          <strong>{name || "Your profile"}</strong>
          <small>{roleBadges[plan]}</small>
        </span>
      </div>
      <nav aria-label="Application">
        {items.map(([key, label, icon, feature]) => (
          <button
            className={view === key ? "active" : ""}
            key={key}
            onClick={() => onNavigate(key as ViewKey, feature as FeatureKey | undefined)}
          >
            {icon}
            {label}
            {feature && !canAccess(plan, feature as FeatureKey) && <Lock size={14} />}
          </button>
        ))}
        {isAdmin && (
          <button className={view === "admin" ? "active" : ""} onClick={() => onNavigate("admin")}>
            <ShieldCheck />
            Admin
          </button>
        )}
      </nav>
    </aside>
  );
}

function Dashboard({
  name,
  plan,
  program,
  progress,
  onNavigate
}: {
  name: string;
  plan: PlanKey;
  program: string;
  progress: typeof studentProgressSeed;
  onNavigate: (view: ViewKey, feature?: FeatureKey) => void;
}) {
  const firstName = name.trim().split(" ")[0] || "future healthcare professional";
  const programLabel = program || progress.program;
  const [todayGoalComplete, setTodayGoalComplete] = useState(false);
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";
  const xpProgress = Math.min(100, Math.max(8, Math.round((progress.xp % 1000) / 10)));
  const todayGoal = progress.upcomingGoals[0] ?? {
    id: "default-goal",
    title: "Complete Sterile Technique Module",
    due: "Today",
    minutes: 35,
    status: "in_progress"
  };
  const learningProgress = [
    {
      title: "Surgical Technology",
      completion: Math.max(progress.pathProgress, 68),
      modules: "12/18 modules",
      view: "study" as ViewKey,
      feature: "studyPlans" as FeatureKey
    },
    {
      title: "Medical Assisting",
      completion: Math.max(progress.weeklyProgress, 54),
      modules: "9/16 modules",
      view: "study" as ViewKey,
      feature: "studyPlans" as FeatureKey
    },
    {
      title: "Phlebotomy",
      completion: 42,
      modules: "5/12 modules",
      view: "practice" as ViewKey,
      feature: "practice" as FeatureKey
    },
    {
      title: "Sterile Processing",
      completion: 76,
      modules: "10/13 modules",
      view: "clinical" as ViewKey,
      feature: "clinicalPrep" as FeatureKey
    }
  ];
  const studyStats = [
    ["Hours Studied", "18.5", <CalendarClock key="hours" />],
    ["Lessons Completed", `${progress.learningModules.filter((module) => module.status === "Complete").length + 12}`, <BookOpen key="lessons" />],
    ["Quiz Average", "84%", <Brain key="quiz" />],
    ["Practice Exams Completed", plan === "pro_student" || plan === "administrator" ? "3" : "1", <ClipboardCheck key="exams" />],
    ["Current Streak", `${progress.streakDays} days`, <Sparkles key="streak" />]
  ] as const;
  const recentTimeline = [
    { title: "Completed Lesson", detail: progress.learningModules[0]?.title ?? "Sterile Technique Module", time: "Newest", icon: <Check /> },
    { title: "Passed Quiz", detail: `${progress.recommendedTopic} practice set`, time: "Today", icon: <Trophy /> },
    { title: "Atlas Session", detail: "Reviewed certification study strategy", time: "Yesterday", icon: <MessageCircleHeart /> },
    { title: "Flashcards Reviewed", detail: "High-yield clinical terms", time: "2 days ago", icon: <BookOpen /> }
  ];
  const achievements = [
    ["🔥", "7 Day Streak"],
    ["⭐", "Quiz Master"],
    ["🏆", "Anatomy Expert"],
    ["🎓", "First Module Complete"],
    ["💯", "Perfect Score"]
  ];
  const motivationMessages = [
    "Small progress every day creates big results.",
    "You're one study session closer to certification.",
    "Consistency beats intensity."
  ];
  const motivationMessage = motivationMessages[new Date().getDate() % motivationMessages.length];
  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(progress.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );
  const quickAccess = [
    {
      title: "Continue Learning",
      copy: `Pick up with ${progress.recommendedTopic.toLowerCase()} and keep your study rhythm moving.`,
      icon: <BookOpen />,
      view: "study" as ViewKey,
      feature: "studyPlans" as FeatureKey
    },
    {
      title: "Atlas Tutor",
      copy: "Ask Atlas for explanations, encouragement, and a focused next-step plan.",
      icon: <MessageCircleHeart />,
      view: "atlas" as ViewKey,
      feature: "atlas" as FeatureKey
    },
    {
      title: "Flashcards",
      copy: "Review high-yield terms before your next session.",
      icon: <BookOpen />,
      view: "practice" as ViewKey,
      feature: "flashcards" as FeatureKey
    },
    {
      title: "Practice Exams",
      copy: "Build confidence with timed certification checks.",
      icon: <ClipboardCheck />,
      view: "practice" as ViewKey,
      feature: "mockExams" as FeatureKey
    },
    {
      title: "PathFinder",
      copy: "Compare healthcare careers, certifications, skills, and growth paths.",
      icon: <Search />,
      view: "career" as ViewKey,
      feature: "careerExplorer" as FeatureKey
    }
  ];

  return (
    <div className="dashboard-workspace">
      <section className="dashboard-hero">
        <div>
          <span className={`plan-pill ${plan}`}>{roleBadges[plan]}</span>
          <h2>{greeting}, {firstName} 👋</h2>
          <p>Ready to continue your healthcare journey?</p>
        </div>
        <div className="dashboard-hero-stats" aria-label="Student level and streak">
          <div>
            <small>Current Level</small>
            <strong>{progress.level}</strong>
          </div>
          <div>
            <small>{progress.xp.toLocaleString()} XP earned</small>
            <div className="progress-bar" aria-label={`${xpProgress}% XP progress`}>
              <span style={{ width: `${xpProgress}%` }} />
            </div>
          </div>
          <div>
            <small>Current Study Streak 🔥</small>
            <strong>{progress.streakDays} days</strong>
          </div>
        </div>
      </section>

      <section className="dashboard-quick-actions" aria-label="Dashboard quick actions">
        {quickAccess.map((item) => (
          <button
            className="dashboard-action-card"
            key={item.title}
            onClick={() => onNavigate(item.view, item.feature)}
          >
            <span>{item.icon}</span>
            <strong>{item.title}</strong>
            <small>{item.copy}</small>
            {!canAccess(plan, item.feature) && <em>Upgrade</em>}
          </button>
        ))}
      </section>

      <div className="dashboard-layout">
        <div className="dashboard-main">
          <section className="dashboard-card today-goal-card">
            <div className="card-head">
              <div>
                <p className="eyebrow">Today's Goal</p>
                <h3>{todayGoal.title || "Complete Sterile Technique Module"}</h3>
              </div>
              <Target />
            </div>
            <div className="progress-bar" aria-label={`${todayGoalComplete ? 100 : progress.weeklyProgress}% today's goal progress`}>
              <span style={{ width: `${todayGoalComplete ? 100 : Math.max(progress.weeklyProgress, 35)}%` }} />
            </div>
            <div className="goal-card-footer">
              <span>{todayGoalComplete ? "Completed" : `${todayGoal.minutes || 35} min remaining`}</span>
              <button className="primary compact" type="button" onClick={() => setTodayGoalComplete(true)}>
                {todayGoalComplete ? "Complete" : "Mark Complete"}
              </button>
            </div>
          </section>

          <section className="dashboard-section">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Learning Progress</p>
                <h3>Program pathways</h3>
              </div>
              <BarChart3 />
            </div>
            <div className="learning-progress-grid">
              {learningProgress.map((item) => (
                <article className="learning-progress-card" key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.completion}%</span>
                  <small>{item.modules} finished</small>
                  <div className="progress-bar">
                    <i style={{ width: `${item.completion}%` }} />
                  </div>
                  <button className="secondary compact" onClick={() => onNavigate(item.view, item.feature)}>
                    Continue
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Study Statistics</p>
                <h3>Your study momentum</h3>
              </div>
              <Activity />
            </div>
            <div className="study-stat-grid">
              {studyStats.map(([title, value, icon]) => (
                <Metric title={title} value={value} icon={icon} key={title} />
              ))}
            </div>
          </section>

          <section className="dashboard-two-column">
            <article className="dashboard-card">
              <div className="card-head">
                <div>
                  <p className="eyebrow">Recent Activity</p>
                  <h3>Newest first</h3>
                </div>
                <Trophy />
              </div>
              <div className="activity-timeline">
                {recentTimeline.map((activity) => (
                  <div className="timeline-item" key={activity.title}>
                    <span>{activity.icon}</span>
                    <div>
                      <strong>{activity.title}</strong>
                      <small>{activity.detail}</small>
                    </div>
                    <em>{activity.time}</em>
                  </div>
                ))}
              </div>
            </article>

            <article className="dashboard-card exam-card">
              <div className="card-head">
                <div>
                  <p className="eyebrow">Upcoming Exams</p>
                  <h3>{progress.certificationGoal}</h3>
                </div>
                <CalendarClock />
              </div>
              <span className="countdown-badge">{daysRemaining} days remaining</span>
              <div className="exam-readiness">
                <strong>{Math.max(progress.pathProgress, 72)}%</strong>
                <small>Readiness score</small>
              </div>
              <div className="progress-bar">
                <span style={{ width: `${Math.max(progress.pathProgress, 72)}%` }} />
              </div>
            </article>
          </section>

          <section className="dashboard-section">
            <div className="section-title-row">
              <div>
                <p className="eyebrow">Achievements</p>
                <h3>Milestones you've earned</h3>
              </div>
              <BadgeCheck />
            </div>
            <div className="achievement-grid">
              {achievements.map(([emoji, title]) => (
                <article className="achievement-badge" key={title}>
                  <span>{emoji}</span>
                  <strong>{title}</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="motivation-card">
            <Sparkles />
            <p>{motivationMessage}</p>
          </section>
        </div>

        <aside className="dashboard-right-sidebar" aria-label="Dashboard sidebar">
          <article className="dashboard-card">
            <small>Current Subscription</small>
            <strong>{roleBadges[plan]}</strong>
            <button className="secondary compact" onClick={() => onNavigate("billing")}>
              Manage Plan
            </button>
          </article>
          <article className="dashboard-card">
            <small>Study Time This Week</small>
            <strong>6h 40m</strong>
            <div className="progress-bar">
              <span style={{ width: `${progress.weeklyProgress}%` }} />
            </div>
          </article>
          <article className="dashboard-card">
            <small>Upcoming Goals</small>
            <ul className="sidebar-goal-list">
              {(progress.upcomingGoals.length ? progress.upcomingGoals : [todayGoal]).map((goal) => (
                <li key={goal.id}>
                  <strong>{goal.title}</strong>
                  <span>{goal.due} · {goal.minutes} min</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="dashboard-card announcement-card">
            <small>Latest Announcement</small>
            <strong>New practice sets are ready.</strong>
            <p>Atlas now recommends review topics based on your latest study activity.</p>
          </article>
        </aside>
      </div>
    </div>
  );
}

function Atlas({
  name,
  program,
  answer,
  input,
  setInput,
  onSubmit,
  messages,
  freeQuestionsRemaining,
  isChatDisabled = false
}: {
  name: string;
  program: string;
  answer: string;
  input: string;
  setInput: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  messages?: AtlasChatMessage[];
  freeQuestionsRemaining?: number;
  isChatDisabled?: boolean;
}) {
  const chatMessages =
    messages ??
    [
      {
        id: "atlas-greeting",
        role: "atlas" as const,
        text: `Good morning, ${name}. Yesterday you strengthened sterile technique. Today we can continue with instrumentation, or talk through anything that feels heavy.`
      },
      {
        id: "atlas-answer",
        role: "user" as const,
        text: answer
      }
    ];

  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">Atlas</p>
        <h2>Guiding every step of your healthcare journey.</h2>
        <p>
          Atlas remembers goals like your school, certification, exam date, strengths, and study
          habits when connected to Supabase.
        </p>
      </div>
      <section className="mentor">
        <div className="mentor-memory">
          <h3>Mentor Memory</h3>
          <ul>
            <li>Student: {name || "Not set yet"}</li>
            <li>Program: {program || "Not set yet"}</li>
            <li>Certification: NCCT / NHA track</li>
            <li>Focus: instrumentation and test anxiety</li>
            <li>Confidence level: building</li>
          </ul>
        </div>
        <div className="chat-panel">
          {typeof freeQuestionsRemaining === "number" && (
            <div className="guest-atlas-counter" aria-live="polite">
              Free Questions Remaining: {freeQuestionsRemaining}
            </div>
          )}
          <div className="guest-atlas-history" aria-label="Atlas conversation history">
            {chatMessages.map((message) => (
              <div
                className={message.role === "atlas" ? "message atlas-message" : "message user-message"}
                key={message.id}
              >
                <strong>{message.role === "atlas" ? "Atlas" : "You"}</strong>
                <p>{message.text}</p>
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder='Try “I’m overwhelmed” or “I’m nervous for clinicals”'
              aria-label="Ask Atlas"
              disabled={isChatDisabled}
            />
            <button className="primary compact" type="submit" disabled={isChatDisabled}>
              {isChatDisabled ? "Limit Reached" : "Ask"}
            </button>
          </form>
          <p className="ai-note">
            Atlas mentoring supports learning and should not replace instructors, clinical policy,
            or trusted educational resources.
          </p>
        </div>
      </section>
    </div>
  );
}

function Practice() {
  const [selected, setSelected] = useState<string | null>(null);
  const correct = selected === "Maintain a sterile field and pass instruments safely.";
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">PathPrep</p>
        <h2>Practice questions that teach, not judge.</h2>
      </div>
      <section className="panel quiz">
        <p className="tag">Sterile Technique</p>
        <h3>What is the primary responsibility of a surgical technologist during a procedure?</h3>
        {[
          "Diagnose the patient before surgery.",
          "Maintain a sterile field and pass instruments safely.",
          "Prescribe post-operative medication.",
          "Approve insurance documentation."
        ].map((option) => (
          <button
            className={selected === option ? "selected answer" : "answer"}
            key={option}
            onClick={() => setSelected(option)}
          >
            {option}
          </button>
        ))}
        {selected && (
          <div className={correct ? "explanation success" : "explanation"}>
            <strong>{correct ? "Great progress." : "Good attempt. Let’s work through this together."}</strong>
            <p>
              The surgical technologist protects the sterile field, anticipates instrument needs,
              and supports safe team communication. This is a core OR responsibility.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function StudyPlan({
  examDate,
  studyHours,
  schedule,
  setExamDate,
  setStudyHours
}: {
  examDate: string;
  studyHours: number;
  schedule: string[];
  setExamDate: (value: string) => void;
  setStudyHours: (value: number) => void;
}) {
  const courseModules = [
    {
      title: "Introduction",
      progress: 100,
      lessons: [
        {
          title: "Welcome to MedPath Learning",
          time: "8 min",
          difficulty: "Beginner",
          image: "/medpath-hero.png",
          definition: "Certification readiness means combining knowledge, practice, confidence, and exam strategy.",
          tip: "Start each study session by choosing one small measurable win.",
          warning: "Do not skip foundations. Small gaps in terminology and safety can make advanced lessons feel harder.",
          takeaways: ["Set a weekly rhythm.", "Track weak areas early.", "Use Atlas when a concept feels unclear."],
          quiz: {
            question: "What is the best first step before a focused study session?",
            options: ["Open every module at once.", "Choose one clear study goal.", "Only review old notes.", "Skip practice questions."],
            answer: "Choose one clear study goal.",
            explanation: "A clear target makes the session easier to complete and helps progress stay measurable."
          },
          flashcards: [
            ["Readiness", "A blend of knowledge, practice, confidence, and exam strategy."],
            ["Study Goal", "A specific task that can be completed in one focused session."]
          ]
        }
      ]
    },
    {
      title: "Medical Terminology",
      progress: 72,
      lessons: [
        {
          title: "Roots, Prefixes, and Suffixes",
          time: "18 min",
          difficulty: "Beginner",
          image: "/medpath-hero.png",
          definition: "A word root carries the core meaning of a medical term.",
          tip: "Break unfamiliar words into prefix, root, and suffix before memorizing the full term.",
          warning: "Similar-looking prefixes can change meaning completely, so read carefully.",
          takeaways: ["Cardi/o means heart.", "Dermat/o relates to skin.", "Suffixes often describe procedures or conditions."],
          quiz: {
            question: "What does the root cardi/o refer to?",
            options: ["Skin", "Heart", "Blood", "Bone"],
            answer: "Heart",
            explanation: "Cardi/o is the combining form for heart, as in cardiology."
          },
          flashcards: [
            ["Cardi/o", "Heart"],
            ["Dermat/o", "Skin"],
            ["-itis", "Inflammation"]
          ]
        },
        {
          title: "Clinical Abbreviations",
          time: "14 min",
          difficulty: "Beginner",
          image: "/medpath-hero.png",
          definition: "Clinical abbreviations shorten common documentation terms but must be used safely.",
          tip: "Always follow your program or facility approved abbreviation list.",
          warning: "Unsafe abbreviations can create medication or patient-care errors.",
          takeaways: ["Know approved abbreviations.", "Clarify unclear orders.", "Patient safety comes first."],
          quiz: {
            question: "What should you do if an abbreviation is unclear?",
            options: ["Guess from context.", "Ignore it.", "Clarify before acting.", "Rewrite it yourself."],
            answer: "Clarify before acting.",
            explanation: "Clarifying unclear documentation protects patient safety."
          },
          flashcards: [
            ["PRN", "As needed"],
            ["NPO", "Nothing by mouth"],
            ["STAT", "Immediately"]
          ]
        }
      ]
    },
    {
      title: "Human Anatomy",
      progress: 64,
      lessons: [
        {
          title: "Body Systems Overview",
          time: "22 min",
          difficulty: "Intermediate",
          image: "/medpath-hero.png",
          definition: "Anatomy studies body structures; physiology studies how those structures function.",
          tip: "Connect each system to a patient-care scenario to remember it longer.",
          warning: "Memorizing terms without function makes exam questions harder.",
          takeaways: ["Structure and function work together.", "Systems interact constantly.", "Clinical examples improve recall."],
          quiz: {
            question: "Physiology focuses on what?",
            options: ["How body structures function", "Only bone names", "Medical billing", "Surgical scheduling"],
            answer: "How body structures function",
            explanation: "Physiology explains how organs, tissues, and systems work."
          },
          flashcards: [
            ["Anatomy", "Study of body structures"],
            ["Physiology", "Study of body functions"],
            ["Homeostasis", "Stable internal balance"]
          ]
        }
      ]
    },
    {
      title: "Surgical Instruments",
      progress: 58,
      lessons: [
        {
          title: "Instrument Families",
          time: "20 min",
          difficulty: "Intermediate",
          image: "/medpath-hero.png",
          definition: "Surgical instruments are grouped by purpose, such as cutting, grasping, clamping, retracting, and suctioning.",
          tip: "Study instruments by job first, then memorize names.",
          warning: "Passing the wrong instrument can slow the team and increase risk.",
          takeaways: ["Know the instrument purpose.", "Anticipate surgeon needs.", "Keep sterile technique in mind."],
          quiz: {
            question: "Which instrument family is used to hold tissue?",
            options: ["Retractors", "Graspers", "Suction tips", "Scalpels"],
            answer: "Graspers",
            explanation: "Graspers are designed to hold or manipulate tissue and materials."
          },
          flashcards: [
            ["Scalpel", "Cutting instrument"],
            ["Forceps", "Grasping instrument"],
            ["Retractor", "Holds tissue aside"]
          ]
        }
      ]
    },
    {
      title: "Sterile Technique",
      progress: 82,
      lessons: [
        {
          title: "Maintaining the Sterile Field",
          time: "25 min",
          difficulty: "Intermediate",
          image: "/medpath-hero.png",
          definition: "A sterile field is an area kept free of microorganisms during procedures.",
          tip: "Keep sterile items in sight and above waist level.",
          warning: "If sterility is in doubt, consider it contaminated and speak up.",
          takeaways: ["Protect field boundaries.", "Watch movement around sterile areas.", "Communicate contamination immediately."],
          quiz: {
            question: "What should you do if sterility is in doubt?",
            options: ["Ignore it.", "Cover the item.", "Treat it as contaminated.", "Move it closer."],
            answer: "Treat it as contaminated.",
            explanation: "Patient safety requires treating questionable sterility as contamination."
          },
          flashcards: [
            ["Sterile Field", "Area kept free of microorganisms"],
            ["Contamination", "Introduction of nonsterile material"],
            ["Asepsis", "Practices that reduce infection risk"]
          ]
        }
      ]
    },
    {
      title: "Operating Room Procedures",
      progress: 40,
      lessons: [
        {
          title: "OR Flow and Team Roles",
          time: "24 min",
          difficulty: "Intermediate",
          image: "/medpath-hero.png",
          definition: "OR flow is the coordinated sequence of preparation, procedure support, and post-procedure transition.",
          tip: "Learn what each team member needs before, during, and after the case.",
          warning: "Poor communication can disrupt safety and timing.",
          takeaways: ["Know team roles.", "Use closed-loop communication.", "Prepare before the patient enters."],
          quiz: {
            question: "What communication style supports OR safety?",
            options: ["Closed-loop communication", "Silent guessing", "Delayed updates", "One-way instructions only"],
            answer: "Closed-loop communication",
            explanation: "Closed-loop communication confirms that messages are heard and acted on."
          },
          flashcards: [
            ["Circulator", "Nonsterile team member supporting room flow"],
            ["Scrub Role", "Maintains sterile field and passes instruments"],
            ["Time-out", "Safety pause before procedure"]
          ]
        }
      ]
    },
    {
      title: "Patient Safety",
      progress: 55,
      lessons: [
        {
          title: "Safety Checks and Communication",
          time: "18 min",
          difficulty: "Beginner",
          image: "/medpath-hero.png",
          definition: "Patient safety practices prevent avoidable harm during care.",
          tip: "Use two identifiers and pause when information does not match.",
          warning: "Rushing identity checks can lead to serious errors.",
          takeaways: ["Verify identity.", "Report concerns.", "Use standardized communication."],
          quiz: {
            question: "How many patient identifiers are commonly used before care?",
            options: ["One", "Two", "Four", "None"],
            answer: "Two",
            explanation: "Two identifiers help confirm the correct patient before care or procedures."
          },
          flashcards: [
            ["Two Identifiers", "Two pieces of patient information used to verify identity"],
            ["SBAR", "Situation, Background, Assessment, Recommendation"],
            ["Near Miss", "An event that could have caused harm but did not"]
          ]
        }
      ]
    },
    {
      title: "Infection Control",
      progress: 48,
      lessons: [
        {
          title: "Breaking the Chain of Infection",
          time: "19 min",
          difficulty: "Beginner",
          image: "/medpath-hero.png",
          definition: "The chain of infection describes how pathogens spread from source to host.",
          tip: "Hand hygiene is one of the most powerful ways to interrupt transmission.",
          warning: "Gloves do not replace hand hygiene.",
          takeaways: ["Know transmission routes.", "Use PPE correctly.", "Clean hands before and after care."],
          quiz: {
            question: "What is a key way to break the chain of infection?",
            options: ["Skip PPE", "Hand hygiene", "Reuse gloves", "Ignore symptoms"],
            answer: "Hand hygiene",
            explanation: "Hand hygiene reduces pathogen transmission between patients, surfaces, and staff."
          },
          flashcards: [
            ["Pathogen", "Disease-causing microorganism"],
            ["PPE", "Personal protective equipment"],
            ["Transmission", "Movement of pathogens from source to host"]
          ]
        }
      ]
    },
    {
      title: "Professional Ethics",
      progress: 34,
      lessons: [
        {
          title: "Confidentiality and Professional Boundaries",
          time: "16 min",
          difficulty: "Beginner",
          image: "/medpath-hero.png",
          definition: "Confidentiality means protecting patient information from unauthorized access or disclosure.",
          tip: "Discuss patient information only with authorized care team members.",
          warning: "Social media posts about patients or clinical settings can violate privacy.",
          takeaways: ["Protect privacy.", "Keep boundaries clear.", "Act with honesty and accountability."],
          quiz: {
            question: "Where should patient information be discussed?",
            options: ["Public elevator", "Social media", "With authorized team members", "With friends"],
            answer: "With authorized team members",
            explanation: "Patient information should only be shared for appropriate care purposes."
          },
          flashcards: [
            ["Confidentiality", "Protecting private patient information"],
            ["Boundaries", "Professional limits that protect patients and staff"],
            ["Accountability", "Owning actions and responsibilities"]
          ]
        }
      ]
    },
    {
      title: "Certification Review",
      progress: 22,
      lessons: [
        {
          title: "Exam Strategy and Readiness",
          time: "28 min",
          difficulty: "Advanced",
          image: "/medpath-hero.png",
          definition: "Exam readiness is the ability to apply knowledge under timed testing conditions.",
          tip: "Review missed questions by concept, not just by answer choice.",
          warning: "Cramming without practice can create false confidence.",
          takeaways: ["Simulate timing.", "Review rationales.", "Protect sleep before the exam."],
          quiz: {
            question: "What is the best way to review missed practice questions?",
            options: ["Memorize only the letter", "Ignore them", "Review the concept and rationale", "Stop practicing"],
            answer: "Review the concept and rationale",
            explanation: "Rationales reveal the concept gap and help you answer new questions."
          },
          flashcards: [
            ["Rationale", "Explanation for why an answer is correct or incorrect"],
            ["Readiness Score", "Estimate of preparation based on progress and performance"],
            ["Pacing", "Managing time across exam questions"]
          ]
        }
      ]
    }
  ];
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [flippedCard, setFlippedCard] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [knownCards, setKnownCards] = useState<string[]>([]);
  const [reviewCards, setReviewCards] = useState<string[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [atlasOpen, setAtlasOpen] = useState(false);
  const [atlasQuestion, setAtlasQuestion] = useState("");
  const [completionVisible, setCompletionVisible] = useState(false);
  const selectedModule = courseModules[selectedModuleIndex];
  const selectedLesson = selectedModule.lessons[selectedLessonIndex];
  const lessonKey = `${selectedModule.title}-${selectedLesson.title}`;
  const totalLessons = courseModules.reduce((total, module) => total + module.lessons.length, 0);
  const visualProgress = Math.round((completedLessons.length / totalLessons) * 100);
  const currentFlashcard = selectedLesson.flashcards[flashcardIndex];
  const isBookmarked = bookmarks.includes(lessonKey);
  const isLessonComplete = completedLessons.includes(lessonKey);
  const recommendedNextLesson =
    selectedModule.lessons[selectedLessonIndex + 1]?.title ||
    courseModules[selectedModuleIndex + 1]?.lessons[0]?.title ||
    "Certification practice quiz";

  function selectModule(index: number) {
    setSelectedModuleIndex(index);
    setSelectedLessonIndex(0);
    setSelectedAnswer("");
    setFlashcardIndex(0);
    setFlippedCard(false);
    setCompletionVisible(false);
  }

  function selectLesson(index: number) {
    setSelectedLessonIndex(index);
    setSelectedAnswer("");
    setFlashcardIndex(0);
    setFlippedCard(false);
    setCompletionVisible(false);
  }

  function advanceLesson() {
    if (!completedLessons.includes(lessonKey)) {
      setCompletedLessons((items) => [...items, lessonKey]);
    }
    setCompletionVisible(true);

    if (selectedLessonIndex < selectedModule.lessons.length - 1) {
      setTimeout(() => selectLesson(selectedLessonIndex + 1), 450);
      return;
    }

    if (selectedModuleIndex < courseModules.length - 1) {
      setTimeout(() => {
        setSelectedModuleIndex(selectedModuleIndex + 1);
        setSelectedLessonIndex(0);
        setSelectedAnswer("");
        setFlashcardIndex(0);
        setFlippedCard(false);
      }, 450);
    }
  }

  function toggleBookmark() {
    setBookmarks((items) => (items.includes(lessonKey) ? items.filter((item) => item !== lessonKey) : [...items, lessonKey]));
  }

  return (
    <div className="course-viewer">
      <aside className="course-module-sidebar" aria-label="Course modules">
        <div>
          <p className="eyebrow">Course Viewer</p>
          <h2>MedPath Foundations</h2>
        </div>
        <div className="course-module-list">
          {courseModules.map((module, index) => (
            <button
              className={index === selectedModuleIndex ? "course-module-item active" : "course-module-item"}
              key={module.title}
              onClick={() => selectModule(index)}
            >
              <span>{module.progress === 100 || completedLessons.some((lesson) => lesson.startsWith(module.title)) ? <Check size={16} /> : index + 1}</span>
              <strong>{module.title}</strong>
              <small>{module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"}</small>
              <i style={{ width: `${module.progress}%` }} />
            </button>
          ))}
        </div>
      </aside>

      <main className="course-main">
        <section className="course-top-card">
          <div>
            <p className="eyebrow">MedPath Course</p>
            <h2>{selectedModule.title}</h2>
            <h3>{selectedLesson.title}</h3>
            <div className="course-meta-row">
              <span>{selectedLesson.time}</span>
              <span className="difficulty-badge">{selectedLesson.difficulty}</span>
              <span>{isLessonComplete ? "Completed" : "In progress"}</span>
            </div>
          </div>
          <button className={isBookmarked ? "primary compact" : "secondary compact"} onClick={toggleBookmark}>
            <Star size={16} />
            {isBookmarked ? "Bookmarked" : "Bookmark Lesson"}
          </button>
          <div className="progress-bar" aria-label={`${visualProgress}% course progress`}>
            <span style={{ width: `${Math.max(visualProgress, selectedModule.progress / 2)}%` }} />
          </div>
          <div className="course-lesson-tabs" aria-label="Module lessons">
            {selectedModule.lessons.map((lesson, index) => (
              <button
                className={index === selectedLessonIndex ? "active" : ""}
                key={lesson.title}
                onClick={() => selectLesson(index)}
              >
                {lesson.title}
              </button>
            ))}
          </div>
        </section>

        <section className="lesson-content-card">
          <Image
            src={selectedLesson.image}
            alt={`${selectedLesson.title} lesson visual`}
            width={1100}
            height={760}
          />
          <div className="lesson-rich-text">
            <p>
              In this lesson, you will connect classroom knowledge to real healthcare workflows.
              Focus on the concept, the clinical purpose, and how you would explain it during a
              skills check or certification review.
            </p>
            <p>
              {selectedLesson.title} is part of the {selectedModule.title} module and supports your
              readiness for patient care, clinical rotations, and exam-style questions.
            </p>
          </div>
          <div className="lesson-callout definition">
            <strong>Medical Definition</strong>
            <p>{selectedLesson.definition}</p>
          </div>
          <div className="lesson-callout tip">
            <strong>Tip</strong>
            <p>{selectedLesson.tip}</p>
          </div>
          <div className="lesson-callout warning">
            <strong>Warning</strong>
            <p>{selectedLesson.warning}</p>
          </div>
          <div className="key-takeaways">
            <h3>Key Takeaways</h3>
            <ul>
              {selectedLesson.takeaways.map((takeaway) => (
                <li key={takeaway}>
                  <Check size={16} />
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="knowledge-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Knowledge Check</p>
              <h3>{selectedLesson.quiz.question}</h3>
            </div>
            <Brain />
          </div>
          <div className="knowledge-options">
            {selectedLesson.quiz.options.map((option) => (
              <button
                className={selectedAnswer === option ? "answer selected" : "answer"}
                key={option}
                onClick={() => setSelectedAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
          {selectedAnswer && (
            <div className={selectedAnswer === selectedLesson.quiz.answer ? "explanation success" : "explanation"}>
              <strong>{selectedAnswer === selectedLesson.quiz.answer ? "Correct." : "Not quite yet."}</strong>
              <p>{selectedLesson.quiz.explanation}</p>
            </div>
          )}
        </section>

        <section className="flashcard-section">
          <div className="card-head">
            <div>
              <p className="eyebrow">Flashcards</p>
              <h3>{flashcardIndex + 1} of {selectedLesson.flashcards.length}</h3>
            </div>
            <BookOpen />
          </div>
          <button className={flippedCard ? "flashcard flipped" : "flashcard"} onClick={() => setFlippedCard((value) => !value)}>
            <span>{flippedCard ? currentFlashcard[1] : currentFlashcard[0]}</span>
          </button>
          <div className="flashcard-actions">
            <button className="secondary compact" onClick={() => setFlashcardIndex(Math.max(0, flashcardIndex - 1))}>
              Previous
            </button>
            <button className="secondary compact" onClick={() => setFlashcardIndex(Math.min(selectedLesson.flashcards.length - 1, flashcardIndex + 1))}>
              Next
            </button>
            <button className="primary compact" onClick={() => setFlippedCard((value) => !value)}>
              Flip Card
            </button>
            <button className="secondary compact" onClick={() => setKnownCards((items) => [...new Set([...items, currentFlashcard[0]])])}>
              Mark Known
            </button>
            <button className="secondary compact" onClick={() => setReviewCards((items) => [...new Set([...items, currentFlashcard[0]])])}>
              Review Later
            </button>
          </div>
          <small>{knownCards.length} known · {reviewCards.length} review later</small>
        </section>

        <section className="notes-card">
          <div className="card-head">
            <div>
              <p className="eyebrow">Notes</p>
              <h3>Autosaved lesson notes</h3>
            </div>
            <ClipboardCheck />
          </div>
          <textarea
            value={notes[lessonKey] ?? ""}
            onChange={(event) => setNotes((items) => ({ ...items, [lessonKey]: event.target.value }))}
            placeholder={`Write notes for ${selectedLesson.title}`}
            aria-label="Lesson notes"
          />
          <small>Saved automatically in this learning session.</small>
        </section>

        {completionVisible && (
          <section className="lesson-complete-card" aria-live="polite">
            <h3>🎉 Lesson Complete</h3>
            <p>+120 XP earned. Progress updated for {selectedLesson.title}.</p>
            <button className="primary compact" onClick={() => setCompletionVisible(false)}>
              Continue to Quiz
            </button>
          </section>
        )}

        <button className="primary continue-lesson-button" onClick={advanceLesson}>
          Next Lesson <ChevronRight size={18} />
        </button>
      </main>

      <aside className="course-right-sidebar">
        <article className="course-side-card">
          <small>Course Progress</small>
          <strong>{Math.max(visualProgress, Math.round(selectedModule.progress / 2))}%</strong>
          <div className="progress-bar">
            <span style={{ width: `${Math.max(visualProgress, Math.round(selectedModule.progress / 2))}%` }} />
          </div>
        </article>
        <article className="course-side-card">
          <small>Time Studied</small>
          <strong>{studyHours}h this week</strong>
          <input
            type="range"
            min="3"
            max="18"
            value={studyHours}
            onChange={(event) => setStudyHours(Number(event.target.value))}
            aria-label="Study hours this week"
          />
        </article>
        <article className="course-side-card">
          <small>Current Streak</small>
          <strong>7 days 🔥</strong>
        </article>
        <article className="course-side-card">
          <small>Recommended Next Lesson</small>
          <strong>{recommendedNextLesson}</strong>
        </article>
        <article className="course-side-card">
          <small>Upcoming Practice Exam</small>
          <strong>{new Date(examDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong>
          <input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} aria-label="Certification exam date" />
        </article>
        <article className="atlas-lesson-card">
          <div className="card-head">
            <div>
              <small>Atlas Tutor</small>
              <strong>{selectedLesson.title}</strong>
            </div>
            <MessageCircleHeart />
          </div>
          <button className="primary compact" onClick={() => setAtlasOpen((value) => !value)}>
            Ask Atlas
          </button>
          {atlasOpen && (
            <div className="atlas-lesson-panel">
              <div className="suggested-prompts">
                {["Explain this simpler.", "Create a quiz.", "Summarize.", "Give a mnemonic."].map((prompt) => (
                  <button className="secondary compact" key={prompt} onClick={() => setAtlasQuestion(`${prompt} ${selectedLesson.title}`)}>
                    {prompt}
                  </button>
                ))}
              </div>
              <textarea
                value={atlasQuestion}
                onChange={(event) => setAtlasQuestion(event.target.value)}
                placeholder={`Ask Atlas about ${selectedLesson.title}`}
                aria-label="Ask Atlas about the current lesson"
              />
              <div className="message atlas-message">
                <strong>Atlas</strong>
                <p>
                  I know you are studying {selectedLesson.title}. Ask me to simplify, quiz,
                  summarize, or create a mnemonic for this lesson.
                </p>
              </div>
            </div>
          )}
        </article>
      </aside>
    </div>
  );
}

function Clinical() {
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">PathClinical</p>
        <h2>Feel ready before you step into clinicals.</h2>
      </div>
      <section className="clinical-grid">
        {[
          ["Daily readiness", "Uniform, ID, documents, watch, notebook, and calm arrival buffer."],
          ["OR etiquette", "Protect the sterile field, speak clearly, anticipate team needs."],
          ["Patient interaction", "Introduce yourself, verify identity, explain what you are doing."],
          ["Common mistakes", "Rushing, unclear communication, and not asking for clarification."],
          ["Professional communication", "Use closed-loop language and document promptly."],
          ["Clinical simulations", "Pro scenario practice unlocks adaptive feedback."]
        ].map(([title, copy]) => (
          <article className="panel checklist" key={title}>
            <ClipboardCheck />
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

function CareerExplorer({ plan }: { plan: PlanKey }) {
  const [careerSearch, setCareerSearch] = useState("");
  const [selectedCareerTitle, setSelectedCareerTitle] = useState("Surgical Technologist");
  type CareerPath = (typeof careers)[number];
  const requiredCareerTitles = [
    "Surgical Technologist",
    "Medical Assistant",
    "Sterile Processing Technician",
    "Phlebotomist"
  ];
  const fallbackCareers: CareerPath[] = [
    {
      title: "Surgical Technologist",
      icon: "ST",
      salary: "$60k median",
      education: "Accredited surgical technology program",
      certification: "CST or TS-C",
      outlook: "Stable OR demand",
      responsibilities: "Prepare sterile fields, pass instruments, and support surgical teams.",
      skills: "Sterile technique, focus, teamwork",
      advancement: "First assistant, OR educator, surgical services leadership"
    },
    {
      title: "Medical Assistant",
      icon: "MA",
      salary: "$42k median",
      education: "Certificate or diploma",
      certification: "CMA, RMA, CCMA, or NCMA",
      outlook: "Strong outpatient growth",
      responsibilities: "Support patient intake, vitals, EHR updates, injections, and clinic flow.",
      skills: "Communication, accuracy, patient care",
      advancement: "Lead MA, clinic manager, nursing pathway"
    },
    {
      title: "Sterile Processing Technician",
      icon: "SP",
      salary: "$47k median",
      education: "Certificate or employer training",
      certification: "CRCST or CSPDT",
      outlook: "High demand in hospitals",
      responsibilities: "Decontaminate, inspect, assemble, sterilize, and track instruments.",
      skills: "Detail orientation, infection control",
      advancement: "Lead tech, educator, surgical technology"
    },
    {
      title: "Phlebotomist",
      icon: "PH",
      salary: "$41k median",
      education: "Short certificate program",
      certification: "CPT or equivalent",
      outlook: "Consistent lab demand",
      responsibilities: "Collect blood specimens, label samples, and reassure patients.",
      skills: "Manual dexterity, patient comfort",
      advancement: "Lab assistant, MA, nursing pathway"
    }
  ];
  const orderedCareers: CareerPath[] = [
    ...requiredCareerTitles
      .map((title) => careers.find((career) => career.title === title) || fallbackCareers.find((career) => career.title === title))
      .filter((career): career is CareerPath => Boolean(career)),
    ...careers.filter((career) => !requiredCareerTitles.includes(career.title))
  ];
  const availableCareers = plan === "explorer" ? orderedCareers.slice(0, 6) : orderedCareers;
  const filteredCareers = availableCareers.filter((career) => {
    const query = careerSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return [career.title, career.responsibilities, career.education, career.certification, career.skills]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const visibleCareers = filteredCareers.length > 0 ? filteredCareers : availableCareers.slice(0, 4);
  const selectedCareer =
    availableCareers.find((career) => career.title === selectedCareerTitle) || visibleCareers[0] || fallbackCareers[0];

  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">Career Discovery</p>
        <h2>PathFinder</h2>
        <p>
          Discover healthcare career paths, compare training options, and find the role that fits
          your strengths before, during, and after school.
        </p>
      </div>

      <section className="pathfinder-search panel" aria-label="Search healthcare career paths">
        <Search />
        <input
          value={careerSearch}
          onChange={(event) => setCareerSearch(event.target.value)}
          placeholder="Search careers, certifications, skills, or training paths"
          aria-label="Search healthcare careers"
        />
      </section>

      {careerSearch && filteredCareers.length === 0 && (
        <section className="panel pathfinder-empty">
          <strong>No exact matches yet.</strong>
          <p>Here are strong starter paths to explore while MedPath adds more career data.</p>
        </section>
      )}

      <section className="career-grid">
        {visibleCareers.map((career) => (
          <article className="career-card" key={career.title}>
            <div className="career-top">
              <span>{career.icon}</span>
              <strong>{career.salary}</strong>
            </div>
            <h3>{career.title}</h3>
            <p>{career.responsibilities}</p>
            <dl>
              <div>
                <dt>Education</dt>
                <dd>{career.education}</dd>
              </div>
              <div>
                <dt>Certification</dt>
                <dd>{career.certification}</dd>
              </div>
              <div>
                <dt>Outlook</dt>
                <dd>{career.outlook}</dd>
              </div>
              <div>
                <dt>Skills</dt>
                <dd>{career.skills}</dd>
              </div>
            </dl>
            <button
              className="secondary compact career-learn-more"
              type="button"
              onClick={() => setSelectedCareerTitle(career.title)}
            >
              Learn More
              <ChevronRight size={16} />
            </button>
          </article>
        ))}
      </section>

      <section className="panel pathfinder-detail" aria-live="polite">
        <div>
          <p className="eyebrow">Career Snapshot</p>
          <h3>{selectedCareer.title}</h3>
          <p>{selectedCareer.responsibilities}</p>
        </div>
        <div className="pathfinder-detail-grid">
          <span>
            <strong>{selectedCareer.salary}</strong>
            Median salary
          </span>
          <span>
            <strong>{selectedCareer.certification}</strong>
            Common certification
          </span>
          <span>
            <strong>{selectedCareer.advancement}</strong>
            Growth path
          </span>
        </div>
      </section>
    </div>
  );
}

function ResumeBuilder({ name, program }: { name: string; program: string }) {
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">PathHire</p>
        <h2>Healthcare resume builder with PDF export.</h2>
      </div>
      <section className="resume-layout">
        <form className="panel form-panel">
          <label>
            Target role
            <input defaultValue={program} />
          </label>
          <label>
            Clinical strengths
            <textarea defaultValue="Patient care, sterile technique, vital signs, professionalism" />
          </label>
          <button className="primary" type="button">
            <WandSparkles size={18} />
            Generate Resume
          </button>
          <button className="secondary" type="button">
            <Download size={18} />
            Export PDF
          </button>
        </form>
        <article className="resume-preview">
          <h3>{name}</h3>
          <p>{program} candidate</p>
          <h4>Professional Summary</h4>
          <p>
            Supportive healthcare student with hands-on clinical preparation, strong communication,
            and a commitment to safe, compassionate care.
          </p>
          <h4>Core Skills</h4>
          <p>Vital signs · Patient intake · Sterile technique · EHR documentation · Teamwork</p>
        </article>
      </section>
    </div>
  );
}

function InterviewCoach() {
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">Interview Coach</p>
        <h2>Practice answers with supportive feedback.</h2>
      </div>
      <section className="panel interview">
        <h3>Mock question</h3>
        <p>Tell me about a time you stayed calm in a stressful clinical or classroom situation.</p>
        <textarea defaultValue="I stayed calm by pausing, confirming the priority, and communicating clearly with my instructor..." />
        <div className="score-ring">84</div>
        <p>
          Strong structure. Add a measurable outcome and one sentence about what you learned for
          an even more confident answer.
        </p>
      </section>
    </div>
  );
}

function Billing({
  plan,
  setPlan,
  onLock,
  isSignedIn
}: {
  plan: PlanKey;
  setPlan: (plan: PlanKey) => void;
  onLock: (feature: FeatureKey) => void;
  isSignedIn: boolean;
}) {
  const pricingPlans = [
    {
      key: "explorer" as PlanKey,
      name: "Free",
      price: "$0/month",
      badge: "",
      description: "Begin your MedPath with core discovery tools and a sample Atlas experience.",
      includes: [
        "Limited Atlas Tutor (3 free questions)",
        "Sample lessons",
        "Career PathFinder",
        "Basic study planner",
        "Community updates"
      ],
      button: "Get Started Free"
    },
    {
      key: "student_plus" as PlanKey,
      name: "Pro",
      price: "$14.99/month",
      badge: "Most Popular",
      description: "Unlock the full study system for daily practice, tutoring, and exam readiness.",
      includes: [
        "Everything in Free",
        "Unlimited Atlas Tutor",
        "Unlimited flashcards",
        "Unlimited quizzes",
        "Personalized study plans",
        "Progress tracking",
        "Practice exams",
        "Exam readiness score",
        "Bookmark lessons",
        "Study streaks",
        "Priority support"
      ],
      button: "Upgrade to Pro"
    },
    {
      key: "pro_student" as PlanKey,
      name: "Elite",
      price: "$29.99/month",
      badge: "",
      description: "Advanced preparation for certification, clinical confidence, and career launch.",
      includes: [
        "Everything in Pro",
        "Full certification exam simulations",
        "Advanced analytics",
        "AI learning recommendations",
        "Clinical scenario practice",
        "Resume Builder",
        "Interview Coach",
        "Early access to new healthcare programs",
        "Premium support"
      ],
      button: "Go Elite"
    }
  ];
  const comparisonRows = [
    ["Atlas Tutor", "3 questions", "Unlimited", "Unlimited"],
    ["Flashcards", "Sample", "Unlimited", "Unlimited"],
    ["Quizzes", "Sample", "Unlimited", "Unlimited"],
    ["Practice Exams", "—", "Included", "Simulations"],
    ["Study Planner", "Basic", "Personalized", "Personalized"],
    ["Progress Tracking", "—", "Included", "Advanced"],
    ["Career PathFinder", "Included", "Included", "Included"],
    ["Resume Builder", "—", "—", "Included"],
    ["Interview Coach", "—", "—", "Included"],
    ["Priority Support", "—", "Included", "Premium"]
  ];
  const pricingFaqs = [
    ["What payment methods are accepted?", "MedPath is prepared for card-based checkout through Stripe, including major debit and credit cards."],
    ["Can I cancel anytime?", "Yes. You can cancel from billing controls when subscription checkout is connected."],
    ["Do I lose my progress if I downgrade?", "No. Your saved progress remains attached to your MedPath account, though some premium tools may become locked."],
    ["Can I upgrade later?", "Yes. You can start free and move to Pro or Elite whenever you are ready for more support."]
  ];

  return (
    <div className="stack pricing-page">
      <section className="pricing-hero">
        <p className="eyebrow">Pricing</p>
        <h2>Choose Your MedPath</h2>
        <p>Learn with confidence. Practice with purpose. Pass your certification exam.</p>
      </section>

      <section className="pricing-grid">
        {pricingPlans.map((pricingPlan) => (
          <article
            className={[
              "price-card",
              "public-price-card",
              pricingPlan.key === "student_plus" ? "recommended" : "",
              plan === pricingPlan.key ? "current" : ""
            ].join(" ")}
            key={pricingPlan.name}
          >
            <div className="pricing-card-top">
              <span className={`plan-pill ${pricingPlan.key}`}>{pricingPlan.name}</span>
              {pricingPlan.badge && <strong className="popular-badge">{pricingPlan.badge}</strong>}
            </div>
            <h3>{pricingPlan.name}</h3>
            <strong className="price">{pricingPlan.price}</strong>
            <p>{pricingPlan.description}</p>
            <ul>
              {pricingPlan.includes.map((highlight) => (
                <li key={highlight}>
                  <Check size={16} />
                  {highlight}
                </li>
              ))}
            </ul>
            <button
              className={pricingPlan.key === "student_plus" ? "primary" : "secondary"}
              onClick={() => setPlan(pricingPlan.key)}
            >
              {isSignedIn && plan === pricingPlan.key ? "Current Plan" : pricingPlan.button}
            </button>
          </article>
        ))}
      </section>

      <section className="panel comparison-panel">
        <div className="card-head">
          <div>
            <p className="eyebrow">Compare Plans</p>
            <h3>Everything students need, side by side.</h3>
          </div>
          <BarChart3 />
        </div>
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Pro</th>
                <th>Elite</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map(([feature, free, pro, elite]) => (
                <tr key={feature}>
                  <td>{feature}</td>
                  <td>{free}</td>
                  <td>{pro}</td>
                  <td>{elite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pricing-faq-section">
        <div className="section-heading">
          <p className="eyebrow">FAQ</p>
          <h2>Questions before you choose?</h2>
        </div>
        <div className="faq-grid">
          {pricingFaqs.map(([question, answer]) => (
            <article className="faq-item" key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pricing-cta">
        <div>
          <p className="eyebrow">Ready when you are</p>
          <h2>Ready to pass with confidence?</h2>
        </div>
        <div className="pricing-cta-actions">
          <button className="secondary" onClick={() => setPlan("explorer")}>
            Start Free
          </button>
          <button className="primary" onClick={() => setPlan("student_plus")}>
            Upgrade to Pro
          </button>
        </div>
      </section>

      {isSignedIn && (
        <section className="billing-grid">
        <article className="panel">
          <div className="card-head">
            <h3>Billing controls</h3>
            <CreditCard />
          </div>
          <div className="billing-actions">
            <button>Update payment method</button>
            <button>Cancel subscription</button>
            <button>Resume subscription</button>
            <button>Download invoices</button>
          </div>
        </article>
        <article className="panel">
          <div className="card-head">
            <h3>Feature access</h3>
            <Lock />
          </div>
          <div className="feature-list">
            {(Object.keys(featureLabels) as FeatureKey[]).map((feature) => (
              <button key={feature} onClick={() => !canAccess(plan, feature) && onLock(feature)}>
                {canAccess(plan, feature) ? <Check size={16} /> : <Lock size={16} />}
                {featureLabels[feature]}
              </button>
            ))}
          </div>
        </article>
        <article className="panel wide">
          <div className="card-head">
            <h3>Billing history</h3>
            <CircleDollarSign />
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Event</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {subscriptionEvents.map((event) => (
                <tr key={`${event.date}-${event.event}`}>
                  <td>{event.date}</td>
                  <td>{event.event}</td>
                  <td>{event.status}</td>
                  <td>{event.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </section>
      )}
    </div>
  );
}

function Admin({
  users,
  search,
  setSearch,
  setPlan
}: {
  users: typeof import("@/lib/medpath-data").users;
  search: string;
  setSearch: (value: string) => void;
  setPlan: (plan: PlanKey) => void;
}) {
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">Administrator</p>
        <h2>Revenue, users, subscriptions, and account controls.</h2>
      </div>
      <section className="metric-grid">
        <Metric title="Monthly Revenue" value="$18,420" icon={<CircleDollarSign />} />
        <Metric title="Active Subscriptions" value="1,284" icon={<BadgeCheck />} />
        <Metric title="Cancellations" value="32" icon={<X />} />
        <Metric title="Trial Conversion" value="41%" icon={<BarChart3 />} />
      </section>
      <section className="panel">
        <div className="admin-search">
          <Search size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" />
        </div>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Controls</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </td>
                <td>{roleBadges[user.role]}</td>
                <td>{user.status}</td>
                <td>
                  <button onClick={() => setPlan(user.role)}>Impersonate</button>
                  <button>Suspend</button>
                  <button>Grant free membership</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function AuthModal({
  mode,
  name,
  program,
  error,
  notice,
  isLoading,
  setName,
  setProgram,
  setMode,
  onClose,
  onSubmit
}: {
  mode: "signup" | "login" | "forgot";
  name: string;
  program: string;
  error: string;
  notice: string;
  isLoading: boolean;
  setName: (value: string) => void;
  setProgram: (value: string) => void;
  setMode: (mode: "signup" | "login" | "forgot") => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const title = mode === "signup" ? "Create your MedPath account" : mode === "login" ? "Welcome back" : "Reset password";
  return (
    <div className="modal-backdrop">
      <form className="auth-modal" onSubmit={onSubmit}>
        <button className="close-button" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <LogoMark />
        <h2>{title}</h2>
        <p>Start with a 7-day Student Plus trial. No commitment.</p>
        {mode === "signup" && (
          <label>
            Name
            <input name="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
          </label>
        )}
        {mode !== "forgot" && (
          <label>
            Program
            <select name="program" value={program} onChange={(event) => setProgram(event.target.value)} required>
              <option value="" disabled>
                Select your program
              </option>
              <option>Medical Assistant</option>
              <option>Surgical Technologist</option>
              <option>Exploring Healthcare Careers</option>
            </select>
          </label>
        )}
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        {mode !== "forgot" && (
          <label>
            Password
            <input name="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} required />
          </label>
        )}
        {error && <p className="form-message error-message">{error}</p>}
        {notice && <p className="form-message notice-message">{notice}</p>}
        <button className="primary" type="submit" disabled={isLoading}>
          {isLoading ? "Working..." : mode === "forgot" ? "Send reset link" : "Continue to My Path"}
        </button>
        <div className="auth-switch">
          <button type="button" onClick={() => setMode("login")}>Login</button>
          <button type="button" onClick={() => setMode("signup")}>Sign Up</button>
          <button type="button" onClick={() => setMode("forgot")}>Forgot Password</button>
        </div>
      </form>
    </div>
  );
}

function UpgradeOverlay({
  feature,
  onClose,
  onUpgrade
}: {
  feature: FeatureKey;
  onClose: () => void;
  onUpgrade: () => void;
}) {
  return (
    <div className="modal-backdrop blur">
      <section className="upgrade-modal">
        <button className="close-button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <Lock />
        <h2>Unlock {featureLabels[feature]} with Student Plus.</h2>
        <p>
          Upgrade today to continue your path with unlimited Atlas support, personalized study
          plans, unlimited practice questions, resume tools, and interview coaching.
        </p>
        <ul>
          <li><Check size={16} /> Unlimited Atlas conversations</li>
          <li><Check size={16} /> Personalized study plans</li>
          <li><Check size={16} /> Resume Builder and PDF exports</li>
        </ul>
        <strong>$14.99/month after your 7-day trial</strong>
        <button className="primary" onClick={onUpgrade}>Upgrade Now</button>
      </section>
    </div>
  );
}

function GuestAtlasUpgradeModal({
  onPlans,
  onSignup,
  onClose
}: {
  onPlans: () => void;
  onSignup: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop blur">
      <section
        className="upgrade-modal guest-atlas-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-atlas-upgrade-title"
      >
        <button className="close-button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <MessageCircleHeart />
        <h2 id="guest-atlas-upgrade-title">Continue Learning with Atlas</h2>
        <p>
          You've used your 3 free Atlas questions. Unlock unlimited tutoring, personalized study
          help, quizzes, and certification support by upgrading to MedPath Pro.
        </p>
        <div className="guest-atlas-modal-actions">
          <button className="primary" onClick={onPlans}>
            View Plans
          </button>
          <button className="secondary" onClick={onSignup}>
            Create Free Account
          </button>
          <button className="text-button" onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <article className="metric">
      <span>{icon}</span>
      <small>{title}</small>
      <strong>{value}</strong>
    </article>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>MedPath</strong>
        <span>Learn. Practice. Pass.</span>
      </div>
      <nav aria-label="Footer navigation">
        <a>About</a>
        <a>Privacy Policy</a>
        <a>Terms</a>
        <a>Contact</a>
      </nav>
    </footer>
  );
}

function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 64 64" role="img" aria-label="MedPath logo">
      <path d="M10 15c9 0 16 3 22 10 6-7 13-10 22-10v34c-9 0-16 3-22 10-6-7-13-10-22-10V15Z" />
      <path d="M18 23c5 1 9 4 14 10 5-6 9-9 14-10M18 34c5 1 9 4 14 10 5-6 9-9 14-10" />
    </svg>
  );
}
