/** The format expected from study-material generation. Notes are never stored here. */
export type StudyMaterials = {
  summary: string[];
  flashcards: { question: string; answer: string }[];
  quiz: { question: string; answer: string; explanation: string }[];
};

export const studyMaterialsSchema = {
  type: "object", additionalProperties: false,
  properties: {
    summary: { type: "array", items: { type: "string" } },
    flashcards: { type: "array", items: { type: "object", additionalProperties: false,
      properties: { question: { type: "string" }, answer: { type: "string" } }, required: ["question", "answer"] } },
    quiz: { type: "array", items: { type: "object", additionalProperties: false,
      properties: { question: { type: "string" }, answer: { type: "string" }, explanation: { type: "string" } },
      required: ["question", "answer", "explanation"] } }
  }, required: ["summary", "flashcards", "quiz"]
} as const;

function nonemptyString(value: unknown, max: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}
function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validate even structured output: empty, incomplete, oversized, or refused output isn't usable. */
export function parseStudyMaterials(text: string): StudyMaterials | null {
  if (text.length > 40000) return null;
  let data: unknown;
  try { data = JSON.parse(text); } catch { return null; }
  if (!record(data) || !Array.isArray(data.summary) || !Array.isArray(data.flashcards) || !Array.isArray(data.quiz)) return null;
  if (data.summary.length < 1 || data.summary.length > 8 || !data.summary.every(x => nonemptyString(x, 1200))) return null;
  if (data.flashcards.length < 1 || data.flashcards.length > 12 || !data.flashcards.every(x => record(x) && nonemptyString(x.question, 500) && nonemptyString(x.answer, 1200))) return null;
  if (data.quiz.length < 1 || data.quiz.length > 10 || !data.quiz.every(x => record(x) && nonemptyString(x.question, 500) && nonemptyString(x.answer, 1200) && nonemptyString(x.explanation, 1200))) return null;
  return data as StudyMaterials;
}
