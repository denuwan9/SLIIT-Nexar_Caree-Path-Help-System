import React, { useState, useRef } from 'react';
import { Plus, Trash, Globe, Github, Rocket, X, Code, ExternalLink, Hash, Image as ImageIcon, UploadCloud } from 'lucide-react';
import type { Project } from '../../types/profile';
import { useForm } from 'react-hook-form';
import profileService from '../../services/profileService';

interface ProjectListProps {
    projects: Project[];
    onAdd: (data: Omit<Project, '_id'>) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
    onUpdateProjects: (projects: Project[]) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onAdd, onRemove, onUpdateProjects }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Omit<Project, '_id'>>();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).slice(0, 5); // Limit to 5
            setSelectedFiles(files);

            // Create previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
        }
    };

    const removeSelectedFile = (index: number) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index]);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
    };

    const onSubmit = async (data: Omit<Project, '_id'>) => {
        try {
            const techString = (data as any).technologiesStr || '';
            data.technologiesUsed = techString.split(',').map((s: string) => s.trim()).filter(Boolean);
            delete (data as any).technologiesStr;

            // 1. Add project first to get it in the profile
            await onAdd(data);

            // Note: Since onAdd updates the parent state which then trickles down as the 'projects' prop,
            // we need to find the just-added project to upload images.
            // A more robust way would be to have addProject return the new project.
            // For now, let's wait a brief moment for the prop to update or use the latest project by title.
        } catch (err) {
            console.error(err);
        }
    };

    // Helper to handle image upload for an existing project
    const handleImageUpload = async (projectId: string, files: File[]) => {
        if (files.length === 0) return;
        setIsUploading(true);
        try {
            const updatedProjects = await profileService.uploadProjectImages(projectId, files);
            onUpdateProjects(updatedProjects);
            setSelectedFiles([]);
            setPreviews([]);
            setShowAddForm(false);
            reset();
        } catch (err) {
            console.error("Failed to upload project images:", err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 italic">
                        <Rocket size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Project Showcase</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tangible evidence of your technical skills</p>
                    </div>
                </div>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 hover:border-indigo-500 hover:text-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10 transition-all active:scale-95"
                    >
                        <Plus size={16} className="transition-transform group-hover:rotate-90" />
                        Launch Project
                    </button>
                )}
            </div>

            {/* Add Project Form */}
            {showAddForm && (
                <div className="p-10 bg-white border-2 border-indigo-100 rounded-[40px] shadow-2xl shadow-indigo-500/5 relative overflow-hidden animate-in slide-in-from-top-6 duration-500">
                    <button
                        onClick={() => {
                            setShowAddForm(false);
                            setSelectedFiles([]);
                            setPreviews([]);
                        }}
                        className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        <X size={24} />
                    </button>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Identifier / Name</label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        {...register('title', { required: 'Title is required' })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none font-bold text-slate-700 transition-all"
                                        placeholder="e.g. AI-Powered Portfolio"
                                    />
                                </div>
                                {errors.title && <span className="text-red-500 text-[10px] font-bold ml-1">{errors.title.message}</span>}
                            </div>

                            {/* Technologies */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stack (Comma Separated)</label>
                                <div className="relative group">
                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        {...register('technologiesStr' as any, { required: 'Required' })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500/50 outline-none font-bold text-indigo-600 transition-all"
                                        placeholder="React, Tailwind, Node.js"
                                    />
                                </div>
                            </div>

                            {/* GitHub */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Code / Repository Link</label>
                                <div className="relative group">
                                    <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                    <input
                                        {...register('githubLink', {
                                            pattern: { value: /^(https?:\/\/)?(www\.)?github\.com\/.+/, message: 'Invalid GitHub URL' }
                                        })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-indigo-500/50 outline-none font-bold text-slate-700 transition-all"
                                        placeholder="https://github.com/username/project"
                                    />
                                </div>
                                {errors.githubLink && <span className="text-red-500 text-[10px] font-bold ml-1">{errors.githubLink.message}</span>}
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Abstract & Core Functionality</label>
                                <textarea
                                    {...register('description')}
                                    rows={5}
                                    placeholder="Briefly explain the problem this project solves and your implementation architecture..."
                                    className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[32px] focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 outline-none font-medium text-slate-600 leading-relaxed resize-none transition-all shadow-inner italic"
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Visuals (Cloudinary)</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-100 rounded-[32px] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/30 transition-all group bg-slate-50/50"
                                >
                                    <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:shadow-md transition-all">
                                        <UploadCloud size={28} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Select Screenshots / Graphics</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">PNG, JPG or WebP (Max 5MB each, up to 5 images)</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                {/* Previews */}
                                {previews.length > 0 && (
                                    <div className="flex flex-wrap gap-4 mt-6 p-6 bg-slate-50 rounded-[40px] border border-slate-100">
                                        {previews.map((preview, idx) => (
                                            <div key={idx} className="relative group/preview h-24 w-24">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${idx}`}
                                                    className="h-full w-full object-cover rounded-2xl shadow-sm border border-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeSelectedFile(idx)}
                                                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-lg shadow-lg opacity-0 group-hover/preview:opacity-100 transition-all"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-4 pt-6 border-t border-slate-50">
                            <button
                                type="submit"
                                disabled={isSubmitting || isUploading}
                                className="flex-1 btn-primary py-5 rounded-[24px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-xl shadow-indigo-500/20"
                            >
                                {(isSubmitting || isUploading) ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                                ) : null}
                                <span className="text-sm uppercase tracking-[0.2em] font-black">
                                    {isUploading ? 'Uploading to Cloud...' : 'Publish Project'}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setSelectedFiles([]);
                                    setPreviews([]);
                                }}
                                className="px-10 bg-slate-50 text-slate-400 py-3 rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100"
                            >
                                Discard
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Projects List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.length === 0 && !showAddForm && (
                    <div className="col-span-full py-24 text-center bg-slate-50/30 rounded-[40px] border-2 border-dashed border-slate-100 animate-in zoom-in-95">
                        <div className="h-20 w-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto text-slate-200 mb-6">
                            <Code size={48} />
                        </div>
                        <h4 className="text-lg font-black text-slate-800">No projects listed</h4>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Bring your code to life by showcasing your latest builds</p>
                    </div>
                )}

                {projects.map((project) => (
                    <ProjectCard
                        key={project._id}
                        project={project}
                        onRemove={onRemove}
                        onUploadImages={(files) => handleImageUpload(project._id!, files)}
                    />
                ))}
            </div>
        </div>
    );
};

const ProjectCard = ({ project, onRemove, onUploadImages }: { project: Project, onRemove: (id: string) => void, onUploadImages: (files: File[]) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentImageIdx, setCurrentImageIdx] = useState(0);

    const hasImages = project.images && project.images.length > 0;

    return (
        <div className="group relative bg-white border border-slate-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500 flex flex-col overflow-hidden">
            {/* Project Image Gallery/Header */}
            {hasImages ? (
                <div className="relative h-56 w-full overflow-hidden bg-slate-900">
                    <img
                        src={project.images![currentImageIdx]}
                        alt={project.title}
                        className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {project.images!.length > 1 && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
                            {project.images!.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIdx(idx)}
                                    className={`h-1 rounded-full transition-all ${idx === currentImageIdx ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-32 w-full bg-slate-50 flex items-center justify-center text-slate-200 border-b border-slate-50">
                    <ImageIcon size={48} className="opacity-20" />
                </div>
            )}

            <div className="p-8 flex-1 flex flex-col justify-between relative">
                {/* Trash and Upload buttons moved to top of content area if has image, or absolute if not */}
                <div className="flex justify-between items-start mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 rotate-[-45deg] group-hover:rotate-0 border border-indigo-100 shadow-sm">
                        <Rocket size={28} />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                            title="Upload Screenshots"
                        >
                            <UploadCloud size={18} />
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => e.target.files && onUploadImages(Array.from(e.target.files))}
                                multiple
                                accept="image/*"
                                className="hidden"
                            />
                        </button>
                        <button
                            onClick={() => onRemove(project._id!)}
                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <Trash size={18} />
                        </button>
                    </div>
                </div>

                <div>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight leading-tight mb-3 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{project.title}</h4>

                    <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologiesUsed.map((tech, idx) => (
                            <span key={idx} className="text-[9px] font-black bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg uppercase tracking-widest group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors border border-slate-100">
                                {tech}
                            </span>
                        ))}
                    </div>

                    {project.description && (
                        <p className="text-[13px] text-slate-500 font-medium leading-relaxed mb-8 line-clamp-3 italic opacity-80">
                            {project.description}
                        </p>
                    )}
                </div>

                {project.githubLink && (
                    <a
                        href={project.githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 w-full py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-hover:shadow-lg group-hover:shadow-indigo-500/20 border border-slate-100"
                    >
                        <Github size={16} /> Repository <ExternalLink size={12} className="opacity-40 group-hover:opacity-100" />
                    </a>
                )}
            </div>
        </div>
    );
};
