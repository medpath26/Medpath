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
  Eye,
  EyeOff,
  GraduationCap,
  HeartHandshake,
  Lock,
  LogIn,
  Menu,
  MessageCircleHeart,
  Moon,
  Search,
  Settings,
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
import {
  FeatureKey,
  PlanKey,
  canAccess,
  careers,
  featureLabels,
  plans,
  roleBadges,
  studentProgressSeed,
  users
} from "@/lib/medpath-data";
import { healthcarePathways } from "@/lib/healthcare-pathways";
import type { AtlasChatMessage, ViewKey } from "./Common/types";

export function Header({
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const navigateMobile = (nextView: ViewKey, feature?: FeatureKey) => {
    onNavigate(nextView, feature);
    closeMobileMenu();
  };
  const authMobile = (mode: "signup" | "login") => {
    onAuth(mode);
    closeMobileMenu();
  };
  const logoutMobile = () => {
    onLogout();
    closeMobileMenu();
  };
  const authenticatedMobileItems = [
    ["Dashboard", <Activity key="icon" />, () => navigateMobile("dashboard")],
    ["Course Viewer", <BookOpen key="icon" />, () => navigateMobile("study", "studyPlans")],
    ["PathPrep", <Brain key="icon" />, () => navigateMobile("practice", "practice")],
    ["Flashcards", <BookOpen key="icon" />, () => navigateMobile("practice", "flashcards")],
    ["Practice Exams", <ClipboardCheck key="icon" />, () => navigateMobile("practice", "mockExams")],
    ["Atlas Tutor", <MessageCircleHeart key="icon" />, () => navigateMobile("atlas", "atlas")],
    ["Explorer", <GraduationCap key="icon" />, () => navigateMobile("roadmaps")],
    ["PathFinder", <Search key="icon" />, () => navigateMobile("career", "careerExplorer")],
    ["Pricing", <CreditCard key="icon" />, () => navigateMobile("billing")],
    ["Profile", <UserRound key="icon" />, () => navigateMobile("dashboard")],
    ["Settings", <Settings key="icon" />, () => navigateMobile("billing")],
    ["Logout", <LogIn key="icon" />, logoutMobile]
  ] as const;
  const guestMobileItems = [
    ["Home", <Activity key="icon" />, () => navigateMobile("landing")],
    ["Atlas", <MessageCircleHeart key="icon" />, () => navigateMobile("atlas", "atlas")],
    ["PathFinder", <Search key="icon" />, () => navigateMobile("career", "careerExplorer")],
    ["Pricing", <CreditCard key="icon" />, () => navigateMobile("billing")],
    ["Login", <LogIn key="icon" />, () => authMobile("login")],
    ["Sign Up", <UserRound key="icon" />, () => authMobile("signup")]
  ] as const;
  const mobileItems = signedIn ? authenticatedMobileItems : guestMobileItems;

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
        <button onClick={() => onNavigate("roadmaps")}>Explorer</button>
        <button onClick={() => onNavigate("career", "careerExplorer")}>PathFinder</button>
        <button onClick={() => onNavigate("atlas", "atlas")}>Atlas</button>
        <button onClick={() => onNavigate("billing")}>Pricing</button>
      </nav>
      <div className="top-actions">
        {signedIn && <span className={`plan-pill ${plan}`}>{roleBadges[plan]}</span>}
        <button
          className="icon-button mobile-menu-toggle"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label="Toggle mobile navigation"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
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
      <nav
        className={mobileMenuOpen ? "mobile-nav open" : "mobile-nav"}
        id="mobile-navigation"
        aria-label="Mobile"
      >
        {mobileItems.map(([label, icon, action]) => (
          <button
            className={label === "Logout" ? "mobile-nav-danger" : ""}
            key={label}
            onClick={action}
          >
            {icon}
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export function Landing({ onStart, onCareers }: { onStart: () => void; onCareers: () => void }) {
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
            src="/medpath-hero-diverse.png"
            width={1100}
            height={760}
            alt="Healthcare students and a mentor studying together"
            priority
          />
          <div className="floating-card">
            <BadgeCheck />
            <span>Personal exam tracker</span>
            <strong>Set your certification goal after signup</strong>
          </div>
        </div>
      </section>

      <section className="proof-strip" aria-label="MedPath outcomes">
        {[
          ["24/7", "Mentor-Style Support"],
          ["10+", "Healthcare Career Paths"],
          ["7 days", "Student Plus Trial"],
          ["1 path", "From Class to Career"]
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
            ["Pro Student", "$29.99/mo", "Adaptive lessons, mock exams, advanced analytics, and priority guidance."],
            ["Founding Member", "$9.99/mo", "The first 20 members lock in Pro access and early-adopter pricing."]
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

export function Sidebar({
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

export function Dashboard({
  name,
  plan,
  program,
  progress,
  examTrackerHidden,
  onSaveExamTracker,
  onDeleteExamTracker,
  onHideExamTracker,
  onNavigate,
  onSwitchPathway,
  pathwaySwitching,
  pathwaySwitchError
}: {
  name: string;
  plan: PlanKey;
  program: string;
  progress: typeof studentProgressSeed;
  examTrackerHidden: boolean;
  onSaveExamTracker: (certificationGoal: string, examDate: string) => Promise<boolean>;
  onDeleteExamTracker: () => Promise<boolean>;
  onHideExamTracker: () => void;
  onNavigate: (view: ViewKey, feature?: FeatureKey) => void;
  onSwitchPathway: (pathway: string) => Promise<void>;
  pathwaySwitching: boolean;
  pathwaySwitchError: string;
}) {
  const firstName = name.trim().split(" ")[0] || "future healthcare professional";
  const programLabel = program || progress.program;
  const [todayGoalComplete, setTodayGoalComplete] = useState(false);
  const [dashboardPanel, setDashboardPanel] = useState<"profile" | "settings" | null>(null);
  const [studyReminders, setStudyReminders] = useState(false);
  useEffect(() => {
    setStudyReminders(window.localStorage.getItem("medpath-study-reminders") === "true");
  }, []);
  const [examEditing, setExamEditing] = useState(false);
  const [examSaving, setExamSaving] = useState(false);
  const [examDraftName, setExamDraftName] = useState("");
  const [examDraftDate, setExamDraftDate] = useState("");
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";
  const xpProgress = Math.min(100, Math.max(8, Math.round((progress.xp % 1000) / 10)));
  const hasPersonalExam = Boolean(progress.certificationGoal.trim()) && progress.certificationGoal !== studentProgressSeed.certificationGoal;
  const examDateValue = progress.examDate ? new Date(`${progress.examDate}T00:00:00`) : null;
  const daysRemaining = examDateValue
    ? Math.max(0, Math.ceil((examDateValue.getTime() - Date.now()) / 86400000))
    : 0;
 const todayGoal = progress.upcomingGoals[0] ?? {
  id: "default-goal",
  title: "No study goal set yet",
  due: "Not scheduled",
  minutes: 0,
  status: "ready"
};
  const learningProgress = programLabel.trim()
  ? [
      {
        title: programLabel,
        completion: progress.pathProgress,
        modules: `${
          progress.learningModules.filter(
            (module) => module.status === "Complete"
          ).length
        }/${progress.learningModules.length} modules`,
        view: "study" as ViewKey,
        feature: "studyPlans" as FeatureKey
      }
    ]
  : [];
  const studyStats = [
  ["Hours Studied", "0", <CalendarClock key="hours" />],
  ["Lessons Completed", `${progress.learningModules.filter((module) => module.status === "Complete").length}`, <BookOpen key="lessons" />],
  ["Quiz Average", "—", <Brain key="quiz" />],
  ["Practice Exams Completed", "0", <ClipboardCheck key="exams" />],
  ["Current Streak", `${progress.streakDays} days`, <Sparkles key="streak" />]
] as const;
const recentTimeline = progress.recentActivity.map((activity) => ({
  title: activity.title,
  detail: activity.detail,
  time: activity.time,
  icon: <BookOpen />
}));
const achievements: [string, string][] = [];
  const motivationMessages = [
    "Small progress every day creates big results.",
    "You're one study session closer to certification.",
    "Consistency beats intensity."
  ];
  const motivationMessage = motivationMessages[new Date().getDate() % motivationMessages.length];
  const quickAccess = [
    {
      title: "Course Viewer",
      copy: "Continue your lessons.",
      icon: <BookOpen />,
      view: "study" as ViewKey,
      feature: "studyPlans" as FeatureKey,
      action: "Open"
    },
    {
      title: "Atlas Tutor",
      copy: "Ask questions and get explanations.",
      icon: <MessageCircleHeart />,
      view: "atlas" as ViewKey,
      feature: "atlas" as FeatureKey,
      action: "Open"
    },
    {
      title: "Flashcards",
      copy: "Review with active recall.",
      icon: <BookOpen />,
      view: "practice" as ViewKey,
      feature: "flashcards" as FeatureKey,
      action: "Study"
    },
    {
      title: "Practice Exams",
      copy: "Simulate your certification exam.",
      icon: <ClipboardCheck />,
      view: "practice" as ViewKey,
      feature: "mockExams" as FeatureKey,
      action: "Start"
    },
    {
      title: "PathFinder",
      copy: "Explore healthcare careers.",
      icon: <Search />,
      view: "career" as ViewKey,
      feature: "careerExplorer" as FeatureKey,
      action: "Explore"
    },
    {
      title: "Progress",
      copy: "View your learning progress.",
      icon: <BarChart3 />,
      view: "dashboard" as ViewKey,
      feature: undefined,
      action: "View"
    },
    {
      title: "Pricing",
      copy: "Compare plans and upgrade.",
      icon: <CreditCard />,
      view: "billing" as ViewKey,
      feature: undefined,
      action: "View Plans"
    },
    {
      title: "Profile",
      copy: "Manage your account.",
      icon: <UserRound />,
      view: "dashboard" as ViewKey,
      feature: undefined,
      action: "Open"
    },
    {
      title: "Settings",
      copy: "Preferences and notifications.",
      icon: <Settings />,
      view: "billing" as ViewKey,
      feature: undefined,
      action: "Open"
    }
  ];

  useEffect(() => {
    setExamDraftName(hasPersonalExam ? progress.certificationGoal : "");
    setExamDraftDate(hasPersonalExam ? progress.examDate : "");
  }, [hasPersonalExam, progress.certificationGoal, progress.examDate]);

  async function handleExamSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExamSaving(true);
    const saved = await onSaveExamTracker(examDraftName, examDraftDate);
    setExamSaving(false);
    if (saved) {
      setExamEditing(false);
    }
  }

  async function handleExamDelete() {
    setExamSaving(true);
    const deleted = await onDeleteExamTracker();
    setExamSaving(false);
    if (deleted) {
      setExamEditing(false);
    }
  }

  function handleQuickAccess(title: string, nextView: ViewKey, feature?: FeatureKey) {
    if (title === "Progress") {
      setDashboardPanel(null);
      document.getElementById("medpath-learning-progress")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (title === "Profile" || title === "Settings") {
      setDashboardPanel(title === "Profile" ? "profile" : "settings");
      window.requestAnimationFrame(() => document.getElementById("medpath-account-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return;
    }
    onNavigate(nextView, feature);
  }

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

      <section className="dashboard-card" aria-label="Active healthcare pathway">
        <div className="card-head">
          <div>
            <p className="eyebrow">Your Learning Path</p>
            <h3>{programLabel}</h3>
            <p>Switch careers without discarding your saved pathway snapshot.</p>
          </div>
        </div>
        <label htmlFor="medpath-switch-pathway">Switch Pathway</label>
        <select
          id="medpath-switch-pathway"
          value={program}
          disabled={pathwaySwitching}
          onChange={(event) => void onSwitchPathway(event.target.value)}
        >
          {healthcarePathways.map((path) => (
            <option key={path.id} value={path.label}>{path.label}</option>
          ))}
          {program && !healthcarePathways.some((path) => path.label === program) && (
            <option value={program}>{program}</option>
          )}
        </select>
        {pathwaySwitching && <p role="status">Saving and loading your pathway…</p>}
        {pathwaySwitchError && <p role="alert" className="form-message error-message">{pathwaySwitchError}</p>}
      </section>

      {!examTrackerHidden && (
        <section className="dashboard-card exam-tracker-card" aria-label="Personal exam tracker">
          <div className="card-head">
            <div>
              <p className="eyebrow">Exam Tracker</p>
              <h3>{hasPersonalExam ? progress.certificationGoal : "No exam scheduled yet."}</h3>
            </div>
            <CalendarClock />
          </div>

          {examEditing ? (
            <form className="exam-tracker-form" onSubmit={handleExamSubmit}>
              <label>
                Certification Name
                <input
                  type="text"
                  value={examDraftName}
                  onChange={(event) => setExamDraftName(event.target.value)}
                  placeholder="NCCT TS-C"
                  required
                />
              </label>
              <label>
                Exam Date
                <input
                  type="date"
                  value={examDraftDate}
                  onChange={(event) => setExamDraftDate(event.target.value)}
                  required
                />
              </label>
              <div className="exam-tracker-actions">
                <button className="primary compact" type="submit" disabled={examSaving}>
                  {examSaving ? "Saving..." : "Save Exam"}
                </button>
                <button className="secondary compact" type="button" onClick={() => setExamEditing(false)} disabled={examSaving}>
                  Cancel
                </button>
                {hasPersonalExam && (
                  <button className="text-button danger" type="button" onClick={handleExamDelete} disabled={examSaving}>
                    Delete
                  </button>
                )}
              </div>
            </form>
          ) : hasPersonalExam ? (
            <div className="exam-tracker-summary">
              <div>
                <small>Days Remaining</small>
                <strong>{daysRemaining}</strong>
              </div>
              <div>
                <small>Today's Study Focus</small>
                <strong>{progress.recommendedTopic}</strong>
              </div>
              <div className="exam-tracker-actions">
                <button className="secondary compact" type="button" onClick={() => setExamEditing(true)}>
                  Edit
                </button>
                <button className="secondary compact" type="button" onClick={onHideExamTracker}>
                  Hide
                </button>
                <button className="text-button danger" type="button" onClick={handleExamDelete} disabled={examSaving}>
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="exam-tracker-empty">
              <p>No exam scheduled yet.</p>
              <button className="primary compact" type="button" onClick={() => setExamEditing(true)}>
                Set My Exam
              </button>
            </div>
          )}
        </section>
      )}

      <section className="home-quick-access" aria-label="Explore MedPath quick access">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">Explore MedPath</p>
            <h3>Everything you need to study, practice, and pass.</h3>
          </div>
          <Sparkles />
        </div>
        <div className="dashboard-quick-actions">
          {quickAccess.map((item) => (
            <button
              className="dashboard-action-card"
              key={item.title}
              onClick={() => handleQuickAccess(item.title, item.view, item.feature)}
            >
              <span>{item.icon}</span>
              <strong>{item.title}</strong>
              <small>{item.copy}</small>
              <em>{item.feature && !canAccess(plan, item.feature) ? "Upgrade" : item.action}</em>
            </button>
          ))}
        </div>
      </section>

      {dashboardPanel && (
        <section id="medpath-account-panel" className="dashboard-card" aria-label={dashboardPanel === "profile" ? "Your profile" : "Your settings"}>
          <div className="card-head">
            <h3>{dashboardPanel === "profile" ? "Your Profile" : "Settings"}</h3>
            <button className="secondary compact" type="button" onClick={() => setDashboardPanel(null)}>Close</button>
          </div>
          {dashboardPanel === "profile" ? (
            <div>
              <p><strong>Name:</strong> {name || "Not set"}</p>
              <p><strong>Healthcare program:</strong> {programLabel || "Not set"}</p>
              <p><strong>Membership:</strong> {roleBadges[plan]}</p>
              <button className="secondary compact" type="button" onClick={() => onNavigate("billing")}>Manage membership</button>
            </div>
          ) : (
            <div>
              <p>Personalize your MedPath experience.</p>
              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" checked={studyReminders} onChange={(event) => {
                  setStudyReminders(event.target.checked);
                  window.localStorage.setItem("medpath-study-reminders", String(event.target.checked));
                }} />
                Save my study reminder preference on this device
              </label>
              <small>This preference is saved locally. Automated notifications are not yet enabled.</small>
            </div>
          )}
        </section>
      )}

      <div className="dashboard-layout">
        <div className="dashboard-main">
          <section className="dashboard-card today-goal-card">
            <div className="card-head">
              <div>
                <p className="eyebrow">Today's Goal</p>
               <h3>{todayGoal.title}</h3>
              </div>
              <Target />
            </div>
            <div className="progress-bar" aria-label={`${todayGoalComplete ? 100 : progress.weeklyProgress}% today's goal progress`}>
            <span style={{ width: `${todayGoalComplete ? 100 : progress.weeklyProgress}%` }} />
            </div>
            <div className="goal-card-footer">
              <span>{todayGoalComplete ? "Completed" : `${todayGoal.minutes || 35} min remaining`}</span>
              <button className="primary compact" type="button" onClick={() => setTodayGoalComplete(true)}>
                {todayGoalComplete ? "Complete" : "Mark Complete"}
              </button>
            </div>
          </section>

          <section id="medpath-learning-progress" className="dashboard-section">
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

          <section className="dashboard-card">
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
            <strong>0h 0m</strong>
            <div className="progress-bar">
              <span style={{ width: `${progress.weeklyProgress}%` }} />
            </div>
          </article>
          <article className="dashboard-card">
            <small>Upcoming Goals</small>
           <ul className="sidebar-goal-list">
  {progress.upcomingGoals.map((goal) => (
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

export function Atlas({
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

export function Practice({ initialMode, plan, program }: { initialMode: "flashcards" | "practiceExams"; plan: PlanKey; program: string }) {
  const [studyMode, setStudyMode] = useState<"flashcards" | "practiceExams">(initialMode);
  const flashcards = [
    {
      category: "Surgical Technology",
      difficulty: "Intermediate",
      front: "What is the surgical technologist's primary responsibility during a procedure?",
      back: "Maintain the sterile field, anticipate instrument needs, and support safe team communication."
    },
    {
      category: "Surgical Technology",
      difficulty: "Beginner",
      front: "Sterile Field",
      back: "An area kept free of microorganisms during a procedure."
    },
    {
      category: "Medical Assisting",
      difficulty: "Beginner",
      front: "What are two common duties of a medical assistant?",
      back: "Patient intake, vital signs, EHR updates, injections, scheduling, and clinical support."
    },
    {
      category: "Medical Assisting",
      difficulty: "Intermediate",
      front: "What should you do before administering an injection?",
      back: "Verify the order, confirm patient identity, check allergies, prepare the correct medication, and use proper technique."
    },
    {
      category: "Sterile Processing",
      difficulty: "Intermediate",
      front: "What is decontamination?",
      back: "The process of removing soil and reducing microorganisms from instruments before inspection and sterilization."
    },
    {
      category: "Sterile Processing",
      difficulty: "Advanced",
      front: "Why is instrument inspection important?",
      back: "Inspection confirms instruments are clean, functional, assembled correctly, and safe for patient care."
    },
    {
      category: "Anatomy",
      difficulty: "Beginner",
      front: "Anatomy",
      back: "The study of body structures."
    },
    {
      category: "Anatomy",
      difficulty: "Intermediate",
      front: "Homeostasis",
      back: "The body's ability to maintain a stable internal balance."
    },
    {
      category: "Medical Terminology",
      difficulty: "Beginner",
      front: "Cardi/o",
      back: "Heart."
    },
    {
      category: "Medical Terminology",
      difficulty: "Beginner",
      front: "-itis",
      back: "Inflammation."
    },
    {
      category: "Infection Control",
      difficulty: "Beginner",
      front: "What is one of the most effective ways to reduce infection transmission?",
      back: "Hand hygiene before and after patient care."
    },
    {
      category: "Infection Control",
      difficulty: "Intermediate",
      front: "PPE",
      back: "Personal protective equipment used to reduce exposure to infectious material."
    }
,
    {"category":"Surgical Technology","difficulty":"Intermediate","front":"Aseptic technique","back":"Practices that prevent contamination by microorganisms."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Surgical time-out","back":"Team confirmation of patient identity, procedure, site, and key safety concerns before incision."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Circulating nurse","back":"Nonsterile team member who coordinates patient care and room activities."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Scrub role","back":"Maintains the sterile field and manages sterile instruments and supplies."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Hemostat","back":"Instrument used to clamp blood vessels or tissue."},
    {"category":"Surgical Technology","difficulty":"Intermediate","front":"Retractor","back":"Instrument that holds tissue aside to improve surgical exposure."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Forceps","back":"Instrument used to grasp or manipulate tissue and materials."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Scalpel","back":"Sharp instrument used to make surgical incisions."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Needle holder","back":"Instrument used to hold and guide a suture needle."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Surgical count","back":"Accounting for sponges, sharps, and instruments to prevent retained items."},
    {"category":"Surgical Technology","difficulty":"Intermediate","front":"Sterile gown","back":"Protective garment with defined sterile areas on the front and sleeves."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Closed-loop communication","back":"Repeating and confirming a message to verify it was received correctly."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Contaminated wrapper","back":"A torn or wet sterile package cannot be assumed sterile."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Surgical positioning","back":"Placing and padding the patient to allow access while reducing injury risk."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Sharps safety","back":"Handle and dispose of needles and blades using approved safety practices."},
    {"category":"Surgical Technology","difficulty":"Intermediate","front":"Electrosurgery","back":"Use of electrical energy to cut or coagulate tissue."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Suction tip","back":"Device used to remove fluids from the operative field."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Specimen handling","back":"Label and transfer surgical specimens according to the facility's protocol."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Suture","back":"Material used to approximate tissue or secure structures."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Surgical draping","back":"Placing sterile barriers to establish and maintain the sterile field."},
    {"category":"Surgical Technology","difficulty":"Intermediate","front":"Break in sterile technique","back":"Notify the team and correct contamination immediately."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Instrument passing","back":"Present the correct instrument safely and in the orientation needed."},
    {"category":"Surgical Technology","difficulty":"Beginner","front":"Case preparation","back":"Verify equipment, instruments, supplies, and procedure requirements before surgery."}
,
    {"category":"Medical Assisting","difficulty":"Intermediate","front":"Two patient identifiers","back":"Verify identity using two approved identifiers, not a room number."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Pulse rate","back":"Number of heartbeats per minute."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Respiratory rate","back":"Number of breaths per minute."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Blood pressure","back":"Measurement of pressure in arteries during heart contraction and relaxation."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Temperature","back":"Vital sign indicating the body's thermal state."},
    {"category":"Medical Assisting","difficulty":"Intermediate","front":"SpO2","back":"Estimated peripheral oxygen saturation measured by pulse oximetry."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Chief complaint","back":"The main reason a patient seeks care."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Medication reconciliation","back":"Comparing a patient's medication list with current orders and use."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Allergy verification","back":"Confirm documented allergies and reactions before relevant care."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Standard precautions","back":"Infection prevention practices applied to all patients."},
    {"category":"Medical Assisting","difficulty":"Intermediate","front":"Hand hygiene","back":"Clean hands at appropriate moments before and after patient contact."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Specimen labeling","back":"Label specimens at collection using verified patient identifiers."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Venipuncture","back":"Collection of a blood specimen from a vein."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Sharps container","back":"Puncture-resistant container for approved disposal of used sharps."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Electrocardiogram (ECG)","back":"Recording of the heart's electrical activity."},
    {"category":"Medical Assisting","difficulty":"Intermediate","front":"Patient consent","back":"Authorization for care after appropriate information is provided."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"HIPAA","back":"US law that includes protections for certain health information."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"EHR","back":"Electronic health record used to document and coordinate patient care."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Tachycardia","back":"An abnormally fast heart rate."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Bradycardia","back":"An abnormally slow heart rate."},
    {"category":"Medical Assisting","difficulty":"Intermediate","front":"-itis","back":"Medical suffix meaning inflammation."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Cardi/o","back":"Combining form meaning heart."},
    {"category":"Medical Assisting","difficulty":"Beginner","front":"Syncope","back":"Temporary loss of consciousness, commonly called fainting."}
,
    {"category":"Sterile Processing","difficulty":"Intermediate","front":"Decontamination","back":"Removing soil and reducing microbial contamination before further processing."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Point-of-use treatment","back":"Initial care of instruments after use to prevent soil from drying."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Bioburden","back":"Number of viable microorganisms on an item before processing."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Manual cleaning","back":"Cleaning performed by hand according to device instructions."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Ultrasonic cleaner","back":"Equipment that uses cavitation to assist removal of soil from instruments."},
    {"category":"Sterile Processing","difficulty":"Intermediate","front":"Washer-disinfector","back":"Automated equipment that cleans and thermally or chemically disinfects compatible devices."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Instrument inspection","back":"Checking cleaned instruments for cleanliness, integrity, and function."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Hinged instruments","back":"Devices with joints that require proper positioning for cleaning and processing."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Lumened devices","back":"Devices with internal channels requiring special cleaning and inspection."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Instrument assembly","back":"Arranging inspected instruments into the correct tray or set."},
    {"category":"Sterile Processing","difficulty":"Intermediate","front":"Packaging material","back":"Validated wrap, pouch, or container compatible with the sterilization method."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Chemical indicator","back":"Indicator that responds to specified sterilization process conditions."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Biological indicator","back":"Test system containing resistant microorganisms used to monitor sterilization efficacy."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Steam sterilization","back":"Sterilization process using saturated steam under controlled conditions."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Sterilization parameters","back":"Required exposure conditions such as time and temperature specified for a cycle."},
    {"category":"Sterile Processing","difficulty":"Intermediate","front":"IFU","back":"Manufacturer's instructions for use, including validated reprocessing steps."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Load configuration","back":"Placement of items in sterilization equipment according to validated instructions."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Sterile storage","back":"Protecting processed items from damage, moisture, and contamination."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Event-related sterility","back":"Sterility is maintained until an event compromises package integrity."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Wet pack","back":"A package that remains wet after processing and must be handled as compromised."},
    {"category":"Sterile Processing","difficulty":"Intermediate","front":"Traceability","back":"Records linking instruments, loads, and processing results as required."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"PPE in decontamination","back":"Protective equipment selected to reduce exposure to contaminated items and splashes."},
    {"category":"Sterile Processing","difficulty":"Beginner","front":"Quality assurance","back":"Documented monitoring and checks to support reliable reprocessing."}
  ];
  const practiceExams = [
    {
      id: "ncct-tsc",
      title: "NCCT TS-C",
      questions: 90,
      estimatedTime: "90 min",
      difficulty: "Advanced",
      passingScore: 70,
      topics: ["Sterile Technique", "Surgical Instruments", "Patient Safety"],
      items: [
        {
          topic: "Sterile Technique",
          question: "A sterile package has a small tear in the wrapper. What should the surgical technologist do?",
          choices: ["Use it if the contents look dry.", "Cover the tear with sterile tape.", "Consider it contaminated.", "Place it below the table."],
          answer: "Consider it contaminated.",
          explanation: "A compromised wrapper means sterility cannot be guaranteed, so the item should be treated as contaminated.",
          incorrect: {
            "Use it if the contents look dry.": "Dry contents do not prove sterility after a wrapper is damaged.",
            "Cover the tear with sterile tape.": "Taping a damaged wrapper does not restore sterility.",
            "Place it below the table.": "Moving it does not correct contamination risk."
          }
        },
        {
          topic: "Surgical Instruments",
          question: "Which instrument family is primarily used to hold tissue?",
          choices: ["Retractors", "Graspers", "Suction tips", "Scalpels"],
          answer: "Graspers",
          explanation: "Graspers hold or manipulate tissue and materials during a procedure.",
          incorrect: {
            Retractors: "Retractors hold tissue aside to improve exposure.",
            "Suction tips": "Suction tips remove fluid or smoke.",
            Scalpels: "Scalpels are cutting instruments."
          }
        },
        {
          topic: "Patient Safety",
          question: "Which communication method confirms that instructions were heard and understood?",
          choices: ["Closed-loop communication", "Silent confirmation", "Delayed charting", "Abbreviated guessing"],
          answer: "Closed-loop communication",
          explanation: "Closed-loop communication repeats and confirms key information so the team knows it was understood.",
          incorrect: {
            "Silent confirmation": "Silence does not confirm understanding.",
            "Delayed charting": "Charting is documentation, not real-time communication.",
            "Abbreviated guessing": "Guessing increases risk."
          }
        },
        {
          "topic": "Sterile Technique",
          "question": "A sterile glove touches an unsterile surface. What is the safest next action?",
          "choices": [
            "Continue if the glove looks clean",
            "Replace the contaminated glove",
            "Wipe the glove with alcohol",
            "Ask someone to inspect it"
          ],
          "answer": "Replace the contaminated glove",
          "explanation": "Contact with an unsterile surface contaminates the glove, so it must be replaced.",
          "incorrect": {
            "Continue if the glove looks clean": "This does not address the correct clinical or safety principle. Contact with an unsterile surface contaminates the glove, so it must be replaced.",
            "Wipe the glove with alcohol": "This does not address the correct clinical or safety principle. Contact with an unsterile surface contaminates the glove, so it must be replaced.",
            "Ask someone to inspect it": "This does not address the correct clinical or safety principle. Contact with an unsterile surface contaminates the glove, so it must be replaced."
          }
        },
        {
          "topic": "Patient Safety",
          "question": "During a surgical count, a sponge is missing. What should the team do?",
          "choices": [
            "Close the incision quickly",
            "Document the discrepancy only",
            "Stop and follow the missing-item protocol",
            "Assume the count was mistaken"
          ],
          "answer": "Stop and follow the missing-item protocol",
          "explanation": "An unresolved count discrepancy requires immediate investigation using the facility protocol.",
          "incorrect": {
            "Close the incision quickly": "This does not address the correct clinical or safety principle. An unresolved count discrepancy requires immediate investigation using the facility protocol.",
            "Document the discrepancy only": "This does not address the correct clinical or safety principle. An unresolved count discrepancy requires immediate investigation using the facility protocol.",
            "Assume the count was mistaken": "This does not address the correct clinical or safety principle. An unresolved count discrepancy requires immediate investigation using the facility protocol."
          }
        },
        {
          "topic": "Surgical Instruments",
          "question": "Which instrument is commonly used to clamp a bleeding vessel?",
          "choices": [
            "Hemostat",
            "Retractor",
            "Scalpel",
            "Suction tip"
          ],
          "answer": "Hemostat",
          "explanation": "A hemostat clamps vessels or tissue to control bleeding.",
          "incorrect": {
            "Retractor": "This does not address the correct clinical or safety principle. A hemostat clamps vessels or tissue to control bleeding.",
            "Scalpel": "This does not address the correct clinical or safety principle. A hemostat clamps vessels or tissue to control bleeding.",
            "Suction tip": "This does not address the correct clinical or safety principle. A hemostat clamps vessels or tissue to control bleeding."
          }
        },
        {
          "topic": "Sterile Technique",
          "question": "Which part of a sterile gown is generally considered sterile?",
          "choices": [
            "The entire back",
            "The front from chest to sterile-field level and sleeves",
            "The neckline and shoulders only",
            "The area below the waist"
          ],
          "answer": "The front from chest to sterile-field level and sleeves",
          "explanation": "The gown's designated sterile areas are the front and sleeves; the back and lower areas are not sterile.",
          "incorrect": {
            "The entire back": "This does not address the correct clinical or safety principle. The gown's designated sterile areas are the front and sleeves; the back and lower areas are not sterile.",
            "The neckline and shoulders only": "This does not address the correct clinical or safety principle. The gown's designated sterile areas are the front and sleeves; the back and lower areas are not sterile.",
            "The area below the waist": "This does not address the correct clinical or safety principle. The gown's designated sterile areas are the front and sleeves; the back and lower areas are not sterile."
          }
        },
        {
          "topic": "Patient Safety",
          "question": "Before a patient enters the operating room, what should be verified?",
          "choices": [
            "Only the surgeon's name",
            "Only the procedure time",
            "Patient identity, planned procedure, and consent",
            "The patient's preferred meal"
          ],
          "answer": "Patient identity, planned procedure, and consent",
          "explanation": "Verifying identity, procedure, and consent is a key part of surgical safety.",
          "incorrect": {
            "Only the surgeon's name": "This does not address the correct clinical or safety principle. Verifying identity, procedure, and consent is a key part of surgical safety.",
            "Only the procedure time": "This does not address the correct clinical or safety principle. Verifying identity, procedure, and consent is a key part of surgical safety.",
            "The patient's preferred meal": "This does not address the correct clinical or safety principle. Verifying identity, procedure, and consent is a key part of surgical safety."
          }
        },
        {
          "topic": "Surgical Instruments",
          "question": "What is the main function of a retractor?",
          "choices": [
            "Cut tissue",
            "Hold tissue aside for exposure",
            "Control suction",
            "Close skin"
          ],
          "answer": "Hold tissue aside for exposure",
          "explanation": "Retractors hold tissue or organs aside to improve visibility and access.",
          "incorrect": {
            "Cut tissue": "This does not address the correct clinical or safety principle. Retractors hold tissue or organs aside to improve visibility and access.",
            "Control suction": "This does not address the correct clinical or safety principle. Retractors hold tissue or organs aside to improve visibility and access.",
            "Close skin": "This does not address the correct clinical or safety principle. Retractors hold tissue or organs aside to improve visibility and access."
          }
        },
        {
          "topic": "Sterile Technique",
          "question": "If a sterile item falls below table level, how should it be treated?",
          "choices": [
            "Sterile if picked up immediately",
            "Sterile if the floor is clean",
            "Contaminated",
            "Sterile after a quick rinse"
          ],
          "answer": "Contaminated",
          "explanation": "Items that fall below the sterile field are treated as contaminated.",
          "incorrect": {
            "Sterile if picked up immediately": "This does not address the correct clinical or safety principle. Items that fall below the sterile field are treated as contaminated.",
            "Sterile if the floor is clean": "This does not address the correct clinical or safety principle. Items that fall below the sterile field are treated as contaminated.",
            "Sterile after a quick rinse": "This does not address the correct clinical or safety principle. Items that fall below the sterile field are treated as contaminated."
          }
        }
      ]
    },
    {
      id: "cst",
      title: "CST",
      questions: 100,
      estimatedTime: "105 min",
      difficulty: "Advanced",
      passingScore: 70,
      topics: ["Operating Room Procedures", "Infection Control", "Professional Ethics"],
      items: [
        {
          topic: "Operating Room Procedures",
          question: "What is the purpose of a surgical time-out?",
          choices: ["To pause for lunch.", "To verify patient, procedure, and site.", "To count supplies after closure.", "To dismiss the scrub role."],
          answer: "To verify patient, procedure, and site.",
          explanation: "The time-out is a safety pause to confirm critical details before incision.",
          incorrect: {
            "To pause for lunch.": "The time-out is a safety procedure, not a break.",
            "To count supplies after closure.": "Counts are separate safety tasks.",
            "To dismiss the scrub role.": "The scrub role continues through the procedure."
          }
        },
        {
          topic: "Infection Control",
          question: "Which practice helps break the chain of infection?",
          choices: ["Hand hygiene", "Reusing gloves", "Skipping PPE", "Ignoring symptoms"],
          answer: "Hand hygiene",
          explanation: "Hand hygiene reduces pathogen transfer between patients, staff, and surfaces.",
          incorrect: {
            "Reusing gloves": "Gloves should be changed appropriately.",
            "Skipping PPE": "PPE reduces exposure risk.",
            "Ignoring symptoms": "Symptoms can signal infection risk."
          }
        },
        {
          topic: "Professional Ethics",
          question: "Where should patient information be discussed?",
          choices: ["Public elevator", "Social media", "With authorized team members", "With friends"],
          answer: "With authorized team members",
          explanation: "Patient information should only be shared with authorized people for appropriate care purposes.",
          incorrect: {
            "Public elevator": "Public spaces are not appropriate for private patient information.",
            "Social media": "Posting patient information can violate privacy.",
            "With friends": "Friends are not authorized care team members."
          }
        },
        {
          "topic": "Operating Room Procedures",
          "question": "Who usually coordinates nonsterile activities in the operating room?",
          "choices": [
            "Scrub person",
            "Circulating nurse",
            "Patient transporter",
            "Anesthesia machine"
          ],
          "answer": "Circulating nurse",
          "explanation": "The circulator coordinates nonsterile room activities and supports patient safety.",
          "incorrect": {
            "Scrub person": "This does not address the correct clinical or safety principle. The circulator coordinates nonsterile room activities and supports patient safety.",
            "Patient transporter": "This does not address the correct clinical or safety principle. The circulator coordinates nonsterile room activities and supports patient safety.",
            "Anesthesia machine": "This does not address the correct clinical or safety principle. The circulator coordinates nonsterile room activities and supports patient safety."
          }
        },
        {
          "topic": "Infection Control",
          "question": "What is the safest response to a break in sterile technique?",
          "choices": [
            "Ignore it if brief",
            "Notify the team and correct the contamination",
            "Wait until the case ends",
            "Cover it with a towel"
          ],
          "answer": "Notify the team and correct the contamination",
          "explanation": "Sterility breaks must be communicated and corrected promptly.",
          "incorrect": {
            "Ignore it if brief": "This does not address the correct clinical or safety principle. Sterility breaks must be communicated and corrected promptly.",
            "Wait until the case ends": "This does not address the correct clinical or safety principle. Sterility breaks must be communicated and corrected promptly.",
            "Cover it with a towel": "This does not address the correct clinical or safety principle. Sterility breaks must be communicated and corrected promptly."
          }
        },
        {
          "topic": "Professional Ethics",
          "question": "A coworker asks about a patient without a care-related reason. What should you do?",
          "choices": [
            "Share the details privately",
            "Decline to share protected information",
            "Send the chart later",
            "Discuss it after work"
          ],
          "answer": "Decline to share protected information",
          "explanation": "Patient information is shared only with authorized individuals for legitimate purposes.",
          "incorrect": {
            "Share the details privately": "This does not address the correct clinical or safety principle. Patient information is shared only with authorized individuals for legitimate purposes.",
            "Send the chart later": "This does not address the correct clinical or safety principle. Patient information is shared only with authorized individuals for legitimate purposes.",
            "Discuss it after work": "This does not address the correct clinical or safety principle. Patient information is shared only with authorized individuals for legitimate purposes."
          }
        },
        {
          "topic": "Operating Room Procedures",
          "question": "Why are surgical counts performed?",
          "choices": [
            "To estimate supply costs",
            "To help prevent retained surgical items",
            "To schedule turnover",
            "To measure procedure speed"
          ],
          "answer": "To help prevent retained surgical items",
          "explanation": "Counts help prevent sponges, sharps, and instruments from being retained.",
          "incorrect": {
            "To estimate supply costs": "This does not address the correct clinical or safety principle. Counts help prevent sponges, sharps, and instruments from being retained.",
            "To schedule turnover": "This does not address the correct clinical or safety principle. Counts help prevent sponges, sharps, and instruments from being retained.",
            "To measure procedure speed": "This does not address the correct clinical or safety principle. Counts help prevent sponges, sharps, and instruments from being retained."
          }
        },
        {
          "topic": "Infection Control",
          "question": "When should hand hygiene be performed around glove use?",
          "choices": [
            "Only before gloves",
            "Only after gloves",
            "Before donning and after removing gloves, as indicated",
            "Never when gloves are worn"
          ],
          "answer": "Before donning and after removing gloves, as indicated",
          "explanation": "Gloves do not replace appropriate hand hygiene.",
          "incorrect": {
            "Only before gloves": "This does not address the correct clinical or safety principle. Gloves do not replace appropriate hand hygiene.",
            "Only after gloves": "This does not address the correct clinical or safety principle. Gloves do not replace appropriate hand hygiene.",
            "Never when gloves are worn": "This does not address the correct clinical or safety principle. Gloves do not replace appropriate hand hygiene."
          }
        },
        {
          "topic": "Operating Room Procedures",
          "question": "What is the purpose of positioning and padding a patient carefully?",
          "choices": [
            "To shorten anesthesia",
            "To prevent pressure and nerve injuries",
            "To improve instrument storage",
            "To reduce documentation"
          ],
          "answer": "To prevent pressure and nerve injuries",
          "explanation": "Safe positioning and padding reduce preventable pressure and nerve injuries.",
          "incorrect": {
            "To shorten anesthesia": "This does not address the correct clinical or safety principle. Safe positioning and padding reduce preventable pressure and nerve injuries.",
            "To improve instrument storage": "This does not address the correct clinical or safety principle. Safe positioning and padding reduce preventable pressure and nerve injuries.",
            "To reduce documentation": "This does not address the correct clinical or safety principle. Safe positioning and padding reduce preventable pressure and nerve injuries."
          }
        },
        {
          "topic": "Professional Ethics",
          "question": "You notice a safety concern during a case. What is the best response?",
          "choices": [
            "Remain silent",
            "Report it promptly through the appropriate team process",
            "Post about it online",
            "Wait for someone else to act"
          ],
          "answer": "Report it promptly through the appropriate team process",
          "explanation": "Promptly speaking up supports patient safety and professional accountability.",
          "incorrect": {
            "Remain silent": "This does not address the correct clinical or safety principle. Promptly speaking up supports patient safety and professional accountability.",
            "Post about it online": "This does not address the correct clinical or safety principle. Promptly speaking up supports patient safety and professional accountability.",
            "Wait for someone else to act": "This does not address the correct clinical or safety principle. Promptly speaking up supports patient safety and professional accountability."
          }
        }
      ]
    },
    {
      id: "medical-assistant",
      title: "Medical Assistant",
      questions: 80,
      estimatedTime: "80 min",
      difficulty: "Intermediate",
      passingScore: 72,
      topics: ["Medical Terminology", "Patient Safety", "Medical Assisting"],
      items: [
        {
          topic: "Medical Terminology",
          question: "What does cardi/o mean?",
          choices: ["Skin", "Heart", "Blood", "Bone"],
          answer: "Heart",
          explanation: "Cardi/o is the combining form for heart.",
          incorrect: {
            Skin: "Dermat/o refers to skin.",
            Blood: "Hemat/o refers to blood.",
            Bone: "Oste/o refers to bone."
          }
        },
        {
          topic: "Patient Safety",
          question: "How many identifiers are commonly used before patient care?",
          choices: ["One", "Two", "Four", "None"],
          answer: "Two",
          explanation: "Two identifiers help confirm the correct patient before care.",
          incorrect: {
            One: "One identifier is not enough for safe verification.",
            Four: "Four is not the common minimum standard.",
            None: "Skipping identification is unsafe."
          }
        },
        {
          topic: "Medical Assisting",
          question: "Before an injection, what should be checked?",
          choices: ["Only the room number", "Order, patient identity, allergies, and medication", "Lunch schedule", "Insurance status"],
          answer: "Order, patient identity, allergies, and medication",
          explanation: "Safe medication practice requires verifying the order, patient, allergies, and medication details.",
          incorrect: {
            "Only the room number": "Room number alone does not identify the patient safely.",
            "Lunch schedule": "This does not verify injection safety.",
            "Insurance status": "Insurance status is not part of medication safety checks."
          }
        },
        {
          "topic": "Medical Assisting",
          "question": "Which vital sign measures the number of heartbeats per minute?",
          "choices": [
            "Respiratory rate",
            "Pulse",
            "Temperature",
            "Blood pressure"
          ],
          "answer": "Pulse",
          "explanation": "Pulse rate counts heartbeats per minute.",
          "incorrect": {
            "Respiratory rate": "This does not address the correct clinical or safety principle. Pulse rate counts heartbeats per minute.",
            "Temperature": "This does not address the correct clinical or safety principle. Pulse rate counts heartbeats per minute.",
            "Blood pressure": "This does not address the correct clinical or safety principle. Pulse rate counts heartbeats per minute."
          }
        },
        {
          "topic": "Patient Safety",
          "question": "What should you do if a patient's stated name does not match the chart?",
          "choices": [
            "Continue the visit",
            "Verify identity and resolve the discrepancy",
            "Change the chart without checking",
            "Use the room number instead"
          ],
          "answer": "Verify identity and resolve the discrepancy",
          "explanation": "Identity discrepancies must be resolved before care or specimen collection.",
          "incorrect": {
            "Continue the visit": "This does not address the correct clinical or safety principle. Identity discrepancies must be resolved before care or specimen collection.",
            "Change the chart without checking": "This does not address the correct clinical or safety principle. Identity discrepancies must be resolved before care or specimen collection.",
            "Use the room number instead": "This does not address the correct clinical or safety principle. Identity discrepancies must be resolved before care or specimen collection."
          }
        },
        {
          "topic": "Medical Terminology",
          "question": "What does the suffix -itis mean?",
          "choices": [
            "Inflammation",
            "Removal",
            "Pain",
            "Enlargement"
          ],
          "answer": "Inflammation",
          "explanation": "The suffix -itis means inflammation.",
          "incorrect": {
            "Removal": "This does not address the correct clinical or safety principle. The suffix -itis means inflammation.",
            "Pain": "This does not address the correct clinical or safety principle. The suffix -itis means inflammation.",
            "Enlargement": "This does not address the correct clinical or safety principle. The suffix -itis means inflammation."
          }
        },
        {
          "topic": "Medical Assisting",
          "question": "Which action helps prevent specimen labeling errors?",
          "choices": [
            "Label specimens later at the desk",
            "Label at collection using verified patient identifiers",
            "Use only the room number",
            "Ask another patient to confirm"
          ],
          "answer": "Label at collection using verified patient identifiers",
          "explanation": "Specimens should be labeled promptly using verified patient identifiers.",
          "incorrect": {
            "Label specimens later at the desk": "This does not address the correct clinical or safety principle. Specimens should be labeled promptly using verified patient identifiers.",
            "Use only the room number": "This does not address the correct clinical or safety principle. Specimens should be labeled promptly using verified patient identifiers.",
            "Ask another patient to confirm": "This does not address the correct clinical or safety principle. Specimens should be labeled promptly using verified patient identifiers."
          }
        },
        {
          "topic": "Patient Safety",
          "question": "A patient feels faint during a blood draw. What should the medical assistant do first?",
          "choices": [
            "Continue quickly",
            "Stop the procedure and protect the patient from falling",
            "Ask the patient to stand",
            "Leave the room"
          ],
          "answer": "Stop the procedure and protect the patient from falling",
          "explanation": "Stop the procedure and help keep the patient safe while seeking appropriate assistance.",
          "incorrect": {
            "Continue quickly": "This does not address the correct clinical or safety principle. Stop the procedure and help keep the patient safe while seeking appropriate assistance.",
            "Ask the patient to stand": "This does not address the correct clinical or safety principle. Stop the procedure and help keep the patient safe while seeking appropriate assistance.",
            "Leave the room": "This does not address the correct clinical or safety principle. Stop the procedure and help keep the patient safe while seeking appropriate assistance."
          }
        },
        {
          "topic": "Medical Terminology",
          "question": "Which term refers to a fast heart rate?",
          "choices": [
            "Bradycardia",
            "Tachycardia",
            "Apnea",
            "Hypothermia"
          ],
          "answer": "Tachycardia",
          "explanation": "Tachycardia refers to an abnormally fast heart rate.",
          "incorrect": {
            "Bradycardia": "This does not address the correct clinical or safety principle. Tachycardia refers to an abnormally fast heart rate.",
            "Apnea": "This does not address the correct clinical or safety principle. Tachycardia refers to an abnormally fast heart rate.",
            "Hypothermia": "This does not address the correct clinical or safety principle. Tachycardia refers to an abnormally fast heart rate."
          }
        },
        {
          "topic": "Medical Assisting",
          "question": "What is a key reason to document care promptly?",
          "choices": [
            "To avoid speaking with patients",
            "To support accurate, timely clinical records",
            "To replace verbal communication",
            "To reduce patient identification"
          ],
          "answer": "To support accurate, timely clinical records",
          "explanation": "Timely documentation supports continuity of care and accurate records.",
          "incorrect": {
            "To avoid speaking with patients": "This does not address the correct clinical or safety principle. Timely documentation supports continuity of care and accurate records.",
            "To replace verbal communication": "This does not address the correct clinical or safety principle. Timely documentation supports continuity of care and accurate records.",
            "To reduce patient identification": "This does not address the correct clinical or safety principle. Timely documentation supports continuity of care and accurate records."
          }
        }
      ]
    },
    {
      id: "sterile-processing",
      title: "Sterile Processing",
      questions: 75,
      estimatedTime: "75 min",
      difficulty: "Intermediate",
      passingScore: 70,
      topics: ["Sterile Processing", "Infection Control", "Surgical Instruments"],
      items: [
        {
          topic: "Sterile Processing",
          question: "What is decontamination?",
          choices: ["Final packaging", "Removing soil and reducing microorganisms", "Storing sterile trays", "Scheduling surgery"],
          answer: "Removing soil and reducing microorganisms",
          explanation: "Decontamination removes soil and reduces bioburden before inspection and sterilization.",
          incorrect: {
            "Final packaging": "Packaging happens after cleaning and inspection.",
            "Storing sterile trays": "Storage is a later phase.",
            "Scheduling surgery": "Scheduling is unrelated to instrument decontamination."
          }
        },
        {
          topic: "Surgical Instruments",
          question: "Why should instruments be inspected after cleaning?",
          choices: ["To confirm cleanliness and function", "To change the patient chart", "To skip sterilization", "To reduce documentation"],
          answer: "To confirm cleanliness and function",
          explanation: "Inspection ensures instruments are clean, intact, functional, and ready for sterilization.",
          incorrect: {
            "To change the patient chart": "Inspection is about instrument safety.",
            "To skip sterilization": "Inspection does not replace sterilization.",
            "To reduce documentation": "Documentation remains important."
          }
        },
        {
          topic: "Infection Control",
          question: "Do gloves replace hand hygiene?",
          choices: ["Yes", "Only in surgery", "No", "Only during transport"],
          answer: "No",
          explanation: "Gloves do not replace hand hygiene; hands should be cleaned at appropriate moments.",
          incorrect: {
            Yes: "Gloves can become contaminated and do not replace hand cleaning.",
            "Only in surgery": "Hand hygiene is still required in surgical workflows.",
            "Only during transport": "Transport does not remove hand hygiene requirements."
          }
        },
        {
          "topic": "Sterile Processing",
          "question": "What should happen before instruments are packaged for sterilization?",
          "choices": [
            "Cleaning and inspection",
            "Immediate storage",
            "Only counting",
            "Applying patient labels"
          ],
          "answer": "Cleaning and inspection",
          "explanation": "Instruments should be cleaned, inspected, and prepared before packaging.",
          "incorrect": {
            "Immediate storage": "This does not address the correct clinical or safety principle. Instruments should be cleaned, inspected, and prepared before packaging.",
            "Only counting": "This does not address the correct clinical or safety principle. Instruments should be cleaned, inspected, and prepared before packaging.",
            "Applying patient labels": "This does not address the correct clinical or safety principle. Instruments should be cleaned, inspected, and prepared before packaging."
          }
        },
        {
          "topic": "Infection Control",
          "question": "Why is appropriate PPE important during decontamination?",
          "choices": [
            "It replaces hand hygiene",
            "It reduces exposure to contaminated materials",
            "It guarantees sterility",
            "It removes all hazards"
          ],
          "answer": "It reduces exposure to contaminated materials",
          "explanation": "PPE helps protect personnel from splashes and contaminated instruments.",
          "incorrect": {
            "It replaces hand hygiene": "This does not address the correct clinical or safety principle. PPE helps protect personnel from splashes and contaminated instruments.",
            "It guarantees sterility": "This does not address the correct clinical or safety principle. PPE helps protect personnel from splashes and contaminated instruments.",
            "It removes all hazards": "This does not address the correct clinical or safety principle. PPE helps protect personnel from splashes and contaminated instruments."
          }
        },
        {
          "topic": "Surgical Instruments",
          "question": "What should you do with a cracked or damaged instrument?",
          "choices": [
            "Return it to the tray",
            "Remove it from service and follow reporting procedures",
            "Hide the damage",
            "Sterilize it twice"
          ],
          "answer": "Remove it from service and follow reporting procedures",
          "explanation": "Damaged instruments should be removed from service for safety.",
          "incorrect": {
            "Return it to the tray": "This does not address the correct clinical or safety principle. Damaged instruments should be removed from service for safety.",
            "Hide the damage": "This does not address the correct clinical or safety principle. Damaged instruments should be removed from service for safety.",
            "Sterilize it twice": "This does not address the correct clinical or safety principle. Damaged instruments should be removed from service for safety."
          }
        },
        {
          "topic": "Sterile Processing",
          "question": "Why must hinged instruments be positioned according to manufacturer instructions during processing?",
          "choices": [
            "For appearance only",
            "To allow effective cleaning and sterilant contact",
            "To save labels",
            "To increase tray weight"
          ],
          "answer": "To allow effective cleaning and sterilant contact",
          "explanation": "Correct positioning supports cleaning and sterilant contact with instrument surfaces.",
          "incorrect": {
            "For appearance only": "This does not address the correct clinical or safety principle. Correct positioning supports cleaning and sterilant contact with instrument surfaces.",
            "To save labels": "This does not address the correct clinical or safety principle. Correct positioning supports cleaning and sterilant contact with instrument surfaces.",
            "To increase tray weight": "This does not address the correct clinical or safety principle. Correct positioning supports cleaning and sterilant contact with instrument surfaces."
          }
        },
        {
          "topic": "Infection Control",
          "question": "What does a biological indicator help evaluate?",
          "choices": [
            "Staff attendance",
            "Sterilization process effectiveness",
            "Tray appearance",
            "Patient scheduling"
          ],
          "answer": "Sterilization process effectiveness",
          "explanation": "Biological indicators challenge and monitor the effectiveness of a sterilization process.",
          "incorrect": {
            "Staff attendance": "This does not address the correct clinical or safety principle. Biological indicators challenge and monitor the effectiveness of a sterilization process.",
            "Tray appearance": "This does not address the correct clinical or safety principle. Biological indicators challenge and monitor the effectiveness of a sterilization process.",
            "Patient scheduling": "This does not address the correct clinical or safety principle. Biological indicators challenge and monitor the effectiveness of a sterilization process."
          }
        },
        {
          "topic": "Sterile Processing",
          "question": "What information is important when selecting a sterilization cycle?",
          "choices": [
            "Instrument color",
            "Manufacturer instructions for the device and sterilizer",
            "Room temperature alone",
            "Tray owner's preference"
          ],
          "answer": "Manufacturer instructions for the device and sterilizer",
          "explanation": "Validated manufacturer instructions guide safe processing parameters.",
          "incorrect": {
            "Instrument color": "This does not address the correct clinical or safety principle. Validated manufacturer instructions guide safe processing parameters.",
            "Room temperature alone": "This does not address the correct clinical or safety principle. Validated manufacturer instructions guide safe processing parameters.",
            "Tray owner's preference": "This does not address the correct clinical or safety principle. Validated manufacturer instructions guide safe processing parameters."
          }
        },
        {
          "topic": "Surgical Instruments",
          "question": "Why should a lumened instrument receive special cleaning attention?",
          "choices": [
            "It is always disposable",
            "Internal channels can retain soil",
            "It never needs inspection",
            "It cannot be sterilized"
          ],
          "answer": "Internal channels can retain soil",
          "explanation": "Internal channels may trap soil and require specified cleaning methods.",
          "incorrect": {
            "It is always disposable": "This does not address the correct clinical or safety principle. Internal channels may trap soil and require specified cleaning methods.",
            "It never needs inspection": "This does not address the correct clinical or safety principle. Internal channels may trap soil and require specified cleaning methods.",
            "It cannot be sterilized": "This does not address the correct clinical or safety principle. Internal channels may trap soil and require specified cleaning methods."
          }
        }
      ]
    }
  ];
  const isFree = plan === "explorer";
  const normalizedProgram = program.trim().toLowerCase();
  const isSurgicalPath = normalizedProgram.includes("surgical") || normalizedProgram.includes("surgery");
  const isMedicalAssistantPath = normalizedProgram.includes("medical assistant") || normalizedProgram.includes("medical assisting");
  const isSterileProcessingPath = normalizedProgram.includes("sterile processing");
  const matchingExams = practiceExams.filter((exam) =>
    isSurgicalPath ? ["ncct-tsc", "cst"].includes(exam.id) :
    isMedicalAssistantPath ? exam.id === "medical-assistant" :
    isSterileProcessingPath ? exam.id === "sterile-processing" : true
  );
  const [selectedExamId, setSelectedExamId] = useState(practiceExams[0].id);
  const [examStatus, setExamStatus] = useState<"home" | "active" | "results" | "review">("home");
  const [examQuestionIndex, setExamQuestionIndex] = useState(0);
  const [examAnswers, setExamAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(20 * 60);
  const [timeTakenSeconds, setTimeTakenSeconds] = useState(0);
  const selectedExam = matchingExams.find((exam) => exam.id === selectedExamId) ?? matchingExams[0];
  const availableExamQuestions = isFree ? selectedExam.items.slice(0, 10) : selectedExam.items;
  const activeExamQuestion = availableExamQuestions[examQuestionIndex];
  const answeredCount = Object.keys(examAnswers).length;
  const examProgress = Math.round((answeredCount / availableExamQuestions.length) * 100);
  const correctAnswers = availableExamQuestions.filter((item, index) => examAnswers[index] === item.answer).length;
  const incorrectAnswers = Math.max(0, availableExamQuestions.length - correctAnswers);
  const score = Math.round((correctAnswers / availableExamQuestions.length) * 100);
  const passed = score >= selectedExam.passingScore;

  useEffect(() => {
    if (studyMode !== initialMode) {
      setStudyMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (examStatus !== "active") {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsRemaining((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          setExamStatus("results");
          setTimeTakenSeconds(20 * 60);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [examStatus]);

  const categories = [
    "All",
    "Surgical Technology",
    "Medical Assisting",
    "Sterile Processing",
    "Anatomy",
    "Medical Terminology",
    "Infection Control"
  ];
  const relevantCategories = isSurgicalPath
    ? ["Surgical Technology"]
    : isMedicalAssistantPath
      ? ["Medical Assisting"]
      : isSterileProcessingPath
        ? ["Sterile Processing"]
        : categories.filter((item) => item !== "All");
  const visibleCategories = ["All", ...relevantCategories];
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [search, setSearch] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<string[]>([]);
  const [reviewCards, setReviewCards] = useState<string[]>([]);
  const [favoriteCards, setFavoriteCards] = useState<string[]>([]);
  const [bookmarkedCards, setBookmarkedCards] = useState<string[]>([]);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const filteredCards = useMemo(() => {
    const query = search.trim().toLowerCase();
    const cards = flashcards.filter((card) => {
      const matchesPath = relevantCategories.includes(card.category);
      const matchesCategory = category === "All" || card.category === category;
      const matchesDifficulty = difficulty === "All" || card.difficulty === difficulty;
      const matchesSearch = !query || `${card.front} ${card.back} ${card.category}`.toLowerCase().includes(query);
      return matchesPath && matchesCategory && matchesDifficulty && matchesSearch;
    });

    if (shuffleSeed % 2 === 1) {
      return [...cards].reverse();
    }

    return cards;
  }, [category, difficulty, search, shuffleSeed, program]);
  const pathCards = flashcards.filter((card) => relevantCategories.includes(card.category));
  const activeCards = filteredCards.length ? filteredCards : pathCards;
  const activeIndex = Math.min(cardIndex, activeCards.length - 1);
  const currentCard = activeCards[activeIndex];
  const currentCardKey = `${currentCard.category}-${currentCard.front}`;
  const studiedKeys = new Set([...knownCards, ...reviewCards]);
  const studiedCount = activeCards.filter((card) => studiedKeys.has(`${card.category}-${card.front}`)).length;
  const knownCount = activeCards.filter((card) => knownCards.includes(`${card.category}-${card.front}`)).length;
  const cardsRemaining = Math.max(0, activeCards.length - studiedCount);
  const accuracy = studiedCount ? Math.round((knownCount / studiedCount) * 100) : 0;
  const progressValue = Math.round((studiedCount / activeCards.length) * 100);
  const sessionComplete = studiedCount === activeCards.length && studiedCount > 0;

  function resetPosition() {
    setCardIndex(0);
    setIsFlipped(false);
  }

  function markKnown() {
    setKnownCards((items) => [...new Set([...items, currentCardKey])]);
    setReviewCards((items) => items.filter((item) => item !== currentCardKey));
  }

  function reviewAgain() {
    setReviewCards((items) => [...new Set([...items, currentCardKey])]);
    setKnownCards((items) => items.filter((item) => item !== currentCardKey));
  }

  function studyAgain() {
    setKnownCards([]);
    setReviewCards([]);
    setCardIndex(0);
    setIsFlipped(false);
  }

  function startExam(examId: string) {
    if (!matchingExams.some((exam) => exam.id === examId)) return;
    setSelectedExamId(examId);
    setExamStatus("active");
    setExamQuestionIndex(0);
    setExamAnswers({});
    setFlaggedQuestions([]);
    setSecondsRemaining(20 * 60);
    setTimeTakenSeconds(0);
  }

  function submitExam() {
    setTimeTakenSeconds(20 * 60 - secondsRemaining);
    setExamStatus("results");
  }

  function retakeExam() {
    startExam(selectedExam.id);
  }

  const timeLabel = `${Math.floor(secondsRemaining / 60)}:${String(secondsRemaining % 60).padStart(2, "0")}`;
  const timeTakenLabel = `${Math.floor(timeTakenSeconds / 60)}m ${timeTakenSeconds % 60}s`;
  const topicResults = selectedExam.topics.map((topic) => {
    const topicItems = availableExamQuestions.filter((item) => item.topic === topic);
    const topicCorrect = availableExamQuestions.filter((item, index) => item.topic === topic && examAnswers[index] === item.answer).length;
    return {
      topic,
      percent: topicItems.length ? Math.round((topicCorrect / topicItems.length) * 100) : 0
    };
  });
  const weakestTopics = [...topicResults].sort((a, b) => a.percent - b.percent).slice(0, 2);
  const strongestTopics = [...topicResults].sort((a, b) => b.percent - a.percent).slice(0, 2);

  return (
    <div className="flashcards-page">
      <div className="page-title">
        <p className="eyebrow">PathPrep</p>
        {isFree && studyMode === "practiceExams" && <p>Free preview: up to 10 practice questions per exam. Upgrade for full exam access.</p>}
        <h2>{studyMode === "practiceExams" ? "Practice Exams" : "Flashcards"}</h2>
        <p>
          {studyMode === "practiceExams"
            ? "Build certification confidence in a realistic timed exam environment."
            : "Master concepts with active recall."}
        </p>
      </div>

      <div className="practice-mode-tabs" role="tablist" aria-label="PathPrep study mode">
        <button
          className={studyMode === "flashcards" ? "active" : ""}
          onClick={() => setStudyMode("flashcards")}
          role="tab"
          aria-selected={studyMode === "flashcards"}
        >
          Flashcards
        </button>
        <button
          className={studyMode === "practiceExams" ? "active" : ""}
          onClick={() => setStudyMode("practiceExams")}
          role="tab"
          aria-selected={studyMode === "practiceExams"}
        >
          Practice Exams
        </button>
      </div>

      {studyMode === "practiceExams" && (
        <div className="practice-exam-page">
          {examStatus === "home" && (
            <section className="exam-home-grid">
              {matchingExams.map((exam) => (
                <article className="exam-card-premium" key={exam.id}>
                  <div className="card-head">
                    <h3>{exam.title}</h3>
                    <ClipboardCheck />
                  </div>
                  <dl>
                    <div>
                      <dt>Number of Questions</dt>
                      <dd>{exam.questions}</dd>
                    </div>
                    <div>
                      <dt>Estimated Time</dt>
                      <dd>{exam.estimatedTime}</dd>
                    </div>
                    <div>
                      <dt>Difficulty</dt>
                      <dd>{exam.difficulty}</dd>
                    </div>
                  </dl>
                  <button className="primary" onClick={() => startExam(exam.id)}>
                    Start Exam
                  </button>
                </article>
              ))}
            </section>
          )}

          {examStatus === "active" && (
            <section className="exam-mode-layout">
              <div className="exam-question-panel">
                <div className="exam-status-bar">
                  <span>Question {examQuestionIndex + 1} of {availableExamQuestions.length}</span>
                  <strong>{timeLabel}</strong>
                  <span>{answeredCount}/{availableExamQuestions.length} answered</span>
                </div>
                <div className="progress-bar" aria-label={`${examProgress}% exam progress`}>
                  <span style={{ width: `${examProgress}%` }} />
                </div>
                <h3>{activeExamQuestion.question}</h3>
                <div className="exam-answer-grid">
                  {activeExamQuestion.choices.map((choice) => (
                    <button
                      className={examAnswers[examQuestionIndex] === choice ? "answer selected" : "answer"}
                      key={choice}
                      onClick={() => setExamAnswers((answers) => ({ ...answers, [examQuestionIndex]: choice }))}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
                <div className="exam-controls">
                  <button
                    className="secondary"
                    onClick={() => setExamQuestionIndex((index) => Math.max(0, index - 1))}
                  >
                    Previous
                  </button>
                  <button
                    className="secondary"
                    onClick={() =>
                      setFlaggedQuestions((items) =>
                        items.includes(examQuestionIndex)
                          ? items.filter((item) => item !== examQuestionIndex)
                          : [...items, examQuestionIndex]
                      )
                    }
                  >
                    {flaggedQuestions.includes(examQuestionIndex) ? "Flagged" : "Flag Question"}
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setExamQuestionIndex((index) => Math.min(availableExamQuestions.length - 1, index + 1))}
                  >
                    Next
                  </button>
                  <button className="primary" onClick={submitExam}>
                    Submit Exam
                  </button>
                </div>
              </div>
            </section>
          )}

          {examStatus === "results" && (
            <section className="exam-results-grid">
              <article className="exam-complete-card">
                <h3>🎉 Practice Exam Complete</h3>
                <strong>{score}%</strong>
                <p>{passed ? "Pass" : "Fail"} · {correctAnswers} correct · {incorrectAnswers} incorrect</p>
                <p>Time Taken: {timeTakenLabel}</p>
                <p>XP Earned: {correctAnswers * 25}</p>
                <div className="exam-controls">
                  <button className="primary" onClick={() => setExamStatus("review")}>
                    Review Answers
                  </button>
                  <button className="secondary" onClick={retakeExam}>
                    Retake Exam
                  </button>
                </div>
              </article>
              <article className="exam-analytics-card">
                <p className="eyebrow">Analytics</p>
                <h3>Readiness Score: {Math.max(score, 52)}%</h3>
                <div className="progress-bar">
                  <span style={{ width: `${Math.max(score, 52)}%` }} />
                </div>
                <div className="analytics-columns">
                  <div>
                    <strong>Weakest Topics</strong>
                    {weakestTopics.map((item) => <span key={item.topic}>{item.topic} · {item.percent}%</span>)}
                  </div>
                  <div>
                    <strong>Strongest Topics</strong>
                    {strongestTopics.map((item) => <span key={item.topic}>{item.topic} · {item.percent}%</span>)}
                  </div>
                  <div>
                    <strong>Recommended Lessons</strong>
                    {weakestTopics.map((item) => <span key={item.topic}>Review {item.topic}</span>)}
                  </div>
                </div>
              </article>
            </section>
          )}

          {examStatus === "review" && (
            <section className="exam-review-list">
              <div className="card-head">
                <div>
                  <p className="eyebrow">Review Mode</p>
                  <h3>{selectedExam.title} answer review</h3>
                </div>
                <button className="secondary compact" onClick={() => setExamStatus("home")}>
                  Back to Exams
                </button>
              </div>
              {availableExamQuestions.map((item, index) => (
                <article className="exam-review-card" key={item.question}>
                  <strong>Question {index + 1}: {item.question}</strong>
                  <p>Your answer: {examAnswers[index] ?? "Unanswered"}</p>
                  <p>Correct Answer: {item.answer}</p>
                  <div className={examAnswers[index] === item.answer ? "explanation success" : "explanation"}>
                    <strong>Explanation</strong>
                    <p>{item.explanation}</p>
                  </div>
                  <div className="incorrect-rationales">
                    <strong>Why other choices are incorrect</strong>
                    {Object.entries(item.incorrect).map(([choice, reason]) => (
                      <p key={choice}><span>{choice}:</span> {reason}</p>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      )}

      {studyMode === "flashcards" && (
        <>
      <section className="flashcard-filters" aria-label="Flashcard filters">
        <label>
          Search
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              resetPosition();
            }}
            placeholder="Search terms, concepts, or categories"
          />
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              resetPosition();
            }}
          >
            {visibleCategories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Difficulty
          <select
            value={difficulty}
            onChange={(event) => {
              setDifficulty(event.target.value);
              resetPosition();
            }}
          >
            {["All", "Beginner", "Intermediate", "Advanced"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </section>

      {filteredCards.length === 0 && (
        <section className="panel flashcard-empty">
          <strong>No exact matches found.</strong>
          <p>Showing your pathway flashcards instead. Clear the filters to see all matching cards.</p>
        </section>
      )}

      <section className="flashcard-progress-panel">
        <Metric title="Cards Studied" value={`${studiedCount}`} icon={<BookOpen />} />
        <Metric title="Cards Remaining" value={`${cardsRemaining}`} icon={<Target />} />
        <Metric title="Accuracy" value={`${accuracy}%`} icon={<BarChart3 />} />
        <Metric title="Cards in Path" value={`${pathCards.length}`} icon={<Sparkles />} />
        <div className="flashcard-progress-wide">
          <span>{progressValue}% complete</span>
          <div className="progress-bar" aria-label={`${progressValue}% flashcard progress`}>
            <span style={{ width: `${progressValue}%` }} />
          </div>
        </div>
      </section>

      {sessionComplete ? (
        <section className="flashcard-session-complete" aria-live="polite">
          <h3>🎉 Session Complete</h3>
          <p>Cards Reviewed: {studiedCount}</p>
          <p>Accuracy: {accuracy}%</p>
          <p>XP Earned: {studiedCount * 12}</p>
          <button className="primary" onClick={studyAgain}>
            Study Again
          </button>
        </section>
      ) : (
        <section className="flashcard-study-layout">
          <div className="flashcard-viewer-panel">
            <div className="flashcard-viewer-top">
              <span>{currentCard.category}</span>
              <span>{currentCard.difficulty}</span>
              <span>{activeIndex + 1} / {activeCards.length}</span>
            </div>
            <button
              className={isFlipped ? "premium-flashcard flipped" : "premium-flashcard"}
              onClick={() => setIsFlipped((value) => !value)}
              aria-label={isFlipped ? "Show flashcard front" : "Show flashcard back"}
            >
              <small>{isFlipped ? "Back" : "Front"}</small>
              <span>{isFlipped ? currentCard.back : currentCard.front}</span>
            </button>
            <div className="flashcard-navigation">
              <button className="secondary" onClick={() => setIsFlipped((value) => !value)}>
                Flip
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setCardIndex((index) => Math.max(0, index - 1));
                  setIsFlipped(false);
                }}
              >
                Previous
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setCardIndex((index) => Math.min(activeCards.length - 1, index + 1));
                  setIsFlipped(false);
                }}
              >
                Next
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setShuffleSeed((value) => value + 1);
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
              >
                Shuffle
              </button>
            </div>
          </div>

          <aside className="flashcard-actions-panel" aria-label="Study actions">
            <button className="primary" onClick={markKnown}>
              <Check size={18} />
              Mark Known
            </button>
            <button className="secondary" onClick={reviewAgain}>
              <Brain size={18} />
              Review Again
            </button>
            <button
              className={favoriteCards.includes(currentCardKey) ? "primary" : "secondary"}
              onClick={() =>
                setFavoriteCards((items) =>
                  items.includes(currentCardKey) ? items.filter((item) => item !== currentCardKey) : [...items, currentCardKey]
                )
              }
            >
              <Star size={18} />
              Favorite
            </button>
            <button
              className={bookmarkedCards.includes(currentCardKey) ? "primary" : "secondary"}
              onClick={() =>
                setBookmarkedCards((items) =>
                  items.includes(currentCardKey) ? items.filter((item) => item !== currentCardKey) : [...items, currentCardKey]
                )
              }
            >
              <BadgeCheck size={18} />
              Bookmark
            </button>
            <div className="flashcard-action-summary">
              <strong>{favoriteCards.length}</strong>
              <small>favorites</small>
              <strong>{bookmarkedCards.length}</strong>
              <small>bookmarked</small>
            </div>
          </aside>
        </section>
      )}
        </>
      )}
    </div>
  );
}

export function StudyPlan({
  plan,
  program,
  examDate,
  studyHours,
  schedule,
  setExamDate,
  setStudyHours
}: {
  plan: PlanKey;
  program: string;
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
  const pathwayLessons = {
  "surgical": [
    {
      "title": "Sterile Field Foundations",
      "progress": 0,
      "lessons": [
        {
          "title": "Maintaining Asepsis",
          "time": "15 min",
          "difficulty": "Beginner",
          "image": "/medpath-hero.png",
          "definition": "A sterile field is a controlled area used to prevent microorganisms from contaminating surgical supplies and tissues.",
          "material": "A surgical technologist prepares the sterile field, checks package integrity and expiration, and monitors every item introduced. An item with a torn wrapper or uncertain sterility must be treated as contaminated. Sterile technique requires constant observation, not a one-time setup.",
          "tip": "Watch the field during every handoff; stop and correct any contamination immediately.",
          "warning": "Do not use a sterile item after its wrapper is compromised.",
          "takeaways": [
            "Check wrappers before opening.",
            "Keep nonsterile objects away from the field.",
            "Communicate contamination immediately."
          ],
          "quiz": {
            "question": "What should you do if a sterile package has a tear?",
            "options": [
              "Use it if dry",
              "Consider it contaminated",
              "Cover the tear",
              "Ignore the tear"
            ],
            "answer": "Consider it contaminated.",
            "explanation": "A sterile field is a controlled area used to prevent microorganisms from contaminating surgical supplies and tissues."
          },
          "flashcards": [
            [
              "Asepsis",
              "Prevention of contamination by microorganisms"
            ],
            [
              "Sterile field",
              "Controlled area for sterile supplies and instruments"
            ],
            [
              "Contamination",
              "Loss of assurance that an item remains sterile"
            ],
            [
              "Package integrity",
              "Condition of the barrier that protects sterility"
            ],
            [
              "Sterile handoff",
              "Transfer of an item without compromising sterility"
            ]
          ]
        }
      ]
    },
    {
      "title": "Surgical Instruments",
      "progress": 0,
      "lessons": [
        {
          "title": "Instrument Recognition and Passing",
          "time": "15 min",
          "difficulty": "Beginner",
          "image": "/medpath-hero.png",
          "definition": "Surgical instruments are selected according to their function: cutting, grasping, clamping, retracting, or suctioning.",
          "material": "Scalpels cut tissue; forceps grasp; hemostats clamp vessels; retractors hold tissue aside; suction tips clear fluid. In the scrub role, organize instruments by use and pass them in a safe, functional orientation. Recognizing purpose is more useful than memorizing names without context.",
          "tip": "Study one instrument family at a time and connect it to a task.",
          "warning": "A similarly shaped instrument may have a different function.",
          "takeaways": [
            "Group instruments by function.",
            "Inspect instruments for defects.",
            "Pass sharps using approved safety practices."
          ],
          "quiz": {
            "question": "Which instrument holds tissue aside?",
            "options": [
              "Hemostat",
              "Retractor",
              "Scalpel",
              "Suction tip"
            ],
            "answer": "Retractor",
            "explanation": "Surgical instruments are selected according to their function: cutting, grasping, clamping, retracting, or suctioning."
          },
          "flashcards": [
            [
              "Scalpel",
              "Instrument for making an incision"
            ],
            [
              "Forceps",
              "Instrument for grasping tissue or material"
            ],
            [
              "Hemostat",
              "Instrument for clamping a vessel"
            ],
            [
              "Retractor",
              "Instrument that holds tissue aside"
            ],
            [
              "Suction tip",
              "Device that removes fluid from the field"
            ]
          ]
        }
      ]
    },
    {
      "title": "Operating Room Safety",
      "progress": 0,
      "lessons": [
        {
          "title": "Counts and Team Communication",
          "time": "15 min",
          "difficulty": "Beginner",
          "image": "/medpath-hero.png",
          "definition": "Surgical safety depends on coordinated checks, accurate counts, and clear communication.",
          "material": "A surgical time-out verifies the correct patient, procedure, and site before incision. Sponge, sharp, and instrument counts are performed according to facility policy to help prevent retained items. Closed-loop communication repeats and confirms critical instructions. An unresolved count discrepancy must be reported and investigated.",
          "tip": "Practice explaining each step of the time-out and count process.",
          "warning": "Never dismiss a missing-item discrepancy as a documentation issue.",
          "takeaways": [
            "Confirm patient, procedure, and site.",
            "Use closed-loop communication.",
            "Escalate unresolved count discrepancies."
          ],
          "quiz": {
            "question": "Why is a surgical time-out performed?",
            "options": [
              "To change shifts",
              "To verify patient, procedure, and site",
              "To clean instruments",
              "To end the case"
            ],
            "answer": "To verify patient, procedure, and site",
            "explanation": "Surgical safety depends on coordinated checks, accurate counts, and clear communication."
          },
          "flashcards": [
            [
              "Time-out",
              "Safety pause to verify key procedure details"
            ],
            [
              "Surgical count",
              "Accounting for instruments, sponges, and sharps"
            ],
            [
              "Closed-loop communication",
              "Message repeated and confirmed"
            ],
            [
              "Count discrepancy",
              "Mismatch requiring investigation"
            ],
            [
              "Circulator",
              "Nonsterile team member coordinating OR care"
            ]
          ]
        }
      ]
    }
  ],
  "assistant": [
    {
      "title": "Patient Intake",
      "progress": 0,
      "lessons": [
        {
          "title": "Identity and Vital Signs",
          "time": "15 min",
          "difficulty": "Beginner",
          "image": "/medpath-hero.png",
          "definition": "Accurate patient intake starts with verifying identity, gathering relevant information, and measuring vital signs correctly.",
          "material": "Use two approved identifiers before care. Record the chief complaint and relevant history without guessing. Vital signs include pulse, respiratory rate, blood pressure, temperature, and often oxygen saturation. If a reading is unexpected, recheck technique and communicate concerns to the supervising clinician.",
          "tip": "Link each vital sign to what it measures and when it may need rechecking.",
          "warning": "A room number is not an approved substitute for patient identification.",
          "takeaways": [
            "Use two patient identifiers.",
            "Record measurements accurately.",
            "Report unexpected findings promptly."
          ],
          "quiz": {
            "question": "How many approved patient identifiers are commonly required?",
            "options": [
              "One",
              "Two",
              "None",
              "Room number only"
            ],
            "answer": "Two",
            "explanation": "Accurate patient intake starts with verifying identity, gathering relevant information, and measuring vital signs correctly."
          },
          "flashcards": [
            [
              "Pulse",
              "Heartbeats per minute"
            ],
            [
              "Respiratory rate",
              "Breaths per minute"
            ],
            [
              "Blood pressure",
              "Pressure in arteries"
            ],
            [
              "SpO2",
              "Estimated peripheral oxygen saturation"
            ],
            [
              "Chief complaint",
              "Main reason for the visit"
            ]
          ]
        }
      ]
    },
    {
      "title": "Specimen Collection",
      "progress": 0,
      "lessons": [
        {
          "title": "Safe Collection and Labeling",
          "time": "15 min",
          "difficulty": "Beginner",
          "image": "/medpath-hero.png",
          "definition": "Specimen accuracy depends on patient identification, appropriate collection, and prompt labeling.",
          "material": "Before collecting a specimen, confirm the order and patient identity. Follow infection prevention practices, choose the correct container, and label the specimen in the patient's presence at collection using required identifiers. Dispose of used sharps immediately in an approved sharps container. Follow facility instructions for transport and storage.",
          "tip": "Practice the sequence: verify, collect, label, transport, document.",
          "warning": "Never leave an unlabeled specimen to identify later from memory.",
          "takeaways": [
            "Confirm the order and identity.",
            "Label at collection.",
            "Use safe sharps disposal."
          ],
          "quiz": {
            "question": "When should a collected specimen be labeled?",
            "options": [
              "Later at the desk",
              "At collection using verified identifiers",
              "After transport",
              "Only if requested"
            ],
            "answer": "At collection using verified identifiers",
            "explanation": "Specimen accuracy depends on patient identification, appropriate collection, and prompt labeling."
          },
          "flashcards": [
            [
              "Venipuncture",
              "Drawing blood from a vein"
            ],
            [
              "Specimen label",
              "Identifiers attached to a collected sample"
            ],
            [
              "Sharps container",
              "Approved puncture-resistant disposal container"
            ],
            [
              "Order verification",
              "Confirming requested collection or test"
            ],
            [
              "Standard precautions",
              "Baseline infection prevention for all patients"
            ]
          ]
        }
      ]
    },
    {
      "title": "Medication Safety",
      "progress": 0,
      "lessons": [
        {
          "title": "Verification and Documentation",
          "time": "15 min",
          "difficulty": "Beginner",
          "image": "/medpath-hero.png",
          "definition": "Medication support requires accurate verification, awareness of allergies, and working within scope and supervision.",
          "material": "Before assisting with medication administration, verify the authorized order, patient identity, medication, dose, route, timing, and documented allergies under applicable policy. Watch for discrepancies and seek clarification rather than guessing. Document care promptly and accurately in the health record. Permitted tasks vary by jurisdiction and employer.",
          "tip": "Use a consistent checklist before any medication-related task.",
          "warning": "Never administer a medication when an order or patient identity is uncertain.",
          "takeaways": [
            "Verify orders and allergies.",
            "Stay within authorized scope.",
            "Document accurately and promptly."
          ],
          "quiz": {
            "question": "What should you do when a medication order is unclear?",
            "options": [
              "Guess the dose",
              "Seek clarification",
              "Skip documentation",
              "Use another patient's order"
            ],
            "answer": "Seek clarification",
            "explanation": "Medication support requires accurate verification, awareness of allergies, and working within scope and supervision."
          },
          "flashcards": [
            [
              "Medication order",
              "Authorized instruction for a medication"
            ],
            [
              "Route",
              "How medication enters the body"
            ],
            [
              "Allergy check",
              "Review for known reactions"
            ],
            [
              "EHR",
              "Electronic health record"
            ],
            [
              "Scope of practice",
              "Tasks permitted by law and policy"
            ]
          ]
        }
      ]
    }
  ],
  "sterile": [
    {
      "title": "Decontamination",
      "progress": 0,
      "lessons": [
        {
          "title": "Cleaning Before Sterilization",
          "time": "15 min",
          "difficulty": "Beginner",
          "image": "/medpath-hero.png",
          "definition": "Cleaning removes soil and reduces contamination so subsequent disinfection or sterilization can be effective.",
          "material": "Follow the device manufacturer's instructions for use (IFU) for point-of-use treatment, transport, disassembly, manual cleaning, and mechanical cleaning. Wear appropriate PPE in decontamination areas. Hinges and internal channels can retain soil and require special attention. A visibly dirty device is not ready for sterilization.",
          "tip": "Learn each step in the order it is performed, from point of use to inspection.",
          "warning": "Sterilization does not replace thorough cleaning.",
          "takeaways": [
            "Follow validated IFUs.",
            "Protect staff during decontamination.",
            "Inspect hard-to-clean surfaces and lumens."
          ],
          "quiz": {
            "question": "What must happen before instrument sterilization?",
            "options": [
              "Cleaning",
              "Storage",
              "Packaging only",
              "Label printing only"
            ],
            "answer": "Cleaning",
            "explanation": "Cleaning removes soil and reduces contamination so subsequent disinfection or sterilization can be effective."
          },
          "flashcards": [
            [
              "Decontamination",
              "Removal of soil and reduction of contamination"
            ],
            [
              "Bioburden",
              "Microorganisms present before processing"
            ],
            [
              "IFU",
              "Manufacturer's instructions for use"
            ],
            [
              "Lumen",
              "Internal channel in a device"
            ],
            [
              "PPE",
              "Equipment protecting staff from exposure"
            ]
          ]
        }
      ]
    },
    {
      "title": "Inspection and Assembly",
      "progress": 0,
      "lessons": [
        {
          "title": "Preparing Instrument Sets",
          "time": "15 min",
          "difficulty": "Beginner",
          "image": "/medpath-hero.png",
          "definition": "After cleaning, instruments must be inspected for cleanliness, integrity, and function before assembly and packaging.",
          "material": "Inspect hinges, jaws, tips, and lumens according to validated instructions. Remove damaged instruments from service. Assemble trays according to the count sheet and facility procedures; position hinged items and protect delicate tips as required by their IFUs. Choose compatible packaging and avoid overloading sets.",
          "tip": "Compare each instrument to the tray count sheet while inspecting function.",
          "warning": "A damaged or soiled instrument should not be packaged for patient use.",
          "takeaways": [
            "Check cleanliness and function.",
            "Remove defective instruments.",
            "Use correct tray assembly and packaging."
          ],
          "quiz": {
            "question": "What should happen to a cracked instrument?",
            "options": [
              "Return it to the set",
              "Remove it from service",
              "Cover the crack",
              "Sterilize twice"
            ],
            "answer": "Remove it from service",
            "explanation": "After cleaning, instruments must be inspected for cleanliness, integrity, and function before assembly and packaging."
          },
          "flashcards": [
            [
              "Inspection",
              "Check for cleanliness and function"
            ],
            [
              "Count sheet",
              "List of instruments expected in a set"
            ],
            [
              "Hinged instrument",
              "Device with a joint requiring attention"
            ],
            [
              "Tray assembly",
              "Organizing instruments for processing"
            ],
            [
              "Packaging",
              "Validated barrier protecting processed items"
            ]
          ]
        }
      ]
    },
    {
      "title": "Sterilization Monitoring",
      "progress": 0,
      "lessons": [
        {
          "title": "Cycles and Quality Checks",
          "time": "15 min",
          "difficulty": "Beginner",
          "image": "/medpath-hero.png",
          "definition": "Sterilization uses validated processes and monitoring to achieve an appropriate level of microbial destruction.",
          "material": "Select the cycle specified by the device, packaging, and sterilizer IFUs. Chemical indicators show exposure to certain process conditions; biological indicators test sterilization process effectiveness using resistant microorganisms. Review required physical, chemical, and biological monitoring results before release under facility policy. Wet or damaged packs must be handled as compromised.",
          "tip": "Know what each monitoring method measures—and what it does not prove.",
          "warning": "A color-changing chemical indicator alone does not guarantee sterility.",
          "takeaways": [
            "Use validated cycle parameters.",
            "Review monitoring results.",
            "Protect sterile packages during storage."
          ],
          "quiz": {
            "question": "What does a biological indicator help assess?",
            "options": [
              "Staff scheduling",
              "Sterilization process effectiveness",
              "Tray appearance",
              "Instrument ownership"
            ],
            "answer": "Sterilization process effectiveness",
            "explanation": "Sterilization uses validated processes and monitoring to achieve an appropriate level of microbial destruction."
          },
          "flashcards": [
            [
              "Steam sterilization",
              "Process using saturated steam under controlled conditions"
            ],
            [
              "Chemical indicator",
              "Shows exposure to specified process conditions"
            ],
            [
              "Biological indicator",
              "Monitors process efficacy using test microorganisms"
            ],
            [
              "Wet pack",
              "Moist package treated as compromised"
            ],
            [
              "Traceability",
              "Records linking loads and processed items"
            ]
          ]
        }
      ]
    }
  ]
};
  const normalizedProgram = program.trim().toLowerCase();
  const pathModules = normalizedProgram.includes("surgical") || normalizedProgram.includes("surgery")
    ? pathwayLessons.surgical
    : normalizedProgram.includes("medical assistant") || normalizedProgram.includes("medical assisting")
      ? pathwayLessons.assistant
      : normalizedProgram.includes("sterile processing")
        ? pathwayLessons.sterile
        : courseModules;
  const isFree = plan === "explorer";
  const availableModules = isFree ? pathModules.slice(0, 1) : pathModules;
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
  const selectedModule = availableModules[selectedModuleIndex];
  const selectedLesson = selectedModule.lessons[selectedLessonIndex];
  const lessonKey = `${selectedModule.title}-${selectedLesson.title}`;
  const totalLessons = availableModules.reduce((total, module) => total + module.lessons.length, 0);
  const visualProgress = Math.round((completedLessons.length / totalLessons) * 100);
  const lessonFlashcards: string[][] = [
    ...selectedLesson.flashcards,
    ["What is the main concept of this lesson?", selectedLesson.definition],
    ["What study or practice tip should you remember?", selectedLesson.tip],
    ["What important safety or learning mistake should you avoid?", selectedLesson.warning],
    ...selectedLesson.takeaways.map((takeaway, index) => [`Key takeaway ${index + 1}: what should you remember?`, takeaway]),
    ["Why is the correct answer to the knowledge check important?", selectedLesson.quiz.explanation]
  ];
  const currentFlashcard = lessonFlashcards[flashcardIndex];
  const isBookmarked = bookmarks.includes(lessonKey);
  const isLessonComplete = completedLessons.includes(lessonKey);
  const recommendedNextLesson =
    selectedModule.lessons[selectedLessonIndex + 1]?.title ||
    availableModules[selectedModuleIndex + 1]?.lessons[0]?.title ||
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

    if (selectedModuleIndex < availableModules.length - 1) {
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
          <h2>{program && program !== "Healthcare career" ? `${program} Learning` : "MedPath Foundations"}</h2>
          {isFree && <p>Free study plan: one introductory pathway module. Upgrade to unlock the remaining modules.</p>}
        </div>
        <div className="course-module-list">
          {availableModules.map((module, index) => (
            <button
              className={index === selectedModuleIndex ? "course-module-item active" : "course-module-item"}
              key={module.title}
              onClick={() => selectModule(index)}
            >
              <span>{completedLessons.some((lesson) => lesson.startsWith(module.title)) ? <Check size={16} /> : index + 1}</span>
              <strong>{module.title}</strong>
              <small>{module.lessons.length} lesson{module.lessons.length === 1 ? "" : "s"}</small>
              <i style={{ width: `${Math.round((completedLessons.filter((key) => key.startsWith(module.title + "-")).length / module.lessons.length) * 100)}%` }} />
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
            <span style={{ width: `${visualProgress}%` }} />
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
            <p>{('material' in selectedLesson && typeof selectedLesson.material === 'string') ? selectedLesson.material : selectedLesson.definition}</p>
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
              <h3>{flashcardIndex + 1} of {lessonFlashcards.length}</h3>
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
            <button className="secondary compact" onClick={() => setFlashcardIndex(Math.min(lessonFlashcards.length - 1, flashcardIndex + 1))}>
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

type ClinicalTopic = { title: string; description: string; checklist: string[] };
const commonClinicalTopics: ClinicalTopic[] = [
  { title: "Daily readiness", description: "Prepare for a safe, organized clinical day.", checklist: ["Check your school's clinical requirements and assigned location.", "Bring required ID, approved uniform, and necessary materials.", "Review the day's learning objectives and arrive on time."] },
  { title: "Patient communication", description: "Practice respectful, clear communication.", checklist: ["Introduce yourself as a student and explain your role.", "Follow facility policy for verifying patient identity.", "Protect privacy and ask your supervisor when unsure."] },
  { title: "Infection prevention", description: "Use approved infection-control practices.", checklist: ["Perform hand hygiene at appropriate moments.", "Select PPE according to facility policy and precautions.", "Report breaks in technique to your supervising professional."] }
];
const clinicalTopicsByPath: Record<string, ClinicalTopic[]> = {
  nursing: [
    { title: "Nursing assessment preparation", description: "Prepare for supervised patient assessments.", checklist: ["Review expected assessment steps with your clinical instructor.", "Practice accurate vital-sign measurement and reporting.", "Escalate abnormal findings promptly to your instructor or assigned nurse."] },
    { title: "SBAR handoff", description: "Organize clinical communication.", checklist: ["State the situation and relevant background.", "Summarize your assessment without guessing.", "Clearly communicate the requested recommendation or next step."] },
    { title: "Medication safety", description: "Follow supervised medication-administration procedures.", checklist: ["Review medication rights and institutional policies.", "Verify orders and allergies with your supervising nurse.", "Never administer medication beyond your authorized student scope."] }
  ],
  surgical: [
    { title: "Operating room etiquette", description: "Prepare for the surgical team environment.", checklist: ["Review surgical attire and restricted-area rules.", "Respect sterile boundaries and identify contamination.", "Communicate clearly and follow the preceptor's direction."] },
    { title: "Sterile field readiness", description: "Review foundational aseptic practices.", checklist: ["Review sterile field setup expectations.", "Identify breaks in sterility and report them immediately.", "Follow team counting and documentation protocols."] },
    { title: "Surgical teamwork", description: "Practice safe team communication.", checklist: ["Understand the purpose of the surgical time-out.", "Anticipate needs only within your supervised role.", "Ask for clarification rather than guessing."] }
  ],
  assistant: [
    { title: "Patient intake", description: "Prepare for supervised ambulatory care.", checklist: ["Practice respectful introductions and identification.", "Review vital signs and documentation workflows.", "Report concerns to the licensed supervising clinician."] },
    { title: "Room preparation", description: "Prepare a safe patient-care space.", checklist: ["Check approved supplies and equipment.", "Follow cleaning and infection-control policies.", "Confirm tasks within your training and permitted scope."] }
  ],
  sterile: [
    { title: "Instrument workflow", description: "Prepare for sterile processing rotations.", checklist: ["Review separation of dirty and clean workflows.", "Follow manufacturer instructions and facility procedures.", "Report damaged or improperly processed instruments."] },
    { title: "Decontamination safety", description: "Practice safe handling principles.", checklist: ["Wear task-appropriate PPE.", "Follow approved cleaning and handling procedures.", "Ask your preceptor before handling unfamiliar equipment."] }
  ]
};
export function Clinical({ plan, program }: { plan: PlanKey; program: string }) {
  const normalized = program.toLowerCase();
  const pathway = normalized.includes("registered nurse") || normalized.includes("nurse practitioner") || normalized.includes("nursing") ? "nursing"
    : normalized.includes("surgical") || normalized.includes("surgeon") ? "surgical"
    : normalized.includes("medical assistant") || normalized.includes("patient care") || normalized.includes("nursing assistant") ? "assistant"
    : normalized.includes("sterile processing") ? "sterile" : "";
  const topics = [...commonClinicalTopics, ...(clinicalTopicsByPath[pathway] ?? [
    { title: "Pathway-specific supervision", description: "Prepare for the clinical requirements of your selected program.", checklist: ["Review your program's clinical competencies.", "Confirm your student scope and supervisor.", "Ask for guidance before performing unfamiliar procedures."] }
  ])];
  const visibleTopics = plan === "explorer" ? topics.slice(0, 3) : topics;
  const [checked, setChecked] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const completed = visibleTopics.filter(topic => topic.checklist.every((_, index) => checked.includes(`${program}:${topic.title}:${index}`))).length;
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">PathClinical</p>
        <h2>Get ready for your clinical experience.</h2>
        <p>Preparation for <strong>{program || "your healthcare pathway"}</strong>. Review each topic and mark steps complete as you prepare.</p>
        <p role="status">{completed} of {visibleTopics.length} topics completed in this session.</p>
        {plan === "explorer" && <p>Free preview: 3 topics. Upgrade to explore pathway-specific preparation.</p>}
      </div>
      <section className="clinical-grid">
        {visibleTopics.map(topic => (
          <article className="panel checklist" key={topic.title}>
            <ClipboardCheck />
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
            <button type="button" className="secondary compact" aria-expanded={expanded === topic.title} onClick={() => setExpanded(expanded === topic.title ? null : topic.title)}>
              {expanded === topic.title ? "Hide checklist" : "Open checklist"}
            </button>
            {expanded === topic.title && <div>
              {topic.checklist.map((item, index) => {
                const key = `${program}:${topic.title}:${index}`;
                return <label key={key} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", marginTop: "0.75rem" }}>
                  <input type="checkbox" checked={checked.includes(key)} onChange={event => setChecked(previous => event.target.checked ? [...previous, key] : previous.filter(value => value !== key))} />
                  <span>{item}</span>
                </label>;
              })}
            </div>}
          </article>
        ))}
      </section>
      <p><small>Preparation guidance only. Follow your clinical program, supervisor, and facility policies. Checklist completion is not a clinical competency sign-off. Progress here resets when the page reloads.</small></p>
    </div>
  );
}

export function CareerExplorer({ plan }: { plan: PlanKey }) {
  const [careerSearch, setCareerSearch] = useState("");
  const [selectedCareerTitle, setSelectedCareerTitle] = useState("Surgical Technologist");
  const [compareTitles, setCompareTitles] = useState<string[]>(["Medical Assistant", "Surgical Technologist"]);
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
      salary: "$65k median",
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
      salary: "$46k median",
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
      salary: "$48k median",
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
      salary: "$45k median",
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
  const salaryValue = (salary: string) => Number(salary.replace(/[^\d.]/g, "")) || 0;
  const availableCareers = [...orderedCareers].sort(
    (first, second) =>
      salaryValue(second.salary) - salaryValue(first.salary) || first.title.localeCompare(second.title)
  );
  const filteredCareers = availableCareers.filter((career) => {
    const query = careerSearch.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return [
      career.title,
      career.responsibilities,
      career.education,
      career.certification,
      career.skills,
      career.workSetting,
      career.bestFor
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
  const visibleCareers = filteredCareers.length > 0 ? filteredCareers : availableCareers.slice(0, 4);
  const selectedCareer =
    availableCareers.find((career) => career.title === selectedCareerTitle) || visibleCareers[0] || fallbackCareers[0];

  const comparedCareers = compareTitles.map((title) => availableCareers.find((career) => career.title === title)).filter((career): career is CareerPath => Boolean(career));
  function toggleCompareCareer(title: string) {
    setCompareTitles((current) => current.includes(title)
      ? current.filter((item) => item !== title)
      : current.length < 3 ? [...current, title] : current);
  }

  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">Career Discovery</p>
        <h2>PathFinder</h2>
        <p>
          Explore {availableCareers.length} healthcare career paths, compare training options, and find the role that fits
          your strengths before, during, and after school.
        </p>
      </div>

      <section className="panel" aria-label="Compare healthcare careers">
        <div className="card-head">
          <div>
            <p className="eyebrow">Explorer</p>
            <h3>Compare Careers</h3>
            <p>Choose up to three careers to see their training, pay, responsibilities, and growth opportunities side by side.</p>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          {availableCareers.map((career) => {
            const selected = compareTitles.includes(career.title);
            return (
              <button key={career.title} type="button"
                className={selected ? "primary compact" : "secondary compact"}
                aria-pressed={selected}
                disabled={!selected && compareTitles.length >= 3}
                onClick={() => toggleCompareCareer(career.title)}>
                {selected ? "✓ " : "+ "}{career.title}
              </button>
            );
          })}
        </div>
        {comparedCareers.length === 0 ? (
          <p role="status">Select a career above to begin comparing.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: comparedCareers.length > 2 ? "700px" : "520px", borderCollapse: "separate", borderSpacing: "0.75rem" }}>
              <thead><tr><th scope="col" style={{ textAlign: "left" }}>Compare</th>
                {comparedCareers.map((career) => <th scope="col" key={career.title} style={{ textAlign: "left" }}>{career.title}</th>)}
              </tr></thead>
              <tbody>
                {([
                  ["Median pay", "salary"],
                  ["Education", "education"],
                  ["Training duration", "trainingLength"],
                  ["Certification", "certification"],
                  ["Responsibilities", "responsibilities"],
                  ["Work setting", "workSetting"],
                  ["Career outlook", "outlook"],
                  ["Advancement", "advancement"]
                ] as const).map(([label, field]) => (
                  <tr key={field}>
                    <th scope="row" style={{ textAlign: "left", verticalAlign: "top" }}>{label}</th>
                    {comparedCareers.map((career) => (
                      <td key={career.title} style={{ verticalAlign: "top" }}>
                        {career[field] || (field === "trainingLength" ? "Varies by program" : "Information not yet available")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="career-data-note">U.S. career information is illustrative; pay, credential requirements, and timelines vary by state and employer. Check official state licensing boards and the BLS before making decisions.</p>
      </section>

      <section className="pathfinder-search panel" aria-label="Search healthcare career paths">
        <Search />
        <input
          value={careerSearch}
          onChange={(event) => setCareerSearch(event.target.value)}
          placeholder="Search careers, certifications, skills, or training paths"
          aria-label="Search healthcare careers"
        />
      </section>

      <p className="career-data-note">
        Approximate U.S. annual median pay based on May 2025 Bureau of Labor Statistics data.
        Earnings, requirements, and job titles vary by location and employer. Some specialized roles
        use the closest BLS occupational category. <a href="https://www.bls.gov/ooh/healthcare/" target="_blank" rel="noreferrer">View source</a>.
      </p>

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
          <span>
            <strong>{selectedCareer.trainingLength ?? selectedCareer.education}</strong>
            Typical training
          </span>
          <span>
            <strong>{selectedCareer.workSetting ?? "Hospitals, clinics, and specialty care settings"}</strong>
            Where you may work
          </span>
          <span>
            <strong>{selectedCareer.bestFor ?? selectedCareer.skills}</strong>
            A strong fit for
          </span>
        </div>
      </section>
    </div>
  );
}

export function ResumeBuilder({ name, program }: { name: string; program: string }) {
  const [mode, setMode] = useState<"starter" | "experienced">("starter");
  const [details, setDetails] = useState({
    fullName: name, email: "", phone: "", location: "", targetRole: program,
    education: "", certifications: "", skills: "", experience: "", projects: "",
    summary: ""
  });
  const [generated, setGenerated] = useState(false);
  const update = (field: keyof typeof details, value: string) => {
    setDetails(previous => ({ ...previous, [field]: value }));
    setGenerated(false);
  };
  const splitLines = (value: string) => value.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const summary = details.summary.trim() || (
    mode === "starter"
      ? `Motivated ${details.targetRole.trim() || "healthcare"} candidate building a foundation through education and practical learning. Eager to contribute strong communication, dependability, and a commitment to patient-centered care.`
      : `Healthcare professional pursuing a ${details.targetRole.trim() || "healthcare"} role, bringing relevant experience and a commitment to quality service, teamwork, and continued professional development.`
  );
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">PathHire</p>
        <h2>Build your healthcare resume.</h2>
        <p>Use your real education, skills and experience to create a professional resume. No prior job experience required.</p>
      </div>
      <section className="resume-layout">
        <form className="panel form-panel" onSubmit={(event) => { event.preventDefault(); setGenerated(true); }}>
          <label htmlFor="resume-type">Resume type
            <select id="resume-type" value={mode} onChange={(event) => { setMode(event.target.value as "starter" | "experienced"); setGenerated(false); }}>
              <option value="starter">Starter / Student — little or no job experience</option>
              <option value="experienced">Experienced — include work history</option>
            </select>
          </label>
          {([
            ["fullName", "Full name", "Your full name"],
            ["email", "Email", "you@example.com"],
            ["phone", "Phone", "(555) 555-5555"],
            ["location", "City and state", "Baltimore, MD"],
            ["targetRole", "Target job title", "Medical Assistant"],
          ] as const).map(([key, label, placeholder]) => (
            <label key={key}>{label}
              <input value={details[key]} placeholder={placeholder} onChange={event => update(key, event.target.value)} required={key === "fullName" || key === "targetRole"} />
            </label>
          ))}
          {([
            ["education", "Education / training", "School, program, graduation date (one entry per line)"],
            ["certifications", "Certifications / licenses", "Only credentials you have earned (one per line)"],
            ["skills", "Relevant skills", "Enter real skills, separated by commas"],
            ["experience", mode === "starter" ? "Optional work, volunteer, or clinical experience" : "Work experience", "Job or activity, dates, and what you actually did (one entry per line)"],
            ["projects", "Projects, coursework, or extracurricular activities", "Describe relevant activities or achievements (one per line)"],
            ["summary", "Optional personal summary", "Write your own summary, or leave blank for a starter template"],
          ] as const).map(([key, label, placeholder]) => (
            <label key={key}>{label}
              <textarea value={details[key]} placeholder={placeholder} onChange={event => update(key, event.target.value)} rows={3} />
            </label>
          ))}
          <button className="primary" type="submit"><WandSparkles size={18} />Generate Resume</button>
          <button className="secondary" type="button" disabled={!generated} onClick={() => window.print()}>
            <Download size={18} />Print / Save as PDF
          </button>
          <small>Review every detail before applying. The builder does not invent jobs, credentials, or clinical experience. Your entries remain in this browser session and are not saved to an account.</small>
        </form>
        <article className="resume-preview" aria-label="Resume preview">
          {!generated ? (
            <><h3>Your resume preview</h3><p>Enter your information and select Generate Resume to see your personalized document.</p></>
          ) : (
            <div id="pathhire-resume-print">
              <h3>{details.fullName.trim()}</h3>
              <p>{[details.location.trim(), details.phone.trim(), details.email.trim()].filter(Boolean).join(" · ")}</p>
              <p><strong>{details.targetRole.trim()} Candidate</strong></p>
              <h4>Professional Summary</h4><p>{summary}</p>
              {details.skills.trim() && <><h4>Skills</h4><p>{details.skills.split(",").map(x => x.trim()).filter(Boolean).join(" · ")}</p></>}
              {splitLines(details.education).length > 0 && <><h4>Education & Training</h4><ul>{splitLines(details.education).map((item, index) => <li key={index}>{item}</li>)}</ul></>}
              {splitLines(details.certifications).length > 0 && <><h4>Certifications</h4><ul>{splitLines(details.certifications).map((item, index) => <li key={index}>{item}</li>)}</ul></>}
              {splitLines(details.experience).length > 0 && <><h4>{mode === "starter" ? "Relevant Experience & Activities" : "Professional Experience"}</h4><ul>{splitLines(details.experience).map((item, index) => <li key={index}>{item}</li>)}</ul></>}
              {splitLines(details.projects).length > 0 && <><h4>Projects & Coursework</h4><ul>{splitLines(details.projects).map((item, index) => <li key={index}>{item}</li>)}</ul></>}
            </div>
          )}
        </article>
      </section>
      <style>{`@media print {
        body * { visibility: hidden !important; }
        #pathhire-resume-print, #pathhire-resume-print * { visibility: visible !important; }
        #pathhire-resume-print { position: absolute !important; top: 0; left: 0; width: 100%; padding: 24px; background: white !important; color: black !important; font: 11pt/1.4 Arial, sans-serif !important; }
        #pathhire-resume-print h3 { font-size: 20pt !important; margin-bottom: 6px; }
        #pathhire-resume-print h4 { font-size: 12pt !important; margin-top: 18px; margin-bottom: 5px; border-bottom: 1px solid #777; }
        @page { margin: 0.6in; }
      }`}</style>
    </div>
  );
}

const interviewQuestions = [
  "Tell me about a time you stayed calm in a stressful clinical or classroom situation.",
  "How would you handle a disagreement with a coworker in a healthcare setting?",
  "Describe a time you made a mistake and what you learned from it.",
  "How do you prioritize tasks when several patients or team members need help?",
  "Why do you want to work in healthcare, and what strengths would you bring to this role?"
];

type InterviewFeedback = { strengths: string[]; improvements: string[]; tip: string };

function reviewInterviewAnswer(answer: string): InterviewFeedback {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const text = answer.toLowerCase();
  const strengths: string[] = [];
  const improvements: string[] = [];
  const hasSituation = /when|during|while|situation|time|once|patient|class|clinic|shift/.test(text);
  const hasAction = /i (helped|asked|spoke|checked|organized|prioritized|communicated|explained|reported|listened|stayed|made|worked|took|decided|used|responded)/.test(text);
  const hasResult = /result|outcome|improved|resolved|successful|finished|completed|safe|learned|feedback|afterward|ultimately/.test(text);
  if (hasSituation) strengths.push("You included context that helps an interviewer understand the situation.");
  else improvements.push("Briefly explain the situation or challenge you faced.");
  if (hasAction) strengths.push("You describe an action you personally took.");
  else improvements.push("Explain exactly what you did, using an \"I\" statement.");
  if (hasResult) strengths.push("You mention an outcome or lesson.");
  else improvements.push("Add the outcome and what you learned from the experience.");
  if (words.length >= 45) strengths.push("Your answer has enough detail to start telling a complete story.");
  else improvements.push("Develop your example with a few more specific details.");
  if (words.length > 220) improvements.push("Consider shortening your answer to keep it focused for an interview.");
  return {
    strengths,
    improvements,
    tip: "Try the STAR approach: Situation, Task, Action, Result. This is an automated structure check, not an AI assessment of your clinical judgment or interview performance."
  };
}

export function InterviewCoach() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [submittedAnswer, setSubmittedAnswer] = useState("");
  const submitAnswer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (answer.trim().length < 20) return;
    setSubmittedAnswer(answer.trim());
    setFeedback(reviewInterviewAnswer(answer));
  };
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">Interview Coach</p>
        <h2>Practice answers with supportive feedback.</h2>
        <p>Choose a question, write your own response, and receive actionable feedback on its structure.</p>
      </div>
      <section className="panel interview">
        <label htmlFor="interview-question"><strong>Practice question</strong></label>
        <select id="interview-question" value={questionIndex} onChange={(event) => {
          setQuestionIndex(Number(event.target.value));
          setAnswer("");
          setFeedback(null);
          setSubmittedAnswer("");
        }}>
          {interviewQuestions.map((question, index) => <option key={question} value={index}>{index + 1}. {question}</option>)}
        </select>
        <p>{interviewQuestions[questionIndex]}</p>
        <form onSubmit={submitAnswer}>
          <label htmlFor="interview-answer">Your answer</label>
          <textarea id="interview-answer" value={answer} onChange={(event) => {
            setAnswer(event.target.value);
            setFeedback(null);
          }} placeholder="Describe what happened, what you did, and the outcome..." rows={7} />
          <p><small>{answer.trim().split(/\s+/).filter(Boolean).length} words · Minimum 20 characters to submit</small></p>
          <button className="primary" type="submit" disabled={answer.trim().length < 20}>Get feedback</button>
        </form>
        {feedback && (
          <section aria-live="polite" className="panel">
            <h3>Feedback on your answer</h3>
            <p><small>Based on your submitted response ({submittedAnswer.split(/\s+/).length} words)</small></p>
            {feedback.strengths.length > 0 && <><h4>What works</h4><ul>{feedback.strengths.map(item => <li key={item}>{item}</li>)}</ul></>}
            {feedback.improvements.length > 0 && <><h4>What to improve</h4><ul>{feedback.improvements.map(item => <li key={item}>{item}</li>)}</ul></>}
            <p>{feedback.tip}</p>
            <button type="button" className="secondary" onClick={() => {
              setQuestionIndex((questionIndex + 1) % interviewQuestions.length);
              setAnswer("");
              setFeedback(null);
              setSubmittedAnswer("");
            }}>Try another question</button>
          </section>
        )}
      </section>
    </div>
  );
}

export function Billing({
  plan,
  setPlan,
  onLock,
  isSignedIn,
  error = "",
  onManageBilling
}: {
  plan: PlanKey;
  setPlan: (plan: PlanKey) => void | Promise<void>;
  onLock: (feature: FeatureKey) => void;
  isSignedIn: boolean;
  error?: string;
  onManageBilling?: () => void | Promise<void>;
}) {
  const [pendingPlan, setPendingPlan] = useState<PlanKey | null>(null);
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
        "7-day free trial",
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
    },
    {
      key: "founding_member" as PlanKey,
      name: "Founding Member",
      price: "$9.99/month",
      badge: "First 50 Members",
      description: "First 50 members get full Elite access at the Founding Member price.",
      includes: [
        "7-day free trial",
      "Everything in Elite",
        "Founding Member badge",
        "Locked-in $9.99 monthly price",
        "Early access to new features",
        "Opportunities to influence MedPath"
      ],
      button: "Claim a Founding Spot"
    }
  ];
  const comparisonRows = [
    ["Atlas Tutor", "3 questions", "Unlimited", "Unlimited", "Unlimited"],
    ["Flashcards", "Sample", "Unlimited", "Unlimited", "Unlimited"],
    ["Quizzes", "Sample", "Unlimited", "Unlimited", "Unlimited"],
    ["Practice Exams", "Not included", "Full access", "Full access", "Full access"],
      ["Study Planner", "Basic", "Personalized", "Personalized", "Personalized"],
  ["Progress Tracking", "Not included", "Advanced", "Included", "Advanced"],
["Career PathFinder", "Included", "Included", "Included", "Included"],
["Course Access", "Limited", "Full access", "Full access", "Full access"],
  ["Certificates", "Not included", "Included", "Included", "Included"],
  ["Priority Support", "Not included", "Included", "Not included", "Included"],
  ];
  const pricingFaqs = [
  ["What payment methods are accepted?", "MedPath accepts major debit and credit cards through secure Stripe checkout."],
    ["Can I cancel anytime?", "Yes. You can cancel your subscription anytime from your account's billing settings."],
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
              pricingPlan.key === "student_plus" || pricingPlan.key === "founding_member" ? "recommended" : "",
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
              className={pricingPlan.key === "student_plus" || pricingPlan.key === "founding_member" ? "primary" : "secondary"}
              disabled={pendingPlan !== null || (isSignedIn && plan === pricingPlan.key)}
              onClick={async () => {
                setPendingPlan(pricingPlan.key);
                await setPlan(pricingPlan.key);
                setPendingPlan(null);
              }}
            >
              {pendingPlan === pricingPlan.key
                ? "Opening checkout..."
                : isSignedIn && plan === pricingPlan.key
                  ? "Current Plan"
                  : pricingPlan.button}
            </button>
          </article>
        ))}
      </section>

      {error && <p className="form-message error-message" role="alert">{error}</p>}

      <section className="panel comparison-panel">
        <div className="card-head">
          <div>
            <p className="eyebrow">Compare Plans</p>
            <h3>Everything students need, side by side.</h3>
          </div>
          <BarChart3 />
        </div>
        <div className="comparison-table-wrap mobile-scroll">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>

<th className="bg-blue-100 dark:bg-blue-900/40 border-x-2 border-t-2 border-blue-900 font-bold min-w-[160px]">
  <span className="block">⭐ Founding Member</span>
  <span className="block mt-1 text-xs font-medium">
    (First 50 Members)
  </span>
</th>
                <th>Pro</th>
                <th>Elite</th>
              </tr>
            </thead>
            <tbody>
{comparisonRows.map(([feature, free, founding, pro, elite]) => (
                <tr key={feature}>
                  <td>{feature}</td>
                  <td>{free}</td>


<td className="bg-blue-950/10 dark:bg-blue-900/40 border-x-2 border-blue-900 font-semibold">{founding}</td>


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
            <button onClick={() => onManageBilling?.()}>Manage subscription and payment</button>
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
      </section>
      )}
    </div>
  );
}

export function Admin() {
  return (
    <div className="stack">
      <div className="page-title">
        <p className="eyebrow">Administrator</p>
        <h2>MedPath business overview</h2>
        <p>Business metrics and customer management will appear here after secure data connections are configured.</p>
      </div>
      <section className="metric-grid" aria-label="Business metrics">
        <Metric title="Monthly Revenue" value="—" icon={<CircleDollarSign />} />
        <Metric title="Active Subscriptions" value="—" icon={<BadgeCheck />} />
        <Metric title="Cancellations" value="—" icon={<X />} />
        <Metric title="Trial Conversion" value="—" icon={<BarChart3 />} />
      </section>
      <section className="panel">
        <h3>Customer accounts</h3>
        <p>No customer records are connected to this dashboard yet.</p>
        <p>Real users and subscription statuses will be displayed after a secure administrator-only Supabase integration. No sample users or account controls are shown.</p>
      </section>
    </div>
  );
}

export function AuthModal({
  mode,
  name,
  program,
  error,
  notice,
  fieldErrors,
  isLoading,
  setName,
  setProgram,
  setMode,
  onClose,
  onSubmit
}: {
  mode: "signup" | "login" | "forgot" | "reset";
  name: string;
  program: string;
  error: string;
  notice: string;
  fieldErrors: Partial<Record<"name" | "program" | "email" | "password", string>>;
  isLoading: boolean;
  setName: (value: string) => void;
  setProgram: (value: string) => void;
  setMode: (mode: "signup" | "login" | "forgot" | "reset") => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const title = mode === "signup" ? "Create your MedPath account" : mode === "login" ? "Welcome back" : mode === "reset" ? "Choose a new password" : "Reset password";
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");
  const passwordScore = [
    passwordValue.length >= 8,
    /[A-Z]/.test(passwordValue),
    /\d/.test(passwordValue),
    /[^A-Za-z0-9]/.test(passwordValue)
  ].filter(Boolean).length;
  const passwordStrength = passwordScore >= 4 ? "Strong" : passwordScore >= 3 ? "Good" : passwordScore >= 2 ? "Fair" : "Weak";
  const submitText = isLoading
    ? mode === "signup"
      ? "Creating your account..."
      : mode === "forgot"
        ? "Sending reset link..."
        : mode === "reset"
          ? "Updating password..."
          : "Signing in..."
    : mode === "forgot"
      ? "Send reset link"
      : mode === "reset"
        ? "Update password"
        : mode === "signup"
        ? "Create Account"
        : "Log In";

  useEffect(() => {
    setPasswordValue("");
    setPasswordVisible(false);
  }, [mode]);

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="auth-modal" onSubmit={onSubmit} noValidate key={mode} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button className="close-button" type="button" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <LogoMark />
        <h2 id="auth-modal-title">{title}</h2>
        <p>{mode === "forgot" ? "Enter your email and we will send a secure reset link." : mode === "reset" ? "Enter a secure new password for your MedPath account." : "Start with a 7-day Student Plus trial. No commitment."}</p>
        {mode === "signup" && (
          <label>
            Name
            <input
              className={fieldErrors.name ? "invalid" : ""}
              name="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "auth-name-error" : undefined}
            />
            {fieldErrors.name && <small className="field-error" id="auth-name-error">{fieldErrors.name}</small>}
          </label>
        )}
        {mode === "signup" && (
          <label>
            Program
            <select
              className={fieldErrors.program ? "invalid" : ""}
              name="program"
              value={program}
              onChange={(event) => setProgram(event.target.value)}
              aria-invalid={Boolean(fieldErrors.program)}
              aria-describedby={fieldErrors.program ? "auth-program-error" : undefined}
            >
              <option value="" disabled>
                Select your program
              </option>
              {healthcarePathways.map((path) => (
                <option key={path.id} value={path.label}>{path.label}</option>
              ))}
              <option>Exploring Healthcare Careers</option>
            </select>
            {fieldErrors.program && <small className="field-error" id="auth-program-error">{fieldErrors.program}</small>}
          </label>
        )}
        {mode !== "reset" && <label>
          Email
          <input
            className={fieldErrors.email ? "invalid" : ""}
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "auth-email-error" : undefined}
          />
          {fieldErrors.email && <small className="field-error" id="auth-email-error">{fieldErrors.email}</small>}
        </label>}
        {mode !== "forgot" && (
          <div className="password-field">
            <label htmlFor="auth-password">Password</label>
            <div className={fieldErrors.password ? "password-input invalid" : "password-input"}>
              <input
                id="auth-password"
                name="password"
                type={passwordVisible ? "text" : "password"}
                value={passwordValue}
                onChange={(event) => setPasswordValue(event.target.value)}
                autoComplete={mode === "signup" || mode === "reset" ? "new-password" : "current-password"}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "auth-password-error auth-password-hints" : "auth-password-hints"}
              />
              <button type="button" onClick={() => setPasswordVisible((value) => !value)} aria-label={passwordVisible ? "Hide password" : "Show password"}>
                {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <small className="field-error" id="auth-password-error">{fieldErrors.password}</small>}
            {mode === "signup" && (
              <div className="password-hints" id="auth-password-hints">
                <span>Password strength: {passwordValue ? passwordStrength : "Start typing"}</span>
                <small className={passwordValue.length >= 8 ? "met" : ""}>At least 8 characters</small>
                <small className={/[A-Z]/.test(passwordValue) ? "met" : ""}>One uppercase letter</small>
                <small className={/\d/.test(passwordValue) ? "met" : ""}>One number</small>
              </div>
            )}
          </div>
        )}
        {error && <p className="form-message error-message" role="alert" aria-live="assertive">{error}</p>}
        {notice && <p className="form-message notice-message" role="status" aria-live="polite">{notice}</p>}
        <button className="primary" type="submit" disabled={isLoading}>
          {isLoading && <span className="button-spinner" aria-hidden="true" />}
          {submitText}
        </button>
        {mode !== "reset" && <div className="auth-switch">
          <button type="button" onClick={() => setMode("login")} disabled={isLoading}>Login</button>
          <button type="button" onClick={() => setMode("signup")} disabled={isLoading}>Sign Up</button>
          <button type="button" onClick={() => setMode("forgot")} disabled={isLoading}>Forgot Password</button>
        </div>}
      </form>
    </div>
  );
}

export function UpgradeOverlay({
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

export function GuestAtlasUpgradeModal({
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

export function Metric({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <article className="metric">
      <span>{icon}</span>
      <small>{title}</small>
      <strong>{value}</strong>
    </article>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <strong>MedPath</strong>
        <span>Learn. Practice. Pass.</span>
      </div>
      <nav aria-label="Footer navigation">
        <a href="/about">About</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms</a>
        <a href="/contact">Contact</a>
      </nav>
    </footer>
  );
}

export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 64 64" role="img" aria-label="MedPath logo">
      <path d="M10 15c9 0 16 3 22 10 6-7 13-10 22-10v34c-9 0-16 3-22 10-6-7-13-10-22-10V15Z" />
      <path d="M18 23c5 1 9 4 14 10 5-6 9-9 14-10M18 34c5 1 9 4 14 10 5-6 9-9 14-10" />
    </svg>
  );
}
