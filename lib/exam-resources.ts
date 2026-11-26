/** Starter study categories based on cited public resources, not official blueprints. */
export type ExamResource = { name: string; url: string; topics: readonly string[] };
const resources: Record<string, { pathways: readonly string[]; aliases: readonly string[]; resource: ExamResource }> = {
  tsc: { pathways: ['Surgical Technologist'], aliases: ['ncct ts-c', 'ts-c'], resource: {
    name: 'NCCT TS-C', url: 'https://www.ncctinc.com/Documents/24%20TS-C%20DTP.pdf',
    topics: ['Asepsis and operating-room safety', 'Instruments and surgical procedures', 'Patient positioning and preparation', 'Postoperative tasks and equipment']
  } },
  cst: { pathways: ['Surgical Technologist'], aliases: ['nbstsa cst', 'cst'], resource: {
    name: 'NBSTSA CST', url: 'https://www.nbstsa.org/cst-prepare-for-exam', topics: []
  } },
  ccma: { pathways: ['Medical Assistant'], aliases: ['nha ccma', 'ccma'], resource: {
    name: 'NHA CCMA', url: 'https://info.nhanow.com/hubfs/Test%20Plans/NHA_CCMA_Test_Plan_2022.pdf',
    topics: ['Basic science and medical terminology', 'Anatomy and body systems', 'Clinical care and safety', 'Administrative care, communication, and ethics']
  } },
  nclex: { pathways: ['Registered Nurse (RN)'], aliases: ['nclex-rn'], resource: {
    name: 'NCLEX-RN', url: 'https://www.ncsbn.org/publications/2026-nclex-rn-test-plan', topics: []
  } },
  pance: { pathways: ['Physician Assistant / Associate (PA)'], aliases: ['nccpa pance', 'pance'], resource: {
    name: 'NCCPA PANCE', url: 'https://www.nccpa.net/become-certified/pance-blueprint/', topics: []
  } },
  usmle1: { pathways: ['Doctor of Medicine (MD)'], aliases: ['usmle step 1'], resource: {
    name: 'USMLE Step 1', url: 'https://www.usmle.org/exam-resources/step-1-materials/step-1-content-outline-and-specifications', topics: []
  } },
  usmle2: { pathways: ['Doctor of Medicine (MD)'], aliases: ['usmle step 2 ck'], resource: {
    name: 'USMLE Step 2 CK', url: 'https://www.usmle.org/exam-resources/step-2-ck-materials/step-2-ck-content-outline-specifications', topics: []
  } },
  comlex1: { pathways: ['Doctor of Osteopathic Medicine (DO)'], aliases: ['comlex-usa level 1'], resource: {
    name: 'COMLEX-USA Level 1', url: 'https://www.nbome.org/assessments/comlex-usa/comlex-usa-blueprint/', topics: []
  } },
  comlex2: { pathways: ['Doctor of Osteopathic Medicine (DO)'], aliases: ['comlex-usa level 2-ce'], resource: {
    name: 'COMLEX-USA Level 2-CE', url: 'https://www.nbome.org/assessments/comlex-usa/comlex-usa-blueprint/', topics: []
  } },
  radiography: { pathways: ['Radiologic Technologist'], aliases: ['arrt radiography'], resource: {
    name: 'ARRT Radiography', url: 'https://www.arrt.org/pages/arrt-reference-documents/by-document-type/examination-content-specifications', topics: []
  } },
  sonography: { pathways: ['Diagnostic Medical Sonographer'], aliases: ['ardms spi'], resource: {
    name: 'ARDMS SPI', url: 'https://www.ardms.org/wp-content/uploads/pdf/SPI-Examination-Content-Outline.pdf', topics: []
  } },
  pharmacy: { pathways: ['Pharmacy Technician'], aliases: ['ptcb ptce', 'ptce'], resource: {
    name: 'PTCB PTCE', url: 'https://ptcb.org/wp-content/uploads/2025/07/PTCE-Content-Outline.pdf', topics: []
  } },
  phlebotomy: { pathways: ['Phlebotomy Technician'], aliases: ['nha cpt'], resource: {
    name: 'NHA CPT', url: 'https://info.nhanow.com/hubfs/Test%20Plans/nha-2025-cpt-test-plan.pdf', topics: []
  } },
  nurseAide: { pathways: ['Certified Nursing Assistant'], aliases: ['nnaap (where applicable)'], resource: {
    name: 'NNAAP (where applicable)', url: 'https://www.ncsbn.org/exams/nnaap-and-mace.page', topics: []
  } },
  dental: { pathways: ['Dental Assistant'], aliases: ['danb cda'], resource: {
    name: 'DANB CDA', url: 'https://www.danb.org/exams/exam/cda-exam', topics: []
  } },
  emt: { pathways: ['Emergency Medical Technician'], aliases: ['nremt emt cognitive exam'], resource: {
    name: 'NREMT EMT cognitive exam', url: 'https://nremt.org/Handbooks/EMT/Cognitive-Exam', topics: []
  } },
  ekg: { pathways: ['EKG Technician'], aliases: ['nha cet'], resource: {
    name: 'NHA CET', url: 'https://info.nhanow.com/hubfs/Test%20Plans/nha_2017-cet-test-plan.pdf', topics: []
  } },
  coding: { pathways: ['Medical Billing and Coding'], aliases: ['aapc cpc'], resource: {
    name: 'AAPC CPC', url: 'https://www.aapc.com/certifications/cpc-and-cpb/taking-the-cpc-and-cpb-exams', topics: []
  } },
  nursePractitioner: { pathways: ['Nurse Practitioner (NP)'], aliases: ['ancc fnp-bc'], resource: {
    name: 'ANCC FNP-BC', url: 'https://www.nursingworld.org/our-certifications/family-nurse-practitioner/', topics: []
  } },
  patientCare: { pathways: ['Patient Care Technician'], aliases: ['nha cpct/a'], resource: {
    name: 'NHA CPCT/A', url: 'https://info.nhanow.com/hubfs/Products/Certified%20Patient%20Care%20Technician%20%28CPCT%29/Test%20Plan/2025/NHA%202025%20CPCT%20Test%20Plan.pdf', topics: []
  } },
  crcst: { pathways: ['Sterile Processing Technician'], aliases: ['hspa crcst', 'crcst'], resource: {
    name: 'HSPA CRCST', url: 'https://myhspa.org/certification/certification-overview/certified-registered-central-service-technician-crcst/',
    topics: ['Cleaning and decontamination', 'Preparing and packaging items', 'Sterilization and storage', 'Equipment, inventory, and professional practice']
  } }
};
export function getExamResource(pathway: string, examName: string): ExamResource | null {
  const path = pathway.trim().toLowerCase();
  const exam = examName.trim().toLowerCase().replace(/\s+/g, ' ');
  return Object.values(resources).find(item => item.pathways.some(p => p.toLowerCase() === path) && item.aliases.includes(exam))?.resource ?? null;
}

export function examOptionsForPathway(pathway: string): string[] {
  const path = pathway.trim().toLowerCase();
  return Object.values(resources).filter(item => item.pathways.some(p => p.toLowerCase() === path)).map(item => item.resource.name);
}

export function getPathwayResource(pathway: string): { name: string; url: string } | null {
  if (pathway.trim().toLowerCase() !== 'surgeon (md/do specialty)') return null;
  return { name: 'ABMS specialty directory', url: 'https://www.abms.org/member-boards/specialty-subspecialty-certificates/' };
}
