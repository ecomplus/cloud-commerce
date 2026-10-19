/**
 * PagHiper returns due dates in Brasília time, with or without the time part
 * ("2026-10-08" or "2026-10-08 23:59:59"). `new Date()` alone would read them
 * as UTC, ending the checkout countdown three hours early (or the day before).
 */
const parseDueDate = (dueDate?: string | null) => {
  if (!dueDate) return undefined;
  const value = String(dueDate).trim();
  let date: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date = new Date(`${value}T23:59:59-03:00`);
  } else if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    date = new Date(`${value.replace(' ', 'T')}-03:00`);
  } else {
    date = new Date(value);
  }
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export default parseDueDate;
