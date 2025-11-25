export const formatLocalIsoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const getToday = () => formatLocalIsoDate(new Date());

export const parseLocalDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const addDays = (iso: string, days: number) => {
  const d = parseLocalDate(iso);
  d.setDate(d.getDate() + days);
  return formatLocalIsoDate(d);
};

export const monthMeta = (dateIso: string) => {
  const d = parseLocalDate(dateIso);
  const year = d.getFullYear();
  const month = d.getMonth();
  const first = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  return { year, month, firstWeekday: first.getDay(), totalDays };
};
