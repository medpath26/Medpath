export type PlanKey =
  | "explorer"
  | "student_plus"
  | "pro_student"
  | "founding_member"
  | "institution_admin"
  | "institution_student"
  | "administrator";

export type FeatureKey =
  | "careerExplorer"
  | "pathFinderQuiz"
  | "atlas"
  | "practice"
  | "flashcards"
  | "studyPlans"
  | "pathTrack"
  | "clinicalPrep"
  | "resumeBuilder"
  | "interviewCoach"
  | "pdfExports"
  | "adaptiveLearning"
  | "clinicalSimulations"
  | "mockExams"
  | "advancedAnalytics"
  | "documentTemplates"
  | "salaryNegotiation"
  | "institutionTools"
  | "adminPanel";

export const featureLabels: Record<FeatureKey, string> = {
  careerExplorer: "Career Explorer",
  pathFinderQuiz: "PathFinder Career Quiz",
  atlas: "Atlas conversations",
  practice: "Practice questions",
  flashcards: "Flashcards",
  studyPlans: "Personalized study plans",
  pathTrack: "PathTrack progress",
  clinicalPrep: "Clinical preparation",
  resumeBuilder: "Resume Builder",
  interviewCoach: "Interview Coach",
  pdfExports: "PDF exports",
  adaptiveLearning: "Adaptive MedPath learning",
  clinicalSimulations: "Clinical simulations",
  mockExams: "Mock certification exams",
  advancedAnalytics: "Advanced analytics",
  documentTemplates: "Healthcare document templates",
  salaryNegotiation: "Salary negotiation assistant",
  institutionTools: "Institution tools",
  adminPanel: "Admin panel"
};

export const planAccess: Record<PlanKey, FeatureKey[]> = {
  explorer: [
    "careerExplorer",
    "pathFinderQuiz",
    "atlas"
  ],
  student_plus: [
    "careerExplorer",
    "pathFinderQuiz",
    "atlas",
    "practice",
    "flashcards",
    "studyPlans",
    "pathTrack",
    "clinicalPrep",
    "resumeBuilder",
    "interviewCoach",
    "pdfExports"
  ],
  founding_member: [
    "careerExplorer",
    "pathFinderQuiz",
    "atlas",
    "practice",
    "flashcards",
    "studyPlans",
    "pathTrack",
    "clinicalPrep",
    "resumeBuilder",
    "interviewCoach",
    "pdfExports"
  ],
  pro_student: [
    "careerExplorer",
    "pathFinderQuiz",
    "atlas",
    "practice",
    "flashcards",
    "studyPlans",
    "pathTrack",
    "clinicalPrep",
    "resumeBuilder",
    "interviewCoach",
    "pdfExports",
    "adaptiveLearning",
    "clinicalSimulations",
    "mockExams",
    "advancedAnalytics",
    "documentTemplates",
    "salaryNegotiation"
  ],
  institution_admin: [
    "careerExplorer",
    "pathFinderQuiz",
    "atlas",
    "practice",
    "flashcards",
    "studyPlans",
    "pathTrack",
    "clinicalPrep",
    "resumeBuilder",
    "interviewCoach",
    "pdfExports",
    "adaptiveLearning",
    "clinicalSimulations",
    "mockExams",
    "advancedAnalytics",
    "institutionTools"
  ],
  institution_student: [
    "careerExplorer",
    "pathFinderQuiz",
    "atlas",
    "practice",
    "flashcards",
    "studyPlans",
    "pathTrack",
    "clinicalPrep"
  ],
  administrator: [
    "careerExplorer",
    "pathFinderQuiz",
    "atlas",
    "practice",
    "flashcards",
    "studyPlans",
    "pathTrack",
    "clinicalPrep",
    "resumeBuilder",
    "interviewCoach",
    "pdfExports",
    "adaptiveLearning",
    "clinicalSimulations",
    "mockExams",
    "advancedAnalytics",
    "documentTemplates",
    "salaryNegotiation",
    "institutionTools",
    "adminPanel"
  ]
};

