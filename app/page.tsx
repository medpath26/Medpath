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
    "Let us turn that into a clear path. I will explain the concept simply, give you one example, and suggest a focused practice set. AI-generated guidance should be verified with your instructor and trusted course materials."
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

export default function Home() {
  const [view, setView] = useState<ViewKey>("landing");
  const [darkMode, setDarkMode] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "login" | "forgot" | null>(null);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
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
        const loaded = await loadUserWorkspace(session.user);
        if (loaded) {
          setView("dashboard");
        }
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuthSession(session);
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        await loadUserWorkspace(session.user);
      } else {
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
    if (!supabase) return;

    const [{ count: goalCount }, { count: activityCount }, { count: moduleCount }] = await Promise.all([
      supabase.from("study_goals").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("recent_activity").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("learning_modules").select("id", { count: "exact", head: true }).eq("user_id", userId)
    ]);

    const writes = [];

    if (!goalCount) {
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

    if (!activityCount) {
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

    if (!moduleCount) {
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

    await Promise.all(writes);
  }

  async function loadUserWorkspace(user: User) {
    if (!supabase) return false;

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
      setAuthError(profileReadError.message);
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
        setAuthError(error.message);
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
      setAuthError(progressError.message);
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
        setAuthError(error.message);
        return false;
      }

      activeProgress = data;
    }

    await seedDashboardCollections(user.id);

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
      setAuthError(goals.error?.message ?? activity.error?.message ?? modules.error?.message ?? "");
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
    if (!signedIn && nextView !== "landing" && nextView !== "career") {
      setAuthMode("login");
      setAuthNotice("Please log in to open your MedPath workspace.");
      return;
    }
    if (feature && !canAccess(plan, feature)) {
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
          const loaded = await loadUserWorkspace(data.session.user);
          if (loaded) {
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
        const loaded = await loadUserWorkspace(data.session.user);
        if (loaded) {
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
    const normalized = chatInput.toLowerCase();
    const key = normalized.includes("overwhelmed")
      ? "overwhelmed"
      : normalized.includes("failed") || normalized.includes("exam")
        ? "failed"
        : normalized.includes("nervous") || normalized.includes("clinicals")
          ? "nervous"
          : "default";
    setMentorAnswer(mentorReplies[key]);
    setChatInput("");
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

      {view !== "landing" && signedIn && (
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
              <Billing plan={plan} setPlan={updatePlan} onLock={setLockedFeature} />
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
  return (
    <header className="topbar">
      <button className="brand" onClick={() => onNavigate("landing")} aria-label="MedPath home">
        <LogoMark />
        <span>
          <strong>MedPath</strong>
          <small>Learn with confidence. Care with purpose.</small>
        </span>
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
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} />
            Atlas, your personal learning guide
          </div>
          <h1>Your AI Mentor for Healthcare Success</h1>
          <p>
            Study smarter. Build confidence. Pass your certification. Land your dream healthcare
            career.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={onStart}>
              Get Started
              <ChevronRight size={18} />
            </button>
            <button className="secondary" onClick={onCareers}>
              Explore Careers
            </button>
          </div>
          <div className="trust-row" aria-label="Platform highlights">
            <span>7-day Student Plus trial</span>
            <span>RBAC subscriptions</span>
            <span>Dark mode</span>
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
      <section className="product-band">
        {[
          ["PathFinder", "Explore careers and certification routes.", <Search key="i" />],
          ["PathPrep", "Practice, flashcards, and exam readiness.", <BookOpen key="i" />],
          ["PathCoach", "Atlas support for study and confidence.", <HeartHandshake key="i" />],
          ["PathTrack", "XP, streaks, badges, and progress.", <Trophy key="i" />],
          ["PathClinical", "Clinicals, OR etiquette, and simulations.", <Stethoscope key="i" />],
          ["PathHire", "Resume, interviews, and career growth.", <BriefcaseBusiness key="i" />]
        ].map(([title, copy, icon]) => (
          <article className="pillar" key={String(title)}>
            {icon}
            <h3>{title}</h3>
            <p>{copy}</p>
          </article>
        ))}
      </section>
    </>
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
  const completedJourneySteps = Math.max(1, Math.round((progress.pathProgress / 100) * journey.length));
  const quickAccess = [
    {
      title: "Quizzes",
      copy: "Continue topic-based questions with explanations.",
      icon: <Brain />,
      view: "practice" as ViewKey,
      feature: "practice" as FeatureKey,
      metric: "72% ready"
    },
    {
      title: "Flashcards",
      copy: "Review high-yield terms before your next session.",
      icon: <BookOpen />,
      view: "practice" as ViewKey,
      feature: "flashcards" as FeatureKey,
      metric: "46% reviewed"
    },
    {
      title: "Practice Exams",
      copy: "Build confidence with timed certification checks.",
      icon: <ClipboardCheck />,
      view: "practice" as ViewKey,
      feature: "mockExams" as FeatureKey,
      metric: plan === "pro_student" || plan === "administrator" ? "Ready" : "Pro"
    },
    {
      title: "Atlas AI",
      copy: "Ask for a plan, a simple explanation, or encouragement.",
      icon: <MessageCircleHeart />,
      view: "atlas" as ViewKey,
      feature: "atlas" as FeatureKey,
      metric: "Open"
    }
  ];

  return (
    <div className="stack">
      <section className="student-hero">
        <div className="page-title">
          <span className={`plan-pill ${plan}`}>{roleBadges[plan]}</span>
          <h2>Welcome back, {firstName}.</h2>
          <p>
            Your {programLabel} dashboard is ready. Atlas recommends focusing on{" "}
            {progress.recommendedTopic.toLowerCase()} next.
          </p>
        </div>
        <div className="student-summary">
          <span>{programLabel}</span>
          <strong>{progress.level}</strong>
          <small>{progress.xp.toLocaleString()} XP earned</small>
        </div>
      </section>

      <section className="metric-grid">
        <Metric title="Today’s Study Goal" value={`${progress.upcomingGoals[0].minutes} min`} icon={<Target />} />
        <Metric title="Study Streak" value={`${progress.streakDays} days`} icon={<Sparkles />} />
        <Metric title="Upcoming Exam" value={new Date(progress.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} icon={<CalendarClock />} />
        <Metric title="Weekly Progress" value={`${progress.weeklyProgress}%`} icon={<BarChart3 />} />
      </section>

      <section className="journey-card">
        <div>
          <p className="eyebrow">Path Progress</p>
          <h3>{programLabel} journey</h3>
          <p>
            Next milestone: <strong>{progress.nextMilestone}</strong>. Progress is stored by user ID
            and can expand as lessons, quizzes, and exams are added.
          </p>
        </div>
        <div className="path-line">
          {journey.map((step, index) => (
            <span className={index < completedJourneySteps ? "complete" : ""} key={step}>
              <i>{index + 1}</i>
              {step}
            </span>
          ))}
        </div>
        <div className="progress-bar" aria-label={`${progress.pathProgress}% path progress`}>
          <span style={{ width: `${progress.pathProgress}%` }} />
        </div>
      </section>

      <section className="student-dashboard-grid">
        <article className="panel motivation">
          <div className="card-head">
            <h3>Today’s Mentor Note</h3>
            <Sparkles />
          </div>
          <p>
            Welcome back. Every focused session moves you closer to your healthcare career. Today,
            spend a short block on your recommended topic, then finish with a confidence-building
            quiz.
          </p>
        </article>
        <article className="panel">
          <div className="card-head">
            <h3>Upcoming Study Goals</h3>
            <Target />
          </div>
          <ul className="goal-list">
            {progress.upcomingGoals.map((goal) => (
              <li key={goal.id}>
                <span>
                  <strong>{goal.title}</strong>
                  <small>{goal.due} · {goal.minutes} minutes</small>
                </span>
                <em>{goal.status.replace("_", " ")}</em>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <div className="card-head">
            <h3>Recent Activity</h3>
            <Trophy />
          </div>
          <ul className="activity-list">
            {progress.recentActivity.map((activity) => (
              <li key={activity.id}>
                <span>
                  <strong>{activity.title}</strong>
                  <small>{activity.detail}</small>
                </span>
                <em>{activity.score ? `${activity.score}%` : activity.time}</em>
              </li>
            ))}
          </ul>
        </article>
        <article className="panel">
          <div className="card-head">
            <h3>Learning Progress</h3>
            <BarChart3 />
          </div>
          <div className="module-list">
            {progress.learningModules.map((module) => (
              <div className="module-progress" key={module.id}>
                <div>
                  <strong>{module.title}</strong>
                  <small>{module.category} · {module.status}</small>
                </div>
                <span>{module.progress}%</span>
                <div className="progress-bar">
                  <i style={{ width: `${module.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="quick-access-panel" aria-label="Student quick access">
        <div className="card-head">
          <div>
            <p className="eyebrow">Quick Access</p>
            <h3>Continue your path</h3>
          </div>
          <MessageCircleHeart />
        </div>
        <div className="quick-access-grid">
          {quickAccess.map((item) => (
            <button
              className="quick-access-card"
              key={item.title}
              onClick={() => onNavigate(item.view, item.feature)}
            >
              <span>{item.icon}</span>
              <strong>{item.title}</strong>
              <small>{item.copy}</small>
              <em>{!canAccess(plan, item.feature) ? "Upgrade" : item.metric}</em>
            </button>
          ))}
        </div>
      </section>

      <section className="quick-grid">
        {quickCards.map((card) => (
          <button
            className="tool-card"
            key={card.title}
            onClick={() => onNavigate(card.key, card.feature)}
          >
            <span>{card.icon}</span>
            <strong>{card.title}</strong>
            <small>{card.copy}</small>
            {!canAccess(plan, card.feature) && <em>Upgrade</em>}
          </button>
        ))}
      </section>
    </div>
  );
}

function Atlas({
  name,
  program,
  answer,
  input,
  setInput,
  onSubmit
}: {
  name: string;
  program: string;
  answer: string;
  input: string;
  setInput: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
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
          <div className="message atlas-message">
            <strong>Atlas</strong>
            <p>
              Good morning, {name}. Yesterday you strengthened sterile technique. Today we can
              continue with instrumentation, or talk through anything that feels heavy.
            </p>
          </div>
          <div className="message user-message">
            <strong>You</strong>
            <p>{answer}</p>
          </div>
          <form className="chat-input" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder='Try “I’m overwhelmed” or “I’m nervous for clinicals”'
              aria-label="Ask Atlas"
            />
            <button className="primary compact" type="submit">
              Ask
            </button>
          </form>
          <p className="ai-note">
            AI-generated mentoring supports learning and should not replace instructors, clinical
            policy, or trusted educational resources.
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
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">Personalized Study Plan</p>
        <h2>Turn exam anxiety into a weekly rhythm.</h2>
      </div>
      <section className="study-layout">
        <form className="panel form-panel">
          <label>
            Certification exam date
            <input type="date" value={examDate} onChange={(event) => setExamDate(event.target.value)} />
          </label>
          <label>
            Hours available each week
            <input
              type="range"
              min="3"
              max="18"
              value={studyHours}
              onChange={(event) => setStudyHours(Number(event.target.value))}
            />
            <span>{studyHours} hours/week</span>
          </label>
          <div className="progress-bar">
            <span style={{ width: `${Math.min(100, studyHours * 6)}%` }} />
          </div>
        </form>
        <div className="panel">
          <h3>This week</h3>
          <ul className="schedule">
            {schedule.map((topic, index) => (
              <li key={topic}>
                <Check size={17} />
                Day {index + 1}: {topic}
              </li>
            ))}
          </ul>
        </div>
      </section>
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
  const visibleCareers = plan === "explorer" ? careers.slice(0, 6) : careers;
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">PathFinder</p>
        <h2>Explore healthcare careers before, during, and after school.</h2>
      </div>
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
          </article>
        ))}
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
  onLock
}: {
  plan: PlanKey;
  setPlan: (plan: PlanKey) => void;
  onLock: (feature: FeatureKey) => void;
}) {
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">Subscription Management</p>
        <h2>Plans, permissions, billing history, and Stripe-ready checkout.</h2>
      </div>
      <section className="pricing-grid">
        {(Object.keys(plans) as PlanKey[])
          .filter((key) => !["institution_admin", "institution_student", "administrator"].includes(key))
          .map((key) => (
            <article className={plan === key ? "price-card current" : "price-card"} key={key}>
              <span className={`plan-pill ${key}`}>{roleBadges[key]}</span>
              <h3>{plans[key].name}</h3>
              <p>{plans[key].description}</p>
              <strong className="price">{plans[key].price}</strong>
              <ul>
                {plans[key].highlights.map((highlight) => (
                  <li key={highlight}>
                    <Check size={16} />
                    {highlight}
                  </li>
                ))}
              </ul>
              <button className={plan === key ? "secondary" : "primary"} onClick={() => setPlan(key)}>
                {plan === key ? "Current Plan" : key === "explorer" ? "Downgrade" : "Upgrade"}
              </button>
            </article>
          ))}
      </section>
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
      <span>MedPath</span>
      <a>About</a>
      <a>Privacy Policy</a>
      <a>Terms</a>
      <a>Contact</a>
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
