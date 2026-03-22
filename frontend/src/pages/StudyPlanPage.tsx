import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CalendarClock,
    CheckCircle2,
    Clock,
    FileText,
    Loader2,
    Plus,
    Trash2,
    Upload,
    Wand2,
} from 'lucide-react';
import { createStudyPlan, createStudyPlanWithDocs, deleteStudyPlan, fetchStudyPlans, markStudySubjectComplete, updateSubjectStatus } from '../services/studyPlanService';
import type {
    CreateStudyPlanInput,
    StudyPlan,
    StudySubject,
    StudySessionSubject,
    StudyPriority,
    StudyTaskStatus,
} from '../types/studyPlan';

const PRIORITY_META: Record<StudyPriority, { label: string; accent: string; tip: string }> = {
    critical: {
        label: 'Exam-crunch',
        accent: 'bg-rose-50 text-rose-700 border-rose-200',
        tip: 'Do first while fresh. Aim for deep focus and quick recall drills.',
    },
    high: {
        label: 'High focus',
        accent: 'bg-amber-50 text-amber-700 border-amber-200',
        tip: 'Tackle early. Alternate problems and short summaries to lock concepts.',
    },
    medium: {
        label: 'Steady',
        accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        tip: 'Use spaced practice. Finish with one cheat-sheet bullet list.',
    },
    low: {
        label: 'Light',
        accent: 'bg-slate-50 text-slate-700 border-slate-200',
        tip: 'Skim, annotate slides, and park doubts for later review.',
    },
};

const DEFAULT_START_MINUTES = 9 * 60; // 9:00 AM baseline timeline for students

const formatMinutesToTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const normalizedHour = ((hours + 11) % 12) + 1;
    const paddedMinutes = minutes.toString().padStart(2, '0');
    return `${normalizedHour}:${paddedMinutes} ${suffix}`;
};

