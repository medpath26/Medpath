/** Canonical healthcare pathway choices shared by registration and learning views. */
export const healthcarePathways = [
  { id: "medical-assistant", label: "Medical Assistant", flashcardCategory: "Medical Assisting" },
  { id: "surgical-technologist", label: "Surgical Technologist", flashcardCategory: "Surgical Technology" },
  { id: "sterile-processing", label: "Sterile Processing Technician", flashcardCategory: "Sterile Processing" },
  { id: "phlebotomy-technician", label: "Phlebotomy Technician", flashcardCategory: "Phlebotomy Technician" },
  { id: "patient-care-technician", label: "Patient Care Technician", flashcardCategory: "Patient Care Technician" },
  { id: "ekg-technician", label: "EKG Technician", flashcardCategory: "EKG Technician" },
  { id: "certified-nursing-assistant", label: "Certified Nursing Assistant", flashcardCategory: "Certified Nursing Assistant" },
  { id: "pharmacy-technician", label: "Pharmacy Technician", flashcardCategory: "Pharmacy Technician" },
  { id: "medical-billing-coding", label: "Medical Billing and Coding", flashcardCategory: "Medical Billing and Coding" },
  { id: "emergency-medical-technician", label: "Emergency Medical Technician", flashcardCategory: "Emergency Medical Technician" },
  { id: "dental-assistant", label: "Dental Assistant", flashcardCategory: "Dental Assistant" },
  { id: "radiologic-technologist", label: "Radiologic Technologist", flashcardCategory: "Radiologic Technologist" },
  { id: "diagnostic-medical-sonographer", label: "Diagnostic Medical Sonographer", flashcardCategory: "Diagnostic Medical Sonographer" },
  { id: "doctor-of-medicine", label: "Doctor of Medicine (MD)", flashcardCategory: "Doctor of Medicine" },
  { id: "doctor-of-osteopathic-medicine", label: "Doctor of Osteopathic Medicine (DO)", flashcardCategory: "Doctor of Osteopathic Medicine" },
  { id: "surgeon", label: "Surgeon (MD/DO Specialty)", flashcardCategory: "Surgery" },
  { id: "physician-assistant", label: "Physician Assistant / Associate (PA)", flashcardCategory: "Physician Assistant" },
  { id: "nurse-practitioner", label: "Nurse Practitioner (NP)", flashcardCategory: "Nurse Practitioner" }
] as const;

export type HealthcarePathwayId = (typeof healthcarePathways)[number]["id"];

export function getHealthcarePathway(value: string) {
  const normalized = value.trim().toLowerCase();
  return healthcarePathways.find(
    (path) => path.id === normalized || path.label.toLowerCase() === normalized
  );
}
