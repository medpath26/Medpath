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
