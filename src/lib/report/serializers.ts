import type { WeeklyReportRecord } from "./types";
import { toIsoDate } from "./utils";

const toStringValue = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value == null) return "";
  return JSON.stringify(value);
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
};

export function mapWeeklyReportRecord(row: {
  id: string;
  weekStart: Date;
  createdAt: Date;
  updatedAt: Date;
  conditionSummary: unknown;
  activitySummary: unknown;
  aiAnalysis: unknown;
  nextWeekFocus: unknown;
  supporterExport: unknown;
}): WeeklyReportRecord {
  return {
    id: row.id,
    weekStart: toIsoDate(row.weekStart),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    conditionSummary: toStringValue(row.conditionSummary),
    activitySummary: toStringValue(row.activitySummary),
    aiAnalysis: toStringValue(row.aiAnalysis),
    nextWeekFocus: toStringArray(row.nextWeekFocus),
    supporterExport: toStringValue(row.supporterExport),
  };
}
