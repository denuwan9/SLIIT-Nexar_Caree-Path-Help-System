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
    KeyRound,
    Loader2,
    Plus,
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
import { createStudyPlan, createStudyPlanWithDocs, fetchStudyPlans, updateSubjectStatus } from '../services/studyPlanService';
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
    const [apiKey, setApiKey] = useState('');
    const [documents, setDocuments] = useState<File[]>([]);
    const [timetableFiles, setTimetableFiles] = useState<File[]>([]);
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    const [plans, setPlans] = useState<StudyPlan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'builder' | 'plans' | 'schedule'>('builder');
    const [justGenerated, setJustGenerated] = useState(false);

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

    const prefillDemoPlan = () => {
        const today = new Date();
        const start = new Date(today);
        const end = new Date(today);
        start.setDate(start.getDate() + 3);
        end.setDate(end.getDate() + 21);

        setPlanInput({
            title: 'Internship + Finals Sprint',
            examStartDate: start.toISOString().slice(0, 10),
            examEndDate: end.toISOString().slice(0, 10),
            availableHoursPerDay: computeStudyHoursFromInternship('09:00', '13:00', 4) || 4,
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
        internshipStartTime: '',
        internshipEndTime: '',
        subjects: [],
    });

    const handleInternshipTimeChange = (field: 'internshipStartTime' | 'internshipEndTime', value: string) => {
        setPlanInput((prev) => {
            const next = { ...prev, [field]: value };
            const derived = computeStudyHoursFromInternship(next.internshipStartTime, next.internshipEndTime, next.availableHoursPerDay);
            return derived ? { ...next, availableHoursPerDay: derived } : next;
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
        if (!planInput.examStartDate || !planInput.examEndDate) {
            toast.error('Exam start and end dates are required');
            return;
        }
        if (planInput.subjects.length === 0) {
            toast.error('Add at least one subject');
            return;
        }

        setIsCreating(true);
        try {
            const safeTitle = planInput.title.trim() || `Study plan ${new Date().toISOString().slice(0, 10)}`;
            const derivedHours = computeStudyHoursFromInternship(
                planInput.internshipStartTime,
                planInput.internshipEndTime,
                Number(planInput.availableHoursPerDay) || 4
            ) || Number(planInput.availableHoursPerDay) || 4;

            const payload: CreateStudyPlanInput = {
                ...planInput,
                title: safeTitle,
                subjects: planInput.subjects,
                availableHoursPerDay: derivedHours,
            };

            const allFiles = [...documents, ...timetableFiles];
            let created: StudyPlan;
            if (allFiles.length > 0) {
                const formData = new FormData();
                formData.append('title', payload.title);
                formData.append('examStartDate', payload.examStartDate);
                formData.append('examEndDate', payload.examEndDate);
                formData.append('availableHoursPerDay', String(payload.availableHoursPerDay ?? 4));
                if (payload.internshipStartTime) formData.append('internshipStartTime', payload.internshipStartTime);
                if (payload.internshipEndTime) formData.append('internshipEndTime', payload.internshipEndTime);
                formData.append('subjects', JSON.stringify(payload.subjects));
                if (apiKey.trim()) formData.append('aiKey', apiKey.trim());
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
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center justify-center gap-3 rounded-2xl bg-white/5 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-white/10 border border-white/10"
                        >
                            <ChevronLeft size={18} />
                            Return to Command
                        </button>
                    </div>
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
                        <div className="space-y-8">
                            <div className="grid gap-8 lg:grid-cols-3">
                                {/* Configuration Panel */}
                                <div className="lg:col-span-1 space-y-8">
                                    <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                                        <div className="relative space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                                    <Gauge size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900">Parameters</h3>
                                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Constraints</p>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Target Study Hours</label>
                                                    <div className="relative">
                                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                        <input
                                                            type="number"
                                                            value={planInput.availableHoursPerDay}
                                                            onChange={(e) => setPlanInput({ ...planInput, availableHoursPerDay: Number(e.target.value) })}
                                                            className="w-full rounded-2xl border-slate-100 bg-slate-50 py-4 pl-12 pr-4 text-sm font-bold text-slate-900 transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                                            placeholder="e.g. 20"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 text-purple-600">Internship Window</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="relative">
                                                            <input
                                                                type="time"
                                                                value={planInput.internshipStartTime}
                                                                onChange={(e) => handleInternshipTimeChange('internshipStartTime', e.target.value)}
                                                                className="w-full rounded-2xl border-slate-100 bg-slate-50 py-4 px-4 text-xs font-bold text-slate-900 focus:border-purple-500"
                                                            />
                                                        </div>
                                                        <div className="relative">
                                                            <input
                                                                type="time"
                                                                value={planInput.internshipEndTime}
                                                                onChange={(e) => handleInternshipTimeChange('internshipEndTime', e.target.value)}
                                                                className="w-full rounded-2xl border-slate-100 bg-slate-50 py-4 px-4 text-xs font-bold text-slate-900 focus:border-purple-500"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 rounded-xl bg-purple-50 p-3">
                                                        <Shield size={14} className="text-purple-600" />
                                                        <span className="text-[10px] font-bold text-purple-700">Internship hours are protected from study sessions.</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Exam Window</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            type="date"
                                                            value={planInput.examStartDate}
                                                            onChange={(e) => setPlanInput({ ...planInput, examStartDate: e.target.value })}
                                                            className="w-full rounded-2xl border-slate-100 bg-slate-50 py-3 px-3 text-xs font-bold text-slate-900 focus:border-blue-500"
                                                        />
                                                        <input
                                                            type="date"
                                                            value={planInput.examEndDate}
                                                            onChange={(e) => setPlanInput({ ...planInput, examEndDate: e.target.value })}
                                                            className="w-full rounded-2xl border-slate-100 bg-slate-50 py-3 px-3 text-xs font-bold text-slate-900 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-[2.5rem] bg-slate-950 p-8 shadow-2xl space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                                <KeyRound size={20} />
                                            </div>
                                            <h4 className="font-black text-white">Neural Key</h4>
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="Enter Groq API Key"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="w-full rounded-2xl border-white/5 bg-white/5 py-4 px-4 text-sm font-medium text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-0"
                                        />
                                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Your key is used only for local session orchestration and is never stored on our servers.</p>
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
                                    </div>
                                </div>
                            </div>

                            {/* Global Navigation - Step 2 */}
                            <div className="flex items-center justify-between mt-8">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="flex items-center gap-2 rounded-[2rem] bg-white px-8 py-4 text-sm font-black text-slate-600 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:scale-105"
                                >
                                    <ChevronLeft size={18} />
                                    Reconfigure Assets
                                </button>
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    className="flex items-center gap-2 rounded-[2rem] bg-blue-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all hover:scale-105"
                                >
                                    Verify Configuration
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-8">
                            <div className="grid gap-8 lg:grid-cols-3">
                                {/* Configuration Summary */}
                                <div className="lg:col-span-2 space-y-8">
                                    <div className="group relative overflow-hidden rounded-[2.5rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                                        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                                        
                                        <div className="relative space-y-10">
                                            <div className="flex items-center gap-6">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-50 text-blue-600 shadow-inner">
                                                    <Sparkles size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-slate-900">Architectural Review</h3>
                                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Final Validation Protocol</p>
                                                </div>
                                            </div>

                                            <div className="grid gap-6 sm:grid-cols-3">
                                                <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100/50">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Temporal Span</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-black text-slate-900">
                                                            {planInput.examStartDate && planInput.examEndDate 
                                                                ? Math.max(1, Math.ceil((new Date(planInput.examEndDate).getTime() - new Date(planInput.examStartDate).getTime()) / (1000 * 60 * 60 * 24))) 
                                                                : '∞'}
                                                        </span>
                                                        <span className="text-sm font-bold text-slate-400">Days</span>
                                                    </div>
                                                </div>
                                                <div className="rounded-3xl bg-blue-50 p-6 border border-blue-100/50">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Daily Quota</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-black text-blue-700">{planInput.availableHoursPerDay}</span>
                                                        <span className="text-sm font-bold text-blue-400">Hours</span>
                                                    </div>
                                                </div>
                                                <div className="rounded-3xl bg-emerald-50 p-6 border border-emerald-100/50">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Active Stack</p>
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-3xl font-black text-emerald-700">{planInput.subjects.length}</span>
                                                        <span className="text-sm font-bold text-emerald-400">Modules</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-[2rem] bg-slate-900 p-8 text-slate-300 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <Brain size={80} />
                                                </div>
                                                <div className="relative z-10 space-y-4">
                                                    <div className="flex items-center gap-2 text-blue-400">
                                                        <Zap size={16} />
                                                        <span className="text-xs font-black uppercase tracking-widest">Cognitive Blueprint Ready</span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed font-medium">
                                                        System will orchestrate a non-linear study trajectory balancing your {planInput.availableHoursPerDay}h quota against your protected internship window {planInput.internshipStartTime ? `(${planInput.internshipStartTime} - ${planInput.internshipEndTime})` : ''}. 
                                                        AI-driven prioritization will apply heavier weight to subjects with hard difficulty and upcoming exam dates.
                                                    </p>
                                                </div>
                                            </div>

                                            {justGenerated && selectedPlan && (
                                                <div className="rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 p-6 animate-in zoom-in-95 fill-mode-both">
                                                    <div className="flex items-center gap-4 text-emerald-700">
                                                        <CheckCircle2 size={24} />
                                                        <p className="text-sm font-black">Blueprint Successfully Materialized</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 pt-4">
                                                <button
                                                    onClick={() => setCurrentStep(2)}
                                                    className="flex items-center gap-2 rounded-[2rem] bg-white px-8 py-5 text-sm font-black text-slate-600 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:scale-105"
                                                    disabled={isCreating}
                                                >
                                                    <ChevronLeft size={18} />
                                                    Back to Design
                                                </button>
                                                <button
                                                    onClick={handleCreatePlan}
                                                    disabled={isCreating}
                                                    className="flex-1 flex items-center justify-center gap-3 rounded-[2rem] bg-slate-950 px-8 py-5 text-sm font-black text-white shadow-2xl shadow-slate-900/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 group"
                                                >
                                                    {isCreating ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Wand2 size={18} className="group-hover:rotate-12 transition-transform" />
                                                            <span>Initialize Generation Sequence</span>
                                                        </>
                                                    )}
                                                </button>
                                                {justGenerated && selectedPlan && (
                                                    <button
                                                        onClick={() => setViewMode('schedule')}
                                                        className="flex items-center gap-2 rounded-[2rem] bg-blue-600 px-8 py-5 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all hover:scale-105"
                                                    >
                                                        Access Matrix
                                                        <ChevronRight size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
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
                                <button
                                    key={plan._id}
                                    onClick={() => {
                                        setSelectedPlanId(plan._id);
                                        setViewMode('schedule');
                                    }}
                                    className="group relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-2xl hover:shadow-blue-100/50 hover:-translate-y-1 text-left space-y-6"
                                >
                                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors" />
                                    
                                    <div className="relative">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                                                <Layout size={24} />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deployed</p>
                                                <p className="text-xs font-bold text-slate-900">
                                                    {new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
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

                                                                <div className="lg:w-48 space-y-2">
                                                                    <button
                                                                        onClick={() => handleStatusChange(session._id, idx, isComplete ? 'pending' : 'completed')}
                                                                        className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all ${
                                                                            isComplete 
                                                                            ? 'bg-slate-100 text-slate-400 hover:bg-slate-200' 
                                                                            : 'bg-slate-950 text-white shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95'
                                                                        }`}
                                                                    >
                                                                        {isComplete ? 'Reopen' : 'Verify'}
                                                                    </button>
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
