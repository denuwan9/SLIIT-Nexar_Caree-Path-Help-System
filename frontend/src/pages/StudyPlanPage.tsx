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
    Pause,
    Square,
    Timer,
} from 'lucide-react';
import { createStudyPlan, createStudyPlanWithDocs, deleteStudyPlan, fetchStudyPlans, updateSubjectStatus } from '../services/studyPlanService';
import type {
    CreateStudyPlanInput,
    StudyPlan,
    StudyPriority,
    StudyTaskStatus,
} from '../types/studyPlan';

type TaskTimer = {
    seconds: number;
    isRunning: boolean;
    startedAt: number | null;
    finishedAt?: number | null;
    lastUpdatedAt?: number | null;
};

type TimerMap = Record<string, TaskTimer>;

const TIMER_MAP_KEY = 'studyPlanTaskTimers';

function formatTimer(totalSeconds: number) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const formatHours = (hours?: number | null, digits = 1) => {
    const safe = Number.isFinite(hours || 0) ? Number(hours) : 0;
    return safe.toFixed(digits);
};

const formatClockTime = (timestamp?: number | null) => {
    if (!timestamp) return '--:--';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const TimerPanel: React.FC<{
    title: string;
    timerState: TaskTimer;
    progressPct: number | null;
    onStart: () => void;
    onPause: () => void;
    onReset: () => void;
}> = ({ title, timerState, progressPct, onStart, onPause, onReset }) => {
    return (
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-3 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs font-black text-blue-700 uppercase tracking-widest break-all">
                        <Timer size={14} />
                        <span className="break-all leading-snug">{title}</span>
                    </div>
                    <span
                        className="text-[11px] font-semibold text-slate-500"
                        title={`Task started at ${formatClockTime(timerState.startedAt)}`}
                    >
                        Started at {formatClockTime(timerState.startedAt)}
                    </span>
                    {timerState.finishedAt && (
                        <span className="text-[11px] font-semibold text-emerald-600" title={`Task finished at ${formatClockTime(timerState.finishedAt)}`}>
                            Finished at {formatClockTime(timerState.finishedAt)}
                        </span>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Elapsed Time</p>
                    <span className="font-mono text-2xl font-black text-slate-900">
                        {formatTimer(timerState.seconds)}
                    </span>
                </div>
            </div>

            {progressPct !== null && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>Progress</span>
                        <span>{progressPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white shadow-inner overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all" style={{ width: `${progressPct}%` }} />
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
                {!timerState.isRunning ? (
                    <button
                        onClick={onStart}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-md shadow-emerald-200 hover:bg-emerald-700 transition"
                    >
                        <Play size={14} />
                        Start
                    </button>
                ) : (
                    <button
                        onClick={onPause}
                        className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-md shadow-amber-200 hover:bg-amber-600 transition"
                    >
                        <Pause size={14} />
                        Pause
                    </button>
                )}

                <button
                    onClick={onReset}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-800 transition"
                >
                    <Square size={12} />
                    Reset
                </button>

                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Time spent: {formatTimer(timerState.seconds)}
                </span>
            </div>
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
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    const [plans, setPlans] = useState<StudyPlan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'builder' | 'plans' | 'schedule'>('builder');
    const [justGenerated, setJustGenerated] = useState(false);
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [workEnabled, setWorkEnabled] = useState(false);
    const [generationStage, setGenerationStage] = useState<string | null>(null);
    const [selectedWorkDays, setSelectedWorkDays] = useState<string[]>([]);
    const [workStartTime, setWorkStartTime] = useState('09:00');
    const [workEndTime, setWorkEndTime] = useState('17:00');
    const [timers, setTimers] = useState<TimerMap>({});
    const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
    const [openTrackerId, setOpenTrackerId] = useState<string | null>(null);
    const [hydrated, setHydrated] = useState(false);

    const persistTimers = (nextTimers: TimerMap, activeId: string | null) => {
        if (!hydrated) return; // avoid clobbering before hydration
        try {
            localStorage.setItem(TIMER_MAP_KEY, JSON.stringify({ timers: nextTimers, activeTimerId: activeId }));
        } catch (err) {
            console.error('Failed to persist timers', err);
        }
    };

    const snapshotAndPersist = (activeId: string | null, source: 'tick' | 'unload' = 'tick') => {
        setTimers((prev) => {
            const now = Date.now();
            const next: TimerMap = {};
            Object.entries(prev).forEach(([id, t]) => {
                if (t.isRunning && t.startedAt) {
                    const last = t.lastUpdatedAt || t.startedAt;
                    const elapsed = Math.max(0, Math.floor((now - last) / 1000));
                    next[id] = { ...t, seconds: t.seconds + elapsed, lastUpdatedAt: now };
                } else {
                    next[id] = { ...t, lastUpdatedAt: t.lastUpdatedAt || now };
                }
            });
            persistTimers(next, activeId);
            return source === 'unload' ? prev : next; // keep state when unloading
        });
    };

    useEffect(() => {
        const stored = localStorage.getItem(TIMER_MAP_KEY);
        if (!stored) return;
        try {
            const parsed = JSON.parse(stored);
            const savedTimers: TimerMap = parsed.timers || {};
            const now = Date.now();
            const adjusted: TimerMap = {};
            Object.entries(savedTimers).forEach(([id, t]) => {
                if (t.isRunning && t.startedAt) {
                    const last = t.lastUpdatedAt || t.startedAt;
                    const elapsed = Math.max(0, Math.floor((now - last) / 1000));
                    adjusted[id] = { ...t, seconds: t.seconds + elapsed, startedAt: t.startedAt, lastUpdatedAt: now };
                } else {
                    adjusted[id] = { ...t, lastUpdatedAt: t.lastUpdatedAt || t.startedAt || now };
                }
            });
            setTimers(adjusted);
            const runningId = parsed.activeTimerId && adjusted[parsed.activeTimerId]?.isRunning ? parsed.activeTimerId : null;
            setActiveTimerId(runningId);
        } catch (err) {
            console.error('Failed to restore timers', err);
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        persistTimers(timers, activeTimerId);
    }, [timers, activeTimerId, hydrated]);

    useEffect(() => {
        if (!activeTimerId) return;
        const interval = setInterval(() => {
            snapshotAndPersist(activeTimerId, 'tick');
        }, 1000);
        return () => clearInterval(interval);
    }, [activeTimerId]);

    useEffect(() => {
        const handleVisibility = () => {
            snapshotAndPersist(activeTimerId, 'unload');
        };
        window.addEventListener('beforeunload', handleVisibility);
        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            window.removeEventListener('beforeunload', handleVisibility);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [activeTimerId]);

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
        examStartDate: '',
        examEndDate: '',
        availableHoursPerDay: 4,
        internshipHoursPerDay: 4,
        internshipDaysPerWeek: 5,
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
        if (planInput.subjects.length === 0) {
            tips.push("Add your subjects below so the AI knows what you need to study.");
        }
        return tips;
    }, [daysUntilExam, planInput.subjects.length, workloadScore.level]);

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
    }, []);

    const selectedPlan = useMemo(
        () => plans.find((p) => p._id === selectedPlanId) || plans[0],
        [plans, selectedPlanId]
    );
    
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
            if (!planInput.title.trim()) {
                setPlanInput((prev) => ({ ...prev, title: safeTitle }));
            }
            toast.success('Study plan generated');
            setPlans((prev) => [created, ...prev]);
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

    const handleStatusChange = async (sessionId: string, subjectIdx: number, status: StudyTaskStatus) => {
        if (!selectedPlan) return;
        try {
            const updated = await updateSubjectStatus(selectedPlan._id, sessionId, subjectIdx, status);
            setPlans((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
            const labels: Record<StudyTaskStatus, string> = { pending: 'Set to pending', 'in-progress': 'Started', completed: 'Completed!' };
            toast.success(labels[status]);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Could not update status');
        }
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
        setTimers((prev) => {
            const next: TimerMap = { ...prev };
            if (activeTimerId && activeTimerId !== taskId && next[activeTimerId]) {
                next[activeTimerId] = { ...next[activeTimerId], isRunning: false };
            }
            const current = next[taskId] || { seconds: 0, isRunning: false, startedAt: null };
            const startedAt = current.startedAt ?? Date.now();
            next[taskId] = { ...current, isRunning: true, startedAt, finishedAt: null, lastUpdatedAt: Date.now() };
            persistTimers(next, taskId);
            return next;
        });
        setActiveTimerId(taskId);
        setOpenTrackerId(taskId);
        if (sessionId && typeof subjectIdx === 'number') {
            handleStatusChange(sessionId, subjectIdx, 'in-progress');
        }
    };

    const handlePauseTimer = (taskId: string) => {
        setTimers((prev) => {
            const current = prev[taskId];
            if (!current) return prev;
            const next = { ...prev, [taskId]: { ...current, isRunning: false, lastUpdatedAt: Date.now() } };
            persistTimers(next, activeTimerId === taskId ? null : activeTimerId);
            return next;
        });
        if (activeTimerId === taskId) setActiveTimerId(null);
    };

    const handleResetTimer = (taskId: string) => {
        setTimers((prev) => {
            const current = prev[taskId];
            if (!current) return prev;
            const next = { ...prev, [taskId]: { ...current, seconds: 0, isRunning: false, startedAt: null, finishedAt: null, lastUpdatedAt: Date.now() } };
            persistTimers(next, activeTimerId === taskId ? null : activeTimerId);
            return next;
        });
        if (activeTimerId === taskId) setActiveTimerId(null);
    };

    const handleCompleteTask = async (sessionId: string, subjectIdx: number, taskId: string) => {
        const now = Date.now();
        await handleStatusChange(sessionId, subjectIdx, 'completed');
        setTimers((prev) => {
            const current = prev[taskId] || { seconds: 0, isRunning: false, startedAt: null, finishedAt: null, lastUpdatedAt: null };
            const lastTick = current.lastUpdatedAt || current.startedAt || now;
            const extra = current.isRunning && current.startedAt ? Math.max(0, Math.floor((now - lastTick) / 1000)) : 0;
            const updatedSeconds = current.seconds + extra;
            const startedAt = current.startedAt ?? now;
            const updated: TaskTimer = { ...current, seconds: updatedSeconds, isRunning: false, startedAt, finishedAt: now, lastUpdatedAt: now };
            const next = { ...prev, [taskId]: updated };
            persistTimers(next, activeTimerId === taskId ? null : activeTimerId);
            return next;
        });
        if (activeTimerId === taskId) setActiveTimerId(null);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24">
            {/* ── Premium Header ── */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 shadow-2xl md:p-12">
                {/* Decorative background elements */}
                <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-600/20 blur-[100px]" />
                <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-emerald-600/10 blur-[100px]" />
                
                <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 ring-1 ring-inset ring-blue-500/20">
                            <Brain size={14} className="animate-pulse" />
                            AI Study Planner
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
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
                        {plans.length > 0 && (
                            <button
                                onClick={() => setViewMode('plans')}
                                className="group relative flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-white/10"
                            >
                                <Layout size={18} className="transition-transform group-hover:rotate-12" />
                                My Study Plans
                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">
                                    {plans.length}
                                </span>
                            </button>
                        )}

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
                    <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                {[1, 2, 3].map((step) => (
                                    <React.Fragment key={step}>
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black text-sm transition-all duration-500 ${
                                                currentStep === step
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                                                    : step < (currentStep as number)
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {step < (currentStep as number) ? <CheckCircle2 size={18} /> : step}
                                            </div>
                                            <div className="hidden lg:block">
                                                <p className={`text-[10px] font-black uppercase tracking-wider ${
                                                    currentStep === step ? 'text-blue-600' : 'text-slate-400'
                                                }`}>
                                                    Step {step}
                                                </p>
                                                <p className="text-xs font-bold text-slate-900">
                                                    {step === 1 ? 'Upload' : step === 2 ? 'Settings' : 'Ready'}
                                                </p>
                                            </div>
                                        </div>
                                        {step < 3 && <div className="hidden h-[2px] w-12 bg-slate-100 md:block" />}
                                    </React.Fragment>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={prefillDemoPlan}
                                    className="flex items-center gap-2 rounded-2xl bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 border border-slate-200/50"
                                >
                                    <Sparkles size={14} className="text-amber-500" />
                                    Use Example
                                </button>
                                <div className="h-10 w-[1px] bg-slate-200 hidden md:block" />
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Process</p>
                                    <p className="text-sm font-black text-slate-900">3 Steps</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Steps */}
                    {currentStep === 1 && (
                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Study Materials Upload */}
                            <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-blue-100">
                                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                                <div className="relative space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110">
                                            <FileText size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">Study Materials</h3>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upload notes for AI to read</p>
                                        </div>
                                    </div>
                                    
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        className="relative rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 p-10 text-center transition-all hover:border-blue-300 hover:bg-blue-50/50"
                                    >
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                                            <Upload className="text-blue-600" size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">Drop your syllabus or slides</p>
                                        <p className="mt-1 text-xs text-slate-500">PDF, PPTX, or Markdown</p>
                                        <label className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-xs font-black text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95">
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
                            <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-purple-100">
                                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-purple-500/5 blur-3xl group-hover:bg-purple-500/10 transition-colors" />
                                <div className="relative space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110">
                                            <CalendarClock size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900">Exam Schedule</h3>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add your exam dates</p>
                                        </div>
                                    </div>
                                    
                                    <div
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleTimetableDrop}
                                        className="relative rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50 p-10 text-center transition-all hover:border-purple-300 hover:bg-purple-50/50"
                                    >
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                                            <Calendar size={24} className="text-purple-600" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-900">Sync your exam dates</p>
                                        <p className="mt-1 text-xs text-slate-500">AI will prioritize your subjects</p>
                                        <label className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-xs font-black text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95">
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
                                    className="flex items-center gap-2 rounded-[2rem] bg-blue-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95"
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
                                            <h3 className="text-lg font-black text-slate-900">Study Settings</h3>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Set your availability</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 group flex items-center gap-2 cursor-help relative">
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
                                                <p className="text-[10px] font-black uppercase tracking-tighter text-rose-500 animate-in fade-in slide-in-from-left-2">{titleError}</p>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 group flex items-center gap-2 cursor-help relative">
                                                Exam Dates
                                                <Info size={14} className="text-slate-300 peer" />
                                                <div className="absolute left-1/2 -top-8 -translate-x-1/2 opacity-0 peer-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded font-medium whitespace-nowrap pointer-events-none z-10">When do your exams start and end?</div>
                                            </label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <p className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 rounded">Start Date</p>
                                                    <input
                                                        type="date"
                                                        className="w-full rounded-2xl border-2 border-slate-100 bg-transparent px-4 py-4 text-sm font-bold text-slate-900 transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                                        min={todayISO}
                                                        value={planInput.examStartDate}
                                                        onChange={(e) => setPlanInput({ ...planInput, examStartDate: clampToToday(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <p className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-blue-500 rounded">End Date</p>
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
                                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Daily Study Goal</label>
                                                <span className="text-blue-600 font-black text-lg">{manualHoursOverride ? planInput.availableHoursPerDay : derivedAvailableHours} <span className="text-sm text-slate-400 font-semibold">hours/day</span></span>
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
                                                <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
                                                    <span>Light (1h)</span>
                                                    <span>Intense (12h)</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-slate-100 mt-2">
                                            <div className="flex items-center justify-between bg-white border-2 border-slate-100 hover:border-blue-100 p-4 rounded-2xl transition-all cursor-pointer group" onClick={() => setWorkEnabled(!workEnabled)}>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">Work &amp; Internship Commitments</p>
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
                                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Days per Week</label>
                                                            <span className="text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-widest">{selectedWorkDays.length} {selectedWorkDays.length === 1 ? 'day' : 'days'} selected</span>
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
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50/80 border border-amber-100/60 p-2.5 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                                                                <Info size={14} className="shrink-0" />
                                                                High workload may affect your study balance
                                                            </p>
                                                        )}
                                                    </div>
                                                    
                                                    <div className={`space-y-4 pt-4 border-t border-slate-200 transition-opacity duration-300 ${selectedWorkDays.length === 0 ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Hours per Day</label>
                                                            <span className="text-slate-900 font-bold bg-white px-2 py-1 rounded-md text-xs border border-slate-200 shadow-sm">{planInput.internshipHoursPerDay} <span className="text-slate-400 font-medium">hours</span></span>
                                                        </div>
                                                        <div className="flex items-center gap-3 px-1">
                                                            <div className="flex-1 space-y-1.5">
                                                                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 block px-1">Start Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={workStartTime}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setWorkStartTime(val);
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
                                                            <div className="text-slate-300 font-black mt-5 shrink-0">-</div>
                                                            <div className="flex-1 space-y-1.5">
                                                                <label className="text-[10px] uppercase tracking-widest font-black text-slate-400 block px-1">End Time</label>
                                                                <input
                                                                    type="time"
                                                                    value={workEndTime}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setWorkEndTime(val);
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
                                        <h4 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                                            <Activity size={18} className="text-blue-600" />
                                            Plan Summary
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Time to Exam</p>
                                                <p className="text-2xl font-black text-slate-900">{daysUntilExam} <span className="text-sm text-slate-500 font-medium">days</span></p>
                                            </div>
                                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Study Hours</p>
                                                <p className="text-2xl font-black text-slate-900">{totalStudyHoursAvailable} <span className="text-sm text-slate-500 font-medium">hrs</span></p>
                                            </div>
                                        </div>
                                        
                                        <div className={`mt-4 rounded-2xl p-4 flex items-center justify-between transition-colors ${workloadScore.barCol} border border-transparent`}>
                                            <div>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${workloadScore.color}`}>Overall Workload</p>
                                                <p className={`text-lg font-black ${workloadScore.color}`}>{workloadScore.text}</p>
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
                                        <h4 className="text-sm font-black mb-6 flex items-center gap-2 text-blue-400">
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
                                            className="w-full px-6 py-5 rounded-[2rem] bg-blue-600 text-white text-sm font-black uppercase tracking-widest hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/20 hover:-translate-y-1 transition-all disabled:opacity-80 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed group relative overflow-hidden"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                Review & Generate <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </button>
                                        <button onClick={() => setCurrentStep(1)} className="w-full py-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1">
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
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-center">
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
                                    <div className="rounded-xl bg-amber-50 p-3">
                                        <p className="text-xs text-slate-500">Subjects added</p>
                                        <p className="text-lg font-bold text-slate-900">{planInput.subjects.length}</p>
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
                                        {isLoadingPlans && <Loader2 size={16} className="animate-spin text-slate-400" />}
                                    </div>
                                    <div className="space-y-3">
                                        {plans.length === 0 && (
                                            <p className="text-sm text-slate-500">No plans yet. Generate to see the schedule.</p>
                                        )}
                                        {plans.map((plan) => (
                                            <div
                                                key={plan._id}
                                                className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50 ${
                                                    selectedPlan?._id === plan._id ? 'border-blue-300 bg-blue-50' : 'border-slate-100'
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
                                                        <p className="text-sm font-bold text-slate-900">{plan.title}</p>
                                                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                                                            {plan.subjects.length} subjects · {plan.totalStudyDays} days
                                                        </p>
                                                        <div className="mt-2 text-right">
                                                            <p className="text-xs font-semibold text-blue-700">{plan.overallProgress}%</p>
                                                            <div className="mt-1 h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                                                                <div
                                                                    className="h-full bg-blue-600"
                                                                    style={{ width: `${plan.overallProgress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePlan(plan._id)}
                                                        disabled={deletingPlanId === plan._id}
                                                        className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                                        aria-label="Delete plan"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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
                            <h2 className="text-2xl font-black text-slate-900">My Study Plans</h2>
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

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan) => {
                            const planHours = plan.sessions?.reduce((s, sess) => s + (sess.totalStudyHours || 0), 0) || 0;
                            const totalTasks = plan.sessions?.reduce((s, sess) => s + sess.subjects.length, 0) || 0;
                            const completedTasks = plan.sessions?.reduce((s, sess) => s + sess.subjects.filter(sub => sub.isCompleted).length, 0) || 0;
                            return (
                                <div
                                    key={plan._id}
                                    className="card p-5 text-left transition-all hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 space-y-4"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedPlanId(plan._id);
                                                setViewMode('schedule');
                                            }}
                                            className="flex-1 text-left space-y-4"
                                        >
                                            {/* Header */}
                                            <div className="space-y-1">
                                                <p className="text-base font-bold text-slate-900 truncate">{plan.title}</p>
                                                <p className="text-[11px] text-slate-500">
                                                    Created {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>

                                            {/* Stats row */}
                                            <div className="grid grid-cols-3 gap-2 text-center">
                                                <div className="rounded-xl bg-blue-50 p-2">
                                                    <p className="text-[10px] text-slate-500">Days</p>
                                                    <p className="text-sm font-bold text-slate-900">{plan.totalStudyDays}</p>
                                                </div>
                                                <div className="rounded-xl bg-emerald-50 p-2">
                                                    <p className="text-[10px] text-slate-500">Hours</p>
                                                    <p className="text-sm font-bold text-slate-900">{formatHours(planHours)}</p>
                                                </div>
                                                <div className="rounded-xl bg-amber-50 p-2">
                                                    <p className="text-[10px] text-slate-500">Subjects</p>
                                                    <p className="text-sm font-bold text-slate-900">{plan.subjects.length}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{completedTasks}/{totalTasks} Protocols Verified</span>
                                                    <span className="text-xs font-black text-blue-600">{plan.overallProgress}%</span>
                                                </div>
                                                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden shadow-inner">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
                                                        style={{ width: `${plan.overallProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeletePlan(plan._id); }}
                                            disabled={deletingPlanId === plan._id}
                                            className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                            aria-label="Delete plan"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {viewMode === 'schedule' && selectedPlan && (
                <div className="space-y-10 animate-slide-in pb-20">
                    {/* Schedule Header */}
                    <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
                        
                        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-4">
                                <button 
                                    onClick={() => setViewMode('plans')} 
                                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                    Back to Study Plans
                                </button>
                                
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Your Study Schedule</h2>
                                    <p className="text-sm font-semibold text-slate-400 max-w-md">
                                        Schedule for <span className="text-blue-600">"{selectedPlan.title}"</span>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="rounded-[2rem] bg-slate-50 px-8 py-5 border border-slate-100 flex flex-col items-center min-w-[120px]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                                    <p className="text-2xl font-black text-blue-600">{selectedPlan.overallProgress}%</p>
                                </div>
                                <div className="rounded-[2rem] bg-slate-50 px-8 py-5 border border-slate-100 flex flex-col items-center min-w-[120px]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total</p>
                                    <p className="text-2xl font-black text-slate-900">{totalHours.toFixed(0)}h</p>
                                </div>
                                <div className="rounded-[2rem] bg-emerald-50 px-8 py-5 border border-emerald-100/50 flex flex-col items-center min-w-[120px]">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Span</p>
                                    <p className="text-2xl font-black text-emerald-700">{selectedPlan.totalStudyDays}d</p>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">AI Study Advice</p>
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
                            let currentStartTime = new Date();
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
                                                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-70">Day</p>
                                                    <p className="text-2xl font-black leading-none">{session.day}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-8">
                                            {/* Session Header */}
                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900">
                                                        {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                                    </h3>
                                                    {session.notes && (
                                                        <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">{session.notes}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-6 bg-slate-50/50 rounded-2xl px-6 py-3 border border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} className="text-slate-400" />
                                                        <span className="text-sm font-black text-slate-700">{formatHours(dayHours)}h</span>
                                                    </div>
                                                    <div className="h-5 w-px bg-slate-200" />
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{dayCompleted}/{dayTotal} Verified</span>
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
                                                {session.subjects.map((subject, idx) => {
                                                    const currentStatus: StudyTaskStatus = subject.status || (subject.isCompleted ? 'completed' : 'pending');
                                                    const priorityMeta = PRIORITY_META[subject.priority] || PRIORITY_META.medium;
                                                    const isComplete = currentStatus === 'completed';
                                                    const isInProgress = currentStatus === 'in-progress';

                                                    const taskId = `${session._id}-${idx}`;
                                                    const timerState = timers[taskId] || { seconds: 0, isRunning: false, startedAt: null, finishedAt: null };
                                                    const durationMins = subject.durationMinutes || Math.round((subject.durationHours || 1) * 60);
                                                    const progressPct = durationMins ? Math.min(100, Math.round((timerState.seconds / (durationMins * 60)) * 100)) : null;

                                                    const startTimeStr = formatTime(currentStartTime);
                                                    currentStartTime = new Date(currentStartTime.getTime() + durationMins * 60000);
                                                    const endTimeStr = formatTime(currentStartTime);
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
                                                            key={`${session._id}-${idx}`}
                                                            className={`group relative overflow-hidden rounded-[2rem] border p-8 transition-all ${
                                                                isComplete
                                                                    ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                                                                    : isInProgress
                                                                        ? 'border-blue-200 bg-white shadow-lg shadow-blue-100/50 scale-[1.02]'
                                                                        : 'border-slate-100 bg-white hover:border-slate-200'
                                                            }`}
                                                        >
                                                            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center">
                                                                {/* Status Marker */}
                                                                <div className="flex-shrink-0 flex lg:flex-col items-center gap-4">
                                                                    <button
                                                                        onClick={() => handleStatusChange(session._id, idx, 'completed')}
                                                                        className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                                                                            isComplete 
                                                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' 
                                                                            : 'bg-slate-50 text-slate-300 hover:bg-emerald-50 hover:text-emerald-500'
                                                                        }`}
                                                                    >
                                                                        <CheckCircle2 size={24} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleStatusChange(session._id, idx, 'in-progress')}
                                                                        className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
                                                                            isInProgress 
                                                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 animate-pulse' 
                                                                            : 'bg-slate-50 text-slate-300 hover:bg-blue-50 hover:text-blue-500'
                                                                        }`}
                                                                    >
                                                                        <Loader2 size={24} className={isInProgress ? 'animate-spin' : ''} />
                                                                    </button>
                                                                </div>

                                                                <div className="flex-1 space-y-4">
                                                                    <div className="flex flex-wrap items-center gap-3">
                                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${taskTypeTheme[subject.taskType || 'reading']}`}>
                                                                            {subject.taskType || 'MODULE'}
                                                                        </span>
                                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-slate-50 text-slate-500`}>
                                                                            {priorityMeta.label}
                                                                        </span>
                                                                        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase">
                                                                            <Clock size={14} />
                                                                            {timeDisplay}
                                                                        </div>
                                                                    </div>

                                                                    <div>
                                                                        <h4 className={`text-xl font-black tracking-tight ${isComplete ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                                            {subject.title || subject.topic || subject.subjectName}
                                                                        </h4>
                                                                        <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                                                                            {subject.subjectName} {subject.technique ? `// ${subject.technique} Protocol` : ''}
                                                                        </p>
                                                                    </div>

                                                                    {subject.instruction && (
                                                                        <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                                                                            {subject.instruction}
                                                                        </p>
                                                                    )}

                                                                    {subject.resources && subject.resources.length > 0 && (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {subject.resources.map((res, i) => (
                                                                                <span key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100">
                                                                                    <FileText size={12} />
                                                                                    {res}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className={`w-full lg:w-64 min-w-[240px] space-y-3 ${activeTimerId === taskId ? 'ring-2 ring-emerald-200 ring-offset-2 ring-offset-white rounded-2xl' : ''}`}>
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</div>
                                                                        <button 
                                                                            onClick={() => setOpenTrackerId(openTrackerId === taskId ? null : taskId)}
                                                                            className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-500 hover:text-blue-600 transition-colors bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg"
                                                                        >
                                                                            <Timer size={12} />
                                                                            Track
                                                                        </button>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-2">
                                                                        <button
                                                                            onClick={() => handleStatusChange(session._id, idx, 'pending')}
                                                                            className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.18em] transition-all ${
                                                                                currentStatus === 'pending'
                                                                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-400/20'
                                                                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                                            }`}
                                                                        >
                                                                            Pending
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleStatusChange(session._id, idx, 'in-progress')}
                                                                            className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.18em] transition-all ${
                                                                                isInProgress
                                                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-300/30'
                                                                                    : 'bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                                                                            }`}
                                                                        >
                                                                            Progress
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleCompleteTask(session._id, idx, taskId)}
                                                                            className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.18em] transition-all ${
                                                                                isComplete
                                                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200/50'
                                                                                    : 'bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                                                                            }`}
                                                                        >
                                                                            Done
                                                                        </button>
                                                                    </div>

                                                                    {openTrackerId === taskId && (
                                                                            <TimerPanel
                                                                                title={subject.title || subject.topic || subject.subjectName}
                                                                                timerState={timerState}
                                                                                progressPct={progressPct}
                                                                                onStart={() => handleStartTimer(taskId, session._id, idx)}
                                                                                onPause={() => handlePauseTimer(taskId)}
                                                                                onReset={() => handleResetTimer(taskId)}
                                                                            />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            </>

        </div>
    );
};

export default StudyPlanPage;