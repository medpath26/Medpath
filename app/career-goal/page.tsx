import Link from "next/link";
import { careers } from "@/lib/medpath-data";
import { healthcarePathways } from "@/lib/healthcare-pathways";

const pathwayActions: Record<string, string[]> = {
  "Certified Nursing Assistant": [
    "Find your state's approved nurse aide training programs and compare class schedules and costs.",
    "Complete the required nurse aide classroom and supervised skills training.",
    "Register for the state nurse aide competency evaluation, including written or oral and skills portions as required.",
    "Complete background checks and apply to the state nurse aide registry as required."
  ],
  "Dental Assistant": [
    "Check your state's dental assisting scope, registration, radiography, and expanded-functions rules.",
    "Choose an appropriate dental assisting program or approved employer-based training route.",
    "Complete required chairside, infection-control, and radiography training before performing regulated duties.",
    "Check DANB CDA eligibility and any state-specific examinations or credentials."
  ],
  "Diagnostic Medical Sonographer": [
    "Compare CAAHEP-accredited diagnostic medical sonography programs and clinical placement arrangements.",
    "Complete required anatomy, patient care, ultrasound physics, and specialty scanning coursework.",
    "Finish documented supervised clinical scanning competencies in your chosen specialty.",
    "Review ARDMS SPI and specialty exam prerequisites or ARRT sonography eligibility."
  ],
  "Doctor of Medicine (MD)": [
    "Complete a bachelor's degree and the prerequisite science coursework required by target medical schools.",
    "Prepare for the MCAT and apply to medical schools through the applicable application service.",
    "Complete medical school preclinical coursework and required supervised clinical clerkships.",
    "Prepare for USMLE examinations and apply to residency through the relevant matching process."
  ],
  "Doctor of Osteopathic Medicine (DO)": [
    "Complete undergraduate prerequisites and prepare for the MCAT.",
    "Apply to accredited osteopathic medical schools through AACOMAS.",
    "Complete osteopathic medical school coursework, OMM training, and clinical rotations.",
    "Prepare for COMLEX-USA examinations and apply for residency training."
  ],
  "EKG Technician": [
    "Check local employers' training and certification preferences for ECG technicians.",
    "Complete ECG anatomy, lead placement, rhythm recognition, patient preparation, and safety training.",
    "Practice accurate 12-lead acquisition and artifact troubleshooting in supervised training.",
    "Review NHA CET or NCCT NCET eligibility and arrange any required documented ECG experience."
  ],
  "Emergency Medical Technician": [
    "Locate a state-approved EMT course and confirm its entry requirements.",
    "Complete the required EMT classroom, skills-lab, and clinical or field components.",
    "Demonstrate airway, assessment, CPR/AED, trauma, and medical emergency competencies.",
    "Complete the applicable National Registry or state examination process and apply for state EMS licensure."
  ],
  "Medical Assistant": [
    "Compare medical assisting certificate or diploma programs and employer training expectations.",
    "Complete patient intake, vital signs, specimen collection, EKG, medication safety, and administrative coursework.",
    "Complete any required externship or supervised competencies and retain completion records.",
    "Compare NHA CCMA, AAMA CMA, AMT RMA, and NCCT NCMA eligibility before selecting an exam."
  ],
  "Medical Billing and Coding": [
    "Choose a medical billing and coding program that teaches ICD-10-CM, CPT, HCPCS, payer rules, and compliance.",
    "Practice coding documented encounters and checking claims for medical necessity and errors.",
    "Build experience with claim forms, denials, privacy, and revenue-cycle workflows.",
    "Compare AAPC CPC, AHIMA CCA/CCS, and NHA CBCS prerequisites and exam outlines."
  ],
  "Nurse Practitioner (NP)": [
    "Earn an RN license and confirm the nursing experience and prerequisites required by target graduate programs.",
    "Apply to an appropriately accredited NP graduate program in the desired population focus.",
    "Complete advanced assessment, pharmacology, pathophysiology, and supervised clinical hours.",
    "Choose the population-matched national certification exam and apply for state APRN authorization."
  ],
  "Patient Care Technician": [
    "Review local PCT job descriptions and any state requirements for patient-care tasks.",
    "Complete approved training in vital signs, infection control, transfers, phlebotomy, and ECG as applicable.",
    "Practice supervised patient care, documentation, and safety competencies.",
    "Check NHA CPCT/A or NCCT NCPCT eligibility and employer preferences."
  ],
  "Pharmacy Technician": [
    "Check your state board of pharmacy's registration, training, and supervision rules.",
    "Complete pharmacy calculations, prescription processing, medication safety, inventory, and law training.",
    "Document any required work experience or recognized training program completion.",
    "Compare PTCB PTCE and NHA ExCPT eligibility and apply for the credential your employers prefer."
  ],
  "Phlebotomy Technician": [
    "Choose phlebotomy training that covers infection control, order of draw, specimen labeling, and patient identification.",
    "Complete supervised venipuncture and capillary collection practice and retain required procedure logs.",
    "Learn specimen transport, quality control, difficult-draw precautions, and sharps safety.",
    "Compare NHA CPT, ASCP PBT, AMT RPT, and NCCT NCPT requirements before applying."
  ],
  "Physician Assistant / Associate (PA)": [
    "Complete a bachelor's degree, PA program prerequisites, and any required patient-care experience.",
    "Apply to an accredited PA program through CASPA or the program's required process.",
    "Complete didactic medical sciences and supervised clinical rotations.",
    "Graduate from an accredited PA program, take the NCCPA PANCE, and apply for state PA licensure."
  ],
  "Radiologic Technologist": [
    "Find a JRCERT-accredited or otherwise ARRT-eligible radiography program and confirm admissions prerequisites.",
    "Complete radiation physics, positioning, patient care, and radiation-protection coursework.",
    "Document supervised clinical radiographic procedures and competency requirements.",
    "Check ARRT Radiography eligibility and state licensing requirements before applying."
  ],
  "Registered Nurse (RN)": [
    "Choose an approved ADN or BSN nursing program and complete required prerequisites.",
    "Complete nursing coursework, skills labs, and supervised clinical rotations.",
    "Apply to the state board of nursing for exam eligibility and complete any required background screening.",
    "Register for the NCLEX-RN and complete state licensure requirements after passing."
  ],
  "Sterile Processing Technician": [
    "Compare sterile processing training and hospital department entry requirements.",
    "Learn decontamination, inspection, assembly, packaging, sterilization monitoring, and sterile storage.",
    "Complete any required documented hands-on experience for your chosen credential.",
    "Compare HSPA CRCST and CBSPD CSPDT requirements and arrange exam registration when eligible."
  ],
  "Surgeon (MD/DO Specialty)": [
    "Complete medical school prerequisites and admission to an accredited MD or DO program.",
    "Graduate from medical school and meet licensing exam requirements.",
    "Apply to and complete the appropriate surgical residency, including supervised operative experience.",
    "Meet specialty board eligibility criteria and complete required examinations and ongoing certification requirements."
  ],
  "Surgical Technologist": [
    "Find surgical technology programs accredited by CAAHEP or ABHES and compare clinical placements.",
    "Complete school prerequisites and apply to a program that meets your intended credential's eligibility requirements.",
    "Finish operating-room asepsis, instrumentation, surgical procedures, counts, and supervised clinical case training.",
    "Compare NBSTSA CST and NCCT TS-C eligibility pathways and gather the required school or experience records."
  ]
};

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default async function CareerGoalPage({ searchParams }: { searchParams: Promise<{ goal?: string }> }) {
  const { goal = "" } = await searchParams;
  const pathway = healthcarePathways.find(p => p.label.toLowerCase() === goal.trim().toLowerCase() || p.id === goal.trim().toLowerCase());
  const title = pathway?.label || careers.find(c => c.title.toLowerCase() === goal.trim().toLowerCase())?.title;
  const career = careers.find(c => c.title === title);
  const specificActions = title ? pathwayActions[title] ?? [] : [];
  const steps = title ? [
    ["Check your state's requirements", `Find the official licensing or credentialing authority for ${title} in your state. Write down any required age, education, training, examination, registration, and background-check requirements.`],
    ["Research approved programs", specificActions[0] ?? `Compare recognized training routes for ${title} and verify the program's approval or accreditation status.`],
    ["Prepare your application", "Request transcripts, check prerequisite courses, note application deadlines, and compare tuition, financial aid, transportation, and clinical placement costs."],
    ["Complete your foundational training", specificActions[1] ?? "Complete the required classroom and laboratory training for this profession."],
    ["Document practical competencies", specificActions[2] ?? "Complete and document any required supervised clinical or practical competencies."],
    ["Select the correct credential route", specificActions[3] ?? (career?.certification ? `Review the official eligibility rules for ${career.certification}.` : "Check the current official certification or licensing eligibility criteria.")],
    ["Prepare for the exam", "Download the current official exam content outline, make a study schedule, and practice relevant knowledge and skills. Do not rely on unofficial practice questions alone."],
    ["Submit credential applications", "Collect your program completion verification, transcripts, clinical records, identity documents, and fees. Apply only when you meet the credentialing body's requirements."],
    ["Apply for entry-level positions", `Search employers hiring ${title} professionals, tailor your résumé to actual qualifications, gather references, and prepare for interviews.`],
    ["Maintain your credential", "Check renewal dates, continuing education, employer competency assessments, and any state registration requirements."]
  ] : [];
  return <main style={{maxWidth:900,margin:"0 auto",padding:"42px 22px",fontFamily:"Arial,sans-serif",lineHeight:1.65,color:"#102d52"}}>
    <Link href="/?view=practice" style={{color:"#127c93",fontWeight:700}}>← Back to PathPrep</Link>
    <p style={{marginTop:28,fontWeight:700,color:"#159fa7"}}>MEDPATH · CAREER GOAL PATHWAY</p>
    <h1 style={{fontSize:"clamp(2rem,5vw,3rem)",marginBottom:8}}>{title || "Choose a career goal"}</h1>
    {title ? <>
      <p>Your informational roadmap from exploring this profession to preparing for employment.</p>
      <h2 style={{marginTop:30,color:"#102d52"}}>Steps toward your career goal</h2>
      <ol style={{paddingLeft:26}}>
        {steps.map(([heading,body]) => <li key={heading} style={{padding:"12px 10px",marginBottom:12,background:"linear-gradient(100deg,#effafb,#f4f8fc)",border:"1px solid #c7e7ea",borderLeft:"5px solid #159fa7",borderRadius:12}}>
          <strong>{heading}</strong><p style={{margin:"5px 0"}}>{body}</p>
        </li>)}
      </ol>
      <p>These are informational steps, not an interactive completion checklist. Requirements and sequences vary by state, employer, and credential. Confirm them with official licensing boards and training programs.</p>
      <Link href={`/careers/${pathway?.id || slug(title)}`}>Explore detailed career information →</Link>
    </> : <p>Open Careers from your MedPath account to view the pathway associated with your selected career goal.</p>}
  </main>;
}
