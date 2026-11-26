import type { HealthcarePathwayId } from "./healthcare-pathways";

/** Introductory glossary selections, not an exam blueprint or complete curriculum. */
export const pathwayTermSelections: Record<HealthcarePathwayId, readonly string[]> = {
  "certified-nursing-assistant": ["Tachycardia", "Bradycardia", "Hypoglycemia", "Dermatitis"],
  "dental-assistant": ["Tachycardia", "Bradycardia", "Hyperglycemia", "Dermatitis"],
  "diagnostic-medical-sonographer": ["Tachycardia", "Bradycardia", "Nephrology", "Hematology"],
  "doctor-of-medicine": ["Tachycardia", "Hypoglycemia", "Nephrology", "Hematology"],
  "doctor-of-osteopathic-medicine": ["Bradycardia", "Hyperglycemia", "Dermatitis", "Arthroscopy"],
  "ekg-technician": ["Tachycardia", "Bradycardia", "Hypoglycemia", "Hematology"],
  "emergency-medical-technician": ["Tachycardia", "Bradycardia", "Hypoglycemia", "Hyperglycemia"],
  "medical-assistant": ["Tachycardia", "Bradycardia", "Hypoglycemia", "Dermatitis"],
  "medical-billing-coding": ["Tachycardia", "Dermatitis", "Arthroscopy", "Hematology"],
  "nurse-practitioner": ["Tachycardia", "Hypoglycemia", "Hyperglycemia", "Nephrology"],
  "patient-care-technician": ["Tachycardia", "Bradycardia", "Hypoglycemia", "Hematology"],
  "pharmacy-technician": ["Tachycardia", "Hypoglycemia", "Hyperglycemia", "Dermatitis"],
  "phlebotomy-technician": ["Hematology", "Hypoglycemia", "Hyperglycemia", "Nephrology"],
  "physician-assistant": ["Tachycardia", "Hypoglycemia", "Dermatitis", "Arthroscopy"],
  "radiologic-technologist": ["Arthroscopy", "Nephrology", "Hematology", "Tachycardia"],
  "registered-nurse": ["Tachycardia", "Bradycardia", "Hypoglycemia", "Hyperglycemia"],
  "sterile-processing": ["Arthroscopy", "Dermatitis", "Nephrology", "Hematology"],
  "surgeon": ["Arthroscopy", "Tachycardia", "Nephrology", "Hematology"],
  "surgical-technologist": ["Arthroscopy", "Tachycardia", "Dermatitis", "Hematology"]
};
