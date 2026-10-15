/** Educational career roadmaps; not a substitute for program admissions or state licensing rules. */
export type CareerRoadmap = {
  title: string;
  steps: { heading: string; detail: string }[];
  specialties: string[];
};
export const careerRoadmaps: CareerRoadmap[] = [
  {
    title: "Doctor of Medicine (MD)",
    steps: [
      { heading: "Undergraduate and prerequisites", detail: "Complete a bachelor's degree and each target medical school's required courses; gain clinical exposure and service experience." },
      { heading: "Apply to medical school", detail: "Prepare for the MCAT and apply through AMCAS or applicable school application systems." },
      { heading: "Earn the MD", detail: "Complete four years of medical school, foundational sciences, clinical clerkships, and required USMLE exams." },
      { heading: "Complete residency", detail: "Match into an accredited residency in your chosen specialty, including surgery if desired." },
      { heading: "Licensure and practice", detail: "Meet state physician licensing requirements; pursue specialty board certification and optional fellowship." }
    ],
    specialties: ["General surgery", "Internal medicine", "Pediatrics", "Emergency medicine", "Psychiatry"]
  },
  {
    title: "Doctor of Osteopathic Medicine (DO)",
    steps: [
      { heading: "Undergraduate and prerequisites", detail: "Complete a bachelor's degree, school-specific prerequisites, and meaningful clinical experience." },
      { heading: "Apply to osteopathic medical school", detail: "Prepare for the MCAT and apply through AACOMAS or applicable programs." },
      { heading: "Earn the DO", detail: "Complete four years of osteopathic medical education, including osteopathic principles and manipulative medicine." },
      { heading: "Complete residency", detail: "Pursue residency in your specialty of choice, including surgical specialties; complete required licensing examinations." },
      { heading: "Licensure and practice", detail: "Meet state physician licensing requirements, pursue board certification, and consider fellowship training." }
    ],
    specialties: ["General surgery", "Family medicine", "Orthopedic surgery", "Emergency medicine", "Internal medicine"]
  },
  {
    title: "Surgeon (MD/DO Specialty)",
    steps: [
      { heading: "Prepare for medical school", detail: "Complete undergraduate prerequisites, clinical experiences, and medical school admissions requirements." },
      { heading: "Earn an MD or DO", detail: "Complete medical school and required licensing examinations; explore surgical specialties during clerkships." },
      { heading: "Match into surgical residency", detail: "Apply to an accredited surgical residency; length depends on specialty and training structure." },
      { heading: "Develop surgical expertise", detail: "Complete supervised operative training, perioperative patient care, and specialty requirements." },
      { heading: "Licensure and board certification", detail: "Meet physician licensure requirements and surgical board eligibility; optional fellowship provides subspecialty training." }
    ],
    specialties: ["General surgery", "Neurosurgery", "Orthopedic surgery", "Cardiothoracic surgery", "Plastic surgery"]
  },
  {
    title: "Physician Assistant / Associate (PA)",
    steps: [
      { heading: "Undergraduate preparation", detail: "Complete bachelor's degree and program-specific prerequisites, often including patient-care experience." },
      { heading: "Accredited PA program", detail: "Complete an ARC-PA-accredited PA program with didactic and supervised clinical training." },
      { heading: "Certification and license", detail: "Pass the PANCE and meet state licensure requirements." },
      { heading: "Choose practice setting", detail: "Practice within applicable state laws and employer requirements, including medical or surgical specialties." }
    ],
    specialties: ["Surgical PA", "Emergency medicine", "Primary care", "Orthopedics", "Dermatology"]
  },
  {
    title: "Nurse Practitioner (NP)",
    steps: [
      { heading: "Become a registered nurse", detail: "Complete an approved nursing program, pass NCLEX-RN, and obtain RN licensure." },
      { heading: "Select an NP population focus", detail: "Choose an accredited graduate NP program aligned with your intended patient population and role." },
      { heading: "Graduate clinical education", detail: "Complete required advanced coursework and supervised clinical hours in an MSN or DNP program." },
      { heading: "Certification and authorization", detail: "Obtain population-focus national certification and meet state APRN/NP practice requirements." }
    ],
    specialties: ["Family NP", "Adult-gerontology acute care NP", "Psychiatric-mental health NP", "Pediatric NP"]
  },
  {
    title: "Medical Assistant",
    steps: [
      { heading: "Prepare for medical assisting", detail: "Complete appropriate training and clinical experience; credential expectations vary by employer and state." },
      { heading: "Start clinical practice", detail: "Develop patient-care, EHR, and clinic workflow skills within your permitted scope." },
      { heading: "Choose an advancement goal", detail: "Explore lead MA roles or separately qualify for nursing, PA, or medical school pathways." }
    ],
    specialties: ["Primary care", "Cardiology clinic", "Dermatology clinic", "Lead medical assistant"]
  },
  {
    title: "Surgical Technologist",
    steps: [
      { heading: "Surgical technology training", detail: "Complete an appropriate surgical technology program and required clinical experience." },
      { heading: "Certification and operating room experience", detail: "Meet applicable credential and employer requirements while developing sterile technique and OR skills." },
      { heading: "Choose an advancement goal", detail: "Explore surgical first assisting where eligible, OR leadership, or a separate MD/DO medical school route." }
    ],
    specialties: ["Cardiovascular OR", "Orthopedic OR", "Neurosurgery OR", "Surgical first assistant"]
  }
];
