export const industries = ['IT и разработка', 'Дизайн', 'Маркетинг', 'Аналитика', 'Продажи'];
export const experiences = ['Без опыта', '1–3 года', '3–6 лет', 'Более 6 лет'];
export const formats = ['Офис', 'Гибрид', 'Удалённо'];

export function initials(company) {
  return company.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase();
}

export function money(amount, currency = 'RUB') {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency', currency, maximumFractionDigits: 0
  }).format(amount);
}

export function salary(job, currency = 'RUB', rate = 1) {
  return `${money(job.salaryMin * rate, currency)} – ${money(job.salaryMax * rate, currency)}`;
}

export function filterJobs(jobs, filters) {
  const words = (filters.query || '').trim().toLocaleLowerCase('ru').split(/\s+/);
  return jobs.filter(job => {
    const searchable = [job.title, job.company, job.city, job.industry, job.format]
      .join(' ').toLocaleLowerCase('ru');
    return words.every(word => searchable.includes(word))
      && (!filters.industry || job.industry === filters.industry)
      && (!filters.experience || job.experience === filters.experience)
      && (!filters.minimum || job.salaryMax >= Number(filters.minimum))
      && (!filters.format || job.format === filters.format);
  });
}

export function orderJobs(jobs, order) {
  return [...jobs].sort((a, b) => order === 'salary'
    ? b.salaryMax - a.salaryMax
    : Date.parse(b.createdAt) - Date.parse(a.createdAt));
}
