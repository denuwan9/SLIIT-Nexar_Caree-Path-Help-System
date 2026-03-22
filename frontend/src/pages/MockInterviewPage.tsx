import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Calendar, Zap, CheckCircle2, ChevronRight, RefreshCcw } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'ai' | 'real'>('ai');
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
    <div className="min-h-screen bg-slate-50 font-main">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Mic className="text-cobalt-sliit" size={28} />
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
              Mock Interview
            </h1>
          </div>
          <p className="text-slate-500 text-sm mb-6">
            Practice with role-specific questions or book a real session with an interviewer.
          </p>

          {!isInterviewing && (
            <div className="flex gap-6 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('ai')}
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                  activeTab === 'ai' ? 'text-cobalt-sliit' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Mic size={16} /> AI Simulator
                </div>
                {activeTab === 'ai' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-cobalt-sliit" />
                )}
              </button>
              <button
                onClick={() => navigate('/interviews')}
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                  activeTab === 'real' ? 'text-cobalt-sliit' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar size={16} /> Book Real Session
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'ai' && !isInterviewing && (
            <motion.div key="setup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-8 text-white relative overflow-hidden">
                <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <Mic size={24} /> AI Mock Interview Simulator
                </h2>
                <p className="text-indigo-100 mt-2 text-sm font-medium">Practice with role-specific questions. Get instant feedback.</p>
              </div>

              <div className="p-8 space-y-8">
                {/* Target Role */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-900 mb-2">Select Target Role <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 focus:outline-none focus:border-cobalt-sliit focus:ring-1 focus:ring-cobalt-sliit transition-all"
                    >
                      {Object.keys(QUESTION_BANK).map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Interview Focus */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-900 mb-3">Interview Focus</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['All', 'Technical', 'Behavioral', 'Situational'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFocus(f)}
                        className={`py-2 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                          focus === f
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-100 hover:border-slate-200 text-slate-600 bg-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-900 mb-4">
                    Number of Questions: <span className="text-indigo-600">{numQuestions}</span>
                  </label>
                  <div className="relative pt-1 pb-4">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={numQuestions}
                      onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
                      <span>1</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={handleStartInterview}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-black text-sm hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2"
                >
                  <Zap size={18} fill="currentColor" /> Start Interview
                </button>
              </div>
            </motion.div>
          )}

          {/* ACTIVE INTERVIEW STATE */}
          {isInterviewing && !isFinished && (
            <motion.div key="interview" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
              {/* Header */}
              <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white border-b-4 border-indigo-500">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  Recording
                </div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Question <span className="text-white">{currentQIndex + 1}</span> of {questions.length}
                </div>
              </div>

              {/* Question Body */}
              <div className="flex-1 p-8 sm:p-12 flex flex-col relative max-w-5xl mx-auto w-full">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none" />
                <motion.div key={currentQIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="z-10 w-full flex flex-col flex-grow items-center">
                   <div className="max-w-3xl mb-8 text-center">
                     <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em] mb-4">Prompt</p>
                     <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                       {questions[currentQIndex]}
                     </h3>
                   </div>
                   
                   <div className="w-full max-w-3xl flex-grow flex flex-col">
                     <label className="text-left text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Your Answer</label>
                     <textarea
                       autoFocus
                       value={answers[currentQIndex] || ''}
                       onChange={(e) => {
                         const newAnswers = [...answers];
                         newAnswers[currentQIndex] = e.target.value;
                         setAnswers(newAnswers);
                       }}
                       placeholder="Type your answer here..."
                       className="w-full flex-grow min-h-[160px] p-5 text-sm md:text-base border-2 border-slate-200 rounded-xl resize-none focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 bg-white/80 backdrop-blur-sm transition-all text-slate-800 placeholder:text-slate-400 font-medium"
                     />
                   </div>
                </motion.div>
              </div>

              {/* Footer Controls */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center z-10">
                <button onClick={handleEndInterview} className="text-xs font-bold text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors py-2 px-4 rounded-lg hover:bg-rose-50">
                  End Early
                </button>
                <button onClick={handleNextQuestion} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md">
                  {currentQIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'} <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* FINISHED STATE */}
          {isFinished && (
            <motion.div key="finished" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-12 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Interview Complete</h2>
              <p className="text-slate-500 mb-8 max-w-md mx-auto text-sm">
                Awesome effort! You have successfully completed the mock interview simulation. Keep practicing to hone your skills.
              </p>
              
              <div className="flex justify-center gap-4">
                <button onClick={handleEndInterview} className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-md">
                  <RefreshCcw size={16} /> Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
