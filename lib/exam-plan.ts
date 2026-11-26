export function daysBetween(start: string, end: string) {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000);
}
export function makeStudyBlocks(start: string, examDate: string, topics: string[]) {
  const days = daysBetween(start, examDate);
  if (!Number.isFinite(days) || days <= 0 || days > 3650 || !topics.length) return [];
  return Array.from({ length: Math.min(12, Math.ceil(days / 7)) }, (_, i) => ({
    start: new Date(Date.parse(`${start}T00:00:00Z`) + i * 7 * 86400000).toISOString().slice(0, 10),
    topic: topics[i % topics.length]
  }));
}