const buildTimeline = (subjects: StudySessionSubject[]) => {
    let cursorMinutes = DEFAULT_START_MINUTES;
    return subjects.map((subject, idx) => {
        const durationMinutes = subject.durationMinutes ?? Math.round((subject.durationHours || 0) * 60);
        const start = cursorMinutes;
        cursorMinutes += Math.max(15, durationMinutes);
        const end = cursorMinutes;
        return { subject, idx, start, end };
    });
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

    const internshipHoursDerived = useMemo(() => {
        if (!planInput.internshipStartTime || !planInput.internshipEndTime) return null;
        const [sh, sm] = planInput.internshipStartTime.split(':').map(Number);
        const [eh, em] = planInput.internshipEndTime.split(':').map(Number);
        if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null;
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        if (end <= start) return null;
        return Math.round(((end - start) / 60) * 10) / 10;
    }, [planInput.internshipStartTime, planInput.internshipEndTime]);

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

    const handleMarkComplete = async (sessionId: string, subjectIdx: number) => {
        if (!selectedPlan) return;
        try {
            const updated = await markStudySubjectComplete(selectedPlan._id, sessionId, subjectIdx);
            setPlans((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
            toast.success('Marked as complete');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Could not update progress');
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
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                        <Wand2 size={14} />
                        AI study planner
                    </div>
                    <h1 className="text-3xl font-black text-slate-900">Study Plan Generator</h1>
                    <p className="max-w-3xl text-sm text-slate-500">
                        Don’t worry, we’ll balance your workload automatically. Upload materials, set your time, and let the AI build a calm schedule.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {plans.length > 0 && (
                        <button
                            onClick={() => setViewMode('plans')}
                            className="btn-primary inline-flex items-center gap-2 text-sm"
                        >
                            <BookOpen size={16} />
                            My Plans
                            <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold">
                                {plans.length}
                            </span>
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
                <div className="space-y-5 animate-slide-in">
                    {/* Stepper */}
                    <div className="card p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                                {[1, 2, 3].map((step) => (
                                    <React.Fragment key={step}>
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs ${
                                            currentStep === step
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : step < currentStep
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                                    : 'border-slate-200 text-slate-500'
                                        }`}>
                                            {step}
                                        </div>
                                        {step < 3 && <div className="h-[1px] w-12 bg-slate-200 md:w-20" />}
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="text-xs text-slate-500">Step {currentStep} of 3</div>
                        </div>
                    </div>

                    {/* Steps */}
                    {currentStep === 1 && (
                        <div className="space-y-5">
                            {/* Study Materials Upload */}
                            <div className="card p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Upload className="text-blue-600" size={20} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Upload study materials</p>
                                        <p className="text-xs text-slate-500">Lecture slides, module outlines, past papers. Drag & drop or click to add.</p>
                                    </div>
                                </div>
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className="rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/70 p-6 text-center"
                                >
                                    <p className="text-sm font-semibold text-slate-800">Drop files here or click to upload</p>
                                    <p className="text-xs text-slate-500">We keep it private; used only for topic extraction.</p>
                                    <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50 transition">
                                        <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.txt,.md,.json"
                                            onChange={(e) => handleFileSelect(e.target.files)}
                                        />
                                        Upload Files
                                    </label>
                                </div>
                                {documents.length > 0 && (
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {documents.map((file) => (
                                            <div key={file.name} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
                                                <FileText size={16} className="text-slate-500" />
                                                <div className="truncate text-sm font-semibold text-slate-800">{file.name}</div>
                                                <span className="ml-auto text-[11px] text-slate-500">{Math.round(file.size / 1024)} KB</span>
                                                <button
                                                    onClick={() => setDocuments((prev) => prev.filter((f) => f.name !== file.name))}
                                                    className="rounded-full px-1.5 py-0.5 text-xs font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                    aria-label="Remove file"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Timetable Upload */}
                            <div className="card p-6 space-y-4">
                                <div className="flex items-center gap-3">
                                    <CalendarClock className="text-purple-600" size={20} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Upload exam timetable</p>
                                        <p className="text-xs text-slate-500">Upload your exam schedule so we can auto-prioritise subjects by date.</p>
                                    </div>
                                </div>
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleTimetableDrop}
                                    className="rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/70 p-6 text-center"
                                >
                                    <p className="text-sm font-semibold text-slate-800">Drop timetable here or click to upload</p>
                                    <p className="text-xs text-slate-500">Supports PDF, images, CSV, Excel — we'll extract the dates for you.</p>
                                    <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm hover:bg-purple-50 transition">
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
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {timetableFiles.map((file) => (
                                            <div key={file.name} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
                                                <Calendar size={16} className="text-purple-500" />
                                                <div className="truncate text-sm font-semibold text-slate-800">{file.name}</div>
                                                <span className="ml-auto text-[11px] text-slate-500">{Math.round(file.size / 1024)} KB</span>
                                                <button
                                                    onClick={() => setTimetableFiles((prev) => prev.filter((f) => f.name !== file.name))}
                                                    className="rounded-full px-1.5 py-0.5 text-xs font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                    aria-label="Remove timetable"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-slate-500">Tip: Upload your timetable so we can auto-set exam dates and prioritise subjects.</div>
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    className="btn-primary text-sm"
                                >
                                    Next: Preferences
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
                                                    <span className="text-[11px] text-slate-500">End</span>
                                                    <input
                                                        type="time"
                                                        className="input w-full"
                                                        value={planInput.internshipEndTime}
                                                        onChange={(e) => handleInternshipTimeChange('internshipEndTime', e.target.value)}
                                                    />
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

                                <div className="card p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="text-emerald-600" size={20} />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Subjects</p>
                                            <p className="text-xs text-slate-500">Just the basics — AI fills in the details.</p>
                                        </div>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600">Name</label>
                                            <input
                                                className="input w-full"
                                                placeholder="Distributed Systems"
                                                value={subjectDraft.name}
                                                onChange={(e) => setSubjectDraft({ ...subjectDraft, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600">Difficulty</label>
                                            <div className="flex gap-2">
                                                {['easy', 'medium', 'hard'].map((level) => (
                                                    <button
                                                        key={level}
                                                        type="button"
                                                        className={`flex-1 rounded-full border px-3 py-1 text-xs font-semibold capitalize transition ${
                                                            subjectDraft.difficulty === level
                                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                                        }`}
                                                        onClick={() => setSubjectDraft({ ...subjectDraft, difficulty: level as any })}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
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

                                    {planInput.subjects.length > 0 && (
                                        <div className="mt-2 space-y-3">
                                            <p className="text-xs font-semibold text-slate-600">Subjects added</p>
                                            <div className="grid gap-3 md:grid-cols-2">
                                                {planInput.subjects.map((subject, idx) => (
                                                    <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-semibold text-slate-900">{subject.name}</p>
                                                            <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                                                                <span className="glass-pill">{subject.creditHours} credits</span>
                                                                <span className="glass-pill capitalize">{subject.difficulty}</span>
                                                                {subject.examDate && <span className="glass-pill">Exam {subject.examDate}</span>}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveSubject(idx)}
                                                            className="rounded-full px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                            aria-label="Remove subject"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
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

                                {selectedPlan && (
                                    <div className="card p-5 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-indigo-600" />
                                            <p className="text-sm font-semibold text-slate-900">Plan snapshot</p>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                                            {selectedPlan.aiSummary || 'AI tips will appear here after generation.'}
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 text-center">
                                            <div className="rounded-xl bg-blue-50 p-3">
                                                <p className="text-xs text-slate-500">Study days</p>
                                                <p className="text-lg font-bold text-slate-900">{selectedPlan.totalStudyDays || '-'}</p>
                                            </div>
                                            <div className="rounded-xl bg-emerald-50 p-3">
                                                <p className="text-xs text-slate-500">Total hours</p>
                                                <p className="text-lg font-bold text-slate-900">{totalHours.toFixed(1)}</p>
                                            </div>
                                            <div className="rounded-xl bg-amber-50 p-3">
                                                <p className="text-xs text-slate-500">Daily cap</p>
                                                <p className="text-lg font-bold text-slate-900">{selectedPlan.availableHoursPerDay}h</p>
                                            </div>
                                        </div>
                                        {documents.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-slate-600">Attached files (local)</p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {documents.map((file) => (
                                                        <span key={file.name} className="glass-pill text-[11px] font-semibold text-slate-700">
                                                            {file.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
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

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                    </div>

                                    {/* Subjects pills */}
                                    <div className="flex flex-wrap gap-1">
                                        {plan.subjects.slice(0, 4).map((subj, i) => (
                                            <span key={i} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 truncate max-w-[120px]">
                                                {subj.name}
                                            </span>
                                        ))}
                                        {plan.subjects.length > 4 && (
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                                +{plan.subjects.length - 4} more
                                            </span>
                                        )}
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-[11px]">
                                            <span className="font-semibold text-slate-600">{completedTasks}/{totalTasks} tasks</span>
                                            <span className="font-bold text-blue-700">{plan.overallProgress}%</span>
                                        </div>
                                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
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
                <div className="space-y-5 animate-slide-in">
                    {/* Schedule Header */}
                    <div className="card p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <button onClick={() => setViewMode('plans')} className="btn-ghost inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-800 px-0">
                                    <ArrowLeft size={14} />
                                    All plans
                                </button>
                            </div>
                            <p className="text-xs font-semibold text-blue-700">{selectedPlan.title}</p>
                            <h2 className="text-2xl font-black text-slate-900">Your Study Schedule</h2>
                            <p className="text-sm text-slate-500">Update task status as you progress through your plan.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 px-5 py-3 text-center">
                                <p className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">Progress</p>
                                <p className="text-2xl font-black text-blue-700">{selectedPlan.overallProgress}%</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-5 py-3 text-center">
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Hours</p>
                                <p className="text-2xl font-black text-slate-900">{totalHours.toFixed(1)}</p>
                            </div>
                            <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-center">
                                <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">Days</p>
                                <p className="text-2xl font-black text-emerald-700">{selectedPlan.totalStudyDays}</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Summary */}
                    {selectedPlan.aiSummary && (
                        <div className="card p-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border-indigo-100">
                            <div className="flex items-start gap-3">
                                <Wand2 size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-semibold text-indigo-700 mb-1">AI Study Strategy</p>
                                    <p className="text-sm text-slate-700 leading-relaxed">{selectedPlan.aiSummary}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Overall progress bar */}
                    <div className="card p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-600">Overall completion</span>
                            <span className="text-xs font-bold text-blue-700">{selectedPlan.overallProgress}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 transition-all duration-700"
                                style={{ width: `${selectedPlan.overallProgress}%` }}
                            />
                        </div>
                    </div>

                    {/* Daily Session Cards */}
                    {selectedPlan.sessions.map((session) => {
                        const dayCompleted = session.subjects.filter(s => s.status === 'completed' || s.isCompleted).length;
                        const dayInProgress = session.subjects.filter(s => s.status === 'in-progress').length;
                        const dayTotal = session.subjects.length;
                        const dayProgress = dayTotal > 0 ? Math.round(((dayCompleted + dayInProgress * 0.5) / dayTotal) * 100) : 0;

                        return (
                            <div key={session._id} className="card overflow-hidden">
                                {/* Day Header */}
                                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-3 border-b border-slate-100">
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white text-sm font-black">
                                                {session.day}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">
                                                    {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                                </p>
                                                {session.notes && (
                                                    <p className="text-[11px] text-slate-500">{session.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                <Clock size={12} />
                                                <span className="font-semibold">{session.totalStudyHours}h</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px]">
                                                <span className="font-semibold text-emerald-600">{dayCompleted}</span>
                                                <span className="text-slate-400">/</span>
                                                <span className="font-semibold text-slate-600">{dayTotal}</span>
                                                <span className="text-slate-400">done</span>
                                            </div>
                                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-500" style={{ width: `${dayProgress}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Task Cards */}
                                <div className="p-4 space-y-3">
                                    {session.subjects.map((subject, idx) => {
                                        const currentStatus: StudyTaskStatus = subject.status || (subject.isCompleted ? 'completed' : 'pending');
                                        const priorityMeta = PRIORITY_META[subject.priority] || PRIORITY_META.medium;
                                        const isComplete = currentStatus === 'completed';
                                        const isInProgress = currentStatus === 'in-progress';

                                        const taskTypeBg: Record<string, string> = {
                                            reading: 'bg-blue-100 text-blue-700',
                                            summarizing: 'bg-purple-100 text-purple-700',
                                            practice: 'bg-amber-100 text-amber-700',
                                            revision: 'bg-emerald-100 text-emerald-700',
                                            'self-test': 'bg-rose-100 text-rose-700',
                                        };

                                        return (
                                            <div
                                                key={`${session._id}-${idx}`}
                                                className={`rounded-2xl border p-4 transition-all ${
                                                    isComplete
                                                        ? 'border-emerald-200 bg-emerald-50/50'
                                                        : isInProgress
                                                            ? 'border-amber-200 bg-amber-50/30'
                                                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    {/* Left: Task details */}
                                                    <div className="flex-1 space-y-2 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {subject.taskType && (
                                                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${taskTypeBg[subject.taskType] || 'bg-slate-100 text-slate-600'}`}>
                                                                    {subject.taskType}
                                                                </span>
                                                            )}
                                                            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${priorityMeta.accent}`}>
                                                                {priorityMeta.label}
                                                            </span>
                                                            {subject.technique && (
                                                                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-100">
                                                                    {subject.technique}
                                                                </span>
                                                            )}
                                                            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                                                <Clock size={11} />
                                                                {subject.durationMinutes ? `${subject.durationMinutes}m` : `${subject.durationHours}h`}
                                                            </span>
                                                        </div>

                                                        <h4 className={`text-sm font-bold ${
                                                            isComplete ? 'text-slate-500 line-through' : 'text-slate-900'
                                                        }`}>
                                                            {subject.title || subject.topic || subject.subjectName}
                                                        </h4>

                                                        <p className="text-xs text-slate-500">
                                                            {subject.subjectName}{subject.topic ? ` · ${subject.topic}` : ''}
                                                        </p>

                                                        {subject.instruction && (
                                                            <div className="rounded-xl bg-slate-50 px-3 py-2 text-[12px] text-slate-600 leading-relaxed">
                                                                {subject.instruction}
                                                            </div>
                                                        )}

                                                        {subject.resources && subject.resources.length > 0 && (
                                                            <div className="flex flex-wrap gap-1">
                                                                {subject.resources.map((res, i) => (
                                                                    <span key={i} className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                                                                        📄 {res}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right: Status buttons */}
                                                    <div className="flex sm:flex-col gap-1.5 flex-shrink-0">
                                                        <button
                                                            onClick={() => handleStatusChange(session._id, idx, 'pending')}
                                                            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                                                                currentStatus === 'pending'
                                                                    ? 'bg-slate-200 text-slate-700 shadow-sm'
                                                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                                            }`}
                                                        >
                                                            Pending
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(session._id, idx, 'in-progress')}
                                                            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                                                                currentStatus === 'in-progress'
                                                                    ? 'bg-amber-100 text-amber-700 shadow-sm ring-1 ring-amber-200'
                                                                    : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600'
                                                            }`}
                                                        >
                                                            In Progress
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(session._id, idx, 'completed')}
                                                            className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-all ${
                                                                currentStatus === 'completed'
                                                                    ? 'bg-emerald-100 text-emerald-700 shadow-sm ring-1 ring-emerald-200'
                                                                    : 'bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
                                                            }`}
                                                        >
                                                            ✓ Done
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudyPlanPage;
