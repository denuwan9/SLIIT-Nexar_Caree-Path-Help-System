import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Calendar,
    CalendarClock,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Loader2,
    Plus,
    Trash2,
    Upload,
    Wand2,
    Brain,
    Layout,
    Zap,
    Shield,
    Flame,
    Sparkles,
    Activity,
    ArrowLeft,
    Info,
    Play,
    RotateCcw,
    Timer,
    Bell,
    BellOff,
    Volume2,
    X,
} from 'lucide-react';


import { createStudyPlan, createStudyPlanWithDocs, deleteStudyPlan, fetchStudyPlans, updateSubjectStatus, updateSubjectTime } from '../services/studyPlanService';
import { googleCalendarService } from '../services/googleCalendarService';
import type { GoogleCalendarEvent, GoogleSyncSummary } from '../services/googleCalendarService';
import { Share2, CalendarPlus } from 'lucide-react';
import { useTimerStore } from '../store/useTimerStore';
import type { TimerMap } from '../store/useTimerStore';
import type {
    CreateStudyPlanInput,
    StudyPlan,
    StudyPriority,
    StudyTaskStatus,
} from '../types/studyPlan';



function formatTimer(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} min`;
}


const formatHours = (hours?: number | null, digits = 1) => {
    const safe = Number.isFinite(hours || 0) ? Number(hours) : 0;
    return safe.toFixed(digits);
};


const TaskTrackerPanel: React.FC<{
    tasks: { taskId: string; title?: string; topic?: string; subjectName: string; durationMinutes?: number; durationHours?: number; status?: StudyTaskStatus; isCompleted?: boolean; sessionId: string; idx: number }[];
    timers: TimerMap;
    activeTimerId: string | null;
    selectedTrackerId: string | null;
    onSelectTask: (taskId: string) => void;
    onStart: (taskId: string, sessionId: string, idx: number) => void;
    onPause: (taskId: string) => void;
    onReset: (taskId: string) => void;
    onComplete: (sessionId: string, idx: number, taskId: string) => void;
}> = ({ tasks, timers, activeTimerId, selectedTrackerId, onSelectTask, onStart, onPause, onReset, onComplete }) => {
    const [activeTab, setActiveTab] = useState<'list' | 'tracker'>('list');

    // Auto-switch to tracker when a task is selected
    const handleTaskClick = (taskId: string) => {
        onSelectTask(taskId);
        setActiveTab('tracker');
    };

    const selectedTask = tasks.find(t => t.taskId === selectedTrackerId);
    const timerState = selectedTrackerId ? (timers[selectedTrackerId] || { seconds: 0, isRunning: false, startedAt: null, finishedAt: null }) : null;
    const durationMins = selectedTask ? (selectedTask.durationMinutes || Math.round((selectedTask.durationHours || 1) * 60)) : 0;

    const getTaskStatus = (t: typeof tasks[0]): { label: string; icon: string; bg: string; text: string; border: string } => {
        const timer = timers[t.taskId];
        const status = t.status || (t.isCompleted ? 'completed' : 'pending');
        if (status === 'completed') return { label: 'Completed', icon: 'C', bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' };
        if (status === 'in-progress' || timer?.isRunning) return { label: 'Started', icon: 'S', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' };
        if (timer && timer.seconds > 0 && !timer.isRunning) return { label: 'Resume', icon: 'R', bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
        return { label: 'Pending', icon: 'P', bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
    };

    // Clock hand angle for the elapsed time
    const elapsedAngle = timerState ? ((timerState.seconds % 3600) / 3600) * 360 : 0;
    const currentTimeStr = timerState?.isRunning
        ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase()
        : '00:00 P.M.';

    return (
        <div className="rounded-[2rem] bg-white border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                        activeTab === 'list'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                    Task List
                </button>
                <button
                    onClick={() => setActiveTab('tracker')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all ${
                        activeTab === 'tracker'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                >
                    Time Tracker
                </button>
            </div>

            {/* Task List Tab */}
            {activeTab === 'list' && (
                <div className="p-4 space-y-2 max-h-[28rem] overflow-y-auto">
                    {tasks.length === 0 && (
                        <p className="text-center py-12 text-slate-400 text-sm font-semibold">No tasks available</p>
                    )}
                    {[...tasks].sort((a, b) => {
                        const getPriority = (t: typeof a) => {
                            const timer = timers[t.taskId];
                            const status = t.status || (t.isCompleted ? 'completed' : 'pending');
                            if (status === 'completed' || t.isCompleted) return 99; // Completed → absolute bottom
                            if (status === 'in-progress' || timer?.isRunning) return 0; // Started → top
                            if (timer && timer.seconds > 0 && !timer.isRunning) return 1; // Resume
                            return 2; // Pending
                        };
                        return getPriority(a) - getPriority(b);
                    }).map((t) => {
                        const st = getTaskStatus(t);
                        const timer = timers[t.taskId];
                        const isActive = t.taskId === activeTimerId;
                        const isSelected = t.taskId === selectedTrackerId;

                        return (
                            <button
                                key={t.taskId}
                                onClick={() => handleTaskClick(t.taskId)}
                                className={`w-full text-left rounded-2xl p-4 flex items-center justify-between gap-3 transition-all border ${
                                    isActive
                                        ? 'bg-orange-50 border-orange-200 shadow-md'
                                        : isSelected
                                            ? 'bg-blue-50 border-blue-200'
                                            : `${st.bg}/30 ${st.border} hover:shadow-sm`
                                }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900">
                                        {t.title || t.topic || t.subjectName}
                                    </p>
                                    {(timer && timer.seconds > 0) && (
                                        <p className="text-lg font-black text-slate-800 mt-0.5">
                                            {formatTimer(timer.seconds)}
                                        </p>
                                    )}
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${st.bg} ${st.border}`}>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${st.border} ${st.bg} ${st.text}`}>
                                        {st.icon}
                                    </div>
                                    <span className={`text-[11px] font-bold ${st.text}`}>{st.label}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Time Tracker Tab */}
            {activeTab === 'tracker' && (
                <div className="p-8 flex flex-col items-center justify-center min-h-[24rem]">
                    {!selectedTask ? (
                        <div className="text-center space-y-4">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-200 flex items-center justify-center mx-auto">
                                <Timer size={40} className="text-slate-300" />
                            </div>
                            <p className="text-sm font-bold text-slate-400">Select a task from the Task List</p>
                            <button
                                onClick={() => setActiveTab('list')}
                                className="text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700"
                            >
                                ← Go to Task List
                            </button>
                        </div>
                    ) : (
                        <div className="w-full max-w-sm space-y-6 text-center">
                            {/* Task Info + Duration */}
                            <div>
                                <p className="text-sm font-bold text-slate-500 truncate">
                                    {selectedTask.title || selectedTask.topic || selectedTask.subjectName}
                                </p>
                                <p className={`text-3xl font-black mt-1 ${(timerState?.seconds || 0) >= durationMins * 60 ? 'text-rose-600' : 'text-slate-900'}`}>
                                    {formatTimer(timerState?.seconds || 0)}
                                </p>
                                { (timerState?.seconds || 0) >= durationMins * 60 ? (
                                    <p className="text-sm font-black text-rose-600 animate-pulse mt-1 capitalize tracking-widest">Time is Over! ⏰</p>
                                ) : (
                                    <p className="text-xs font-bold text-slate-400 mt-0.5">/ {durationMins}:00 min</p>
                                )}
                            </div>

                            {/* Large Clock Display */}
                            <div className="relative mx-auto w-48 h-48">
                                <div className="absolute inset-0 rounded-[2rem] border-4 border-slate-200 bg-white shadow-lg flex items-center justify-center">
                                    {/* Clock circle */}
                                    <div className="relative w-32 h-32">
                                        <svg viewBox="0 0 100 100" className="w-full h-full">
                                            {/* Outer ring */}
                                            <circle cx="50" cy="50" r="46" fill="none" stroke="#E2E8F0" strokeWidth="2" />
                                            {/* Progress arc */}
                                            <circle
                                                cx="50" cy="50" r="46"
                                                fill="none"
                                                stroke={(timerState?.seconds || 0) >= durationMins * 60 ? '#E11D48' : timerState?.isRunning ? '#3B82F6' : '#94A3B8'}
                                                strokeWidth="3"
                                                strokeDasharray={`${Math.min(100, ((timerState?.seconds || 0) / (durationMins * 60)) * 100) * 2.89} 289`}
                                                strokeLinecap="round"
                                                transform="rotate(-90 50 50)"
                                                className="transition-all duration-1000"
                                            />
                                            {/* Dots around the clock */}
                                            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
                                                <circle
                                                    key={angle}
                                                    cx={50 + 42 * Math.cos((angle - 90) * Math.PI / 180)}
                                                    cy={50 + 42 * Math.sin((angle - 90) * Math.PI / 180)}
                                                    r="2"
                                                    fill={timerState?.isRunning ? '#3B82F6' : '#CBD5E1'}
                                                />
                                            ))}
                                            {/* Clock hand */}
                                            <line
                                                x1="50" y1="50"
                                                x2={50 + 30 * Math.cos((elapsedAngle - 90) * Math.PI / 180)}
                                                y2={50 + 30 * Math.sin((elapsedAngle - 90) * Math.PI / 180)}
                                                stroke={(timerState?.seconds || 0) >= durationMins * 60 ? '#E11D48' : timerState?.isRunning ? '#3B82F6' : '#94A3B8'}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                            />
                                            {/* Center dot */}
                                            <circle cx="50" cy="50" r="3" fill={(timerState?.seconds || 0) >= durationMins * 60 ? '#E11D48' : timerState?.isRunning ? '#3B82F6' : '#94A3B8'} />
                                        </svg>
                                    </div>
                                </div>
                                {/* Current Time Label */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                                    <p className="text-[11px] font-black text-slate-700">{currentTimeStr}</p>
                                </div>
                            </div>

                            {/* Play/Pause Controls */}
                            <div className="flex items-center justify-center gap-4">
                                {timerState?.isRunning ? (
                                    <button
                                        onClick={() => onPause(selectedTrackerId!)}
                                        className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all hover:scale-105 active:scale-95"
                                    >
                                        {/* Pause icon */}
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <rect x="6" y="4" width="4" height="16" rx="1" />
                                            <rect x="14" y="4" width="4" height="16" rx="1" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onStart(selectedTrackerId!, selectedTask.sessionId, selectedTask.idx)}
                                        className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Play size={28} fill="currentColor" />
                                    </button>
                                )}

                                {(timerState?.seconds || 0) > 0 && !timerState?.isRunning && (
                                    <button
                                        onClick={() => onReset(selectedTrackerId!)}
                                        className="w-12 h-12 rounded-xl bg-white text-slate-400 border border-slate-200 flex items-center justify-center hover:text-rose-500 hover:border-rose-200 transition-all"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                )}

                                {timerState?.isRunning && (
                                    <button
                                        onClick={() => onComplete(selectedTask.sessionId, selectedTask.idx, selectedTrackerId!)}
                                        className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
                                    >
                                        <CheckCircle2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const PRIORITY_META: Record<StudyPriority, { label: string; accent: string; tip: string; icon: any }> = {
    critical: {
        label: 'Exam-crunch',
        accent: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        tip: 'Do first while fresh. Aim for deep focus and quick recall drills.',
        icon: Flame,
    },
    high: {
        label: 'High focus',
        accent: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        tip: 'Tackle early. Alternate problems and short summaries to lock concepts.',
        icon: Sparkles,
    },
    medium: {
        label: 'Steady',
        accent: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        tip: 'Use spaced practice. Finish with one cheat-sheet bullet list.',
        icon: Activity,
    },
    low: {
        label: 'Light',
        accent: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        tip: 'Skim, annotate slides, and park doubts for later review.',
        icon: Shield,
    },
};

const StudyPlanPage: React.FC = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState<File[]>([]);
    const [timetableFiles, setTimetableFiles] = useState<File[]>([]);
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    const [isCreating, setIsCreating] = useState(false);
    const [, setGenerationStage] = useState<string | null>(null);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    const [plans, setPlans] = useState<StudyPlan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [regenerateFromPlanId, setRegenerateFromPlanId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'builder' | 'plans' | 'schedule'>('builder');
    const [justGenerated, setJustGenerated] = useState(false);
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [workEnabled, setWorkEnabled] = useState(false);

    const [selectedWorkDays, setSelectedWorkDays] = useState<string[]>([]);
    const [workStartTime, setWorkStartTime] = useState('');
    const [workEndTime, setWorkEndTime] = useState('');
    
    // Timer Store integration
    const timers = useTimerStore(state => state.timers);
    const activeTimerId = useTimerStore(state => state.activeTimerId);
    const startTimer = useTimerStore(state => state.startTimer);
    const pauseTimer = useTimerStore(state => state.pauseTimer);
    const resetTimer = useTimerStore(state => state.resetTimer);
    const completeTimer = useTimerStore(state => state.completeTimer);

    const [openTrackerId, setOpenTrackerId] = useState<string | null>(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [lastNotifiedTask, setLastNotifiedTask] = useState<string | null>(null);
    const [activeAlert, setActiveAlert] = useState<{ title: string; time: string; subject: string; id: string; planId?: string } | null>(null);
    const [pendingFocusTaskId, setPendingFocusTaskId] = useState<string | null>(null);
    const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
    const [welcomeAlertShown, setWelcomeAlertShown] = useState(false);
    
    const [isTrackerExpanded, setIsTrackerExpanded] = useState(false);
    const [isCalendarLinked, setIsCalendarLinked] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showViewCalendar, setShowViewCalendar] = useState(false);
    const [isCalendarViewOpen, setIsCalendarViewOpen] = useState(false);
    const [isLoadingCalendarEvents, setIsLoadingCalendarEvents] = useState(false);
    const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
    
    // Edit task date/time state
    const [editingTaskTime, setEditingTaskTime] = useState<{ sessionId: string; subjectIdx: number; date: string; customStartTime: string; durationMinutes: number; originalDurationMinutes: number } | null>(null);


    const selectedPlan = useMemo(
        () => plans.find((p) => p._id === selectedPlanId) || plans[0],
        [plans, selectedPlanId]
    );

    useEffect(() => {
        const checkCalendarStatus = async () => {
            try {
                const status = await googleCalendarService.getStatus();
                setIsCalendarLinked(status.isLinked);
            } catch (error) {
                console.error('Failed to fetch calendar status:', error);
            }
        };
        if (viewMode === 'schedule') {
            checkCalendarStatus();
        }
    }, [viewMode]);

    const prevViewModeRef = React.useRef(viewMode);
    useEffect(() => {
        if (viewMode === 'schedule' && prevViewModeRef.current !== 'schedule') {
            setIsTrackerExpanded(false);
        }
        prevViewModeRef.current = viewMode;
    }, [viewMode]);

    const formatSyncSummary = (summary: GoogleSyncSummary) => {
        const parts: string[] = [];
        if (summary.removedFromOtherPlans > 0) parts.push(`${summary.removedFromOtherPlans} previous-plan removed`);
        if (summary.removedStaleInCurrentPlan > 0) parts.push(`${summary.removedStaleInCurrentPlan} stale removed`);
        if (summary.added > 0) parts.push(`${summary.added} added`);
        if (summary.updated > 0) parts.push(`${summary.updated} updated`);
        if (summary.skippedDuplicates > 0) parts.push(`${summary.skippedDuplicates} duplicate skipped`);
        if (summary.skippedOverlaps > 0) parts.push(`${summary.skippedOverlaps} overlap skipped`);
        if (summary.skippedInvalid > 0) parts.push(`${summary.skippedInvalid} invalid skipped`);
        return parts.length > 0 ? `Google Calendar sync: ${parts.join(' | ')}` : 'No study sessions were synced.';
    };

    const loadCalendarEvents = async () => {
        setIsLoadingCalendarEvents(true);
        try {
            const events = await googleCalendarService.getEvents();
            const sorted = [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
            setCalendarEvents(sorted);
        } catch (error: any) {
            if ([400, 401, 403].includes(error?.response?.status)) {
                setIsCalendarLinked(false);
            }
            toast.error(error?.response?.data?.message || 'Failed to load Google Calendar events');
        } finally {
            setIsLoadingCalendarEvents(false);
        }
    };

    const handleGoogleSync = () => {
        if (!selectedPlan || isSyncing) return;
        setIsSyncing(true);

        const syncSelectedPlan = async () => {
            const result = await googleCalendarService.syncPlan(selectedPlan._id);
            toast.success(formatSyncSummary(result.syncSummary), { duration: 5000 });

            if (result.syncSummary.skippedOverlaps > 0) {
                toast.error(`${result.syncSummary.skippedOverlaps} sessions were skipped because they overlap existing calendar events.`, {
                    duration: 6000,
                });
            }

            setShowViewCalendar(true);
            await loadCalendarEvents();
        };

        if (isCalendarLinked) {
            syncSelectedPlan()
                .catch((error: any) => {
                    const status = error?.response?.status;
                    const shouldRelink = status === 400 || status === 401 || status === 403;

                    if (shouldRelink) {
                        setIsCalendarLinked(false);
                        toast.error('Google Calendar needs reconnection. Click Sync again and approve Google access.');
                        return;
                    }

                    toast.error(error?.response?.data?.message || 'Sync failed');
                })
                .finally(() => setIsSyncing(false));

            return;
        }

        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            setIsSyncing(false);
        };

        const timeoutId = window.setTimeout(() => {
            if (finished) return;
            toast.error('Google popup did not open. Please allow popups for localhost and try again.');
            finish();
        }, 15000);

        const client = (window as any).google?.accounts.oauth2.initCodeClient({
            client_id: '741747269992-1d9m8m0hbcfa593ssaf7t86qr1vfk9oq.apps.googleusercontent.com',
            scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
            access_type: 'offline',
            prompt: 'consent',
            ux_mode: 'popup',
            redirect_uri: 'postmessage',
            error_callback: (oauthError: any) => {
                window.clearTimeout(timeoutId);
                toast.error(oauthError?.message || 'Google authorization popup was closed or blocked.');
                finish();
            },
            callback: async (response: any) => {
                window.clearTimeout(timeoutId);

                if (!response?.code) {
                    toast.error(response?.error || 'Google authorization was cancelled.');
                    finish();
                    return;
                }

                try {
                    await googleCalendarService.linkAccount(response.code);
                    setIsCalendarLinked(true);
                    await syncSelectedPlan();
                } catch (error: any) {
                    toast.error(error?.response?.data?.message || 'Sync failed');
                } finally {
                    finish();
                }
            },
        });

        if (!client) {
            window.clearTimeout(timeoutId);
            toast.error('Google authentication is not ready. Please reload and try again.');
            finish();
            return;
        }

        client.requestCode();
    };

    const handleViewCalendar = () => {
        window.open('https://calendar.google.com/calendar/u/0/r/week', '_blank', 'noopener,noreferrer');
    };

    const allTasksFlat = useMemo(() => {
        if (!selectedPlan) return [];
        return selectedPlan.sessions.flatMap(s => 
            s.subjects.map((sub, idx) => ({ 
                ...sub, 
                sessionId: s._id, 
                idx, 
                taskId: `${s._id}-${idx}`,
                day: s.day,
                date: s.date
            }))
        );
    }, [selectedPlan]);
    const taskRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

    const queueTaskFocusFromNotification = (taskId?: string | null, planId?: string) => {
        const firstId = plans[0]?._id;
        const targetPlanId = planId || selectedPlanId || firstId;

        if (targetPlanId) {
            setSelectedPlanId(targetPlanId);
        }

        setViewMode('schedule');

        if (!taskId) return;

        setOpenTrackerId(taskId);
        setPendingFocusTaskId(taskId);
    };

    useEffect(() => {
        if (!pendingFocusTaskId) return;

        const hasTask = allTasksFlat.some((task) => task.taskId === pendingFocusTaskId);
        if (!hasTask) return;

        const target = taskRefs.current[pendingFocusTaskId];
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        setOpenTrackerId(pendingFocusTaskId);
        setHighlightedTaskId(pendingFocusTaskId);
        toast.success('Task next to be completed', { duration: 2600 });

        setPendingFocusTaskId(null);
    }, [pendingFocusTaskId, allTasksFlat]);

    useEffect(() => {
        if (!highlightedTaskId) return;

        const separatorIndex = highlightedTaskId.lastIndexOf('-');
        if (separatorIndex <= 0) return;

        const sessionId = highlightedTaskId.slice(0, separatorIndex);
        const idxStr = highlightedTaskId.slice(separatorIndex + 1);
        const subjectIdx = Number(idxStr);

        if (!sessionId || Number.isNaN(subjectIdx)) return;

        let matchedSubject: { status?: StudyTaskStatus; isCompleted?: boolean } | null = null;

        for (const plan of plans) {
            const session = plan.sessions.find((s) => s._id === sessionId);
            if (session && session.subjects[subjectIdx]) {
                matchedSubject = session.subjects[subjectIdx];
                break;
            }
        }

        if (!matchedSubject) return;

        const isDone = matchedSubject.status === 'completed' || !!matchedSubject.isCompleted;
        if (isDone) {
            setHighlightedTaskId(null);
        }
    }, [highlightedTaskId, plans]);

    const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const clampToToday = (value: string) => {
        if (!value) return value;
        return value < todayISO ? todayISO : value;
    };

    const computeStudyHoursFromInternship = (start?: string, end?: string, fallback?: number) => {
        if (!start || !end) return fallback;
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return fallback;
        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;
        if (endMinutes <= startMinutes) return fallback;
        const internshipHours = (endMinutes - startMinutes) / 60;
        const remaining = Math.max(1, Math.min(16, 24 - internshipHours));
        return remaining;
    };

    const computeDerivedAvailability = (input: Partial<CreateStudyPlanInput>) => {
        const fromManualHours = input.internshipHoursPerDay
            ? Math.max(1, Math.min(12, 24 - input.internshipHoursPerDay))
            : null;
        const fromTimeRange = computeStudyHoursFromInternship(
            input.internshipStartTime,
            input.internshipEndTime,
            input.availableHoursPerDay
        );
        return fromManualHours ?? fromTimeRange ?? input.availableHoursPerDay ?? 4;
    };

    const prefillDemoPlan = () => {
        const today = new Date();
        const start = new Date(today);
        const end = new Date(today);
        start.setDate(start.getDate() + 3);
        end.setDate(end.getDate() + 21);

        const baselineHours = computeStudyHoursFromInternship('09:00', '13:00', 4) || 4;

        setPlanInput({
            title: 'Internship + Finals Sprint',
            examStartDate: start.toISOString().slice(0, 10),
            examEndDate: end.toISOString().slice(0, 10),
            internshipHoursPerDay: 4,
            internshipDaysPerWeek: 5,
            availableHoursPerDay: computeDerivedAvailability({
                internshipHoursPerDay: 4,
                internshipStartTime: '09:00',
                internshipEndTime: '13:00',
                availableHoursPerDay: baselineHours,
            }),
            internshipStartTime: '09:00',
            internshipEndTime: '13:00',
            subjects: [
                {
                    name: 'Distributed Systems',
                    creditHours: 3,
                    difficulty: 'hard',
                    examDate: end.toISOString().slice(0, 10),
                    weight: 1.4,
                    syllabusTopics: ['Consistency models', 'CAP', 'gRPC labs'],
                },
                {
                    name: 'Data Structures & Algorithms',
                    creditHours: 3,
                    difficulty: 'medium',
                    examDate: end.toISOString().slice(0, 10),
                    weight: 1.1,
                    syllabusTopics: ['DP practice', 'Graphs', 'Greedy vs brute force'],
                },
                {
                    name: 'Internship Project',
                    creditHours: 2,
                    difficulty: 'medium',
                    examDate: start.toISOString().slice(0, 10),
                    weight: 1,
                    syllabusTopics: ['Backend tasks', 'PR reviews', 'Demo prep'],
                },
            ],
        });
    };

    const [planInput, setPlanInput] = useState<CreateStudyPlanInput>({
        title: '',
        examStartDate: todayISO, // Default to today as requested
        examEndDate: '',
        availableHoursPerDay: 4,
        internshipHoursPerDay: 0,
        internshipDaysPerWeek: 0,
        internshipStartTime: '',
        internshipEndTime: '',
        subjects: [],
    });
    const [manualHoursOverride, setManualHoursOverride] = useState(false);

    const handleInternshipLoadChange = (field: 'internshipHoursPerDay' | 'internshipDaysPerWeek', value: number) => {
        setManualHoursOverride(false);
        setPlanInput((prev) => {
            const next = { ...prev, [field]: value };
            const derived = computeDerivedAvailability(next);
            return { ...next, availableHoursPerDay: derived };
        });
    };

    useEffect(() => {
        if (manualHoursOverride) return;
        const suggested = computeDerivedAvailability({ ...planInput });
        setPlanInput((prev) => ({ ...prev, availableHoursPerDay: suggested }));
    }, [planInput.internshipHoursPerDay, manualHoursOverride]);

    const derivedAvailableHours = useMemo(() => {
        if (manualHoursOverride && planInput.availableHoursPerDay) return planInput.availableHoursPerDay;
        return computeDerivedAvailability(planInput);
    }, [manualHoursOverride, planInput]);

    const daysUntilExam = useMemo(() => {
        if (!planInput.examStartDate) return 0;
        const start = new Date(planInput.examStartDate);
        const today = new Date();
        const diff = start.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    }, [planInput.examStartDate]);

    const totalStudyHoursAvailable = useMemo(() => {
        const days = planInput.examEndDate && planInput.examStartDate 
            ? Math.ceil((new Date(planInput.examEndDate).getTime() - new Date(planInput.examStartDate).getTime()) / (1000 * 3600 * 24)) 
            : 0;
        return Math.max(1, days) * (derivedAvailableHours || 4);
    }, [planInput.examStartDate, planInput.examEndDate, derivedAvailableHours]);

    const workloadScore = useMemo(() => {
        const workHoursPerWeek = workEnabled ? ((planInput.internshipDaysPerWeek || 0) * (planInput.internshipHoursPerDay || 0)) : 0;
        const studyHoursPerWeek = (derivedAvailableHours || 4) * 7;
        const total = workHoursPerWeek + studyHoursPerWeek;
        if (total > 60) return { level: 'High', color: 'text-rose-600', bg: 'bg-rose-500', barCol: 'bg-rose-100', text: 'Overloaded' };
        if (total > 40) return { level: 'Medium', color: 'text-amber-600', bg: 'bg-amber-500', barCol: 'bg-amber-100', text: 'Moderate' };
        return { level: 'Low', color: 'text-emerald-600', bg: 'bg-emerald-500', barCol: 'bg-emerald-100', text: 'Balanced' };
    }, [workEnabled, planInput.internshipDaysPerWeek, planInput.internshipHoursPerDay, derivedAvailableHours]);

    const aiSuggestions = useMemo(() => {
        const tips = [];
        if (daysUntilExam < 7 && planInput.subjects.length > 2) {
            tips.push("You have limited time! Focus on high-priority topics.");
        }
        if (workloadScore.level === 'High') {
            tips.push("Your workload is very high. Consider reducing daily study goals or work hours to prevent burnout.");
        } else if (workloadScore.level === 'Low') {
            tips.push("You have a balanced workload. Great setup for steady, consistent progress!");
        } else {
            tips.push("Your schedule looks moderate. Adjust daily goals as needed to keep pace.");
        }
        if (planInput.subjects.length === 0 && documents.length === 0) {
            tips.push("Upload your materials in Step 1 so the AI can analyze your subjects.");
        }
        return tips;
    }, [daysUntilExam, planInput.subjects.length, workloadScore.level, documents.length]);

    useEffect(() => {
        const loadPlans = async () => {
            setIsLoadingPlans(true);
            try {
                const data = await fetchStudyPlans();
                setPlans(data);
                if (data.length > 0) setSelectedPlanId(data[0]._id);
            } catch (error: any) {
                toast.error(error?.response?.data?.message || 'Could not load study plans');
            } finally {
                setIsLoadingPlans(false);
            }
        };
        loadPlans();
        
        if ("Notification" in window && Notification.permission === "granted") {
            setNotificationsEnabled(true);
        }
    }, []);

    useEffect(() => {
        if (!isLoadingPlans && plans.length > 0 && !welcomeAlertShown) {
            const activePlan = plans.find(p => p._id === selectedPlanId) || plans[0];
            const next = getNextTaskForPlan(activePlan);
            if (next) {
                setActiveAlert({
                    id: next.taskId,
                    title: next.title,
                    subject: next.subject,
                    time: next.time,
                    planId: activePlan._id
                });
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                audio.volume = 0.6;
                audio.play().catch((e) => console.warn("Inter visit audio failed", e));
                setWelcomeAlertShown(true);
            }
        }
    }, [isLoadingPlans, plans, welcomeAlertShown, selectedPlanId]);



    useEffect(() => {
        if (activeTimerId && timers[activeTimerId] && !timers[activeTimerId].isRunning) {
            const task = allTasksFlat.find(t => t.taskId === activeTimerId);
            if (task) {
                const limitSeconds = (task.durationMinutes || Math.round((task.durationHours || 0) * 60)) * 60;
                if (timers[activeTimerId].seconds >= limitSeconds) {
                    pauseTimer(activeTimerId);
                    toast(`Time is over for: ${task.title || task.topic || task.subjectName}`, {
                        icon: '⏰',
                        duration: 6000,
                        position: 'top-center',
                        style: { borderRadius: '1rem', background: '#FFF1F2', border: '1px solid #FECDD3', color: '#BE123C', fontWeight: '800' }
                    });
                    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                    audio.play().catch(() => {});
                }
            }
        }
    }, [timers, activeTimerId, allTasksFlat]);

    const getNextTaskForPlan = (plan: StudyPlan) => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const todaySession = plan.sessions.find(s => s.date.toString().split('T')[0] === todayStr);

        if (!todaySession) return null;

        let currentStartTime = new Date();
        let studyStartHour = 9, studyStartMin = 0;
        const workDays = plan.internshipDays || [];

        if (plan.internshipStartTime && plan.internshipEndTime && workDays.length > 0) {
            const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' });
            if (workDays.includes(dayOfWeek)) {
                const [h, m] = plan.internshipEndTime.split(':').map(Number);
                if (!isNaN(h) && !isNaN(m)) {
                    studyStartHour = (h + 1) % 24;
                    studyStartMin = m;
                }
            }
        }
        currentStartTime.setHours(studyStartHour, studyStartMin, 0, 0);

        for (let i = 0; i < todaySession.subjects.length; i++) {
            const subject = todaySession.subjects[i];
            const taskStartTime = new Date(currentStartTime);
            const durationMins = subject.durationMinutes || Math.round((subject.durationHours || 1) * 60);
            
            // Check status first - we want the first non-completed one
            if (subject.status !== 'completed') {
                return {
                    taskId: `${todaySession._id}-${i}`,
                    title: subject.title || subject.topic || subject.subjectName,
                    subject: subject.subjectName || 'Scheduled Session',
                    time: taskStartTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                };
            }
            
            // Increment start time for the next subject in loop
            currentStartTime = new Date(currentStartTime.getTime() + durationMins * 60000);
        }
        return null;
    };

    useEffect(() => {
        if (viewMode !== 'schedule' || !selectedPlan) return;
        if (pendingFocusTaskId || highlightedTaskId) return;

        const next = getNextTaskForPlan(selectedPlan);
        if (!next) return;

        queueTaskFocusFromNotification(next.taskId, selectedPlan._id);
    }, [viewMode, selectedPlan?._id, plans, pendingFocusTaskId, highlightedTaskId]);

    // ── Reminder Engine ───────────────────────────────────────────────
    useEffect(() => {
        if (!notificationsEnabled || !selectedPlan) return;

        const checkReminders = () => {
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];
            const todaySession = selectedPlan.sessions.find(s => s.date.toString().split('T')[0] === todayStr);

            if (!todaySession) return;

            // Recalculate times to find upcoming task
            let currentStartTime = new Date();
            let studyStartHour = 9, studyStartMin = 0;
            const workDays = selectedPlan.internshipDays || [];

            if (selectedPlan.internshipStartTime && selectedPlan.internshipEndTime && workDays.length > 0) {
                const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' });
                if (workDays.includes(dayOfWeek)) {
                    const [h, m] = selectedPlan.internshipEndTime.split(':').map(Number);
                    if (!isNaN(h) && !isNaN(m)) {
                        studyStartHour = (h + 1) % 24;
                        studyStartMin = m;
                    }
                }
            }
            currentStartTime.setHours(studyStartHour, studyStartMin, 0, 0);

            for (let i = 0; i < todaySession.subjects.length; i++) {
                const subject = todaySession.subjects[i];
                const taskStartTime = new Date(currentStartTime);
                const durationMins = subject.durationMinutes || Math.round((subject.durationHours || 1) * 60);
                
                // Move currentStartTime for next iteration
                currentStartTime = new Date(currentStartTime.getTime() + durationMins * 60000);

                const taskId = `${todaySession._id}-${i}`;
                const diffMs = taskStartTime.getTime() - now.getTime();
                
                // If task starts within the next 2 minutes (120000ms) and we haven't notified for it
                if (diffMs > 0 && diffMs < 120000 && lastNotifiedTask !== taskId) {
                    setLastNotifiedTask(taskId);
                    const startTimeStr = taskStartTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                    
                    // Set In-App Alert
                    setActiveAlert({
                        id: taskId,
                        title: subject.title || subject.topic || "Study Session",
                        subject: subject.subjectName,
                        time: startTimeStr,
                        planId: selectedPlan._id
                    });

                    const notification = new Notification("Study Session Starting!", {
                        body: `Next: ${subject.title} at ${startTimeStr}`,
                        icon: '/favicon.ico',
                        silent: false
                    });

                    // Sound alert (gentle chime)
                    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                    audio.play().catch(e => console.warn("Audio play failed", e));
                    
                    notification.onclick = () => {
                        window.focus();
                        queueTaskFocusFromNotification(taskId, selectedPlan._id);
                        setActiveAlert(null); // Dismiss in-app alert when notification is clicked
                        notification.close();
                    };
                }
            }
        };

        const timer = setInterval(checkReminders, 30000); // Check every 30 seconds
        return () => clearInterval(timer);
    }, [notificationsEnabled, selectedPlan, lastNotifiedTask, viewMode]);

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) {
            toast.error("Browser does not support notifications");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            setNotificationsEnabled(true);
            toast.success("Reminders active with sound alerts!");
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
            audio.play().catch(() => {});
        } else {
            toast.error("Notification permission denied");
        }
    };
    
    // Sync local work settings when a plan is selected
    useEffect(() => {
        if (selectedPlan) {
            if (selectedPlan.internshipDays && selectedPlan.internshipDays.length > 0) {
                setWorkEnabled(true);
                setSelectedWorkDays(selectedPlan.internshipDays);
                if (selectedPlan.internshipStartTime) setWorkStartTime(selectedPlan.internshipStartTime);
                if (selectedPlan.internshipEndTime) setWorkEndTime(selectedPlan.internshipEndTime);
            } else if (selectedPlan.internshipStartTime || selectedPlan.internshipEndTime) {
                // Fallback for older plans that might have times but no day list
                setWorkEnabled(true);
            }
        }
    }, [selectedPlan?._id]);

    const internshipLoadLabel = useMemo(() => {
        if (planInput.internshipHoursPerDay && planInput.internshipDaysPerWeek) {
            return `${planInput.internshipDaysPerWeek}d/w · ${planInput.internshipHoursPerDay}h`;
        }
        return `${derivedAvailableHours}h/day`;
    }, [planInput.internshipDaysPerWeek, planInput.internshipHoursPerDay, derivedAvailableHours]);

    const handleFileSelect = (files: FileList | File[] | null) => {
        if (!files) return;
        const newFiles = Array.isArray(files) ? files : Array.from(files);
        setDocuments((prev) => {
            const names = new Set(prev.map((f) => f.name));
            const merged = [...prev];
            newFiles.forEach((f) => {
                if (!names.has(f.name)) merged.push(f);
            });
            return merged;
        });
    };

    const handleTimetableSelect = (files: FileList | File[] | null) => {
        if (!files) return;
        const newFiles = Array.isArray(files) ? files : Array.from(files);
        setTimetableFiles((prev) => {
            const names = new Set(prev.map((f) => f.name));
            const merged = [...prev];
            newFiles.forEach((f) => {
                if (!names.has(f.name)) merged.push(f);
            });
            return merged;
        });
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelect(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const handleTimetableDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleTimetableSelect(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    };

    const handleCreatePlan = async () => {
        if (!planInput.title.trim()) {
            setTitleError('The title is required');
            toast.error('Add a plan title');
            return;
        }
        setTitleError(null);

        if (!planInput.examStartDate || !planInput.examEndDate) {
            toast.error('Exam start and end dates are required');
            return;
        }

        setIsCreating(true);
        setGenerationStage('Analyzing your uploaded documents...');
        
        let localStageIdx = 0;
        const loadStages = ['Balancing study and work schedule...', 'Generating your personalized plan...'];
        const stageInterval = setInterval(() => {
            if (localStageIdx < loadStages.length) {
                setGenerationStage(loadStages[localStageIdx]);
                localStageIdx++;
            }
        }, 3000);

        try {
            const allFiles = [...documents, ...timetableFiles];
            const safeTitle = planInput.title.trim() || `Study plan ${new Date().toISOString().slice(0, 10)}`;
            const derivedHours = derivedAvailableHours || Number(planInput.availableHoursPerDay) || 4;

            const payload: CreateStudyPlanInput = {
                ...planInput,
                title: safeTitle,
                // Keep user-entered subjects as hints even when uploading docs so AI can blend both
                subjects: planInput.subjects,
                availableHoursPerDay: derivedHours,
                internshipStartTime: workStartTime,
                internshipEndTime: workEndTime,
                internshipDays: selectedWorkDays,
            };

            if (allFiles.length === 0 && planInput.subjects.length === 0) {
                toast.error('Upload study docs or add at least one subject');
                return;
            }
            let created: StudyPlan;
            if (allFiles.length > 0) {
                const formData = new FormData();
                formData.append('title', payload.title);
                formData.append('examStartDate', payload.examStartDate);
                formData.append('examEndDate', payload.examEndDate);
                formData.append('availableHoursPerDay', String(payload.availableHoursPerDay ?? 4));
                if (payload.internshipStartTime) formData.append('internshipStartTime', payload.internshipStartTime);
                if (payload.internshipEndTime) formData.append('internshipEndTime', payload.internshipEndTime);
                if (payload.internshipHoursPerDay) formData.append('internshipHoursPerDay', String(payload.internshipHoursPerDay));
                if (payload.internshipDaysPerWeek) formData.append('internshipDaysPerWeek', String(payload.internshipDaysPerWeek));
                if (payload.internshipDays) {
                    payload.internshipDays.forEach(day => formData.append('internshipDays', day));
                }
                formData.append('subjects', JSON.stringify(payload.subjects));
                allFiles.forEach((file) => formData.append('studyDocs', file));

                created = await createStudyPlanWithDocs(formData);
            } else {
                created = await createStudyPlan(payload);
            }

            let removedPreviousPlan = false;
            const previousPlanId = regenerateFromPlanId;

            if (previousPlanId && previousPlanId !== created._id) {
                try {
                    await deleteStudyPlan(previousPlanId);
                    removedPreviousPlan = true;
                } catch (deleteErr) {
                    toast.error('New plan created, but failed to remove the previous plan.');
                }
            }

            if (!planInput.title.trim()) {
                setPlanInput((prev) => ({ ...prev, title: safeTitle }));
            }

            if (removedPreviousPlan) {
                toast.success('Study plan regenerated and previous plan removed');
            } else {
                toast.success('Study plan generated');
            }

            setPlans((prev) => {
                const withoutCreated = prev.filter((p) => p._id !== created._id);
                const withoutPrevious = removedPreviousPlan && previousPlanId
                    ? withoutCreated.filter((p) => p._id !== previousPlanId)
                    : withoutCreated;
                return [created, ...withoutPrevious];
            });

            setRegenerateFromPlanId(null);
            setSelectedPlanId(created._id);
            setViewMode('builder');
            setCurrentStep(3);
            setJustGenerated(true);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Could not generate study plan');
        } finally {
            clearInterval(stageInterval);
            setIsCreating(false);
            setGenerationStage(null);
        }
    };

    const handleSaveTaskTime = async () => {
        if (!selectedPlan || !editingTaskTime) return;

        if (editingTaskTime.date && editingTaskTime.date < todayISO) {
            toast.error('You cannot move a task to a past date. Choose today or a future date.');
            return;
        }

        if (editingTaskTime.customStartTime) {
            const targetSession = selectedPlan.sessions.find(s => 
                new Date(s.date).toISOString().split('T')[0] === editingTaskTime.date
            ) || { _id: 'temp', subjects: [] };

            const [editH, editM] = editingTaskTime.customStartTime.split(':').map(Number);
            const editStart = editH * 60 + editM;
            const editEnd = editStart + editingTaskTime.durationMinutes;

            let nominalMins = 9 * 60;
            const mappedSubjects = targetSession.subjects.map((sub, i) => {
                const dur = sub.durationMinutes || Math.round((sub.durationHours || 1) * 60);
                let sStart = nominalMins;

                if (sub.customStartTime) {
                    const [h, m] = sub.customStartTime.split(':').map(Number);
                    if (!isNaN(h) && !isNaN(m)) sStart = h * 60 + m;
                }
                nominalMins += dur;
                return { isSelf: (targetSession._id === editingTaskTime.sessionId && i === editingTaskTime.subjectIdx), title: sub.topic || 'Task', start: sStart, end: sStart + dur };
            });

            for (const mSub of mappedSubjects) {
                if (mSub.isSelf) continue;
                if (editStart < mSub.end && editEnd > mSub.start) {
                    toast.error(`Cannot save. Time slot overlaps with "${mSub.title}".`);
                    return;
                }
            }
        }

        try {
            const updated = await updateSubjectTime(selectedPlan._id, editingTaskTime.sessionId, editingTaskTime.subjectIdx, {
                date: editingTaskTime.date,
                customStartTime: editingTaskTime.customStartTime || null,
                durationMinutes: editingTaskTime.durationMinutes
            });
            setPlans((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));

            setEditingTaskTime(null);
            toast.success('Task date and time updated');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update time');
        }
    };

    const handleStatusChange = async (sessionId: string, subjectIdx: number, status: StudyTaskStatus) => {
        if (!selectedPlan) return null;
        try {
            const updated = await updateSubjectStatus(selectedPlan._id, sessionId, subjectIdx, status);
            setPlans((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
            const labels: Record<StudyTaskStatus, string> = { pending: 'Set to pending', 'in-progress': 'Started', completed: 'Completed!' };
            toast.success(labels[status]);
            return updated;
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Could not update status');
            return null;
        }
    };

    const handleRegeneratePlan = () => {
        if (!selectedPlan) return;
        setRegenerateFromPlanId(selectedPlan._id);
        
        setPlanInput({
            title: selectedPlan.title,
            examStartDate: selectedPlan.examStartDate ? new Date(selectedPlan.examStartDate).toISOString().split('T')[0] : todayISO,
            examEndDate: selectedPlan.examEndDate ? new Date(selectedPlan.examEndDate).toISOString().split('T')[0] : '',
            subjects: selectedPlan.subjects || [],
            availableHoursPerDay: selectedPlan.availableHoursPerDay || 4,
            internshipStartTime: selectedPlan.internshipStartTime || '',
            internshipEndTime: selectedPlan.internshipEndTime || '',
            internshipHoursPerDay: selectedPlan.internshipHoursPerDay || 0,
            internshipDaysPerWeek: selectedPlan.internshipDaysPerWeek || 0,
            internshipDays: selectedPlan.internshipDays || [],
        });
        
        setWorkEnabled(!!selectedPlan.internshipStartTime);
        setSelectedWorkDays(selectedPlan.internshipDays || []);
        setViewMode('builder');
        setCurrentStep(2);
        toast.success('Retrieved settings. You can now tweak and regenerate!');
    };

    const handleDeletePlan = async (planId: string) => {
        const plan = plans.find((p) => p._id === planId);
        const name = plan?.title || 'this plan';
        if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
        setDeletingPlanId(planId);
        try {
            await deleteStudyPlan(planId);
            setPlans((prev) => prev.filter((p) => p._id !== planId));
            if (selectedPlanId === planId) {
                const next = plans.find((p) => p._id !== planId) || null;
                setSelectedPlanId(next?._id || null);
                if (viewMode === 'schedule') setViewMode('plans');
            }
            toast.success('Plan deleted');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Could not delete plan');
        } finally {
            setDeletingPlanId(null);
        }
    };

    const totalHours = selectedPlan?.sessions?.reduce((s, sess) => s + (sess.totalStudyHours || 0), 0) || 0;

    const handleStartTimer = (taskId: string, sessionId?: string, subjectIdx?: number) => {
        startTimer(taskId);
        setOpenTrackerId(taskId);
        if (sessionId && typeof subjectIdx === 'number') {
            handleStatusChange(sessionId, subjectIdx, 'in-progress');
        }
    };

    const handlePauseTimer = (taskId: string) => {
        pauseTimer(taskId);
    };

    const handleResetTimer = (taskId: string) => {
        resetTimer(taskId);
    };

    const handleCompleteTask = async (sessionId: string, subjectIdx: number, taskId: string) => {
        const updatedPlan = await handleStatusChange(sessionId, subjectIdx, 'completed');
        completeTimer(taskId);

        // Auto-trigger next task alert
        if (updatedPlan) {
            const next = getNextTaskForPlan(updatedPlan);
            if (next) {
                setActiveAlert({
                    id: next.taskId,
                    title: next.title,
                    subject: next.subject,
                    time: next.time,
                    planId: updatedPlan._id
                });
                queueTaskFocusFromNotification(next.taskId, updatedPlan._id);
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
                audio.volume = 0.5;
                audio.play().catch(() => {});
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 relative">
            {/* ── Global In-App Alert Banner ── */}
            {activeAlert && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-2xl animate-pop-in px-4 pointer-events-none">
                    <div className="bg-slate-900 text-white rounded-[2rem] p-4 pr-5 shadow-[0_30px_70px_-15px_rgba(30,58,138,0.5)] border-2 border-blue-500/40 backdrop-blur-xl flex items-center justify-between gap-6 relative overflow-hidden group pointer-events-auto ring-1 ring-white/10 animate-bounce-subtle">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent bg-[length:200%_100%] animate-shimmer pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent pointer-events-none" />
                        
                        <div className="flex items-center gap-4 relative z-10 shrink-0">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 animate-pulse">
                                <Bell size={24} className="text-white" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 flex items-center gap-1.5 drop-shadow-sm">
                                    <Sparkles size={11} className="animate-spin-slow" /> Next Mission
                                </p>
                                <h4 className="text-sm font-bold tracking-tight leading-none text-white max-w-[200px] truncate">{activeAlert.title}</h4>
                                <div className="flex items-center gap-2.5 mt-1.5">
                                    <span className="text-[9px] font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">{activeAlert.subject}</span>
                                    <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                                        <Clock size={12} /> {activeAlert.time}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 relative z-10 shrink-0">
                            <button 
                                onClick={() => {
                                    queueTaskFocusFromNotification(activeAlert.id, activeAlert.planId);
                                    setActiveAlert(null);
                                }}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-110 active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-2"
                            >
                                <Play size={14} fill="currentColor" /> Enter Studio
                            </button>
                            <button 
                                onClick={() => setActiveAlert(null)}
                                className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 cursor-pointer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Premium Header ── */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 shadow-2xl md:p-12">

                <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 ring-1 ring-inset ring-blue-500/20">
                            <Brain size={14} className="animate-pulse" />
                            AI Study Planner
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                                Study Plan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Generator</span>
                            </h1>
                            <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
                                Create your perfect study schedule. Our AI turns your study materials and timetable into an easy-to-follow plan.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 border border-white/10">
                                <Activity size={16} className="text-emerald-400" />
                                <span className="text-sm font-semibold text-slate-300">System: Online</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 border border-white/10">
                                <Zap size={16} className="text-blue-400" />
                                <span className="text-sm font-semibold text-slate-300">Powered by AI</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <button
                            onClick={() => setViewMode('plans')}
                            className="btn-premium flex items-center justify-center gap-4 group/plans"
                        >
                            <Layout size={20} className="text-blue-400 group-hover/plans:text-blue-300 transition-colors" />
                            <span className="relative">
                                My Study Plans
                                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-blue-400 transition-all duration-300 group-hover/plans:w-full" />
                            </span>
                            <span className="flex min-w-[24px] h-6 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-[10px] font-black text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] ring-2 ring-blue-400/20 group-hover/plans:ring-blue-400 transition-all">
                                {plans.length}
                            </span>
                        </button>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-ghost inline-flex items-center gap-2 text-sm"
                        >
                            <ArrowLeft size={16} />
                            Back to dashboard
                        </button>
                    </div>
                </div>
            </div>

            <>
            {viewMode === 'builder' && (
                <div className="space-y-8 animate-slide-in">
                    {/* ── Premium Stepper ── */}
                    <div className="relative overflow-hidden rounded-[2rem] bg-slate-900/5 p-6 border border-slate-200/60 backdrop-blur-sm">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
                            <div className="flex items-center gap-6">
                                {[1, 2, 3].map((step) => (
                                    <React.Fragment key={step}>
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-xs transition-all duration-500 ${
                                                currentStep === step
                                                    ? 'bg-slate-900 text-white shadow-[0_10px_20px_-5px_rgba(15,23,42,0.3)] scale-110 ring-4 ring-blue-500/10'
                                                    : step < (currentStep as number)
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-white text-slate-400 border border-slate-200'
                                            }`}>
                                                {step < (currentStep as number) ? <CheckCircle2 size={16} /> : `0${step}`}
                                            </div>
                                            <div className="hidden lg:block">
                                                <p className={`text-[10px] font-bold uppercase tracking-wider ${
                                                    currentStep === step ? 'text-slate-900' : 'text-slate-400'
                                                }`}>
                                                    Phase {step}
                                                </p>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {step === 1 ? 'Resources' : step === 2 ? 'Logic' : 'Deployment'}
                                                </p>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={prefillDemoPlan}
                                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-50 border border-slate-200/50 shadow-sm"
                                >
                                    <Sparkles size={14} className="text-amber-500" />
                                    Use Example
                                </button>
                                <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />
                                <div className="text-right hidden sm:block">
                                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Progress</p>
                                    <p className="text-xs font-bold text-slate-900">{Math.round((currentStep / 3) * 100)}% COMPLETE</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Steps */}
                    {currentStep === 1 && (
                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Study Materials Upload */}
                            <div className="premium-card p-10 group overflow-hidden bg-white">
                                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/5 blur-[80px] group-hover:bg-blue-500/10 transition-colors" />
                                <div className="relative space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Study Materials</h3>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upload notes for AI to read</p>
                                        </div>
                                    </div>
                                    
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        className="relative rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 p-10 text-center transition-all hover:border-blue-300 hover:bg-blue-50/50"
                                    >
                                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white shadow-xl shadow-blue-900/5 ring-1 ring-slate-100 group-hover:scale-110 transition-transform">
                                            <Upload className="text-blue-600" size={32} />
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">Drop your syllabus or slides</p>
                                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider">PDF, PPTX, or Markdown</p>
                                        <label className="mt-8 btn-premium inline-flex cursor-pointer items-center justify-center gap-3">
                                            <input
                                                type="file"
                                                className="hidden"
                                                multiple
                                                accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.md,.json"
                                                onChange={(e) => handleFileSelect(e.target.files)}
                                            />
                                            Select Files
                                        </label>
                                    </div>

                                    {documents.length > 0 && (
                                        <div className="grid gap-3">
                                            {documents.map((file) => (
                                                <div key={file.name} className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-bold text-slate-900">{file.name}</p>
                                                        <p className="text-[10px] text-slate-500">{Math.round(file.size / 1024)} KB</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setDocuments((prev) => prev.filter((f) => f.name !== file.name))}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Timetable Upload */}
                            <div className="premium-card p-10 group overflow-hidden bg-white">
                                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-purple-500/5 blur-[80px] group-hover:bg-purple-500/10 transition-colors" />
                                <div className="relative space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110">
                                            <CalendarClock size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Exam Schedule</h3>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add your exam dates</p>
                                        </div>
                                    </div>
                                    
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleTimetableDrop}
                                        className="relative rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 p-10 text-center transition-all hover:border-purple-300 hover:bg-purple-50/50"
                                    >
                                        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white shadow-xl shadow-purple-900/5 ring-1 ring-slate-100 group-hover:scale-110 transition-transform">
                                            <Calendar className="text-purple-600" size={32} />
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">Sync your exam dates</p>
                                        <p className="mt-1 text-xs font-semibold uppercase tracking-wider">AI will prioritize your subjects</p>
                                        <label className="mt-8 btn-premium inline-flex cursor-pointer items-center justify-center gap-3">
                                            <input
                                                type="file"
                                                className="hidden"
                                                multiple
                                                accept=".pdf,.png,.jpg,.jpeg,.csv,.xls,.xlsx,.txt,.md,.json,.doc,.docx"
                                                onChange={(e) => handleTimetableSelect(e.target.files)}
                                            />
                                            Upload Timetable
                                        </label>
                                    </div>

                                    {timetableFiles.length > 0 && (
                                        <div className="grid gap-3">
                                            {timetableFiles.map((file) => (
                                                <div key={file.name} className="flex items-center gap-3 rounded-2xl bg-white p-3 border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                                        <Calendar size={14} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-bold text-slate-900">{file.name}</p>
                                                        <p className="text-[10px] text-slate-500">{Math.round(file.size / 1024)} KB</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setTimetableFiles((prev) => prev.filter((f) => f.name !== file.name))}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Global Navigation - Step 1 */}
                            <div className="md:col-span-2 flex items-center justify-between mt-4">
                                <p className="text-xs font-medium text-slate-400 italic">Step 1: Upload your materials</p>
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="flex items-center gap-2 rounded-[2rem] bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                                >
                                    Next Step
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="grid gap-8 lg:grid-cols-12">
                            {/* LEFT SIDE: Inputs */}
                            <div className="space-y-6 lg:col-span-7">
                                <div className="rounded-[2.5rem] bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">Study Settings</h3>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Set your availability</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 group flex items-center gap-2 cursor-help relative">
                                                    Plan Name
                                                    <Info size={14} className="text-slate-300 peer" />
                                                    <div className="absolute left-1/2 -top-8 -translate-x-1/2 opacity-0 peer-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-medium whitespace-nowrap pointer-events-none z-10">Give your plan a memorable name</div>
                                                </label>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <input
                                                    type="text"
                                                    className={`w-full rounded-2xl border bg-slate-50 px-6 py-4 text-sm font-bold text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 ${
                                                        titleError ? 'border-rose-200 ring-2 ring-rose-500/10' : 'border-slate-100'
                                                    }`}
                                                    placeholder="e.g., End-of-Semester Sprint"
                                                    value={planInput.title}
                                                    onChange={(e) => {
                                                        const next = e.target.value;
                                                        setPlanInput({ ...planInput, title: next });
                                                        if (next.trim()) setTitleError(null);
                                                    }}
                                                />
                                                <div className="flex flex-wrap gap-2">
                                                    {['Final Exam Prep', 'Midterm Grind', 'Weekly Refresh', 'Sprint Plan'].map(chip => (
                                                        <button 
                                                            key={chip}
                                                            onClick={() => {
                                                                setPlanInput({ ...planInput, title: chip });
                                                                setTitleError(null);
                                                            }}
                                                            className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                        >
                                                            {chip}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {titleError && (
                                                <p className="text-[10px] font-bold uppercase tracking-tighter text-rose-500 animate-in fade-in slide-in-from-left-2">{titleError}</p>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 group flex items-center gap-2 cursor-help relative">
                                                Study Timeline
                                                <Info size={14} className="text-slate-300 peer" />
                                                <div className="absolute left-1/2 -top-8 -translate-x-1/2 opacity-0 peer-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-medium whitespace-nowrap pointer-events-none z-10">Study from today until your exams begin</div>
                                            </label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <p className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 rounded">Study Start</p>
                                                    <input
                                                        type="date"
                                                        className="w-full rounded-2xl border-2 border-slate-100 bg-transparent px-4 py-4 text-sm font-bold text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                        min={todayISO}
                                                        value={planInput.examStartDate}
                                                        onChange={(e) => setPlanInput({ ...planInput, examStartDate: clampToToday(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <p className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 rounded">Exam Date Start</p>
                                                    <input
                                                        type="date"
                                                        className="w-full rounded-2xl border-2 border-slate-100 bg-transparent px-4 py-4 text-sm font-bold text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                        min={planInput.examStartDate || todayISO}
                                                        value={planInput.examEndDate}
                                                        onChange={(e) => setPlanInput({ ...planInput, examEndDate: clampToToday(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-slate-100 mt-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Study Goal</label>
                                                <span className="text-blue-600 font-bold text-lg">{manualHoursOverride ? planInput.availableHoursPerDay : derivedAvailableHours} <span className="text-sm text-slate-400 font-semibold">hours/day</span></span>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <input
                                                    type="range"
                                                    min={1}
                                                    max={12}
                                                    step={0.5}
                                                    value={manualHoursOverride ? planInput.availableHoursPerDay : derivedAvailableHours}
                                                    onChange={(e) => {
                                                        setManualHoursOverride(true);
                                                        setPlanInput((prev) => ({ ...prev, availableHoursPerDay: Number(e.target.value) }));
                                                    }}
                                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                                />
                                                <div className="flex justify-between text-[10px] font-semibold mt-2 px-1">
                                                    <span>Light (1h)</span>
                                                    <span>Intense (12h)</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-100 mt-2">
                                            <div className="flex items-center justify-between bg-white border-2 border-slate-100 hover:border-blue-100 p-4 rounded-2xl transition-all cursor-pointer group" onClick={() => setWorkEnabled(!workEnabled)}>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">Work &amp; Internship Commitments</p>
                                                    <p className="text-xs font-medium text-slate-500 mt-0.5">Enable if you have a job or internship.</p>
                                                </div>
                                                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${workEnabled ? 'bg-blue-600' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${workEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                            </div>

                                            {workEnabled && (
                                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2 space-y-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Days per Week</label>
                                                            <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider">{selectedWorkDays.length} {selectedWorkDays.length === 1 ? 'day' : 'days'} selected</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                                                const isWeekend = day === 'Sat' || day === 'Sun';
                                                                const isSelected = selectedWorkDays.includes(day);
                                                                return (
                                                                    <button
                                                                        key={day}
                                                                        onClick={() => {
                                                                            let newDays: string[];
                                                                            if (isSelected) {
                                                                                newDays = selectedWorkDays.filter(d => d !== day);
                                                                            } else {
                                                                                newDays = [...selectedWorkDays, day];
                                                                            }
                                                                            setSelectedWorkDays(newDays);
                                                                            handleInternshipLoadChange('internshipDaysPerWeek', newDays.length);
                                                                        }}
                                                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm active:scale-95 ${
                                                                            isSelected 
                                                                                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200' 
                                                                                : isWeekend
                                                                                    ? 'bg-amber-50/50 text-amber-700/80 border-amber-100/60 hover:bg-amber-100/50 hover:text-amber-800'
                                                                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300'
                                                                        }`}
                                                                    >
                                                                        {day}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        {selectedWorkDays.length > 5 && (
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50/80 border border-amber-100/60 p-2.5 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                                                <Info size={14} className="shrink-0" />
                                                                High workload may affect your study balance
                                                            </p>
                                                        )}
                                                    </div>
                                                    
                                                    <div className={`space-y-4 pt-4 border-t border-slate-200 transition-opacity duration-300 ${selectedWorkDays.length === 0 ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hours per Day</label>
                                                            <span className="text-slate-900 font-bold bg-white px-2 py-1 rounded-md text-xs border border-slate-200 shadow-sm">{planInput.internshipHoursPerDay} <span className="text-slate-400 font-medium">hours</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-3 px-1">
                                                            <div className="flex-1 space-y-1.5">
                                                                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block px-1">Start Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={workStartTime}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setWorkStartTime(val);
                                                                        setPlanInput(prev => ({ ...prev, internshipStartTime: val }));
                                                                        const h1 = val.split(':').map(Number);
                                                                        const h2 = workEndTime.split(':').map(Number);
                                                                        if (h1.length === 2 && h2.length === 2) {
                                                                            let diff = (h2[0] + h2[1]/60) - (h1[0] + h1[1]/60);
                                                                            if (diff < 0) diff += 24;
                                                                            handleInternshipLoadChange('internshipHoursPerDay', Math.max(0, Math.round(diff * 2) / 2));
                                                                        }
                                                                    }}
                                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="text-slate-300 font-bold mt-5 shrink-0">-</div>
                                                            <div className="flex-1 space-y-1.5">
                                                                <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block px-1">End Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={workEndTime}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setWorkEndTime(val);
                                                                        setPlanInput(prev => ({ ...prev, internshipEndTime: val }));
                                                                        const h1 = workStartTime.split(':').map(Number);
                                                                        const h2 = val.split(':').map(Number);
                                                                        if (h1.length === 2 && h2.length === 2) {
                                                                            let diff = (h2[0] + h2[1]/60) - (h1[0] + h1[1]/60);
                                                                            if (diff < 0) diff += 24;
                                                                            handleInternshipLoadChange('internshipHoursPerDay', Math.max(0, Math.round(diff * 2) / 2));
                                                                        }
                                                                    }}
                                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>


                            </div>

                            {/* RIGHT SIDE: Smart Insights Panel */}
                            <div className="space-y-6 lg:col-span-5 relative">
                                <div className="sticky top-8 space-y-6">
                                    {/* Summary Card */}
                                    <div className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                                        <h4 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <Activity size={18} className="text-blue-600" />
                                            Plan Summary
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Time to Exam</p>
                                                <p className="text-2xl font-bold text-slate-900">{daysUntilExam} <span className="text-sm text-slate-500 font-medium">days</span></p>
                                            </div>
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Study Hours</p>
                                                <p className="text-2xl font-bold text-slate-900">{totalStudyHoursAvailable} <span className="text-sm text-slate-500 font-medium">hrs</span></p>
                                            </div>
                                        </div>
                                        
                                        <div className={`mt-4 rounded-2xl p-4 flex items-center justify-between transition-colors ${workloadScore.barCol} border border-transparent`}>
                                            <div>
                                                <p className={`text-[10px] font-bold uppercase tracking-wider ${workloadScore.color}`}>Overall Workload</p>
                                                <p className={`text-lg font-bold ${workloadScore.color}`}>{workloadScore.text}</p>
                                            </div>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm ${workloadScore.color}`}>
                                                <Zap size={20} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Assistant Box */}
                                    <div className="rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute -top-6 -right-6 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                                            <Brain size={120} />
                                        </div>
                                        <h4 className="text-sm font-bold mb-6 flex items-center gap-2 text-blue-400">
                                            <Sparkles size={18} />
                                            AI Suggestions
                                        </h4>
                                        <div className="space-y-3 relative z-10">
                                            {aiSuggestions.map((tip, i) => (
                                                <div key={i} className="flex gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 100}ms` }}>
                                                    <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                                    <p className="text-xs font-medium text-slate-200 leading-relaxed">{tip}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Generation Button Area */}
                                    <div className="space-y-4 pt-4">
                                        <button
                                            onClick={() => setCurrentStep(3)}
                                            disabled={isCreating}
                                            className="w-full px-6 py-5 rounded-[2rem] bg-blue-600 text-white text-sm font-bold uppercase tracking-wider hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1 transition-all disabled:opacity-80 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed group relative overflow-hidden"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                Review & Generate <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </button>
                                        <button onClick={() => setCurrentStep(1)} className="w-full py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1">
                                            <ChevronLeft size={14} /> Go Back
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="card p-6 space-y-4 lg:col-span-2">
                                <div className="flex items-center gap-3">
                                    <Clock className="text-indigo-600" size={20} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Review & Create</p>
                                        <p className="text-xs text-slate-500">One click to create your schedule.</p>
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3 text-center">
                                    <div className="rounded-xl bg-blue-50 p-3">
                                        <p className="text-xs text-slate-500">Exam window</p>
                                        <p className="text-sm font-bold text-slate-900 truncate">{planInput.examStartDate || '--'} → {planInput.examEndDate || '--'}</p>
                                    </div>
                                    <div className="rounded-xl bg-indigo-50 p-3">
                                        <p className="text-xs text-slate-500">Internship load</p>
                                        <p className="text-lg font-bold text-slate-900">{planInput.internshipDaysPerWeek}d/w · {planInput.internshipHoursPerDay}h</p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-50 p-3">
                                        <p className="text-xs text-slate-500">Daily study hours</p>
                                        <p className="text-lg font-bold text-slate-900">{derivedAvailableHours}h</p>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-700">
                                    Your personalized study plan is ready! We’ll balance internship {internshipLoadLabel} and study blocks so you can stay calm and focused.
                                </div>
                                {justGenerated && selectedPlan && (
                                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                                        Plan generated successfully. You can adjust inputs or jump to the schedule.
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setCurrentStep(2)} className="btn-secondary text-sm">Back to edit</button>
                                    <button
                                        onClick={handleCreatePlan}
                                        disabled={isCreating}
                                        className="btn-primary inline-flex items-center gap-2 text-sm"
                                    >
                                        {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                        Generate Study Plan
                                    </button>
                                    {justGenerated && selectedPlan && (
                                        <button
                                            onClick={() => setViewMode('schedule')}
                                            className="btn-secondary inline-flex items-center gap-2 text-sm"
                                        >
                                            <CheckCircle2 size={14} />
                                            View schedule
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="card p-5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Active plans</p>
                                            <p className="text-xs text-slate-500">Tap to view schedule</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={requestNotificationPermission}
                                                className={`rounded-full p-2.5 transition-all shadow-sm flex items-center gap-2 text-xs font-bold ${
                                                    notificationsEnabled 
                                                    ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' 
                                                    : 'bg-slate-50 text-slate-400 ring-1 ring-slate-200 hover:text-blue-500 hover:ring-blue-200'
                                                }`}
                                                title={notificationsEnabled ? "Notifications Active" : "Enable Reminders"}
                                            >
                                                {notificationsEnabled ? <Bell size={15} /> : <BellOff size={15} />}
                                                <span className="sr-only">Toggle Reminders</span>
                                                {notificationsEnabled && <Volume2 size={13} className="animate-pulse" />}
                                            </button>
                                            {isLoadingPlans && <Loader2 size={16} className="animate-spin text-slate-400" />}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {plans.length === 0 ? (
                                            <p className="text-sm text-slate-500">No plans yet. Generate to see the schedule.</p>
                                        ) : (() => {
                                            const sortedPlans = [...plans].sort((a, b) => 
                                                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                                            );
                                            
                                            // Only the single most recent plan is marked as Active.
                                            const active = sortedPlans.filter((_, i) => i === 0);
                                            const history = sortedPlans.filter((_, i) => i !== 0);

                                            return (
                                                <>
                                                    {/* Active Plans Section */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 px-1">
                                                            <Activity size={14} className="text-blue-500" />
                                                            <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.1em]">Current Objectives</p>
                                                        </div>
                                                        {active.map((plan) => (
                                                            <div
                                                                key={plan._id}
                                                                className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:-translate-y-0.5 ${
                                                                    selectedPlan?._id === plan._id 
                                                                        ? 'border-blue-300 bg-white shadow-xl shadow-blue-50' 
                                                                        : 'border-slate-100 bg-slate-50/10'
                                                                }`}
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedPlanId(plan._id);
                                                                            setViewMode('schedule');
                                                                        }}
                                                                        className="flex-1 text-left"
                                                                    >
                                                                        <div className="flex flex-col gap-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <p className="text-sm font-bold text-slate-900">{plan.title}</p>
                                                                                {sortedPlans.indexOf(plan) === 0 && (
                                                                                    <span className="bg-blue-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full tracking-tighter animate-pulse shadow-sm shadow-blue-200">NEWLY GENERATED</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <p className="text-[11px] uppercase tracking-wide text-slate-500 mt-1">
                                                                            {plan.totalStudyDays} days study period
                                                                        </p>
                                                                        <div className="mt-2 flex items-center justify-between">
                                                                            <div className="h-2 flex-1 max-w-[80px] overflow-hidden rounded-full bg-slate-200">
                                                                                <div
                                                                                    className="h-full bg-blue-600 transition-all duration-1000"
                                                                                    style={{ width: `${plan.overallProgress}%` }}
                                                                                />
                                                                            </div>
                                                                            <p className="text-xs font-bold text-blue-700 ml-3">{plan.overallProgress}%</p>
                                                                        </div>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeletePlan(plan._id)}
                                                                        disabled={deletingPlanId === plan._id}
                                                                        className="rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                                                        aria-label="Delete plan"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Inactive Plans Section */}
                                                    {history.length > 0 && (
                                                        <div className="space-y-3 pt-4 border-t border-slate-100">
                                                            <div className="flex items-center gap-2 px-1">
                                                                <Layout size={14} className="text-slate-400" />
                                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em]">Inactive Plans</p>
                                                            </div>
                                                            {history.map((plan) => (
                                                                <div
                                                                    key={plan._id}
                                                                    className={`w-full rounded-2xl border px-4 py-2.5 text-left transition bg-slate-50/50 opacity-60 hover:opacity-100 ${
                                                                        selectedPlan?._id === plan._id ? 'border-blue-300 bg-blue-50/10 opacity-100' : 'border-slate-50'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedPlanId(plan._id);
                                                                                setViewMode('schedule');
                                                                            }}
                                                                            className="flex-1 text-left"
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <p className="text-sm font-bold text-slate-700">{plan.title}</p>
                                                                                {plan.overallProgress === 100 && <CheckCircle2 size={12} className="text-emerald-500" />}
                                                                            </div>
                                                                            <p className="text-[10px] uppercase tracking-wide text-slate-400">
                                                                                Inactive • {new Date(plan.createdAt || 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                                            </p>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeletePlan(plan._id)}
                                                                            disabled={deletingPlanId === plan._id}
                                                                            className="rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                                                                            aria-label="Delete plan"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── My Plans List View ── */}
            {viewMode === 'plans' && (
                <div className="space-y-5 animate-slide-in">
                    <div className="card p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">My Study Plans</h2>
                            <p className="text-sm text-slate-500">You have {plans.length} saved plan{plans.length !== 1 ? 's' : ''}. Tap any plan to view its schedule.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setViewMode('builder'); setCurrentStep(1); }} className="btn-primary inline-flex items-center gap-2 text-sm">
                                <Plus size={16} />
                                Create New Plan
                            </button>
                        </div>
                    </div>

                    {isLoadingPlans && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 size={28} className="animate-spin text-blue-500" />
                        </div>
                    )}

                    <div className="space-y-12">
                        {(() => {
                            const sortedPlans = [...plans].sort((a, b) => 
                                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                            );
                            const active = sortedPlans.filter((_, i) => i === 0);
                            const inactive = sortedPlans.filter((_, i) => i !== 0);

                            const renderPlanCard = (plan: StudyPlan, isRecent: boolean, isHistory: boolean = false) => {
                                const planHours = plan.sessions?.reduce((s, sess) => s + (sess.totalStudyHours || 0), 0) || 0;
                                const totalTasks = plan.sessions?.reduce((s, sess) => s + sess.subjects.length, 0) || 0;
                                const completedTasks = plan.sessions?.reduce((s, sess) => s + sess.subjects.filter(sub => sub.status === 'completed' || sub.isCompleted).length, 0) || 0;
                                
                                return (
                                    <div
                                        key={plan._id}
                                        className={`card p-6 text-left transition-all hover:shadow-xl hover:-translate-y-0.5 space-y-5 animate-slide-in relative group ${
                                            isRecent ? 'ring-2 ring-blue-500/20 border-blue-200 bg-white' : isHistory ? 'opacity-70 grayscale-[0.3] bg-slate-50/50' : 'bg-white'
                                        }`}
                                    >
                                        {isRecent && (
                                            <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg items-center gap-2 flex">
                                                <Sparkles size={12} />
                                                FOCUS PLAN
                                            </div>
                                        )}
                                        {isHistory && plan.overallProgress === 100 && (
                                            <div className="absolute top-4 right-4 text-emerald-500">
                                                <CheckCircle2 size={24} />
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start gap-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedPlanId(plan._id);
                                                    setViewMode('schedule');
                                                }}
                                                className="flex-1 text-left space-y-5"
                                            >
                                                <div className="space-y-1">
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{plan.title}</h3>
                                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(plan.createdAt || 0).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 flex items-center gap-3">
                                                        <Calendar size={16} className="text-blue-500" />
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Timeline</p>
                                                            <p className="text-sm font-bold text-slate-900">{plan.totalStudyDays} Days</p>
                                                        </div>
                                                    </div>
                                                    <div className="rounded-2xl bg-slate-50 p-3 border border-slate-100 flex items-center gap-3">
                                                        <Clock size={16} className="text-indigo-500" />
                                                        <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Total</p>
                                                            <p className="text-sm font-bold text-slate-900">{formatHours(planHours)}h</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{completedTasks}/{totalTasks} COMPLETED</span>
                                                        <span className="text-sm font-black text-blue-600">{plan.overallProgress}%</span>
                                                    </div>
                                                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner p-0.5">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-1000 ease-out ${plan.overallProgress === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}
                                                            style={{ width: `${plan.overallProgress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan._id); }}
                                                disabled={deletingPlanId === plan._id}
                                                className="rounded-xl p-3 text-slate-300 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 border border-transparent hover:border-rose-100"
                                                aria-label="Delete plan"
                                            >
                                                {deletingPlanId === plan._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            };

                            return (
                                <div className="space-y-12">
                                    {active.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 px-2">
                                                <div className="h-px flex-1 bg-slate-100" />
                                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Primary Focus Plan</h3>
                                                <div className="h-px flex-1 bg-slate-100" />
                                            </div>
                                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                {active.map((p, i) => renderPlanCard(p, i === 0 && active.length > 0))}
                                            </div>
                                        </div>
                                    )}

                                    {inactive.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 px-2 opacity-60">
                                                <div className="h-px flex-1 bg-slate-100" />
                                                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Inactive Schedules</h3>
                                                <div className="h-px flex-1 bg-slate-100" />
                                            </div>
                                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                {inactive.map((p) => renderPlanCard(p, false, true))}
                                            </div>
                                        </div>
                                    )}

                                    {plans.length === 0 && !isLoadingPlans && (
                                        <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                                            <Sparkles size={48} className="mx-auto text-slate-200 mb-6" />
                                            <p className="text-lg font-bold text-slate-900">No active plans found</p>
                                            <p className="text-sm text-slate-500 mt-2">Generate a schedule in the builder to begin your journey.</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {viewMode === 'schedule' && selectedPlan && (
                <div className="space-y-10 animate-slide-in pb-20">
                    {/* Sync to Calendar Button OUTSIDE the schedule header box */}
                    <div className="flex justify-end mb-4 gap-4">
                        <button
                            onClick={handleGoogleSync}
                            disabled={isSyncing}
                            className={`flex h-[80px] px-8 items-center justify-center gap-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all border-2 shadow-sm hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isCalendarLinked
                                ? 'bg-blue-600 border-blue-500 text-white shadow-blue-200 hover:bg-blue-700'
                                : 'bg-white border-blue-500 text-blue-600 hover:bg-blue-50'
                            }`}
                        >
                            {isSyncing ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                isCalendarLinked ? <CalendarPlus size={18} /> : <Share2 size={18} />
                            )}
                            <div className="text-left leading-tight">
                                <p className="opacity-70 text-[8px] font-bold">Smart Sync</p>
                                <p>{isCalendarLinked ? 'Sync to Calendar' : 'Connect Google'}</p>
                            </div>
                        </button>
                        {showViewCalendar && (
                            <button
                                onClick={handleViewCalendar}
                                className="flex h-[80px] px-8 items-center justify-center gap-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all border-2 shadow-sm bg-green-600 border-green-500 text-white hover:bg-green-700 hover:scale-105 active:scale-95"
                            >
                                <Calendar size={18} />
                                <div className="text-left leading-tight">
                                    <p className="opacity-70 text-[8px] font-bold">Google Calendar</p>
                                    <p>View Calendar</p>
                                </div>
                            </button>
                        )}
                    </div>
                    {/* Schedule Header */}
                    <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
                        
                        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setViewMode('plans')} 
                                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                        Back to Study Plans
                                    </button>
                                    <div className="h-4 w-[1px] bg-slate-200" />
                                    <button 
                                        onClick={handleRegeneratePlan}
                                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-colors"
                                    >
                                        <Wand2 size={16} />
                                        Regenerate
                                    </button>
                                </div>
                                
                                <div>
                                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Your Study Schedule</h2>
                                    <p className="text-sm font-semibold text-slate-400 max-w-md">
                                        Schedule for <span className="text-blue-600 font-bold">"{selectedPlan.title}"</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-6">
                                <div className="flex flex-wrap items-center gap-4 w-full">
                                    <div className="rounded-[2rem] bg-slate-50 px-8 py-5 border border-slate-100 flex flex-col items-center min-w-[120px]">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status</p>
                                        <p className="text-2xl font-bold text-blue-600">{selectedPlan.overallProgress}%</p>
                                    </div>
                                    <div className="rounded-[2rem] bg-slate-50 px-8 py-5 border border-slate-100 flex flex-col items-center min-w-[120px]">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Total</p>
                                        <p className="text-2xl font-bold text-slate-900">{totalHours.toFixed(0)}h</p>
                                    </div>
                                    <div className="rounded-[2rem] bg-emerald-50 px-8 py-5 border border-emerald-100/50 flex flex-col items-center min-w-[120px]">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Span</p>
                                        <p className="text-2xl font-bold text-emerald-700">{selectedPlan.totalStudyDays}d</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsTrackerExpanded((prev) => !prev)}
                                    aria-label={isTrackerExpanded ? 'Collapse task tracker' : 'Expand task tracker'}
                                    title={isTrackerExpanded ? 'Collapse Task Tracker' : 'Open Task Tracker'}
                                    className={`relative flex h-12 w-12 items-center justify-center self-end rounded-xl transition-all border-2 shadow-sm hover:scale-105 active:scale-95 ${
                                        isTrackerExpanded
                                            ? 'bg-slate-900 border-slate-700 text-white'
                                            : 'bg-white border-emerald-500 text-emerald-600 hover:bg-emerald-50'
                                    }`}
                                >
                                    {isTrackerExpanded ? <X size={18} /> : <Timer size={18} />}
                                    {activeTimerId && (
                                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
                                        </span>
                                    )}
                                    <span className="sr-only">{isTrackerExpanded ? 'Collapse Task Tracker' : 'Open Task Tracker'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Task Tracker Panel (Tabs: Task List | Time Tracker) - Now Opening Under the Bar */}
                    {isTrackerExpanded && (
                        <div className="max-w-lg mx-auto w-full animate-in slide-in-from-top duration-500">
                            <TaskTrackerPanel
                                tasks={allTasksFlat}
                                timers={timers}
                                activeTimerId={activeTimerId}
                                selectedTrackerId={openTrackerId}
                                onSelectTask={(taskId) => setOpenTrackerId(taskId)}
                                onStart={(taskId, sessionId, idx) => handleStartTimer(taskId, sessionId, idx)}
                                onPause={(taskId) => handlePauseTimer(taskId)}
                                onReset={(taskId) => handleResetTimer(taskId)}
                                onComplete={(sessionId, idx, taskId) => handleCompleteTask(sessionId, idx, taskId)}
                            />
                        </div>
                    )}

                    {/* AI Strategy Protocol */}
                    {selectedPlan.aiSummary && (
                        <div className="rounded-[2rem] bg-slate-900 p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Brain size={120} />
                            </div>
                            <div className="relative flex items-start gap-6">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 shadow-lg">
                                    <Zap size={24} />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">AI Study Advice</p>
                                    <p className="text-slate-300 font-medium leading-relaxed max-w-4xl italic">
                                        "{selectedPlan.aiSummary}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timeline Matrix */}
                    <div className="grid gap-12">
                        {selectedPlan.sessions.map((session, sIdx) => {
                            const dayCompleted = session.subjects.filter(s => s.status === 'completed' || s.isCompleted).length;
                            const dayInProgress = session.subjects.filter(s => s.status === 'in-progress').length;
                            const dayTotal = session.subjects.length;
                            const dayProgress = dayTotal > 0 ? Math.round(((dayCompleted + dayInProgress * 0.5) / dayTotal) * 100) : 0;

                            const dayMinutes = session.subjects.reduce((total, sub) => {
                                const mins = sub.durationMinutes ?? (sub.durationHours ? sub.durationHours * 60 : 0);
                                return total + mins;
                            }, 0);
                            const dayHours = dayMinutes > 0
                                ? dayMinutes / 60
                                : (session.totalStudyHours ?? 0);


                            // --- Compute study block start time after internship ---
                            let currentStartTime = new Date(session.date);
                            // Determine if today is a work day (internship)
                            let studyStartHour = 9, studyStartMin = 0;
                            let isWorkDay = false;
                            
                            // Use persisted internshipDays from selectedPlan if available, fallback to transient state
                            const workDays = selectedPlan.internshipDays || selectedWorkDays;
                            
                            if (selectedPlan.internshipStartTime && selectedPlan.internshipEndTime && Array.isArray(workDays) && workDays.length > 0) {
                                const dayOfWeek = new Date(session.date).toLocaleDateString('en-US', { weekday: 'short' }); // e.g., 'Mon'
                                if (workDays.includes(dayOfWeek)) {
                                    isWorkDay = true;
                                }
                            }
                            if (isWorkDay && selectedPlan.internshipEndTime) {
                                const [h, m] = selectedPlan.internshipEndTime.split(':').map(Number);
                                if (!isNaN(h) && !isNaN(m)) {
                                    studyStartHour = (h + 1) % 24;
                                    studyStartMin = m;
                                }
                            }
                            currentStartTime.setHours(studyStartHour, studyStartMin, 0, 0);

                            const formatTime = (date: Date) => {
                                const h = date.getHours();
                                const m = date.getMinutes();
                                const ampm = h >= 12 ? 'p.m.' : 'a.m.';
                                const hour12 = h % 12 || 12;
                                const minStr = m < 10 ? `0${m}` : m;
                                return `${hour12}.${minStr} ${ampm}`;
                            };

                            return (
                                <div key={session._id} className="relative group">
                                    {/* Timeline Marker Line */}
                                    {sIdx < selectedPlan.sessions.length - 1 && (
                                        <div className="absolute left-10 top-20 bottom-0 w-px bg-slate-100 group-last:hidden" />
                                    )}
                                    
                                    <div className="flex items-start gap-10">
                                        {/* Day Indicator */}
                                        <div className="flex-shrink-0 relative z-10">
                                            <div className={`flex h-20 w-20 items-center justify-center rounded-[2rem] shadow-xl transition-all border-4 ${
                                                dayProgress === 100 
                                                ? 'bg-emerald-500 border-white text-white' 
                                                : 'bg-white border-slate-50 text-slate-900 group-hover:border-blue-100 group-hover:text-blue-600'
                                            }`}>
                                                <div className="text-center">
                                                    <p className="text-[10px] font-bold uppercase tracking-tighter opacity-70">Day</p>
                                                    <p className="text-2xl font-bold leading-none">{session.day}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-8">
                                            {/* Session Header */}
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">
                                                        {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                    </h3>
                                                    {session.notes && (
                                                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mt-1">{session.notes}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-6 bg-slate-50/50 rounded-2xl px-6 py-3 border border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-slate-400" />
                                                        <span className="text-sm font-bold text-slate-700">{formatHours(dayHours)}h</span>
                                                    </div>
                                                    <div className="h-5 w-px bg-slate-200" />
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{dayCompleted}/{dayTotal} Verified</span>
                                                        <div className="h-2 w-24 rounded-full bg-slate-200 overflow-hidden shadow-inner">
                                                            <div 
                                                                className={`h-full transition-all duration-1000 ${dayProgress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                                                style={{ width: `${dayProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Assignment Stack */}
                                            <div className="grid gap-6">
                                                {(() => {
                                                    // Failsafe: Re-calculate all task start times and sort them CHRONOLOGICALLY before rendering
                                                    let nominalTime = new Date(currentStartTime);
                                                    const subjectsWithTimes = session.subjects.map((sub, sIdx) => {
                                                        const dur = sub.durationMinutes || Math.round((sub.durationHours || 1) * 60);
                                                        const tStart = new Date(nominalTime);
                                                        
                                                        if (sub.customStartTime) {
                                                            const [hh, mm] = sub.customStartTime.split(':').map(Number);
                                                            if (!isNaN(hh) && !isNaN(mm)) {
                                                                tStart.setHours(hh, mm, 0, 0);
                                                            }
                                                        }
                                                        // Advance nominal base
                                                        nominalTime = new Date(nominalTime.getTime() + dur * 60000);
                                                        return { subject: sub, originalIdx: sIdx, taskStartTime: tStart, durationMins: dur };
                                                    });

                                                    // Sort based on their calculated start times
                                                    subjectsWithTimes.sort((a, b) => a.taskStartTime.getTime() - b.taskStartTime.getTime());

                                                    const now = new Date();

                                                    return subjectsWithTimes.map(({ subject, originalIdx, taskStartTime, durationMins }) => {
                                                        const idx = originalIdx; // Keep tracking the original index for API calls
                                                        const currentStatus: StudyTaskStatus = subject.status || (subject.isCompleted ? 'completed' : 'pending');
                                                        const priorityMeta = PRIORITY_META[subject.priority] || PRIORITY_META.medium;
                                                        const isComplete = currentStatus === 'completed';
                                                        const isInProgress = currentStatus === 'in-progress';
                                                        const taskEndTime = new Date(taskStartTime.getTime() + durationMins * 60000);
                                                        const isOverdue = !isComplete && taskEndTime < now;

                                                        const taskId = `${session._id}-${idx}`;
                                                        const isNotificationFocused = highlightedTaskId === taskId;
                                                        const timerState = timers[taskId] || { seconds: 0, isRunning: false, startedAt: null, finishedAt: null };

                                                        const startTimeStr = formatTime(taskStartTime);
                                                        const endTimeStr = formatTime(taskEndTime);
                                                        const timeDisplay = `${startTimeStr} - ${endTimeStr}`;




                                                    const taskTypeTheme: Record<string, string> = {
                                                        reading: 'bg-blue-50 text-blue-600 border-blue-100/50',
                                                        summarizing: 'bg-indigo-50 text-indigo-600 border-indigo-100/50',
                                                        practice: 'bg-amber-50 text-amber-600 border-amber-100/50',
                                                        revision: 'bg-emerald-50 text-emerald-600 border-emerald-100/50',
                                                        'self-test': 'bg-rose-50 text-rose-600 border-rose-100/50',
                                                    };

                                                    return (
                                                        <div
                                                            key={`${session._id}-${originalIdx}`}
                                                            ref={el => { taskRefs.current[taskId] = el; }}
                                                            className={`group relative overflow-hidden rounded-[2rem] border p-8 transition-all ${
                                                                isNotificationFocused
                                                                    ? 'border-fuchsia-400 bg-fuchsia-50/40 ring-4 ring-fuchsia-200 shadow-2xl shadow-fuchsia-200/70'
                                                                    : isComplete
                                                                    ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                                                                    : isInProgress
                                                                        ? 'border-blue-200 bg-white shadow-xl shadow-blue-100 scale-[1.01]'
                                                                        : isOverdue 
                                                                            ? 'border-rose-300 bg-rose-50/20 shadow-lg shadow-rose-100'
                                                                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/50'
                                                            }`}
                                                        >
                                                            {isNotificationFocused && (
                                                                <div className="absolute top-0 left-0 px-6 py-2 bg-fuchsia-500 text-white text-[10px] font-black uppercase tracking-widest rounded-br-3xl shadow-lg animate-pulse">
                                                                    Task Next To Be Completed
                                                                </div>
                                                            )}

                                                            {/* Top indicator for sorted active task */}
                                                            {isInProgress && (
                                                                <div className="absolute top-0 right-0 px-6 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl shadow-lg">
                                                                    Active Target
                                                                </div>
                                                            )}
                                                            
                                                            {isOverdue && !isComplete && (
                                                                <div className="absolute top-0 right-[120px] px-6 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl shadow-lg animate-pulse">
                                                                    Overdue
                                                                </div>
                                                            )}

                                                            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center">
                                                                {/* Left: Metadata & Status */}
                                                                <div className="flex-1 space-y-5">
                                                                    <div className="flex flex-wrap items-center gap-3">
                                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${taskTypeTheme[subject.taskType || 'reading']}`}>
                                                                            {subject.taskType || 'MODULE'}
                                                                        </span>
                                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-100 bg-slate-50 text-slate-500`}>
                                                                            {priorityMeta.label}
                                                                        </span>
                                                                        
                                                                        {isOverdue && !isComplete && (
                                                                            <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-rose-200 bg-rose-50 text-rose-600">
                                                                                Missed Task
                                                                            </span>
                                                                        )}

                                                                        {editingTaskTime?.sessionId === session._id && editingTaskTime?.subjectIdx === originalIdx ? (
                                                                            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-blue-200 shadow-inner z-20 flex-wrap">
                                                                                <input 
                                                                                    type="date" 
                                                                                    min={todayISO}
                                                                                    value={editingTaskTime.date}
                                                                                    onChange={(e) => setEditingTaskTime({...editingTaskTime, date: clampToToday(e.target.value)})}
                                                                                    className="text-xs px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-700 outline-none focus:border-blue-500 font-medium"
                                                                                />
                                                                                <input 
                                                                                    type="time" 
                                                                                    value={editingTaskTime.customStartTime}
                                                                                    onChange={(e) => setEditingTaskTime({...editingTaskTime, customStartTime: e.target.value})}
                                                                                    className="text-xs px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-700 outline-none focus:border-blue-500 font-medium"
                                                                                />
                                                                                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded px-2 py-1.5">
                                                                                    <input 
                                                                                        type="number" 
                                                                                        min="1"
                                                                                        max={editingTaskTime.originalDurationMinutes}
                                                                                        value={editingTaskTime.durationMinutes}
                                                                                        onChange={(e) => {
                                                                                            let val = parseInt(e.target.value);
                                                                                            if (isNaN(val)) val = 1;
                                                                                            if (val > editingTaskTime.originalDurationMinutes) val = editingTaskTime.originalDurationMinutes;
                                                                                            if (val < 1) val = 1;
                                                                                            setEditingTaskTime({...editingTaskTime, durationMinutes: val});
                                                                                        }}
                                                                                        className="text-xs w-12 text-slate-700 outline-none focus:border-blue-500 font-medium bg-transparent"
                                                                                    />
                                                                                    <span className="text-xs text-slate-400 font-medium">min</span>
                                                                                </div>
                                                                                <button onClick={handleSaveTaskTime} className="bg-blue-600 text-white text-[10px] uppercase font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition shadow-sm">Save</button>
                                                                                <button onClick={() => setEditingTaskTime(null)} className="text-slate-500 hover:text-slate-800 p-1"><X size={14}/></button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="group/time flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tight relative">
                                                                                <Clock size={14} className="text-blue-500" />
                                                                                {timeDisplay}
                                                                                <span className="text-slate-300 mx-1">|</span>
                                                                                <span className="text-slate-500">{durationMins} min</span>
                                                                                <button 
                                                                                    onClick={() => {
                                                                                        const dtStr = new Date(session.date).toISOString().split('T')[0];
                                                                                        const hStr = taskStartTime.getHours().toString().padStart(2, '0');
                                                                                        const mStr = taskStartTime.getMinutes().toString().padStart(2, '0');
                                                                                        const fallbackTime = `${hStr}:${mStr}`;
                                                                                        
                                                                                        const currentDur = subject.durationMinutes || Math.round((subject.durationHours || 1) * 60);
                                                                                        const origDur = subject.originalDurationMinutes || currentDur;

                                                                                        setEditingTaskTime({ 
                                                                                            sessionId: session._id, 
                                                                                            subjectIdx: idx, 
                                                                                            date: dtStr, 
                                                                                            customStartTime: subject.customStartTime || fallbackTime,
                                                                                            durationMinutes: currentDur,
                                                                                            originalDurationMinutes: origDur
                                                                                        });
                                                                                    }}
                                                                                    className="opacity-0 group-hover/time:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all ml-1"
                                                                                    title="Edit Date/Time"
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <div>
                                                                        <h4 className={`text-2xl font-black tracking-tight ${isComplete ? 'text-slate-400 line-through' : 'text-slate-950'}`}>
                                                                            {subject.title || subject.topic || subject.subjectName}
                                                                        </h4>
                                                                        <div className="flex items-center gap-3 mt-1.5">
                                                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                                                                                {subject.subjectName}
                                                                            </p>
                                                                            {subject.technique && (
                                                                                <>
                                                                                    <div className="h-3 w-px bg-slate-200" />
                                                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                                                         {subject.technique} Protocol
                                                                                    </p>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {subject.instruction && (
                                                                        <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                                                                            <p className="text-[13px] text-slate-600 leading-relaxed font-medium">
                                                                                {subject.instruction}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    {subject.resources && subject.resources.length > 0 && (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {subject.resources.map((res, i) => (
                                                                                <span key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-600 text-[10px] font-bold uppercase tracking-wider border border-slate-100 shadow-sm transition-all hover:border-blue-200 hover:text-blue-600 cursor-pointer">
                                                                                    <FileText size={12} />
                                                                                    {res}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Right: Compact Status Badge */}
                                                                <div className="shrink-0 flex flex-col items-end gap-3">
                                                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                                                                        isComplete
                                                                            ? 'bg-emerald-100 border-emerald-200 text-emerald-700'
                                                                            : isInProgress
                                                                                ? 'bg-orange-100 border-orange-200 text-orange-700'
                                                                                : timerState.seconds > 0
                                                                                    ? 'bg-amber-100 border-amber-200 text-amber-700'
                                                                                    : 'bg-blue-100 border-blue-200 text-blue-700'
                                                                    }`}>
                                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                                                                            isComplete ? 'border-emerald-300 bg-emerald-200' : isInProgress ? 'border-orange-300 bg-orange-200' : timerState.seconds > 0 ? 'border-amber-300 bg-amber-200' : 'border-blue-300 bg-blue-200'
                                                                        }`}>
                                                                            {isComplete ? 'C' : isInProgress ? 'S' : timerState.seconds > 0 ? 'R' : 'P'}
                                                                        </div>
                                                                        <span className="text-[11px] font-bold">
                                                                            {isComplete ? 'Completed' : isInProgress ? 'Started' : timerState.seconds > 0 ? 'Resume' : 'Pending'}
                                                                        </span>
                                                                    </div>
                                                                    {timerState.seconds > 0 && (
                                                                        <p className="text-lg font-black text-slate-800 font-mono tabular-nums">
                                                                            {formatTimer(timerState.seconds)}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-tighter">
                                                                        Task ID: {originalIdx + 1}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {isCalendarViewOpen && (
                <div className="fixed inset-0 z-[250] bg-slate-900/70 backdrop-blur-sm p-4 md:p-8">
                    <div className="mx-auto h-full max-w-4xl flex items-center justify-center">
                        <div className="w-full max-h-[88vh] rounded-[2rem] bg-white border border-slate-200 shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-slate-200 bg-white">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Google Calendar View</p>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Student Study Timeline</h3>
                                    <p className="text-xs text-slate-500 font-medium">Clear daily view of synced study sessions.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => window.open('https://calendar.google.com/calendar/u/0/r/week', '_blank')}
                                        className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider hover:bg-blue-700 transition"
                                    >
                                        Open Google Calendar
                                    </button>
                                    <button
                                        onClick={() => setIsCalendarViewOpen(false)}
                                        className="h-10 w-10 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition flex items-center justify-center"
                                        aria-label="Close calendar view"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[72vh] overflow-y-auto bg-slate-50 p-6">
                                <div className="space-y-4">
                                {isLoadingCalendarEvents ? (
                                    <div className="py-20 text-center">
                                        <Loader2 size={28} className="mx-auto animate-spin text-blue-600" />
                                        <p className="mt-3 text-sm font-semibold text-slate-500">Loading calendar events...</p>
                                    </div>
                                ) : calendarEvents.length === 0 ? (
                                    <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                                        <CalendarClock size={34} className="mx-auto text-slate-300" />
                                        <p className="mt-3 text-base font-bold text-slate-700">No synced study events found</p>
                                        <p className="mt-1 text-sm text-slate-500">Run sync to send your study plan sessions to Google Calendar.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {calendarEvents.map((event, idx) => {
                                            const eventDate = new Date(event.start);
                                            const prevDate = idx > 0 ? new Date(calendarEvents[idx - 1].start) : null;
                                            const showDateHeading = !prevDate || eventDate.toDateString() !== prevDate.toDateString();
                                            const timeLabel = `${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                                            return (
                                                <div key={event.id} className="space-y-2">
                                                    {showDateHeading && (
                                                        <div className="pt-2">
                                                            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                                                                {eventDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                                        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                                                            <div className="space-y-1">
                                                                <p className="text-base font-black text-slate-900 tracking-tight">{event.title}</p>
                                                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{timeLabel}</p>
                                                            </div>
                                                            {event.link && (
                                                                <a
                                                                    href={event.link}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700"
                                                                >
                                                                    Open event
                                                                </a>
                                                            )}
                                                        </div>
                                                        {event.description && (
                                                            <div className="mt-3 pt-3 border-t border-slate-100">
                                                                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{event.description}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </>

        </div>
    );
};

export default StudyPlanPage;