"use client";

import { monthMeta } from "../utils/date";
import { PLAN_TEXT } from "../constants";

type Props = {
  today: string;
  currentMonthIso: string;
  selectedDate: string;
  onSelect: (dateIso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

/**
 * 月のグリッド表示と前月/翌月切り替え。
 */
export const CalendarGrid = ({ today, currentMonthIso, selectedDate, onSelect, onPrevMonth, onNextMonth }: Props) => {
  const { year, month, firstWeekday, totalDays } = monthMeta(currentMonthIso);

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{PLAN_TEXT.calendarTitle}</h2>
          <p className="text-xs text-slate-600">{PLAN_TEXT.calendarDescription}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
          >
            ◀︎ 前月
          </button>
          <div className="min-w-[130px] text-center text-sm font-medium text-slate-800">
            {new Date(year, month, 1).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
          </div>
          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
          >
            翌月 ▶︎
          </button>
        </div>
      </div>

      <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-600">
          {["日", "月", "火", "水", "木", "金", "土"].map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-sm text-slate-800">
          {(() => {
            const cells = [];
            for (let i = 0; i < firstWeekday; i += 1) cells.push(<div key={`empty-${i}`} />);
            for (let d = 1; d <= totalDays; d += 1) {
              const dateStr = new Date(year, month, d).toISOString().slice(0, 10);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === today;
              cells.push(
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => onSelect(dateStr)}
                  className={`rounded-md border px-2 py-2 text-center transition ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  } ${isToday ? "ring-2 ring-slate-300" : ""}`}
                >
                  {d}
                </button>,
              );
            }
            return cells;
          })()}
        </div>
      </div>
    </>
  );
};
