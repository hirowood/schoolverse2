"use client";

"use client";

import { useEffect, useReducer } from "react";

export type PomodoroPhase = "idle" | "work" | "break";

type UsePomodoroTimerProps = {
  enabled: boolean;
  workMinutes: number;
  breakMinutes: number;
  onWorkComplete: () => void | Promise<void>;
  onBreakComplete: () => void;
};

const toSeconds = (minutes: number) => Math.max(1, minutes) * 60;

type TimerState = {
  phase: PomodoroPhase;
  secondsLeft: number;
};

type TimerAction =
  | { type: "start"; phase: PomodoroPhase; seconds: number }
  | { type: "tick" };

const reducer = (state: TimerState, action: TimerAction): TimerState => {
  switch (action.type) {
    case "start":
      return { phase: action.phase, secondsLeft: action.seconds };
    case "tick":
      return { ...state, secondsLeft: Math.max(state.secondsLeft - 1, 0) };
    default:
      return state;
  }
};

export const usePomodoroTimer = ({
  enabled,
  workMinutes,
  breakMinutes,
  onWorkComplete,
  onBreakComplete,
}: UsePomodoroTimerProps) => {
  const [state, dispatch] = useReducer(reducer, {
    phase: "idle",
    secondsLeft: toSeconds(workMinutes),
  });

  useEffect(() => {
    if (!enabled) {
      dispatch({ type: "start", phase: "idle", seconds: toSeconds(workMinutes) });
      return undefined;
    }

    dispatch({ type: "start", phase: "work", seconds: toSeconds(workMinutes) });
    const timer = setInterval(() => {
      dispatch({ type: "tick" });
    }, 1000);
    return () => clearInterval(timer);
  }, [enabled, workMinutes]);

  useEffect(() => {
    if (!enabled || state.secondsLeft > 0) return undefined;

    if (state.phase === "work") {
      let active = true;
      (async () => {
        await onWorkComplete();
        if (active) {
          dispatch({ type: "start", phase: "break", seconds: toSeconds(breakMinutes) });
        }
      })();
      return () => {
        active = false;
      };
    }

    onBreakComplete();
    dispatch({ type: "start", phase: "work", seconds: toSeconds(workMinutes) });
    return undefined;
  }, [breakMinutes, enabled, onBreakComplete, onWorkComplete, state.phase, state.secondsLeft, workMinutes]);

  return { phase: state.phase, secondsLeft: state.secondsLeft };
};
