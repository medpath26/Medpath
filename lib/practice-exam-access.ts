/** Existing question banks only. Other pathways must not inherit an unrelated bank. */
export function practiceExamIds(program: string): string[] {
  const path = program.trim().toLowerCase();
  if (!path || path.includes("explor")) return ["ncct-tsc", "cst", "medical-assistant", "sterile-processing"];
  if (path === "surgical technologist" || path === "surgical technology") return ["ncct-tsc", "cst"];
  if (path === "medical assistant" || path === "medical assisting") return ["medical-assistant"];
  if (path === "sterile processing technician" || path === "sterile processing") return ["sterile-processing"];
  return [];
}
