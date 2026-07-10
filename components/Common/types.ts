export type ViewKey =
  | "landing"
  | "dashboard"
  | "atlas"
  | "practice"
  | "study"
  | "clinical"
  | "career"
  | "resume"
  | "interview"
  | "billing"
  | "admin";

export type AtlasChatMessage = {
  id: string;
  role: "atlas" | "user";
  text: string;
};
