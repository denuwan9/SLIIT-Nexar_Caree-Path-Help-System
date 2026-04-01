import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Zap, CheckCircle2, ChevronRight, RefreshCcw, Bot, Terminal, Clock, Sparkles, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  const handleStartInterview = () => {
    const generated = generateQuestions(targetRole, focus, numQuestions);
    setQuestions(generated);
    setAnswers(new Array(generated.length).fill(''));
    setCurrentQIndex(0);
    setIsFinished(false);
    setIsInterviewing(true);
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleEndInterview = () => {
    setIsInterviewing(false);
    setIsFinished(false);
    setQuestions([]);
    setAnswers([]);
    setCurrentQIndex(0);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-main selection:bg-blue-100 selection:text-blue-900">
      
      {/* Immersive Header */}
      {!isInterviewing && (
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 py-10 sticky top-0 z-50 shadow-sm transition-all duration-300">
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

            <div className="flex p-1.5 bg-slate-100/50 rounded-[2rem] border border-slate-100 shadow-inner overflow-x-auto hide-scrollbar">
              <button
                onClick={() => navigate('/interviews')}
                className="flex items-center gap-3 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all bg-white text-slate-400 border border-slate-100 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg shadow-slate-100"
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
                     <span className="text-[10px] font-black uppercase tracking-widest">Nexus Uptime: Active</span>
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
                           <div className="flex gap-2">
                              <span className="w-2 h-2 rounded-full bg-slate-100" />
                              <span className="w-2 h-2 rounded-full bg-slate-100" />
                              <span className="w-2 h-2 rounded-full bg-slate-100" />
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
                    {currentQIndex === questions.length - 1 ? 'Execute Evaluation' : 'Next Sequence'} <ChevronRight size={18} />
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
                <p className="text-slate-400 mb-12 max-w-md mx-auto text-lg font-medium leading-relaxed">
                  Sequence benchmarks have been recorded. Maintain simulation frequency to optimize your professional throughput.
                </p>
                
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
