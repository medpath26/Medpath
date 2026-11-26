export type ExamQuestion = { topic: string; answer: string };

export function calculateTopicResults(questions: ExamQuestion[], answers: Record<number, string>) {
  const groups = new Map<string, { total: number; correct: number }>();
  questions.forEach((question, index) => {
    const counts = groups.get(question.topic) ?? { total: 0, correct: 0 };
    counts.total += 1;
    if (answers[index] === question.answer) counts.correct += 1;
    groups.set(question.topic, counts);
  });
  return [...groups].map(([topic, counts]) => ({
    topic, total: counts.total, correct: counts.correct,
    percent: Math.round(counts.correct / counts.total * 100)
  }));
}
