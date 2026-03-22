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
    ListTodo,
    Zap,
    Shield,
    Flame,
    Gauge,
    Sparkles,
    Activity,
} from 'lucide-react';
import { createStudyPlan, createStudyPlanWithDocs, deleteStudyPlan, fetchStudyPlans, markStudySubjectComplete, updateSubjectStatus } from '../services/studyPlanService';
import type {
    CreateStudyPlanInput,
    StudyPlan,
    StudySubject,
    StudyPriority,
    StudyTaskStatus,
    StudyDifficulty,
} from '../types/studyPlan';

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
            internshipHoursPerDay: 4,
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
        internshipHoursPerDay: 4,
        subjects: [],
    });
    const [manualHoursOverride, setManualHoursOverride] = useState(false);

    const handleInternshipTimeChange = (field: 'internshipStartTime' | 'internshipEndTime', value: string) => {
        setManualHoursOverride(false);
        setPlanInput((prev) => {
            const next = { ...prev, [field]: value };
            const derived = computeDerivedAvailability(next);
            return { ...next, availableHoursPerDay: derived };
        });
    };

    const handleInternshipLoadChange = (field: 'internshipHoursPerDay' | 'internshipDaysPerWeek', value: number) => {
        setManualHoursOverride(false);
        setPlanInput((prev) => {
            const next = { ...prev, [field]: value };
            const derived = computeDerivedAvailability(next);
            return { ...next, availableHoursPerDay: derived };
        });
    };

    useEffect(() => {
        if (manualStudyHours) return;
        const suggested = deriveStudyHoursFromInternshipLoad(internshipHoursPerDay);
        setPlanInput((prev) => ({ ...prev, availableHoursPerDay: suggested, internshipHoursPerDay }));
    }, [internshipHoursPerDay, manualStudyHours]);

    const [subjectDraft, setSubjectDraft] = useState<StudySubject & { topicsInput?: string }>(
        {
            name: '',
            creditHours: 3,
            difficulty: 'medium',
            examDate: '',
            weight: 1,
            syllabusTopics: [],
            topicsInput: '',
        }
    );

    const derivedAvailableHours = useMemo(() => {
        if (manualHoursOverride && planInput.availableHoursPerDay) return planInput.availableHoursPerDay;
        return computeDerivedAvailability(planInput);
    }, [manualHoursOverride, planInput]);

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



    const internshipLoadLabel = useMemo(() => {
        if (planInput.internshipHoursPerDay) {
            const days = planInput.internshipDaysPerWeek ?? '—';
            return `${days}d/w · ${planInput.internshipHoursPerDay}h`;
        }
        if (internshipHoursDerived) return `${internshipHoursDerived}h/day`;
        return 'hours';
    }, [planInput.internshipDaysPerWeek, planInput.internshipHoursPerDay, internshipHoursDerived]);

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

    const handleAddSubject = () => {
        if (!subjectDraft.name.trim()) {
            toast.error('Add a subject name first');
            return;
        }

        const topics = subjectDraft.topicsInput
            ? subjectDraft.topicsInput.split(',').map((t) => t.trim()).filter(Boolean)
            : [];

        const newSubject: StudySubject = {
            name: subjectDraft.name.trim(),
            creditHours: Number(subjectDraft.creditHours) || 3,
            difficulty: subjectDraft.difficulty,
            examDate: subjectDraft.examDate || undefined,
            weight: Number(subjectDraft.weight) || 1,
            syllabusTopics: topics,
        };

        setPlanInput((prev) => ({ ...prev, subjects: [...prev.subjects, newSubject] }));
        setSubjectDraft({ name: '', creditHours: 3, difficulty: 'medium', examDate: '', weight: 1, syllabusTopics: [], topicsInput: '' });
    };

    const handleRemoveSubject = (idx: number) => {
        setPlanInput((prev) => ({
            ...prev,
            subjects: prev.subjects.filter((_, i) => i !== idx),
        }));
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
        try {
            const safeTitle = planInput.title.trim() || `Study plan ${new Date().toISOString().slice(0, 10)}`;
            const derivedHours = derivedAvailableHours || Number(planInput.availableHoursPerDay) || 4;

            const payload: CreateStudyPlanInput = {
                ...planInput,
                title: safeTitle,
                subjects: allFiles.length > 0 ? [] : planInput.subjects,
                availableHoursPerDay: derivedHours,
            };

            const allFiles = [...documents, ...timetableFiles];
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
            setIsCreating(false);
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

    const totalHours = selectedPlan?.sessions?.reduce((sum, s) => sum + (s.totalStudyHours || 0), 0) || 0;

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
                            Cognitive Nexus
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                                Study Plan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Architect</span>
                            </h1>
                            <p className="max-w-2xl text-lg font-medium text-slate-400 leading-relaxed">
                                Engineer your academic success. Our AI orchestrates your study materials and internship schedule into a high-performance roadmap.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 border border-white/10">
                                <Activity size={16} className="text-emerald-400" />
                                <span className="text-sm font-semibold text-slate-300">System Uptime: Active</span>
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 border border-white/10">
                                <Zap size={16} className="text-blue-400" />
                                <span className="text-sm font-semibold text-slate-300">AI Engine: Llama 3.1</span>
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
                                My Performance Hub
                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-950 text-[10px] font-black text-white">
                                    {plans.length}
                                </span>
                            </button>
                        )}
                        <button
                            onClick={() => navigate('/study')}
                            className="flex items-center justify-center gap-3 rounded-2xl bg-white/5 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 border border-white/10"
                        >
                            <Plus size={18} />
                            New Study Plan
                        </button>
                    )}
                    <button
                        onClick={() => {
                            setViewMode('builder');
                            setCurrentStep(1);
                            setSelectedPlanId(null);
                        }}
                        className="btn-secondary text-sm flex items-center gap-2"
                    >
                        <Plus size={16} />
                        New Study Plan
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
                                                    : step < currentStep
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {step < currentStep ? <CheckCircle2 size={18} /> : step}
                                            </div>
                                            <div className="hidden lg:block">
                                                <p className={`text-[10px] font-black uppercase tracking-wider ${
                                                    currentStep === step ? 'text-blue-600' : 'text-slate-400'
                                                }`}>
                                                    Phase {step}
                                                </p>
                                                <p className="text-xs font-bold text-slate-900">
                                                    {step === 1 ? 'Discovery' : step === 2 ? 'Architecture' : 'Deployment'}
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
                                    Quick-fill Blueprint
                                </button>
                                <div className="h-10 w-[1px] bg-slate-200 hidden md:block" />
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Pipeline</p>
                                    <p className="text-sm font-black text-slate-900">3-Stage Core</p>
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
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Topic Extraction Engine</p>
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
                                            Initialize Upload
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
                                            <h3 className="text-lg font-black text-slate-900">Exam Timetable</h3>
                                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temporal Alignment</p>
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
                                        <p className="mt-1 text-xs text-slate-500">Auto-prioritization System</p>
                                        <label className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-xs font-black text-white shadow-xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95">
                                            <input
                                                type="file"
                                                className="hidden"
                                                multiple
                                                accept=".pdf,.png,.jpg,.jpeg,.csv,.xls,.xlsx,.txt,.md,.json,.doc,.docx"
                                                onChange={(e) => handleTimetableSelect(e.target.files)}
                                            />
                                            Calibrate Dates
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
                                <p className="text-xs font-medium text-slate-400 italic">Phase 1: Intellectual Asset Aggregation</p>
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="flex items-center gap-2 rounded-[2rem] bg-blue-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95"
                                >
                                    Proceed to Architecture
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="space-y-6 lg:col-span-2">
                                <div className="card p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="text-purple-600" size={20} />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Study preferences</p>
                                            <p className="text-xs text-slate-500">Keep it light — we’ll balance internship and study time.</p>
                                        </div>
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-xs font-semibold text-slate-600">Plan title</label>
                                            <div className="flex gap-2">
                                                <input
                                                    className="input w-full"
                                                    placeholder="e.g., Semester 6 + Internship"
                                                    value={planInput.title}
                                                    onChange={(e) => {
                                                        const next = e.target.value;
                                                        setPlanInput({ ...planInput, title: next });
                                                        if (next.trim()) setTitleError(null);
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={prefillDemoPlan}
                                                    className="rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
                                                >
                                                    Quick fill
                                                </button>
                                            </div>
                                            {titleError ? (
                                                <p className="text-[11px] font-semibold text-red-600">The title is required</p>
                                            ) : (
                                                <p className="text-[11px] text-slate-500">Keep it short so you can spot the right plan later.</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-slate-600">Exam window</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="date"
                                                    className="input w-full"
                                                    min={todayISO}
                                                    value={planInput.examStartDate}
                                                    onChange={(e) => setPlanInput({ ...planInput, examStartDate: clampToToday(e.target.value) })}
                                                />
                                                <input
                                                    type="date"
                                                    className="input w-full"
                                                    min={todayISO}
                                                    value={planInput.examEndDate}
                                                    onChange={(e) => setPlanInput({ ...planInput, examEndDate: clampToToday(e.target.value) })}
                                                />
                                            </div>
                                            <p className="text-[11px] text-slate-500">We’ll prioritise subjects with closer exam dates.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 lg:grid-cols-3">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600">Internship days per week</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="range"
                                                    min={0}
                                                    max={7}
                                                    step={1}
                                                    value={planInput.internshipDaysPerWeek ?? 0}
                                                    onChange={(e) => handleInternshipLoadChange('internshipDaysPerWeek', Number(e.target.value))}
                                                    className="flex-1"
                                                />
                                                <span className="w-14 text-right text-sm font-semibold text-slate-900">{planInput.internshipDaysPerWeek}d</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">We’ll keep study blocks on your off days.</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600">Internship hours per day</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="range"
                                                    min={1}
                                                    max={12}
                                                    step={0.5}
                                                    value={planInput.internshipHoursPerDay ?? 1}
                                                    onChange={(e) => handleInternshipLoadChange('internshipHoursPerDay', Number(e.target.value))}
                                                    className="flex-1"
                                                />
                                                <span className="w-14 text-right text-sm font-semibold text-slate-900">{planInput.internshipHoursPerDay}h</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Used to cap your daily study time.</p>
                                        </div>
                                        <div className="grid gap-2">
                                            <label className="text-xs font-semibold text-slate-600">Internship time range (optional)</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <span className="text-[11px] text-slate-500">Start</span>
                                                    <input
                                                        type="time"
                                                        className="input w-full"
                                                        value={planInput.internshipStartTime}
                                                        onChange={(e) => handleInternshipTimeChange('internshipStartTime', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Study preferences</p>
                                                    <h3 className="text-lg font-black text-slate-900">Balance study + internship</h3>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-500">We’ll keep study blocks outside this window.</p>
                                        </div>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600">Daily study hours</label>
                                            <div className="flex items-center gap-3">
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
                                                    className="flex-1"
                                                />
                                                <span className="w-12 text-right text-sm font-semibold text-slate-900">{manualHoursOverride ? planInput.availableHoursPerDay : derivedAvailableHours}h</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">Derived from your internship load: {derivedAvailableHours}h/day. Adjust only if you want to override.</p>
                                        </div>
                                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-600">
                                            <p className="font-semibold text-slate-800">What we’ll use</p>
                                            <div className="mt-2 flex flex-wrap gap-2 font-semibold">
                                                <span className="glass-pill text-[11px]">{planInput.internshipDaysPerWeek} days/week</span>
                                                <span className="glass-pill text-[11px]">{planInput.internshipHoursPerDay}h/day</span>
                                                <span className="glass-pill text-[11px]">{derivedAvailableHours}h study/day</span>
                                                <span className="glass-pill text-[11px]">Exams {planInput.examStartDate || '--'} → {planInput.examEndDate || '--'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Subject Management Panel */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 h-full">
                                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                                    <ListTodo size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900">Intellectual Registry</h3>
                                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Subject Management Stack</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Add Subject Glass-box */}
                                            <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100">
                                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                                    <div className="lg:col-span-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Subject Title"
                                                            value={subjectDraft.name}
                                                            onChange={(e) => setSubjectDraft({ ...subjectDraft, name: e.target.value })}
                                                            className="w-full rounded-2xl border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-900 focus:border-blue-500"
                                                        />
                                                    </div>
                                                    <select
                                                        value={subjectDraft.difficulty}
                                                        onChange={(e) => setSubjectDraft({ ...subjectDraft, difficulty: e.target.value as StudyDifficulty })}
                                                        className="w-full rounded-2xl border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-900 focus:border-blue-500"
                                                    >
                                                        <option value="easy">Level: Easy</option>
                                                        <option value="medium">Level: Medium</option>
                                                        <option value="hard">Level: Hard</option>
                                                    </select>
                                                    <input
                                                        type="number"
                                                        placeholder="Credits"
                                                        value={subjectDraft.creditHours}
                                                        onChange={(e) => setSubjectDraft({ ...subjectDraft, creditHours: Number(e.target.value) })}
                                                        className="w-full rounded-2xl border-slate-200 bg-white py-3 px-4 text-sm font-bold text-slate-900 focus:border-blue-500"
                                                    />
                                                    <button
                                                        onClick={handleAddSubject}
                                                        disabled={!subjectDraft.name}
                                                        className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Plus size={16} />
                                                        Deploy
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600">Credit hours</label>
                                            <input
                                                type="number"
                                                className="input w-full"
                                                min={1}
                                                max={6}
                                                value={subjectDraft.creditHours}
                                                onChange={(e) => setSubjectDraft({ ...subjectDraft, creditHours: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600">Weight</label>
                                            <input
                                                type="number"
                                                className="input w-full"
                                                min={1}
                                                max={5}
                                                step={0.5}
                                                value={subjectDraft.weight}
                                                onChange={(e) => setSubjectDraft({ ...subjectDraft, weight: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600">Exam date (optional)</label>
                                            <input
                                                type="date"
                                                className="input w-full"
                                                min={todayISO}
                                                value={subjectDraft.examDate}
                                                onChange={(e) => setSubjectDraft({ ...subjectDraft, examDate: clampToToday(e.target.value) })}
                                            />
                                        </div>
                                        <div className="flex flex-col justify-end">
                                            <button
                                                type="button"
                                                onClick={handleAddSubject}
                                                className="btn-primary inline-flex items-center justify-center gap-2 text-sm"
                                            >
                                                <Plus size={16} />
                                                Add subject
                                            </button>
                                        </div>
                                    </div>

                                            {/* Subjects List */}
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {planInput.subjects.length === 0 ? (
                                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-slate-400">
                                                        <div className="mb-4 rounded-full bg-slate-50 p-4">
                                                            <ListTodo size={32} />
                                                        </div>
                                                        <p className="text-sm font-bold">Stack Empty</p>
                                                        <p className="max-w-[200px] text-xs">Define your subjects to begin schedule orchestration.</p>
                                                    </div>
                                                ) : (
                                                    planInput.subjects.map((sub, idx) => (
                                                        <div key={idx} className="group relative flex items-center gap-4 rounded-3xl bg-white p-4 border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-slate-200">
                                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                                                                sub.difficulty === 'hard' ? 'bg-rose-50 text-rose-600' :
                                                                sub.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' :
                                                                'bg-emerald-50 text-emerald-600'
                                                            }`}>
                                                                <Brain size={20} />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="truncate text-sm font-black text-slate-900">{sub.name}</h4>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{sub.difficulty} Difficulty</span>
                                                                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 rounded-full">
                                                                        {sub.creditHours} Credits
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleRemoveSubject(idx)}
                                                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-600"
                                                            >
                                                                <Plus size={18} className="rotate-45" />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="card p-5 space-y-3">
                                    <p className="text-sm font-semibold text-slate-900">Need a break?</p>
                                    <p className="text-xs text-slate-500">You can go back and edit before generating.</p>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setCurrentStep(1)} className="btn-secondary text-sm">Back</button>
                                        <button onClick={() => setCurrentStep(3)} className="btn-primary text-sm">Next: Review</button>
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
                                        <p className="text-sm font-semibold text-slate-900">Review & generate</p>
                                        <p className="text-xs text-slate-500">One click to create a calm schedule.</p>
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

                                {/* Sidebar Stats/Plans */}
                                <div className="space-y-8">
                                    <div className="rounded-[2.5rem] bg-slate-50 p-8 border border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Operational History</h4>
                                            {isLoadingPlans && <Loader2 size={14} className="animate-spin text-slate-400" />}
                                        </div>
                                        
                                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {plans.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-xs font-bold text-slate-400">No active blueprints</p>
                                                </div>
                                            ) : (
                                                plans.map((plan) => (
                                                    <button
                                                        key={plan._id}
                                                        onClick={() => {
                                                            setSelectedPlanId(plan._id);
                                                            setViewMode('schedule');
                                                        }}
                                                        className={`w-full group relative rounded-3xl p-5 text-left transition-all border ${
                                                            selectedPlan?._id === plan._id 
                                                            ? 'bg-white border-blue-200 shadow-lg shadow-blue-100/50' 
                                                            : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'
                                                        }`}
                                                    >
                                                        <p className="text-sm font-black text-slate-900 mb-1 truncate">{plan.title}</p>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{plan.subjects.length} Modules</span>
                                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{plan.overallProgress}%</span>
                                                        </div>
                                                        <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                                            <div 
                                                                className="h-full bg-blue-500 transition-all duration-500" 
                                                                style={{ width: `${plan.overallProgress}%` }}
                                                            />
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {selectedPlan && (
                                        <div className="rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6 animate-in slide-in-from-right-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Blueprint Snapshot</p>
                                            </div>
                                            
                                            <div className="rounded-2xl bg-amber-50 p-4 border border-amber-100">
                                                <p className="text-xs text-amber-900 leading-relaxed font-medium italic">
                                                    "{selectedPlan.aiSummary || 'System analysis pending...'}"
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-slate-50">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Hours</p>
                                                    <p className="text-lg font-black text-slate-900">{totalHours.toFixed(1)}h</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-slate-50">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Subjects</p>
                                                    <p className="text-lg font-black text-slate-900">{selectedPlan.subjects.length}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
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
                                            <p className="text-sm font-bold text-slate-900">{planHours.toFixed(1)}</p>
                                        </div>
                                        <div className="rounded-xl bg-amber-50 p-2">
                                            <p className="text-[10px] text-slate-500">Subjects</p>
                                            <p className="text-sm font-bold text-slate-900">{plan.subjects.length}</p>
                                        </div>

                                        <h3 className="text-lg font-black text-slate-900 mb-1 truncate">{plan.title}</h3>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">Cognitive Nexus Blueprint</p>

                                        <div className="grid grid-cols-3 gap-3 mb-6">
                                            <div className="rounded-2xl bg-slate-50 p-3 text-center border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Days</p>
                                                <p className="text-sm font-black text-slate-900">{plan.totalStudyDays}</p>
                                            </div>
                                            <div className="rounded-2xl bg-blue-50 p-3 text-center border border-blue-100/50">
                                                <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Hours</p>
                                                <p className="text-sm font-black text-blue-700">{planHours.toFixed(1)}</p>
                                            </div>
                                            <div className="rounded-2xl bg-emerald-50 p-3 text-center border border-emerald-100/50">
                                                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1">Subject</p>
                                                <p className="text-sm font-black text-emerald-700">{plan.subjects.length}</p>
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
                                    Return to Command Center
                                </button>
                                
                                <div>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Study Matrix</h2>
                                    <p className="text-sm font-semibold text-slate-400 max-w-md">
                                        Operational schedule for <span className="text-blue-600">"{selectedPlan.title}"</span>. Progress tracking enabled.
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
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">AI Adaptive Strategy Protocol</p>
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
                                                        <span className="text-sm font-black text-slate-700">{session.totalStudyHours}h</span>
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
                                                                            {subject.durationMinutes ? `${subject.durationMinutes}m` : `${subject.durationHours}h`}
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

                                                                <div className="lg:w-52 space-y-2">
                                                                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</div>
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
                                                                            onClick={() => handleStatusChange(session._id, idx, 'completed')}
                                                                            className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-[0.18em] transition-all ${
                                                                                isComplete
                                                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200/50'
                                                                                    : 'bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
                                                                            }`}
                                                                        >
                                                                            Done
                                                                        </button>
                                                                    </div>
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
        </div>
    );
};

export default StudyPlanPage;