export const roleBadges: Record<PlanKey, string> = {
  explorer: "Explorer",
  student_plus: "Student Plus",
  pro_student: "Pro Student",
  founding_member: "Founding Member",
  institution_admin: "Institution",
  institution_student: "Institution",
  administrator: "Administrator"
};

export const plans: Record<
  PlanKey,
  {
    name: string;
    price: string;
    description: string;
    highlights: string[];
  }
> = {
  explorer: {
    name: "Explorer",
    price: "Free",
    description: "Perfect for students exploring healthcare careers.",
    highlights: [
      "Limited Career Explorer",
      "10 Atlas conversations per month",
      "5 Atlas practice questions per day",
      "Daily motivation"
    ]
  },
  student_plus: {
    name: "Student Plus",
    price: "$14.99/mo",
    description: "Full study, clinical, resume, and interview support.",
    highlights: [
      "Unlimited Atlas and practice",
      "Personalized study plans",
      "Clinical preparation",
      "Resume Builder and Interview Coach"
    ]
  },
  pro_student: {
    name: "Pro Student",
    price: "$29.99/mo",
    description: "Advanced adaptive learning and career acceleration.",
    highlights: [
      "Adaptive daily lessons",
      "Mock certification exams",
      "Advanced analytics",
      "Priority Atlas responses"
    ]
  },
  founding_member: {
    name: "Founding Member",
    price: "$9.99/mo",
    description: "Lifetime early adopter pricing for the first MedPath members.",
    highlights: [
      "Student Plus access",
      "Founding Member badge",
      "Locked-in monthly price",
      "Early product influence"
    ]
  },
  institution_admin: {
    name: "Institution",
    price: "Custom",
    description: "School and program licensing with instructor controls.",
    highlights: ["Instructor dashboard", "Roster management", "Assignments", "Analytics"]
  },
  institution_student: {
    name: "Institution Student",
    price: "Included",
    description: "Student access managed by a school or training program.",
    highlights: ["Assigned lessons", "Progress tracking", "Classroom tools", "Atlas support"]
  },
  administrator: {
    name: "Administrator",
    price: "Internal",
    description: "Internal MedPath operations and subscription management.",
    highlights: ["User management", "Revenue analytics", "Subscription controls", "Account safety"]
  }
};

export function canAccess(plan: PlanKey, feature: FeatureKey) {
  return planAccess[plan].includes(feature);
}

export type StudentProgress = {
  userId: string;
  program: string;
  certificationGoal: string;
  examDate: string;
  weeklyProgress: number;
  pathProgress: number;
  streakDays: number;
  xp: number;
  level: string;
  nextMilestone: string;
  recommendedTopic: string;
  upcomingGoals: Array<{
    id: string;
    title: string;
    due: string;
    minutes: number;
    status: "ready" | "in_progress" | "scheduled";
  }>;
  recentActivity: Array<{
    id: string;
    title: string;
    detail: string;
    time: string;
    score?: number;
  }>;
  learningModules: Array<{
    id: string;
    title: string;
    category: "Quiz" | "Flashcards" | "Practice Exam" | "Atlas Tutor";
    progress: number;
    status: string;
  }>;
};

export const studentProgressSeed: StudentProgress = {
  userId: "",
  program: "",
  certificationGoal: "Certification readiness",
  examDate: "2026-08-14",
  weeklyProgress: 64,
  pathProgress: 52,
  streakDays: 14,
  xp: 2480,
  level: "Clinician in Training",
  nextMilestone: "Certification",
  recommendedTopic: "Instrumentation and sterile field maintenance",
  upcomingGoals: [
    {
      id: "goal-sterile-technique",
      title: "Review sterile technique scenarios",
      due: "Today",
      minutes: 25,
      status: "ready"
    },
    {
      id: "goal-vitals",
      title: "Complete vital signs flashcards",
      due: "Tomorrow",
      minutes: 15,
      status: "scheduled"
    },
    {
      id: "goal-practice-exam",
      title: "Take a 30-question readiness check",
      due: "Friday",
      minutes: 45,
      status: "in_progress"
    }
  ],
  recentActivity: [
    {
      id: "activity-sterile-quiz",
      title: "Sterile technique quiz",
      detail: "Completed with focused improvement on contamination rules.",
      time: "Today",
      score: 88
    },
    {
      id: "activity-atlas",
      title: "Atlas study session",
      detail: "Reviewed test anxiety plan and next-step study rhythm.",
      time: "Yesterday"
    },
    {
      id: "activity-badge",
      title: "Clinical Ready badge",
      detail: "Earned after finishing patient interaction checklist.",
      time: "2 days ago"
    }
  ],
  learningModules: [
    {
      id: "module-quiz",
      title: "Medical terminology quiz",
      category: "Quiz",
      progress: 72,
      status: "Continue"
    },
    {
      id: "module-flashcards",
      title: "Vital signs flashcards",
      category: "Flashcards",
      progress: 46,
      status: "Review"
    },
    {
      id: "module-practice-exam",
      title: "Certification practice exam",
      category: "Practice Exam",
      progress: 18,
      status: "Start"
    },
    {
      id: "module-atlas",
      title: "Ask Atlas about weak spots",
      category: "Atlas Tutor",
      progress: 100,
      status: "Open"
    }
  ]
};

