import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap, CheckCircle2, ChevronRight, RefreshCcw, Bot, Terminal, Clock, Sparkles, Users, Mic, MicOff, Loader2, AlertTriangle, XCircle, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { evaluateInterview, type InterviewEvaluation } from '../services/aiService';
import { toast } from 'react-hot-toast';

// ─── Question Bank ─────────────────────────────────────────────────────────────
const QUESTION_BANK: Record<string, Record<string, string[]>> = {
  'Full Stack Developer (MERN)': {
    Technical: [
      "Explain the Virtual DOM in React and how it optimizes rendering performance.",
      "How does Node.js handle asynchronous operations despite being single-threaded?",
      "Describe the process of building a RESTful API using Express and MongoDB.",
      "What are React Hooks, and how do useMemo and useCallback differ?",
      "How would you optimize a MongoDB query that is scanning millions of documents?"
    ],
    Behavioral: [
      "Tell me about a time you had to learn a new technology quickly to meet a deadline.",
      "Describe a situation where you disagreed with a senior developer on an architectural decision.",
      "How do you handle scope creep during an agile sprint?",
      "Tell me about a project that failed and what you learned from it."
    ],
    Situational: [
      "Your production React app is experiencing memory leaks. How do you diagnose and fix it?",
      "A database migration goes wrong and corrupts user data. What are your immediate steps?",
      "You notice that an API endpoint is taking over 5 seconds to respond. How do you troubleshoot this?"
    ]
  },
  'Frontend Engineer': {
    Technical: [
      "Explain the CSS Box Model and the difference between box-sizing: content-box and border-box.",
      "How does event delegation work in JavaScript?",
      "Describe Server-Side Rendering (SSR) vs. Static Site Generation (SSG) in Next.js.",
      "What is the Event Loop in JavaScript, and how do microtasks and macrotasks differ?",
      "How do you manage global state in a large-scale React application?"
    ],
    Behavioral: [
      "Tell me about a time you mentored a junior developer.",
      "How do you balance writing perfect code vs. shipping a feature on time?",
      "Describe a time you received critical feedback on your code and how you incorporated it."
    ],
    Situational: [
      "A designer hands you a Figma file that is impossible to implement precisely within the given timeframe. What do you do?",
      "Users on slow mobile networks are complaining about your site's load time. How do you optimize it?",
      "You inherit a legacy jQuery codebase that needs to be migrated to React. How do you plan the transition?"
    ]
  },
  'Backend Engineer': {
    Technical: [
      "What is the difference between SQL and NoSQL databases, and when would you choose one over the other?",
      "Explain how OAuth 2.0 works in a web application.",
      "How do you scale a Node.js API to handle millions of concurrent connections?",
      "Describe the CAP theorem and its implications on distributed systems.",
      "What are the benefits and drawbacks of a microservices architecture vs. a monolith?"
    ],
    Behavioral: [
      "Describe a time you had to refactor a critical system without causing downtime.",
      "How do you communicate technical debt to non-technical stakeholders?",
      "Tell me about a time you resolved a critical production outage."
    ],
    Situational: [
      "You need to implement rate limiting on a public API. How do you architect this?",
      "Your database is experiencing frequent deadlocks. How do you investigate and resolve the issue?",
      "A microservice fails, causing dependent services to hang. How do you implement resilience patterns to prevent this?"
    ]
  },
  'Data Scientist': {
    Technical: [
      "Explain the difference between L1 and L2 regularization.",
      "How do you handle imbalanced datasets in a classification problem?",
      "Describe the architecture of a Convolutional Neural Network (CNN).",
      "What is the bias-variance tradeoff?",
      "How do you evaluate the performance of an unsupervised learning model?"
    ],
    Behavioral: [
      "Tell me about a time your data insights contradicted a stakeholder's intuition.",
      "Describe a complex data engineering pipeline you've built.",
      "How do you stay updated with the latest advancements in Machine Learning?"
    ],
    Situational: [
      "Your model performs well on training data but poorly in production. What steps do you take?",
      "You are asked to build a recommendation engine from scratch in two weeks. What is your approach?",
      "A stakeholder asks for a model with 100% accuracy. How do you handle this request?"
    ]
  },
  'UI/UX Designer': {
    Technical: [
      "Describe your user research process when starting a new project.",
      "What is the difference between UI and UX design?",
      "How do you ensure your designs are accessible to users with disabilities?",
      "Explain the concept of a Design System and its benefits.",
      "How do you use typography and color theory to establish visual hierarchy?"
    ],
    Behavioral: [
      "Tell me about a time you had to compromise on your design due to technical constraints.",
      "Describe a time you received negative feedback on a design and how you handled it.",
      "How do you collaborate with developers to ensure your designs are implemented accurately?"
    ],
    Situational: [
      "A client rejects all three of your initial design concepts without constructive feedback. What do you do?",
      "You discover through user testing that a core feature you designed is highly confusing. How do you pivot?",
      "You need to design a complex data dashboard for a mobile app. Describe your approach."
    ]
  }
};

