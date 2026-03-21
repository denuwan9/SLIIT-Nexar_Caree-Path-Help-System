import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    KeyRound,
    Loader2,
    Plus,
    Upload,
    Wand2,
} from 'lucide-react';
import {
    createStudyPlan,
    fetchStudyPlans,
    markStudySubjectComplete,
} from '../services/studyPlanService';
import type { CreateStudyPlanInput, StudyPlan, StudySubject } from '../types/studyPlan';

const StudyPlanPage: React.FC = () => {
    const navigate = useNavigate();
    const [apiKey, setApiKey] = useState('');
    const [documents, setDocuments] = useState<File[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);
    const [plans, setPlans] = useState<StudyPlan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'builder' | 'schedule'>('builder');

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
            availableHoursPerDay: 4,
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
        subjects: [],
    });

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

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files);
        setDocuments((prev) => {
            const names = new Set(prev.map((f) => f.name));
            const merged = [...prev];
            newFiles.forEach((f) => {
                if (!names.has(f.name)) merged.push(f);
            });
            return merged;
        });
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
            const payload: CreateStudyPlanInput = {
                ...planInput,
                title: safeTitle,
                subjects: planInput.subjects,
                availableHoursPerDay: Number(planInput.availableHoursPerDay) || 4,
            };
            const created = await createStudyPlan(payload);
            if (!planInput.title.trim()) {
                setPlanInput((prev) => ({ ...prev, title: safeTitle }));
            }
            toast.success('Study plan generated');
            setPlans((prev) => [created, ...prev]);
            setSelectedPlanId(created._id);
            setViewMode('schedule');
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

    const totalHours = selectedPlan?.sessions?.reduce((sum, s) => sum + (s.totalStudyHours || 0), 0) || 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                        <Wand2 size={14} />
                        AI study planner
                    </div>
                    <h1 className="text-3xl font-black text-slate-900">Study Work Plan Generator</h1>
                    <p className="max-w-3xl text-sm text-slate-500">
                        Upload your course materials, set your internship and exam window, and let the AI distribute hours so you can juggle work and university without burning out.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="rounded-full border border-slate-200 bg-white p-1 text-xs font-semibold shadow-sm">
                        <button
                            onClick={() => setViewMode('builder')}
                            className={`rounded-full px-3 py-1 transition ${viewMode === 'builder' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'}`}
                        >
                            Build plan
                        </button>
                        <button
                            onClick={() => selectedPlan && setViewMode('schedule')}
                            className={`rounded-full px-3 py-1 transition ${viewMode === 'schedule' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600'} ${!selectedPlan ? 'opacity-60' : ''}`}
                            disabled={!selectedPlan}
                        >
                            View schedule
                        </button>
                    </div>
                        <button
                            onClick={prefillDemoPlan}
                            className="btn-secondary text-sm"
                        >
                            Quick-fill sample plan
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
                <div className="grid gap-6 lg:grid-cols-3 animate-slide-in">
                    <div className="space-y-6 lg:col-span-2">
                        <div className="card p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <KeyRound className="text-blue-600" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">API key for document intelligence</p>
                                    <p className="text-xs text-slate-500">Kept on this device; future AI doc parsing will use it when generating plans.</p>
                                </div>
                            </div>
                            <input
                                type="password"
                                className="input w-full"
                                placeholder="Paste your AI provider key"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />

                            <div className="mt-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/60 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                                            <Upload className="text-blue-600" size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">Attach study files</p>
                                            <p className="text-xs text-slate-500">Slides, module outlines, exam timetables, briefs. Stored locally for now.</p>
                                        </div>
                                    </div>
                                    <label className="btn-secondary cursor-pointer text-sm">
                                        <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                                            onChange={(e) => handleFileSelect(e.target.files)}
                                        />
                                        Upload files
                                    </label>
                                </div>

                                {documents.length > 0 && (
                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                        {documents.map((file) => (
                                            <div key={file.name} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-sm">
                                                <FileText size={16} className="text-slate-500" />
                                                <div className="truncate text-sm font-semibold text-slate-800">{file.name}</div>
                                                <span className="text-[11px] text-slate-500">{Math.round(file.size / 1024)} KB</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="card p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <Calendar className="text-purple-600" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Plan basics</p>
                                    <p className="text-xs text-slate-500">Name your plan and set the exam window and daily capacity.</p>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Plan title</label>
                                    <input
                                        className="input w-full"
                                        placeholder="e.g., Semester 6 + Internship"
                                        value={planInput.title}
                                        onChange={(e) => setPlanInput({ ...planInput, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Daily study hours</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="range"
                                            min={1}
                                            max={12}
                                            step={0.5}
                                            value={planInput.availableHoursPerDay}
                                            onChange={(e) => setPlanInput({ ...planInput, availableHoursPerDay: Number(e.target.value) })}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-right text-sm font-semibold text-slate-900">
                                            {planInput.availableHoursPerDay}h
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Exam start date</label>
                                    <input
                                        type="date"
                                        className="input w-full"
                                        value={planInput.examStartDate}
                                        onChange={(e) => setPlanInput({ ...planInput, examStartDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600">Exam end date</label>
                                    <input
                                        type="date"
                                        className="input w-full"
                                        value={planInput.examEndDate}
                                        onChange={(e) => setPlanInput({ ...planInput, examEndDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={prefillDemoPlan}
                                    className="text-xs font-semibold text-blue-700 hover:underline"
                                >
                                    Autofill with a study template
                                </button>
                            </div>
                        </div>

                        <div className="card p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <BookOpen className="text-emerald-600" size={20} />
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Subjects & load</p>
                                    <p className="text-xs text-slate-500">Prioritize by difficulty and credits; AI will allocate hours and topics.</p>
                                </div>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="md:col-span-2 space-y-3">
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-600">Subject</label>
                                            <input
                                                className="input w-full"
                                                placeholder="e.g., Distributed Systems"
                                                value={subjectDraft.name}
                                                onChange={(e) => setSubjectDraft({ ...subjectDraft, name: e.target.value })}
                                            />
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
                                            <label className="text-xs font-semibold text-slate-600">Exam date</label>
                                            <input
                                                type="date"
                                                className="input w-full"
                                                value={subjectDraft.examDate}
                                                onChange={(e) => setSubjectDraft({ ...subjectDraft, examDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Key topics (comma separated)</label>
                                        <input
                                            className="input w-full"
                                            placeholder="Concurrency, Replication, CAP, gRPC"
                                            value={subjectDraft.topicsInput}
                                            onChange={(e) => setSubjectDraft({ ...subjectDraft, topicsInput: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between rounded-2xl bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Ready to add?</p>
                                    <p className="text-xs text-slate-500 mb-3">We will balance credit hours and difficulty when building daily sessions.</p>
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

                            <div className="flex items-center justify-between pt-4">
                                <div className="text-xs text-slate-500">AI will use your API key + files locally to draft prompts before hitting the study-plan API.</div>
                                <div className="flex items-center gap-2">
                                    {selectedPlan && (
                                        <button
                                            onClick={() => setViewMode('schedule')}
                                            className="btn-secondary text-sm"
                                        >
                                            Jump to schedule
                                        </button>
                                    )}
                                    <button
                                        onClick={handleCreatePlan}
                                        disabled={isCreating}
                                        className="btn-primary inline-flex items-center gap-2 text-sm"
                                    >
                                        {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                        Generate plan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="card p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Active plans</p>
                                    <p className="text-xs text-slate-500">Sorted by newest first</p>
                                </div>
                                {isLoadingPlans && <Loader2 size={16} className="animate-spin text-slate-400" />}
                            </div>
                            <div className="space-y-3">
                                {plans.length === 0 && (
                                    <p className="text-sm text-slate-500">No plans yet. Create one to see the schedule.</p>
                                )}
                                {plans.map((plan) => (
                                    <button
                                        key={plan._id}
                                        onClick={() => {
                                            setSelectedPlanId(plan._id);
                                            setViewMode('schedule');
                                        }}
                                        className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50 ${
                                            selectedPlan?._id === plan._id ? 'border-blue-300 bg-blue-50' : 'border-slate-100'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{plan.title}</p>
                                                <p className="text-[11px] uppercase tracking-wide text-slate-500">
                                                    {plan.subjects.length} subjects · {plan.totalStudyDays} days
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-semibold text-blue-700">{plan.overallProgress}%</p>
                                                <div className="mt-1 h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                                                    <div
                                                        className="h-full bg-blue-600"
                                                        style={{ width: `${plan.overallProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </button>
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

            {viewMode === 'schedule' && selectedPlan && (
                <div className="space-y-4 animate-slide-in">
                    <div className="card p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-semibold text-blue-700">{selectedPlan.title}</p>
                            <h2 className="text-2xl font-black text-slate-900">Daily schedule & focus</h2>
                            <p className="text-sm text-slate-500">Mark tasks done to keep your internship + campus work balanced.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-blue-50 px-4 py-3 text-center">
                                <p className="text-xs text-slate-500">Overall</p>
                                <p className="text-lg font-bold text-blue-700">{selectedPlan.overallProgress}%</p>
                            </div>
                            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                                <p className="text-xs text-slate-500">Total hours</p>
                                <p className="text-lg font-bold text-slate-900">{totalHours.toFixed(1)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-slate-700" />
                            <p className="text-sm font-semibold text-slate-900">Daily sessions</p>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {selectedPlan.sessions.map((session) => (
                                <div key={session._id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-slate-500">Day {session.day}</p>
                                            <p className="text-sm font-bold text-slate-900">
                                                {new Date(session.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                                            {session.totalStudyHours}h
                                        </span>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        {session.subjects.map((subject, idx) => (
                                            <div
                                                key={`${subject.subjectName}-${idx}`}
                                                className="rounded-xl bg-slate-50 px-3 py-2"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">{subject.subjectName}</p>
                                                        <p className="text-xs text-slate-500">{subject.topic}</p>
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-500">{subject.durationHours}h</span>
                                                </div>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <span className="glass-pill text-[10px] capitalize text-slate-600">{subject.priority}</span>
                                                    {!subject.isCompleted ? (
                                                        <button
                                                            onClick={() => handleMarkComplete(session._id, idx)}
                                                            className="btn-ghost inline-flex items-center gap-1 text-[11px]"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                            Mark done
                                                        </button>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                                            <CheckCircle2 size={14} /> Done
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudyPlanPage;