export type CareerPath = {
  title: string;
  icon: string;
  salary: string;
  education: string;
  certification: string;
  outlook: string;
  responsibilities: string;
  skills: string;
  advancement: string;
  trainingLength?: string;
  workSetting?: string;
  bestFor?: string;
};

export const careers: CareerPath[] = [
  {
    title: "Medical Assistant",
    icon: "MA",
    salary: "$46k median",
    education: "Certificate or diploma",
    certification: "CMA, RMA, CCMA, or NCMA",
    outlook: "Strong outpatient growth",
    responsibilities: "Patient intake, vitals, EHR, injections, scheduling, and clinical support.",
    skills: "Communication, accuracy, patient care",
    advancement: "Lead MA, clinic manager, nursing pathway"
  },
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
  },
  {
    title: "Respiratory Therapist",
    icon: "RT",
    salary: "$82k median",
    education: "Associate degree",
    certification: "CRT or RRT",
    outlook: "Growing cardiopulmonary need",
    responsibilities: "Assess breathing, manage oxygen therapy, and support ventilators.",
    skills: "Critical thinking, physiology",
    advancement: "Critical care, pulmonary rehab, leadership"
  },
  {
    title: "Radiologic Technologist",
    icon: "XR",
    salary: "$81k median",
    education: "Associate degree",
    certification: "ARRT",
    outlook: "Strong imaging demand",
    responsibilities: "Capture diagnostic images while protecting patient safety.",
    skills: "Positioning, radiation safety",
    advancement: "CT, MRI, mammography, management"
  },
  {
    title: "Dental Assistant",
    icon: "DA",
    salary: "$48k median",
    education: "Certificate or employer training",
    certification: "CDA varies by state",
    outlook: "Steady dental practice demand",
    responsibilities: "Chairside assisting, sterilization, radiographs, and patient education.",
    skills: "Organization, communication",
    advancement: "Expanded functions, hygienist pathway"
  },
  {
    title: "Occupational Therapy Assistant",
    icon: "OTA",
    salary: "$71k median",
    education: "Associate degree",
    certification: "NBCOT COTA",
    outlook: "Strong rehab demand",
    responsibilities: "Help patients develop daily living and workplace skills.",
    skills: "Creativity, coaching, empathy",
    advancement: "OT pathway, specialty practice"
  },
  {
    title: "Physical Therapist Assistant",
    icon: "PTA",
    salary: "$69k median",
    education: "Associate degree",
    certification: "State licensure",
    outlook: "Strong rehab demand",
    responsibilities: "Carry out treatment plans, mobility exercises, and patient education.",
    skills: "Body mechanics, encouragement",
    advancement: "PT pathway, clinic leadership"
  },
  {
    title: "Licensed Practical Nurse",
    icon: "LPN",
    salary: "$64k median",
    education: "Practical nursing program",
    certification: "NCLEX-PN",
    outlook: "Broad care setting demand",
    responsibilities: "Medication administration, wound care, vitals, and patient monitoring.",
    skills: "Clinical judgment, compassion",
    advancement: "RN bridge, specialty care"
  },
  {
    title: "Registered Nurse",
    icon: "RN",
    salary: "$98k median",
    education: "ADN or BSN",
    certification: "NCLEX-RN",
    outlook: "High demand across care settings",
    responsibilities: "Assess patients, coordinate care, educate families, and advocate.",
    skills: "Judgment, leadership, communication",
    advancement: "Advanced practice, educator, management"
  },
  {
    title: "Emergency Medical Technician",
    icon: "EMT",
    salary: "$47k median",
    education: "EMT program",
    certification: "NREMT and state credential",
    outlook: "Ongoing emergency response need",
    responsibilities: "Respond to emergencies, assess patients, and provide prehospital care.",
    skills: "Calm under pressure, rapid assessment",
    advancement: "Paramedic, fire service, emergency nursing"
  },
  {
    title: "Certified Nursing Assistant",
    icon: "CNA",
    salary: "$42k median",
    education: "State-approved nursing assistant program",
    certification: "State CNA competency exam",
    outlook: "Ongoing long-term care demand",
    responsibilities: "Assist with daily living, mobility, vital signs, comfort, and care-team reporting.",
    skills: "Compassion, observation, safe transfers",
    advancement: "Medication aide, LPN, RN pathway",
    trainingLength: "4–12 weeks",
    workSetting: "Nursing homes, hospitals, home care",
    bestFor: "Hands-on caregivers who enjoy close patient interaction"
  },
  {
    title: "Patient Care Technician",
    icon: "PCT",
    salary: "$42k median",
    education: "Certificate program or employer training",
    certification: "CPCT/A or state-specific credential",
    outlook: "Steady hospital support demand",
    responsibilities: "Support bedside care, collect specimens, perform EKGs, check vitals, and assist mobility.",
    skills: "Bedside care, teamwork, time management",
    advancement: "Nursing, dialysis, emergency department tech",
    trainingLength: "3–9 months",
    workSetting: "Hospitals, clinics, dialysis centers",
    bestFor: "Students who want broad bedside experience"
  },
  {
    title: "Pharmacy Technician",
    icon: "RX",
    salary: "$46k median",
    education: "Certificate, employer training, or associate pathway",
    certification: "CPhT through PTCB or NHA; rules vary by state",
    outlook: "Consistent retail and health-system demand",
    responsibilities: "Prepare prescriptions, manage inventory, process claims, and support medication safety.",
    skills: "Accuracy, calculations, customer service",
    advancement: "Lead technician, sterile compounding, pharmacy school",
    trainingLength: "4–12 months",
    workSetting: "Retail, hospitals, mail-order pharmacies",
    bestFor: "Detail-focused learners interested in medications"
  },
  {
    title: "Diagnostic Medical Sonographer",
    icon: "US",
    salary: "$97k median",
    education: "Associate degree or accredited certificate",
    certification: "ARDMS, ARRT(S), or CCI",
    outlook: "Strong diagnostic imaging growth",
    responsibilities: "Use ultrasound equipment to capture images and help physicians evaluate organs, blood flow, and pregnancy.",
    skills: "Anatomy, patient positioning, image analysis",
    advancement: "Cardiac, vascular, OB/GYN, lead sonographer",
    trainingLength: "18–24 months",
    workSetting: "Hospitals, imaging centers, physician offices",
    bestFor: "Visual thinkers who enjoy technology and patient care"
  },
  {
    title: "Medical Laboratory Technician",
    icon: "MLT",
    salary: "$63k median",
    education: "Associate degree in medical laboratory technology",
    certification: "ASCP MLT or AMT MLT",
    outlook: "Reliable diagnostic laboratory demand",
    responsibilities: "Analyze blood, tissue, and body-fluid specimens and validate results used in diagnosis.",
    skills: "Laboratory technique, precision, troubleshooting",
    advancement: "Medical laboratory scientist, specialist, lab management",
    trainingLength: "About 2 years",
    workSetting: "Hospital, reference, and public-health labs",
    bestFor: "Analytical students who prefer science-focused work"
  },
  {
    title: "Health Information Technician",
    icon: "HIT",
    salary: "$51k median",
    education: "Certificate or associate degree",
    certification: "RHIT, CCS, or CCA depending on role",
    outlook: "Growing digital health data needs",
    responsibilities: "Maintain accurate health records, code diagnoses, protect privacy, and support data quality.",
    skills: "Organization, coding, privacy, data accuracy",
    advancement: "Coding specialist, health informatics, revenue cycle leadership",
    trainingLength: "9–24 months",
    workSetting: "Hospitals, insurers, clinics, remote teams",
    bestFor: "Detail-oriented learners who like healthcare and technology"
  },
  {
    title: "Cardiovascular Technologist",
    icon: "CVT",
    salary: "$74k median",
    education: "Associate degree or accredited certificate",
    certification: "CCI or ARDMS credential by specialty",
    outlook: "Growing cardiac diagnostic need",
    responsibilities: "Perform EKG, stress, vascular, or cardiac imaging studies and assist with procedures.",
    skills: "Cardiac anatomy, equipment operation, calm communication",
    advancement: "Echocardiography, vascular specialty, cath lab leadership",
    trainingLength: "18–24 months",
    workSetting: "Hospitals, cardiology offices, diagnostic labs",
    bestFor: "Tech-minded students fascinated by heart health"
  },
  {
    title: "Dialysis Technician",
    icon: "DT",
    salary: "$50k median",
    education: "Certificate program or employer training",
    certification: "CCHT, CHT, or CCNT after eligibility requirements",
    outlook: "Steady kidney-care demand",
    responsibilities: "Prepare dialysis equipment, monitor treatments, document vitals, and support patients with kidney disease.",
    skills: "Equipment safety, observation, patient support",
    advancement: "Senior technician, biomedical equipment, nursing",
    trainingLength: "3–12 months",
    workSetting: "Dialysis centers, hospitals, home programs",
    bestFor: "Consistent caregivers who value ongoing patient relationships"
  },
  {
    title: "Medical Coder",
    icon: "MC",
    salary: "$51k median",
    education: "Certificate or associate degree",
    certification: "CPC, CCS, or CCA",
    outlook: "Stable reimbursement and compliance demand",
    responsibilities: "Translate clinical documentation into standardized diagnosis and procedure codes for billing and reporting.",
    skills: "Medical terminology, analysis, accuracy",
    advancement: "Auditor, compliance specialist, revenue cycle manager",
    trainingLength: "6–18 months",
    workSetting: "Hospitals, clinics, insurers, remote offices",
    bestFor: "Independent, detail-focused learners"
  },
  {
    title: "Community Health Worker",
    icon: "CHW",
    salary: "$52k median",
    education: "Certificate, community program, or employer training",
    certification: "State credential where required",
    outlook: "Growing community-care coordination need",
    responsibilities: "Connect people with care, explain health information, address barriers, and advocate for community needs.",
    skills: "Trust building, cultural awareness, resource navigation",
    advancement: "Care coordinator, public health, social services leadership",
    trainingLength: "Weeks to 1 year",
    workSetting: "Community organizations, clinics, public-health agencies",
    bestFor: "Relationship builders passionate about health equity"
  }
];

export const subscriptionEvents = [
  { date: "Jul 9, 2026", event: "Student Plus trial started", status: "Active", amount: "$0.00" },
  { date: "Jul 16, 2026", event: "Renewal scheduled", status: "Upcoming", amount: "$14.99" },
  { date: "Jun 28, 2026", event: "Invoice downloaded", status: "Paid", amount: "$14.99" }
];

export const users: Array<{
  name: string;
  email: string;
  role: PlanKey;
  status: string;
}> = [
  { name: "Maya Johnson", email: "maya@example.com", role: "student_plus", status: "Active" },
  { name: "Luis Ramirez", email: "luis@example.com", role: "pro_student", status: "Active" },
  { name: "Ari Chen", email: "ari@example.com", role: "explorer", status: "Trial ending" },
  { name: "North Valley College", email: "admin@nvc.edu", role: "institution_admin", status: "Active" },
  { name: "Operations Admin", email: "Medpath.space@gmail.com", role: "administrator", status: "Internal" }
];
