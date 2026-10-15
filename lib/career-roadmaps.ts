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
  },
  {
    title: "Sterile Processing Technician",
    steps: [
      { heading: "Prepare and train", detail: "Complete an employer-approved or formal sterile processing training route." },
      { heading: "Develop clinical skills", detail: "Build decontamination, assembly, sterilization, and infection-prevention skills." },
      { heading: "Meet credential requirements", detail: "Meet applicable CRCST or CSPDT certification requirements, including experience requirements." },
      { heading: "Advance your career", detail: "Explore lead technician, educator, or sterile processing management roles." }
    ],
    specialties: ["Instrument specialist","Lead sterile processing technician","Educator"]
  },
  {
    title: "Phlebotomy Technician",
    steps: [
      { heading: "Prepare and train", detail: "Complete an appropriate phlebotomy training program and supervised venipuncture practice." },
      { heading: "Develop clinical skills", detail: "Check state rules and employer expectations for clinical experience and certification." },
      { heading: "Meet credential requirements", detail: "Qualify for an applicable national certification such as CPT where required." },
      { heading: "Advance your career", detail: "Explore specimen processing, laboratory support, or separately qualified clinical roles." }
    ],
    specialties: ["Hospital phlebotomy","Mobile phlebotomy","Laboratory specimen processing"]
  },
  {
    title: "Patient Care Technician",
    steps: [
      { heading: "Prepare and train", detail: "Complete employer-accepted patient care technician education or clinical training." },
      { heading: "Develop clinical skills", detail: "Develop safe bedside care, vital signs, specimen collection, and EKG skills where permitted." },
      { heading: "Meet credential requirements", detail: "Check employer and state requirements; consider CPCT/A if appropriate." },
      { heading: "Advance your career", detail: "Explore dialysis, emergency department support, or a separate nursing education route." }
    ],
    specialties: ["Hospital patient care","Dialysis technician","Emergency department technician"]
  },
  {
    title: "EKG Technician",
    steps: [
      { heading: "Prepare and train", detail: "Complete an EKG or cardiovascular technician training pathway accepted by employers." },
      { heading: "Develop clinical skills", detail: "Practice accurate 12-lead ECG placement, rhythm recording, and patient preparation." },
      { heading: "Meet credential requirements", detail: "Check certification eligibility, including practical experience requirements where applicable." },
      { heading: "Advance your career", detail: "Explore telemetry, ambulatory monitoring, or broader cardiovascular technology education." }
    ],
    specialties: ["Telemetry monitoring","Holter monitoring","Cardiology clinic"]
  },
  {
    title: "Certified Nursing Assistant",
    steps: [
      { heading: "Prepare and train", detail: "Enroll in a state-approved nurse aide training program." },
      { heading: "Develop clinical skills", detail: "Complete required supervised clinical practice and competency evaluation." },
      { heading: "Meet credential requirements", detail: "Obtain placement on the state nurse aide registry or required state credential." },
      { heading: "Advance your career", detail: "Gain experience and, if desired, pursue separate LPN or RN education." }
    ],
    specialties: ["Long-term care","Hospital nursing assistant","Home health"]
  },
  {
    title: "Pharmacy Technician",
    steps: [
      { heading: "Prepare and train", detail: "Complete a pharmacy technician training route or qualifying employer training." },
      { heading: "Develop clinical skills", detail: "Learn medication safety, pharmacy calculations, inventory, and prescription workflows." },
      { heading: "Meet credential requirements", detail: "Meet state registration/licensing rules and consider PTCB or NHA certification where applicable." },
      { heading: "Advance your career", detail: "Explore hospital pharmacy, sterile compounding, or pharmacy operations leadership." }
    ],
    specialties: ["Hospital pharmacy","Sterile compounding","Medication reconciliation"]
  },
  {
    title: "Medical Billing and Coding",
    steps: [
      { heading: "Prepare and train", detail: "Study medical terminology, anatomy, ICD-10-CM, CPT, HCPCS, and reimbursement workflows." },
      { heading: "Develop clinical skills", detail: "Complete a suitable coding/billing certificate or employer-accepted preparation." },
      { heading: "Meet credential requirements", detail: "Choose an appropriate credential path such as CPC or CCA/CCS and meet exam eligibility." },
      { heading: "Advance your career", detail: "Build experience in claims, audits, revenue cycle, or coding specialties." }
    ],
    specialties: ["Outpatient coding","Inpatient coding","Revenue cycle management"]
  },
  {
    title: "Emergency Medical Technician",
    steps: [
      { heading: "Prepare and train", detail: "Complete a state-approved EMT education program with practical skills training." },
      { heading: "Develop clinical skills", detail: "Pass applicable National Registry or state examinations and meet state certification requirements." },
      { heading: "Meet credential requirements", detail: "Gain supervised field experience with EMS systems and protocols." },
      { heading: "Advance your career", detail: "Explore advanced EMT, paramedic, or other separately credentialed emergency-care pathways." }
    ],
    specialties: ["Ambulance EMS","Emergency response","Paramedic pathway"]
  },
  {
    title: "Dental Assistant",
    steps: [
      { heading: "Prepare and train", detail: "Review state-specific dental assistant and radiography requirements." },
      { heading: "Develop clinical skills", detail: "Complete accepted training or employer-based preparation and supervised chairside experience." },
      { heading: "Meet credential requirements", detail: "Earn required state credentials and consider DANB CDA where relevant." },
      { heading: "Advance your career", detail: "Explore expanded functions, dental office leadership, or separate dental hygiene education." }
    ],
    specialties: ["Orthodontic assisting","Oral surgery assisting","Expanded functions"]
  },
  {
    title: "Radiologic Technologist",
    steps: [
      { heading: "Prepare and train", detail: "Complete an appropriate accredited radiography education program and clinical rotations." },
      { heading: "Develop clinical skills", detail: "Meet ARRT certification eligibility and pass required examinations." },
      { heading: "Meet credential requirements", detail: "Obtain state radiologic technologist licensure where required." },
      { heading: "Advance your career", detail: "Pursue modality-specific education, clinical experience, and credentials as applicable." }
    ],
    specialties: ["CT imaging","MRI imaging","Mammography"]
  },
  {
    title: "Diagnostic Medical Sonographer",
    steps: [
      { heading: "Prepare and train", detail: "Complete an appropriate accredited sonography program or qualifying certificate route." },
      { heading: "Develop clinical skills", detail: "Develop supervised scanning and patient-care skills in a clinical setting." },
      { heading: "Meet credential requirements", detail: "Meet ARDMS, ARRT(S), or CCI credential eligibility requirements for the chosen specialty." },
      { heading: "Advance your career", detail: "Advance into specialized sonography, teaching, or laboratory leadership." }
    ],
    specialties: ["Abdominal sonography","Obstetric and gynecologic sonography","Cardiac sonography"]
  }
];
