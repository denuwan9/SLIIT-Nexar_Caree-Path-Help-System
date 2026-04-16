import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TaskTimer = {
    seconds: number;
    isRunning: boolean;
    startedAt: number | null;
    finishedAt?: number | null;
    lastUpdatedAt?: number | null;
};

export type TimerMap = Record<string, TaskTimer>;

const TIMER_MAP_KEY = 'studyPlanTaskTimers';

interface TimerState {
    timers: TimerMap;
    activeTimerId: string | null;
    hydrated: boolean;
    
    // Actions
    startTimer: (taskId: string, extraData?: any) => void;
    pauseTimer: (taskId: string) => void;
    resetTimer: (taskId: string) => void;
    tick: () => void;
    setHydrated: () => void;
    completeTimer: (taskId: string) => void;
}

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            timers: {},
            activeTimerId: null,
            hydrated: false,

            startTimer: (taskId, _extraData) => {
                const now = Date.now();
                set((state) => {
                    const current = state.timers[taskId] || { seconds: 0, isRunning: false, startedAt: null };
                    
                    // If switching timers, pause previous
                    const nextTimers = { ...state.timers };
                    if (state.activeTimerId && state.activeTimerId !== taskId) {
                        if (nextTimers[state.activeTimerId]) {
                            nextTimers[state.activeTimerId] = {
                                ...nextTimers[state.activeTimerId],
                                isRunning: false,
                                lastUpdatedAt: now
                            };
                        }
                    }

                    nextTimers[taskId] = {
                        ...current,
                        isRunning: true,
                        startedAt: current.startedAt || now,
                        lastUpdatedAt: now
                    };

                    return {
                        timers: nextTimers,
                        activeTimerId: taskId
                    };
                });
            },

            pauseTimer: (taskId) => {
                const now = Date.now();
                set((state) => {
                    const current = state.timers[taskId];
                    if (!current) return state;

                    return {
                        timers: {
                            ...state.timers,
                            [taskId]: {
                                ...current,
                                isRunning: false,
                                lastUpdatedAt: now
                            }
                        },
                        activeTimerId: state.activeTimerId === taskId ? null : state.activeTimerId
                    };
                });
            },

            resetTimer: (taskId) => {
                set((state) => {
                    const nextTimers = { ...state.timers };
                    delete nextTimers[taskId];
                    return {
                        timers: nextTimers,
                        activeTimerId: state.activeTimerId === taskId ? null : state.activeTimerId
                    };
                });
            },

            completeTimer: (taskId) => {
                const now = Date.now();
                set((state) => {
                    const current = state.timers[taskId];
                    if (!current) return state;

                    return {
                        timers: {
                            ...state.timers,
                            [taskId]: {
                                ...current,
                                isRunning: false,
                                lastUpdatedAt: now,
                                finishedAt: now
                            }
                        },
                        activeTimerId: state.activeTimerId === taskId ? null : state.activeTimerId
                    };
                });
            },

            tick: () => {
                const { activeTimerId, timers } = get();
                if (!activeTimerId || !timers[activeTimerId]?.isRunning) return;

                const now = Date.now();
                set((state) => {
                    const active = state.timers[state.activeTimerId!];
                    if (!active || !active.isRunning) return state;

                    const last = active.lastUpdatedAt || active.startedAt || now;
                    const elapsed = Math.max(0, Math.floor((now - last) / 1000));
                    
                    if (elapsed < 1) return state; // Only update if a second has passed

                    return {
                        timers: {
                            ...state.timers,
                            [state.activeTimerId!]: {
                                ...active,
                                seconds: active.seconds + elapsed,
                                lastUpdatedAt: now
                            }
                        }
                    };
                });
            },

            setHydrated: () => set({ hydrated: true })
        }),
        {
            name: TIMER_MAP_KEY,
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: (_state) => {
                return (state, error) => {
                    if (error) {
                        console.error('An error occurred during hydration', error);
                    } else {
                        state?.setHydrated();
                        
                        // Catch up logic: if rehydrated and a timer was running, calculate missed time
                        if (state?.activeTimerId && state.timers[state.activeTimerId]?.isRunning) {
                            const active = state.timers[state.activeTimerId];
                            const now = Date.now();
                            const last = active.lastUpdatedAt || active.startedAt || now;
                            const elapsed = Math.max(0, Math.floor((now - last) / 1000));
                            
                            if (elapsed > 0) {
                                state.tick(); // This will trigger one update, but we want to catch the whole gap
                                // To be precise, we should update the seconds directly here
                                // Actually, tick() will handle one second, let's do more explicit catch up
                            }
                        }
                    }
                };
            }
        }
    )
);
