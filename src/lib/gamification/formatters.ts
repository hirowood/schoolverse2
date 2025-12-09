export const formatNumber = (value: number) =>
  new Intl.NumberFormat("ja-JP").format(Math.max(0, Math.round(value)));

export const formatMinutesToHours = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs <= 0) return `${mins}分`;
  return `${hrs}時間${mins.toString().padStart(2, "0")}分`;
};

export const formatDateTime = (value: string) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};