function generateQuestions(role: string, focusType: string, count: number): string[] {
  const roleQuestions = QUESTION_BANK[role] || QUESTION_BANK['Full Stack Developer (MERN)'];
  let pool: string[] = [];

  if (focusType === 'All') {
    pool = [...roleQuestions.Technical, ...roleQuestions.Behavioral, ...roleQuestions.Situational];
  } else {
    pool = [...(roleQuestions[focusType as keyof typeof roleQuestions] || roleQuestions.Technical)];
  }

  // Shuffle pool loosely
  const shuffled = pool.sort(() => 0.5 - Math.random());
  
  // Return requested count, looping if requested count > pool size
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length]);
  }
  return result;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function MockInterviewPage() {
  const navigate = useNavigate();
  const [targetRole, setTargetRole] = useState('Full Stack Developer (MERN)');
  const [focus, setFocus] = useState('All');
  const [numQuestions, setNumQuestions] = useState(5);

  // Interview Session State
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  // Audio Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (isInterviewing && !isFinished) {
      setTimeLeft(60);
    }
  }, [currentQIndex, isInterviewing, isFinished]);

  useEffect(() => {
    let timer: any;
    if (isInterviewing && !isFinished) {
      if (timeLeft > 0) {
        timer = setTimeout(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);
      } else {
        handleNextQuestion();
      }
    }
    return () => clearTimeout(timer);
  }, [isInterviewing, isFinished, timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognitionAPI();
      rec.continuous = true;
      rec.interimResults = true;
      
      rec.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[currentQIndex] = (newAnswers[currentQIndex] || '') + finalTranscript;
            return newAnswers;
          });
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecordingAudio(false);
      };

      rec.onend = () => {
        setIsRecordingAudio(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [currentQIndex]);

  const toggleRecording = () => {
    if (!recognitionRef.current) return alert("Speech recognition is not supported in your browser.");

    if (isRecordingAudio) {
      recognitionRef.current.stop();
      setIsRecordingAudio(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecordingAudio(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleStartInterview = () => {
    const generated = generateQuestions(targetRole, focus, numQuestions);
    setQuestions(generated);
    setAnswers(new Array(generated.length).fill(''));
    setCurrentQIndex(0);
    setIsFinished(false);
    setIsInterviewing(true);
  };

  const handleNextQuestion = async () => {
    if (isRecordingAudio && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingAudio(false);
    }
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setIsEvaluating(true);
      setIsFinished(true);
      try {
        const result = await evaluateInterview(questions, answers);
        setEvaluation(result);
      } catch (error) {
        console.error('Evaluation failed:', error);
        toast.error('Evaluation failed. Please try again.');
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const handleEndInterview = () => {
    if (isRecordingAudio && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecordingAudio(false);
    }
    setIsInterviewing(false);
    setIsFinished(false);
    setQuestions([]);
    setAnswers([]);
    setCurrentQIndex(0);
    setEvaluation(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0EEFF] via-[#F0F4FB] to-[#EDE8FE] font-main selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      {/* Decorative Background Orbs */}
      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-15%] left-[-5%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed top-[40%] left-[50%] w-[400px] h-[400px] bg-blue-100/15 rounded-full blur-[80px] pointer-events-none" />
      
      {/* Immersive Header */}
      {!isInterviewing && (
        <div className="bg-white/70 backdrop-blur-2xl border-b border-white/50 px-8 py-10 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 max-w-7xl mx-auto">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse delay-75" />
                  <div className="w-2 h-2 rounded-full bg-blue-100 animate-pulse delay-150" />
                </div>
                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Simulator Neutralized</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-[#0F172A] flex flex-wrap items-center gap-x-4">
                Mock <span className="text-indigo-600">Simulator</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium max-w-lg">
                High-fidelity practice environment. Calibrate your performance across technical and behavioral benchmarks.
              </p>
            </div>

            <div className="flex p-1.5 bg-white/60 rounded-[2rem] border border-white/80 shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-x-auto hide-scrollbar backdrop-blur-md">
              <button
                onClick={() => navigate('/interviews')}
                className="flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-white/80 text-slate-400 border border-white/60 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg shadow-slate-100"
              >
                <Calendar size={14} /> Book Human Interview
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto p-6 md:p-12 pb-32">
        <AnimatePresence mode="wait">
          {!isInterviewing && (
            <motion.div 
              key="setup" 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 max-w-4xl mx-auto overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-bl-full pointer-events-none -z-0 opacity-40" />
              
              <div className="relative z-10">
                <div className="bg-[#0F172A] p-10 md:p-14 text-white relative overflow-hidden">
                  <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-2xl">
                       <Bot size={32} className="text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight uppercase">Simulation Architect</h2>
                      <p className="text-blue-200/60 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Configure your performance benchmarks</p>
                    </div>
                  </div>
                </div>

                <div className="p-10 md:p-14 space-y-12">
                  <div className="grid md:grid-cols-2 gap-12">
                     <div className="space-y-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Occupation</label>
                        <div className="relative">
                          <select
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            className="w-full bg-[#F8FAFC] border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-[#0F172A] focus:outline-none focus:border-indigo-400 focus:bg-white transition-all shadow-inner appearance-none"
                          >
                            {Object.keys(QUESTION_BANK).map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                             <ChevronRight size={20} className="rotate-90" />
                          </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Question Volume: <span className="text-indigo-600">{numQuestions}</span></label>
                        <div className="relative pt-4">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                            className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 shadow-inner"
                          />
                          <div className="flex justify-between text-[10px] font-black text-slate-300 mt-4 uppercase tracking-widest">
                            <span>Precision Strike (1)</span>
                            <span>Endurance Run (10)</span>
                          </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Competency Focus Areas</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {['All', 'Technical', 'Behavioral', 'Situational'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setFocus(f)}
                          className={`py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] border-2 transition-all duration-500
                            ${focus === f
                              ? 'border-indigo-500 bg-[#0F172A] text-white shadow-xl shadow-slate-200'
                              : 'border-slate-50 bg-[#F8FAFC] text-slate-400 hover:border-indigo-200 hover:text-indigo-600'
                            }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-300">
                       <Terminal size={18} />
                       <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Command Initialization</p>
                    </div>
                    <button 
                      onClick={handleStartInterview}
                      className="px-12 py-5 bg-[#0F172A] text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 hover:scale-[1.05] active:scale-95 transition-all duration-500 shadow-2xl shadow-indigo-100 flex items-center gap-3"
                    >
                      <Zap size={18} className="text-blue-400" /> Initialize Simulation
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ACTIVE SIMULATION STATE */}
          {isInterviewing && !isFinished && (
            <motion.div 
              key="interview" 
              initial={{ opacity: 0, scale: 0.9, y: 50 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              className="bg-white rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.15)] border border-slate-50 overflow-hidden min-h-[650px] flex flex-col max-w-6xl mx-auto relative"
            >
              {/* Simulator HUD */}
              <div className="bg-[#0F172A] px-10 py-8 flex items-center justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                  <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">Recording</span>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-800" />
                  <div className="flex items-center gap-3 text-slate-400">
                     <Clock size={16} />
                     <span className="text-[10px] font-black uppercase tracking-widest">
                       Time Remaining: <span className={timeLeft <= 10 ? "text-rose-500 text-sm ml-1" : "text-white text-sm ml-1"}>
                         {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                       </span>
                     </span>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 relative z-10">
                  Sequence <span className="text-white text-lg ml-2">{currentQIndex + 1}</span> <span className="mx-2 text-slate-700">/</span> {questions.length}
                </div>
              </div>

              {/* Simulation Environment */}
              <div className="flex-1 p-6 md:p-10 flex flex-col relative w-full">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />
                
                <motion.div key={currentQIndex} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full flex flex-col flex-grow">
                   <div className="max-w-4xl mx-auto w-full text-center mb-8">
                     <h3 className="text-2xl md:text-4xl font-semibold text-slate-800 leading-tight tracking-normal px-4">
                       {questions[currentQIndex]}
                     </h3>
                   </div>
                   
                   <div className="flex-grow w-full max-w-4xl mx-auto flex flex-col relative group">
                     <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-50 to-blue-50 rounded-[2.5rem] opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 -z-0" />
                     
                     <div className="relative z-10 flex flex-col flex-grow">
                        <div className="flex justify-between items-center mb-4 px-2">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">User Input Node</label>
                           <div className="flex items-center gap-4">
                              <button 
                                onClick={toggleRecording}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isRecordingAudio ? 'bg-rose-100 text-rose-600 shadow-inner' : 'bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                              >
                                {isRecordingAudio ? <MicOff size={14} className="animate-pulse" /> : <Mic size={14} />}
                                {isRecordingAudio ? 'Stop Dictation' : 'Voice Dictation'}
                              </button>
                              <div className="flex gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-100" />
                                <span className="w-2 h-2 rounded-full bg-slate-100" />
                                <span className="w-2 h-2 rounded-full bg-slate-100" />
                              </div>
                           </div>
                        </div>
                        <textarea
                          autoFocus
                          value={answers[currentQIndex] || ''}
                          onChange={(e) => {
                            const newAnswers = [...answers];
                            newAnswers[currentQIndex] = e.target.value;
                            setAnswers(newAnswers);
                          }}
                          placeholder="Initialize response sequence..."
                          className="w-full flex-grow min-h-[200px] p-6 text-lg md:text-xl border-2 border-slate-50 bg-white/80 backdrop-blur-xl rounded-[2.2rem] resize-none focus:outline-none focus:border-indigo-400 focus:shadow-2xl focus:shadow-indigo-100/50 shadow-xl shadow-slate-100/50 transition-all text-[#0F172A] placeholder:text-slate-200 font-bold leading-relaxed scrollbar-hide"
                        />
                     </div>
                   </div>
                </motion.div>
              </div>

              {/* Simulator controls */}
              <div className="px-10 py-10 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center z-10">
                <button 
                  onClick={handleEndInterview} 
                  className="px-8 py-4 text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-[0.3em] transition-all hover:bg-rose-50 rounded-2xl border border-transparent hover:border-rose-100"
                >
                  Terminate Sequence
                </button>
                <div className="flex gap-4">
                  <button 
                    onClick={handleNextQuestion} 
                    className="px-12 py-5 bg-[#0F172A] text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-300"
                  >
                    {currentQIndex === questions.length - 1 ? (isEvaluating ? 'Calibrating...' : 'Execute Evaluation') : 'Next Sequence'} 
                    {isEvaluating ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* FINISHED STATE */}
          {isFinished && (
            <motion.div 
              key="finished" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-16 md:p-24 text-center max-w-4xl mx-auto relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-blue-500" />
              <div className="relative z-10">
                <div className="w-28 h-28 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-emerald-100 border border-emerald-100">
                  <CheckCircle2 size={56} className="text-emerald-500" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-[#0F172A] uppercase tracking-tight mb-4">Simulation Complete</h2>
                <div className="flex items-center justify-center gap-4 mb-10">
                   <div className="px-5 py-2 bg-blue-50 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                     <Sparkles size={14} /> Performance Logged
                   </div>
                   <div className="px-5 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 flex items-center gap-2">
                     <Users size={14} /> Analytics Syncing
                   </div>
                </div>
                <p className="text-slate-400 mb-8 max-w-xl mx-auto text-lg font-medium leading-relaxed">
                  Sequence benchmarks have been recorded. Review your performance transcript below. Maintain simulation frequency to optimize your professional throughput.
                </p>

                <div className="bg-slate-50 shadow-inner rounded-3xl p-8 text-left mb-12 max-h-[600px] overflow-y-auto border border-slate-100 mx-auto w-full max-w-3xl custom-scrollbar relative">
                  {isEvaluating ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="relative">
                        <Loader2 size={48} className="text-indigo-600 animate-spin" />
                        <div className="absolute inset-0 blur-lg bg-indigo-400/20 animate-pulse" />
                      </div>
                      <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em]">AI Evaluator analyzing responses...</p>
                    </div>
                  ) : evaluation ? (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Performance Score</p>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                              <p className="text-4xl font-black text-[#0F172A]">{evaluation.overallScore}<span className="text-indigo-600 text-xl"> %</span></p>
                              <div className="h-8 w-px bg-slate-200" />
                              <div className="flex flex-col">
                                <p className="text-xl font-black text-emerald-600 leading-none">
                                  {evaluation.evaluations.filter(e => e.status === 'Correct').length}/{evaluation.evaluations.length}
                                </p>
                                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-400">Correct Answers</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-indigo-50 flex items-center justify-center relative">
                          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin-slow" style={{ clipPath: `conic-gradient(from 0deg, #6366f1 ${evaluation.overallScore}%, transparent 0)` }} />
                          <Target size={24} className="text-indigo-600" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] flex items-center gap-3">
                          <Bot size={14} /> Evaluator Summary
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                          {evaluation.overallFeedback}
                        </p>
                      </div>

                      <div className="space-y-8">
                        {evaluation.evaluations.map((ev, i) => (
                          <div key={i} className="space-y-4">
                             <div className="flex items-start justify-between gap-4">
                                <p className="text-base font-bold text-[#0F172A] flex gap-3 leading-snug">
                                  <span className="text-indigo-400">0{i + 1}</span> {ev.question}
                                </p>
                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0
                                  ${ev.status === 'Correct' ? 'bg-emerald-100 text-emerald-600' : 
                                    ev.status === 'Partially Correct' ? 'bg-amber-100 text-amber-600' : 
                                    'bg-rose-100 text-rose-600'}`}
                                >
                                  {ev.status === 'Correct' ? <CheckCircle2 size={12} /> : 
                                   ev.status === 'Partially Correct' ? <AlertTriangle size={12} /> : 
                                   <XCircle size={12} />}
                                  {ev.status}
                                </div>
                             </div>

                             <div className="space-y-3 pl-8 border-l-2 border-slate-100 ml-3">
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Your Response</p>
                                  <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-50 italic">
                                    "{ev.answer || 'No response captured...'}"
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">AI Feedback</p>
                                  <p className="text-sm text-slate-700 font-bold leading-relaxed">
                                    {ev.feedback}
                                  </p>
                                </div>
                                <div className="bg-slate-100/50 p-3 rounded-xl flex items-center gap-3">
                                   <Sparkles size={14} className="text-amber-500 shrink-0" />
                                   <p className="text-[11px] text-slate-500 font-medium italic">
                                      <span className="font-black uppercase text-[9px] mr-2">Pro Tip:</span>
                                      {ev.idealPointer}
                                   </p>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 text-center py-10">
                       <p className="text-slate-400 font-medium italic">Reviewing raw transcript...</p>
                       <div className="space-y-8 text-left">
                        {questions.map((q, i) => (
                          <div key={i} className="space-y-3">
                            <p className="text-base font-bold text-[#0F172A] flex gap-3 leading-snug">
                              <span className="text-indigo-400">0{i + 1}</span> {q}
                            </p>
                            <div className="bg-white border border-slate-100 rounded-2xl p-5 text-sm text-slate-600 leading-relaxed relative shadow-sm">
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-emerald-400 rounded-r-full" />
                              {answers[i] || <span className="text-slate-400 italic">No response sequence captured...</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <button 
                    onClick={handleEndInterview} 
                    className="px-12 py-5 bg-[#0F172A] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-slate-200"
                  >
                    <RefreshCcw size={18} /> Re-Initialize
                  </button>
                  <button 
                    onClick={() => navigate('/interviews')} 
                    className="px-12 py-5 bg-white border-2 border-slate-100 text-[#0F172A] rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:border-blue-500 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
                  >
                    Return to Nexus <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
