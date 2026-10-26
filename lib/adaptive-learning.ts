export type QuizAttempt = {
  topic: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  created_at: string;
};

export type TopicRecommendation = {
  topic: string;
  attempts: number;
  averageScore: number;
  latestScore: number;
  priority: "review" | "practice" | "maintain";
  reason: string;
};

/** Computes transparent recommendations from real quiz attempts; never fabricates mastery. */
export function recommendTopics(attempts: QuizAttempt[]): TopicRecommendation[] {
  const groups = new Map<string, QuizAttempt[]>();
  for (const attempt of attempts) {
    if (!Number.isFinite(attempt.score) || attempt.score < 0 || attempt.score > 100 || !attempt.topic.trim()) continue;
    const topic = attempt.topic.trim();
    groups.set(topic, [...(groups.get(topic) ?? []), attempt]);
  }
  return Array.from(groups, ([topic, records]) => {
    const ordered = [...records].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
    const averageScore = Math.round(records.reduce((sum, a) => sum + a.score, 0) / records.length);
    const latestScore = ordered[0].score;
    const priority = latestScore < 70 || averageScore < 70 ? "review" : latestScore < 85 || averageScore < 85 ? "practice" : "maintain";
    return {
      topic,
      attempts: records.length,
      averageScore,
      latestScore,
      priority,
      reason: records.length < 3
        ? "Limited evidence: complete more practice questions to improve this recommendation."
        : priority === "review" ? "Recent or overall scores suggest revisiting the fundamentals."
        : priority === "practice" ? "Continue targeted practice to reinforce understanding."
        : "Keep this topic fresh with occasional review."
    };
  }).sort((a, b) => ({ review: 0, practice: 1, maintain: 2 }[a.priority] - { review: 0, practice: 1, maintain: 2 }[b.priority]) || a.averageScore - b.averageScore);
}
