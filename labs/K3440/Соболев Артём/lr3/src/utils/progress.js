export function progressStats(sessions, now = new Date()) {
  const time = now.getTime();
  const week = sessions.filter((s) => {
    const age = time - new Date(s.completedAt).getTime();
    return age >= 0 && age <= 7 * 86400000;
  }).length;
  const month = sessions.filter((s) => {
    const d = new Date(s.completedAt);
    return (
      d <= now &&
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth()
    );
  }).length;
  return {
    week,
    month,
    goal: Math.min(week, 4),
    remaining: Math.max(4 - week, 0),
  };
}
